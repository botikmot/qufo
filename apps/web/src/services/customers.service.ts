import { apiFetch } from "@/lib/api";

import type { Customer } from "@/types/customer";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  CustomerFormData,
} from "@/types/customer-form";

export type CustomersQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

export const customersService = {
  getAll(
p0: number, p1: number, query: CustomersQuery = {},
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

    return apiFetch<
      PaginatedResponse<Customer>
    >(
      `/customers?${params.toString()}`,
    );
  },

  getOne(
    customerId: string,
  ) {
    return apiFetch<Customer>(
      `/customers/${customerId}`,
    );
  },

  archive(
    customerId: string,
  ) {
    return apiFetch(
      `/customers/${customerId}`,
      {
        method: "DELETE",
      },
    );
  },

  create(
    data: CustomerFormData,
  ) {
    return apiFetch<Customer>(
      "/customers",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  update(
      customerId: string,
      data: CustomerFormData,
    ) {
    return apiFetch<Customer>(
      `/customers/${customerId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
  },
};