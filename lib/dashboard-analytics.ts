import type { StatsJobRow } from "@/lib/dashboard-stats";

export type ChartPoint = { day: string; count: number };
export type MatchScoreBucket = { range: string; count: number };

export type AnalyticsData = {
  jobsOverTime: ChartPoint[];
  matchScoreDistribution: MatchScoreBucket[];
  companyResearchActivity: ChartPoint[];
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MATCH_SCORE_RANGES = ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"];

function buildDayBuckets(days: number): { iso: string; label: string }[] {
  const buckets: { iso: string; label: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * DAY_MS);
    buckets.push({
      iso: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }
  return buckets;
}

function countByDay(rows: { found_at: string }[], days: number): ChartPoint[] {
  const buckets = buildDayBuckets(days);
  const counts = new Map<string, number>(buckets.map((bucket) => [bucket.iso, 0]));
  for (const row of rows) {
    const iso = row.found_at.slice(0, 10);
    if (counts.has(iso)) {
      counts.set(iso, (counts.get(iso) ?? 0) + 1);
    }
  }
  return buckets.map((bucket) => ({ day: bucket.label, count: counts.get(bucket.iso) ?? 0 }));
}

function bucketMatchScore(score: number): string | null {
  if (score >= 90) return "90-100%";
  if (score >= 80) return "80-90%";
  if (score >= 70) return "70-80%";
  if (score >= 60) return "60-70%";
  if (score >= 50) return "50-60%";
  return null;
}

function buildMatchScoreDistribution(rows: StatsJobRow[]): MatchScoreBucket[] {
  const counts = new Map<string, number>(MATCH_SCORE_RANGES.map((range) => [range, 0]));
  for (const row of rows) {
    if (row.match_score === null) continue;
    const bucket = bucketMatchScore(row.match_score);
    if (bucket) {
      counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
    }
  }
  return MATCH_SCORE_RANGES.map((range) => ({ range, count: counts.get(range) ?? 0 }));
}

// Sourced directly from the `jobs` table, not PostHog. The Query API needs a personal API
// key the public project token can't provide, and `job_found`/`company_researched` events
// are themselves derived from these same DB writes — the DB is the more reliable, cheaper
// source of truth for the same data, with no event-loss/flush-timing risk.
export function computeDashboardAnalytics(rows: StatsJobRow[]): AnalyticsData {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * DAY_MS;
  const sevenDaysAgo = now - 7 * DAY_MS;

  const last30Days = rows.filter((row) => new Date(row.found_at).getTime() >= thirtyDaysAgo);
  // `jobs` has no "researched at" column (only `found_at`) — same documented proxy-timestamp
  // limitation as lib/recent-activity.ts's "Researched {company}" entries.
  const researchedLast7Days = rows.filter(
    (row) => row.company_research !== null && new Date(row.found_at).getTime() >= sevenDaysAgo,
  );

  return {
    jobsOverTime: countByDay(last30Days, 30),
    matchScoreDistribution: buildMatchScoreDistribution(rows),
    companyResearchActivity: countByDay(researchedLast7Days, 7),
  };
}
