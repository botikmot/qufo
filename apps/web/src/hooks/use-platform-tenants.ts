"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getPlatformTenants,
} from "@/services/platform-admin.service";

import type {
  PlatformSubscriptionStatus,
  PlatformTenantsResponse,
} from "@/types/platform-admin";

export function usePlatformTenants() {
  const [
    data,
    setData,
  ] =
    useState<PlatformTenantsResponse | null>(
      null,
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] =
    useState<PlatformSubscriptionStatus | "ALL">(
      "ALL",
    );

  const [
    page,
    setPage,
  ] = useState(1);

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
   * Initial load only.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadInitialTenants() {
      try {
        const result =
          await getPlatformTenants({
            page: 1,
            limit: 20,
          });

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
          "Failed to load platform tenants:",
          error,
        );

        setError(
          "Unable to load tenants.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialTenants();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadTenants =
    useCallback(
      async (
        nextPage = page,
        nextSearch = search,
        nextStatus = status,
      ) => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await getPlatformTenants({
              search:
                nextSearch.trim() ||
                undefined,

              status:
                nextStatus ===
                "ALL"
                  ? undefined
                  : nextStatus,

              page: nextPage,
              limit: 20,
            });

          setData(result);
        } catch (error) {
          console.error(
            "Failed to load platform tenants:",
            error,
          );

          setError(
            "Unable to load tenants.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        search,
        status,
      ],
    );

  const handleSearch =
    useCallback(async () => {
      setPage(1);

      await loadTenants(
        1,
        search,
        status,
      );
    }, [
      loadTenants,
      search,
      status,
    ]);

  const changeStatus =
    useCallback(
      async (
        value:
          | PlatformSubscriptionStatus
          | "ALL",
      ) => {
        setStatus(value);
        setPage(1);

        await loadTenants(
          1,
          search,
          value,
        );
      },
      [
        loadTenants,
        search,
      ],
    );

  const previousPage =
    useCallback(async () => {
      if (
        !data?.pagination
          .hasPreviousPage
      ) {
        return;
      }

      const nextPage =
        Math.max(
          1,
          page - 1,
        );

      setPage(nextPage);

      await loadTenants(
        nextPage,
        search,
        status,
      );
    }, [
      data,
      loadTenants,
      page,
      search,
      status,
    ]);

  const nextPage =
    useCallback(async () => {
      if (
        !data?.pagination
          .hasNextPage
      ) {
        return;
      }

      const newPage =
        page + 1;

      setPage(newPage);

      await loadTenants(
        newPage,
        search,
        status,
      );
    }, [
      data,
      loadTenants,
      page,
      search,
      status,
    ]);

  return {
    tenants:
      data?.tenants ?? [],

    pagination:
      data?.pagination ?? null,

    search,
    status,
    page,

    loading,
    error,

    setSearch,
    handleSearch,
    changeStatus,
    previousPage,
    nextPage,

    refresh: () =>
      loadTenants(
        page,
        search,
        status,
      ),
  };
}