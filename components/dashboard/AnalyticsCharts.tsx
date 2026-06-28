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

import type { AnalyticsData } from "@/lib/dashboard-analytics";

type Props = {
  data: AnalyticsData;
};

const axisTick = { fill: "var(--color-text-muted)", fontSize: 12 };

function ChartCard({
  title,
  isEmpty,
  emptyMessage,
  children,
}: {
  title: string;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {isEmpty ? (
        <div className="mt-4 flex h-64 items-center justify-center text-center text-sm text-text-muted">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-4 h-64">{children}</div>
      )}
    </div>
  );
}

export function AnalyticsCharts({ data }: Props) {
  const hasJobsOverTime = data.jobsOverTime.some((point) => point.count > 0);
  const hasMatchScores = data.matchScoreDistribution.some((bucket) => bucket.count > 0);
  const hasCompanyResearch = data.companyResearchActivity.some((point) => point.count > 0);

  return (
    <>
      <ChartCard
        title="Company Research Activity"
        isEmpty={!hasCompanyResearch}
        emptyMessage="No company research yet — research a company on a job's details page to see this chart."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.companyResearchActivity}>
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
            <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
            <Bar dataKey="count" fill="var(--color-info)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Jobs Found Over Time"
        isEmpty={!hasJobsOverTime}
        emptyMessage="No jobs found yet — run a search on the Find Jobs page to see this chart."
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.jobsOverTime}>
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
            <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
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

      <ChartCard
        title="Match Score Distribution"
        isEmpty={!hasMatchScores}
        emptyMessage="No scored jobs yet — run a search on the Find Jobs page to see this chart."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.matchScoreDistribution}>
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
            <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
            <Bar dataKey="count" fill="var(--color-success)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}
