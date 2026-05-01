"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock, MapPin, Package, Search, SearchX } from "lucide-react";
import { searchableText } from "@/lib/utils";
import type { InventoryItem } from "@/lib/types";

function ResultCard({ item, index }: { item: InventoryItem; index: number }) {
  return (
    <Link key={item.id} href={`/items/${item.id}`} className="group animate-fade-in-up panel flex items-center gap-4 p-3 transition-all duration-250 will-change-transform hover:scale-[1.02] hover:border-warm-copper/60 focus-visible:ring-2 focus-visible:ring-warm-copper/50" style={{ animationDelay: `${index * 40}ms` }}>
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-warm-bg transition-transform duration-250 group-hover:scale-[1.06]">
        {item.photoURL ? (
          <Image src={item.photoURL} alt={item.name || "Private item"} fill sizes="56px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-warm-greige/50">
            <Package className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 truncate font-semibold text-warm-cream group-hover:text-warm-copper transition-colors duration-150">
          {item.isPrivate ? <Lock className="h-4 w-4 text-warm-copper" /> : null}
          <span className="truncate">{item.name}</span>
        </div>
        <div className="mt-1 flex gap-1.5 text-sm text-warm-cream/85">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-warm-copper" />
          <span className="truncate">{item.location}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-warm-greige/75">
          <span>{item.roomCategory}</span>
          <span>{item.category}</span>
        </div>
      </div>
      <span className="hidden shrink-0 rounded-full bg-warm-bg px-2.5 py-1 text-xs text-warm-greige sm:inline">Qty {item.quantity}</span>
    </Link>
  );
}

export function SearchResults({ items, query }: { items: InventoryItem[]; query: string }) {
  const normalized = query.trim().toLowerCase();
  const results = normalized ? items.filter((item) => searchableText(item).includes(normalized)) : items.slice(0, 8);

  const hasPrivate = results.some((item) => item.isPrivate);

  const resultList = (list: InventoryItem[], startIndex: number) =>
    list.length ? (
      <div className="grid gap-3">
        {list.map((item, i) => (
          <ResultCard key={item.id} item={item} index={startIndex + i} />
        ))}
      </div>
    ) : null;

  return (
    <div className="animate-fade-in-up space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-warm-cream">{normalized ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Recent matches"}</h2>
        <Search className="h-5 w-5 text-warm-greige/75" />
      </div>

      {results.length ? (
        hasPrivate ? (
          <div className="space-y-6">
            <section>
              <h3 className="mb-3 text-sm font-medium text-warm-greige/75">Items</h3>
              {resultList(results.filter((item) => !item.isPrivate), 0) || (
                <div className="panel p-5 text-sm text-warm-greige/75">No public items to show.</div>
              )}
            </section>
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-warm-copper/80">
                <Lock className="h-3.5 w-3.5" />
                Vault items
              </h3>
              {resultList(results.filter((item) => item.isPrivate), results.filter((item) => !item.isPrivate).length)}
            </section>
          </div>
        ) : (
          resultList(results, 0)
        )
      ) : (
        <div className="panel flex flex-col items-center gap-3 p-8 text-center">
          <SearchX className="h-8 w-8 text-warm-greige/50" />
          <div>
            <p className="text-sm font-medium text-warm-cream">No items matched your search</p>
            <p className="mt-1 text-xs text-warm-greige/75">Try a different name, location, room, or category.</p>
          </div>
        </div>
      )}
    </div>
  );
}
