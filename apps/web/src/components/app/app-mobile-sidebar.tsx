"use client";

import {
  X,
} from "lucide-react";

import {
  AppSidebar,
} from "@/components/app/app-sidebar";

import type {
  AppShellOrganization,
  AppShellUser,
} from "@/types/app-shell";

type AppMobileSidebarProps = {
  open: boolean;

  organization:
    AppShellOrganization;

  user: AppShellUser;

  onClose: () => void;

  onLogout: () => void;
};

export function AppMobileSidebar({
  open,
  organization,
  user,
  onClose,
  onLogout,
}: AppMobileSidebarProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      <div className="relative h-full w-[290px] max-w-[85vw] border-r border-[var(--qufo-border)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
        >
          <X size={18} />
        </button>

        <AppSidebar
          organization={
            organization
          }
          user={user}
          onNavigate={onClose}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
}