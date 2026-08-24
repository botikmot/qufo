import {
  Activity,
  Building2,
  CalendarClock,
  CircleCheckBig,
  Clock3,
  TriangleAlert,
  UserPlus,
} from "lucide-react";

import type {
  PlatformAdminDashboardStats,
} from "@/types/platform-admin";

type PlatformAdminOverviewProps = {
  stats: PlatformAdminDashboardStats;
};

export function PlatformAdminOverview({
  stats,
}: PlatformAdminOverviewProps) {
  const cards = [
    {
      label: "Total tenants",
      value: stats.totalTenants,
      description:
        "Registered businesses",
      icon: Building2,
    },
    {
      label: "Active",
      value: stats.active,
      description:
        "Active subscriptions",
      icon: CircleCheckBig,
    },
    {
      label: "Trialing",
      value: stats.trialing,
      description:
        "Currently on trial",
      icon: Clock3,
    },
    {
      label: "Expiring soon",
      value: stats.expiringSoon,
      description:
        "Ending within 7 days",
      icon: CalendarClock,
    },
    {
      label: "Expired",
      value: stats.expired,
      description:
        "Subscriptions expired",
      icon: TriangleAlert,
    },
    {
      label: "Past due",
      value: stats.pastDue,
      description:
        "Needs attention",
      icon: Activity,
    },
    {
      label: "New this month",
      value: stats.newThisMonth,
      description:
        "New business signups",
      icon: UserPlus,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon =
          card.icon;

        return (
          <div
            key={card.label}
            className="qufo-surface rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-slate-400">
                  {card.label}
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  {card.value}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  {card.description}
                </p>
              </div>

              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06] text-cyan-300">
                <Icon size={18} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}