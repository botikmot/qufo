export type CustomerType =
  | "INDIVIDUAL"
  | "COMPANY";

export type CustomerStatus =
  | "ACTIVE"
  | "ARCHIVED";

export type Customer = {
  id: string;

  type: CustomerType;
  status: CustomerStatus;

  name: string;
  companyName: string | null;

  email: string | null;
  phone: string | null;

  address: string | null;
  notes: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CustomersResponse = {
  items: Customer[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type CustomerFormData = {
  type: CustomerType;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};