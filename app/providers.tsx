"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

import { insforge } from "@/lib/insforge-client";
import { POSTHOG_LAST_IDENTIFIED_USER_KEY } from "@/lib/utils";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!pathname) return;
    const url =
      window.origin +
      pathname +
      (searchParams.toString() ? `?${searchParams.toString()}` : "");
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

// Reconciles PostHog's identity with the InsForge session on every navigation —
// there is no single client-side "login" or "logout" event in this app since
// OAuth sign-in/sign-out are server-driven redirects (Server Action → route handler).
function PostHogIdentify() {
  const pathname = usePathname();
  const ph = usePostHog();

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      const lastUserId = localStorage.getItem(POSTHOG_LAST_IDENTIFIED_USER_KEY);
      const currentUserId = data.user?.id ?? null;

      if (currentUserId && currentUserId !== lastUserId) {
        ph.identify(currentUserId);
        localStorage.setItem(POSTHOG_LAST_IDENTIFIED_USER_KEY, currentUserId);
      } else if (!currentUserId && lastUserId) {
        ph.reset();
        localStorage.removeItem(POSTHOG_LAST_IDENTIFIED_USER_KEY);
      }
    });
  }, [pathname, ph]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
