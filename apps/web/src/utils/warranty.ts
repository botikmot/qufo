export type WarrantyUnit =
  | "DAYS"
  | "WEEKS"
  | "MONTHS"
  | "YEARS";

export function formatWarranty(
  duration?: number | null,
  unit?: WarrantyUnit | null,
) {
  if (!duration || !unit) {
    return null;
  }

  const labels: Record<
    WarrantyUnit,
    {
      singular: string;
      plural: string;
    }
  > = {
    DAYS: {
      singular: "day",
      plural: "days",
    },

    WEEKS: {
      singular: "week",
      plural: "weeks",
    },

    MONTHS: {
      singular: "month",
      plural: "months",
    },

    YEARS: {
      singular: "year",
      plural: "years",
    },
  };

  const label =
    duration === 1
      ? labels[unit].singular
      : labels[unit].plural;

  return `${duration} ${label}`;
}