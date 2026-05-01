"use client";

import { useMemo, useState } from "react";
import { Bath, Bed, BedDouble, CookingPot, Fuel, Home, LucideIcon, Shrub, Sofa, Tent, Warehouse } from "lucide-react";
import type { InventoryItem, RoomCategory } from "@/lib/types";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageTransition } from "@/components/ui/PageTransition";
import { RoomCard } from "@/components/map/RoomCard";
import { RoomDrawer } from "@/components/map/RoomDrawer";
import { useItems } from "@/hooks/useItems";

const roomIconMap: Record<RoomCategory, LucideIcon> = {
  Bedroom: Bed,
  "Living Room": Sofa,
  Kitchen: CookingPot,
  Bathroom: Bath,
  Study: BedDouble,
  Storage: Warehouse,
  Garage: Fuel,
  Balcony: Shrub,
  Other: Home
};

export function HomeMapClient() {
  const { items, loading, error } = useItems();
  const [selectedRoom, setSelectedRoom] = useState<RoomCategory | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<RoomCategory, InventoryItem[]>();
    for (const item of items) {
      const list = map.get(item.roomCategory) || [];
      list.push(item);
      map.set(item.roomCategory, list);
    }
    return map;
  }, [items]);

  const rooms = useMemo(() => {
    const entries: [RoomCategory, InventoryItem[]][] = [];
    grouped.forEach((value, key) => entries.push([key, value]));
    return entries.sort(([a], [b]) => a.localeCompare(b));
  }, [grouped]);

  if (loading) return <LoadingState label="Loading map" variant="skeleton" />;
  if (error) return <div className="panel p-5 text-warm-rust">{error}</div>;

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-warm-copper">
            <Home className="h-5 w-5" />
            <span className="text-sm font-medium">Home Map</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-warm-cream">Browse by room</h1>
          <p className="mt-1 text-sm text-warm-greige">
            All your inventoried items, grouped by where they live.
          </p>
        </div>

        {rooms.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map(([room, roomItems]) => {
              const Icon = roomIconMap[room] || Home;
              return (
                <RoomCard
                  key={room}
                  room={room}
                  icon={Icon}
                  count={roomItems.length}
                  onClick={() => setSelectedRoom(room)}
                />
              );
            })}
          </div>
        ) : (
          <div className="panel flex flex-col items-center gap-3 p-8 text-center">
            <Home className="h-8 w-8 text-warm-greige/50" />
            <p className="text-sm font-medium text-warm-cream">No items yet</p>
            <p className="text-xs text-warm-greige/75">Add some items to see them grouped by room.</p>
          </div>
        )}
      </div>

      <RoomDrawer
        open={!!selectedRoom}
        room={selectedRoom}
        icon={selectedRoom ? (roomIconMap[selectedRoom] || null) : null}
        items={selectedRoom ? (grouped.get(selectedRoom) || []) : []}
        onClose={() => setSelectedRoom(null)}
      />
    </PageTransition>
  );
}
