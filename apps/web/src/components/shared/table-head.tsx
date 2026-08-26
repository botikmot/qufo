import type {
  ReactNode,
} from "react";

import {
  cn,
} from "@/lib/utils";

type TableHeadProps = {
  children: ReactNode;
  className?: string;
};

export function TableHead({
  children,
  className,
}: TableHeadProps) {
  return (
    <th
      className={cn(
        "px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-600",
        className,
      )}
    >
      {children}
    </th>
  );
}