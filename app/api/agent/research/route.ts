import { NextRequest, NextResponse } from "next/server";

import { researchCompany } from "@/agent/company-research";
import { createInsforgeServer } from "@/lib/insforge-server";
import { mapRowToJob, type JobRow } from "@/lib/job-mapper";
import { mapRowToProfile, type ProfileRow } from "@/lib/profile-mapper";
import { getPostHogServer } from "@/lib/posthog-server";

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "You must be signed in to research a company." }, { status: 401 });
    }

    const body = await req.json();
    const jobId = typeof body.jobId === "string" ? body.jobId : "";
    if (jobId === "") {
      return NextResponse.json({ success: false, error: "Missing job id." }, { status: 422 });
    }

    const { data: jobRow, error: jobError } = await insforge.database
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();
    if (jobError || !jobRow) {
      return NextResponse.json({ success: false, error: "Job not found." }, { status: 404 });
    }
    const job = mapRowToJob(jobRow as JobRow);

    const { data: profileRow, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileError || !profileRow) {
      console.error("[api/agent/research]", profileError);
      return NextResponse.json({ success: false, error: "Could not load your profile." }, { status: 500 });
    }
    const profile = mapRowToProfile(profileRow as ProfileRow);

    const result = await researchCompany(job, profile, user.id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }

    const { error: updateError } = await insforge.database
      .from("jobs")
      .update({ company_research: result.data })
      .eq("id", jobId)
      .eq("user_id", user.id);
    if (updateError) {
      console.error("[api/agent/research]", updateError);
      return NextResponse.json({ success: false, error: "Failed to save the company research." }, { status: 500 });
    }

    getPostHogServer().capture({
      distinctId: user.id,
      event: "company_researched",
      properties: { userId: user.id, jobId, company: job.company },
    });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("[api/agent/research]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
