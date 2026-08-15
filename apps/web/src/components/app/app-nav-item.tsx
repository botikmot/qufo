import Link from "next/link";

import type {
  LucideIcon,
} from "lucide-react";

type AppNavItemProps = {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
  onClick?: () => void;
};

export function AppNavItem({
  label,
  href,
  icon: Icon,
  active,
  onClick,
}: AppNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-cyan-400/[0.09] text-cyan-200"
          : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-200",
      ].join(" ")}
    >
      <Icon
        size={17}
        className={
          active
            ? "text-cyan-300"
            : "text-slate-600 transition group-hover:text-slate-400"
        }
      />

      <span>
        {label}
      </span>
    </Link>
  );
}