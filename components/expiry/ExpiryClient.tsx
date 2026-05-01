"use client";

import { CalendarClock } from "lucide-react";
import { NotificationReminder } from "@/components/expiry/NotificationReminder";
import { ItemCard } from "@/components/items/ItemCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageTransition } from "@/components/ui/PageTransition";
import { useItems } from "@/hooks/useItems";
import { useDisplayItems } from "@/hooks/useDisplayItems";

export function ExpiryClient() {
  const { items, loading, error } = useItems();
  const displayItems = useDisplayItems(items);
  const expiring = displayItems
    .filter((item) => item.expiryDate)
    .sort((a, b) => (a.expiryDate?.millis ?? 0) - (b.expiryDate?.millis ?? 0));

  if (loading) return <LoadingState label="Loading expiry tracker" variant="skeleton" />;
  if (error) return <div className="panel p-5 text-warm-rust">{error}</div>;

  return (
    <PageTransition>
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-warm-copper">
            <CalendarClock className="h-5 w-5" />
            <span className="text-sm font-medium">Expiry Tracker</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-warm-cream">Dates that need attention</h1>
          <p className="mt-1 text-sm text-warm-greige">Sorted by soonest expiry first, with urgent items highlighted.</p>
        </div>
        <NotificationReminder items={expiring} />
      </div>

      {expiring.length ? (
        <div className="grid gap-3">
          {expiring.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="panel p-8 text-center">
          <CalendarClock className="mx-auto mb-3 h-8 w-8 text-warm-greige/50" />
          <p className="text-sm font-medium text-warm-cream">No tracked expiry dates</p>
          <p className="mt-1 text-xs text-warm-greige/75">Add an Expiry Tracker to track expiration and daily consumption.</p>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
