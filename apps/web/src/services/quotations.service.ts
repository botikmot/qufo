import {
  apiFetch,
} from "@/lib/api";

import type {
  Quotation,
  QuotationsResponse,
  QuotationStatus,
} from "@/types/quotation";

import type {
  QuotationFormPayload,
} from "@/types/quotation-form";

export type QuotationsQuery = {
  page?: number;
  limit?: number;
  search?: string;

  status?:
    | QuotationStatus
    | "ALL";
};

export type SendQuotationResponse = {
  quotationNumber: string;
  publicUrl?: string;
  quotationUrl?: string;
  url?: string;
};

export const quotationsService = {
  getAll(
    query: QuotationsQuery = {},
  ) {
    const params =
      new URLSearchParams();

    params.set(
      "page",
      String(query.page ?? 1),
    );

    params.set(
      "limit",
      String(query.limit ?? 20),
    );

    if (query.search) {
      params.set(
        "search",
        query.search,
      );
    }

    if (
      query.status &&
      query.status !== "ALL"
    ) {
      params.set(
        "status",
        query.status,
      );
    }

    return apiFetch<QuotationsResponse>(
      `/quotations?${params.toString()}`,
    );
  },

  create(
    data: QuotationFormPayload,
  ) {
    return apiFetch<Quotation>(
      "/quotations",
      {
        method: "POST",
        body: JSON.stringify(
          data,
        ),
      },
    );
  },

  update(
    quotationId: string,
    data: QuotationFormPayload,
  ) {
    return apiFetch<Quotation>(
      `/quotations/${quotationId}`,
      {
        method: "PATCH",
        body: JSON.stringify(
          data,
        ),
      },
    );
  },

  getOne(
    quotationId: string,
  ) {
    return apiFetch<Quotation>(
      `/quotations/${quotationId}`,
    );
  },

  send(
    quotationId: string,
  ) {
    return apiFetch<SendQuotationResponse>(
      `/quotations/${quotationId}/send`,
      {
        method: "POST",
      },
    );
  },

  convertToJob(
    quotationId: string,
  ) {
    return apiFetch(
      `/quotations/${quotationId}/convert-to-job`,
      {
        method: "POST",
      },
    );
  },

  createRevision(
    quotationId: string,
  ) {
    return apiFetch<Quotation>(
      `/quotations/${quotationId}/revise`,
      {
        method: "POST",
      },
    );
  },

};