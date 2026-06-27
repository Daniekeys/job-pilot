export type WorkAuthorization = "citizen" | "permanent_resident" | "visa_required";

export type ExperienceLevel = "junior" | "mid" | "senior" | "lead";

export type RemotePreference = "remote" | "onsite" | "hybrid" | "any";

export type WorkExperience = {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
};

export type Education = {
  highestDegree: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
};

export type JobSource = "search" | "url";

export type Job = {
  id: string;
  runId: string | null;
  source: JobSource;
  sourceUrl: string;
  externalApplyUrl: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  jobType: string;
  aboutRole: string;
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  foundAt: string;
};

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: WorkAuthorization | "";
  currentTitle: string;
  experienceLevel: ExperienceLevel | "";
  yearsExperience: number | "";
  skills: string[];
  industries: string[];
  workExperience: WorkExperience[];
  education: Education;
  jobTitlesSeeking: string;
  remotePreference: RemotePreference | "";
  salaryExpectation: string;
  preferredLocations: string;
  resumePdfUrl: string | null;
  isComplete: boolean;
};
