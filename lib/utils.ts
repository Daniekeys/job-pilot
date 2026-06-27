import type { Profile } from "@/types";

export const MATCH_THRESHOLD = 70;

// The only 12 countries Adzuna's API covers — confirmed against their current docs.
// Single source of truth for both the search dropdown (client) and the search route (server).
export const ADZUNA_COUNTRIES: { code: string; label: string }[] = [
  { code: "gb", label: "United Kingdom" },
  { code: "us", label: "United States" },
  { code: "de", label: "Germany" },
  { code: "fr", label: "France" },
  { code: "au", label: "Australia" },
  { code: "nz", label: "New Zealand" },
  { code: "ca", label: "Canada" },
  { code: "in", label: "India" },
  { code: "pl", label: "Poland" },
  { code: "br", label: "Brazil" },
  { code: "at", label: "Austria" },
  { code: "za", label: "South Africa" },
];
export const OAUTH_CODE_VERIFIER_COOKIE = "oauth_code_verifier";
export const POSTHOG_LAST_IDENTIFIED_USER_KEY = "ph_last_identified_user_id";

type ProfileCompletion = {
  percentage: number;
  missingFields: string[];
  isComplete: boolean;
};

const REQUIRED_PROFILE_CHECKS: { label: string; isFilled: (profile: Profile) => boolean }[] = [
  { label: "Full Name", isFilled: (p) => p.fullName.trim() !== "" },
  { label: "Phone", isFilled: (p) => p.phone.trim() !== "" },
  { label: "Location", isFilled: (p) => p.location.trim() !== "" },
  { label: "Current Title", isFilled: (p) => p.currentTitle.trim() !== "" },
  { label: "Experience Level", isFilled: (p) => p.experienceLevel !== "" },
  { label: "Years of Experience", isFilled: (p) => p.yearsExperience !== "" },
  { label: "Skills", isFilled: (p) => p.skills.length > 0 },
  {
    label: "Work Experience",
    isFilled: (p) =>
      p.workExperience.some(
        (role) => role.companyName.trim() !== "" && role.jobTitle.trim() !== "" && role.startDate.trim() !== "",
      ),
  },
  {
    label: "Education",
    isFilled: (p) => p.education.highestDegree.trim() !== "" && p.education.institutionName.trim() !== "",
  },
  { label: "Job Titles Seeking", isFilled: (p) => p.jobTitlesSeeking.trim() !== "" },
  { label: "Remote Preference", isFilled: (p) => p.remotePreference !== "" },
  { label: "Work Authorization", isFilled: (p) => p.workAuthorization !== "" },
];

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getProfileCompletion(profile: Profile): ProfileCompletion {
  const missingFields = REQUIRED_PROFILE_CHECKS.filter((check) => !check.isFilled(profile)).map(
    (check) => check.label,
  );
  const percentage = Math.round(
    ((REQUIRED_PROFILE_CHECKS.length - missingFields.length) / REQUIRED_PROFILE_CHECKS.length) * 100,
  );

  return { percentage, missingFields, isComplete: missingFields.length === 0 };
}
