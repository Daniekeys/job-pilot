"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";

const selectClass =
  "appearance-none rounded-full border border-border bg-surface py-1.5 pl-3 pr-8 text-sm font-medium text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

const SEARCH_DEBOUNCE_MS = 350;

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

  function navigate(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    next.delete("page");

    const queryString = next.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => navigate({ q: value }),
      SEARCH_DEBOUNCE_MS,
    );
  }

  return (
    <div
      className={`flex items-center gap-3 border-b border-border p-4 transition-opacity ${isPending ? "opacity-60" : ""}`}
    >
      <div className="relative flex-1">
        <label className="sr-only" htmlFor="jobs-filter-query">
          Filter jobs by company or role
        </label>
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <input
          id="jobs-filter-query"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Filter by company or role..."
        />
      </div>

      <div className="relative">
        <label className="sr-only" htmlFor="jobs-filter-match">
          Filter jobs by match level
        </label>
        <select
          id="jobs-filter-match"
          className={selectClass}
          value={searchParams.get("match") ?? "all"}
          onChange={(event) =>
            navigate({
              match: event.target.value === "all" ? null : event.target.value,
            })
          }
        >
          <option value="all">All Matches</option>
          <option value="high">High Match</option>
          <option value="low">Low Match</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      </div>

      <div className="relative">
        <label className="sr-only" htmlFor="jobs-filter-sort">
          Sort jobs
        </label>
        <select
          id="jobs-filter-sort"
          className={selectClass}
          value={searchParams.get("sort") ?? "score"}
          onChange={(event) =>
            navigate({
              sort: event.target.value === "score" ? null : event.target.value,
            })
          }
        >
          <option value="score">Match Score</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      </div>
    </div>
  );
}
