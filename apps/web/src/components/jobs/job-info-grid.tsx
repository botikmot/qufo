import {
  InfoCard,
} from "@/components/shared/info-card";

import {
  formatDate,
} from "@/utils/date";

import {
  formatEnumLabel,
} from "@/utils/string";

import type {
  Job,
} from "@/types/job";

type JobInfoGridProps = {
  job: Job;
};

export function JobInfoGrid({
  job,
}: JobInfoGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <InfoCard
        label="Customer"
        value={
          job.customer
            .companyName ??
          job.customer.name
        }
      />

      <InfoCard
        label="Priority"
        value={
          formatEnumLabel(
            job.priority,
          )
        }
      />

      <InfoCard
        label="Due date"
        value={
          job.dueDate
            ? formatDate(
                job.dueDate,
              )
            : "No due date"
        }
      />
    </div>
  );
}