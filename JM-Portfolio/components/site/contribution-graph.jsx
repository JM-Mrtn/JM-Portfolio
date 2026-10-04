import { ArrowUpRight } from "lucide-react";
import { WindowCard } from "@/components/ui/window-card";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** GitHub mark — lucide 1.x has no brand icons (same approach as footer). */
function GithubIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a11 11 0 0 1 5.76 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14 0 1.54-.02 2.79-.02 3.17 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

const LEVEL_CLASSES = [
  "bg-foreground/[0.07]",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getLastTwelveMonths(weeks) {
  const allDays = weeks.flat();

  if (!allDays.length) {
    return {
      weeks: [],
      total: 0,
    };
  }

  const lastDay = allDays[allDays.length - 1];
  const lastDate = new Date(`${lastDay.date}T00:00:00Z`);

  // Show exactly 12 calendar months.
  const startDate = new Date(
    Date.UTC(
      lastDate.getUTCFullYear(),
      lastDate.getUTCMonth() - 11,
      1,
    ),
  );

  const visibleDays = allDays.filter((day) => {
    const date = new Date(`${day.date}T00:00:00Z`);

    return date >= startDate && date <= lastDate;
  });

  const visibleWeeks = [];
  let currentWeek = [];

  visibleDays.forEach((day, index) => {
    const date = new Date(`${day.date}T00:00:00Z`);

    currentWeek.push(day);

    if (
      date.getUTCDay() === 6 ||
      index === visibleDays.length - 1
    ) {
      visibleWeeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const visibleTotal = visibleDays.reduce(
    (sum, day) => sum + (day.count || 0),
    0,
  );

  return {
    weeks: visibleWeeks,
    total: visibleTotal,
  };
}

function monthLabels(weeks) {
  return weeks.map((week, i) => {
    const first = week[0];

    if (!first) return null;

    const month = new Date(
      `${first.date}T00:00:00Z`,
    ).getUTCMonth();

    const prev = weeks[i - 1]?.[0];

    const prevMonth = prev
      ? new Date(`${prev.date}T00:00:00Z`).getUTCMonth()
      : -1;

    return month !== prevMonth
      ? MONTHS[month]
      : null;
  });
}

export function ContributionGraph({ contributions }) {
  const visible = getLastTwelveMonths(
    contributions.weeks,
  );

  const weeks = visible.weeks;
  const total = visible.total;
  const labels = monthLabels(weeks);

  return (
    <WindowCard
      label={`github/${site.github.username}`}
      contentClassName="p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          {total.toLocaleString()} contribution
          {total === 1 ? "" : "s"} in the last 12 months
        </p>

        <a
          href={site.socials.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <GithubIcon className="size-3.5" />

          View profile

          <ArrowUpRight
            className="size-3.5"
            aria-hidden
          />
        </a>
      </div>

      <div className="mt-5 overflow-hidden">
        <div className="w-max max-w-full pb-2.5">
          <div
            className="mb-1 flex h-3 gap-[2px] pl-7"
            aria-hidden
          >
            {labels.map((label, i) => (
              <span
                key={i}
                className="relative w-2 shrink-0"
              >
                {label ? (
                  <span className="absolute left-0 top-0 font-mono text-[8px] leading-none text-muted-foreground">
                    {label}
                  </span>
                ) : null}
              </span>
            ))}
          </div>

          <div className="flex gap-[2px]">
            <div
              className="mr-1 flex w-6 shrink-0 flex-col gap-[2px] font-mono text-[8px] text-muted-foreground"
              aria-hidden
            >
              {[
                "",
                "Mon",
                "",
                "Wed",
                "",
                "Fri",
                "",
              ].map((day, i) => (
                <span
                  key={i}
                  className="flex h-2 items-center"
                >
                  {day}
                </span>
              ))}
            </div>

            {weeks.map((week, weekIndex) => {
              const firstDow = week[0]
                ? new Date(
                    `${week[0].date}T00:00:00Z`,
                  ).getUTCDay()
                : 0;

              return (
                <div
                  key={weekIndex}
                  className="flex shrink-0 flex-col gap-[2px]"
                >
                  {weekIndex === 0 &&
                    Array.from(
                      { length: firstDow },
                      (_, i) => (
                        <span
                          key={`pad-${i}`}
                          className="size-2"
                          aria-hidden
                        />
                      ),
                    )}

                  {week.map((day) => (
                    <span
                      key={day.date}
                      title={
                        day.count != null
                          ? `${day.count} contribution${
                              day.count === 1 ? "" : "s"
                            } on ${day.date}`
                          : day.date
                      }
                      className={cn(
                        "size-2 rounded-[2px]",
                        LEVEL_CLASSES[day.level],
                      )}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="mt-2.5 flex items-center justify-end gap-1 font-mono text-[8px] text-muted-foreground"
        aria-hidden
      >
        Less

        {LEVEL_CLASSES.map((className) => (
          <span
            key={className}
            className={cn(
              "size-2 rounded-[2px]",
              className,
            )}
          />
        ))}

        More
      </div>

      <span className="sr-only">
        GitHub contribution calendar: {total} contributions
        in the last 12 months.
      </span>
    </WindowCard>
  );
}