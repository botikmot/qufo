"use client";

import {
  CalendarDays,
  LoaderCircle,
} from "lucide-react";

import {
  format,
  parseISO,
} from "date-fns";

import {
  Button,
} from "@/components/ui/button";

import {
  Calendar,
} from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  cn,
} from "@/lib/utils";

type ReportsDateFilterProps = {
  from: string;
  to: string;

  loading: boolean;

  onFromChange: (
    value: string,
  ) => void;

  onToChange: (
    value: string,
  ) => void;

  onApply: () => void;
};

export function ReportsDateFilter({
  from,
  to,
  loading,
  onFromChange,
  onToChange,
  onApply,
}: ReportsDateFilterProps) {
  const fromDate =
    from
      ? parseISO(from)
      : undefined;

  const toDate =
    to
      ? parseISO(to)
      : undefined;

  return (
    <div className="qufo-surface flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <CalendarDays
            size={16}
            className="text-emerald-300"
          />

          Report period
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Choose the period you
          want to analyze.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* FROM */}
        <div>
          <label className="mb-1.5 block text-xs text-slate-500">
            From
          </label>

          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "qufo-input h-auto min-w-44 justify-start gap-3 text-left font-normal",
                    !from &&
                      "text-muted-foreground",
                  )}
                />
              }
            >
              <CalendarDays
                size={16}
                className="text-slate-500"
              />

              {fromDate
                ? format(
                    fromDate,
                    "MMM d, yyyy",
                  )
                : "Select date"}
            </PopoverTrigger>

            <PopoverContent
              align="start"
              className="z-[200] w-auto border-border bg-popover p-0 text-popover-foreground"
            >
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={(date) => {
                  if (!date) return;

                  onFromChange(
                    format(
                      date,
                      "yyyy-MM-dd",
                    ),
                  );
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* TO */}
        <div>
          <label className="mb-1.5 block text-xs text-slate-500">
            To
          </label>

          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "qufo-input h-auto min-w-44 justify-start gap-3 text-left font-normal",
                    !to &&
                      "text-muted-foreground",
                  )}
                />
              }
            >
              <CalendarDays
                size={16}
                className="text-slate-500"
              />

              {toDate
                ? format(
                    toDate,
                    "MMM d, yyyy",
                  )
                : "Select date"}
            </PopoverTrigger>

            <PopoverContent
              align="start"
              className="z-[200] w-auto border-border bg-popover p-0 text-popover-foreground"
            >
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={(date) => {
                  if (!date) return;

                  onToChange(
                    format(
                      date,
                      "yyyy-MM-dd",
                    ),
                  );
                }}
                disabled={(date) =>
                  fromDate
                    ? date <
                      fromDate
                    : false
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        <button
          type="button"
          onClick={onApply}
          disabled={
            loading ||
            !from ||
            !to
          }
          className="flex h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          )}

          Apply
        </button>
      </div>
    </div>
  );
}