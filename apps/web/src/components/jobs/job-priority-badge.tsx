import {
  JOB_PRIORITY_STYLES,
} from "@/constants/job";

import type {
  JobPriority,
} from "@/types/job";

type JobPriorityBadgeProps = {
  priority: JobPriority;
};

export function JobPriorityBadge({
  priority,
}: JobPriorityBadgeProps) {
  return (
    <span
      className={`text-xs font-medium ${JOB_PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}