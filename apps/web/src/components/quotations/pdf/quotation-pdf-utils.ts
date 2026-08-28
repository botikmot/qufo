export function formatPdfMoney(
  value: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(value);
  } catch {
    return `${currency} ${value.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
  }
}

export function formatPdfDate(
  value: string | Date,
) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    },
  ).format(date);
}

export function getPdfLogoUrl(
  logoUrl?: string | null,
) {
  if (!logoUrl) {
    return null;
  }

  /*
   * @react-pdf/renderer is safest
   * with PNG/JPG.
   *
   * Convert Cloudinary logos to PNG
   * specifically for the PDF.
   */
  if (
    logoUrl.includes(
      "res.cloudinary.com",
    )
  ) {
    return logoUrl.replace(
      "/upload/",
      "/upload/f_png,q_auto/",
    );
  }

  return logoUrl;
}