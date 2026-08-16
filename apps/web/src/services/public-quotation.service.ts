import {
  apiFetch,
} from "@/lib/api";

import type {
  PublicQuotation,
  PublicQuotationResponse,
} from "@/types/quotation";

export const publicQuotationService = {
  getByToken(
    token: string,
  ) {
    return apiFetch<PublicQuotation>(
      `/public/quotations/${token}`,
      {
        requireAuth: false,
      },
    );
  },

  approve(
    token: string,
  ) {
    return apiFetch<PublicQuotationResponse>(
      `/public/quotations/${token}/approve`,
      {
        method: "POST",

        requireAuth: false,

        body: JSON.stringify({}),
      },
    );
  },

  requestChanges(
    token: string,
    note: string,
  ) {
    return apiFetch<PublicQuotationResponse>(
      `/public/quotations/${token}/request-changes`,
      {
        method: "POST",

        requireAuth: false,

        body: JSON.stringify({
          note:
            note.trim(),
        }),
      },
    );
  },

  reject(
    token: string,
    note: string,
  ) {
    return apiFetch<PublicQuotationResponse>(
      `/public/quotations/${token}/reject`,
      {
        method: "POST",

        requireAuth: false,

        body: JSON.stringify({
          note:
            note.trim(),
        }),
      },
    );
  },
};