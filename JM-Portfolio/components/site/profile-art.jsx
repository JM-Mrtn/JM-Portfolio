"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

const DEFAULT_SVG_URL = "/images/JM_Hero.svg";

const MIN_SOURCE_PATH_LENGTH = 12;
const MIN_REGION_SEGMENT = 10;
const TARGET_SAMPLE_STEP = 8;
const MIN_SAMPLES_PER_PATH = 12;
const MAX_SAMPLES_PER_PATH = 280;
const TRACE_START_MIN = 520;
const TRACE_START_MAX = 880;
const TRACE_RETRY_DELAY = 90;
const MAX_ACTIVE_TRACES = 2;
const DOUBLE_TRACE_CHANCE = 0.34;
const PREPARE_IDLE_TIMEOUT = 120;
const MAX_SUBPATHS_PER_TRACE_SOURCE = 1;
const RECENT_PART_MEMORY = 2;

const FACE_EXCLUDE_BOXES = [
  // Nose / center-face area.
  { x: 445, y: 345, width: 120, height: 135 },
  // Mouth / lower-face area.
  { x: 405, y: 430, width: 225, height: 145 },
  // Left ear.
  { x: 315, y: 320, width: 72, height: 165 },
  // Right ear.
  { x: 625, y: 320, width: 68, height: 165 },
];

const svgTextCache = new Map();
const svgTextRequests = new Map();

/**
 * These boxes use JM_Hero.svg's own viewBox coordinates.
 * The effect only samples path geometry that falls inside these regions,
 * so the blue tracer follows recognizable portrait details.
 */
const HERO_TRACE_PARTS = [
  {
    name: "hair",
    // Split hair into smaller zones so the tracer stays on the hair silhouette
    // and fringe instead of dipping into the forehead / nose area.
    boxes: [
      { x: 250, y: 65, width: 390, height: 175 },
      { x: 255, y: 210, width: 120, height: 165 },
      { x: 525, y: 200, width: 125, height: 160 },
    ],
    minTrace: 78,
    maxTrace: 220,
  },
  {
    name: "glasses",
    // Use separate lens zones and explicitly exclude the bridge / nose region.
    boxes: [
      { x: 350, y: 290, width: 112, height: 105 },
      { x: 500, y: 288, width: 130, height: 108 },
      { x: 438, y: 300, width: 34, height: 34 },
      { x: 628, y: 302, width: 42, height: 56 },
    ],
    excludeBoxes: [
      { x: 455, y: 300, width: 72, height: 155 },
      { x: 405, y: 390, width: 205, height: 95 },
    ],
    minTrace: 48,
    maxTrace: 145,
  },
  {
    name: "shirt",
    // Keep the shirt region away from most of the tattooed arm so arm detail
    // does not get classified as a shirt trace.
    boxes: [{ x: 65, y: 635, width: 650, height: 805 }],
    minTrace: 96,
    maxTrace: 285,
  },
  {
    name: "tattoo",
    // The tattoo artwork spans the wrist/forearm and the lower outside arm.
    // Two boxes give those details their own sampling area instead of letting
    // the face/hair regions dominate the candidate pool.
    boxes: [
      { x: 700, y: 585, width: 220, height: 285 },
      { x: 760, y: 720, width: 390, height: 520 },
    ],
    minTrace: 54,
    maxTrace: 190,
  },
  {
    name: "phone",
    // Tight phone-only box. It intentionally starts to the right of the
    // glasses/hair boxes to reduce overlap with facial line work.
    boxes: [{ x: 650, y: 245, width: 255, height: 430 }],
    minTrace: 58,
    maxTrace: 185,
  },
];

function styleJourneyArtwork(svg) {
  const elements = svg.querySelectorAll(
    "path,line,polyline,polygon,circle,ellipse",
  );

  elements.forEach((element) => {
    if (element.hasAttribute("data-profile-effect")) return;

    element.style.setProperty("stroke", "rgba(75,80,90,0.75)", "important");
    element.style.setProperty("stroke-width", "1.05", "important");
    element.style.setProperty("stroke-linecap", "round", "important");
    element.style.setProperty("stroke-linejoin", "round", "important");
    element.style.setProperty("opacity", "0.85", "important");
  });
}

