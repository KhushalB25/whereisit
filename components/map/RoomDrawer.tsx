"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MapPin, Package, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InventoryItem, RoomCategory } from "@/lib/types";

type RoomDrawerProps = {
  open: boolean;
  room: RoomCategory | null;
  icon: LucideIcon | null;
  items: InventoryItem[];
  onClose: () => void;
};

export function RoomDrawer({ open, room, icon: Icon, items, onClose }: RoomDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      panelRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !room) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        ref={panelRef}
        tabIndex={-1}
        className="panel max-h-[70vh] w-full max-w-2xl animate-slide-in-up overflow-y-auto rounded-t-2xl p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon ? <Icon className="h-6 w-6 text-blood" /> : null}
            <h2 className="text-lg font-semibold text-parchment">{room}</h2>
            <span className="text-sm text-white/30">{items.length} item{items.length === 1 ? "" : "s"}</span>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-white/40 transition hover:bg-white/[0.04] hover:text-parchment">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scrollbar-thin -mx-2 grid gap-2 px-2">
          {items.length ? (
            items.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                onClick={onClose}
                className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-crimson-950/60 p-3 transition hover:border-blood/50 hover:bg-white/[0.04]/80"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-crimson-950">
                  {item.photoURL ? (
                    <Image src={item.photoURL} alt={item.name || "Item"} fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/20">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-parchment group-hover:text-blood transition-colors">
                    {item.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/30">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-crimson-950 px-2.5 py-1 text-xs text-white/40">Qty {item.quantity}</span>
              </Link>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-white/30">No items in this room.</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
