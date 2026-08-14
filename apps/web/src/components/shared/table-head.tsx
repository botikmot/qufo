import type {
  ReactNode,
} from "react";

type TableHeadProps = {
  children: ReactNode;
};

export function TableHead({
  children,
}: TableHeadProps) {
  return (
    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
      {children}
    </th>
  );
}