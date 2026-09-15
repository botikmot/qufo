import * as XLSX from "xlsx";
import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

import type { QuotationDetail } from "@/types/quotation";
import { getQuotationPdfPreferences } from "@/lib/quotation-pdf-preferences";

function excelText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function excelNumber(value: unknown): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function excelDate(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function excelMoney(value: unknown): number {
  return Number(excelNumber(value).toFixed(2));
}

/*
 * Convert nullable values to safe strings.
 */
function safeText(value: string | null | undefined): string {
  return value ?? "";
}

/*
 * Convert decimal string values to numbers.
 */
function amount(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

/*
 * Format date for exported documents.
 */
function formatExportDate(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/*
 * Download a browser Blob.
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;

  anchor.download = filename;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}

/*
 * Get the business information
 * from quotation snapshots.
 *
 * Snapshots are preferred because
 * they preserve the business details
 * used when the quotation was created.
 */
function getBusinessInfo(quotation: QuotationDetail) {
  return {
    name: quotation.businessNameSnapshot ?? quotation.organization.name,

    email:
      quotation.businessEmailSnapshot ?? quotation.organization.email ?? "",

    phone:
      quotation.businessPhoneSnapshot ?? quotation.organization.phone ?? "",

    address:
      quotation.businessAddressSnapshot ?? quotation.organization.address ?? "",

    logoUrl:
      quotation.businessLogoUrlSnapshot ??
      quotation.organization.logoUrl ??
      null,
  };
}

/*
 * Get quotation subject and message.
 *
 * Prefer the quotation's own saved values.
 * The remembered local-storage values are
 * primarily used by the PDF mapper.
 */
function getQuotationContent(quotation: QuotationDetail) {
  return {
    subject: quotation.subject ?? "",

    message: quotation.quotationMessage ?? "",

    terms: quotation.terms ?? quotation.businessTermsSnapshot ?? "",

    footerNote:
      quotation.footerNote ?? quotation.businessFooterNoteSnapshot ?? "",
  };
}

/* =========================================================
 * EXCEL EXPORT
 * ======================================================= */

export function exportQuotationToExcel(quotation: QuotationDetail) {
  const workbook = XLSX.utils.book_new();

  const businessName =
    quotation.businessNameSnapshot || quotation.organization?.name || "";

  const businessEmail =
    quotation.businessEmailSnapshot || quotation.organization?.email || "";

  const businessPhone =
    quotation.businessPhoneSnapshot || quotation.organization?.phone || "";

  const businessAddress =
    quotation.businessAddressSnapshot || quotation.organization?.address || "";

  const customer = quotation.customer;

  const rows: (string | number | null)[][] = [
    ["QUOTATION"],
    [""],

    ["Business Name", businessName],
    ["Business Email", businessEmail],
    ["Business Phone", businessPhone],
    ["Business Address", businessAddress],
    [""],

    ["Quotation Number", quotation.quotationNumber],
    ["Revision", quotation.revisionNumber ?? 1],
    ["Issue Date", excelDate(quotation.issueDate)],
    ["Valid Until", excelDate(quotation.validUntil)],
    ["Status", quotation.status],
    ["Currency", quotation.currency],
    [""],

    ["CUSTOMER DETAILS"],
    ["Customer Name", customer.name],
    ["Customer Company", customer.companyName ?? ""],
    ["Customer Email", customer.email ?? ""],
    ["Customer Phone", customer.phone ?? ""],
    ["Customer Address", customer.address ?? ""],
    [""],

    ["Subject", quotation.subject ?? ""],
    ["Message", quotation.quotationMessage ?? ""],
    [""],

    ["ITEMS"],
    ["No.", "Item", "Description", "Quantity", "Unit", "Unit Price", "Amount"],
  ];

  const items = quotation.items ?? [];

  items.forEach((item, index) => {
    rows.push([
      index + 1,
      item.name,
      item.description ?? "",
      excelNumber(item.quantity),
      item.unit,
      excelMoney(item.unitPrice),
      excelMoney(item.total),
    ]);
  });

  rows.push(
    [""],
    ["TOTALS"],
    ["Subtotal", excelMoney(quotation.subtotal)],
    ["Discount", excelMoney(quotation.discountAmount)],
    ["Tax", excelMoney(quotation.taxAmount)],
    ["TOTAL", excelMoney(quotation.total)],
    [""],

    ["NOTES"],
    [quotation.notes ?? ""],
    [""],

    ["TERMS & CONDITIONS"],
    [quotation.terms ?? ""],
    [""],

    ["FOOTER NOTE"],
    [quotation.footerNote ?? ""],
  );

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 18 },
    { wch: 28 },
    { wch: 42 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
  ];

  // Merge title
  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 6 },
    },
  ];

  // Find items header row dynamically
  const itemsHeaderRow = rows.findIndex(
    (row) => row[0] === "No." && row[1] === "Item" && row[5] === "Unit Price",
  );

  if (itemsHeaderRow >= 0) {
    const itemStartRow = itemsHeaderRow + 1;
    const itemEndRow = itemStartRow + items.length - 1;

    // Number formats for Quantity, Unit Price and Amount
    for (let rowIndex = itemStartRow; rowIndex <= itemEndRow; rowIndex++) {
      const quantityCell =
        worksheet[
          XLSX.utils.encode_cell({
            r: rowIndex,
            c: 3,
          })
        ];

      const unitPriceCell =
        worksheet[
          XLSX.utils.encode_cell({
            r: rowIndex,
            c: 5,
          })
        ];

      const amountCell =
        worksheet[
          XLSX.utils.encode_cell({
            r: rowIndex,
            c: 6,
          })
        ];

      if (quantityCell) {
        quantityCell.z = "#,##0.##";
      }

      if (unitPriceCell) {
        unitPriceCell.z = "#,##0.00";
      }

      if (amountCell) {
        amountCell.z = "#,##0.00";
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, "Quotation");

  const fileName = `${quotation.quotationNumber}-quotation.xlsx`;

  XLSX.writeFile(workbook, fileName);
}

/* =========================================================
 * WORD EXPORT
 * ======================================================= */

function wordText(
  text: string,
  options?: {
    bold?: boolean;
    size?: number;
    color?: string;
  },
) {
  return new TextRun({
    text,
    bold: options?.bold,
    size: options?.size,
    color: options?.color,
  });
}

function wordParagraph(
  children: TextRun[],
  options?: {
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacingAfter?: number;
  },
) {
  return new Paragraph({
    children,
    alignment: options?.alignment,
    spacing: {
      after: options?.spacingAfter ?? 100,
    },
  });
}

function tableCell(children: Paragraph[], width?: number) {
  return new TableCell({
    width: width
      ? {
          size: width,
          type: WidthType.PERCENTAGE,
        }
      : undefined,

    verticalAlign: VerticalAlign.CENTER,

    children,
  });
}

function headerCell(text: string) {
  return new TableCell({
    shading: {
      fill: "E5E7EB",
    },

    verticalAlign: VerticalAlign.CENTER,

    children: [
      new Paragraph({
        children: [
          wordText(text, {
            bold: true,
            size: 18,
          }),
        ],
      }),
    ],
  });
}

function formatMoney(value: string | number, currency: string) {
  const numericValue = amount(value);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(numericValue);
  } catch {
    return `${currency} ${numericValue.toFixed(2)}`;
  }
}

