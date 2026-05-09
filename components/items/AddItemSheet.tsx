"use client";

import Link from "next/link";
import { CalendarClock, Heart, MapPinned, Plus, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type SheetState = "closed" | "open" | "leaving";

export function AddItemSheet({ buttonClassName, compact = false }: { buttonClassName?: string; compact?: boolean }) {
  const [state, setState] = useState<SheetState>("closed");
  const visible = state !== "closed";
  const leaving = state === "leaving";

  function open() {
    setState("open");
  }

  function close() {
    setState("leaving");
    setTimeout(() => setState("closed"), 250);
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={buttonClassName || "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-blood px-4 py-2 text-sm font-semibold text-crimson-950 transition-all duration-150 hover:bg-[#dc2626] hover:scale-[1.02] active:scale-[0.98]"}
      >
        <Plus className="h-4 w-4" />
        {compact ? <span>Add</span> : "Add"}
      </button>
      {visible
        ? createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add tracker options"
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur",
            leaving ? "animate-fade-in" : "animate-fade-in"
          )}
          style={{ animationDirection: leaving ? "reverse" : "normal", animationFillMode: "forwards" }}
          onClick={close}
        >
          <div
            className={cn(
              "panel relative w-full max-w-md p-5",
              leaving ? "animate-scale-in" : "animate-scale-in"
            )}
            style={{ animationDirection: leaving ? "reverse" : "normal", animationFillMode: "forwards" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-parchment">Add tracker</h2>
              <button type="button" aria-label="Close add menu" onClick={close} className="rounded-lg p-2 text-white/40 transition-all duration-150 hover:bg-white/[0.04] hover:text-parchment hover:rotate-90">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-3">
              <Link href="/items/new?type=location" className="animate-fade-in-up rounded-xl border border-white/[0.06] bg-crimson-950/60 p-4 transition-all duration-250 hover:scale-[1.01] hover:border-blood/50 hover:bg-crimson-900" onClick={close} style={{ animationDelay: "0ms" }}>
                <div className="flex items-center gap-3 font-semibold text-parchment">
                  <MapPinned className="h-5 w-5 text-blood" />
                  Add Location Tracker
                </div>
                <p className="mt-2 text-sm text-white/40">Save item, room, exact location, category, photo, and privacy.</p>
              </Link>
              <Link href="/items/new?type=expiry" className="animate-fade-in-up rounded-xl border border-white/[0.06] bg-crimson-950/60 p-4 transition-all duration-250 hover:scale-[1.01] hover:border-blood/50 hover:bg-crimson-900" onClick={close} style={{ animationDelay: "50ms" }}>
                <div className="flex items-center gap-3 font-semibold text-parchment">
                  <CalendarClock className="h-5 w-5 text-gold-light" />
                  Add Expiry Tracker
                </div>
                <p className="mt-2 text-sm text-white/40">Include stock quantity, expiry date, and daily consumption rate.</p>
              </Link>
              <Link href="/items/new?type=wishlist" className="animate-fade-in-up rounded-xl border border-white/[0.06] bg-crimson-950/60 p-4 transition-all duration-250 hover:scale-[1.01] hover:border-blood/50 hover:bg-crimson-900" onClick={close} style={{ animationDelay: "100ms" }}>
                <div className="flex items-center gap-3 font-semibold text-parchment">
                  <Heart className="h-5 w-5 text-red-300" />
                  Add Wishlist Item
                </div>
                <p className="mt-2 text-sm text-white/40">Save items you plan to buy. Mark as purchased to move to inventory.</p>
              </Link>
            </div>
          </div>
        </div>,
          document.body
        )
        : null}
    </>
  );
}
