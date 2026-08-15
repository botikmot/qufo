"use client";

import { Menu } from "lucide-react";

import type {
  AppShellOrganization,
} from "@/types/app-shell";

type AppTopbarProps = {
  organization: AppShellOrganization;
  onOpenMenu: () => void;
};

export function AppTopbar({
  organization,
  onOpenMenu,
}: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--qufo-border)] bg-[rgba(5,15,27,0.92)] backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center gap-3 px-4">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-300">
            {organization.name}
          </p>

          {organization.role && (
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-600">
              {organization.role}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}