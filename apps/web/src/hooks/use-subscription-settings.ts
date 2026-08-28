"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import {
  settingsService,
} from "@/services/settings.service";

import type {
  SubscriptionBillingSummary,
  SubscriptionPaymentHistoryItem,
} from "@/types/subscription";

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  return error instanceof Error
    ? error.message
    : fallback;
}

function delay(
  milliseconds: number,
) {
  return new Promise<void>(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

export function useSubscriptionSettings() {
  const searchParams =
    useSearchParams();

  const paymentResult =
    searchParams.get(
      "payment",
    );

  const paypalOrderId =
    searchParams.get(
      "token",
    );

  const [
    billing,
    setBilling,
  ] =
    useState<SubscriptionBillingSummary | null>(
      null,
    );

  const [
    payments,
    setPayments,
  ] =
    useState<
      SubscriptionPaymentHistoryItem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    renewing,
    setRenewing,
  ] =
    useState(false);

  const [
    paymentCheckDone,
    setPaymentCheckDone,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    paypalCaptureDone,
    setPaypalCaptureDone,
  ] =
    useState(false);

  /*
   * Silent refresh.
   *
   * Useful after PayMongo redirect
   * and for future manual refreshes.
   */
  const refresh =
    useCallback(
      async () => {
        try {
          const [
            billingResponse,
            paymentsResponse,
          ] =
            await Promise.all([
              settingsService.getSubscriptionBilling(),

              settingsService.getSubscriptionPayments(),
            ]);

          setBilling(
            billingResponse,
          );

          setPayments(
            paymentsResponse.payments,
          );

          setError(
            null,
          );

          return billingResponse;
        } catch (error) {
          setError(
            getErrorMessage(
              error,
              "Unable to load subscription.",
            ),
          );

          return null;
        }
      },
      [],
    );

  /*
   * User-triggered renewal.
   */
  const renew =
    useCallback(
      async () => {
        if (!billing) {
          return;
        }

        try {
          setRenewing(
            true,
          );

          setError(
            null,
          );

          /*
           * Provider follows subscription
           * billing currency.
           *
           * NOT the workspace currency.
           */
          const provider =
            billing.pricing
              .currency ===
            "PHP"
              ? "PAYMONGO"
              : "PAYPAL";

          const response =
            await settingsService.createSubscriptionCheckout(
              provider,
            );

          const checkoutUrl =
            response.payment
              .checkoutUrl;

          if (!checkoutUrl) {
            throw new Error(
              "Checkout URL was not returned.",
            );
          }

          window.location.assign(
            checkoutUrl,
          );
        } catch (error) {
          setError(
            getErrorMessage(
              error,
              "Unable to start subscription checkout.",
            ),
          );

          setRenewing(
            false,
          );
        }
      },
      [billing],
    );

  /*
   * Initial fetch.
   *
   * Safe with the newer React lint rule
   * because state updates happen only
   * after the awaited request.
   */
  useEffect(() => {
    let cancelled =
      false;

    async function fetchSubscription() {
      try {
        const [
          billingResponse,
          paymentsResponse,
        ] =
          await Promise.all([
            settingsService.getSubscriptionBilling(),

            settingsService.getSubscriptionPayments(),
          ]);

        if (cancelled) {
          return;
        }

        setBilling(
          billingResponse,
        );

        setPayments(
          paymentsResponse.payments,
        );

        setError(
          null,
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          getErrorMessage(
            error,
            "Unable to load subscription.",
          ),
        );
      } finally {
        if (!cancelled) {
          setLoading(
            false,
          );
        }
      }
    }

    void fetchSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * When customer returns from PayMongo:
   *
   * /settings?tab=subscription&payment=success
   *
   * do NOT trust the redirect as payment proof.
   * Poll our backend because the webhook
   * remains the source of truth.
   */
  useEffect(() => {
    if (
      paymentResult !==
      "success"
    ) {
      return;
    }

    let cancelled =
      false;

    async function confirmPayment() {
      const maxAttempts =
        6;

      for (
        let attempt = 0;
        attempt <
        maxAttempts;
        attempt += 1
      ) {
        /*
         * Allow webhook a moment
         * to reach QUFO first.
         */
        await delay(
          1500,
        );

        if (cancelled) {
          return;
        }

        const response =
          await settingsService.getSubscriptionBilling();

        if (cancelled) {
          return;
        }

        setBilling(
          response,
        );

        setError(
          null,
        );

        if (
          response.effectiveStatus ===
          "ACTIVE"
        ) {
          setPaymentCheckDone(
            true,
          );

          return;
        }
      }

      if (!cancelled) {
        setPaymentCheckDone(
          true,
        );
      }
    }

    void confirmPayment();

    return () => {
      cancelled = true;
    };
  }, [paymentResult]);

  useEffect(() => {
    if (
      paymentResult !==
        "paypal-return" ||
      !paypalOrderId
    ) {
      return;
    }

    let cancelled =
      false;

    async function capturePayPal() {
      try {
        /*
        * First async work happens before
        * any state mutation, avoiding the
        * set-state-in-effect lint issue.
        */
        await settingsService.capturePayPalSubscription(
          paypalOrderId!,
        );

        if (cancelled) {
          return;
        }

        const [
          billingResponse,
          paymentsResponse,
        ] =
          await Promise.all([
            settingsService.getSubscriptionBilling(),

            settingsService.getSubscriptionPayments(),
          ]);

        if (cancelled) {
          return;
        }

        setBilling(
          billingResponse,
        );

        setPayments(
          paymentsResponse.payments,
        );

        setError(
          null,
        );

        setPaypalCaptureDone(
          true,
        );

        /*
        * Remove PayPal token from URL.
        * Prevents unnecessary capture
        * attempt after page refresh.
        */
        window.history.replaceState(
          null,
          "",
          "/settings?tab=subscription&payment=success",
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          getErrorMessage(
            error,
            "Unable to complete PayPal payment.",
          ),
        );

        setPaypalCaptureDone(
          true,
        );
      }
    }

    void capturePayPal();

    return () => {
      cancelled =
        true;
    };
  }, [
    paymentResult,
    paypalOrderId,
  ]);

  const confirmingPayMongo =
    paymentResult ===
      "success" &&
    !paymentCheckDone;

  const confirmingPayPal =
    paymentResult ===
      "paypal-return" &&
    !paypalCaptureDone;

  const confirmingPayment =
    confirmingPayMongo ||
    confirmingPayPal;

  /* const confirmingPayment =
    paymentResult ===
      "success" &&
    !paymentCheckDone &&
    billing?.effectiveStatus !==
      "ACTIVE"; */

  return {
    billing,

    payments,

    loading,

    renewing,

    confirmingPayment,

    paymentResult,

    error,

    refresh,

    renew,
  };
}