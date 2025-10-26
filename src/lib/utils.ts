import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | number): string {
  const now = Date.now();
  const timestamp = typeof date === "number" ? date : date.getTime();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date to a readable string with time
 */
export function formatDateTime(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncate text to a specific length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}

/**
 * Format cron expression to human-readable string
 */
export function formatCronExpression(cron: string): string {
  const parts = cron.split(" ");
  if (parts.length !== 5) return cron;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Daily pattern
  if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    if (minute === "0" && hour !== "*") {
      return `Every day at ${hour}:00`;
    }
    if (minute !== "*" && hour !== "*") {
      return `Every day at ${hour}:${minute}`;
    }
  }

  // Weekly pattern
  if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = days[Number.parseInt(dayOfWeek, 10)] || dayOfWeek;
    return `Every ${day} at ${hour}:${minute}`;
  }

  return cron;
}

/**
 * Get status badge variant
 */
export function getStatusVariant(status: string): "default" | "success" | "warning" | "destructive" {
  switch (status.toLowerCase()) {
    case "completed":
    case "success":
    case "enabled":
      return "success";
    case "pending":
    case "processing":
      return "warning";
    case "failed":
    case "error":
    case "disabled":
      return "destructive";
    default:
      return "default";
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Format word count
 */
export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Format platform name
 */
export function formatPlatform(platform: string): string {
  switch (platform.toLowerCase()) {
    case "twitter":
      return "Twitter/X";
    case "linkedin":
      return "LinkedIn";
    default:
      return platform;
  }
}
