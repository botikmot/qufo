import {
  CalendarIcon,
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

type QuotationFormDatesProps = {
  validUntil: string;

  onValidUntilChange: (
    value: string,
  ) => void;
};

export function QuotationFormDates({
  validUntil,
  onValidUntilChange,
}: QuotationFormDatesProps) {
  const selectedDate =
    validUntil
      ? parseISO(validUntil)
      : undefined;

  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        Valid until
      </label>

      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className={cn(
                "qufo-input h-auto w-full justify-start gap-3 text-left font-normal",
                !validUntil &&
                  "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarIcon
            size={16}
            className="text-slate-500"
          />

          {selectedDate
            ? format(
                selectedDate,
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
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;

              onValidUntilChange(
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
  );
}