"use client";

import {
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  clearAuthSession,
} from "@/lib/auth-storage";

import type {
  AuthSession,
} from "@/types/auth";
import { apiFetch } from "@/lib/api";

export function AppTopbar({
  session,
}: {
  session: AuthSession;
}) {
  const router = useRouter();

  async function logout() {
    try {
      await apiFetch(
        "/auth/logout",
        {
          method: "POST",
          requireAuth: false,
        },
      );
    } finally {
      clearAuthSession();

      router.replace(
        "/login",
      );
    }
  }

  const initial =
    session.user.name
      .charAt(0)
      .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--qufo-border)] bg-[var(--qufo-topbar)] backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between px-5 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <span className="font-semibold tracking-tight">
            QUFO
          </span>
        </div>

        <div className="hidden lg:block">
          <p className="text-xs text-zinc-600">
            Quick Flow Workspace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative flex size-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-200"
          >
            <Bell
              size={18}
              strokeWidth={1.8}
            />

            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-emerald-400" />
          </button>

          <div className="mx-2 h-6 w-px bg-zinc-900" />

          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-[#1D3048] bg-[#0C192B] text-sm font-medium text-emerald-400">
              {initial}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-40 truncate text-sm font-medium text-zinc-200">
                {session.user.name}
              </p>

              <p className="max-w-40 truncate text-xs text-zinc-600">
                {session.user.email}
              </p>
            </div>

            <ChevronDown
              size={14}
              className="hidden text-zinc-600 sm:block"
            />
          </div>

          <button
            type="button"
            onClick={logout}
            title="Sign out"
            className="ml-1 flex size-9 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-red-950/40 hover:text-red-400"
          >
            <LogOut
              size={17}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>
    </header>
  );
}