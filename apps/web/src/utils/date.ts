export function formatDate(
  value: string | Date,
  locale = "en-PH",
) {
  return new Intl.DateTimeFormat(
    locale,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(
    new Date(value),
  );
}

export function formatDateTime(
  value: string | Date,
  locale = "en-PH",
) {
  return new Intl.DateTimeFormat(
    locale,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}

export function toDateInputValue(
  value?: string | Date | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
}