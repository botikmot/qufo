"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  PlatformRole,
} from "@/types/auth";

/*
 * Import getAuthSession from the
 * same file currently used by lib/api.
 */
import { getAuthSession } from "@/lib/auth-storage";

export function usePlatformRole() {
  const [
    platformRole,
    setPlatformRole,
  ] =
    useState<
      PlatformRole | null | undefined
    >(undefined);

  useEffect(() => {
    /*
     * Read client-side auth storage
     * after mount.
     *
     * The callback also avoids the
     * set-state-in-effect lint issue
     * we encountered previously.
     */
    const timer =
      window.setTimeout(() => {
        const session =
          getAuthSession();

        setPlatformRole(
          session?.user
            .platformRole ??
            null,
        );
      }, 0);

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, []);

  return {
    platformRole,

    checking:
      platformRole ===
      undefined,

    isSuperAdmin:
      platformRole ===
      "SUPER_ADMIN",
  };
}