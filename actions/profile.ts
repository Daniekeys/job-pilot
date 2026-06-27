"use server";

import { revalidatePath } from "next/cache";

import { createInsforgeServer } from "@/lib/insforge-server";
import { getProfileCompletion } from "@/lib/utils";
import { getPostHogServer } from "@/lib/posthog-server";
import type { Profile } from "@/types";

const RESUME_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const RESUME_VIEW_URL_TTL_SECONDS = 60 * 60 * 24;

function splitToArray(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

export async function saveProfile(profile: Profile): Promise<{ success: boolean; error?: string }> {
  try {
    const insforge = await createInsforgeServer();
    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();
    if (!user) {
      return { success: false, error: "You must be signed in to save your profile." };
    }

    const { data: existing, error: fetchError } = await insforge.database
      .from("profiles")
      .select("is_complete")
      .eq("id", user.id)
      .single();
    if (fetchError) {
      console.error("[actions/profile]", fetchError);
      return { success: false, error: "Failed to save profile" };
    }

    const { isComplete } = getProfileCompletion(profile);

    const { error: updateError } = await insforge.database
      .from("profiles")
      .update({
        full_name: profile.fullName,
        phone: profile.phone,
        location: profile.location,
        linkedin_url: profile.linkedinUrl,
        portfolio_url: profile.portfolioUrl,
        work_authorization: profile.workAuthorization || null,
        current_title: profile.currentTitle,
        experience_level: profile.experienceLevel || null,
        years_experience: profile.yearsExperience === "" ? null : profile.yearsExperience,
        skills: profile.skills,
        industries: profile.industries,
        work_experience: profile.workExperience,
        education: profile.education,
        job_titles_seeking: splitToArray(profile.jobTitlesSeeking),
        remote_preference: profile.remotePreference || null,
        salary_expectation: profile.salaryExpectation || null,
        preferred_locations: splitToArray(profile.preferredLocations),
        is_complete: isComplete,
      })
      .eq("id", user.id);
    if (updateError) {
      console.error("[actions/profile]", updateError);
      return { success: false, error: "Failed to save profile" };
    }

    if (isComplete && !existing?.is_complete) {
      getPostHogServer().capture({
        distinctId: user.id,
        event: "profile_completed",
        properties: { userId: user.id },
      });
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("[actions/profile]", error);
    return { success: false, error: "Failed to save profile" };
  }
}

export async function uploadResume(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (file.type !== "application/pdf") {
      return { success: false, error: "Please upload a PDF file." };
    }
    if (file.size > RESUME_MAX_SIZE_BYTES) {
      return { success: false, error: "File is too large. Maximum size is 5MB." };
    }

    const insforge = await createInsforgeServer();
    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();
    if (!user) {
      return { success: false, error: "You must be signed in to upload a resume." };
    }

    const path = `${user.id}/resume.pdf`;
    const bucket = insforge.storage.from("resumes");

    await bucket.remove(path);
    const { data, error: uploadError } = await bucket.upload(path, file);
    if (uploadError || !data) {
      console.error("[actions/profile]", uploadError);
      return { success: false, error: "Failed to upload resume" };
    }

    // resumes is a private bucket — upload()'s url isn't browser-fetchable without a
    // bearer token, so we store the storage path and mint a signed URL on demand instead.
    const { error: updateError } = await insforge.database
      .from("profiles")
      .update({ resume_pdf_url: path })
      .eq("id", user.id);
    if (updateError) {
      console.error("[actions/profile]", updateError);
      return { success: false, error: "Failed to upload resume" };
    }

    const { data: signed, error: signError } = await bucket.createSignedUrl(path, RESUME_VIEW_URL_TTL_SECONDS);
    if (signError || !signed) {
      console.error("[actions/profile]", signError);
      return { success: false, error: "Resume uploaded, but failed to generate a preview link" };
    }

    revalidatePath("/profile");
    return { success: true, url: signed.signedUrl };
  } catch (error) {
    console.error("[actions/profile]", error);
    return { success: false, error: "Failed to upload resume" };
  }
}
