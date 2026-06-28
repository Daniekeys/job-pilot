import { redirect } from "next/navigation";

import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { computeDashboardAnalytics } from "@/lib/dashboard-analytics";
import { computeDashboardStats, type StatsJobRow } from "@/lib/dashboard-stats";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  createEmptyProfile,
  mapRowToProfile,
  type ProfileRow,
} from "@/lib/profile-mapper";
import {
  buildRecentActivity,
  type CompletedRunRow,
  type ResearchedJobRow,
} from "@/lib/recent-activity";
import { getProfileCompletion } from "@/lib/utils";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [
    { data: row, error },
    { data: jobRows, error: jobsError },
    { data: completedRuns, error: runsError },
    { data: researchedJobs, error: researchedError },
  ] = await Promise.all([
    insforge.database.from("profiles").select("*").eq("id", user.id).single(),
    insforge.database
      .from("jobs")
      .select("match_score, found_at, company_research")
      .eq("user_id", user.id),
    insforge.database
      .from("agent_runs")
      .select("id, job_title_searched, jobs_found, completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(10),
    insforge.database
      .from("jobs")
      .select("id, company, found_at")
      .eq("user_id", user.id)
      .not("company_research", "is", null)
      .order("found_at", { ascending: false })
      .limit(10),
  ]);
  const profile = row
    ? mapRowToProfile(row as ProfileRow)
    : createEmptyProfile(user.id, user.email ?? "");
  if (error || !row) {
    console.error("[app/dashboard/page]", error);
  }
  if (jobsError) {
    console.error("[app/dashboard/page]", jobsError);
  }
  if (runsError) {
    console.error("[app/dashboard/page]", runsError);
  }
  if (researchedError) {
    console.error("[app/dashboard/page]", researchedError);
  }
  const { percentage, missingFields, isComplete } = getProfileCompletion(profile);
  const statsJobRows = (jobRows ?? []) as StatsJobRow[];
  const stats = computeDashboardStats(statsJobRows);
  const analytics = computeDashboardAnalytics(statsJobRows);
  const activities = buildRecentActivity(
    (completedRuns ?? []) as CompletedRunRow[],
    (researchedJobs ?? []) as ResearchedJobRow[],
  );

  return (
    <>
      <AppNavbar userEmail={user.email ?? ""} />
      <main className="mx-auto flex max-w-360 flex-col gap-6 p-8">
        {!isComplete && (
          <CompletionIndicator percentage={percentage} missingFields={missingFields} />
        )}
        <StatsBar stats={stats} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivity activities={activities} />
          <AnalyticsCharts data={analytics} />
        </div>
      </main>
    </>
  );
}
