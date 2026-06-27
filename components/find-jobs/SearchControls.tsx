"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, Sparkles, TriangleAlert } from "lucide-react";

import { ADZUNA_COUNTRIES } from "@/lib/utils";
import { filterJobTitles } from "@/lib/job-titles";

type SearchResult = { jobsFound: number; strongMatches: number; message: string };

const BLUR_CLOSE_DELAY_MS = 150;

export function SearchControls() {
  const router = useRouter();
  const pathname = usePathname();
  const [jobTitle, setJobTitle] = useState("");
  const [country, setCountry] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleSearch(titleOverride?: string) {
    if (isSearching) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: titleOverride ?? jobTitle, country }),
      });
      const body = await response.json();

      if (!body.success) {
        setError(body.error ?? "Job search failed. Please try again.");
        return;
      }

      setResult(body.data);
      // A plain refresh() keeps whatever filter/sort/page the table happened to be on — if it was
      // sorted by Match Score with older higher-scoring jobs already filling page 1, or a "High
      // Match" filter was active, freshly found jobs can be 100% real and saved but still invisible
      // without paging/filtering manually. Force sort=newest + reset filters/page so this search's
      // own results are always the first thing visible, no matter what the table was showing before.
      router.push(`${pathname}?sort=newest`);
    } catch {
      setError("Job search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  function handleJobTitleChange(value: string) {
    setJobTitle(value);
    setSuggestions(filterJobTitles(value));
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  }

  function selectSuggestion(title: string) {
    setJobTitle(title);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    handleSearch(title);
  }

  function handleInputBlur() {
    blurTimeoutRef.current = setTimeout(() => setShowSuggestions(false), BLUR_CLOSE_DELAY_MS);
  }

  function handleInputFocus() {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    if (jobTitle.trim() !== "") setSuggestions(filterJobTitles(jobTitle));
    setShowSuggestions(true);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === "Enter") handleSearch();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (highlightedIndex >= 0) selectSuggestion(suggestions[highlightedIndex]);
      else {
        setShowSuggestions(false);
        handleSearch();
      }
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
            Job Title
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              value={jobTitle}
              onChange={(event) => handleJobTitleChange(event.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-controls="job-title-suggestions"
              aria-autocomplete="list"
              autoComplete="off"
              className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Leave blank to use your profile"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul
                id="job-title-suggestions"
                role="listbox"
                className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface py-1 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
              >
                {suggestions.map((title, index) => (
                  <li key={title} role="option" aria-selected={index === highlightedIndex}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSuggestion(title)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                        index === highlightedIndex
                          ? "bg-accent-light text-accent"
                          : "text-text-primary hover:bg-surface-secondary"
                      }`}
                    >
                      <Search className="size-3.5 text-text-muted" />
                      {title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
            Country
          </label>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">Use my profile</option>
            {ADZUNA_COUNTRIES.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => handleSearch()}
          disabled={isSearching}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          {isSearching ? "Searching..." : "Find Jobs"}
        </button>
      </div>

      {result && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-success-lightest px-4 py-2.5 text-sm font-medium text-success-foreground">
          <Sparkles className="size-4" />
          {result.message}
        </div>
      )}
      {error && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-error px-4 py-2.5 text-sm font-medium text-error-foreground">
          <TriangleAlert className="size-4" />
          {error}
        </div>
      )}
    </div>
  );
}
