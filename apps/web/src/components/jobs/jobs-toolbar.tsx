"use client";

import {
  type FormEvent,
} from "react";

import {
  Search,
} from "lucide-react";

import {
  JOB_STATUS_LABELS,
  JOB_STATUS_OPTIONS,
} from "@/constants/job";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  JobStatus,
} from "@/types/job";

export type JobStatusFilter =
  | "ALL"
  | JobStatus;

type JobsToolbarProps = {
  search: string;

  status:
    JobStatusFilter;

  onSearchChange: (
    value: string,
  ) => void;

  onSearch: (
    event: FormEvent<HTMLFormElement>,
  ) => void;

  onStatusChange: (
    status: JobStatusFilter,
  ) => void;
};

export function JobsToolbar({
  search,
  status,
  onSearchChange,
  onSearch,
  onStatusChange,
}: JobsToolbarProps) {
  return (
    <div className="qufo-surface mb-5 flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center lg:justify-between">
      <form
        onSubmit={onSearch}
        className="relative w-full max-w-sm"
      >
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
        />

        <input
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          className="qufo-input !pl-10"
          placeholder="Search job or customer..."
        />
      </form>

      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(
            value as JobStatusFilter,
          )
        }
      >
        <SelectTrigger className="qufo-input h-auto! w-full lg:w-52">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="ALL">
            All statuses
          </SelectItem>

          {JOB_STATUS_OPTIONS.map(
            (jobStatus) => (
              <SelectItem
                key={jobStatus}
                value={jobStatus}
              >
                {
                  JOB_STATUS_LABELS[
                    jobStatus
                  ]
                }
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      {/* <select
        value={status}
        onChange={(event) =>
          onStatusChange(
            event.target
              .value as JobStatusFilter,
          )
        }
        className="qufo-input w-full text-sm lg:w-48"
      >
        <option value="ALL">
          All statuses
        </option>

        {JOB_STATUS_OPTIONS.map(
          (jobStatus) => (
            <option
              key={jobStatus}
              value={jobStatus}
            >
              {
                JOB_STATUS_LABELS[
                  jobStatus
                ]
              }
            </option>
          ),
        )}
      </select> */}
    </div>
  );
}