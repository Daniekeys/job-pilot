import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { CompanyResearch } from "@/components/job-details/CompanyResearch";
import { JobActions } from "@/components/job-details/JobActions";
import { JobDescription } from "@/components/job-details/JobDescription";
import { JobInfo } from "@/components/job-details/JobInfo";
import { MatchScore } from "@/components/job-details/MatchScore";
import { createInsforgeServer } from "@/lib/insforge-server";
import { mapRowToJob, type JobRow } from "@/lib/job-mapper";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailsPage({ params }: Props) {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const { data: row, error } = await insforge
    .database.from("jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !row) {
    notFound();
  }

  const job = mapRowToJob(row as JobRow);

  return (
    <>
      <AppNavbar />
      <main className="mx-auto flex max-w-360 flex-col gap-6 p-8">
        <Link
          href="/find-jobs"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft className="size-4" />
          Back to Jobs
        </Link>

        <JobInfo job={job} />
        <MatchScore job={job} />
        <JobDescription job={job} />
        <CompanyResearch job={job} />
        <JobActions job={job} />
      </main>
    </>
  );
}
