import {
  LoaderCircle,
} from "lucide-react";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({
  label = "Loading...",
}: LoadingStateProps) {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <LoaderCircle
          size={17}
          className="animate-spin"
        />

        {label}
      </div>
    </div>
  );
}