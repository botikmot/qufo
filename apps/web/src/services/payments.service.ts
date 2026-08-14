import {
  apiFetch,
} from "@/lib/api";

import type {
  JobPaymentsResponse,
  Payment,
  PaymentFormData,
  PaymentsResponse,
  PaymentsSummaryResponse,
} from "@/types/payment";

type PaymentListResponse =
  | Payment[]
  | PaymentsResponse;

export const paymentsService = {
  async getAll() {
    const data =
      await apiFetch<PaymentListResponse>(
        "/payments",
      );

    if (Array.isArray(data)) {
      return data;
    }

    return data.items ?? [];
  },

  getSummary() {
    return apiFetch<PaymentsSummaryResponse>(
      "/payments/summary",
    );
  },

  async getByJob(
    jobId: string,
  ) {
    const data =
      await apiFetch<JobPaymentsResponse>(
        `/payments/job/${jobId}`,
      );

    if (Array.isArray(data)) {
      return data;
    }

    if (
      Array.isArray(
        data.payments,
      )
    ) {
      return data.payments;
    }

    if (
      Array.isArray(
        data.items,
      )
    ) {
      return data.items;
    }

    return [];
  },

  create(
    data: PaymentFormData,
  ) {
    return apiFetch(
      "/payments",
      {
        method: "POST",

        body: JSON.stringify({
          jobId:
            data.jobId,

          amount:
            Number(
              data.amount,
            ),

          method:
            data.method,

          referenceNumber:
            data.referenceNumber
              .trim() ||
            undefined,

          notes:
            data.notes.trim() ||
            undefined,
        }),
      },
    );
  },

  void(
    paymentId: string,
  ) {
    return apiFetch(
      `/payments/${paymentId}/void`,
      {
        method: "POST",
      },
    );
  },
};