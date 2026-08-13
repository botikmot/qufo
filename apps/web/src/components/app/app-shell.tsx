"use client";

import {
  type ReactNode,
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuthSession,
  useHydrated,
} from "@/lib/auth-storage";

import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const router =
    useRouter();

  const hydrated =
    useHydrated();

  const session =
    useAuthSession();

  useEffect(() => {
    if (
      hydrated &&
      !session
    ) {
      router.replace(
        "/login",
      );
    }
  }, [
    hydrated,
    session,
    router,
  ]);

  /*
   * Server render + initial client
   * hydration render are identical.
   */
  if (
    !hydrated ||
    !session
  ) {
    return (
      <div className="qufo-background flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span className="relative flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />

            <span className="relative inline-flex size-3 rounded-full bg-emerald-400" />
          </span>

          Initializing QUFO...
        </div>
      </div>
    );
  }

  return (
    <div className="qufo-background min-h-screen text-[var(--qufo-text)]">
      <AppSidebar
        session={session}
      />

      <div className="min-h-screen lg:pl-64">
        <AppTopbar
          session={session}
        />

        <main className="px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}