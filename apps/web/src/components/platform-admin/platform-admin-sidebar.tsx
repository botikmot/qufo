"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

type PlatformAdminSidebarProps = {
  variant?:
    | "desktop"
    | "mobile";

  onNavigate?: () => void;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Tenants",
    href: "/admin/tenants",
    icon: Building2,
  },
];

export function PlatformAdminSidebar({
  variant = "desktop",
  onNavigate,
}: PlatformAdminSidebarProps) {
  const pathname =
    usePathname();

  const mobile =
    variant === "mobile";

  return (
    <aside
      className={[
        "flex h-full w-64 shrink-0 flex-col border-r border-[var(--qufo-border)] bg-[var(--qufo-sidebar)]",
        mobile
          ? "w-full"
          : "hidden lg:flex",
      ].join(" ")}
    >
      {/* Brand */}
      <div className="shrink-0 border-b border-[var(--qufo-border)] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
            <ShieldCheck
              size={19}
            />
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-white">
              QUFO
            </p>

            <p className="text-xs text-slate-500">
              Platform Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              item.href ===
              "/admin"
                ? pathname ===
                  "/admin"
                : pathname.startsWith(
                    item.href,
                  );

            return (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                onClick={
                  onNavigate
                }
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-emerald-400/[0.08] text-emerald-300"
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200",
                ].join(" ")}
              >
                <Icon
                  size={17}
                  className="shrink-0"
                />

                {item.label}
              </Link>
            );
          },
        )}
      </nav>

      {/* Back to workspace */}
      <div className="shrink-0 border-t border-[var(--qufo-border)] p-3">
        <Link
          href="/dashboard"
          onClick={
            onNavigate
          }
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
        >
          <ArrowLeft
            size={16}
            className="shrink-0"
          />

          Back to workspace
        </Link>
      </div>
    </aside>
  );
}