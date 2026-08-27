const CURRENCY_LOCALES: Record<string, string> = {
  PHP: "en-PH",
  USD: "en-US",
  AUD: "en-AU",
  GBP: "en-GB",
  EUR: "en-IE",
  CAD: "en-CA",
  SGD: "en-SG",
  JPY: "ja-JP",
  NZD: "en-NZ",
};

export function formatCurrency(
  value: number | string,
  currency = "PHP",
) {
  const amount =
    typeof value === "number"
      ? value
      : Number(value);

  const normalizedCurrency =
    currency.trim().toUpperCase();

  const locale =
    CURRENCY_LOCALES[
      normalizedCurrency
    ] ?? "en-US";

  return new Intl.NumberFormat(
    locale,
    {
      style: "currency",
      currency:
        normalizedCurrency,
    },
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0,
  );
}