"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, RefreshCw, Search, Sparkles, TriangleAlert } from "lucide-react";

import type { Job } from "@/types";

type Props = {
  job: Job;
};

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-sm leading-relaxed text-text-primary">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-text-muted" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
      {children}
    </div>
  );
}

export function CompanyResearch({ job }: Props) {
  const router = useRouter();
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dossier = job.companyResearch;

  async function handleResearch() {
    if (isResearching) return;
    setIsResearching(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      const body = await response.json();

      if (!body.success) {
        setError(body.error ?? "Company research failed. Please try again.");
        return;
      }

      router.refresh();
    } catch {
      setError("Company research failed. Please try again.");
    } finally {
      setIsResearching(false);
    }
  }

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
          onClick={handleResearch}
          disabled={isResearching}
          className={
            dossier
              ? "inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
              : "inline-flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          }
        >
          {isResearching ? (
            <Loader2 className="size-4 animate-spin" />
          ) : dossier ? (
            <RefreshCw className="size-3.5" />
          ) : (
            <Search className="size-4" />
          )}
          {isResearching ? "Researching..." : dossier ? "Re-research" : "Research Company"}
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-6 inline-flex items-center gap-2 rounded-md bg-error px-4 py-2.5 text-sm font-medium text-error-foreground">
          <TriangleAlert className="size-4" />
          {error}
        </div>
      )}

      {!dossier && !isResearching && (
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
      )}

      {isResearching && (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <Loader2 className="size-6 shrink-0 animate-spin text-accent" />
          <p className="text-sm font-medium text-text-primary">Researching {job.company}...</p>
          <p className="max-w-sm text-sm text-text-muted">
            This can take up to a couple of minutes while the AI browses their site.
          </p>
        </div>
      )}

      {dossier && !isResearching && (
        <div className="flex flex-col gap-6 p-6">
          <Section label="Company Overview">
            <p className="text-sm leading-relaxed text-text-primary">{dossier.companyOverview}</p>
          </Section>

          {dossier.techStack.length > 0 && (
            <Section label="Tech Stack">
              <div className="flex flex-wrap gap-2">
                {dossier.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-full bg-info-lightest px-3 py-1 text-xs font-medium text-info-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {dossier.culture.length > 0 && (
            <Section label="Culture">
              <BulletList items={dossier.culture} />
            </Section>
          )}

          <Section label="Why This Role">
            <p className="text-sm leading-relaxed text-text-primary">{dossier.whyThisRole}</p>
          </Section>

          {dossier.yourEdge.length > 0 && (
            <div className="rounded-xl bg-success-lightest p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="size-4 text-success" />
                <p className="text-xs font-semibold uppercase tracking-wide text-success-foreground">Your Edge</p>
              </div>
              <BulletList items={dossier.yourEdge} />
            </div>
          )}

          {dossier.gapsToAddress.length > 0 && (
            <Section label="Gaps to Address">
              <BulletList items={dossier.gapsToAddress} />
            </Section>
          )}

          {dossier.smartQuestions.length > 0 && (
            <Section label="Smart Questions">
              <BulletList items={dossier.smartQuestions} />
            </Section>
          )}

          {dossier.interviewPrep.length > 0 && (
            <Section label="Interview Prep">
              <BulletList items={dossier.interviewPrep} />
            </Section>
          )}

          {dossier.sources.length > 0 && (
            <Section label="Sources">
              <div className="flex flex-col gap-1">
                {dossier.sources.map((source, index) =>
                  source.startsWith("http") ? (
                    <a
                      key={index}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs text-info-foreground hover:underline"
                    >
                      {source}
                    </a>
                  ) : (
                    <p key={index} className="text-xs text-text-muted">
                      {source}
                    </p>
                  ),
                )}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
