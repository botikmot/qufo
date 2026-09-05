'use client';

import {
  Building2,
  Check,
  ChevronsUpDown,
} from 'lucide-react';

import { AppOrganizationBadge } from '@/components/app/app-organization-badge';

import {
  setActiveOrganization,
  useAuthSession,
  useAvailableOrganizations,
} from '@/lib/auth-storage';

import type { LoginOrganization } from '@/types/auth';

import type { AppShellOrganization } from '@/types/app-shell';

type AppWorkspaceSwitcherProps = {
  fallbackOrganization: AppShellOrganization;
};

export function AppWorkspaceSwitcher({
  fallbackOrganization,
}: AppWorkspaceSwitcherProps) {
  const session = useAuthSession();

  const organizations = useAvailableOrganizations();

  const activeOrganization = session?.organization;

  if (!activeOrganization || organizations.length <= 1) {
    return (
      <AppOrganizationBadge
        name={fallbackOrganization.name}
        role={fallbackOrganization.role ?? undefined}
      />
    );
  }

  function handleSwitch(
    organization: LoginOrganization,
    button: HTMLButtonElement,
  ) {
    button.closest('details')?.removeAttribute('open');

    if (organization.id === activeOrganization?.id) {
      return;
    }

    setActiveOrganization(organization);

    /*
     * Reloading clears page-level caches and reconnects realtime
     * services using the newly selected organization id.
     */
    window.location.assign('/dashboard');
  }

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl border border-[var(--qufo-border)] bg-black/10 p-3 transition hover:border-white/[0.1] hover:bg-white/[0.025] [&::-webkit-details-marker]:hidden">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/[0.08] text-violet-300">
          <Building2 size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-300">
            {activeOrganization.name}
          </p>

          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-600">
            {formatRole(activeOrganization.role)}
          </p>
        </div>

        <ChevronsUpDown
          size={15}
          className="shrink-0 text-slate-600 transition group-open:text-slate-300"
        />
      </summary>

      <div className="absolute inset-x-0 bottom-[calc(100%+0.5rem)] z-[80] overflow-hidden rounded-2xl border border-[var(--qufo-border-strong)] bg-[#071422] p-2 shadow-2xl">
        <div className="px-2 pb-2 pt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600">
          Switch workspace
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {organizations.map((organization) => {
            const active = organization.id === activeOrganization.id;

            return (
              <button
                key={organization.id}
                type="button"
                onClick={(event) =>
                  handleSwitch(organization, event.currentTarget)
                }
                className={[
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                  active
                    ? 'bg-emerald-400/[0.08] text-emerald-200'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                ].join(' ')}
              >
                <div
                  className={[
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    active
                      ? 'bg-emerald-400/[0.1] text-emerald-300'
                      : 'bg-white/[0.04] text-slate-500',
                  ].join(' ')}
                >
                  <Building2 size={14} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {organization.name}
                  </div>

                  <div className="mt-0.5 text-[10px] uppercase tracking-wider opacity-60">
                    {formatRole(organization.role)}
                  </div>
                </div>

                {active && <Check size={15} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </details>
  );
}

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}
