export function formatCurrency(
  value: number | string,
  currency = "PHP",
  locale = "en-PH",
) {
  const amount =
    typeof value === "number"
      ? value
      : Number(value);

  return new Intl.NumberFormat(
    locale,
    {
      style: "currency",
      currency,
    },
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0,
  );
}