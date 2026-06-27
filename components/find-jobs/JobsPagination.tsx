import Link from "next/link";

type Props = {
  page: number;
  pageSize: number;
  totalCount: number;
  searchParams: { [key: string]: string | string[] | undefined };
};

function buildHref(searchParams: Props["searchParams"], page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    const first = Array.isArray(value) ? value[0] : value;
    if (first) params.set(key, first);
  }
  if (page > 1) params.set("page", String(page));

  const queryString = params.toString();
  return queryString ? `/find-jobs?${queryString}` : "/find-jobs";
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const candidates = [1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total);
  const sorted = [...new Set(candidates)].sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("ellipsis");
    result.push(page);
    previous = page;
  }
  return result;
}

export function JobsPagination({ page, pageSize, totalCount, searchParams }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  const linkClass = "rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary";
  const disabledClass = "rounded-md px-3 py-1.5 text-sm font-medium text-text-muted cursor-not-allowed";

  return (
    <div className="flex items-center justify-between p-4">
      <p className="text-sm text-text-secondary">
        Showing {rangeStart} to {rangeEnd} of {totalCount} results
      </p>

      <div className="flex items-center gap-1">
        {page <= 1 ? (
          <span className={disabledClass}>Previous</span>
        ) : (
          <Link href={buildHref(searchParams, page - 1)} className={linkClass} scroll={false}>
            Previous
          </Link>
        )}

        {getPageNumbers(page, totalPages).map((entry, index) =>
          entry === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-text-muted">
              ...
            </span>
          ) : (
            <Link
              key={entry}
              href={buildHref(searchParams, entry)}
              scroll={false}
              className={
                entry === page
                  ? "rounded-md bg-accent-light px-3 py-1.5 text-sm font-medium text-accent"
                  : linkClass
              }
            >
              {entry}
            </Link>
          ),
        )}

        {page >= totalPages ? (
          <span className={disabledClass}>Next</span>
        ) : (
          <Link href={buildHref(searchParams, page + 1)} className={linkClass} scroll={false}>
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
