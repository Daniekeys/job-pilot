import { NextResponse } from "next/server";

import { createInsforgeServer } from "@/lib/insforge-server";

export async function GET() {
  try {
    const insforge = await createInsforgeServer();
    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "You must be signed in to download your resume." }, { status: 401 });
    }

    const path = `${user.id}/resume.pdf`;
    const { data: blob, error } = await insforge.storage.from("resumes").download(path);
    if (error || !blob) {
      console.error("[api/resume/download]", error);
      return NextResponse.json({ success: false, error: "No resume found to download." }, { status: 404 });
    }

    // Setting Content-Disposition here (rather than relying on the browser's `download`
    // attribute on a link to InsForge's storage origin) is what makes the download work
    // reliably — the `download` attribute is ignored on cross-origin links unless the
    // remote response itself sets this header, which we don't control on InsForge's side.
    const buffer = await blob.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error("[api/resume/download]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
