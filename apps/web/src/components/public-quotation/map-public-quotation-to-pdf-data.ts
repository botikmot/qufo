import type { PublicQuotation } from "@/types/quotation";

import type { QuotationPdfData } from "../quotations/pdf/quotation-pdf-types";

/*
 * Public PDF preferences.
 *
 * These are intentionally separate from the
 * business owner's localStorage preferences.
 *
 * No database changes required.
 */
const PUBLIC_QUOTATION_PDF_PREFERENCES = {
  showSubject: true,

  showMessage: true,

  showAcceptedConforme: true,

  showQuotationDetails: true,
} satisfies QuotationPdfData["pdfOptions"];

export function mapPublicQuotationToPdfData(
  quotation: PublicQuotation,
): QuotationPdfData {
  const business = quotation.business ?? quotation.organization;

  return {
    quotationNumber: quotation.quotationNumber,

    revisionNumber: quotation.revisionNumber ?? 1,

    issueDate: quotation.issueDate,

    validUntil: quotation.validUntil,

    currency: quotation.currency,

    business: {
      name: business.name,

      logoUrl: business.logoUrl ?? null,

      address: business.address ?? null,

      email: business.email ?? null,

      phone: business.phone ?? null,
    },

    customer: {
      name: quotation.customer.name,

      companyName: quotation.customer.companyName,

      /*
       * The public API currently exposes only
       * customer name and company name.
       *
       * Keep the other fields null because
       * they are not available publicly.
       */
      address: null,

      email: null,

      phone: null,
    },

    items: quotation.items.map((item, index) => ({
      id: item.id ?? `${quotation.quotationNumber}-${index}`,

      name: item.name,

      description: item.description,

      quantity: Number(item.quantity),

      unit: item.unit,

      unitPrice: Number(item.unitPrice),

      total: Number(item.total),

      imageUrl: item.imageUrl ?? null,

      imageKey: item.imageKey ?? null,

      warrantyDuration: item.warrantyDuration ?? null,

      warrantyUnit: item.warrantyUnit ?? null,

      warrantyTerms: item.warrantyTerms ?? null,
    })),

    subtotal: Number(quotation.subtotal),

    discountAmount: Number(quotation.discountAmount),

    taxAmount: Number(quotation.taxAmount),

    total: Number(quotation.total),

    notes: quotation.notes ?? null,

    terms: quotation.terms ?? null,

    footerNote: quotation.footerNote ?? null,

    /*
     * These come from THIS quotation.
     *
     * They do not come from localStorage.
     */
    subject: quotation.subject ?? null,

    quotationMessage: quotation.quotationMessage ?? null,

    pdfOptions: PUBLIC_QUOTATION_PDF_PREFERENCES,

    authorizedSignatureUrl:
      quotation.organization.quotationSignatureUrl ?? null,

    authorizedSignatoryName:
      quotation.organization.quotationSignatoryName ?? null,

    authorizedSignatoryTitle:
      quotation.organization.quotationSignatoryTitle ?? null,

    showQuotationSignature:
      quotation.organization.showQuotationSignature ?? false,

    preparedBy: quotation.business?.name ?? quotation.organization.name,
  };
}
