import type {
  QuotationDetail,
} from "@/types/quotation";

import type {
  QuotationPdfData,
} from "./quotation-pdf-types";

export function mapQuotationToPdfData(
  quotation: QuotationDetail,
): QuotationPdfData {
  return {
    quotationNumber:
      quotation.quotationNumber,

    revisionNumber:
      quotation.revisionNumber ??
      1,

    issueDate:
      quotation.issueDate,

    validUntil:
      quotation.validUntil,

    currency:
      quotation.currency,

    business: {
      name:
        quotation.organization
          .name,

      logoUrl:
        quotation.organization
          .logoUrl,

      address:
        quotation.organization
          .address,

      email:
        quotation.organization
          .email,

      phone:
        quotation.organization
          .phone,
    },

    customer: {
      name:
        quotation.customer
          .name,

      companyName:
        quotation.customer
          .companyName,

      address:
        quotation.customer
          .address ??
        null,

      email:
        quotation.customer
          .email ??
        null,

      phone:
        quotation.customer
          .phone ??
        null,
    },

    items:
      quotation.items.map(
        (item, index) => ({
          id:
            item.id ??
            `${quotation.id}-${index}`,

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
          imageUrl: item.imageUrl,
          imageKey: item.imageKey,

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
        quotation.subtotal,
      ),

    discountAmount:
      Number(
        quotation.discountAmount,
      ),

    taxAmount:
      Number(
        quotation.taxAmount,
      ),

    total:
      Number(
        quotation.total,
      ),

    notes:
      quotation.notes ??
      null,

    terms:
      quotation.terms ??
      null,

    footerNote:
      quotation.footerNote ??
      null,

    preparedBy:
      quotation.createdBy.name,
  };
}