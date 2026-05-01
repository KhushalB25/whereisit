"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivateVault } from "@/components/security/PrivateVaultProvider";
import { decryptPrivatePayload } from "@/lib/private-crypto";
import type { InventoryItem } from "@/lib/types";

export function useDisplayItems(items: InventoryItem[], options: { includeLockedPrivate?: boolean } = {}) {
  const { pin, unlocked } = usePrivateVault();
  const [decrypted, setDecrypted] = useState<Record<string, Partial<InventoryItem>>>({});
  const includeLockedPrivate = Boolean(options.includeLockedPrivate);
  const itemSignature = useMemo(
    () => items.map((item) => `${item.id}:${item.isPrivate}:${item.encryptionSalt || ""}:${item.encryptedData || ""}`).join("|"),
    [items]
  );
  const decryptTargets = useMemo(
    () =>
      items
        .filter((item) => item.isPrivate && item.encryptionSalt && item.encryptedData)
        .map((item) => ({
          id: item.id,
          encryptionSalt: item.encryptionSalt!,
          encryptedData: item.encryptedData!
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemSignature]
  );

  useEffect(() => {
    let active = true;
    async function run() {
      if (!pin) {
        setDecrypted((current) => (Object.keys(current).length ? {} : current));
        return;
      }
      const entries = await Promise.all(
        decryptTargets.map(async (item) => {
          try {
            const payload = await decryptPrivatePayload(pin, item.encryptionSalt, item.encryptedData);
            return [item.id, payload] as const;
          } catch {
            return [item.id, {}] as const;
          }
        })
      );
      if (active) setDecrypted(Object.fromEntries(entries));
    }
    run();
    return () => {
      active = false;
    };
  }, [decryptTargets, pin]);

  return useMemo(() => {
    return items
      .filter((item) => includeLockedPrivate || !item.isPrivate)
      .map((item) => {
        const privateData = decrypted[item.id];
        return privateData ? { ...item, ...privateData } : item;
      });
  }, [decrypted, includeLockedPrivate, items]);
}
