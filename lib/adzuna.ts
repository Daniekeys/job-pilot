import { ADZUNA_COUNTRIES } from "./utils";

export type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string; // Adzuna values: "permanent" | "contract"
  contract_time?: string; // Adzuna values: "full_time" | "part_time"
  created: string;
};

// Best-effort keyword match against free-text (e.g. a profile's preferred location) to one of
// Adzuna's 12 supported countries — only used when the user hasn't picked a country explicitly.
const COUNTRY_KEYWORDS: { country: string; keywords: string[] }[] = [
  {
    country: "gb",
    keywords: [
      "uk",
      "u.k.",
      "united kingdom",
      "england",
      "scotland",
      "wales",
      "northern ireland",
      "london",
      "manchester",
      "birmingham",
      "edinburgh",
      "glasgow",
      "bristol",
      "leeds",
    ],
  },
  {
    country: "us",
    keywords: [
      "usa",
      "u.s.a.",
      "united states",
      "america",
      "new york",
      "california",
      "texas",
      "chicago",
      "los angeles",
      "san francisco",
      "seattle",
      "boston",
      "austin",
    ],
  },
  {
    country: "de",
    keywords: [
      "germany",
      "deutschland",
      "berlin",
      "munich",
      "münchen",
      "frankfurt",
      "hamburg",
      "cologne",
      "köln",
      "stuttgart",
    ],
  },
  {
    country: "fr",
    keywords: ["france", "paris", "lyon", "marseille", "toulouse", "nice"],
  },
  {
    country: "au",
    keywords: [
      "australia",
      "sydney",
      "melbourne",
      "brisbane",
      "perth",
      "adelaide",
      "canberra",
    ],
  },
  {
    country: "nz",
    keywords: ["new zealand", "auckland", "wellington", "christchurch"],
  },
  {
    country: "ca",
    keywords: [
      "canada",
      "toronto",
      "vancouver",
      "montreal",
      "calgary",
      "ottawa",
      "quebec",
    ],
  },
  {
    country: "in",
    keywords: [
      "india",
      "bangalore",
      "bengaluru",
      "mumbai",
      "delhi",
      "hyderabad",
      "pune",
      "chennai",
      "noida",
      "gurgaon",
      "gurugram",
    ],
  },
  {
    country: "pl",
    keywords: [
      "poland",
      "warsaw",
      "warszawa",
      "krakow",
      "kraków",
      "wroclaw",
      "wrocław",
    ],
  },
  {
    country: "br",
    keywords: [
      "brazil",
      "brasil",
      "sao paulo",
      "são paulo",
      "rio de janeiro",
      "belo horizonte",
    ],
  },
  {
    country: "at",
    keywords: ["austria", "österreich", "vienna", "wien", "graz", "salzburg"],
  },
  {
    country: "za",
    keywords: [
      "south africa",
      "johannesburg",
      "cape town",
      "durban",
      "pretoria",
    ],
  },
];

// IT-only missed genuinely tech-adjacent roles (UI/UX, product/graphic design) that Adzuna
// files under its own separate "Creative & Design Jobs" category instead of "IT Jobs" — search
// both and merge so a title like "UI/UX Designer" actually returns relevant results.
export const ADZUNA_CATEGORIES = ["it-jobs", "creative-design-jobs"] as const;
const RESULTS_PER_CATEGORY = 5;

export type CountryDetection = { country: string; recognized: boolean };

const REQUEST_TIMEOUT_MS = 15_000;
const COUNTRY_CURRENCY_SYMBOLS: Record<string, string> = {
  gb: "£",
  us: "$",
  de: "€",
  fr: "€",
  au: "A$",
  nz: "NZ$",
  ca: "C$",
  in: "₹",
  pl: "zł",
  br: "R$",
  at: "€",
  za: "R",
};

export function isSupportedCountryCode(code: string): boolean {
  return ADZUNA_COUNTRIES.some((entry) => entry.code === code);
}

export function countryLabel(code: string): string {
  return ADZUNA_COUNTRIES.find((entry) => entry.code === code)?.label ?? code;
}

export function currencySymbolForCountry(code: string): string {
  return COUNTRY_CURRENCY_SYMBOLS[code] ?? "$";
}

// `recognized: false` means the text didn't match any of Adzuna's 12 supported countries,
// not that the search itself failed.
export function detectCountry(locationText: string): CountryDetection {
  const normalized = locationText
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized === "") {
    return { country: "us", recognized: true };
  }
  for (const { country, keywords } of COUNTRY_KEYWORDS) {
    if (
      keywords.some((keyword) => {
        const normalizedKeyword = keyword
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (normalizedKeyword === "") return false;
        const escapedKeyword = normalizedKeyword.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        return new RegExp(`(^|\\s)${escapedKeyword}($|\\s)`).test(normalized);
      })
    ) {
      return { country, recognized: true };
    }
  }
  return { country: "us", recognized: false };
}

// Adzuna's `where` expects a real geocodable place (their own docs example: "london") — there's
// no "remote" support, confirmed against their docs, so location filtering is country-only here.
async function searchCategory(
  jobTitle: string,
  country: string,
  category: string,
): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    throw new Error("ADZUNA_APP_ID and ADZUNA_APP_KEY must both be set");
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: jobTitle,
    category,
    results_per_page: String(RESULTS_PER_CATEGORY),
    "content-type": "application/json",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
      {
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results ?? [];
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Adzuna API request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// Adzuna's `category` only accepts one tag per request — search every category in parallel and
// merge, deduping by id in case the same posting is ever filed under more than one category.
export async function searchJobs(
  jobTitle: string,
  country: string,
): Promise<AdzunaJob[]> {
  const resultsByCategory = await Promise.allSettled(
    ADZUNA_CATEGORIES.map((category) =>
      searchCategory(jobTitle, country, category),
    ),
  );

  const seen = new Map<string, AdzunaJob>();
  let fulfilledCount = 0;
  let failureCount = 0;

  for (const result of resultsByCategory) {
    if (result.status === "fulfilled") {
      fulfilledCount += 1;
      for (const job of result.value) {
        seen.set(job.id, job);
      }
    } else {
      failureCount += 1;
    }
  }

  if (fulfilledCount === 0) {
    throw new Error(
      failureCount > 0
        ? "All Adzuna category requests failed"
        : "No Adzuna jobs returned",
    );
  }

  return [...seen.values()];
}
