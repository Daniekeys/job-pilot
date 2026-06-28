import { formatRelativeTime } from "@/lib/utils";

export type ActivityDot = "info" | "success";

export type ActivityItem = {
  id: string;
  text: string;
  timestamp: string;
  dot: ActivityDot;
};

export type CompletedRunRow = {
  id: string;
  job_title_searched: string | null;
  jobs_found: number | null;
  completed_at: string | null;
};

export type ResearchedJobRow = {
  id: string;
  company: string;
  found_at: string;
};

const RECENT_ACTIVITY_LIMIT = 5;

type SortableEntry = { sortKey: string; item: ActivityItem };

export function buildRecentActivity(
  completedRuns: CompletedRunRow[],
  researchedJobs: ResearchedJobRow[],
): ActivityItem[] {
  const runEntries: SortableEntry[] = completedRuns.flatMap((run) => {
    if (!run.completed_at) return [];
    const jobsFound = run.jobs_found ?? 0;
    return [
      {
        sortKey: run.completed_at,
        item: {
          id: `run-${run.id}`,
          text: `Found ${jobsFound} job${jobsFound === 1 ? "" : "s"} for ${run.job_title_searched || "your search"}`,
          timestamp: formatRelativeTime(run.completed_at),
          dot: "success",
        },
      },
    ];
  });

  const researchEntries: SortableEntry[] = researchedJobs.map((job) => ({
    sortKey: job.found_at,
    item: {
      id: `research-${job.id}`,
      text: `Researched ${job.company}`,
      timestamp: formatRelativeTime(job.found_at),
      dot: "info",
    },
  }));

  return [...runEntries, ...researchEntries]
    .sort((a, b) => new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime())
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map((entry) => entry.item);
}
