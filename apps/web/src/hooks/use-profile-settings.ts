"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  settingsService,
} from "@/services/settings.service";

import type {
  ProfileSettings,
  UpdateProfileSettingsData,
} from "@/types/settings";

export function useProfileSettings() {
  const [
    profile,
    setProfile,
  ] =
    useState<ProfileSettings | null>(
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

    async function fetchProfile() {
      try {
        const response =
          await settingsService.getProfile();

        if (cancelled) {
          return;
        }

        setProfile(response);
        setError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load profile.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function update(
    data: UpdateProfileSettingsData,
  ) {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response =
        await settingsService.updateProfile(
          data,
        );

      setProfile(
        response.profile,
      );

      setSuccess(
        response.message,
      );

      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update profile.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    profile,
    loading,
    saving,
    error,
    success,
    update,
  };
}