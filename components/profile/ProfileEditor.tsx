"use client";

import { useState } from "react";

import { ResumeUpload } from "@/components/profile/ResumeUpload";
import { ProfileForm } from "@/components/profile/ProfileForm";
import type { Profile, WorkExperience } from "@/types";

type Props = {
  initialProfile: Profile;
  resumeViewUrl: string | null;
};

function emptyWorkExperience(): WorkExperience {
  return { companyName: "", jobTitle: "", startDate: "", endDate: "", isCurrent: false, responsibilities: "" };
}

function withMinimumWorkExperience(profile: Profile): Profile {
  return {
    ...profile,
    workExperience: profile.workExperience.length ? profile.workExperience : [emptyWorkExperience()],
  };
}

export function ProfileEditor({ initialProfile, resumeViewUrl }: Props) {
  const [profile, setProfile] = useState<Profile>(() => withMinimumWorkExperience(initialProfile));

  function handleExtracted(extracted: Partial<Profile>) {
    setProfile((prev) => withMinimumWorkExperience({ ...prev, ...extracted }));
  }

  return (
    <>
      <ResumeUpload resumePdfUrl={resumeViewUrl} onExtracted={handleExtracted} />
      <ProfileForm profile={profile} onChange={setProfile} />
    </>
  );
}
