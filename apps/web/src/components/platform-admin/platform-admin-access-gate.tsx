"use client";

import {
  LoaderCircle,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  usePlatformRole,
} from "@/hooks/use-platform-role";

type PlatformAdminAccessGateProps = {
  children:
    React.ReactNode;
};

export function PlatformAdminAccessGate({
  children,
}: PlatformAdminAccessGateProps) {
  const router =
    useRouter();

  const {
    checking,
    isSuperAdmin,
  } = usePlatformRole();

  useEffect(() => {
    if (checking) {
      return;
    }

    if (!isSuperAdmin) {
      router.replace(
        "/dashboard",
      );
    }
  }, [
    checking,
    isSuperAdmin,
    router,
  ]);

  if (
    checking ||
    !isSuperAdmin
  ) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center bg-[var(--qufo-bg)]">
        <div className="text-center">
          <LoaderCircle
            size={24}
            className="mx-auto animate-spin text-emerald-300"
          />

          <p className="mt-3 text-sm text-slate-500">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  return children;
}