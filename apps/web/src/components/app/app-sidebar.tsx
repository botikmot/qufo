"use client";

import Link from "next/link";

import {
  BriefcaseBusiness,
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import type {
  LucideIcon,
} from "lucide-react";

import type {
  AuthSession,
} from "@/types/auth";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    label: "Quotations",
    href: "/quotations",
    icon: FileText,
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
];

export function AppSidebar({
  session,
}: {
  session: AuthSession;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[var(--qufo-border)] bg-[var(--qufo-sidebar)] backdrop-blur-2xl lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-[var(--qufo-border)] px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <QufoMark />

          <div>
            <div className="text-lg font-semibold tracking-tight text-white">
              QUFO
            </div>

            <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-600">
              Quick Flow
            </div>
          </div>
        </Link>
      </div>

      <div className="px-4 py-5">
        <div className="qufo-surface-soft rounded-xl px-3 py-3">
          <p className="truncate text-sm font-medium text-zinc-200">
            {
              session.organization
                .name
            }
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400" />

            <span className="text-xs text-zinc-500">
              {
                session.organization
                  .role
              }
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                pathname ===
                  item.href ||
                pathname.startsWith(
                  `${item.href}/`,
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-cyan-400/[0.07] text-white"
                      : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-200"
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex size-8 items-center justify-center rounded-lg transition",
                      active
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "text-slate-500 group-hover:text-slate-300"
                    ].join(" ")}
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  {item.label}

                  {active && (
                    <span className="ml-auto size-1.5 rounded-full bg-emerald-400" />
                  )}
                </Link>
              );
            },
          )}
        </div>
      </nav>

      <div className="border-t border-[#17263A] p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-200"
        >
          <div className="flex size-8 items-center justify-center">
            <Settings
              size={17}
              strokeWidth={1.8}
            />
          </div>

          Settings
        </Link>

        <div className="mt-3 px-3 pb-2 text-[10px] text-zinc-700">
          QUFO · Move work forward.
        </div>
      </div>
    </aside>
  );
}

function QufoMark() {
  return (
    <div className="relative flex size-10 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/20 bg-zinc-900">
      <div className="absolute -left-2 -top-2 size-8 rounded-full bg-emerald-500/15 blur-lg" />

      <div className="absolute -bottom-3 -right-2 size-8 rounded-full bg-cyan-500/10 blur-lg" />

      <span className="relative text-lg font-semibold text-emerald-400">
        Q
      </span>

      <span className="absolute bottom-1.5 right-1.5 size-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
    </div>
  );
}