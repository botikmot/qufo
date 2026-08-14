export type JobStatus =
  | "PENDING"
  | "QUEUED"
  | "IN_PROGRESS"
  | "FOR_REVIEW"
  | "READY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type JobPriority =
  | "LOW"
  | "NORMAL"
  | "HIGH"
  | "URGENT";

export type JobCustomer = {
  id: string;
  name: string;
  companyName: string | null;
  phone?: string | null;
  email?: string | null;
};

export type JobItem = {
  id: string;
  name: string;
  description: string | null;
  quantity: string;
  unit: string;
  unitPrice: string;
  total: string;
  sortOrder: number;
};

export type JobUpdate = {
  id: string;
  status: JobStatus;
  message: string | null;
  publicMessage: string | null;
  createdAt: string;

  createdBy?: {
    id: string;
    name: string;
  } | null;
};

export type Job = {
  id: string;

  jobNumber: string;

  title: string;
  description: string | null;

  status: JobStatus;
  priority: JobPriority;

  dueDate: string | null;
  completedAt: string | null;

  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  total: string;

  trackingEnabled: boolean;
  trackingCreatedAt: string | null;

  customer: JobCustomer;

  quotation?: {
    id: string;
    quotationNumber: string;
  } | null;

  items?: JobItem[];
  updates?: JobUpdate[];

  createdAt: string;
  updatedAt: string;
};

export type JobsResponse = {
  items: Job[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type UpdateJobStatusData = {
  status: JobStatus;
  message?: string;
  publicMessage?: string;
};

export type PublicJobUpdate = {
  id: string;
  status: JobStatus;
  publicMessage: string | null;
  createdAt: string;
};

export type PublicJob = {
  jobNumber: string;
  title: string;
  description?: string | null;

  status: JobStatus;
  progress: number;

  priority?: JobPriority;

  dueDate?: string | null;
  completedAt?: string | null;

  customer?: {
    name: string;
    companyName?: string | null;
  };

  organization?: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };

  items?: {
    name: string;
    description?: string | null;
    quantity: string;
    unit: string;
    sortOrder?: number;
  }[];

  updates: PublicJobUpdate[];
};