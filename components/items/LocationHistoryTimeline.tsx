"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, History, Loader2, MapPin } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { listLocationHistory } from "@/lib/items";
import { timestampToDate } from "@/lib/utils";
import type { LocationHistoryEntry } from "@/lib/types";

type LocationHistoryTimelineProps = {
  itemId: string;
};

export function LocationHistoryTimeline({ itemId }: LocationHistoryTimelineProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<LocationHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await listLocationHistory(user, itemId);
      setEntries(result);
    } catch {
      toast("Could not load location history.", "error");
    } finally {
      setLoading(false);
    }
  }, [user, itemId, toast]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-warm-greige/60" />
      </div>
    );
  }

  if (!entries.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-warm-greige/75">
        <History className="h-4 w-4" />
        Location history
      </div>
      <div className="relative pl-6">
        <div className="absolute left-[11px] top-2 h-[calc(100%-16px)] w-px bg-warm-border" />
        <div className="grid gap-4">
          {entries.map((entry) => {
            const date = timestampToDate(entry.changedAt);
            return (
              <div key={entry.id} className="relative">
                <div className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full border-2 border-warm-copper bg-warm-bg" />
                <div className="rounded-xl border border-warm-border bg-warm-bg/60 p-3">
                  <div className="flex items-center gap-2 text-sm text-warm-cream">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-warm-copper" />
                    <span className="truncate">{entry.newLocation || entry.newRoomCategory || "Unknown"}</span>
                  </div>
                  {entry.oldLocation && entry.oldLocation !== entry.newLocation ? (
                    <div className="mt-1 text-xs text-warm-greige/60 line-through">{entry.oldLocation}</div>
                  ) : null}
                  {date ? (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-warm-greige/50">
                      <Clock className="h-3 w-3" />
                      {format(date, "MMM d, yyyy h:mm a")}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
