import {
  AppOrganizationBadge,
} from "@/components/app/app-organization-badge";

import {
  AppUserSummary,
} from "@/components/app/app-user-summary";

import type {
  AppShellOrganization,
  AppShellUser,
} from "@/types/app-shell";

type AppSidebarFooterProps = {
  organization:
    AppShellOrganization;

  user: AppShellUser;

  onLogout: () => void;
};

export function AppSidebarFooter({
  organization,
  user,
  onLogout,
}: AppSidebarFooterProps) {
  return (
    <div className="space-y-3 border-t border-[var(--qufo-border)] p-4">
      <AppOrganizationBadge
        name={organization.name}
        role={
          organization.role ??
          undefined
        }
      />

      <AppUserSummary
        user={user}
        onLogout={onLogout}
      />
    </div>
  );
}