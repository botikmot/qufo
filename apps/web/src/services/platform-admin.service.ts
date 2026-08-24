import {
  apiFetch,
} from "@/lib/api";

import type {
  PlatformAdminDashboardResponse,
  PlatformTenantDetail,
  PlatformTenantsResponse,
  RenewPlatformTenantResponse,
} from "@/types/platform-admin";

export type GetPlatformTenantsParams = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export async function getPlatformAdminDashboard() {
  return apiFetch<PlatformAdminDashboardResponse>(
    "/platform-admin/dashboard",
  );
}

export async function getPlatformTenants(
  params: GetPlatformTenantsParams = {},
) {
  const searchParams =
    new URLSearchParams();

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params.page) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.limit) {
    searchParams.set(
      "limit",
      String(params.limit),
    );
  }

  const queryString =
    searchParams.toString();

  const path =
    queryString
      ? `/platform-admin/tenants?${queryString}`
      : "/platform-admin/tenants";

  return apiFetch<PlatformTenantsResponse>(
    path,
  );
}

export async function getPlatformTenant(
  tenantId: string,
) {
  return apiFetch<PlatformTenantDetail>(
    `/platform-admin/tenants/${tenantId}`,
  );
}

export async function renewPlatformTenant(
  tenantId: string,
  durationMonths: number,
) {
  return apiFetch<RenewPlatformTenantResponse>(
    `/platform-admin/tenants/${tenantId}/renew`,
    {
      method: "POST",

      body: JSON.stringify({
        durationMonths,
      }),
    },
  );
}