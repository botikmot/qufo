import ExcelJS from "exceljs";

import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  type TableVerticalAlign,
} from "docx";

import { formatWarranty } from "@/utils/warranty";

import type { QuotationDetail } from "@/types/quotation";
import { getQuotationPdfPreferences } from "@/lib/quotation-pdf-preferences";

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

async function fetchExcelImage(url: string | null | undefined): Promise<{
  base64: string;
  extension: "png" | "jpeg";
} | null> {
  if (!url) return null;

  try {
    const response = await fetch(url);

    if (!response.ok) return null;

    const blob = await response.blob();

    let extension: "png" | "jpeg";

    if (blob.type === "image/png") {
      extension = "png";
    } else if (blob.type === "image/jpeg" || blob.type === "image/jpg") {
      extension = "jpeg";
    } else {
      return null;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result));

      reader.onerror = () => reject(new Error("Unable to read image"));

      reader.readAsDataURL(blob);
    });

    return {
      base64: dataUrl.split(",")[1],
      extension,
    };
  } catch (error) {
    console.warn("Excel image could not be loaded:", url, error);
    return null;
  }
}

function excelMoneyFormat(currency: string) {
  const safeCurrency = currency.replace(/"/g, '""');

  return `"${safeCurrency}" #,##0.00;[Red]-"${safeCurrency}" #,##0.00`;
}

export async function exportQuotationToExcel(quotation: QuotationDetail) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "QUFO";
  workbook.subject = `Quotation ${quotation.quotationNumber}`;
  workbook.title = `Quotation ${quotation.quotationNumber}`;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Quotation", {
    views: [{ showGridLines: false }],
    pageSetup: {
      paperSize: 9,
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
    },
  });

  const GREEN = "059669";
  const DARK = "111827";
  const GRAY = "6B7280";
  const BORDER = "E5E7EB";
  const LIGHT = "F8FAFC";
  const WHITE = "FFFFFF";

  const business = getBusinessInfo(quotation);
  const content = getQuotationContent(quotation);
  const customer = quotation.customer;
  const currency = quotation.currency;
  const items = quotation.items ?? [];

  worksheet.columns = [
    { width: 6 }, // A: #
    { width: 10 }, // B: Image
    { width: 34 }, // C: Description
    { width: 10 }, // D: Quantity
    { width: 10 }, // E: Unit
    { width: 16 }, // F: Rate
    { width: 17 }, // G: Amount
  ];

  worksheet.properties.defaultRowHeight = 20;

  const moneyFormat = excelMoneyFormat(currency);

  function styleText(
    cell: ExcelJS.Cell,
    options: {
      bold?: boolean;
      color?: string;
      size?: number;
    } = {},
  ) {
    cell.font = {
      name: "Arial",
      size: options.size ?? 10,
      bold: options.bold ?? false,
      color: { argb: options.color ?? DARK },
    };

    cell.alignment = {
      vertical: "middle",
      wrapText: true,
    };
  }

  function bottomBorder(rowNumber: number) {
    for (let col = 1; col <= 7; col++) {
      worksheet.getCell(rowNumber, col).border = {
        bottom: {
          style: "thin",
          color: { argb: BORDER },
        },
      };
    }
  }

  // --------------------------------------------------
  // BUSINESS HEADER
  // --------------------------------------------------

  worksheet.mergeCells("A1:B4");
  worksheet.mergeCells("C1:E1");
  worksheet.mergeCells("C2:E2");
  worksheet.mergeCells("C3:E3");
  worksheet.mergeCells("C4:E4");
  worksheet.mergeCells("F1:G1");
  worksheet.mergeCells("F2:G2");
  worksheet.mergeCells("F3:G3");
  worksheet.mergeCells("F4:G4");

  worksheet.getRow(1).height = 30;
  worksheet.getRow(2).height = 23;
  worksheet.getRow(3).height = 19;
  worksheet.getRow(4).height = 19;

  worksheet.getCell("C1").value = business.name;
  styleText(worksheet.getCell("C1"), {
    bold: true,
    size: 16,
  });

  worksheet.getCell("C2").value = business.address;
  styleText(worksheet.getCell("C2"), {
    color: GRAY,
    size: 9,
  });

  worksheet.getCell("C3").value = business.email;
  styleText(worksheet.getCell("C3"), {
    color: GRAY,
    size: 9,
  });

  worksheet.getCell("C4").value = business.phone;
  styleText(worksheet.getCell("C4"), {
    color: GRAY,
    size: 9,
  });

  worksheet.getCell("F1").value = "QUOTATION";
  styleText(worksheet.getCell("F1"), {
    bold: true,
    size: 20,
  });
  worksheet.getCell("F1").alignment = {
    horizontal: "right",
    vertical: "middle",
  };

  worksheet.getCell("F2").value = quotation.quotationNumber;
  styleText(worksheet.getCell("F2"), {
    bold: true,
    color: GREEN,
    size: 10,
  });
  worksheet.getCell("F2").alignment = {
    horizontal: "right",
    vertical: "middle",
  };

  worksheet.getCell("F3").value = `Revision ${quotation.revisionNumber ?? 1}`;
  styleText(worksheet.getCell("F3"), {
    color: GRAY,
    size: 9,
  });
  worksheet.getCell("F3").alignment = {
    horizontal: "right",
    vertical: "middle",
  };

  worksheet.getCell("F4").value =
    `Date: ${excelDate(quotation.issueDate)}` +
    (quotation.validUntil
      ? `\nValid until: ${excelDate(quotation.validUntil)}`
      : "");

  styleText(worksheet.getCell("F4"), {
    color: GRAY,
    size: 9,
  });
  worksheet.getCell("F4").alignment = {
    horizontal: "right",
    vertical: "middle",
    wrapText: true,
  };

  const logo = await fetchExcelImage(business.logoUrl);

  if (logo) {
    const imageId = workbook.addImage(logo);

    worksheet.addImage(imageId, {
      tl: { col: 0.25, row: 0.2 },
      ext: { width: 54, height: 54 },
      editAs: "oneCell",
    });
  }

  for (let row = 1; row <= 4; row++) {
    worksheet.getRow(row).eachCell((cell) => {
      cell.alignment = {
        ...cell.alignment,
        vertical: "middle",
      };
    });
  }

  // Green divider
  worksheet.mergeCells("A6:G6");
  worksheet.getRow(6).height = 3;
  worksheet.getCell("A6").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: GREEN },
  };

  // --------------------------------------------------
  // CUSTOMER AND SUBJECT
  // --------------------------------------------------

  worksheet.mergeCells("A8:D8");
  worksheet.getCell("A8").value = "CUSTOMER";
  styleText(worksheet.getCell("A8"), {
    bold: true,
    color: GREEN,
    size: 9,
  });

  worksheet.mergeCells("A9:D9");
  worksheet.getCell("A9").value = customer.companyName || customer.name;
  styleText(worksheet.getCell("A9"), {
    bold: true,
    size: 12,
  });

  const customerDetails = [
    customer.companyName ? customer.name : "",
    customer.address ?? "",
    customer.email ?? "",
    customer.phone ?? "",
  ].filter(Boolean);

  customerDetails.forEach((detail, index) => {
    const row = 10 + index;

    worksheet.mergeCells(`A${row}:D${row}`);
    worksheet.getCell(`A${row}`).value = detail;

    styleText(worksheet.getCell(`A${row}`), {
      color: GRAY,
      size: 9,
    });

    worksheet.getRow(row).height = 18;
  });

  worksheet.mergeCells("E8:G8");
  worksheet.getCell("E8").value = "QUOTATION DETAILS";
  styleText(worksheet.getCell("E8"), {
    bold: true,
    color: GREEN,
    size: 9,
  });

  const details = [
    ["Quotation No.", quotation.quotationNumber],
    ["Issue Date", excelDate(quotation.issueDate)],
    ["Valid Until", excelDate(quotation.validUntil)],
    ["Status", quotation.status],
  ];

  details.forEach(([label, value], index) => {
    const row = 9 + index;

    worksheet.getCell(`E${row}`).value = label;
    worksheet.mergeCells(`F${row}:G${row}`);
    worksheet.getCell(`F${row}`).value = value;

    styleText(worksheet.getCell(`E${row}`), {
      color: GRAY,
      size: 9,
    });

    styleText(worksheet.getCell(`F${row}`), {
      bold: true,
      size: 9,
    });
  });

  let row = Math.max(15, 10 + customerDetails.length);

  if (content.subject?.trim()) {
    worksheet.mergeCells(`A${row}:G${row}`);
    worksheet.getCell(`A${row}`).value = "SUBJECT";
    styleText(worksheet.getCell(`A${row}`), {
      bold: true,
      color: GREEN,
      size: 9,
    });

    row++;

    worksheet.mergeCells(`A${row}:G${row}`);
    worksheet.getCell(`A${row}`).value = content.subject.trim();
    styleText(worksheet.getCell(`A${row}`), {
      bold: true,
      size: 11,
    });

    row += 2;
  }

  if (content.message?.trim()) {
    worksheet.mergeCells(`A${row}:G${row}`);
    worksheet.getCell(`A${row}`).value = content.message.trim();
    styleText(worksheet.getCell(`A${row}`), {
      color: GRAY,
      size: 9,
    });

    worksheet.getRow(row).height = 30;
    row += 2;
  }

  // --------------------------------------------------
  // ITEMS TABLE
  // --------------------------------------------------

  worksheet.mergeCells(`A${row}:G${row}`);
  worksheet.getCell(`A${row}`).value = "ITEMS";
  styleText(worksheet.getCell(`A${row}`), {
    bold: true,
    color: GREEN,
    size: 10,
  });
  worksheet.getRow(row).height = 25;

  row++;

  const headerRow = row;

  worksheet.getRow(headerRow).values = [
    "#",
    "Image",
    "Description",
    "Qty",
    "Unit",
    "Rate",
    "Amount",
  ];

  worksheet.getRow(headerRow).height = 26;

  worksheet.getRow(headerRow).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: LIGHT },
    };

    cell.font = {
      name: "Arial",
      size: 9,
      bold: true,
      color: { argb: "64748B" },
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };

    cell.border = {
      top: { style: "thin", color: { argb: BORDER } },
      bottom: { style: "thin", color: { argb: BORDER } },
    };
  });

  row++;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    const warrantyText =
      item.warrantyDuration && item.warrantyUnit
        ? `Warranty: ${item.warrantyDuration} ${item.warrantyUnit.toLowerCase()}`
        : "";

    const description = [
      item.name,
      item.description?.trim() ?? "",
      warrantyText,
      item.warrantyTerms?.trim() ?? "",
    ]
      .filter(Boolean)
      .join("\n");

    const itemRow = row;

    worksheet.getRow(itemRow).values = [
      index + 1,
      "",
      description,
      excelNumber(item.quantity),
      item.unit,
      excelMoney(item.unitPrice),
      excelMoney(item.total),
    ];

    worksheet.getRow(itemRow).height = 48;

    worksheet.getRow(itemRow).eachCell((cell, colNumber) => {
      styleText(cell, {
        size: 9,
        bold: colNumber === 3,
      });

      cell.border = {
        bottom: {
          style: "thin",
          color: { argb: BORDER },
        },
      };
    });

    worksheet.getCell(`C${itemRow}`).alignment = {
      vertical: "middle",
      wrapText: true,
    };

    worksheet.getCell(`D${itemRow}`).alignment = {
      horizontal: "right",
      vertical: "middle",
    };

    worksheet.getCell(`E${itemRow}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.getCell(`F${itemRow}`).alignment = {
      horizontal: "right",
      vertical: "middle",
    };

    worksheet.getCell(`G${itemRow}`).alignment = {
      horizontal: "right",
      vertical: "middle",
    };

    worksheet.getCell(`F${itemRow}`).numFmt = moneyFormat;
    worksheet.getCell(`G${itemRow}`).numFmt = moneyFormat;

    const image = await fetchExcelImage(item.imageUrl);

    if (image) {
      const imageId = workbook.addImage(image);

      worksheet.addImage(imageId, {
        tl: { col: 1.2, row: itemRow - 0.85 },
        ext: { width: 34, height: 34 },
        editAs: "oneCell",
      });
    }

    row++;
  }

  // --------------------------------------------------
  // TOTALS
  // --------------------------------------------------

  row += 1;

  const totals = [
    ["Subtotal", excelMoney(quotation.subtotal)],
    ["Discount", excelMoney(quotation.discountAmount)],
    ["Tax", excelMoney(quotation.taxAmount)],
    ["TOTAL", excelMoney(quotation.total)],
  ];

  for (const [label, value] of totals) {
    worksheet.mergeCells(`E${row}:F${row}`);

    worksheet.getCell(`E${row}`).value = label;
    worksheet.getCell(`G${row}`).value = value;

    styleText(worksheet.getCell(`E${row}`), {
      bold: label === "TOTAL",
      size: label === "TOTAL" ? 11 : 9,
      color: label === "TOTAL" ? DARK : GRAY,
    });

    styleText(worksheet.getCell(`G${row}`), {
      bold: label === "TOTAL",
      size: label === "TOTAL" ? 14 : 9,
      color: label === "TOTAL" ? GREEN : DARK,
    });

    worksheet.getCell(`G${row}`).numFmt = moneyFormat;

    worksheet.getCell(`E${row}`).alignment = {
      horizontal: "right",
      vertical: "middle",
    };

    worksheet.getCell(`G${row}`).alignment = {
      horizontal: "right",
      vertical: "middle",
    };

    if (label === "TOTAL") {
      worksheet.getCell(`E${row}`).border = {
        top: { style: "medium", color: { argb: GREEN } },
      };

      worksheet.getCell(`G${row}`).border = {
        top: { style: "medium", color: { argb: GREEN } },
      };
    }

    worksheet.getRow(row).height = label === "TOTAL" ? 30 : 22;
    row++;
  }

  // --------------------------------------------------
  // NOTES AND TERMS
  // --------------------------------------------------

  function addTextSection(title: string, text: string | null | undefined) {
    if (!text?.trim()) return;

    row += 1;

    worksheet.mergeCells(`A${row}:G${row}`);
    worksheet.getCell(`A${row}`).value = title;
    styleText(worksheet.getCell(`A${row}`), {
      bold: true,
      color: GREEN,
      size: 9,
    });

    row++;

    worksheet.mergeCells(`A${row}:G${row}`);
    worksheet.getCell(`A${row}`).value = text.trim();
    styleText(worksheet.getCell(`A${row}`), {
      color: GRAY,
      size: 9,
    });

    worksheet.getRow(row).height = 32;
    row++;
  }

  addTextSection("NOTES", quotation.notes);
  addTextSection("TERMS & CONDITIONS", content.terms);
  addTextSection("FOOTER NOTE", content.footerNote);

  // --------------------------------------------------
  // SIGNATURES
  // --------------------------------------------------

  row += 2;

  worksheet.mergeCells(`A${row}:C${row}`);
  worksheet.mergeCells(`E${row}:G${row}`);

  worksheet.getCell(`A${row}`).value = "PREPARED / AUTHORIZED BY";
  worksheet.getCell(`E${row}`).value = "ACCEPTED / CONFORME";

  for (const address of [`A${row}`, `E${row}`]) {
    styleText(worksheet.getCell(address), {
      color: GRAY,
      size: 8,
    });
  }

  row += 3;

  worksheet.mergeCells(`A${row}:C${row}`);
  worksheet.mergeCells(`E${row}:G${row}`);

  worksheet.getCell(`A${row}`).value = business.name
    ? quotation.createdBy.name
    : "";

  worksheet.getCell(`E${row}`).value = "Signature over Printed Name";

  for (const address of [`A${row}`, `E${row}`]) {
    styleText(worksheet.getCell(address), {
      bold: true,
      size: 9,
    });

    worksheet.getCell(address).border = {
      top: { style: "thin", color: { argb: "9CA3AF" } },
    };
  }

  row++;

  worksheet.mergeCells(`A${row}:C${row}`);

  worksheet.getCell(`A${row}`).value =
    quotation.organization.quotationSignatoryTitle ?? "Owner / Manager";

  styleText(worksheet.getCell(`A${row}`), {
    color: GRAY,
    size: 8,
  });

  // Optional authorized signature image
  if (
    quotation.organization.showQuotationSignature &&
    quotation.organization.quotationSignatureUrl
  ) {
    const signature = await fetchExcelImage(
      quotation.organization.quotationSignatureUrl,
    );

    if (signature) {
      const imageId = workbook.addImage(signature);

      worksheet.addImage(imageId, {
        tl: { col: 0.25, row: row - 2.6 },
        ext: { width: 105, height: 35 },
        editAs: "oneCell",
      });
    }
  }

  // --------------------------------------------------
  // PRINT SETTINGS AND DOWNLOAD
  // --------------------------------------------------

  worksheet.pageSetup.printArea = `A1:G${row}`;
  worksheet.pageSetup.horizontalCentered = true;

  worksheet.headerFooter.oddFooter = "&CQUFO - Quotation";

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  downloadBlob(blob, `${quotation.quotationNumber}-quotation.xlsx`);
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

type WordImage = {
  data: Uint8Array;
  type: "png" | "jpg";
};

async function fetchWordImage(
  url: string | null | undefined,
): Promise<WordImage | null> {
  if (!url) return null;

  try {
    const response = await fetch(url);

    if (!response.ok) return null;

    const blob = await response.blob();
    const mime = blob.type.toLowerCase().split(";")[0];

    let type: "png" | "jpg";

    if (mime === "image/png") {
      type = "png";
    } else if (mime === "image/jpeg" || mime === "image/jpg") {
      type = "jpg";
    } else {
      return null;
    }

    const buffer = await blob.arrayBuffer();

    return {
      data: new Uint8Array(buffer),
      type,
    };
  } catch (error) {
    console.warn("Unable to load Word export image:", url, error);
    return null;
  }
}

function wordImageParagraph(
  image: WordImage | null,
  width: number,
  height: number,
  alignment = AlignmentType.LEFT,
): Paragraph {
  return new Paragraph({
    alignment,
    spacing: { before: 0, after: 0 },
    children: image
      ? [
          new ImageRun({
            data: image.data,
            type: image.type,
            transformation: { width, height },
          }),
        ]
      : [],
  });
}

function wordStyledCell(
  children: Paragraph[],
  options: {
    width?: number;
    fill?: string;
    verticalAlign?: TableVerticalAlign;
  } = {},
): TableCell {
  return new TableCell({
    width: options.width
      ? {
          size: options.width,
          type: WidthType.PERCENTAGE,
        }
      : undefined,

    shading: options.fill ? { fill: options.fill } : undefined,

    verticalAlign: options.verticalAlign ?? VerticalAlign.CENTER,

    margins: {
      top: 90,
      bottom: 90,
      left: 100,
      right: 100,
    },

    children,
  });
}

function wordStyledHeaderCell(label: string, width: number): TableCell {
  return wordStyledCell(
    [
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text: label,
            bold: true,
            size: 16,
            color: "64748B",
            font: "Arial",
          }),
        ],
      }),
    ],
    {
      width,
      fill: "F8FAFC",
    },
  );
}

function wordBodyCell(
  value: string,
  options: {
    width: number;
    bold?: boolean;
    color?: string;
    size?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    fill?: string;
  },
): TableCell {
  return wordStyledCell(
    [
      new Paragraph({
        alignment: options.alignment,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text: value,
            font: "Arial",
            size: options.size ?? 17,
            bold: options.bold ?? false,
            color: options.color ?? "374151",
          }),
        ],
      }),
    ],
    {
      width: options.width,
      fill: options.fill,
    },
  );
}

const wordTableBorders = {
  top: {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "E5E7EB",
  },
  bottom: {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "E5E7EB",
  },
  left: {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "E5E7EB",
  },
  right: {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "E5E7EB",
  },
  insideHorizontal: {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "E5E7EB",
  },
  insideVertical: {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "E5E7EB",
  },
};

export async function exportQuotationToWord(quotation: QuotationDetail) {
  const business = getBusinessInfo(quotation);
  const content = getQuotationContent(quotation);
  const pdfPreferences = getQuotationPdfPreferences();

  const showQuotationDetails = pdfPreferences.showQuotationDetails !== false;

  const currency = quotation.currency;
  const children: (Paragraph | Table)[] = [];

  const logo = await fetchWordImage(business.logoUrl);

  const signature = quotation.organization.showQuotationSignature
    ? await fetchWordImage(quotation.organization.quotationSignatureUrl)
    : null;

  const green = "059669";
  const dark = "111827";
  const gray = "6B7280";

  const spacer = (after = 120) =>
    new Paragraph({
      spacing: { before: 0, after },
      children: [],
    });

  const heading = (text: string) =>
    new Paragraph({
      spacing: { before: 260, after: 100 },
      children: [
        new TextRun({
          text,
          font: "Arial",
          bold: true,
          size: 19,
          color: green,
          characterSpacing: 12,
        }),
      ],
    });

  const bodyText = (
    text: string,
    options: {
      bold?: boolean;
      color?: string;
      size?: number;
      alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    } = {},
  ) =>
    new Paragraph({
      alignment: options.alignment,
      spacing: { before: 0, after: 65 },
      children: [
        new TextRun({
          text,
          font: "Arial",
          size: options.size ?? 17,
          bold: options.bold ?? false,
          color: options.color ?? "4B5563",
        }),
      ],
    });

  // --------------------------------------------------
  // HEADER: LOGO + BUSINESS + QUOTATION DETAILS
  // --------------------------------------------------

  const businessParagraphs: Paragraph[] = [
    bodyText(business.name, {
      bold: true,
      color: dark,
      size: 28,
    }),
  ];

  for (const detail of [business.address, business.email, business.phone]) {
    if (detail) {
      businessParagraphs.push(
        bodyText(detail, {
          color: gray,
          size: 16,
        }),
      );
    }
  }

  const quotationHeaderParagraphs: Paragraph[] = [];

  if (showQuotationDetails) {
    quotationHeaderParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: "QUOTATION",
            font: "Arial",
            bold: true,
            size: 36,
            color: dark,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: quotation.quotationNumber,
            font: "Arial",
            bold: true,
            size: 19,
            color: green,
          }),
        ],
      }),
    );

    if ((quotation.revisionNumber ?? 1) > 1) {
      quotationHeaderParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `Revision ${quotation.revisionNumber}`,
              font: "Arial",
              size: 16,
              color: gray,
            }),
          ],
        }),
      );
    }

    quotationHeaderParagraphs.push(
      bodyText(`Date: ${formatExportDate(quotation.issueDate)}`, {
        alignment: AlignmentType.RIGHT,
        color: gray,
        size: 16,
      }),
    );

    if (quotation.validUntil) {
      quotationHeaderParagraphs.push(
        bodyText(`Valid until: ${formatExportDate(quotation.validUntil)}`, {
          alignment: AlignmentType.RIGHT,
          color: gray,
          size: 16,
        }),
      );
    }
  }

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [1224, 5103, 3879],
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: {
        style: BorderStyle.SINGLE,
        size: 8,
        color: "E5E7EB",
      },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: {
        style: BorderStyle.NONE,
        size: 0,
        color: "FFFFFF",
      },
      insideVertical: {
        style: BorderStyle.NONE,
        size: 0,
        color: "FFFFFF",
      },
    },
    rows: [
      new TableRow({
        children: [
          wordStyledCell(logo ? [wordImageParagraph(logo, 62, 62)] : [], {
            width: 12,
          }),
          wordStyledCell(businessParagraphs, { width: 50 }),
          wordStyledCell(quotationHeaderParagraphs, { width: 38 }),
        ],
      }),
    ],
  });

  children.push(headerTable, spacer(260));

  // --------------------------------------------------
  // CUSTOMER
  // --------------------------------------------------

  //children.push(heading("CUSTOMER"));

  children.push(
    bodyText(quotation.customer.companyName || quotation.customer.name, {
      bold: true,
      color: dark,
      size: 21,
    }),
  );

  if (quotation.customer.companyName && quotation.customer.name) {
    children.push(
      bodyText(quotation.customer.name, {
        color: gray,
        size: 16,
      }),
    );
  }

  for (const detail of [
    quotation.customer.address,
    quotation.customer.email,
    quotation.customer.phone,
  ]) {
    if (detail) {
      children.push(bodyText(detail, { color: gray, size: 16 }));
    }
  }

  // --------------------------------------------------
  // SUBJECT AND MESSAGE
  // --------------------------------------------------

  if (content.subject?.trim()) {
    children.push(heading("SUBJECT"));
    children.push(
      bodyText(content.subject.trim(), {
        bold: true,
        color: dark,
        size: 20,
      }),
    );
  }

  if (content.message?.trim()) {
    children.push(spacer(50));
    children.push(bodyText(content.message.trim()));
  }

  // --------------------------------------------------
  // ITEMS TABLE WITH EMBEDDED IMAGES
  // --------------------------------------------------

  children.push(heading("ITEMS"));

  const itemRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        wordStyledHeaderCell("#", 6),
        wordStyledHeaderCell("Image", 12),
        wordStyledHeaderCell("Description", 36),
        wordStyledHeaderCell("Qty", 9),
        wordStyledHeaderCell("Unit", 9),
        wordStyledHeaderCell("Rate", 14),
        wordStyledHeaderCell("Amount", 14),
      ],
    }),
  ];

  for (let index = 0; index < quotation.items.length; index++) {
    const item = quotation.items[index];

    const image = await fetchWordImage(item.imageUrl);

    const warranty = formatWarranty(item.warrantyDuration, item.warrantyUnit);

    const descriptionParagraphs: Paragraph[] = [
      bodyText(item.name, {
        bold: true,
        color: dark,
        size: 17,
      }),
    ];

    if (item.description?.trim()) {
      descriptionParagraphs.push(
        bodyText(item.description.trim(), {
          color: gray,
          size: 15,
        }),
      );
    }

    if (warranty) {
      descriptionParagraphs.push(
        bodyText(`Warranty: ${warranty}`, {
          color: "334155",
          size: 15,
        }),
      );
    }

    if (warranty && item.warrantyTerms?.trim()) {
      descriptionParagraphs.push(
        bodyText(item.warrantyTerms.trim(), {
          color: gray,
          size: 14,
        }),
      );
    }

    itemRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          wordBodyCell(String(index + 1), {
            width: 6,
            alignment: AlignmentType.CENTER,
          }),

          wordStyledCell(
            image
              ? [wordImageParagraph(image, 48, 48)]
              : [bodyText("—", { color: gray })],
            { width: 12 },
          ),

          wordStyledCell(descriptionParagraphs, {
            width: 36,
          }),

          wordBodyCell(String(item.quantity), {
            width: 9,
            alignment: AlignmentType.RIGHT,
          }),

          wordBodyCell(item.unit || "-", {
            width: 9,
            alignment: AlignmentType.CENTER,
          }),

          wordBodyCell(formatMoney(item.unitPrice, currency), {
            width: 14,
            alignment: AlignmentType.RIGHT,
          }),

          wordBodyCell(formatMoney(item.total, currency), {
            width: 14,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      }),
    );
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [6, 12, 36, 9, 9, 14, 14],
      borders: wordTableBorders,
      rows: itemRows,
    }),
  );

  // --------------------------------------------------
  // TOTALS
  // --------------------------------------------------

  children.push(spacer(100));

  const totalsRows: TableRow[] = [];

  const totalEntries = [
    {
      label: "Subtotal",
      value: formatMoney(quotation.subtotal, currency),
      total: false,
    },
    {
      label: "Discount",
      value: formatMoney(quotation.discountAmount, currency),
      total: false,
    },
    {
      label: "Tax",
      value: formatMoney(quotation.taxAmount, currency),
      total: false,
    },
    {
      label: "TOTAL",
      value: formatMoney(quotation.total, currency),
      total: true,
    },
  ];

  for (const entry of totalEntries) {
    if (
      !entry.total &&
      amount(
        entry.label === "Discount"
          ? quotation.discountAmount
          : entry.label === "Tax"
            ? quotation.taxAmount
            : quotation.subtotal,
      ) === 0 &&
      entry.label !== "Subtotal"
    ) {
      continue;
    }

    totalsRows.push(
      new TableRow({
        children: [
          wordStyledCell(
            [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: entry.label,
                    font: "Arial",
                    bold: entry.total,
                    size: entry.total ? 20 : 17,
                    color: entry.total ? dark : gray,
                  }),
                ],
              }),
            ],
            { width: 65 },
          ),

          wordStyledCell(
            [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: entry.value,
                    font: "Arial",
                    bold: entry.total,
                    size: entry.total ? 26 : 17,
                    color: entry.total ? green : dark,
                  }),
                ],
              }),
            ],
            { width: 35 },
          ),
        ],
      }),
    );
  }

  children.push(
    new Table({
      width: { size: 55, type: WidthType.PERCENTAGE },
      columnWidths: [65, 35],
      alignment: AlignmentType.RIGHT,
      borders: {
        top: {
          style: BorderStyle.NONE,
          size: 0,
          color: "FFFFFF",
        },
        bottom: {
          style: BorderStyle.NONE,
          size: 0,
          color: "FFFFFF",
        },
        left: {
          style: BorderStyle.NONE,
          size: 0,
          color: "FFFFFF",
        },
        right: {
          style: BorderStyle.NONE,
          size: 0,
          color: "FFFFFF",
        },
        insideHorizontal: {
          style: BorderStyle.NONE,
          size: 0,
          color: "FFFFFF",
        },
        insideVertical: {
          style: BorderStyle.NONE,
          size: 0,
          color: "FFFFFF",
        },
      },
      rows: totalsRows,
    }),
  );

  // --------------------------------------------------
  // NOTES, TERMS, FOOTER
  // --------------------------------------------------

  const addSection = (title: string, value: string | null | undefined) => {
    if (!value?.trim()) return;

    children.push(heading(title));
    children.push(bodyText(value.trim()));
  };

  addSection("NOTES", quotation.notes);

  // Terms & Conditions — separate section below totals
  if (content.terms?.trim()) {
    children.push(
      new Paragraph({
        spacing: {
          before: 300,
          after: 100,
        },
        border: {
          top: {
            style: BorderStyle.SINGLE,
            size: 4,
            color: "E5E7EB",
            space: 8,
          },
        },
        children: [
          new TextRun({
            text: "TERMS & CONDITIONS",
            font: "Arial",
            bold: true,
            size: 19,
            color: "111827",
            characterSpacing: 12,
          }),
        ],
      }),
    );

    children.push(
      new Paragraph({
        spacing: {
          before: 0,
          after: 100,
          line: 260,
        },
        children: [
          new TextRun({
            text: content.terms.trim().replace(/\s{2,}/g, "\n"),
            font: "Arial",
            size: 16,
            color: "4B5563",
          }),
        ],
      }),
    );
  }

  if (content.footerNote?.trim()) {
    children.push(
      new Paragraph({
        spacing: {
          before: 320, // dugang space sa ibabaw
          after: 100,
        },
        children: [
          new TextRun({
            text: content.footerNote.trim(),
            font: "Arial",
            size: 16,
            color: "6B7280",
          }),
        ],
      }),
    );
  }

  // --------------------------------------------------
  // SIGNATURES / CONFORME
  // --------------------------------------------------

  children.push(spacer(250));

  const signatoryName =
    quotation.organization.quotationSignatoryName?.trim() ||
    quotation.createdBy.name;

  const signatoryTitle =
    quotation.organization.quotationSignatoryTitle?.trim() || null;

  const leftSignatureChildren: Paragraph[] = [
    bodyText("PREPARED / AUTHORIZED BY", {
      color: gray,
      size: 14,
    }),
    spacer(400),
    ...(signature ? [wordImageParagraph(signature, 100, 36)] : [spacer(150)]),
    bodyText(signatoryName, {
      bold: true,
      color: dark,
      size: 17,
    }),
  ];

  if (signatoryTitle) {
    leftSignatureChildren.push(
      bodyText(signatoryTitle, {
        color: gray,
        size: 14,
      }),
    );
  }

  const rightSignatureChildren: Paragraph[] = [];

  if (pdfPreferences.showAcceptedConforme !== false) {
    rightSignatureChildren.push(
      bodyText("ACCEPTED / CONFORME", {
        color: gray,
        size: 14,
      }),
      spacer(550),
      bodyText("Signature over Printed Name", {
        bold: true,
        color: dark,
        size: 17,
      }),
    );
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [50, 50],
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideHorizontal: {
          style: BorderStyle.NONE,
          size: 0,
          color: "FFFFFF",
        },
        insideVertical: {
          style: BorderStyle.NONE,
          size: 0,
          color: "FFFFFF",
        },
      },
      rows: [
        new TableRow({
          cantSplit: true,
          children: [
            wordStyledCell(leftSignatureChildren, {
              width: 50,
            }),
            wordStyledCell(rightSignatureChildren, {
              width: 50,
            }),
          ],
        }),
      ],
    }),
  );

  // --------------------------------------------------
  // DOCUMENT SETTINGS
  // --------------------------------------------------

  const document = new Document({
    creator: "QUFO",
    title: `Quotation ${quotation.quotationNumber}`,
    description: `Quotation prepared by ${business.name}`,
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906,
              height: 16838,
            },
            margin: {
              top: 720,
              bottom: 720,
              left: 850,
              right: 850,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(document);

  downloadBlob(blob, `QUFO-${quotation.quotationNumber}.docx`);
}
