import type { Quotation } from "@/types/quotation";

type QuotationNotesTermsProps = {
  quotation: Quotation;
};

export function QuotationNotesTerms({ quotation }: QuotationNotesTermsProps) {
  if (!quotation.notes && !quotation.terms && !quotation.footerNote) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Notes */}
      {quotation.notes && (
        <div className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-600">
            Notes
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
            {quotation.notes}
          </p>
        </div>
      )}

      {/* Terms & Conditions */}
      {quotation.terms && (
        <div className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-600">
            Terms & Conditions
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
            {quotation.terms}
          </p>
        </div>
      )}

      {/* Footer Note */}
      {quotation.footerNote && (
        <div className="md:col-span-2 rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-600">
            Footer Note
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
            {quotation.footerNote}
          </p>
        </div>
      )}
    </div>
  );
}
