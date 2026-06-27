import type { Education, Profile, WorkExperience } from "@/types";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: Profile["workAuthorization"] | null;
  current_title: string | null;
  experience_level: Profile["experienceLevel"] | null;
  years_experience: number | null;
  skills: string[] | null;
  industries: string[] | null;
  work_experience: WorkExperience[] | null;
  education: Education | null;
  job_titles_seeking: string[] | null;
  remote_preference: Profile["remotePreference"] | null;
  salary_expectation: string | null;
  preferred_locations: string[] | null;
  resume_pdf_url: string | null;
  is_complete: boolean;
};

export function createEmptyProfile(id: string, email: string): Profile {
  return {
    id,
    fullName: "",
    email,
    phone: "",
    location: "",
    linkedinUrl: "",
    portfolioUrl: "",
    workAuthorization: "",
    currentTitle: "",
    experienceLevel: "",
    yearsExperience: "",
    skills: [],
    industries: [],
    workExperience: [],
    education: {
      highestDegree: "",
      fieldOfStudy: "",
      institutionName: "",
      graduationYear: "",
    },
    jobTitlesSeeking: [],
    remotePreference: "",
    salaryExpectation: "",
    preferredLocations: [],
    resumePdfUrl: null,
    isComplete: false,
  };
}

export function mapRowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name ?? "",
    email: row.email,
    phone: row.phone ?? "",
    location: row.location ?? "",
    linkedinUrl: row.linkedin_url ?? "",
    portfolioUrl: row.portfolio_url ?? "",
    workAuthorization: row.work_authorization ?? "",
    currentTitle: row.current_title ?? "",
    experienceLevel: row.experience_level ?? "",
    yearsExperience: row.years_experience ?? "",
    skills: row.skills ?? [],
    industries: row.industries ?? [],
    workExperience: row.work_experience ?? [],
    education: row.education ?? {
      highestDegree: "",
      fieldOfStudy: "",
      institutionName: "",
      graduationYear: "",
    },
    jobTitlesSeeking: row.job_titles_seeking ?? [],
    remotePreference: row.remote_preference ?? "",
    salaryExpectation: row.salary_expectation ?? "",
    preferredLocations: row.preferred_locations ?? [],
    resumePdfUrl: row.resume_pdf_url,
    isComplete: row.is_complete,
  };
}
