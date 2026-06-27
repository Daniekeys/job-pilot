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
  { country: "gb", keywords: ["uk", "u.k.", "united kingdom", "england", "scotland", "wales", "northern ireland", "london", "manchester", "birmingham", "edinburgh", "glasgow", "bristol", "leeds"] },
  { country: "us", keywords: ["usa", "u.s.a.", "united states", "america", "new york", "california", "texas", "chicago", "los angeles", "san francisco", "seattle", "boston", "austin"] },
  { country: "de", keywords: ["germany", "deutschland", "berlin", "munich", "münchen", "frankfurt", "hamburg", "cologne", "köln", "stuttgart"] },
  { country: "fr", keywords: ["france", "paris", "lyon", "marseille", "toulouse", "nice"] },
  { country: "au", keywords: ["australia", "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra"] },
  { country: "nz", keywords: ["new zealand", "auckland", "wellington", "christchurch"] },
  { country: "ca", keywords: ["canada", "toronto", "vancouver", "montreal", "calgary", "ottawa", "quebec"] },
  { country: "in", keywords: ["india", "bangalore", "bengaluru", "mumbai", "delhi", "hyderabad", "pune", "chennai", "noida", "gurgaon", "gurugram"] },
  { country: "pl", keywords: ["poland", "warsaw", "warszawa", "krakow", "kraków", "wroclaw", "wrocław"] },
  { country: "br", keywords: ["brazil", "brasil", "sao paulo", "são paulo", "rio de janeiro", "belo horizonte"] },
  { country: "at", keywords: ["austria", "österreich", "vienna", "wien", "graz", "salzburg"] },
  { country: "za", keywords: ["south africa", "johannesburg", "cape town", "durban", "pretoria"] },
];

// IT-only missed genuinely tech-adjacent roles (UI/UX, product/graphic design) that Adzuna
// files under its own separate "Creative & Design Jobs" category instead of "IT Jobs" — search
// both and merge so a title like "UI/UX Designer" actually returns relevant results.
export const ADZUNA_CATEGORIES = ["it-jobs", "creative-design-jobs"] as const;
const RESULTS_PER_CATEGORY = 5;

export type CountryDetection = { country: string; recognized: boolean };

export function isSupportedCountryCode(code: string): boolean {
  return ADZUNA_COUNTRIES.some((entry) => entry.code === code);
}

export function countryLabel(code: string): string {
  return ADZUNA_COUNTRIES.find((entry) => entry.code === code)?.label ?? code;
}

// `recognized: false` means the text didn't match any of Adzuna's 12 supported countries,
// not that the search itself failed.
export function detectCountry(locationText: string): CountryDetection {
  const normalized = locationText.trim().toLowerCase();
  if (normalized === "") {
    return { country: "us", recognized: true };
  }
  for (const { country, keywords } of COUNTRY_KEYWORDS) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return { country, recognized: true };
    }
  }
  return { country: "us", recognized: false };
}

// Adzuna's `where` expects a real geocodable place (their own docs example: "london") — there's
// no "remote" support, confirmed against their docs, so location filtering is country-only here.
async function searchCategory(jobTitle: string, country: string, category: string): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    what: jobTitle,
    category,
    results_per_page: String(RESULTS_PER_CATEGORY),
    "content-type": "application/json",
  });

  const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`);
  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results ?? [];
}

// Adzuna's `category` only accepts one tag per request — search every category in parallel and
// merge, deduping by id in case the same posting is ever filed under more than one category.
export async function searchJobs(jobTitle: string, country: string): Promise<AdzunaJob[]> {
  const resultsByCategory = await Promise.all(
    ADZUNA_CATEGORIES.map((category) => searchCategory(jobTitle, country, category)),
  );

  const seen = new Map<string, AdzunaJob>();
  for (const job of resultsByCategory.flat()) {
    seen.set(job.id, job);
  }
  return [...seen.values()];
}
