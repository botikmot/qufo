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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
        />

        <input
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          className="qufo-input !pl-10"
          placeholder="Search quotation or customer..."
        />
      </form>

      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(
            value as QuotationStatusFilter,
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

          {QUOTATION_STATUS_OPTIONS.map(
            (quotationStatus) => (
              <SelectItem
                key={quotationStatus}
                value={quotationStatus}
              >
                {
                  QUOTATION_STATUS_LABELS[
                    quotationStatus
                  ]
                }
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
}