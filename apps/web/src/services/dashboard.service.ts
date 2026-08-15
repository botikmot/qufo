import {
  apiFetch,
} from "@/lib/api";

import type {
  DashboardResponse,
} from "@/types/dashboard";

export const dashboardService = {
  getDashboard() {
    return apiFetch<DashboardResponse>(
      "/dashboard",
    );
  },
};