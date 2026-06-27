"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const COMPANY_RESEARCH_DATA = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 5 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 8 },
  { day: "Fri", count: 12 },
  { day: "Sat", count: 4 },
  { day: "Sun", count: 1 },
];

const JOBS_OVER_TIME_DATA = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 45 },
  { day: "Wed", count: 33 },
  { day: "Thu", count: 58 },
  { day: "Fri", count: 85 },
  { day: "Sat", count: 55 },
  { day: "Sun", count: 15 },
];

const MATCH_SCORE_DATA = [
  { range: "50-60%", count: 4 },
  { range: "60-70%", count: 12 },
  { range: "70-80%", count: 44 },
  { range: "80-90%", count: 62 },
  { range: "90-100%", count: 35 },
];

const axisTick = { fill: "var(--color-text-muted)", fontSize: 12 };

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

export function AnalyticsCharts() {
  return (
    <>
      <ChartCard title="Company Research Activity">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={COMPANY_RESEARCH_DATA}>
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="day"
              tick={axisTick}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} />
            <Bar dataKey="count" fill="var(--color-info)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Jobs Found Over Time">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={JOBS_OVER_TIME_DATA}>
            <defs>
              <linearGradient id="jobsFoundGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="day"
              tick={axisTick}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-accent)"
              strokeWidth={3}
              fill="url(#jobsFoundGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Match Score Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MATCH_SCORE_DATA}>
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="range"
              tick={axisTick}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} />
            <Bar dataKey="count" fill="var(--color-success)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}
