import type { Job, JobSource } from "@/types";

export type JobRow = {
  id: string;
  run_id: string | null;
  source: JobSource;
  source_url: string | null;
  external_apply_url: string | null;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  about_role: string | null;
  match_score: number | null;
  match_reason: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  found_at: string;
};

export function mapRowToJob(row: JobRow): Job {
  return {
    id: row.id,
    runId: row.run_id,
    source: row.source,
    sourceUrl: row.source_url ?? "",
    externalApplyUrl: row.external_apply_url ?? "",
    title: row.title,
    company: row.company,
    location: row.location ?? "",
    salary: row.salary ?? "Not listed",
    jobType: row.job_type ?? "",
    aboutRole: row.about_role ?? "",
    matchScore: row.match_score ?? 0,
    matchReason: row.match_reason ?? "",
    matchedSkills: row.matched_skills ?? [],
    missingSkills: row.missing_skills ?? [],
    foundAt: row.found_at,
  };
}
