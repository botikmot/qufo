"use client";

import {
  AppBrand,
} from "@/components/app/app-brand";

import {
  AppNavigation,
} from "@/components/app/app-navigation";

import {
  AppSidebarFooter,
} from "@/components/app/app-sidebar-footer";

import type {
  AppShellOrganization,
  AppShellUser,
} from "@/types/app-shell";

type AppSidebarProps = {
  organization:
    AppShellOrganization;

  user: AppShellUser;

  onNavigate?: () => void;

  onLogout: () => void;
};

export function AppSidebar({
  organization,
  user,
  onNavigate,
  onLogout,
}: AppSidebarProps) {
  return (
    <aside className="flex h-full flex-col bg-[var(--qufo-surface)]">
      <div className="border-b border-[var(--qufo-border)] px-5 py-5">
        <AppBrand />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <AppNavigation
          onNavigate={
            onNavigate
          }
        />
      </div>

      <AppSidebarFooter
        organization={
          organization
        }
        user={user}
        onLogout={onLogout}
      />
    </aside>
  );
}