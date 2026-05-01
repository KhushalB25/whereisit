"use client";

import { useEffect, useMemo, useState } from "react";
import { ItemForm } from "@/components/items/ItemForm";
import { PinModal } from "@/components/security/PinModal";
import { usePrivateVault } from "@/components/security/PrivateVaultProvider";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { useItems } from "@/hooks/useItems";
import { decryptPrivatePayload } from "@/lib/private-crypto";

export function EditItemClient({ itemId }: { itemId: string }) {
  const { items, loading, error } = useItems();
  const { pin, unlocked } = usePrivateVault();
  const rawItem = items.find((candidate) => candidate.id === itemId);
  const [pinOpen, setPinOpen] = useState(false);
  const [privatePayload, setPrivatePayload] = useState<{ name: string; location: string; notes: string } | null>(null);
  const item = useMemo(() => (rawItem && privatePayload ? { ...rawItem, ...privatePayload } : rawItem), [privatePayload, rawItem]);

  useEffect(() => {
    if (!rawItem?.isPrivate || !pin || !rawItem.encryptionSalt || !rawItem.encryptedData) return;
    decryptPrivatePayload(pin, rawItem.encryptionSalt, rawItem.encryptedData)
      .then(setPrivatePayload)
      .catch(() => setPrivatePayload(null));
  }, [pin, rawItem]);

  if (loading) return <LoadingState label="Loading item" />;
  if (error) return <div className="panel p-5 text-warm-rust">{error}</div>;
  if (!item) return <div className="panel p-6 text-sm text-warm-greige">Item not found.</div>;
  if (item.isPrivate && !unlocked) {
    return (
      <div className="panel mx-auto max-w-xl p-8 text-center">
        <h1 className="text-xl font-semibold text-warm-cream">Private item</h1>
        <p className="mt-2 text-sm text-warm-greige">Unlock your vault before editing this item.</p>
        <Button type="button" className="mt-6" onClick={() => setPinOpen(true)}>
          Unlock
        </Button>
        <PinModal open={pinOpen} onClose={() => setPinOpen(false)} />
      </div>
    );
  }

  return <ItemForm item={item} />;
}
