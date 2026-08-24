"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getPlatformTenant,
  renewPlatformTenant,
} from "@/services/platform-admin.service";

import type {
  PlatformTenantDetail,
} from "@/types/platform-admin";

export function usePlatformTenant(
  tenantId: string,
) {
  const [
    tenant,
    setTenant,
  ] =
    useState<PlatformTenantDetail | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    renewing,
    setRenewing,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    renewOpen,
    setRenewOpen,
  ] = useState(false);

  /*
   * Initial load.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadInitialTenant() {
      try {
        const result =
          await getPlatformTenant(
            tenantId,
          );

        if (cancelled) {
          return;
        }

        setTenant(result);
        setError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load platform tenant:",
          error,
        );

        setError(
          "Unable to load tenant details.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialTenant();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const refresh =
    useCallback(async () => {
      try {
        const result =
          await getPlatformTenant(
            tenantId,
          );

        setTenant(result);
        setError(null);
      } catch (error) {
        console.error(
          "Failed to refresh platform tenant:",
          error,
        );

        setError(
          "Unable to refresh tenant details.",
        );
      }
    }, [tenantId]);

  const renew =
    useCallback(
      async (
        durationMonths: number,
      ) => {
        try {
          setRenewing(true);
          setError(null);

          await renewPlatformTenant(
            tenantId,
            durationMonths,
          );

          /*
           * Reload complete tenant details
           * after successful renewal.
           */
          const updated =
            await getPlatformTenant(
              tenantId,
            );

          setTenant(updated);
          setRenewOpen(false);
        } catch (error) {
          console.error(
            "Failed to renew tenant subscription:",
            error,
          );

          setError(
            "Unable to renew subscription.",
          );

          throw error;
        } finally {
          setRenewing(false);
        }
      },
      [tenantId],
    );

  return {
    tenant,
    loading,
    renewing,
    error,

    renewOpen,

    openRenew: () =>
      setRenewOpen(true),

    closeRenew: () =>
      setRenewOpen(false),

    renew,
    refresh,
  };
}