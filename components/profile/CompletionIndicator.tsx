import { AlertCircle } from "lucide-react";

type Props = {
  percentage: number;
  missingFields: string[];
};

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CompletionIndicator({ percentage, missingFields }: Props) {
  const filled = (percentage / 100) * CIRCUMFERENCE;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div>
        <div className="flex items-center gap-2">
          <AlertCircle className="size-5 text-warning" />
          <h2 className="text-base font-semibold text-text-primary">Profile needs attention</h2>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Complete the missing fields to improve your chance of getting tailored matches and
          generating quality resumes.
        </p>
        <div className="mt-3 flex gap-2">
          {missingFields.map((field) => (
            <span
              key={field}
              className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium uppercase text-warning"
            >
              {field}
            </span>
          ))}
        </div>
      </div>

      <div className="relative size-24 shrink-0">
        <svg viewBox="0 0 100 100" className="size-24 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            className="stroke-border-light"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            className="stroke-warning"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE - filled}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-warning">
          {percentage}%
        </div>
      </div>
    </div>
  );
}
