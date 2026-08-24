"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getPlatformAdminDashboard,
} from "@/services/platform-admin.service";

import type {
  PlatformAdminDashboardResponse,
} from "@/types/platform-admin";

export function usePlatformAdminDashboard() {
  const [
    data,
    setData,
  ] =
    useState<PlatformAdminDashboardResponse | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /*
   * Initial dashboard load.
   *
   * We don't call setLoading(true)
   * here because loading already
   * starts as true.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadInitialDashboard() {
      try {
        const result =
          await getPlatformAdminDashboard();

        if (cancelled) {
          return;
        }

        setData(result);
        setError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load platform admin dashboard:",
          error,
        );

        setError(
          "Unable to load platform dashboard.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Manual refresh.
   *
   * This is called from a button/event,
   * so setting loading state here is fine.
   */
  const refresh =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getPlatformAdminDashboard();

        setData(result);
      } catch (error) {
        console.error(
          "Failed to refresh platform admin dashboard:",
          error,
        );

        setError(
          "Unable to refresh platform dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  return {
    data,
    loading,
    error,
    refresh,
  };
}