"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { listItems } from "@/lib/items";
import type { InventoryItem } from "@/lib/types";

const itemCache = new Map<string, InventoryItem[]>();
const inflight = new Map<string, Promise<InventoryItem[]>>();

export function useItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [readyUserId, setReadyUserId] = useState<string | null>(null);
  const [error, setError] = useState<{ userId: string; message: string } | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const nextItems = await listItems(user);
      itemCache.set(user.uid, nextItems);
      setItems(nextItems);
      setReadyUserId(user.uid);
      setError(null);
    } catch (err) {
      setError({ userId: user.uid, message: err instanceof Error ? err.message : "Could not load items." });
      setReadyUserId(user.uid);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    if (!user) {
      return;
    }

    const cached = itemCache.get(user.uid);
    if (cached) {
      queueMicrotask(() => {
        if (!active) return;
        setItems(cached);
        setReadyUserId(user.uid);
        setError(null);
      });
    }

    const request = inflight.get(user.uid) || listItems(user);
    inflight.set(user.uid, request);
    request
      .then((nextItems) => {
        if (!active) return;
        itemCache.set(user.uid, nextItems);
        setItems(nextItems);
        setReadyUserId(user.uid);
        setError(null);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError({ userId: user.uid, message: err.message });
        setReadyUserId(user.uid);
      })
      .finally(() => {
        if (inflight.get(user.uid) === request) inflight.delete(user.uid);
      });

    return () => {
      active = false;
    };
  }, [user]);

  return useMemo(
    () => ({
      items: user ? items : [],
      loading: user ? readyUserId !== user.uid : false,
      error: user && error?.userId === user.uid ? error.message : null,
      refresh
    }),
    [error, items, readyUserId, refresh, user]
  );
}
