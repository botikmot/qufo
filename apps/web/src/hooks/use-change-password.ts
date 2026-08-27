"use client";

import {
  useState,
} from "react";

import {
  settingsService,
} from "@/services/settings.service";

import type {
  ChangePasswordData,
} from "@/types/settings";

export function useChangePassword() {
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

  async function changePassword(
    data: ChangePasswordData,
  ) {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response =
        await settingsService.changePassword(
          data,
        );

      setSuccess(
        response.message,
      );

      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to change password.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    saving,
    error,
    success,
    changePassword,
  };
}