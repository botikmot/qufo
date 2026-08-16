import {
  LoaderCircle,
} from "lucide-react";

export function PublicQuotationLoading() {
  return (
    <main className="qufo-background flex min-h-screen items-center justify-center px-6">
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <LoaderCircle
          size={18}
          className="animate-spin text-emerald-300"
        />

        Loading quotation...
      </div>
    </main>
  );
}