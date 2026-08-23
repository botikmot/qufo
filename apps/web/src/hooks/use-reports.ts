"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  reportsService,
} from "@/services/reports.service";

import type {
  ReportData,
} from "@/types/report";

function toDateInputValue(
  date: Date,
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

function getCurrentMonthRange() {
  const now =
    new Date();

  const from =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

  return {
    from:
      toDateInputValue(
        from,
      ),

    to:
      toDateInputValue(
        now,
      ),
  };
}

export function useReports() {
  const initialRange =
    getCurrentMonthRange();

  const [
    from,
    setFrom,
  ] = useState(
    initialRange.from,
  );

  const [
    to,
    setTo,
  ] = useState(
    initialRange.to,
  );

  const [
    report,
    setReport,
  ] =
    useState<ReportData | null>(
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

  const load =
    useCallback(
      async (
        selectedFrom = from,
        selectedTo = to,
      ) => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await reportsService.getReport(
              {
                from:
                  selectedFrom,
                to:
                  selectedTo,
              },
            );

          setReport(
            response,
          );
        } catch (error) {
          setError(
            error instanceof
              Error
              ? error.message
              : "Unable to load report.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        from,
        to,
      ],
    );

  /*
   * Initial load.
   *
   * Use the initial values directly
   * so we don't synchronously change
   * state inside the effect.
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchInitialReport() {
      try {
        const response =
          await reportsService.getReport(
            {
              from:
                initialRange.from,
              to:
                initialRange.to,
            },
          );

        if (cancelled) {
          return;
        }

        setReport(
          response,
        );

        setError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof
            Error
            ? error.message
            : "Unable to load report.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchInitialReport();

    return () => {
      cancelled = true;
    };
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function applyFilter() {
    await load(
      from,
      to,
    );
  }

  return {
    report,

    from,
    to,

    setFrom,
    setTo,

    loading,
    error,

    applyFilter,
    refresh: load,
  };
}