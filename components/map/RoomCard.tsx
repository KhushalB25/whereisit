"use client";

import type { LucideIcon } from "lucide-react";
import type { RoomCategory } from "@/lib/types";

const roomIcons: Record<string, LucideIcon> = {};

type RoomCardProps = {
  room: RoomCategory;
  icon: LucideIcon;
  count: number;
  onClick: () => void;
};

export function RoomCard({ room, icon: Icon, count, onClick }: RoomCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group panel flex flex-col items-center gap-3 p-5 text-center transition-all duration-250 hover:scale-[1.03] hover:border-blood/60 focus-visible:ring-2 focus-visible:ring-blood/50"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-crimson-950 transition-colors group-hover:bg-blood-muted">
        <Icon className="h-7 w-7 text-blood" />
      </div>
      <div>
        <div className="font-medium text-parchment group-hover:text-blood transition-colors">{room}</div>
        <div className="mt-0.5 text-xs text-white/30">
          {count} item{count === 1 ? "" : "s"}
        </div>
      </div>
    </button>
  );
}
