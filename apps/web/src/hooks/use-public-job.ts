"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  jobsService,
} from "@/services/jobs.service";

import type {
  PublicJob,
} from "@/types/job";

export function usePublicJob(
  token: string,
) {
  const [
    job,
    setJob,
  ] =
    useState<PublicJob | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    jobsService
      .getPublicByToken(
        token,
      )
      .then((data) => {
        if (cancelled) {
          return;
        }

        setJob(data);
        setError(null);
      })
      .catch(
        (error: unknown) => {
          if (cancelled) {
            return;
          }

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load job tracking.",
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
  }, [
    token,
  ]);

  async function refreshJob() {
    if (!token) {
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const data =
        await jobsService
          .getPublicByToken(
            token,
          );

      setJob(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to refresh job tracking.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  return {
    job,

    loading,
    refreshing,
    error,

    refreshJob,
  };
}