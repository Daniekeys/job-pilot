import type { CompanyDossier } from "@/types";

export type StatsJobRow = {
  match_score: number | null;
  found_at: string;
  company_research: CompanyDossier | null;
};

export type DashboardStat = {
  label: string;
  value: string;
  trend?: string;
  caption: string;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function average(rows: StatsJobRow[]): number {
  if (rows.length === 0) return 0;
  const sum = rows.reduce((total, row) => total + (row.match_score ?? 0), 0);
  return sum / rows.length;
}

function formatSignedPercent(change: number): string | undefined {
  const rounded = Math.round(change);
  if (rounded === 0) return undefined;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export function computeDashboardStats(rows: StatsJobRow[]): DashboardStat[] {
  const now = Date.now();
  const weekAgo = now - WEEK_MS;
  const twoWeeksAgo = now - 2 * WEEK_MS;

  const thisWeek = rows.filter((row) => new Date(row.found_at).getTime() >= weekAgo);
  const lastWeek = rows.filter((row) => {
    const foundAt = new Date(row.found_at).getTime();
    return foundAt >= twoWeeksAgo && foundAt < weekAgo;
  });

  const totalTrend =
    lastWeek.length > 0
      ? formatSignedPercent(((thisWeek.length - lastWeek.length) / lastWeek.length) * 100)
      : undefined;
  const matchRateTrend =
    thisWeek.length > 0 && lastWeek.length > 0
      ? formatSignedPercent(average(thisWeek) - average(lastWeek))
      : undefined;

  return [
    {
      label: "Total Jobs Found",
      value: String(rows.length),
      trend: totalTrend,
      caption: "vs last week",
    },
    {
      label: "Avg. Match Rate",
      value: `${Math.round(average(rows))}%`,
      trend: matchRateTrend,
      caption: "vs last week",
    },
    {
      label: "Companies Researched",
      value: String(rows.filter((row) => row.company_research !== null).length),
      caption: "Total researched",
    },
    {
      label: "Jobs This Week",
      value: String(thisWeek.length),
      caption: "New this week",
    },
  ];
}
