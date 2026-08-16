import {
  XCircle,
} from "lucide-react";

type PublicJobUnavailableProps = {
  message: string;
};

export function PublicJobUnavailable({
  message,
}: PublicJobUnavailableProps) {
  return (
    <main className="qufo-background flex min-h-screen items-center justify-center px-6">
      <div className="qufo-surface w-full max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-400/[0.08] text-red-300">
          <XCircle
            size={22}
          />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-white">
          Tracking unavailable
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message}
        </p>

        <p className="mt-6 text-xs text-slate-600">
          Please contact the
          business if this tracking
          link is no longer
          available.
        </p>
      </div>
    </main>
  );
}