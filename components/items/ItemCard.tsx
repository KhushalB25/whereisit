import Image from "next/image";
import Link from "next/link";
import { Lock, MapPin, Package } from "lucide-react";
import { ExpiryBadge } from "@/components/items/ExpiryBadge";
import { formatDate } from "@/lib/utils";
import type { InventoryItem } from "@/lib/types";

export function ItemCard({ item, locked = false, isRecentlyUpdated }: { item: InventoryItem; locked?: boolean; isRecentlyUpdated?: boolean }) {
  return (
    <Link href={`/items/${item.id}`} className={`group panel block p-4 transition-all duration-250 hover:scale-[1.02] hover:border-blood/60 hover:bg-white/[0.04]/80 hover:shadow-[0_0_0_1px_rgba(216,162,94,0.25),0_18px_60px_rgba(0,0,0,0.4)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blood/50 ${isRecentlyUpdated ? "animate-highlight-pulse" : ""}`}>
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/[0.06] bg-crimson-950 transition-transform duration-250 group-hover:scale-[1.04]">
          {item.photoURL ? (
            <Image src={item.photoURL} alt={item.name || "Private item"} fill sizes="80px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/20">
              <Package className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="flex min-w-0 items-center gap-2 truncate text-base font-semibold text-parchment group-hover:text-blood transition-colors duration-150">
              {item.isPrivate ? <Lock className="h-4 w-4 shrink-0 text-blood" /> : null}
              <span className="truncate">{locked ? "Private - Enter PIN to view" : item.name}</span>
            </h3>
            <span className="shrink-0 rounded-full bg-crimson-950 px-2.5 py-1 text-xs font-medium text-parchment/85">Qty {item.quantity}</span>
          </div>
          <p className="mt-2 flex gap-1.5 text-sm leading-5 text-parchment/85">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blood" />
            <span className="truncate">{locked ? "Locked location" : item.location}</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-crimson-950 px-2 py-1 text-xs text-white/40">{item.roomCategory || "Other"}</span>
            <span className="rounded-full bg-crimson-950 px-2 py-1 text-xs text-white/40">{item.category || "Miscellaneous"}</span>
            <ExpiryBadge item={item} />
            {item.expiryDate ? <span className="text-xs text-white/30">{formatDate(item.expiryDate)}</span> : null}
            {item.status === "finished" ? <span className="rounded-full bg-white/[0.04] px-2 py-1 text-xs text-white/40">Finished</span> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