function hideHeroOverlaySources(svg) {
  svg
    .querySelectorAll("path,polygon,polyline,line,circle,ellipse")
    .forEach((element) => {
      if (element.hasAttribute("data-profile-effect")) return;
      element.style.setProperty("opacity", "0", "important");
    });
}

function loadSvgText(src) {
  if (svgTextCache.has(src)) {
    return Promise.resolve(svgTextCache.get(src));
  }

  if (svgTextRequests.has(src)) {
    return svgTextRequests.get(src);
  }

  const request = fetch(src)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load ${src}`);
      }

      return response.text();
    })
    .then((text) => {
      svgTextCache.set(src, text);
      svgTextRequests.delete(src);
      return text;
    })
    .catch((error) => {
      svgTextRequests.delete(src);
      throw error;
    });

  svgTextRequests.set(src, request);
  return request;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pointInsideBox(point, box) {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

function pointInsidePart(point, part) {
  const insideIncludedBox = part.boxes.some((box) => pointInsideBox(point, box));
  if (!insideIncludedBox) return false;

  // Never classify mouth, nose, or ear geometry as an animatable hero detail.
  if (FACE_EXCLUDE_BOXES.some((box) => pointInsideBox(point, box))) {
    return false;
  }

  if (part.excludeBoxes?.some((box) => pointInsideBox(point, box))) {
    return false;
  }

  return true;
}

function boxesIntersect(a, b) {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

function partIntersectsBounds(part, bounds) {
  return part.boxes.some((box) => boxesIntersect(box, bounds));
}

function safePathLength(path) {
  try {
    return path.getTotalLength();
  } catch {
    return 0;
  }
}

function safePathBounds(path) {
  try {
    const bounds = path.getBBox();
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
  } catch {
    return null;
  }
}

function safeSubpathCount(path) {
  const data = path.getAttribute("d") || "";
  const matches = data.match(/[Mm]/g);
  return matches ? matches.length : 0;
}

function canUsePathForSingleTracer(path) {
  // Compound SVG paths can render the same dash on multiple disconnected
  // subpaths at once, which looks like many animated lines even when we only
  // started one trace. Limit tracing to simple paths so each trace stays as a
  // single visible line (or two total when double tracing happens).
  const subpathCount = safeSubpathCount(path);
  return subpathCount <= MAX_SUBPATHS_PER_TRACE_SOURCE;
}

function scheduleBackgroundWork(callback) {
  if (
    typeof window !== "undefined" &&
    typeof window.requestIdleCallback === "function"
  ) {
    const id = window.requestIdleCallback(callback, {
      timeout: PREPARE_IDLE_TIMEOUT,
    });

    return () => window.cancelIdleCallback?.(id);
  }

  const id = window.setTimeout(
    () => callback({ didTimeout: true, timeRemaining: () => 0 }),
    0,
  );

  return () => window.clearTimeout(id);
}

/**
 * Sample one SVG path only once and classify every sampled point against all
 * matching semantic regions at the same time.
 *
 * The old implementation rescanned every path once per body part. On the
 * 77k-character main JM_Hero path that meant thousands of repeated
 * getPointAtLength() calls before the browser could paint. This version caps
 * the work per path and shares one geometry pass between all parts.
 */
function collectSegmentsForPath(path, parts, totalLength) {
  if (!parts.length || totalLength < MIN_SOURCE_PATH_LENGTH) return;

  const desiredSamples = Math.ceil(totalLength / TARGET_SAMPLE_STEP);
  const sampleCount = Math.max(
    MIN_SAMPLES_PER_PATH,
    Math.min(MAX_SAMPLES_PER_PATH, desiredSamples),
  );
  const sampleStep = totalLength / sampleCount;

  const states = new Map(
    parts.map((part) => [
      part.name,
      {
        start: null,
        lastInside: null,
      },
    ]),
  );

  function closeSegment(part, state) {
    if (state.start === null || state.lastInside === null) return;

    const start = Math.max(0, state.start);
    const end = Math.min(totalLength, state.lastInside);
    const minimumLength = Math.min(
      MIN_REGION_SEGMENT,
      Math.max(4, sampleStep * 0.45),
    );

    if (end - start >= minimumLength) {
      part.segments.push({
        source: path,
        start,
        end,
        totalLength,
      });
    }

    state.start = null;
    state.lastInside = null;
  }

  for (let index = 0; index <= sampleCount; index += 1) {
    const distance = (totalLength * index) / sampleCount;
    let point;

    try {
      point = path.getPointAtLength(distance);
    } catch {
      break;
    }

    parts.forEach((part) => {
      const state = states.get(part.name);
      const inside = pointInsidePart(point, part);

      if (inside) {
        if (state.start === null) {
          state.start = Math.max(0, distance - sampleStep * 0.5);
        }

        state.lastInside = Math.min(
          totalLength,
          distance + sampleStep * 0.5,
        );
        return;
      }

      closeSegment(part, state);
    });
  }

  parts.forEach((part) => {
    closeSegment(part, states.get(part.name));
  });
}

function prepareHeroPartsAsync(paths, onComplete) {
  const parts = HERO_TRACE_PARTS.map((part) => ({
    ...part,
    segments: [],
  }));

  // Process small/simple paths first. If those already provide every semantic
  // region, the huge compound path can be skipped entirely.
  const queue = [...paths].sort((a, b) => {
    const aSize = a.getAttribute("d")?.length ?? 0;
    const bSize = b.getAttribute("d")?.length ?? 0;
    return aSize - bSize;
  });

  let index = 0;
  let cancelled = false;
  let cancelScheduledWork = null;

  function finish() {
    if (cancelled) return;

    onComplete(parts.filter((part) => part.segments.length > 0));
  }

  function processNext() {
    if (cancelled) return;

    const path = queue[index];
    index += 1;

    if (!path) {
      finish();
      return;
    }

    const pathDataSize = path.getAttribute("d")?.length ?? 0;
    const everyPartAlreadyCovered = parts.every(
      (part) => part.segments.length > 0,
    );

    // JM_Hero.svg has one very large compound path. Avoid touching it when
    // the smaller paths have already given us usable traces for every region.
    if (!(pathDataSize > 30000 && everyPartAlreadyCovered)) {
      const totalLength = safePathLength(path);

      if (totalLength >= MIN_SOURCE_PATH_LENGTH && canUsePathForSingleTracer(path)) {
        const bounds = safePathBounds(path);
        const candidateParts = bounds
          ? parts.filter((part) => partIntersectsBounds(part, bounds))
          : parts;

        collectSegmentsForPath(path, candidateParts, totalLength);
      }
    }

    if (index >= queue.length) {
      finish();
      return;
    }

    cancelScheduledWork = scheduleBackgroundWork(processNext);
  }

  cancelScheduledWork = scheduleBackgroundWork(processNext);

  return () => {
    cancelled = true;
    cancelScheduledWork?.();
  };
}

function prepareFallbackPartAsync(paths, onComplete) {
  const candidates = [];
  let index = 0;
  let cancelled = false;
  let cancelScheduledWork = null;

  function processNext() {
    if (cancelled) return;

    const source = paths[index];
    index += 1;

    if (!source) {
      onComplete(
        candidates.length
          ? [
              {
                name: "artwork",
                minTrace: 35,
                maxTrace: 130,
                segments: candidates,
              },
            ]
          : [],
      );
      return;
    }

    const totalLength = safePathLength(source);
    if (totalLength >= 40 && canUsePathForSingleTracer(source)) {
      candidates.push({
        source,
        start: 0,
        end: totalLength,
        totalLength,
      });
    }

    cancelScheduledWork = scheduleBackgroundWork(processNext);
  }

  cancelScheduledWork = scheduleBackgroundWork(processNext);

  return () => {
    cancelled = true;
    cancelScheduledWork?.();
  };
}

function pickTraceSegment(part) {
  const candidates = part.segments;
  if (!candidates.length) return null;

  // Prefer segments long enough to produce a clearly visible stroke. Tiny
  // segments still remain as a fallback for small details such as tattoo marks.
  const preferredMinimum = Math.max(18, part.minTrace * 0.58);
  const preferred = candidates.filter(
    (candidate) => candidate.end - candidate.start >= preferredMinimum,
  );
  const pool = preferred.length ? preferred : candidates;

  let candidate = pool[Math.floor(Math.random() * pool.length)];

  // Sample a few random alternatives and usually keep the longer one. This is
  // still randomized, but avoids barely noticeable 5-10px trace fragments.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const challenger = pool[Math.floor(Math.random() * pool.length)];
    const currentLength = candidate.end - candidate.start;
    const challengerLength = challenger.end - challenger.start;

    if (challengerLength > currentLength && Math.random() > 0.28) {
      candidate = challenger;
    }
  }

  const availableLength = candidate.end - candidate.start;
  const desiredLength = randomBetween(part.minTrace, part.maxTrace);
  const traceLength = Math.min(availableLength, desiredLength);
  const extra = Math.max(0, availableLength - traceLength);
  const start = candidate.start + Math.random() * extra;
  const end = start + traceLength;

  return {
    source: candidate.source,
    start,
    end,
    totalLength: candidate.totalLength,
    reverse: Math.random() > 0.5,
  };
}

function getTravelDashLength(part, segmentLength) {
  const ranges = {
    hair: [34, 72],
    glasses: [22, 46],
    shirt: [48, 94],
    tattoo: [28, 58],
    phone: [27, 56],
    artwork: [30, 66],
  };

  const [min, max] = ranges[part.name] ?? [26, 58];
  const randomizedLength = randomBetween(min, max);

  // Keep roughly a third of the selected path visible as the moving tracer.
  // This makes phone/tattoo/shirt strokes readable without turning the effect
  // into a full outline of the artwork.
  const proportionalMinimum = Math.min(segmentLength, segmentLength * 0.32);

  return Math.min(
    segmentLength,
    Math.max(randomizedLength, proportionalMinimum),
  );
}

function createTracePath(part, segment) {
  const source = segment.source;
  const trace = source.cloneNode(true);

  // Keeping the clone beside the source preserves all parent transforms, so
  // the blue tracer always travels on the original artwork instead of drawing
  // a straight line across the portrait.
  trace.removeAttribute("id");
  trace.removeAttribute("class");
  trace.removeAttribute("style");
  trace.setAttribute("data-profile-effect", "true");
  trace.setAttribute("data-profile-part", part.name);
  trace.setAttribute("fill", "none");
  trace.setAttribute("stroke", "var(--primary)");
  trace.setAttribute("stroke-width", "1.9");
  trace.setAttribute("stroke-linecap", "round");
  trace.setAttribute("stroke-linejoin", "round");
  trace.setAttribute("vector-effect", "non-scaling-stroke");

  trace.style.setProperty("fill", "none", "important");
  trace.style.setProperty("stroke", "var(--primary)", "important");
  trace.style.setProperty("stroke-width", "1.9", "important");
  trace.style.setProperty("stroke-linecap", "round", "important");
  trace.style.setProperty("stroke-linejoin", "round", "important");
  trace.style.pointerEvents = "none";
  trace.style.opacity = "0";
  trace.style.filter = "drop-shadow(0 0 2.5px var(--primary))";

  source.parentNode?.insertBefore(trace, source.nextSibling);
  return trace;
}

/**
 * Continuous semantic trace engine.
 *
 * Preparation is intentionally asynchronous. The browser paints the hero
 * first, then builds the trace map during idle slices. Once ready, each new
 * stroke independently chooses a random semantic region and random path segment.
 */
function startTraceEngine(svg, variant = "hero") {
  const selector =
    variant === "journey"
      ? "path,polygon,polyline,line,circle,ellipse"
      : "path:not([data-profile-effect])";

  const sourcePaths = Array.from(svg.querySelectorAll(selector));
  sourcePaths.forEach((path) => path.setAttribute("data-profile-base", "true"));

  let cancelled = false;
  let paused = true;
  let prepared = false;
  let preparing = false;
  let cancelPreparation = null;
  let parts = [];
  let timer = null;
  const activeAnimations = new Set();
  const activeTraces = new Set();

  // Pick independently at random, but keep a short recent-history cooldown so
  // the same area cannot keep appearing back-to-back. This feels less like a
  // fixed shuffled cycle while still preventing one region from dominating.
  let lastSelectedPart = null;
  let recentPartNames = [];

  function rememberPart(name) {
    recentPartNames = [name, ...recentPartNames.filter((item) => item !== name)].slice(
      0,
      Math.min(RECENT_PART_MEMORY, Math.max(0, parts.length - 1)),
    );
    lastSelectedPart = name;
  }

  function takeRandomPart(excludedNames = new Set()) {
    if (!parts.length) return null;

    const recentNames = new Set(recentPartNames);

    // Best pool: not already used in this batch and not recently animated.
    let pool = parts.filter(
      (part) =>
        !excludedNames.has(part.name) && !recentNames.has(part.name),
    );

    // If SVG sampling left only a few usable regions, relax the older recent
    // history but still refuse the immediately previous region when possible.
    if (!pool.length) {
      pool = parts.filter(
        (part) =>
          !excludedNames.has(part.name) && part.name !== lastSelectedPart,
      );
    }

    if (!pool.length) {
      pool = parts.filter((part) => !excludedNames.has(part.name));
    }

    if (!pool.length) return null;

    const part = pool[Math.floor(Math.random() * pool.length)];
    rememberPart(part.name);
    return part;
  }

  function nextBatch(availableSlots) {
    const first = takeRandomPart();
    if (!first) return [];

    const batch = [first];
    const canDouble =
      variant === "hero" &&
      availableSlots > 1 &&
      parts.length > 1 &&
      Math.random() < DOUBLE_TRACE_CHANCE;

    if (!canDouble) return batch;

    const second = takeRandomPart(new Set([first.name]));
    if (second) batch.push(second);

    return batch;
  }

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function scheduleNext(delay = 0) {
    clearTimer();
    if (cancelled || paused || !prepared || !parts.length) return;

    timer = window.setTimeout(() => {
      timer = null;
      runNextTrace();
    }, delay);
  }

  function handlePrepared(nextParts) {
    if (cancelled) return;

    // The hero trace map contains only the intentional visible targets:
    // hair, glasses, shirt, tattoo, and phone. Facial details such as the
    // mouth, nose, cheeks, and jaw are never added to the random selection.
    parts = nextParts;
    lastSelectedPart = null;
    recentPartNames = [];
    prepared = true;
    preparing = false;
    if (!paused && parts.length) {
      scheduleNext(0);
    }
  }

  function beginPreparation() {
    if (cancelled || prepared || preparing) return;

    preparing = true;
    cancelPreparation =
      variant === "hero"
        ? prepareHeroPartsAsync(sourcePaths, handlePrepared)
        : prepareFallbackPartAsync(sourcePaths, handlePrepared);
  }

  function runNextTrace() {
    if (cancelled || paused || !prepared) return;

    const availableSlots = Math.max(
      0,
      MAX_ACTIVE_TRACES - activeTraces.size,
    );

    // Keep at most two tracers visible at once. If both slots are occupied,
    // check again very soon instead of waiting for a long random gap.
    if (!availableSlots) {
      scheduleNext(TRACE_RETRY_DELAY);
      return;
    }

    const batch = nextBatch(availableSlots);
    if (!batch.length) {
      scheduleNext(TRACE_RETRY_DELAY);
      return;
    }

    const entries = [];

    batch.forEach((part) => {
      const segment = pickTraceSegment(part);
      if (!segment) return;

      let trace;
      try {
        trace = createTracePath(part, segment);
      } catch {
        return;
      }

      if (!trace) return;

      const traceLength = segment.end - segment.start;
      if (!traceLength) {
        trace.remove();
        return;
      }

      activeTraces.add(trace);
      entries.push({ part, trace, traceLength, segment });
    });

    if (!entries.length) {
      scheduleNext(TRACE_RETRY_DELAY);
      return;
    }

    function completeEntry(animation, trace) {
      activeAnimations.delete(animation);
      activeTraces.delete(trace);
      trace.remove();

      // If the last visible trace just ended, launch another immediately.
      // This prevents the animation from ever sitting idle between strokes.
      if (
        activeTraces.size === 0 &&
        !cancelled &&
        !paused &&
        prepared &&
        parts.length
      ) {
        scheduleNext(0);
      }
    }

    entries.forEach(({ part, trace, traceLength, segment }) => {
      const totalPathLength = segment.totalLength || safePathLength(segment.source);
      const dashLength = getTravelDashLength(part, traceLength);
      const travelDistance = Math.max(0, traceLength - dashLength);
      const baseDuration = 980 + travelDistance * 4.1;
      const duration = Math.max(
        1120,
        Math.min(1850, baseDuration * randomBetween(0.94, 1.08)),
      );

      // A short dash plus a long gap creates one moving tracer. Changing the
      // dash offset makes it travel on the original SVG path itself.
      const dashPattern = `${dashLength} ${totalPathLength + dashLength + 10}`;
      const forwardStart = -segment.start;
      const forwardEnd = -(segment.end - dashLength);
      const startOffset = segment.reverse ? forwardEnd : forwardStart;
      const endOffset = segment.reverse ? forwardStart : forwardEnd;

      trace.style.strokeDasharray = dashPattern;
      trace.style.strokeDashoffset = `${startOffset}`;

      const animation = trace.animate(
        [
          {
            strokeDasharray: dashPattern,
            strokeDashoffset: `${startOffset}`,
            opacity: 0,
          },
          {
            strokeDasharray: dashPattern,
            strokeDashoffset: `${startOffset}`,
            opacity: 0.98,
            offset: 0.045,
          },
          {
            strokeDasharray: dashPattern,
            strokeDashoffset: `${endOffset}`,
            opacity: 0.98,
            offset: 0.93,
          },
          {
            strokeDasharray: dashPattern,
            strokeDashoffset: `${endOffset}`,
            opacity: 0,
          },
        ],
        {
          duration,
          easing: "cubic-bezier(0.22, 0.7, 0.28, 1)",
          fill: "forwards",
        },
      );

      activeAnimations.add(animation);

      animation.onfinish = () => completeEntry(animation, trace);
      animation.oncancel = () => {
        activeAnimations.delete(animation);
        activeTraces.delete(trace);
        trace.remove();
      };
    });

    // Start looking for the next randomized trace while this one is still
    // moving. Combined with MAX_ACTIVE_TRACES this creates continuous motion
    // without flooding the portrait with too many simultaneous strokes.
    scheduleNext(randomBetween(TRACE_START_MIN, TRACE_START_MAX));
  }

  return {
    pause() {
      if (cancelled || paused) return;
      paused = true;
      clearTimer();
      activeAnimations.forEach((animation) => animation.pause());
    },

    resume() {
      if (cancelled) return;

      paused = false;
      beginPreparation();

      if (!prepared) return;

      if (activeAnimations.size) {
        activeAnimations.forEach((animation) => animation.play());
        scheduleNext(randomBetween(180, 320));
      } else {
        scheduleNext(0);
      }
    },

    destroy() {
      cancelled = true;
      paused = true;
      clearTimer();
      cancelPreparation?.();

      activeAnimations.forEach((animation) => animation.cancel());
      activeAnimations.clear();

      activeTraces.forEach((trace) => trace.remove());
      activeTraces.clear();

      svg
        .querySelectorAll("[data-profile-effect]")
        .forEach((element) => element.remove());
    },
  };
}

export function ProfileArt({
  className,
  label = "Profile illustration",
  src = DEFAULT_SVG_URL,
  variant = "hero",
}) {
  const hostRef = React.useRef(null);
  const overlayRef = React.useRef(null);
  const reduceMotion = useReducedMotion();
  const [markup, setMarkup] = React.useState(null);

  React.useEffect(() => {
    let alive = true;

    loadSvgText(src)
      .then((text) => {
        if (alive) setMarkup(text);
      })
      .catch((error) => {
        console.error("ProfileArt error:", error);
      });

    return () => {
      alive = false;
    };
  }, [src]);

  React.useEffect(() => {
    if (!markup) return undefined;

    const host = hostRef.current;
    const svg = overlayRef.current?.querySelector("svg");

    if (!host || !svg) return undefined;

    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.display = "block";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.overflow = "visible";
    svg.querySelector("title")?.remove();

    if (variant === "journey") {
      styleJourneyArtwork(svg);
    } else {
      // The regular <img> below is the fast, immediately paintable base art.
      // This inline SVG exists only as an invisible geometry layer for traces.
      hideHeroOverlaySources(svg);
    }

    if (reduceMotion) return undefined;

    const controller = startTraceEngine(svg, variant);

    if (typeof IntersectionObserver === "undefined") {
      controller.resume();
      return () => controller.destroy();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controller.resume();
        } else {
          controller.pause();
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(host);

    return () => {
      observer.disconnect();
      controller.destroy();
    };
  }, [markup, reduceMotion, variant]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={label}
      className={`profile-art relative ${className ?? ""}`}
    >
      {variant === "hero" ? (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 block h-full w-full object-contain opacity-40 dark:invert dark:opacity-45"
        />
      ) : null}

      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
      />
    </div>
  );
}
