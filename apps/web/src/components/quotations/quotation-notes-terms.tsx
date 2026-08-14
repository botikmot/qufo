import type {
  Quotation,
} from "@/types/quotation";

type QuotationNotesTermsProps = {
  quotation: Quotation;
};

export function QuotationNotesTerms({
  quotation,
}: QuotationNotesTermsProps) {
  if (
    !quotation.notes &&
    !quotation.terms
  ) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
}