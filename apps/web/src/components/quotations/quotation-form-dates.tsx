type QuotationFormDatesProps = {
  validUntil: string;

  onValidUntilChange: (
    value: string,
  ) => void;
};

export function QuotationFormDates({
  validUntil,
  onValidUntilChange,
}: QuotationFormDatesProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        Valid until
      </label>

      <input
        type="date"
        value={validUntil}
        onChange={(event) =>
          onValidUntilChange(
            event.target.value,
          )
        }
        className="qufo-input"
      />
    </div>
  );
}