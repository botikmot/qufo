"use client";

import {
  useState,
  type ReactNode,
} from "react";

import {
  PlatformAdminMobileSidebar,
} from "@/components/platform-admin/platform-admin-mobile-sidebar";

import {
  PlatformAdminSidebar,
} from "@/components/platform-admin/platform-admin-sidebar";

import {
  PlatformAdminTopbar,
} from "@/components/platform-admin/platform-admin-topbar";

type PlatformAdminShellProps = {
  children: ReactNode;
};

export function PlatformAdminShell({
  children,
}: PlatformAdminShellProps) {
  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  return (
    <div
      className="
        qufo-background
        min-h-dvh
        w-full
        min-w-0
        bg-[var(--qufo-bg)]
        text-slate-200

        lg:grid
        lg:grid-cols-[16rem_minmax(0,1fr)]
      "
    >
      {/* Desktop */}
      <PlatformAdminSidebar />

      {/* Mobile drawer */}
      <PlatformAdminMobileSidebar
        open={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />

      {/* Workspace */}
      <div className="min-h-dvh w-full min-w-0">
        <PlatformAdminTopbar
          onOpenMenu={() =>
            setMobileOpen(true)
          }
        />

        {children}
      </div>
    </div>
  );
}