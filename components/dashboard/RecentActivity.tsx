import type { ActivityDot, ActivityItem } from "@/lib/recent-activity";

type Props = {
  activities: ActivityItem[];
};

const DOT_RING_CLASS: Record<ActivityDot, string> = {
  info: "bg-info-light",
  success: "bg-success-light",
};

const DOT_INNER_CLASS: Record<ActivityDot, string> = {
  info: "bg-info",
  success: "bg-success-alt",
};

export function RecentActivity({ activities }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
      {activities.length === 0 ? (
        <p className="mt-4 py-6 text-center text-sm text-text-muted">
          No activity yet — search for jobs to get started.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3 py-3 first:pt-4">
              <span
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${DOT_RING_CLASS[activity.dot]}`}
              >
                <span className={`size-2 rounded-full ${DOT_INNER_CLASS[activity.dot]}`} />
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">{activity.text}</p>
                <p className="text-xs text-text-muted">{activity.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
