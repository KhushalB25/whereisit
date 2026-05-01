"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageTransition } from "@/components/ui/PageTransition";
import { addShoppingItem, deleteShoppingItem, listShoppingList, restockItem } from "@/lib/items";
import { useItems } from "@/hooks/useItems";
import type { ShoppingItem } from "@/lib/types";

export function ShoppingListClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { items } = useItems();

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setShoppingItems(await listShoppingList(user));
    } catch {
      toast("Could not load shopping list.", "error");
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const lowQtyItems = useMemo(
    () => items.filter((i) => i.quantity > 0 && i.quantity <= i.dailyConsumptionRate * 2 + 1),
    [items]
  );

  const suggestedItems = useMemo(
    () => lowQtyItems.filter(
      (inv) => !shoppingItems.some((s) => s.linkedItemId === inv.id)
    ),
    [lowQtyItems, shoppingItems]
  );

  const manualItems = useMemo(() => shoppingItems.filter((s) => !s.isSuggested), [shoppingItems]);

  async function handleAddManual() {
    if (!user || !newName.trim()) return;
    setAdding(true);
    try {
      const item = await addShoppingItem(user, { name: newName.trim() });
      setShoppingItems((prev) => [item, ...prev]);
      setNewName("");
      toast("Added to shopping list.", "success");
    } catch {
      toast("Could not add item.", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleRestock(item: ShoppingItem) {
    if (!user || !item.linkedItemId) return;
    setCompleting(item.id);
    try {
      await restockItem(user, item.linkedItemId, 10);
      await deleteShoppingItem(user, item.id);
      setShoppingItems((prev) => prev.filter((s) => s.id !== item.id));
      toast("Restocked! Item removed from shopping list.", "success");
    } catch {
      toast("Could not restock item.", "error");
    } finally {
      setCompleting(null);
    }
  }

  async function handleRemove(itemId: string) {
    if (!user) return;
    try {
      await deleteShoppingItem(user, itemId);
      setShoppingItems((prev) => prev.filter((s) => s.id !== itemId));
      toast("Removed from shopping list.", "success");
    } catch {
      toast("Could not remove item.", "error");
    }
  }

  const itemRow = (item: ShoppingItem) => (
    <div key={item.id} className="group flex items-center gap-3 rounded-xl border border-warm-border bg-warm-bg/60 p-3 transition hover:border-warm-copper/50">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-warm-cream">{item.name}</div>
        {item.notes ? <div className="mt-0.5 text-xs text-warm-greige/75">{item.notes}</div> : null}
      </div>
      <span className="shrink-0 rounded-full bg-warm-bg px-2.5 py-1 text-xs text-warm-greige">Qty {item.quantity}</span>

      {item.isSuggested ? (
        <button
          type="button"
          onClick={() => handleRestock(item)}
          disabled={completing === item.id}
          className="rounded-lg p-2 text-warm-sage transition hover:bg-[#24251F] disabled:opacity-50"
          title="Restock (qty 10)"
        >
          {completing === item.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => handleRemove(item.id)}
          className="rounded-lg p-2 text-warm-rust/60 transition hover:bg-[#24251F] hover:text-warm-rust"
          title="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  if (loading) return <LoadingState label="Loading shopping list" variant="skeleton" />;

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-warm-copper">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-sm font-medium">Shopping List</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-warm-cream">What to buy</h1>
          <p className="mt-1 text-sm text-warm-greige">
            Auto-suggested from low-stock items. Add manual items as needed.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            className="input-shell flex-1"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddManual(); }}
            placeholder="Add a manual item…"
          />
          <Button type="button" onClick={handleAddManual} loading={adding} disabled={!newName.trim()}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {suggestedItems.length ? (
          <section>
            <h2 className="mb-3 text-sm font-medium text-warm-sage/80">
              Suggested from low stock ({suggestedItems.length})
            </h2>
            <div className="grid gap-2">
              {suggestedItems.map((inv) => {
                const fakeItem: ShoppingItem = {
                  id: `suggested-${inv.id}`,
                  name: inv.name || "Untitled",
                  category: inv.category,
                  quantity: Math.ceil(inv.dailyConsumptionRate * 7) || 1,
                  isSuggested: true,
                  linkedItemId: inv.id,
                  notes: `Low: ${inv.quantity} left`,
                  createdAt: { seconds: 0, nanoseconds: 0, millis: 0, iso: "" }
                };
                return itemRow(fakeItem);
              })}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="mb-3 text-sm font-medium text-warm-greige/75">
            Manual items ({manualItems.length})
          </h2>
          {manualItems.length ? (
            <div className="grid gap-2">{manualItems.map(itemRow)}</div>
          ) : (
            <div className="panel flex flex-col items-center gap-3 p-8 text-center">
              <ShoppingCart className="h-8 w-8 text-warm-greige/50" />
              <p className="text-sm font-medium text-warm-cream">No manual items</p>
              <p className="text-xs text-warm-greige/75">Use the input above to add items you need to buy.</p>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
