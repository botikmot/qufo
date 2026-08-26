"use client";

import {
  usePathname,
} from "next/navigation";

import {
  AppNavItem,
} from "@/components/app/app-nav-item";

import {
  APP_NAVIGATION,
  PLATFORM_ADMIN_NAVIGATION,
} from "@/constants/app-navigation";

import {
  isNavigationActive,
} from "@/utils/navigation";

import {
  usePlatformRole,
} from "@/hooks/use-platform-role";

type AppNavigationProps = {
  onNavigate?: () => void;
};

export function AppNavigation({
  onNavigate,
}: AppNavigationProps) {
  const pathname =
    usePathname();

   const {
    isSuperAdmin,
  } = usePlatformRole();

   const navigation =
    isSuperAdmin
      ? [
          ...APP_NAVIGATION,
          PLATFORM_ADMIN_NAVIGATION,
        ]
      : APP_NAVIGATION;

  return (
    <nav className="space-y-1">
      {navigation.map(
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