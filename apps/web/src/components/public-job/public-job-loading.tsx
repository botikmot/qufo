import {
  LoaderCircle,
} from "lucide-react";

export function PublicJobLoading() {
  return (
    <main className="qufo-background flex min-h-screen items-center justify-center px-6">
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <LoaderCircle
          size={18}
          className="animate-spin text-cyan-300"
        />

        Loading job tracking...
      </div>
    </main>
  );
}