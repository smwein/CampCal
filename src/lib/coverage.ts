import {
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isWithinInterval,
  getDay,
  format,
} from "date-fns";

export interface Kid {
  id: string;
  name: string;
  color: string;
  birth_date: string | null;
}

export interface Assignment {
  id: string;
  kid_id: string;
  status: string;
  camp_session: {
    id: string;
    start_date: string;
    end_date: string;
    days_of_week: number;
    camp: {
      id: string;
      name: string;
      category: string;
    };
  };
}

export interface CoverageOverride {
  id: string;
  kid_id: string;
  start_date: string;
  end_date: string;
  type: string;
  label: string | null;
}

// Summer 2026: June 1 - August 28 (13 weeks)
export const SUMMER_START = new Date(2026, 5, 1); // June 1
export const SUMMER_END = new Date(2026, 7, 28); // August 28

export function getSummerWeeks() {
  return eachWeekOfInterval(
    { start: SUMMER_START, end: SUMMER_END },
    { weekStartsOn: 1 } // Monday
  );
}

// Check if a given date is covered by an assignment's days_of_week bitmask
// Bitmask: bit 0 = Monday, bit 1 = Tuesday, ..., bit 4 = Friday
function isDayInBitmask(date: Date, bitmask: number): boolean {
  const jsDay = getDay(date); // 0=Sun, 1=Mon, ..., 6=Sat
  if (jsDay === 0 || jsDay === 6) return false; // weekends don't count
  const bitIndex = jsDay - 1; // Mon=0, Tue=1, ..., Fri=4
  return (bitmask & (1 << bitIndex)) !== 0;
}

export interface WeekCoverage {
  weekStart: Date;
  weekLabel: string;
  campName: string | null;
  overrideLabel: string | null;
  type: "camp" | "vacation" | "gap";
}

export function getKidWeekCoverage(
  kidId: string,
  assignments: Assignment[],
  overrides: CoverageOverride[]
): WeekCoverage[] {
  const weeks = getSummerWeeks();
  const kidAssignments = assignments.filter((a) => a.kid_id === kidId);
  const kidOverrides = overrides.filter((o) => o.kid_id === kidId);

  return weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekdays = eachDayOfInterval({ start: weekStart, end: weekEnd }).filter(
      (d) => getDay(d) !== 0 && getDay(d) !== 6
    );

    // Check overrides first (vacation takes priority in display)
    const override = kidOverrides.find((o) => {
      const oStart = new Date(o.start_date);
      const oEnd = new Date(o.end_date);
      return weekdays.some((d) =>
        isWithinInterval(d, { start: oStart, end: oEnd })
      );
    });

    if (override) {
      return {
        weekStart,
        weekLabel: format(weekStart, "MMM d"),
        campName: null,
        overrideLabel: override.label ?? override.type,
        type: "vacation" as const,
      };
    }

    // Check assignments
    const assignment = kidAssignments.find((a) => {
      const sStart = new Date(a.camp_session.start_date);
      const sEnd = new Date(a.camp_session.end_date);
      return weekdays.some(
        (d) =>
          isWithinInterval(d, { start: sStart, end: sEnd }) &&
          isDayInBitmask(d, a.camp_session.days_of_week)
      );
    });

    if (assignment) {
      return {
        weekStart,
        weekLabel: format(weekStart, "MMM d"),
        campName: assignment.camp_session.camp.name,
        overrideLabel: null,
        type: "camp" as const,
      };
    }

    return {
      weekStart,
      weekLabel: format(weekStart, "MMM d"),
      campName: null,
      overrideLabel: null,
      type: "gap" as const,
    };
  });
}

export function getCoveragePercentage(coverage: WeekCoverage[]): number {
  if (coverage.length === 0) return 0;
  const covered = coverage.filter((w) => w.type !== "gap").length;
  return Math.round((covered / coverage.length) * 100);
}
