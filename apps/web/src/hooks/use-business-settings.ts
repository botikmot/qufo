"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  settingsService,
} from "@/services/settings.service";

import type {
  BusinessSettings,
  UpdateBusinessSettingsData,
} from "@/types/settings";

export function useBusinessSettings() {
  const [
    settings,
    setSettings,
  ] =
    useState<BusinessSettings | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const response =
          await settingsService.getBusiness();

        if (cancelled) {
          return;
        }

        setSettings(response);
        setError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load business settings.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  async function update(
    data: UpdateBusinessSettingsData,
  ) {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response =
        await settingsService.updateBusiness(
          data,
        );

      setSettings(response);

      setSuccess(
        "Business settings updated successfully.",
      );

      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save business settings.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    settings,
    loading,
    saving,
    error,
    success,
    update,
  };
}