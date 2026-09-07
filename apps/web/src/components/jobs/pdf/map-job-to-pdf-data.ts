import type {
  Job,
} from "@/types/job";

import type {
  JobPdfData,
} from "./job-pdf-types";

type MapJobToPdfDataOptions = {
  trackingUrl: string;

  qrCodeDataUrl: string;
};

export function mapJobToPdfData(
  job: Job,
  {
    trackingUrl,
    qrCodeDataUrl,
  }: MapJobToPdfDataOptions,
): JobPdfData {

  console.log('Job PDF:', job)

  const snapshotBusinessName =
    job.quotation?.businessNameSnapshot;

  const hasBusinessSnapshot =
    snapshotBusinessName !== null &&
    snapshotBusinessName !== undefined;

  const business: JobPdfData["business"] =
    hasBusinessSnapshot
      ? {
          name:
            snapshotBusinessName,

          logoUrl:
            job.quotation
              ?.businessLogoUrlSnapshot ??
            null,

          address:
            job.quotation
              ?.businessAddressSnapshot ??
            null,

          email:
            job.quotation
              ?.businessEmailSnapshot ??
            null,

          phone:
            job.quotation
              ?.businessPhoneSnapshot ??
            null,
        }
      : {
          name:
            job.organization.name,

          logoUrl:
            job.organization.logoUrl,

          address:
            job.organization.address,

          email:
            job.organization.email,

          phone:
            job.organization.phone,
        };



  return {
    jobNumber:
      job.jobNumber,

    quotationNumber:
      job.quotation
        ?.quotationNumber ??
      null,

    createdAt:
      job.createdAt,

    dueDate:
      job.dueDate,

    status:
      job.status,

    priority:
      job.priority,

    title:
      job.title,

    description:
      job.description,

    currency:
      job.currency,

    business,

    customer: {
      name:
        job.customer.name,

      companyName:
        job.customer.companyName,

      address:
        job.customer.address ??
        null,

      email:
        job.customer.email ??
        null,

      phone:
        job.customer.phone ??
        null,
    },

    items:
      (job.items ?? []).map(
        (item) => ({
          id:
            item.id,

          name:
            item.name,

          description:
            item.description,

          quantity:
            Number(
              item.quantity,
            ),

          unit:
            item.unit,

          unitPrice:
            Number(
              item.unitPrice,
            ),

          total:
            Number(
              item.total,
            ),

          imageUrl:
            item.imageUrl,

          imageKey:
            item.imageKey,

          warrantyDuration:
            item.warrantyDuration,

          warrantyUnit:
            item.warrantyUnit,

          warrantyTerms:
            item.warrantyTerms,
        }),
      ),

    subtotal:
      Number(
        job.subtotal,
      ),

    discountAmount:
      Number(
        job.discountAmount,
      ),

    taxAmount:
      Number(
        job.taxAmount,
      ),

    total:
      Number(
        job.total,
      ),

    trackingUrl,

    qrCodeDataUrl,
  };
}