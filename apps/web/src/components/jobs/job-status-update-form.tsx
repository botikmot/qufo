"use client";

import {
  LoaderCircle,
  MessageSquareText,
} from "lucide-react";

import {
  JOB_STATUS_LABELS,
} from "@/constants/job";

import type {
  JobStatus,
} from "@/types/job";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type JobStatusUpdateFormProps = {
  nextStatuses:
    JobStatus[];

  selectedStatus:
    | JobStatus
    | "";

  internalMessage: string;
  publicMessage: string;

  loading?: boolean;

  onStatusChange: (
    status: JobStatus,
  ) => void;

  onInternalMessageChange: (
    value: string,
  ) => void;

  onPublicMessageChange: (
    value: string,
  ) => void;

  onSubmit: () => void;
};

export function JobStatusUpdateForm({
  nextStatuses,
  selectedStatus,
  internalMessage,
  publicMessage,
  loading = false,
  onStatusChange,
  onInternalMessageChange,
  onPublicMessageChange,
  onSubmit,
}: JobStatusUpdateFormProps) {
  if (
    nextStatuses.length === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5">
      <div className="mb-5">
        <h3 className="text-sm font-medium text-slate-300">
          Update production status
        </h3>

        <p className="mt-1 text-xs text-slate-600">
          Internal notes are
          visible only to staff.
          Customer updates may
          appear on the public
          tracking page.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs text-slate-500">
            Next status
          </label>

          <Select
            value={selectedStatus || null}
            onValueChange={(value) => {
              if (!value) return;

              onStatusChange(
                value as JobStatus,
              );
            }}
          >
            <SelectTrigger className="qufo-input h-auto! w-full">
              <SelectValue>
                {selectedStatus
                  ? JOB_STATUS_LABELS[
                      selectedStatus
                    ]
                  : "Select status"}
              </SelectValue>
            </SelectTrigger>

            <SelectContent align="start">
              {nextStatuses.map(
                (status) => (
                  <SelectItem
                    key={status}
                    value={status}
                  >
                    {
                      JOB_STATUS_LABELS[
                        status
                      ]
                    }
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-xs text-slate-500">
            Internal note
          </label>

          <input
            value={
              internalMessage
            }
            onChange={(event) =>
              onInternalMessageChange(
                event.target.value,
              )
            }
            className="qufo-input"
            placeholder="Example: Printing started."
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <MessageSquareText
            size={13}
          />

          Customer update
        </label>

        <textarea
          rows={3}
          value={
            publicMessage
          }
          onChange={(event) =>
            onPublicMessageChange(
              event.target.value,
            )
          }
          className="qufo-input resize-none"
          placeholder="Example: Your order is now in production."
        />
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={
            loading ||
            !selectedStatus
          }
          className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
        >
          {loading && (
            <LoaderCircle
              size={15}
              className="animate-spin"
            />
          )}

          Update status
        </button>
      </div>
    </div>
  );
}