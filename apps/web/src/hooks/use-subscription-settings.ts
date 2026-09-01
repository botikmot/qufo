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

const SUBSCRIPTION_ENABLED =
  process.env.NEXT_PUBLIC_SUBSCRIPTION_ENABLED !== "false";

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

  /*
   * If subscriptions are disabled,
   * there is nothing to load.
   */
  const [
    loading,
    setLoading,
  ] = useState(
    SUBSCRIPTION_ENABLED,
  );

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
   */
  const refresh =
    useCallback(
      async () => {
        if (
          !SUBSCRIPTION_ENABLED
        ) {
          return null;
        }

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
        if (
          !SUBSCRIPTION_ENABLED ||
          !billing
        ) {
          return;
        }

        try {
          setRenewing(
            true,
          );

          setError(
            null,
          );

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
   * Initial subscription fetch.
   */
  useEffect(() => {
    if (
      !SUBSCRIPTION_ENABLED
    ) {
      return;
    }

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
   * PayMongo return confirmation.
   */
  useEffect(() => {
    if (
      !SUBSCRIPTION_ENABLED ||
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

  /*
   * PayPal return / capture.
   */
  useEffect(() => {
    if (
      !SUBSCRIPTION_ENABLED ||
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
    SUBSCRIPTION_ENABLED &&
    paymentResult ===
      "success" &&
    !paymentCheckDone;

  const confirmingPayPal =
    SUBSCRIPTION_ENABLED &&
    paymentResult ===
      "paypal-return" &&
    !paypalCaptureDone;

  const confirmingPayment =
    confirmingPayMongo ||
    confirmingPayPal;

  return {
    enabled:
      SUBSCRIPTION_ENABLED,

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