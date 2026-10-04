"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ContributionGraph } from "@/components/site/contribution-graph";
import { site } from "@/lib/site";

const SVG_NS = "http://www.w3.org/2000/svg";
const MAX_ACTIVE_TRACES = 2;
const DOUBLE_TRACE_CHANCE = 0.34;
const TRACE_START_MIN = 820;
const TRACE_START_MAX = 1180;
const TRACE_RETRY_DELAY = 90;
const RECENT_PART_COUNT = 2;
const TARGET_SAMPLE_STEP = 6;
const MIN_SAMPLES_PER_PATH = 10;
const MAX_SAMPLES_PER_PATH = 220;
const MIN_SEGMENT_LENGTH = 12;
const PREPARE_IDLE_TIMEOUT = 120;

const stages = [
  {
    years: "Foundation",
    title: "BS Information Technology",
    blurb:
      "Bachelor of Science in Information Technology specialized in Web and Mobile Application Development at National University - MOA.",
  },
  {
    years: "4 yrs",
    title: "Software Development",
    blurb:
      "Designing and developing web applications with responsive interfaces, scalable architectures, and user-centered experiences using modern web technologies.",
  },
  {
    years: "3 yrs",
    title: "Mobile Development",
    blurb:
      "Developing mobile applications with intuitive interfaces and reliable functionality, delivering user-centered solutions across multiple platforms.",
  },
  {
    years: "2 yrs · Now",
    title: "AI Engineering",
    blurb:
      "Exploring artificial intelligence by integrating AI technologies, automation, and intelligent solutions into modern software applications.",
  },
];

/*
 * JM_About.svg uses a 600 x 600 viewBox.
 * These regions intentionally avoid the mouth, nose, cheeks, jaw, and ears.
 * The animation is allowed to trace only clearly identifiable non-face details.
 */
const JOURNEY_TRACE_PARTS = [
  {
    name: "hair",
    boxes: [
      { x: 185, y: 4, width: 215, height: 92 },
      { x: 185, y: 70, width: 65, height: 122 },
      { x: 315, y: 55, width: 88, height: 72 },
    ],
    excludeBoxes: [
      { x: 230, y: 100, width: 58, height: 82 },
      { x: 390, y: 96, width: 38, height: 72 },
    ],
  },
  {
    name: "glasses",
    boxes: [
      { x: 286, y: 91, width: 58, height: 39 },
      { x: 344, y: 89, width: 55, height: 41 },
      { x: 332, y: 101, width: 22, height: 15 },
    ],
    excludeBoxes: [{ x: 365, y: 123, width: 48, height: 60 }],
  },
  {
    name: "necklace",
    boxes: [{ x: 248, y: 205, width: 112, height: 145 }],
  },
  {
    name: "shirt",
    boxes: [
      { x: 70, y: 210, width: 176, height: 218 },
      { x: 355, y: 215, width: 170, height: 216 },
      { x: 210, y: 330, width: 125, height: 100 },
      { x: 240, y: 505, width: 245, height: 88 },
    ],
  },
  {
    name: "tattoo",
    boxes: [{ x: 94, y: 428, width: 230, height: 86 }],
  },
  {
    name: "watch",
    boxes: [{ x: 382, y: 418, width: 58, height: 60 }],
  },
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function shuffle(items) {
  const output = [...items];

  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }

  return output;
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
  const included = part.boxes.some((box) => pointInsideBox(point, box));
  if (!included) return false;

  if (part.excludeBoxes?.some((box) => pointInsideBox(point, box))) {
    return false;
  }

  return true;
}

function safePathLength(path) {
  try {
    return path.getTotalLength();
  } catch {
    return 0;
  }
}

