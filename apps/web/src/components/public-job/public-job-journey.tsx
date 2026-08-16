import {
  PUBLIC_JOB_STEPS,
} from "@/constants/job";

import {
  PublicJobStepIcon,
} from "@/components/public-job/public-job-step-icon";

import {
  formatDateTime,
} from "@/utils/date";

import {
  getLatestPublicJobMessage,
  getLatestPublicJobUpdateDate,
  getPublicJobStepState,
} from "@/utils/job";

import type {
  PublicJob,
} from "@/types/job";

type PublicJobJourneyProps = {
  job: PublicJob;
};

export function PublicJobJourney({
  job,
}: PublicJobJourneyProps) {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-sm font-medium text-slate-300">
          Production journey
        </h2>

        <p className="mt-1 text-xs text-slate-600">
          Follow your order from
          confirmation through
          completion.
        </p>
      </div>

      <div className="relative">
        {PUBLIC_JOB_STEPS.map(
          (
            step,
            index,
          ) => {
            const state =
              getPublicJobStepState(
                job,
                step.status,
              );

            const message =
              getLatestPublicJobMessage(
                job,
                step.status,
              );

            const updatedAt =
              getLatestPublicJobUpdateDate(
                job,
                step.status,
              );

            return (
              <div
                key={
                  step.status
                }
                className="relative flex gap-4 pb-7 last:pb-0"
              >
                {index <
                  PUBLIC_JOB_STEPS.length -
                    1 && (
                  <div
                    className={[
                      "absolute left-[15px] top-8 h-[calc(100%-16px)] w-px",

                      state ===
                      "completed"
                        ? "bg-emerald-400/35"
                        : "bg-white/[0.06]",
                    ].join(
                      " ",
                    )}
                  />
                )}

                <PublicJobStepIcon
                  state={
                    state
                  }
                />

                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p
                      className={[
                        "text-sm font-medium",

                        state ===
                        "current"
                          ? "text-cyan-200"
                          : state ===
                              "completed"
                            ? "text-slate-300"
                            : "text-slate-600",
                      ].join(
                        " ",
                      )}
                    >
                      {step.label}
                    </p>

                    {updatedAt && (
                      <span className="text-[11px] text-slate-700">
                        {formatDateTime(
                          updatedAt,
                        )}
                      </span>
                    )}
                  </div>

                  <p
                    className={[
                      "mt-1 text-xs leading-5",

                      state ===
                      "pending"
                        ? "text-slate-700"
                        : "text-slate-500",
                    ].join(
                      " ",
                    )}
                  >
                    {message ??
                      step.description}
                  </p>
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}