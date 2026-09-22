"use client";

import type { ReactNode } from "react";
import { TabsTrigger } from "@/components/ui/tabs";

type SettingsTabTriggerProps = {
  value: string;
  icon: ReactNode;
  children: ReactNode;
};

export function SettingsTabTrigger({
  value,
  icon,
  children,
}: SettingsTabTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className="
        flex
        h-12
        min-h-12
        w-full
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        border-transparent
        bg-transparent
        px-4
        text-sm
        font-medium
        text-slate-500
        transition-colors

        hover:bg-white/[0.025]
        hover:text-slate-300

        data-[active=true]:!border-cyan-400/10
        data-[active=true]:!bg-cyan-400/[0.08]
        data-[active=true]:!text-cyan-300

        [&[data-active]]:!border-cyan-400/10
        [&[data-active]]:!bg-cyan-400/[0.08]
        [&[data-active]]:!text-cyan-300
      "
    >
      <span className="shrink-0">{icon}</span>

      <span className="truncate">{children}</span>
    </TabsTrigger>
  );
}
