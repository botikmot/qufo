import {
  apiFetch,
} from "@/lib/api";

import type {
  ReportData,
} from "@/types/report";

type GetReportParams = {
  from?: string;
  to?: string;
};

export const reportsService = {
  getReport(
    params: GetReportParams = {},
  ) {
    const searchParams =
      new URLSearchParams();

    if (params.from) {
      searchParams.set(
        "from",
        params.from,
      );
    }

    if (params.to) {
      searchParams.set(
        "to",
        params.to,
      );
    }

    const query =
      searchParams.toString();

    return apiFetch<ReportData>(
      `/reports${
        query
          ? `?${query}`
          : ""
      }`,
    );
  },
};