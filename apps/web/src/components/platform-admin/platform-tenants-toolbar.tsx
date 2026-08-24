"use client";

import {
  Search,
} from "lucide-react";

import type {
  FormEvent,
} from "react";

import type {
  PlatformSubscriptionStatus,
} from "@/types/platform-admin";

type PlatformTenantsToolbarProps = {
  search: string;

  status:
    | PlatformSubscriptionStatus
    | "ALL";

  onSearchChange: (
    value: string,
  ) => void;

  onSearch: () => void;

  onStatusChange: (
    value:
      | PlatformSubscriptionStatus
      | "ALL",
  ) => void;
};

const statuses = [
  "ALL",
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "EXPIRED",
  "CANCELLED",
] as const;

export function PlatformTenantsToolbar({
  search,
  status,
  onSearchChange,
  onSearch,
  onStatusChange,
}: PlatformTenantsToolbarProps) {
  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    onSearch();
  }

  return (
    <div className="qufo-surface mb-5 rounded-2xl p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <form
          onSubmit={
            handleSubmit
          }
          className="relative w-full xl:max-w-md"
        >
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            value={search}
            onChange={(
              event,
            ) =>
              onSearchChange(
                event.target
                  .value,
              )
            }
            placeholder="Search business, owner, email..."
            className="qufo-input qufo-input-with-icon"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          {statuses.map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  onStatusChange(
                    item,
                  )
                }
                className={[
                  "rounded-xl border px-3 py-2 text-xs font-medium transition",
                  status ===
                  item
                    ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                    : "border-[var(--qufo-border)] bg-white/[0.02] text-slate-500 hover:bg-white/[0.05] hover:text-slate-300",
                ].join(
                  " ",
                )}
              >
                {item.replace(
                  "_",
                  " ",
                )}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}