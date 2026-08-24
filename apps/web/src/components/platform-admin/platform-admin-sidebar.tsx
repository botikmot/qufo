"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { usePathname } from "next/navigation";

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

export function PlatformAdminSidebar() {
  const pathname =
    usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--qufo-border)] bg-[var(--qufo-sidebar)] lg:flex lg:flex-col">
      <div className="border-b border-[var(--qufo-border)] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
            <ShieldCheck
              size={19}
            />
          </div>

          <div>
            <p className="font-semibold text-white">
              QUFO
            </p>

            <p className="text-xs text-slate-500">
              Platform Admin
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
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
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-emerald-400/[0.08] text-emerald-300"
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200",
                ].join(" ")}
              >
                <Icon
                  size={17}
                />

                {item.label}
              </Link>
            );
          },
        )}
      </nav>

      <div className="border-t border-[var(--qufo-border)] p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
        >
          <ArrowLeft
            size={16}
          />

          Back to workspace
        </Link>
      </div>
    </aside>
  );
}