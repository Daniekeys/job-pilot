import { NextResponse } from "next/server";
import { getPath } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

import { createInsforgeServer } from "@/lib/insforge-server";
import { extractProfileFromResume } from "@/agent/extractor";

const MIN_EXTRACTABLE_TEXT_LENGTH = 50;
const MAX_EXTRACTABLE_TEXT_LENGTH = 25_000;

// pdfjs-dist (used internally by pdf-parse) can't resolve its worker script inside
// Turbopack's server bundle by default — pointing it at the real on-disk file fixes it.
PDFParse.setWorker(getPath());

export async function POST() {
  try {
    const insforge = await createInsforgeServer();
    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to extract a resume." },
        { status: 401 },
      );
    }

    const { data: profileRow } = await insforge.database
      .from("profiles")
      .select("resume_pdf_url")
      .eq("id", user.id)
      .single();
    const path = profileRow?.resume_pdf_url ?? `${user.id}/resume.pdf`;
    const { data: blob, error: downloadError } = await insforge.storage
      .from("resumes")
      .download(path);
    if (downloadError || !blob) {
      console.error("[api/resume/extract]", downloadError);
      return NextResponse.json(
        { success: false, error: "No resume found to extract from." },
        { status: 404 },
      );
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    let text = "";
    try {
      const pdfData = await parser.getText();
      text = pdfData.text.trim();
    } finally {
      await parser.destroy();
    }

    if (text.length < MIN_EXTRACTABLE_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not extract text from this PDF. Please try a different file.",
        },
        { status: 422 },
      );
    }

    if (text.length > MAX_EXTRACTABLE_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This resume is too long to process. Please upload a shorter PDF.",
        },
        { status: 413 },
      );
    }

    const result = await extractProfileFromResume(text);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("[api/resume/extract]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
