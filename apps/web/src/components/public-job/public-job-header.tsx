"use client";

import {
  MapPin,
  RefreshCcw,
} from "lucide-react";

import type {
  PublicJob,
} from "@/types/job";

type PublicJobHeaderProps = {
  job: PublicJob;
  refreshing: boolean;
  onRefresh: () => void;
};

export function PublicJobHeader({
  job,
  refreshing,
  onRefresh,
}: PublicJobHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/15 bg-[var(--qufo-surface)]">
          <div className="absolute -left-3 -top-3 size-10 rounded-full bg-cyan-400/10 blur-xl" />

          <div className="absolute -bottom-4 -right-3 size-10 rounded-full bg-emerald-400/10 blur-xl" />

          <MapPin
            size={19}
            className="relative text-cyan-300"
          />
        </div>

        <div>
          <p className="text-lg font-semibold text-white">
            {job.organization.name}
          </p>

          <p className="text-xs uppercase tracking-[0.22em] text-slate-600">
            Powered by QUFO
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="flex w-fit items-center gap-2 rounded-xl border border-[var(--qufo-border)] px-3.5 py-2 text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
      >
        <RefreshCcw
          size={14}
          className={
            refreshing
              ? "animate-spin"
              : ""
          }
        />

        Refresh status
      </button>
    </header>
  );
}