import { AppUserSummary } from '@/components/app/app-user-summary';

import { AppWorkspaceSwitcher } from './app-workspace-switcher';

import type {
  AppShellOrganization,
  AppShellUser,
} from '@/types/app-shell';

type AppSidebarFooterProps = {
  organization: AppShellOrganization;
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
      <AppWorkspaceSwitcher fallbackOrganization={organization} />

      <AppUserSummary user={user} onLogout={onLogout} />
    </div>
  );
}
