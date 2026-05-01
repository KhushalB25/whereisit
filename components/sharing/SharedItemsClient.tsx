"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Package, Share2, Users } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageTransition } from "@/components/ui/PageTransition";
import { useAuth } from "@/components/auth/AuthProvider";
import type { InventoryItem } from "@/lib/types";

export function SharedItemsClient() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShared = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/items/shared-with-me", {
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      });
      if (!res.ok) throw new Error("Could not load shared items.");
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shared items.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchShared(); }, [fetchShared]);

  if (loading) return <LoadingState label="Loading shared items" variant="skeleton" />;
  if (error) return <div className="panel p-5 text-warm-rust">{error}</div>;

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-warm-copper">
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">Shared with me</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-warm-cream">Items others shared</h1>
          <p className="mt-1 text-sm text-warm-greige">
            Items other WhereIsIt users have shared with you.
          </p>
        </div>

        {items.length ? (
          <div className="grid gap-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="group flex items-center gap-4 rounded-xl border border-warm-border bg-warm-bg/60 p-4 transition hover:border-warm-copper/50"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-warm-bg">
                  {item.photoURL ? (
                    <Image src={item.photoURL} alt={item.name || "Item"} fill sizes="56px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-warm-greige/50">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-warm-cream group-hover:text-warm-copper transition-colors">
                    {item.name || "Untitled"}
                  </div>
                  <div className="mt-0.5 text-xs text-warm-greige/75">{item.roomCategory} &middot; {item.category}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="panel flex flex-col items-center gap-3 p-8 text-center">
            <Users className="h-8 w-8 text-warm-greige/50" />
            <p className="text-sm font-medium text-warm-cream">No shared items yet</p>
            <p className="text-xs text-warm-greige/75">
              When another WhereIsIt user shares an item with your email, it will appear here.
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
