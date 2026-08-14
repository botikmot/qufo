type QuotationFormNotesProps = {
  notes: string;
  terms: string;

  onNotesChange: (
    value: string,
  ) => void;

  onTermsChange: (
    value: string,
  ) => void;
};

export function QuotationFormNotes({
  notes,
  terms,
  onNotesChange,
  onTermsChange,
}: QuotationFormNotesProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Notes
        </label>

        <textarea
          rows={4}
          value={notes}
          onChange={(event) =>
            onNotesChange(
              event.target.value,
            )
          }
          className="qufo-input resize-none"
          placeholder="Optional notes..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Terms & Conditions
        </label>

        <textarea
          rows={4}
          value={terms}
          onChange={(event) =>
            onTermsChange(
              event.target.value,
            )
          }
          className="qufo-input resize-none"
          placeholder="Payment terms, delivery conditions..."
        />
      </div>
    </div>
  );
}