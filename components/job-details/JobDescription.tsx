import { FileText } from "lucide-react";

import type { Job } from "@/types";

type Props = {
  job: Job;
};

export function JobDescription({ job }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
          <FileText className="size-4 text-text-secondary" />
        </span>
        <h2 className="text-base font-semibold text-text-primary">Job Description</h2>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-text-primary">{job.aboutRole}</p>
    </div>
  );
}
