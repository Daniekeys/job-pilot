// Curated, not exhaustive — covers common titles across the two Adzuna categories this app
// searches (`it-jobs`, `creative-design-jobs`; see ADZUNA_CATEGORIES in lib/adzuna.ts). This is
// purely an autocomplete assist, not a whitelist: free text outside this list still searches fine.
export const SUPPORTED_JOB_TITLES: string[] = [
  "Software Engineer",
  "Senior Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile App Developer",
  "iOS Developer",
  "Android Developer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "Cloud Engineer",
  "Cloud Architect",
  "Solutions Architect",
  "Data Engineer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "AI Engineer",
  "QA Engineer",
  "Test Automation Engineer",
  "Security Engineer",
  "Cybersecurity Analyst",
  "Network Engineer",
  "Systems Administrator",
  "Database Administrator",
  "IT Support Specialist",
  "Technical Lead",
  "Engineering Manager",
  "Product Manager",
  "Scrum Master",
  "Business Analyst",
  "Embedded Systems Engineer",
  "Game Developer",
  "Blockchain Developer",
  "UI/UX Designer",
  "UX Designer",
  "UI Designer",
  "Product Designer",
  "Graphic Designer",
  "Visual Designer",
  "Web Designer",
  "Motion Designer",
  "Brand Designer",
  "Creative Director",
  "Art Director",
  "Illustrator",
  "Interaction Designer",
];

const MAX_SUGGESTIONS = 8;

// Prefix matches rank above plain substring matches, mirroring how search-engine
// autocomplete usually orders results.
export function filterJobTitles(query: string): string[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === "") return [];

  const startsWith: string[] = [];
  const includes: string[] = [];
  for (const title of SUPPORTED_JOB_TITLES) {
    const lower = title.toLowerCase();
    if (lower.startsWith(normalized)) startsWith.push(title);
    else if (lower.includes(normalized)) includes.push(title);
  }

  return [...startsWith, ...includes].slice(0, MAX_SUGGESTIONS);
}
