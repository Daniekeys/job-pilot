export const JOBS_PAGE_SIZE = 20;

export type MatchFilter = "all" | "high" | "low";
export type JobsSort = "score" | "newest" | "oldest";

export type JobsSearchParams = {
  q: string;
  match: MatchFilter;
  sort: JobsSort;
  page: number;
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function parseJobsSearchParams(raw: { [key: string]: string | string[] | undefined }): JobsSearchParams {
  const match = firstValue(raw.match);
  const sort = firstValue(raw.sort);
  const page = Number.parseInt(firstValue(raw.page), 10);

  return {
    q: firstValue(raw.q).trim(),
    match: match === "high" || match === "low" ? match : "all",
    sort: sort === "newest" || sort === "oldest" ? sort : "score",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Escapes ilike wildcards and wraps in double quotes so commas/parens in user input can't break the PostgREST `or()` filter string. */
export function escapeIlikeTerm(term: string): string {
  return term.replace(/[%_]/g, (char) => `\\${char}`);
}
