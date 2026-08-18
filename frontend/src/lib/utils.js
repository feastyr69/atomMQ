import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ts) {
  if (!ts) return "—";
  const date = new Date(ts);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function truncateId(id) {
  if (!id) return "";
  return id.slice(0, 8);
}

export const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-status-pending/15 text-status-pending border-status-pending/30",
    dot: "bg-status-pending",
  },
  active: {
    label: "Active",
    color: "bg-status-active/15 text-status-active border-status-active/30",
    dot: "bg-status-active",
  },
  completed: {
    label: "Completed",
    color: "bg-status-completed/15 text-status-completed border-status-completed/30",
    dot: "bg-status-completed",
  },
  delayed: {
    label: "Delayed",
    color: "bg-status-delayed/15 text-status-delayed border-status-delayed/30",
    dot: "bg-status-delayed",
  },
  failed: {
    label: "Failed",
    color: "bg-status-failed/15 text-status-failed border-status-failed/30",
    dot: "bg-status-failed",
  },
};
