"use client";

import {
  usePathname,
} from "next/navigation";

import {
  AppNavItem,
} from "@/components/app/app-nav-item";

import {
  APP_NAVIGATION,
} from "@/constants/app-navigation";

import {
  isNavigationActive,
} from "@/utils/navigation";

type AppNavigationProps = {
  onNavigate?: () => void;
};

export function AppNavigation({
  onNavigate,
}: AppNavigationProps) {
  const pathname =
    usePathname();

  return (
    <nav className="space-y-1">
      {APP_NAVIGATION.map(
        (item) => (
          <AppNavItem
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            active={isNavigationActive(
              pathname,
              item.href,
            )}
            onClick={
              onNavigate
            }
          />
        ),
      )}
    </nav>
  );
}