import {
  PackageCheck,
} from "lucide-react";

export function PublicJobCompleted() {
  return (
    <div className="border-t border-emerald-400/10 bg-emerald-400/[0.035] p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <PackageCheck
          size={21}
          className="mt-0.5 shrink-0 text-emerald-300"
        />

        <div>
          <p className="font-medium text-emerald-200">
            Job completed
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Your order has
            successfully completed
            the production workflow.
          </p>
        </div>
      </div>
    </div>
  );
}