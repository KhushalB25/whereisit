"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/types";

type FilterKey = "all" | "expiring" | "expired" | "low" | "finished";

type FilterBarProps = {
  items: InventoryItem[];
  active: FilterKey;
  onChange: (filter: FilterKey) => void;
};

export function FilterBar({ items, active, onChange }: FilterBarProps) {
  const counts = useMemo(() => {
    const now = new Date();
    return {
      all: items.length,
      expiring: items.filter((item) => {
        if (!item.expiryDate || item.status === "finished") return false;
        const days = (item.expiryDate.millis - now.getTime()) / 86400000;
        return days >= 0 && days <= 7;
      }).length,
      expired: items.filter((item) => {
        if (!item.expiryDate || item.status === "finished") return false;
        return item.expiryDate.millis < now.getTime();
      }).length,
      low: items.filter((item) => item.status !== "finished" && Number(item.quantity) < 2).length,
      finished: items.filter((item) => item.status === "finished").length
    };
  }, [items]);

  const filters: { key: FilterKey; label: string; count: number; color: string }[] = [
    { key: "all", label: "All", count: counts.all, color: "text-warm-cream" },
    { key: "expiring", label: "Expiring soon", count: counts.expiring, color: "text-warm-mustard" },
    { key: "expired", label: "Expired", count: counts.expired, color: "text-warm-rust" },
    { key: "low", label: "Low stock", count: counts.low, color: "text-warm-copper" },
    { key: "finished", label: "Finished", count: counts.finished, color: "text-warm-greige" }
  ];

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter items">
      {filters.map((filter) => (
        <button
          key={filter.key}
          role="tab"
          type="button"
          aria-selected={active === filter.key}
          onClick={() => onChange(filter.key)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
            active === filter.key
              ? "border-warm-copper/60 bg-warm-copper/15 text-warm-copper"
              : "border-warm-border bg-transparent text-warm-greige hover:border-warm-copper/40 hover:text-warm-cream"
          )}
        >
          {filter.label}
          <span className={cn("tabular-nums", filter.color)}>{filter.count}</span>
        </button>
      ))}
    </div>
  );
}