function scheduleBackgroundWork(callback) {
  if (typeof window.requestIdleCallback === "function") {
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

function getPathToSvgMatrix(path, svg) {
  try {
    const pathMatrix = path.getCTM();
    const svgMatrix = svg.getCTM();

    if (!pathMatrix || !svgMatrix) return null;
    return svgMatrix.inverse().multiply(pathMatrix);
  } catch {
    return null;
  }
}

function transformPoint(point, matrix) {
  if (!matrix) return point;

  if (typeof DOMPoint === "function") {
    return new DOMPoint(point.x, point.y).matrixTransform(matrix);
  }

  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  };
}

function styleJourneyArtwork(svg) {
  const drawable = svg.querySelectorAll(
    "path,line,polyline,polygon,circle,ellipse",
  );

  drawable.forEach((item) => {
    if (item.hasAttribute("data-journey-trace")) return;

    item.style.setProperty("fill", "currentColor", "important");
    item.style.setProperty("stroke", "none", "important");
    item.style.setProperty("opacity", "0.42", "important");
  });
}

function collectSegmentsForPath(path, svg, parts, totalLength) {
  const matrix = getPathToSvgMatrix(path, svg);
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

    if (end - start >= Math.max(MIN_SEGMENT_LENGTH, sampleStep * 0.5)) {
      part.segments.push({
        source: path,
        start,
        end,
      });
    }

    state.start = null;
    state.lastInside = null;
  }

  for (let index = 0; index <= sampleCount; index += 1) {
    const distance = (totalLength * index) / sampleCount;
    let localPoint;

    try {
      localPoint = path.getPointAtLength(distance);
    } catch {
      break;
    }

    const svgPoint = transformPoint(localPoint, matrix);

    parts.forEach((part) => {
      const state = states.get(part.name);
      const inside = pointInsidePart(svgPoint, part);

      if (inside) {
        if (state.start === null) {
          state.start = Math.max(0, distance - sampleStep * 0.5);
        }

        state.lastInside = Math.min(
          totalLength,
          distance + sampleStep * 0.5,
        );
      } else {
        closeSegment(part, state);
      }
    });
  }

  parts.forEach((part) => closeSegment(part, states.get(part.name)));
}

