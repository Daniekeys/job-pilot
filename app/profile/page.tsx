import { redirect } from "next/navigation";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  createEmptyProfile,
  mapRowToProfile,
  type ProfileRow,
} from "@/lib/profile-mapper";
import { getProfileCompletion } from "@/lib/utils";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { data: row, error } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = row
    ? mapRowToProfile(row as ProfileRow)
    : createEmptyProfile(user.id, user.email ?? "");
  if (error || !row) {
    console.error("[app/profile/page]", error);
  }
  const { percentage, missingFields } = getProfileCompletion(profile);

  // resume_pdf_url stores the storage path, not a fetchable URL — the resumes bucket is
  // private, so a fresh signed URL must be minted on every render instead.
  let resumeViewUrl: string | null = null;
  if (profile.resumePdfUrl) {
    const { data: signed } = await insforge.storage
      .from("resumes")
      .createSignedUrl(profile.resumePdfUrl);
    resumeViewUrl = signed?.signedUrl ?? null;
  }

  const showCompletionIndicator = percentage < 100 || missingFields.length > 0;

  return (
    <>
      <AppNavbar userEmail={user.email ?? ""} />
      <main className="mx-auto flex max-w-360 flex-col gap-6 p-8">
        {showCompletionIndicator && (
          <CompletionIndicator
            percentage={percentage}
            missingFields={missingFields}
          />
        )}
        <ProfileEditor initialProfile={profile} resumeViewUrl={resumeViewUrl} />
      </main>
    </>
  );
}
