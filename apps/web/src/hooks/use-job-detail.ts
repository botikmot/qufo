"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  JOB_STATUS_TRANSITIONS,
} from "@/constants/job";

import type {
  Job,
  JobStatus,
} from "@/types/job";

type UseJobDetailProps = {
  job: Job;

  onChangeStatus: (
    status: JobStatus,
    message: string,
    publicMessage: string,
  ) => Promise<void>;

  onGenerateTrackingLink:
    () => Promise<string>;
};

export function useJobDetail({
  job,
  onChangeStatus,
  onGenerateTrackingLink,
}: UseJobDetailProps) {
  const nextStatuses =
    JOB_STATUS_TRANSITIONS[
      job.status
    ];

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState<JobStatus | "">(
      nextStatuses[0] ?? "",
    );

  const [
    internalMessage,
    setInternalMessage,
  ] = useState("");

  const [
    publicMessage,
    setPublicMessage,
  ] = useState("");

  const [
    trackingLink,
    setTrackingLink,
  ] =
    useState<string | null>(
      null,
    );

  const [
    trackingError,
    setTrackingError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState("");

  const generateTrackingLinkRef =
    useRef(
      onGenerateTrackingLink,
    );

  useEffect(() => {
    generateTrackingLinkRef.current =
      onGenerateTrackingLink;
  }, [onGenerateTrackingLink]);

  /*
   * Restore the existing tracking
   * link when the modal is opened.
   *
   * The backend now returns the
   * existing encrypted token instead
   * of generating a new token.
   */
  useEffect(() => {
    let cancelled = false;

    if (!job.trackingEnabled) {
      return () => {
        cancelled = true;
      };
    }

    async function loadTrackingLink() {
      try {
        const url =
          await generateTrackingLinkRef
            .current();

        if (!url) {
          throw new Error(
            "Tracking URL was not returned by the server.",
          );
        }

        if (cancelled) {
          return;
        }

        setTrackingLink(url);
        setTrackingError(null);
        setCopied(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setTrackingError(
          error instanceof Error
            ? error.message
            : "Unable to load the tracking link.",
        );
      }
    }

    void loadTrackingLink();

    return () => {
      cancelled = true;
    };
  }, [
    job.id,
    job.trackingEnabled,
  ]);

  async function updateStatus() {
    if (!selectedStatus) {
      return;
    }

    await onChangeStatus(
      selectedStatus,
      internalMessage.trim(),
      publicMessage.trim(),
    );
  }

  async function generateTrackingLink() {
    setTrackingError(null);

    try {
      const url =
        await onGenerateTrackingLink();

      if (!url) {
        throw new Error(
          "Tracking URL was not returned by the server.",
        );
      }

      setTrackingLink(url);
      setCopied(false);
    } catch (error) {
      setTrackingError(
        error instanceof Error
          ? error.message
          : "Unable to generate tracking link.",
      );
    }
  }

  async function copyTrackingLink() {
    if (!trackingLink) {
      return;
    }

    await navigator.clipboard.writeText(
      trackingLink,
    );

    setCopied(true);
  }

  return {
    nextStatuses,

    selectedStatus,
    internalMessage,
    publicMessage,

    trackingLink,
    trackingError,
    copied,
    cancellationReason,
    setCancellationReason,

    setSelectedStatus,
    setInternalMessage,
    setPublicMessage,

    updateStatus,
    generateTrackingLink,
    copyTrackingLink,
  };
}