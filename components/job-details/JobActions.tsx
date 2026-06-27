import type { Job } from "@/types";

type Props = {
  job: Job;
};

export function JobActions({ job }: Props) {
  return (
    <a
      href={job.externalApplyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent-dark"
    >
      Apply Now at {job.company}
    </a>
  );
}
