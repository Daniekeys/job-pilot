import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAuthActions } from "@insforge/sdk/ssr";

import { OAUTH_CODE_VERIFIER_COOKIE } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("insforge_code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError || !code) {
    console.error("[auth/callback]", oauthError || "Missing insforge_code");
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get(OAUTH_CODE_VERIFIER_COOKIE)?.value;
  const auth = createAuthActions({ cookies: cookieStore });

  const { error } = await auth.exchangeOAuthCode(code, codeVerifier);
  cookieStore.delete(OAUTH_CODE_VERIFIER_COOKIE);

  if (error) {
    console.error("[auth/callback]", error);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
