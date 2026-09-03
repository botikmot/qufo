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

import { useConfirm } from "@/components/providers/confirm-dialog-provider";
import {
  generateJobConfirmationPdfBlob,
} from "@/components/jobs/pdf/generate-job-confirmation-pdf-blob";

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

  const confirm = useConfirm();

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
      await confirm({
        title:
          "Approve quotation?",

        description:
          `You are about to approve ${quotation.quotationNumber}.`,

        confirmText:
          "Approve quotation",
      });

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
          .approve(token);

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

      let successMessage =
        "Quotation approved successfully. The business can now proceed with your order.";

      const confirmation =
        result.jobConfirmation;

      /*
      * This only runs when:
      *
      * - global email is enabled
      * - business enabled customer email
      * - customer has an email
      * - confirmation was not sent before
      */
      if (
        confirmation
          ?.emailRequired
      ) {
        try {
          const pdfBlob =
            await generateJobConfirmationPdfBlob(
              confirmation.pdfData,
              confirmation.trackingUrl,
            );

          const emailResult =
            await publicQuotationService
              .sendJobConfirmation(
                token,
                pdfBlob,
                `${confirmation.pdfData.jobNumber}-confirmation.pdf`,
              );

          if (
            emailResult.sent ||
            emailResult.alreadySent
          ) {
            successMessage =
              "Quotation approved successfully. Your job confirmation and tracking details were sent to your email.";
          } else {
            successMessage =
              "Quotation approved successfully. Your job was created, but the confirmation email could not be sent.";
          }
        } catch (
          confirmationError
        ) {
          /*
          * Never turn a successful
          * quotation approval into
          * an approval error.
          */
          console.error(
            "Unable to send job confirmation email.",
            confirmationError,
          );

          successMessage =
            "Quotation approved successfully. Your job was created, but the confirmation email could not be sent.";
        }
      }

      setSuccessMessage(
        successMessage,
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