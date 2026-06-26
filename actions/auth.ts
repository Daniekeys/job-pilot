"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";

import { OAUTH_CODE_VERIFIER_COOKIE } from "@/lib/utils";

async function getOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${host}`;
}

async function startOAuthSignIn(provider: "google" | "github") {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const origin = await getOrigin();

  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo: `${origin}/callback`,
  });

  if (error || !data.url || !data.codeVerifier) {
    console.error("[actions/auth]", error);
    redirect("/login?error=oauth_failed");
  }

  cookieStore.set(OAUTH_CODE_VERIFIER_COOKIE, data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  redirect(data.url);
}

export async function signInWithGoogle() {
  await startOAuthSignIn("google");
}

export async function signInWithGithub() {
  await startOAuthSignIn("github");
}

export async function signOutAction() {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const { error } = await auth.signOut();

  if (error) {
    console.error("[actions/auth]", error);
  }

  redirect("/login");
}
