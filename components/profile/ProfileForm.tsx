"use client";

import { useState, useTransition, type Dispatch, type SetStateAction } from "react";
import { Plus, X } from "lucide-react";

import { saveProfile } from "@/actions/profile";
import type { Education, ExperienceLevel, Profile, RemotePreference, WorkAuthorization, WorkExperience } from "@/types";

type Props = {
  profile: Profile;
  onChange: Dispatch<SetStateAction<Profile>>;
};

const WORK_AUTHORIZATION_OPTIONS: { value: WorkAuthorization; label: string }[] = [
  { value: "citizen", label: "Citizen" },
  { value: "permanent_resident", label: "Permanent Resident" },
  { value: "visa_required", label: "Visa Required" },
];

const EXPERIENCE_LEVEL_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

const REMOTE_PREFERENCE_OPTIONS: { value: RemotePreference; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "any", label: "Any" },
];

const DEGREE_OPTIONS = ["High School", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD", "Other"];

const MAX_WORK_EXPERIENCE_ROLES = 3;

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-surface-secondary disabled:text-text-muted";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary";
const sectionHeadingClass = "text-base font-semibold text-text-primary";
const fieldGridClass = "grid grid-cols-1 gap-4 md:grid-cols-2";

function emptyWorkExperience(): WorkExperience {
  return { companyName: "", jobTitle: "", startDate: "", endDate: "", isCurrent: false, responsibilities: "" };
}

export function ProfileForm({ profile, onChange: setProfile }: Props) {
  const [skillInput, setSkillInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function handleSave() {
    setStatus(null);
    startTransition(async () => {
      const result = await saveProfile(profile);
      setStatus(
        result.success
          ? { type: "success", message: "Profile saved." }
          : { type: "error", message: result.error ?? "Failed to save profile." },
      );
    });
  }

  function updateField<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function addSkill() {
    const value = skillInput.trim();
    if (!value || profile.skills.includes(value)) return;
    updateField("skills", [...profile.skills, value]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    updateField("skills", profile.skills.filter((s) => s !== skill));
  }

  function addIndustry() {
    const value = industryInput.trim();
    if (!value || profile.industries.includes(value)) return;
    updateField("industries", [...profile.industries, value]);
    setIndustryInput("");
  }

  function removeIndustry(industry: string) {
    updateField("industries", profile.industries.filter((i) => i !== industry));
  }

  function updateWorkExperience(index: number, field: keyof WorkExperience, value: string | boolean) {
    setProfile((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((role, i) =>
        i === index ? { ...role, [field]: value } : role,
      ),
    }));
  }

  function addWorkExperience() {
    if (profile.workExperience.length >= MAX_WORK_EXPERIENCE_ROLES) return;
    setProfile((prev) => ({ ...prev, workExperience: [...prev.workExperience, emptyWorkExperience()] }));
  }

  function updateEducation(field: keyof Education, value: string) {
    setProfile((prev) => ({ ...prev, education: { ...prev.education, [field]: value } }));
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className={sectionHeadingClass}>Profile Information</h2>
      <p className="mt-1 text-sm text-text-secondary">
        This content is used to accurately represent you in agent interactions.
      </p>

      {/* Personal Info */}
      <div className="mt-8">
        <h3 className={sectionHeadingClass}>Personal Info</h3>
        <div className={`mt-4 ${fieldGridClass}`}>
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              className={inputClass}
              value={profile.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} value={profile.email} disabled />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              className={inputClass}
              placeholder="+1 (555) 000-0000"
              value={profile.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              className={inputClass}
              placeholder="City, Country"
              value={profile.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input
              className={inputClass}
              value={profile.linkedinUrl}
              onChange={(e) => updateField("linkedinUrl", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Portfolio/GitHub</label>
            <input
              className={inputClass}
              value={profile.portfolioUrl}
              onChange={(e) => updateField("portfolioUrl", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Work Authorization</label>
            <select
              className={inputClass}
              value={profile.workAuthorization}
              onChange={(e) => updateField("workAuthorization", e.target.value as WorkAuthorization)}
            >
              {WORK_AUTHORIZATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Professional Info */}
      <div className="mt-8">
        <h3 className={sectionHeadingClass}>Professional Info</h3>
        <div className="mt-4">
          <label className={labelClass}>Current/Recent Job Title</label>
          <input
            className={inputClass}
            value={profile.currentTitle}
            onChange={(e) => updateField("currentTitle", e.target.value)}
          />
        </div>
        <div className={`mt-4 ${fieldGridClass}`}>
          <div>
            <label className={labelClass}>Experience Level</label>
            <select
              className={inputClass}
              value={profile.experienceLevel}
              onChange={(e) => updateField("experienceLevel", e.target.value as ExperienceLevel)}
            >
              {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Years of Experience</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={profile.yearsExperience}
              onChange={(e) =>
                updateField("yearsExperience", e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Skills</label>
          <div className="flex gap-2">
            <input
              className={inputClass}
              placeholder="Add a skill"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <button
              type="button"
              onClick={addSkill}
              className="shrink-0 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary"
            >
              Add
            </button>
          </div>
          {profile.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className={labelClass}>Industries Worked In (Optional)</label>
          <div className="flex gap-2">
            <input
              className={inputClass}
              placeholder="E.g. FinTech, Healthcare"
              value={industryInput}
              onChange={(e) => setIndustryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addIndustry();
                }
              }}
            />
            <button
              type="button"
              onClick={addIndustry}
              className="shrink-0 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary"
            >
              Add
            </button>
          </div>
          {profile.industries.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.industries.map((industry) => (
                <span
                  key={industry}
                  className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent"
                >
                  {industry}
                  <button type="button" onClick={() => removeIndustry(industry)} aria-label={`Remove ${industry}`}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Work Experience */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className={sectionHeadingClass}>Work Experience</h3>
          {profile.workExperience.length < MAX_WORK_EXPERIENCE_ROLES && (
            <button
              type="button"
              onClick={addWorkExperience}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark"
            >
              <Plus className="size-4" />
              Add role
            </button>
          )}
        </div>

        {profile.workExperience.map((role, index) => (
          <div key={index} className={index > 0 ? "mt-6 border-t border-border pt-6" : "mt-4"}>
            <div className={fieldGridClass}>
              <div>
                <label className={labelClass}>Company Name</label>
                <input
                  className={inputClass}
                  value={role.companyName}
                  onChange={(e) => updateWorkExperience(index, "companyName", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Job Title</label>
                <input
                  className={inputClass}
                  value={role.jobTitle}
                  onChange={(e) => updateWorkExperience(index, "jobTitle", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Start Date</label>
                <input
                  className={inputClass}
                  placeholder="January 2022"
                  value={role.startDate}
                  onChange={(e) => updateWorkExperience(index, "startDate", e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className={labelClass}>End Date</label>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs text-text-secondary">
                    <input
                      type="checkbox"
                      checked={role.isCurrent}
                      onChange={(e) => updateWorkExperience(index, "isCurrent", e.target.checked)}
                      className="accent-accent"
                    />
                    Currently working here
                  </label>
                </div>
                <input
                  className={inputClass}
                  placeholder={role.isCurrent ? "Present" : ""}
                  value={role.endDate}
                  disabled={role.isCurrent}
                  onChange={(e) => updateWorkExperience(index, "endDate", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelClass}>Key Responsibilities</label>
              <textarea
                className={`${inputClass} min-h-20 resize-none`}
                value={role.responsibilities}
                onChange={(e) => updateWorkExperience(index, "responsibilities", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mt-8">
        <h3 className={sectionHeadingClass}>Education</h3>
        <div className={`mt-4 ${fieldGridClass}`}>
          <div>
            <label className={labelClass}>Highest Degree</label>
            <select
              className={inputClass}
              value={profile.education.highestDegree}
              onChange={(e) => updateEducation("highestDegree", e.target.value)}
            >
              {DEGREE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Field of Study</label>
            <input
              className={inputClass}
              value={profile.education.fieldOfStudy}
              onChange={(e) => updateEducation("fieldOfStudy", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Institution Name</label>
            <input
              className={inputClass}
              placeholder="E.g. State University"
              value={profile.education.institutionName}
              onChange={(e) => updateEducation("institutionName", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Graduation Year</label>
            <input
              className={inputClass}
              placeholder="YYYY"
              value={profile.education.graduationYear}
              onChange={(e) => updateEducation("graduationYear", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Job Preferences */}
      <div className="mt-8">
        <h3 className={sectionHeadingClass}>Job Preferences</h3>
        <div className="mt-4">
          <label className={labelClass}>Job Titles Seeking</label>
          <input
            className={inputClass}
            value={profile.jobTitlesSeeking}
            onChange={(e) => updateField("jobTitlesSeeking", e.target.value)}
          />
        </div>
        <div className={`mt-4 ${fieldGridClass}`}>
          <div>
            <label className={labelClass}>Remote Preference</label>
            <select
              className={inputClass}
              value={profile.remotePreference}
              onChange={(e) => updateField("remotePreference", e.target.value as RemotePreference)}
            >
              {REMOTE_PREFERENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Salary Expectation (Optional)</label>
            <input
              className={inputClass}
              placeholder="E.g. $120k"
              value={profile.salaryExpectation}
              onChange={(e) => updateField("salaryExpectation", e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Preferred Locations (Optional)</label>
          <input
            className={inputClass}
            placeholder="E.g. New York, London"
            value={profile.preferredLocations}
            onChange={(e) => updateField("preferredLocations", e.target.value)}
          />
        </div>
      </div>

      {status && (
        <p className={`mt-4 text-sm ${status.type === "success" ? "text-success" : "text-error"}`}>
          {status.message}
        </p>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={handleSave}
        className="mt-4 w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
