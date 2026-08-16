import {
  Check,
} from "lucide-react";

import type {
  PublicJobStepState,
} from "@/utils/job";

type PublicJobStepIconProps = {
  state:
    PublicJobStepState;
};

export function PublicJobStepIcon({
  state,
}: PublicJobStepIconProps) {
  if (
    state === "completed"
  ) {
    return (
      <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/[0.1] text-emerald-300">
        <Check
          size={14}
        />
      </div>
    );
  }

  if (
    state === "current"
  ) {
    return (
      <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/[0.1] text-cyan-300">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-300 opacity-40" />

          <span className="relative inline-flex size-2.5 rounded-full bg-cyan-300" />
        </span>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-black/10">
      <span className="size-2 rounded-full bg-slate-700" />
    </div>
  );
}