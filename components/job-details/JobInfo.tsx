import { Briefcase, Building2, Calendar, DollarSign, ExternalLink, MapPin, type LucideIcon } from "lucide-react";

import { formatRelativeTime, MATCH_THRESHOLD } from "@/lib/utils";
import type { Job } from "@/types";

type Props = {
  job: Job;
};

const JOB_TYPE_LABELS: Record<string, string> = {
  fulltime: "Full-time",
  parttime: "Part-time",
  contract: "Contract",
};

type InfoCard = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
};

export function JobInfo({ job }: Props) {
  const matchBadgeClass =
    job.matchScore >= MATCH_THRESHOLD
      ? "bg-success-lightest text-success-foreground"
      : "bg-surface-secondary text-text-secondary";

  const infoCards: InfoCard[] = [
    {
      icon: DollarSign,
      iconBg: "bg-success-lightest",
      iconColor: "text-success",
      value: job.salary,
      label: "Salary Est.",
    },
    {
      icon: MapPin,
      iconBg: "bg-info-lightest",
      iconColor: "text-info-medium",
      value: job.location || "—",
      label: "Location",
    },
    {
      icon: Briefcase,
      iconBg: "bg-accent-muted",
      iconColor: "text-accent",
      value: JOB_TYPE_LABELS[job.jobType] ?? "—",
      label: "Job Type",
    },
    {
      icon: Calendar,
      iconBg: "bg-surface-secondary",
      iconColor: "text-text-secondary",
      value: formatRelativeTime(job.foundAt),
      label: "Date Found",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
              <Building2 className="size-7 text-text-muted" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{job.title}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
                <span>{job.company}</span>
                <span>•</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${matchBadgeClass}`}
                >
                  {job.matchScore}% Match Score
                </span>
              </div>
            </div>
          </div>
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary"
          >
            <ExternalLink className="size-4" />
            View Job Post
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {infoCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
          >
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
              <card.icon className={`size-5 ${card.iconColor}`} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary" title={card.value}>
                {card.value}
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{card.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
