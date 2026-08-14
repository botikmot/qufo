"use client";

import type {
  FormEvent,
} from "react";

import {
  Search,
} from "lucide-react";

import {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_OPTIONS,
} from "@/constants/quotation";

import type {
  QuotationStatus,
} from "@/types/quotation";

export type QuotationStatusFilter =
  | "ALL"
  | QuotationStatus;

type QuotationsToolbarProps = {
  search: string;

  status:
    QuotationStatusFilter;

  onSearchChange: (
    value: string,
  ) => void;

  onSearch: (
    event: FormEvent<HTMLFormElement>,
  ) => void;

  onStatusChange: (
    status:
      QuotationStatusFilter,
  ) => void;
};

export function QuotationsToolbar({
  search,
  status,
  onSearchChange,
  onSearch,
  onStatusChange,
}: QuotationsToolbarProps) {
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
          className="qufo-input pl-9"
          placeholder="Search quotation or customer..."
        />
      </form>

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(
            event.target
              .value as
              QuotationStatusFilter,
          )
        }
        className="qufo-input w-full text-sm lg:w-52"
      >
        <option value="ALL">
          All statuses
        </option>

        {QUOTATION_STATUS_OPTIONS.map(
          (quotationStatus) => (
            <option
              key={
                quotationStatus
              }
              value={
                quotationStatus
              }
            >
              {
                QUOTATION_STATUS_LABELS[
                  quotationStatus
                ]
              }
            </option>
          ),
        )}
      </select>
    </div>
  );
}