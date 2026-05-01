import { differenceInCalendarDays, format, isToday } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ApiTimestamp, InventoryItem } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timestampToDate(value?: ApiTimestamp | null) {
  if (!value) return null;
  return new Date(value.iso || value.millis);
}

export function formatDate(value?: ApiTimestamp | null) {
  const date = timestampToDate(value);
  return date ? format(date, "MMM d, yyyy") : "";
}

export function getExpiryState(item: InventoryItem) {
  const date = timestampToDate(item.expiryDate);
  if (!date) return { label: "", tone: "neutral" as const, days: null };

  const days = differenceInCalendarDays(date, new Date());
  if (days < 0) return { label: "Expired", tone: "red" as const, days };
  if (days <= 7) return { label: isToday(date) ? "Expires today" : `Expires in ${days}d`, tone: "orange" as const, days };
  return { label: `Expires ${formatDate(item.expiryDate)}`, tone: "neutral" as const, days };
}

export function daysRemaining(quantity: number, dailyRate: number, intervalDays = 1) {
  if (!dailyRate || dailyRate <= 0) return null;
  return Math.max(0, Math.floor((quantity / dailyRate) * Math.max(0.1, intervalDays)));
}

export function searchableText(item: InventoryItem) {
  return `${item.name || ""} ${item.location || ""} ${item.category || ""} ${item.roomCategory || ""}`.toLowerCase();
}

export function sortByDateDesc<T extends { createdAt?: ApiTimestamp; updatedAt?: ApiTimestamp }>(items: T[], field: "createdAt" | "updatedAt") {
  return [...items].sort((a, b) => (b[field]?.millis ?? 0) - (a[field]?.millis ?? 0));
}
