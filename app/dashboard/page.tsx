import { redirect } from "next/navigation";

import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  createEmptyProfile,
  mapRowToProfile,
  type ProfileRow,
} from "@/lib/profile-mapper";
import { getProfileCompletion } from "@/lib/utils";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { data: row, error } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = row
    ? mapRowToProfile(row as ProfileRow)
    : createEmptyProfile(user.id, user.email ?? "");
  if (error || !row) {
    console.error("[app/dashboard/page]", error);
  }
  const { percentage, missingFields, isComplete } = getProfileCompletion(profile);

  return (
    <>
      <AppNavbar />
      <main className="mx-auto flex max-w-360 flex-col gap-6 p-8">
        {!isComplete && (
          <CompletionIndicator percentage={percentage} missingFields={missingFields} />
        )}
        <StatsBar />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivity />
          <AnalyticsCharts />
        </div>
      </main>
    </>
  );
}
