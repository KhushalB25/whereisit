import { useMemo } from "react";
import type { InventoryItem } from "@/lib/types";
import { useItems } from "@/hooks/useItems";

export type InsightMetric = {
  label: string;
  value: string;
  subtext?: string;
};

export type ExpiryCountdown = {
  item: InventoryItem;
  daysLeft: number;
};

export function useConsumptionInsights() {
  const { items, loading, error } = useItems();

  const tracked = useMemo(() => items.filter((i) => i.dailyConsumptionRate > 0 && i.itemType !== "wishlist"), [items]);

  const summary = useMemo((): InsightMetric[] => {
    if (!tracked.length) return [];

    const totalTracked = tracked.length;
    const totalQty = tracked.reduce((sum, i) => sum + i.quantity, 0);
    const topRate = tracked.reduce((max, i) => (i.dailyConsumptionRate > max.dailyConsumptionRate ? i : max), tracked[0]);

    return [
      { label: "Tracked items", value: String(totalTracked), subtext: "With consumption rate set" },
      { label: "Total stock", value: String(totalQty), subtext: "Units across tracked items" },
      { label: "Fastest consumed", value: topRate.name || "—", subtext: `${topRate.dailyConsumptionRate} units/day` },
    ];
  }, [tracked]);

  const daysUntilEmpty = useMemo((): { item: InventoryItem; days: number }[] => {
    return tracked
      .map((item) => ({
        item,
        days: item.dailyConsumptionRate > 0 ? Math.floor(item.quantity / item.dailyConsumptionRate) : Infinity,
      }))
      .filter((d) => isFinite(d.days))
      .sort((a, b) => a.days - b.days)
      .slice(0, 5);
  }, [tracked]);

  const expiryCountdowns = useMemo((): ExpiryCountdown[] => {
    const today = new Date();
    return items
      .filter((i) => i.expiryDate && i.itemType !== "wishlist")
      .map((item) => {
        const exp = item.expiryDate
          ? new Date(item.expiryDate.seconds * 1000 || item.expiryDate.millis || 0)
          : null;
        if (!exp || isNaN(exp.getTime())) return null;
        return { item, daysLeft: Math.ceil((exp.getTime() - today.getTime()) / 86400000) };
      })
      .filter((d): d is ExpiryCountdown => d !== null)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [items]);

  return { summary, daysUntilEmpty, expiryCountdowns, totalItems: items.length, trackedCount: tracked.length, loading, error };
}
