import {
  XCircle,
} from "lucide-react";

type PublicQuotationUnavailableProps = {
  message: string;
};

export function PublicQuotationUnavailable({
  message,
}: PublicQuotationUnavailableProps) {
  return (
    <main className="qufo-background flex min-h-screen items-center justify-center px-6">
      <div className="qufo-surface w-full max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-400/[0.08] text-red-300">
          <XCircle
            size={22}
          />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-white">
          Quotation unavailable
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message}
        </p>

        <p className="mt-6 text-xs text-slate-600">
          Please contact the
          business if you believe
          this link should still be
          active.
        </p>
      </div>
    </main>
  );
}