function prepareJourneyPartsAsync(svg, onComplete) {
  const parts = JOURNEY_TRACE_PARTS.map((part) => ({
    ...part,
    segments: [],
  }));

  const paths = Array.from(
    svg.querySelectorAll("path:not([data-journey-trace])"),
  ).sort((a, b) => {
    const aSize = a.getAttribute("d")?.length ?? 0;
    const bSize = b.getAttribute("d")?.length ?? 0;
    return aSize - bSize;
  });

  let index = 0;
  let cancelled = false;
  let cancelScheduledWork = null;

  function processNext() {
    if (cancelled) return;

    const path = paths[index];
    index += 1;

    if (!path) {
      onComplete(parts.filter((part) => part.segments.length > 0));
      return;
    }

    const totalLength = safePathLength(path);
    if (totalLength >= MIN_SEGMENT_LENGTH) {
      collectSegmentsForPath(path, svg, parts, totalLength);
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
  if (!part.segments.length) return null;

  const ordered = [...part.segments].sort(
    (a, b) => b.end - b.start - (a.end - a.start),
  );

  // Favor the longer candidates while preserving randomness.
  const candidatePool = ordered.slice(0, Math.max(1, Math.ceil(ordered.length * 0.7)));
  const candidate =
    candidatePool[Math.floor(Math.random() * candidatePool.length)];

  const available = candidate.end - candidate.start;
  const visibleLength = available * randomBetween(0.66, 0.96);
  const extra = Math.max(0, available - visibleLength);
  const start = candidate.start + Math.random() * extra;

  return {
    source: candidate.source,
    start,
    end: start + visibleLength,
    reverse: Math.random() > 0.5,
  };
}

function buildTracePoints(segment) {
  const span = segment.end - segment.start;
  const pointCount = Math.max(10, Math.min(48, Math.ceil(span / 10)));
  const points = [];

  for (let index = 0; index <= pointCount; index += 1) {
    const distance = segment.start + (span * index) / pointCount;

    try {
      const point = segment.source.getPointAtLength(distance);
      points.push({ x: point.x, y: point.y });
    } catch {
      break;
    }
  }

  if (segment.reverse) points.reverse();
  return points;
}

function createTracePolyline(part, segment) {
  const points = buildTracePoints(segment);
  if (points.length < 2) return null;

  const trace = document.createElementNS(SVG_NS, "polyline");
  trace.setAttribute(
    "points",
    points.map((point) => `${point.x},${point.y}`).join(" "),
  );
  trace.setAttribute("data-journey-trace", "true");
  trace.setAttribute("data-journey-part", part.name);
  trace.setAttribute("fill", "none");
  trace.setAttribute("stroke", "var(--primary)");
  trace.setAttribute("stroke-width", "2.2");
  trace.setAttribute("stroke-linecap", "round");
  trace.setAttribute("stroke-linejoin", "round");
  trace.setAttribute("vector-effect", "non-scaling-stroke");
  trace.style.pointerEvents = "none";
  trace.style.opacity = "0";
  trace.style.filter = "drop-shadow(0 0 3px var(--primary))";

  segment.source.parentNode?.appendChild(trace);
  return trace;
}

function startJourneyTraceEngine(svg) {
  let cancelled = false;
  let paused = true;
  let prepared = false;
  let preparing = false;
  let cancelPreparation = null;
  let parts = [];
  let randomBag = [];
  let timer = null;

  const recentParts = [];
  const activeTraces = new Set();
  const activeAnimations = new Set();

  function clearTimer() {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function rememberPart(name) {
    recentParts.push(name);
    while (recentParts.length > RECENT_PART_COUNT) recentParts.shift();
  }

  function refillBag() {
    randomBag = shuffle(parts);
  }

  function takeRandomPart(excludedNames = new Set()) {
    if (!parts.length) return null;

    const recentSet = new Set(recentParts);

    for (let pass = 0; pass < 3; pass += 1) {
      if (!randomBag.length) refillBag();

      const eligible = randomBag
        .map((part, index) => ({ part, index }))
        .filter(({ part }) => {
          if (excludedNames.has(part.name)) return false;
          if (pass < 2 && recentSet.has(part.name)) return false;
          return true;
        });

      if (eligible.length) {
        const selected = eligible[Math.floor(Math.random() * eligible.length)];
        const [part] = randomBag.splice(selected.index, 1);
        rememberPart(part.name);
        return part;
      }

      if (!randomBag.length) refillBag();
    }

    return null;
  }

  function nextBatch(availableSlots) {
    const first = takeRandomPart();
    if (!first) return [];

    const batch = [first];

    if (
      availableSlots > 1 &&
      parts.length > 1 &&
      Math.random() < DOUBLE_TRACE_CHANCE
    ) {
      const second = takeRandomPart(new Set([first.name]));
      if (second) batch.push(second);
    }

    return batch;
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

    parts = nextParts;
    randomBag = [];
    prepared = true;
    preparing = false;

    if (!paused && parts.length) scheduleNext(0);
  }

  function beginPreparation() {
    if (cancelled || prepared || preparing) return;

    preparing = true;
    cancelPreparation = prepareJourneyPartsAsync(svg, handlePrepared);
  }

  function completeTrace(animation, trace) {
    activeAnimations.delete(animation);
    activeTraces.delete(trace);
    trace.remove();

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

  function runNextTrace() {
    if (cancelled || paused || !prepared) return;

    const availableSlots = MAX_ACTIVE_TRACES - activeTraces.size;
    if (availableSlots <= 0) {
      scheduleNext(TRACE_RETRY_DELAY);
      return;
    }

    const batch = nextBatch(availableSlots);
    if (!batch.length) {
      scheduleNext(TRACE_RETRY_DELAY);
      return;
    }

    batch.forEach((part) => {
      const segment = pickTraceSegment(part);
      if (!segment) return;

      const trace = createTracePolyline(part, segment);
      if (!trace) return;

      activeTraces.add(trace);

      const totalLength = safePathLength(trace);
      if (!totalLength) {
        activeTraces.delete(trace);
        trace.remove();
        return;
      }

      // Longer visible dash so small Journey details are still easy to notice.
      const dashLength = Math.min(
        totalLength,
        Math.max(totalLength * randomBetween(0.36, 0.52), 18),
      );
      const travelDistance = Math.max(0, totalLength - dashLength);
      const duration = Math.max(
        1950,
        Math.min(3200, 1800 + travelDistance * 10.5),
      );
      const dashPattern = `${dashLength} ${totalLength + dashLength + 10}`;
      const endOffset = -(totalLength - dashLength);

      trace.style.strokeDasharray = dashPattern;
      trace.style.strokeDashoffset = "0";

      const animation = trace.animate(
        [
          { strokeDashoffset: "0", opacity: 0 },
          { strokeDashoffset: "0", opacity: 0.98, offset: 0.05 },
          {
            strokeDashoffset: `${endOffset}`,
            opacity: 0.98,
            offset: 0.93,
          },
          { strokeDashoffset: `${endOffset}`, opacity: 0 },
        ],
        {
          duration,
          easing: "cubic-bezier(0.22, 0.7, 0.28, 1)",
          fill: "forwards",
        },
      );

      activeAnimations.add(animation);
      animation.onfinish = () => completeTrace(animation, trace);
      animation.oncancel = () => {
        activeAnimations.delete(animation);
        activeTraces.delete(trace);
        trace.remove();
      };
    });

    scheduleNext(randomBetween(TRACE_START_MIN, TRACE_START_MAX));
  }

  return {
    resume() {
      if (cancelled) return;

      paused = false;
      beginPreparation();

      if (!prepared) return;

      activeAnimations.forEach((animation) => animation.play());
      scheduleNext(activeTraces.size ? randomBetween(180, 320) : 0);
    },

    pause() {
      if (cancelled || paused) return;

      paused = true;
      clearTimer();
      activeAnimations.forEach((animation) => animation.pause());
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
        .querySelectorAll("[data-journey-trace]")
        .forEach((trace) => trace.remove());
    },
  };
}

function JourneyProfileArt() {
  const ref = React.useRef(null);
  const [svg, setSvg] = React.useState(null);

  React.useEffect(() => {
    let alive = true;

    fetch("/images/JM_About.svg")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load JM_About.svg");
        return response.text();
      })
      .then((text) => {
        if (alive) setSvg(text);
      })
      .catch((error) => {
        console.error("Journey portrait error:", error);
      });

    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    if (!svg) return undefined;

    const host = ref.current;
    const element = host?.querySelector("svg");
    if (!host || !element) return undefined;

    element.removeAttribute("width");
    element.removeAttribute("height");
    element.setAttribute("width", "100%");
    element.setAttribute("height", "100%");
    element.style.display = "block";
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.overflow = "visible";
    element.querySelector("title")?.remove();

    styleJourneyArtwork(element);

    const controller = startJourneyTraceEngine(element);

    if (typeof IntersectionObserver === "undefined") {
      controller.resume();
      return () => controller.destroy();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) controller.resume();
        else controller.pause();
      },
      {
        threshold: 0.08,
        rootMargin: "180px 0px 180px 0px",
      },
    );

    observer.observe(host);

    return () => {
      observer.disconnect();
      controller.destroy();
    };
  }, [svg]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Journey profile illustration"
      className="aspect-square w-full text-foreground"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}

export function Journey() {
  const [contributions, setContributions] = React.useState(null);

  React.useEffect(() => {
    async function loadGithubContributions() {
      try {
        const username = site.github?.username || "YOUR_GITHUB_USERNAME";
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
        );

        if (!response.ok) {
          throw new Error("GitHub contribution fetch failed");
        }

        const data = await response.json();
        const contributionDays = data.contributions || [];
        const total = contributionDays.reduce(
          (sum, day) => sum + (day.count || 0),
          0,
        );

        const weeks = [];
        let currentWeek = [];

        contributionDays.forEach((day, index) => {
          const date = new Date(`${day.date}T00:00:00Z`);

          currentWeek.push({
            date: day.date,
            count: day.count,
            level: day.level,
          });

          if (
            date.getUTCDay() === 6 ||
            index === contributionDays.length - 1
          ) {
            weeks.push(currentWeek);
            currentWeek = [];
          }
        });

        setContributions({ total, weeks });
      } catch (error) {
        console.error(error);
      }
    }

    loadGithubContributions();
  }, []);

  return (
    <section id="journey" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24 lg:py-28">
        <div className="grid items-start gap-x-14 gap-y-12 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
          <div className="min-w-0">
            <Reveal>
              <div className="mx-auto w-full max-w-[500px] lg:mx-0">
                <JourneyProfileArt />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="eyebrow mt-7 md:mt-8">THE JOURNEY</p>

              <h2 className="mt-3 text-4xl leading-[0.98] sm:text-5xl md:text-6xl">
  <span className="block">A DEVELOPER</span>
  <span className="block">WHO BUILDS</span>
  <span className="block">INTELLIGENT</span>
  <span className="block">EXPERIENCES</span>
</h2>

              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                From software systems to mobile applications and AI solutions,
                my journey is driven by creating technology that is functional,
                scalable, and designed around businesses.
              </p>
            </Reveal>
          </div>

          <div className="min-w-0 lg:pt-1">
            <RevealGroup as="ol" staggerChildren={0.16}>
              {stages.map((stage, index) => (
                <RevealItem
                  key={stage.title}
                  as="li"
                  className="relative pb-9 pl-10 md:pb-10 last:pb-0"
                >
                  {index < stages.length - 1 && (
                    <motion.span
                      aria-hidden
                      className="absolute bottom-0 left-[3.5px] top-4 w-0.5 origin-top bg-border"
                    />
                  )}

                  <motion.span
                    aria-hidden
                    className={`absolute left-0 top-1.5 size-2 rounded-full ${
                      index === stages.length - 1
                        ? "bg-primary"
                        : "bg-border"
                    }`}
                  />

                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {stage.years}
                  </p>

                  <h3 className="mt-2.5 font-sans text-xl font-semibold tracking-tight">
                    {stage.title}
                  </h3>

                  {stage.stat && (
                    <p className="mt-1 font-display text-3xl text-primary md:text-4xl">
                      {stage.stat}
                    </p>
                  )}

                  <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
                    {stage.blurb}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>

            {contributions && (
              <Reveal delay={0.15} className="mt-9 md:mt-10">
                <ContributionGraph contributions={contributions} />
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
