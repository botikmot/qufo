export function formatNumber(
  value: number | string,
  locale = "en-PH",
  maximumFractionDigits = 2,
) {
  const parsedValue =
    typeof value === "number"
      ? value
      : Number(value);

  return new Intl.NumberFormat(
    locale,
    {
      maximumFractionDigits,
    },
  ).format(
    Number.isFinite(parsedValue)
      ? parsedValue
      : 0,
  );
}

export function formatQuantity(
  value: number | string,
  locale = "en-PH",
) {
  return formatNumber(
    value,
    locale,
    3,
  );
}