import type { ReactNode } from 'react';

import { TabsTrigger } from '@/components/ui/tabs';

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
        !h-auto
        !w-full
        min-w-0
        justify-center
        gap-2
        rounded-xl
        px-3
        py-2.5
        text-slate-400
        data-[state=active]:bg-emerald-400/10
        data-[state=active]:text-emerald-300

        md:!w-auto
      "
    >
      <span className="shrink-0">{icon}</span>

      <span className="truncate">{children}</span>
    </TabsTrigger>
  );
}
