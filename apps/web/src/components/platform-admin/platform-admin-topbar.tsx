"use client";

import {
  Menu,
  ShieldCheck,
} from "lucide-react";

type PlatformAdminTopbarProps = {
  onOpenMenu: () => void;
};

export function PlatformAdminTopbar({
  onOpenMenu,
}: PlatformAdminTopbarProps) {
  return (
    <header
      className="
        sticky
        top-0
        z-40
        w-full
        border-b
        border-[var(--qufo-border)]
        bg-[rgba(5,15,27,0.94)]
        backdrop-blur-xl
        lg:hidden
      "
    >
      <div className="flex h-16 min-w-0 items-center gap-3 px-4">
        <button
          type="button"
          onClick={
            onOpenMenu
          }
          aria-label="Open navigation"
          className="
            flex
            size-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-slate-500
            transition
            hover:bg-white/[0.04]
            hover:text-white
          "
        >
          <Menu size={18} />
        </button>

        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.08] text-emerald-300">
            <ShieldCheck
              size={16}
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-300">
              QUFO
            </p>

            <p className="truncate text-[10px] uppercase tracking-wider text-slate-600">
              Platform Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}