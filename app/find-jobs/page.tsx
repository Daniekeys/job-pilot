import { redirect } from "next/navigation";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";
import { createInsforgeServer } from "@/lib/insforge-server";
import { mapRowToJob, type JobRow } from "@/lib/job-mapper";
import {
  JOBS_PAGE_SIZE,
  escapeIlikeTerm,
  parseJobsSearchParams,
} from "@/lib/jobs-query";
import { MATCH_THRESHOLD } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function FindJobsPage({ searchParams }: Props) {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const rawParams = await searchParams;
  const params = parseJobsSearchParams(rawParams);
  const offset = (params.page - 1) * JOBS_PAGE_SIZE;

  let query = insforge.database
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  if (params.q !== "") {
    const term = escapeIlikeTerm(params.q);
    query = query.or(`company.ilike."%${term}%",title.ilike."%${term}%"`);
  }
  if (params.match === "high") {
    query = query.gte("match_score", MATCH_THRESHOLD);
  } else if (params.match === "low") {
    query = query.lt("match_score", MATCH_THRESHOLD);
  }

  if (params.sort === "newest") {
    query = query.order("found_at", { ascending: false });
  } else if (params.sort === "oldest") {
    query = query.order("found_at", { ascending: true });
  } else {
    query = query
      .order("match_score", { ascending: false })
      .order("found_at", { ascending: false });
  }

  const {
    data: rows,
    error,
    count,
  } = await query.range(offset, offset + JOBS_PAGE_SIZE - 1);
  if (error) {
    console.error("[app/find-jobs/page]", error);
    return (
      <>
        <AppNavbar />
        <main className="mx-auto flex max-w-360 flex-col gap-6 p-8">
          <SearchControls />
          <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-error shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            We could not load your jobs right now. Please try again.
          </div>
        </main>
      </>
    );
  }

  const jobs = rows.map((row) => mapRowToJob(row as JobRow));
  const hasActiveFilters = params.q !== "" || params.match !== "all";

  return (
    <>
      <AppNavbar />
      <main className="mx-auto flex max-w-360 flex-col gap-6 p-8">
        <SearchControls />

        <div className="rounded-2xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <JobFilters />
          <JobsTable jobs={jobs} hasActiveFilters={hasActiveFilters} />
          <JobsPagination
            page={params.page}
            pageSize={JOBS_PAGE_SIZE}
            totalCount={count ?? 0}
            searchParams={rawParams}
          />
        </div>
      </main>
    </>
  );
}
