type DotColor = "accent" | "info" | "success";

type Activity = {
  text: string;
  timestamp: string;
  dot: DotColor;
};

const ACTIVITIES: Activity[] = [
  { text: "Found 8 jobs for Frontend Engineer", timestamp: "10 mins ago", dot: "accent" },
  { text: "Researched Stripe", timestamp: "1 hour ago", dot: "info" },
  { text: "Found 12 jobs for React Developer", timestamp: "2 hours ago", dot: "success" },
  { text: "Researched Vercel", timestamp: "Yesterday", dot: "accent" },
  { text: "Found 10 jobs for Full Stack Engineer", timestamp: "Yesterday", dot: "success" },
];

const DOT_RING_CLASS: Record<DotColor, string> = {
  accent: "bg-accent-light",
  info: "bg-info-light",
  success: "bg-success-light",
};

const DOT_INNER_CLASS: Record<DotColor, string> = {
  accent: "bg-accent",
  info: "bg-info",
  success: "bg-success-alt",
};

export function RecentActivity() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
      <ul className="mt-4 divide-y divide-border">
        {ACTIVITIES.map((activity, index) => (
          <li key={index} className="flex items-start gap-3 py-3 first:pt-4">
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
    </div>
  );
}
