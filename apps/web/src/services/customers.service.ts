import {
  apiFetch,
} from "@/lib/api";

import type {
  Customer,
  CustomersResponse,
} from "@/types/customer";

export const customersService = {
  getAll(
    page = 1,
    limit = 100,
  ) {
    return apiFetch<CustomersResponse>(
      `/customers?page=${page}&limit=${limit}`,
    );
  },

  getOne(
    customerId: string,
  ) {
    return apiFetch<Customer>(
      `/customers/${customerId}`,
    );
  },
};