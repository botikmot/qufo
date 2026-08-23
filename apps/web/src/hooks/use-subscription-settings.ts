"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  settingsService,
} from "@/services/settings.service";

import type {
  SubscriptionSettings,
} from "@/types/settings";

export function useSubscriptionSettings() {
  const [
    subscription,
    setSubscription,
  ] =
    useState<SubscriptionSettings | null>(
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

  useEffect(() => {
    let cancelled = false;

    async function fetchSubscription() {
      try {
        const response =
          await settingsService.getSubscription();

        if (cancelled) {
          return;
        }

        setSubscription(
          response,
        );

        setError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load subscription.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    subscription,
    loading,
    error,
  };
}