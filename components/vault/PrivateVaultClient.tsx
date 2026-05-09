"use client";

import { Lock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ItemCard } from "@/components/items/ItemCard";
import { PinModal } from "@/components/security/PinModal";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageTransition } from "@/components/ui/PageTransition";
import { usePrivateVault } from "@/components/security/PrivateVaultProvider";
import { useDisplayItems } from "@/hooks/useDisplayItems";
import { useItems } from "@/hooks/useItems";
import { searchableText } from "@/lib/utils";

export function PrivateVaultClient() {
  const { items, loading, error } = useItems();
  const { unlocked, hasPin, lock } = usePrivateVault();
  const [pinOpen, setPinOpen] = useState(false);
  const [query, setQuery] = useState("");
  const privateItems = useMemo(() => items.filter((item) => item.isPrivate), [items]);
  const displayPrivateItems = useDisplayItems(privateItems, { includeLockedPrivate: true });
  const filtered = useMemo(() => {
    if (!query.trim() || !unlocked) return displayPrivateItems;
    return displayPrivateItems.filter((item) => searchableText(item).includes(query.trim().toLowerCase()));
  }, [displayPrivateItems, query, unlocked]);

  if (loading) return <LoadingState label="Loading private vault" variant="skeleton" />;
  if (error) return <div className="panel p-5 text-blood">{error}</div>;

  if (hasPin && !unlocked) {
    return (
      <PageTransition>
      <div className="mx-auto max-w-xl">
        <div className="panel p-8 text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-blood" />
          <h1 className="text-xl font-semibold text-parchment">Private Vault</h1>
          <p className="mt-2 text-sm text-white/40">Enter your PIN before viewing private items.</p>
          <Button type="button" className="mt-6" onClick={() => setPinOpen(true)}>
            Unlock Vault
          </Button>
        </div>
        <PinModal open={pinOpen} onClose={() => setPinOpen(false)} />
      </div>
    </PageTransition>
    );
  }

  return (
    <PageTransition>
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-blood">
            <Lock className="h-5 w-5" />
            <span className="text-sm font-medium">Private Vault</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-parchment">Private items</h1>
          <p className="mt-1 text-sm text-white/40">Encrypted item names, locations, and notes unlock only with your PIN.</p>
        </div>
        {unlocked ? (
          <Button type="button" variant="secondary" onClick={lock}>
            Lock Vault
          </Button>
        ) : (
          <Button type="button" onClick={() => setPinOpen(true)}>
            Unlock Vault
          </Button>
        )}
      </div>

      {!hasPin ? (
        <div className="panel p-6">
          <h2 className="font-semibold text-parchment">Create a PIN first</h2>
          <p className="mt-2 text-sm text-white/40">Set a 4-digit PIN in Profile â†’ Security before saving private items.</p>
        </div>
      ) : null}

      {unlocked ? (
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
          <input className="input-shell pl-12" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search private items..." aria-label="Search private items" />
        </div>
      ) : null}

      <div className="grid gap-3">
        {filtered.length ? (
          filtered.map((item) => <ItemCard key={item.id} item={item} locked={item.isPrivate && !unlocked} />)
        ) : (
          <div className="panel p-6 text-sm text-white/40">No private items yet.</div>
        )}
      </div>

      <PinModal open={pinOpen} mode={hasPin === false ? "setup" : "verify"} onClose={() => setPinOpen(false)} />
    </div>
    </PageTransition>
  );
}
