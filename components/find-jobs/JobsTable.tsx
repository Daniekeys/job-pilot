"use client";

import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { formatRelativeTime } from "@/lib/utils";
import type { Job } from "@/types";

type Props = {
  jobs: Job[];
  hasActiveFilters: boolean;
};

function scoreColorClass(score: number): string {
  if (score >= 90) return "bg-success";
  if (score >= 80) return "bg-info";
  return "bg-warning";
}

function sourceBadgeClass(source: Job["source"]): string {
  return source === "search" ? "bg-info-lightest text-info-foreground" : "bg-surface-secondary text-text-secondary";
}

function sourceLabel(source: Job["source"]): string {
  return source === "search" ? "Search" : "URL";
}

export function JobsTable({ jobs, hasActiveFilters }: Props) {
  const router = useRouter();

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Company
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Role
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Match Score
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Salary Est.
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Source
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Date Found
          </th>
        </tr>
      </thead>
      <tbody>
        {jobs.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-10 text-center text-sm text-text-muted">
              {hasActiveFilters
                ? "No jobs match your filters — try adjusting your search or match filter."
                : "No jobs found yet — search above to get started."}
            </td>
          </tr>
        )}
        {jobs.map((job, index) => (
          <tr
            key={job.id}
            onClick={() => router.push(`/find-jobs/${job.id}`)}
            className={`cursor-pointer hover:bg-surface-secondary ${index < jobs.length - 1 ? "border-b border-border" : ""}`}
          >
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-surface-tertiary">
                  <Building2 className="size-4 text-text-muted" />
                </span>
                <span className="text-sm font-medium text-text-primary">{job.company}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-text-primary">{job.title}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-1 w-24 rounded-full bg-border-light">
                  <div
                    className={`h-1 rounded-full ${scoreColorClass(job.matchScore)}`}
                    style={{ width: `${job.matchScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary">{job.matchScore}%</span>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">{job.salary}</td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sourceBadgeClass(job.source)}`}
              >
                {sourceLabel(job.source)}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-text-muted">{formatRelativeTime(job.foundAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
