"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  dashboardService,
} from "@/services/dashboard.service";

import type {
  DashboardResponse,
} from "@/types/dashboard";

export function useDashboard() {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<DashboardResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    dashboardService
      .getDashboard()
      .then((data) => {
        if (cancelled) {
          return;
        }

        console.log(
          "QUFO DASHBOARD RESPONSE:",
          data,
        );

        setDashboard(data);
      })
      .catch(
        (error: unknown) => {
          if (cancelled) {
            return;
          }

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load dashboard.",
          );
        },
      )
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    setRefreshing(true);
    setError(null);

    try {
      const data =
        await dashboardService.getDashboard();

      setDashboard(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to refresh dashboard.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  return {
    dashboard,
    loading,
    refreshing,
    error,
    refresh,
  };
}