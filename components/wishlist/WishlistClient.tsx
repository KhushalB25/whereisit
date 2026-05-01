"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Gift, Heart, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageTransition } from "@/components/ui/PageTransition";
import { useItems } from "@/hooks/useItems";
import { deleteItem, updateItem } from "@/lib/items";
import type { InventoryItem } from "@/lib/types";

export function WishlistClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, loading, error, refresh } = useItems();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const wishlist = useMemo(() => items.filter((i) => i.itemType === "wishlist"), [items]);

  const priorityLabel: Record<string, { label: string; className: string }> = {
    high: { label: "High", className: "text-warm-rust border-warm-rust/40 bg-warm-rust/10" },
    medium: { label: "Medium", className: "text-warm-mustard border-warm-mustard/40 bg-warm-mustard/10" },
    low: { label: "Low", className: "text-warm-sage border-warm-sage/40 bg-warm-sage/10" },
  };

  async function handleMarkPurchased(item: InventoryItem) {
    if (!user) return;
    setPurchasing(item.id);
    try {
      await updateItem(user, item.id, {
        name: item.name || "",
        location: "",
        roomCategory: item.roomCategory,
        category: item.category as import("@/lib/types").ItemCategory,
        customCategory: "",
        isPrivate: false,
        quantity: 1,
        expiryDate: "",
        dailyConsumptionRate: 0,
        consumptionIntervalDays: 1,
        notes: item.notes || "",
        photoFile: null,
        itemType: "inventory",
      });
      toast("Moved to inventory!", "success");
      refresh();
    } catch {
      toast("Could not mark as purchased.", "error");
    } finally {
      setPurchasing(null);
    }
  }

  async function handleDelete(item: InventoryItem) {
    if (!user) return;
    try {
      await deleteItem(user, item.id);
      toast("Removed from wishlist.", "success");
      refresh();
    } catch {
      toast("Could not remove item.", "error");
    }
  }

  if (loading) return <LoadingState label="Loading wishlist" variant="skeleton" />;
  if (error) return <div className="panel p-5 text-warm-rust">{error}</div>;

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-warm-copper">
            <Heart className="h-5 w-5" />
            <span className="text-sm font-medium">Wishlist</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-warm-cream">Items you want</h1>
          <p className="mt-1 text-sm text-warm-greige">
            Save items you plan to buy. Mark them as purchased to move into your inventory.
          </p>
        </div>

        {wishlist.length ? (
          <div className="grid gap-3">
            {wishlist.map((item) => {
              const prio = priorityLabel[item.priority || "medium"] || priorityLabel.medium;
              return (
                <div key={item.id} className="group panel flex items-center gap-4 p-4 transition-all hover:border-warm-copper/60">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-warm-bg">
                    {item.photoURL ? (
                      <Image src={item.photoURL} alt={item.name || "Wishlist item"} fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-warm-copper/50">
                        <Gift className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-warm-cream">{item.name}</span>
                      {item.estimatedPrice ? (
                        <span className="shrink-0 text-sm text-warm-greige/75">${item.estimatedPrice.toFixed(2)}</span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${prio.className}`}>
                        {prio.label}
                      </span>
                      <span className="text-xs text-warm-greige/75">{item.category}</span>
                    </div>
                    {item.notes ? (
                      <div className="mt-1 text-xs text-warm-greige/75">{item.notes}</div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {item.purchaseLink ? (
                      <a
                        href={item.purchaseLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-warm-greige/60 transition hover:bg-[#24251F] hover:text-warm-copper"
                        title="Open purchase link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-row gap-1 sm:flex-col">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => handleMarkPurchased(item)}
                      loading={purchasing === item.id}
                      className="px-2.5 text-xs sm:px-4 sm:text-sm"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Purchased</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleDelete(item)}
                      className="px-2.5 text-xs text-warm-rust/60 hover:text-warm-rust sm:px-4 sm:text-sm"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="panel flex flex-col items-center gap-3 p-8 text-center">
            <Heart className="h-8 w-8 text-warm-greige/50" />
            <p className="text-sm font-medium text-warm-cream">No wishlist items yet</p>
            <p className="text-xs text-warm-greige/75">Add items you want to buy from the Add menu.</p>
          </div>
        )}

        <div className="flex justify-center">
          <Link href="/items/new?type=wishlist">
            <Button type="button" variant="secondary">
              <Gift className="h-4 w-4" />
              Add wishlist item
            </Button>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
