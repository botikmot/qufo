import {
  CheckCircle2,
  Clock3,
} from "lucide-react";

type PublicQuotationResponseBannerProps = {
  type:
    | "success"
    | "warning";

  title: string;
  message: string;
};

export function PublicQuotationResponseBanner({
  type,
  title,
  message,
}: PublicQuotationResponseBannerProps) {
  const success =
    type === "success";

  return (
    <div
      className={[
        "border-t p-6 sm:p-8",
        success
          ? "border-emerald-400/10 bg-emerald-400/[0.035]"
          : "border-amber-400/10 bg-amber-400/[0.035]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {success ? (
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0 text-emerald-300"
          />
        ) : (
          <Clock3
            size={20}
            className="mt-0.5 shrink-0 text-amber-300"
          />
        )}

        <div>
          <p
            className={
              success
                ? "font-medium text-emerald-200"
                : "font-medium text-amber-200"
            }
          >
            {title}
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}