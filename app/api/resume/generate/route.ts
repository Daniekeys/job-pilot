import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { createInsforgeServer } from "@/lib/insforge-server";
import { mapRowToProfile, type ProfileRow } from "@/lib/profile-mapper";
import { generateResumeContent } from "@/agent/resume-generator";
import { ResumeDocument } from "@/agent/resume-pdf";

const RESUME_VIEW_URL_TTL_SECONDS = 60 * 60 * 24;

export async function POST() {
  try {
    const insforge = await createInsforgeServer();
    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "You must be signed in to generate a resume." }, { status: 401 });
    }

    const { data: row, error: fetchError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (fetchError || !row) {
      console.error("[api/resume/generate]", fetchError);
      return NextResponse.json({ success: false, error: "Could not load your profile." }, { status: 500 });
    }

    const profile = mapRowToProfile(row as ProfileRow);
    if (profile.fullName.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Add your name and details to your profile before generating a resume." },
        { status: 422 },
      );
    }

    const contentResult = await generateResumeContent(profile);
    if (!contentResult.success) {
      return NextResponse.json({ success: false, error: contentResult.error }, { status: 502 });
    }

    // Called as a plain function, not JSX — renderToBuffer's types require the literal
    // <Document> element it returns, not a wrapper component element.
    const buffer = await renderToBuffer(ResumeDocument({ profile, content: contentResult.data }));

    const path = `${user.id}/resume.pdf`;
    const bucket = insforge.storage.from("resumes");
    await bucket.remove(path);
    // Buffer.buffer is typed as ArrayBufferLike (may be a SharedArrayBuffer) — copy into a
    // fresh Uint8Array so its backing buffer is a plain ArrayBuffer, satisfying BlobPart.
    const { data: uploaded, error: uploadError } = await bucket.upload(path, new Blob([new Uint8Array(buffer)], { type: "application/pdf" }));
    if (uploadError || !uploaded) {
      console.error("[api/resume/generate]", uploadError);
      return NextResponse.json({ success: false, error: "Failed to save generated resume." }, { status: 500 });
    }

    const { error: updateError } = await insforge.database.from("profiles").update({ resume_pdf_url: path }).eq("id", user.id);
    if (updateError) {
      console.error("[api/resume/generate]", updateError);
      return NextResponse.json({ success: false, error: "Failed to save generated resume." }, { status: 500 });
    }

    const { data: signed, error: signError } = await bucket.createSignedUrl(path, RESUME_VIEW_URL_TTL_SECONDS);
    if (signError || !signed) {
      console.error("[api/resume/generate]", signError);
      return NextResponse.json({ success: false, error: "Resume generated, but failed to create a preview link." }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: signed.signedUrl });
  } catch (error) {
    console.error("[api/resume/generate]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
