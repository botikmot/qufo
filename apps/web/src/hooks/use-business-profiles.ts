"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  businessProfilesService,
} from "@/services/business-profiles.service";

import type {
  //BusinessProfile,
  BusinessProfilesResponse,
  CreateBusinessProfileData,
  UpdateBusinessProfileData,
} from "@/types/business-profile";

export function useBusinessProfiles() {
  const [
    data,
    setData,
  ] =
    useState<BusinessProfilesResponse | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    uploadingLogoId,
    setUploadingLogoId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    removingLogoId,
    setRemovingLogoId,
  ] =
    useState<string | null>(
      null,
    );

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

  const load =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await businessProfilesService
              .getAll();

          setData(result);
        } catch (loadError) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load business profiles.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
        try {
        const result =
            await businessProfilesService.getAll();

        if (!cancelled) {
            setData(result);
            setError(null);
        }
        } catch (loadError) {
        if (!cancelled) {
            setError(
            loadError instanceof Error
                ? loadError.message
                : "Unable to load business profiles.",
            );
        }
        } finally {
        if (!cancelled) {
            setLoading(false);
        }
        }
    }

    void initialLoad();

    return () => {
        cancelled = true;
    };
    }, []);

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  async function create(
    profile:
      CreateBusinessProfileData,
  ) {
    clearMessages();

    try {
      setSaving(true);

      await businessProfilesService
        .create(profile);

      await load();

      setSuccess(
        "Business profile created successfully.",
      );

      return true;
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create business profile.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function update(
    id: string,
    profile:
      UpdateBusinessProfileData,
  ) {
    clearMessages();

    try {
      setSaving(true);

      await businessProfilesService
        .update(
          id,
          profile,
        );

      await load();

      setSuccess(
        "Business profile updated successfully.",
      );

      return true;
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update business profile.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(
    id: string,
  ) {
    clearMessages();

    try {
      setSaving(true);

      await businessProfilesService
        .setDefault(id);

      await load();

      setSuccess(
        "Default business updated successfully.",
      );

      return true;
    } catch (defaultError) {
      setError(
        defaultError instanceof Error
          ? defaultError.message
          : "Unable to update the default business.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function useMainAsDefault() {
    clearMessages();

    try {
      setSaving(true);

      await businessProfilesService
        .useMainBusinessAsDefault();

      await load();

      setSuccess(
        "Main Business is now the default.",
      );

      return true;
    } catch (defaultError) {
      setError(
        defaultError instanceof Error
          ? defaultError.message
          : "Unable to set Main Business as default.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function archive(
    id: string,
  ) {
    clearMessages();

    try {
      setSaving(true);

      await businessProfilesService
        .archive(id);

      await load();

      setSuccess(
        "Business profile archived successfully.",
      );

      return true;
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : "Unable to archive business profile.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(
    id: string,
    file: File,
  ) {
    clearMessages();

    try {
      setUploadingLogoId(id);

      await businessProfilesService
        .uploadLogo(
          id,
          file,
        );

      await load();

      setSuccess(
        "Business profile logo updated successfully.",
      );

      return true;
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload business profile logo.",
      );

      return false;
    } finally {
      setUploadingLogoId(
        null,
      );
    }
  }

  async function removeLogo(
    id: string,
  ) {
    clearMessages();

    try {
      setRemovingLogoId(id);

      await businessProfilesService
        .removeLogo(id);

      await load();

      setSuccess(
        "Business profile logo removed successfully.",
      );

      return true;
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove business profile logo.",
      );

      return false;
    } finally {
      setRemovingLogoId(
        null,
      );
    }
  }

  return {
    data,

    mainBusiness:
      data?.mainBusiness ??
      null,

    profiles:
      data?.profiles ??
      [],

    loading,
    saving,

    uploadingLogoId,
    removingLogoId,

    error,
    success,

    reload: load,

    create,
    update,
    setDefault,
    useMainAsDefault,
    archive,
    uploadLogo,
    removeLogo,
  };
}