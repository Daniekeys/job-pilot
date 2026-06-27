import { redirect } from "next/navigation";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { createInsforgeServer } from "@/lib/insforge-server";
import { mapRowToProfile, type ProfileRow } from "@/lib/profile-mapper";
import { getProfileCompletion } from "@/lib/utils";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { data: row } = await insforge.database.from("profiles").select("*").eq("id", user.id).single();
  const profile = mapRowToProfile(row as ProfileRow);
  const { percentage, missingFields } = getProfileCompletion(profile);

  // resume_pdf_url stores the storage path, not a fetchable URL — the resumes bucket is
  // private, so a fresh signed URL must be minted on every render instead.
  let resumeViewUrl: string | null = null;
  if (profile.resumePdfUrl) {
    const { data: signed } = await insforge.storage.from("resumes").createSignedUrl(profile.resumePdfUrl);
    resumeViewUrl = signed?.signedUrl ?? null;
  }

  return (
    <>
      <AppNavbar />
      <main className="mx-auto flex max-w-[1440px] flex-col gap-6 p-8">
        <CompletionIndicator percentage={percentage} missingFields={missingFields} />
        <ProfileEditor initialProfile={profile} resumeViewUrl={resumeViewUrl} />
      </main>
    </>
  );
}
