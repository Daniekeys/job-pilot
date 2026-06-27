import { Building2, Search } from "lucide-react";

import type { Job } from "@/types";

type Props = {
  job: Job;
};

export function CompanyResearch({ job }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between border-b border-border p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-muted">
            <Building2 className="size-4 text-accent" />
          </span>
          <h2 className="text-base font-semibold text-text-primary">Company Research</h2>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark"
        >
          <Search className="size-4" />
          Research Company
        </button>
      </div>
      <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary">
          <Building2 className="size-6 text-text-muted" />
        </span>
        <p className="text-sm font-medium text-text-primary">No research yet</p>
        <p className="max-w-sm text-sm text-text-muted">
          Click &quot;Research Company&quot; to let the AI browse {job.company}&apos;s public pages and build a
          dossier.
        </p>
      </div>
    </div>
  );
}
