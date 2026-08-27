"use client";

import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  AppMobileSidebar,
} from "@/components/app/app-mobile-sidebar";

import {
  AppSidebar,
} from "@/components/app/app-sidebar";

import {
  AppTopbar,
} from "@/components/app/app-topbar";

import {
  LoadingState,
} from "@/components/shared/loading-state";

import {
  WorkspaceReadOnlyBanner,
} from "@/components/shared/workspace-read-only-banner";

import {
  clearAuthSession,
  useHydrated,
} from "@/lib/auth-storage";

import {
  useWorkspaceAccess,
} from "@/hooks/use-workspace-access";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({
  children,
}: AppShellProps) {
  const router =
    useRouter();

  const hydrated =
    useHydrated();

  const {
    session,
    subscriptionStatus,
    readOnly,
  } =
    useWorkspaceAccess();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!session) {
      router.replace(
        "/login",
      );
    }
  }, [
    hydrated,
    session,
    router,
  ]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--qufo-background)]">
        <LoadingState
          label="Loading QUFO..."
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--qufo-background)]">
        <LoadingState
          label="Redirecting..."
        />
      </div>
    );
  }

  console.log('session::', session)

  const shellUser = {
    name:
      session.user.name ||
      session.user.email,

    email:
      session.user.email,

    avatarUrl: session.user.avatarUrl,
  };

  const shellOrganization = {
    name:
      session.organization.name,

    role:
      session.organization.role,
  };

  function handleLogout() {
    clearAuthSession();

    setMobileOpen(
      false,
    );

    router.replace(
      "/login",
    );
  }

  return (
    <div className="min-h-screen bg-[var(--qufo-background)] text-slate-200">
      <div className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-[var(--qufo-border)] lg:block">
        <AppSidebar
          organization={
            shellOrganization
          }
          user={
            shellUser
          }
          onLogout={
            handleLogout
          }
        />
      </div>

      <AppMobileSidebar
        open={mobileOpen}
        organization={
          shellOrganization
        }
        user={
          shellUser
        }
        onClose={() =>
          setMobileOpen(
            false,
          )
        }
        onLogout={
          handleLogout
        }
      />

      <div className="min-h-screen lg:pl-64">
        <AppTopbar
          organization={
            shellOrganization
          }
          onOpenMenu={() =>
            setMobileOpen(
              true,
            )
          }
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {readOnly && (
            <WorkspaceReadOnlyBanner
              status={
                subscriptionStatus
              }
            />
          )}

          {children}
        </main>
      </div>
    </div>
  );
}