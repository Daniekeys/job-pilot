import { NextRequest, NextResponse } from "next/server";

import { createInsforgeServer } from "@/lib/insforge-server";
import { mapRowToProfile, type ProfileRow } from "@/lib/profile-mapper";
import { getPostHogServer } from "@/lib/posthog-server";
import { MATCH_THRESHOLD } from "@/lib/utils";
import { countryLabel, detectCountry, isSupportedCountryCode } from "@/lib/adzuna";
import { discoverJobs } from "@/agent/adzuna";

const ADZUNA_SUPPORTED_REGIONS = "UK, US, Germany, France, Australia, New Zealand, Canada, India, Poland, Brazil, Austria, South Africa";

function buildSuccessMessage(
  jobsFound: number,
  strongMatches: number,
  profileLocationText: string,
  countryRecognized: boolean,
): string {
  if (jobsFound === 0) {
    if (profileLocationText !== "" && !countryRecognized) {
      return `Your profile's preferred location ("${profileLocationText}") isn't one of the countries we search yet. Adzuna currently covers: ${ADZUNA_SUPPORTED_REGIONS}. Pick a country from the dropdown to search directly.`;
    }
    return "No jobs found for this search. Try a different title or country.";
  }
  return `Found ${jobsFound} job${jobsFound === 1 ? "" : "s"} and saved ${strongMatches} strong match${strongMatches === 1 ? "" : "es"}.`;
}

function firstCommaItem(value: string): string {
  return value.split(",")[0]?.trim() ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "You must be signed in to search for jobs." }, { status: 401 });
    }

    const body = await req.json();
    const inputJobTitle = typeof body.jobTitle === "string" ? body.jobTitle.trim() : "";
    const inputCountry = typeof body.country === "string" ? body.country.trim().toLowerCase() : "";

    const { data: profileRow, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileError || !profileRow) {
      console.error("[api/agent/find]", profileError);
      return NextResponse.json({ success: false, error: "Could not load your profile." }, { status: 500 });
    }
    const profile = mapRowToProfile(profileRow as ProfileRow);

    // Whatever the user picked always wins. Only fall back to the profile when nothing is selected.
    const jobTitle = inputJobTitle !== "" ? inputJobTitle : firstCommaItem(profile.jobTitlesSeeking) || profile.currentTitle.trim();

    let countryCode: string;
    let countryRecognized: boolean;
    let profileLocationText = "";
    if (inputCountry !== "" && isSupportedCountryCode(inputCountry)) {
      countryCode = inputCountry;
      countryRecognized = true;
    } else {
      profileLocationText = firstCommaItem(profile.preferredLocations);
      const detection = detectCountry(profileLocationText);
      countryCode = detection.country;
      countryRecognized = detection.recognized;
    }

    if (jobTitle === "") {
      return NextResponse.json(
        { success: false, error: "Enter a job title, or add a target title to your profile to search automatically." },
        { status: 422 },
      );
    }

    const { data: run, error: runError } = await insforge.database
      .from("agent_runs")
      .insert([
        {
          user_id: user.id,
          status: "running",
          job_title_searched: jobTitle,
          location_searched: countryLabel(countryCode),
          started_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (runError || !run) {
      console.error("[api/agent/find]", runError);
      return NextResponse.json({ success: false, error: "Failed to start job search." }, { status: 500 });
    }

    getPostHogServer().capture({
      distinctId: user.id,
      event: "job_search_started",
      properties: { userId: user.id, jobTitle, country: countryCode },
    });

    const result = await discoverJobs(jobTitle, countryCode, profile, run.id, user.id);
    if (!result.success || !result.jobs) {
      await insforge.database
        .from("agent_runs")
        .update({ status: "failed", completed_at: new Date().toISOString() })
        .eq("id", run.id);
      return NextResponse.json({ success: false, error: result.error ?? "Job search failed." }, { status: 502 });
    }

    if (result.jobs.length > 0) {
      const { error: insertError } = await insforge.database.from("jobs").insert(
        result.jobs.map((job) => ({
          run_id: run.id,
          user_id: user.id,
          source: job.source,
          source_url: job.sourceUrl,
          external_apply_url: job.externalApplyUrl,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          job_type: job.jobType,
          about_role: job.aboutRole,
          match_score: job.matchScore,
          match_reason: job.matchReason,
          matched_skills: job.matchedSkills,
          missing_skills: job.missingSkills,
          found_at: new Date().toISOString(),
        })),
      );
      if (insertError) {
        console.error("[api/agent/find]", insertError);
        await insforge.database
          .from("agent_runs")
          .update({ status: "failed", completed_at: new Date().toISOString() })
          .eq("id", run.id);
        return NextResponse.json({ success: false, error: "Failed to save discovered jobs." }, { status: 500 });
      }

      for (const job of result.jobs) {
        getPostHogServer().capture({
          distinctId: user.id,
          event: "job_found",
          properties: { userId: user.id, source: job.source, matchScore: job.matchScore },
        });
      }
    }

    await insforge.database
      .from("agent_runs")
      .update({ status: "completed", jobs_found: result.jobs.length, completed_at: new Date().toISOString() })
      .eq("id", run.id);

    const strongMatches = result.jobs.filter((job) => job.matchScore >= MATCH_THRESHOLD).length;
    return NextResponse.json({
      success: true,
      data: {
        jobsFound: result.jobs.length,
        strongMatches,
        message: buildSuccessMessage(result.jobs.length, strongMatches, profileLocationText, countryRecognized),
      },
    });
  } catch (error) {
    console.error("[api/agent/find]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
