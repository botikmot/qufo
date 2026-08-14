import type {
  JobPriority,
  JobStatus,
} from "@/types/job";

export const JOB_STATUS_LABELS: Record<
  JobStatus,
  string
> = {
  PENDING: "Pending",
  QUEUED: "Queued",
  IN_PROGRESS: "In Progress",
  FOR_REVIEW: "For Review",
  READY: "Ready",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const JOB_STATUS_STYLES: Record<
  JobStatus,
  string
> = {
  PENDING:
    "bg-slate-400/[0.08] text-slate-400",

  QUEUED:
    "bg-blue-400/[0.08] text-blue-300",

  IN_PROGRESS:
    "bg-cyan-400/[0.08] text-cyan-300",

  FOR_REVIEW:
    "bg-violet-400/[0.08] text-violet-300",

  READY:
    "bg-emerald-400/[0.08] text-emerald-300",

  DELIVERED:
    "bg-teal-400/[0.08] text-teal-300",

  COMPLETED:
    "bg-emerald-400/[0.08] text-emerald-300",

  CANCELLED:
    "bg-red-400/[0.08] text-red-300",
};

export const JOB_PRIORITY_STYLES: Record<
  JobPriority,
  string
> = {
  LOW: "text-slate-500",
  NORMAL: "text-slate-400",
  HIGH: "text-amber-300",
  URGENT: "text-red-300",
};

export const JOB_PROGRESS: Record<
  JobStatus,
  number
> = {
  PENDING: 10,
  QUEUED: 20,
  IN_PROGRESS: 50,
  FOR_REVIEW: 70,
  READY: 85,
  DELIVERED: 95,
  COMPLETED: 100,
  CANCELLED: 0,
};

export const JOB_STATUS_OPTIONS:
  JobStatus[] = [
  "PENDING",
  "QUEUED",
  "IN_PROGRESS",
  "FOR_REVIEW",
  "READY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

export const JOB_STATUS_TRANSITIONS: Record<
  JobStatus,
  JobStatus[]
> = {
  PENDING: [
    "QUEUED",
    "CANCELLED",
  ],

  QUEUED: [
    "IN_PROGRESS",
    "CANCELLED",
  ],

  IN_PROGRESS: [
    "FOR_REVIEW",
    "READY",
    "CANCELLED",
  ],

  FOR_REVIEW: [
    "IN_PROGRESS",
    "READY",
    "CANCELLED",
  ],

  READY: [
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
  ],

  DELIVERED: [
    "COMPLETED",
  ],

  COMPLETED: [],

  CANCELLED: [],
};