"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  publicQuotationService,
} from "@/services/public-quotation.service";

import type {
  PublicQuotation,
} from "@/types/quotation";

type PublicQuotationAction =
  | "approve"
  | "requestChanges"
  | "reject";

export function usePublicQuotation(
  token: string,
) {
  const [
    quotation,
    setQuotation,
  ] =
    useState<PublicQuotation | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState<
      PublicQuotationAction | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null,
    );

  const [
    showChangesForm,
    setShowChangesForm,
  ] = useState(false);

  const [
    changesNote,
    setChangesNote,
  ] = useState("");

  const [
    showDeclineForm,
    setShowDeclineForm,
  ] = useState(false);

  const [
    declineReason,
    setDeclineReason,
  ] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load =
      async () => {
        try {
          const data =
            await publicQuotationService
              .getByToken(
                token,
              );

          if (cancelled) {
            return;
          }

          setQuotation(
            data,
          );

          setError(null);
        } catch (error) {
          if (cancelled) {
            return;
          }

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load quotation.",
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    token,
  ]);

  const canRespond =
    Boolean(
      quotation?.revisionInfo
        .isLatest,
    ) &&
    (
      quotation?.status ===
        "SENT" ||
      quotation?.status ===
        "VIEWED"
    );

  async function approveQuotation() {
    if (
      !quotation ||
      !canRespond
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Approve ${quotation.quotationNumber}?`,
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(
      "approve",
    );

    setError(null);

    try {
      const result =
        await publicQuotationService
          .approve(
            token,
          );

      setQuotation(
        (current) =>
          current
            ? {
                ...current,

                status:
                  result
                    .quotation
                    .status,
              }
            : current,
      );

      setSuccessMessage(
        "Quotation approved successfully. The business can now proceed with your order.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to approve quotation.",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  async function requestChanges() {
    if (
      !quotation ||
      !canRespond
    ) {
      return;
    }

    const note =
      changesNote.trim();

    if (!note) {
      setError(
        "Please tell the business what you would like changed.",
      );

      return;
    }

    setActionLoading(
      "requestChanges",
    );

    setError(null);

    try {
      const result =
        await publicQuotationService
          .requestChanges(
            token,
            note,
          );

      setQuotation(
        (current) =>
          current
            ? {
                ...current,

                status:
                  result
                    .quotation
                    .status,

                customerResponseNote:
                  note,
              }
            : current,
      );

      setShowChangesForm(
        false,
      );

      setChangesNote("");

      setSuccessMessage(
        "Your requested changes have been sent to the business.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit your request.",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  async function declineQuotation() {
    if (
      !quotation ||
      !canRespond
    ) {
      return;
    }

    const reason =
      declineReason.trim();

    if (!reason) {
      setError(
        "Please tell the business why you are declining this quotation.",
      );

      return;
    }

    setActionLoading(
      "reject",
    );

    setError(null);

    try {
      const result =
        await publicQuotationService
          .reject(
            token,
            reason,
          );

      setQuotation(
        (current) =>
          current
            ? {
                ...current,

                status:
                  result
                    .quotation
                    .status,

                customerResponseNote:
                  reason,
              }
            : current,
      );

      setShowDeclineForm(
        false,
      );

      setDeclineReason("");

      setSuccessMessage(
        "The business has been informed that you declined this quotation.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to decline quotation.",
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  function openChangesForm() {
    setError(null);

    setShowChangesForm(
      true,
    );
  }

  function closeChangesForm() {
    if (
      actionLoading ===
      "requestChanges"
    ) {
      return;
    }

    setShowChangesForm(
      false,
    );
  }

  function openDeclineForm() {
    setError(null);

    setShowDeclineForm(
      true,
    );
  }

  function closeDeclineForm() {
    if (
      actionLoading ===
      "reject"
    ) {
      return;
    }

    setShowDeclineForm(
      false,
    );
  }

  return {
    quotation,

    loading,
    actionLoading,

    error,
    successMessage,

    canRespond,

    showChangesForm,
    changesNote,

    showDeclineForm,
    declineReason,

    setChangesNote,
    setDeclineReason,

    openChangesForm,
    closeChangesForm,

    openDeclineForm,
    closeDeclineForm,

    approveQuotation,
    requestChanges,
    declineQuotation,
  };
}