import { Check, Sparkles, X } from "lucide-react";

import type { Job } from "@/types";

type Props = {
  job: Job;
};

export function MatchScore({ job }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-lightest">
            <Sparkles className="size-4 text-success" />
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            AI Match Reasoning
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-text-primary">
          {job.matchReason}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Required Skills vs Your Profile
        </h2>

        {job.matchedSkills.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm text-text-muted">You have</p>
            <div className="flex flex-wrap gap-2">
              {job.matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full bg-success-lightest px-3 py-1.5 text-sm font-medium text-success-foreground"
                >
                  <Check className="size-3.5" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.missingSkills.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-text-muted">Gap skills</p>
            <div className="flex flex-wrap gap-2">
              {job.missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-muted px-3 py-1.5 text-sm font-medium text-accent"
                >
                  <X className="size-3.5" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.matchedSkills.length === 0 && job.missingSkills.length === 0 && (
          <p className="text-sm text-text-muted">
            No skill match data is available for this job yet.
          </p>
        )}
      </div>
    </div>
  );
}
