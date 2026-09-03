import type {
  JobPriority,
  JobStatus,
  WarrantyUnit,
} from "@/types/job";

export type JobPdfItem = {
  id: string;

  name: string;

  description:
    | string
    | null;

  quantity: number;

  unit: string;

  unitPrice: number;

  total: number;

  imageUrl?:
    | string
    | null;

  imageKey?:
    | string
    | null;

  warrantyDuration?:
    | number
    | null;

  warrantyUnit?:
    | WarrantyUnit
    | null;

  warrantyTerms?:
    | string
    | null;
};

export type JobPdfData = {
  jobNumber: string;

  quotationNumber:
    | string
    | null;

  createdAt: string;

  dueDate:
    | string
    | null;

  status: JobStatus;

  priority: JobPriority;

  title: string;

  description:
    | string
    | null;

  currency: string;

  business: {
    name: string;

    logoUrl:
      | string
      | null;

    address:
      | string
      | null;

    email:
      | string
      | null;

    phone:
      | string
      | null;
  };

  customer: {
    name: string;

    companyName:
      | string
      | null;

    address:
      | string
      | null;

    email:
      | string
      | null;

    phone:
      | string
      | null;
  };

  items: JobPdfItem[];

  subtotal: number;

  discountAmount: number;

  taxAmount: number;

  total: number;

  trackingUrl: string;

  qrCodeDataUrl: string;
};