export async function exportQuotationToWord(quotation: QuotationDetail) {
  const business = getBusinessInfo(quotation);

  const content = getQuotationContent(quotation);

  const pdfPreferences = getQuotationPdfPreferences();

  console.log("pdfPreferences::", pdfPreferences);

  const showQuotationDetails = pdfPreferences.showQuotationDetails !== false;

  console.log("showQuotationDetails::", showQuotationDetails);

  const currency = quotation.currency;

  const children: (Paragraph | Table)[] = [];

  /*
   * Business header
   */
  children.push(
    wordParagraph(
      [
        wordText(business.name, {
          bold: true,
          size: 30,
        }),
      ],
      {
        spacingAfter: 80,
      },
    ),
  );

  if (business.address) {
    children.push(
      wordParagraph([
        wordText(business.address, {
          size: 18,
          color: "666666",
        }),
      ]),
    );
  }

  if (business.email || business.phone) {
    children.push(
      wordParagraph([
        wordText([business.email, business.phone].filter(Boolean).join(" • "), {
          size: 18,
          color: "666666",
        }),
      ]),
    );
  }

  const quotationDetailsChildren: Array<Paragraph | Table> = [];

  if (showQuotationDetails) {
    quotationDetailsChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "QUOTATION",
            bold: true,
            size: 28,
          }),
        ],
        spacing: {
          after: 100,
        },
      }),
    );

    quotationDetailsChildren.push(
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Quotation Number",
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: quotation.quotationNumber,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Date",
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: formatExportDate(quotation.issueDate),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Valid Until",
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: formatExportDate(quotation.validUntil),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );
  }

  children.push(...quotationDetailsChildren);
  /*
   * Customer section
   */
  children.push(
    new Paragraph({
      spacing: {
        before: 300,
        after: 100,
      },
      children: [
        wordText("CUSTOMER", {
          bold: true,
          size: 22,
        }),
      ],
    }),
  );

  children.push(
    wordParagraph([
      wordText(quotation.customer.name, {
        bold: true,
        size: 20,
      }),
    ]),
  );

  if (quotation.customer.companyName) {
    children.push(
      wordParagraph([
        wordText(quotation.customer.companyName, {
          size: 18,
        }),
      ]),
    );
  }

  if (quotation.customer.address) {
    children.push(
      wordParagraph([
        wordText(quotation.customer.address, {
          size: 18,
          color: "666666",
        }),
      ]),
    );
  }

  if (quotation.customer.email || quotation.customer.phone) {
    children.push(
      wordParagraph([
        wordText(
          [quotation.customer.email, quotation.customer.phone]
            .filter(Boolean)
            .join(" • "),
          {
            size: 18,
            color: "666666",
          },
        ),
      ]),
    );
  }

  /*
   * Subject and message
   */
  if (content.subject) {
    children.push(
      new Paragraph({
        spacing: {
          before: 250,
          after: 80,
        },
        children: [
          wordText("Subject: ", {
            bold: true,
            size: 20,
          }),
          wordText(content.subject, {
            size: 20,
          }),
        ],
      }),
    );
  }

  if (content.message) {
    children.push(
      wordParagraph([
        wordText(content.message, {
          size: 18,
        }),
      ]),
    );
  }

  /*
   * Items table
   */
  children.push(
    new Paragraph({
      spacing: {
        before: 300,
        after: 100,
      },
      children: [
        wordText("ITEMS", {
          bold: true,
          size: 22,
        }),
      ],
    }),
  );

  const itemRows = [
    new TableRow({
      children: [
        headerCell("Item"),
        headerCell("Description"),
        headerCell("Qty"),
        headerCell("Unit"),
        headerCell("Unit Price"),
        headerCell("Amount"),
      ],
    }),

    ...quotation.items.map(
      (item) =>
        new TableRow({
          children: [
            tableCell([
              wordParagraph([
                wordText(item.name, {
                  size: 16,
                }),
              ]),
            ]),

            tableCell([
              wordParagraph([
                wordText(item.description ?? "", {
                  size: 16,
                }),
              ]),
            ]),

            tableCell([
              wordParagraph([
                wordText(item.quantity, {
                  size: 16,
                }),
              ]),
            ]),

            tableCell([
              wordParagraph([
                wordText(item.unit, {
                  size: 16,
                }),
              ]),
            ]),

            tableCell([
              wordParagraph([
                wordText(formatMoney(item.unitPrice, currency), {
                  size: 16,
                }),
              ]),
            ]),

            tableCell([
              wordParagraph([
                wordText(formatMoney(item.total, currency), {
                  size: 16,
                }),
              ]),
            ]),
          ],
        }),
    ),
  ];

  children.push(
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: itemRows,
    }),
  );

  /*
   * Totals
   */
  children.push(
    new Paragraph({
      spacing: {
        before: 300,
        after: 100,
      },
      children: [
        wordText("TOTALS", {
          bold: true,
          size: 22,
        }),
      ],
    }),
  );

  children.push(
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          children: [
            tableCell([
              wordParagraph([
                wordText("Subtotal", {
                  bold: true,
                  size: 18,
                }),
              ]),
            ]),
            tableCell([
              wordParagraph([
                wordText(formatMoney(quotation.subtotal, currency), {
                  size: 18,
                }),
              ]),
            ]),
          ],
        }),

        new TableRow({
          children: [
            tableCell([
              wordParagraph([
                wordText("Discount", {
                  size: 18,
                }),
              ]),
            ]),
            tableCell([
              wordParagraph([
                wordText(formatMoney(quotation.discountAmount, currency), {
                  size: 18,
                }),
              ]),
            ]),
          ],
        }),

        new TableRow({
          children: [
            tableCell([
              wordParagraph([
                wordText("Tax", {
                  size: 18,
                }),
              ]),
            ]),
            tableCell([
              wordParagraph([
                wordText(formatMoney(quotation.taxAmount, currency), {
                  size: 18,
                }),
              ]),
            ]),
          ],
        }),

        new TableRow({
          children: [
            tableCell([
              wordParagraph([
                wordText("GRAND TOTAL", {
                  bold: true,
                  size: 20,
                }),
              ]),
            ]),
            tableCell([
              wordParagraph([
                wordText(formatMoney(quotation.total, currency), {
                  bold: true,
                  size: 20,
                }),
              ]),
            ]),
          ],
        }),
      ],
    }),
  );

  /*
   * Terms and footer
   */
  if (content.terms) {
    children.push(
      new Paragraph({
        spacing: {
          before: 300,
          after: 100,
        },
        children: [
          wordText("TERMS & CONDITIONS", {
            bold: true,
            size: 22,
          }),
        ],
      }),
    );

    children.push(
      wordParagraph([
        wordText(content.terms, {
          size: 18,
        }),
      ]),
    );
  }

  if (content.footerNote) {
    children.push(
      new Paragraph({
        spacing: {
          before: 250,
          after: 100,
        },
        children: [
          wordText(content.footerNote, {
            size: 18,
            color: "666666",
          }),
        ],
      }),
    );
  }

  const document = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(document);

  downloadBlob(blob, `QUFO-${quotation.quotationNumber}.docx`);
}
