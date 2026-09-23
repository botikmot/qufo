type QuotationFormNotesProps = {
  notes: string;
  footerNote: string;
  terms: string;

  onNotesChange: (value: string) => void;
  onTermsChange: (value: string) => void;
  onFooterNoteChange: (value: string) => void;
};

export function QuotationFormNotes({
  notes,
  footerNote,
  terms,
  onNotesChange,
  onTermsChange,
  onFooterNoteChange,
}: QuotationFormNotesProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* Notes */}
      <div>
        <label className="mb-2 block text-sm text-slate-400">Notes</label>

        <textarea
          rows={4}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          className="qufo-input resize-none"
          placeholder="Optional notes..."
        />
      </div>

      {/* Terms & Conditions */}
      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Terms & Conditions
        </label>

        <textarea
          rows={4}
          value={terms}
          onChange={(event) => onTermsChange(event.target.value)}
          className="qufo-input resize-none"
          placeholder="Payment terms, delivery conditions..."
        />
      </div>

      {/* Footer Note */}
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm text-slate-400">Footer Note</label>

        <textarea
          rows={3}
          value={footerNote}
          onChange={(event) => onFooterNoteChange(event.target.value)}
          className="qufo-input resize-none"
          placeholder="Thank you for your business. We look forward to working with you."
        />

        <p className="mt-2 text-xs text-slate-500">
          Custom footer note for this quotation.
        </p>
      </div>
    </div>
  );
}
