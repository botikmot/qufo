import type {
  LucideIcon,
} from "lucide-react";

import {
  Banknote,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export type AppNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const APP_NAVIGATION: AppNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    label: "Quotations",
    href: "/quotations",
    icon: FileText,
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Payments",
    href: "/payments",
    icon: Banknote,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];