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

export type WarrantyUnit =
  | "DAYS"
  | "WEEKS"
  | "MONTHS"
  | "YEARS";

export type JobItem = {
  id: string;
  name: string;
  description: string | null;
  quantity: string;
  unit: string;
  unitPrice: string;
  total: string;
  imageUrl?: string | null;
  imageKey?: string | null;

  warrantyDuration?: number | null;
  warrantyUnit?: WarrantyUnit | null;
  warrantyTerms?: string | null;
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
  currency: string;

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

export type PublicJobTimelineEntry = {
  status: JobStatus;
  message: string;
  createdAt: string;
};

export type PublicJob = {
  jobNumber: string;
  title: string;

  status: JobStatus;
  progress: number;

  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;

  organization: {
    name: string;
    logoUrl: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };

  customer: {
    name: string;
  };

  items: {
    name: string;
    description: string | null;
    quantity: string;
    unit: string;
    imageUrl?: string | null;
    imageKey?: string | null;

    warrantyDuration?: number | null;
    warrantyUnit?: WarrantyUnit | null;
    warrantyTerms?: string | null;
  }[];

  timeline: PublicJobTimelineEntry[];
};