import { apiFetch } from "@/lib/api";

import type {
  JobPaymentsResponse,
  Payment,
  PaymentFormData,
  PaymentsResponse,
  PaymentsSummaryResponse,
  PaymentStatus,
} from "@/types/payment";

type PaymentListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
};

type PaginatedPaymentsResponse = {
  items: Payment[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type PaymentListResponse = Payment[] | PaymentsResponse;

export const paymentsService = {
  async getAll(
    params: PaymentListParams = {},
  ): Promise<PaginatedPaymentsResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) {
      searchParams.set("page", String(params.page));
    }

    if (params.limit) {
      searchParams.set("limit", String(params.limit));
    }

    if (params.search?.trim()) {
      searchParams.set("search", params.search.trim());
    }

    if (params.status) {
      searchParams.set("status", params.status);
    }

    const query = searchParams.toString();

    const data = await apiFetch<PaymentListResponse>(
      query ? `/payments?${query}` : "/payments",
    );

    /*
     * Backward compatibility for an
     * older array response.
     */
    if (Array.isArray(data)) {
      return {
        items: data,

        pagination: {
          page: params.page ?? 1,
          limit: (params.limit ?? data.length) || 1,
          total: data.length,
          pages: 1,
        },
      };
    }

    /*
     * Normalize the response so the
     * rest of the frontend can safely
     * assume pagination exists.
     */
    return {
      items: data.items ?? [],

      pagination: data.pagination ?? {
        page: params.page ?? 1,

        limit: params.limit ?? data.items?.length ?? 1,

        total: data.items?.length ?? 0,

        pages: 1,
      },
    };
  },

  getSummary(
    params: {
      page?: number;
      limit?: number;
    } = {},
  ) {
    const searchParams = new URLSearchParams();

    if (params.page) {
      searchParams.set("page", String(params.page));
    }

    if (params.limit) {
      searchParams.set("limit", String(params.limit));
    }

    const query = searchParams.toString();

    return apiFetch<PaymentsSummaryResponse>(
      query ? `/payments/summary?${query}` : "/payments/summary",
    );
  },

  async getByJob(jobId: string) {
    const data = await apiFetch<JobPaymentsResponse>(`/payments/job/${jobId}`);

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.payments)) {
      return data.payments;
    }

    if (Array.isArray(data.items)) {
      return data.items;
    }

    return [];
  },

  create(data: PaymentFormData) {
    return apiFetch("/payments", {
      method: "POST",

      body: JSON.stringify({
        jobId: data.jobId,

        amount: Number(data.amount),

        method: data.method,

        referenceNumber: data.referenceNumber.trim() || undefined,

        notes: data.notes.trim() || undefined,
      }),
    });
  },

  void(paymentId: string) {
    return apiFetch(`/payments/${paymentId}/void`, {
      method: "POST",
    });
  },
};
