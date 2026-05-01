"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Edit3, History, ImageIcon, Lock, MapPin, MinusCircle, Package, Save, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageTransition } from "@/components/ui/PageTransition";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { PinModal } from "@/components/security/PinModal";
import { usePrivateVault } from "@/components/security/PrivateVaultProvider";
import { useItems } from "@/hooks/useItems";
import { consumeItem, deleteItem, listConsumptionLogs, markItemFinished, markItemViewed, updateItemLocation } from "@/lib/items";
import { decryptPrivatePayload, encryptPrivatePayload, generateSalt } from "@/lib/private-crypto";
import { daysRemaining, formatDate, timestampToDate } from "@/lib/utils";
import { ROOM_CATEGORIES, type ConsumptionLog, type InventoryItem } from "@/lib/types";

export function ItemDetailClient({ itemId }: { itemId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { pin, unlocked } = usePrivateVault();
  const { items, loading, error, refresh } = useItems();
  const rawItem = useMemo(() => items.find((candidate) => candidate.id === itemId), [itemId, items]);
  const [privatePayload, setPrivatePayload] = useState<{ name: string; location: string; notes: string } | null>(null);
  const item = useMemo(() => (rawItem && privatePayload ? { ...rawItem, ...privatePayload } : rawItem), [privatePayload, rawItem]);
  const [logs, setLogs] = useState<ConsumptionLog[]>([]);
  const [working, setWorking] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationDraft, setLocationDraft] = useState("");
  const [roomDraft, setRoomDraft] = useState("Other");

  async function reloadLogs() {
    if (!user) return;
    setLogs(await listConsumptionLogs(user, itemId));
  }

  useEffect(() => {
    let active = true;
    async function run() {
      if (!rawItem?.isPrivate || !pin || !rawItem.encryptionSalt || !rawItem.encryptedData) {
        setPrivatePayload(null);
        return;
      }
      const payload = await decryptPrivatePayload(pin, rawItem.encryptionSalt, rawItem.encryptedData);
      if (active) {
        setPrivatePayload(payload);
        setLocationDraft(payload.location);
      }
    }
    run().catch(() => setPrivatePayload(null));
    return () => {
      active = false;
    };
  }, [pin, rawItem]);

  useEffect(() => {
    if (!itemId || !user) return;
    markItemViewed(user, itemId).catch(() => undefined);
  }, [itemId, user]);

  useEffect(() => {
    let active = true;
    if (!user) return;
    listConsumptionLogs(user, itemId)
      .then((nextLogs) => {
        if (active) setLogs(nextLogs);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [itemId, user]);

  async function runAction(label: string, action: () => Promise<void>, success: string) {
    setWorking(label);
    try {
      await action();
      await refresh();
      await reloadLogs();
      toast(success, "success");
    } catch (actionError) {
      toast(actionError instanceof Error ? actionError.message : "Action failed.", "error");
    } finally {
      setWorking(null);
    }
  }

  async function handleDelete(target: InventoryItem) {
    if (!window.confirm("Are you sure? This item and its history will be removed.")) return;
    if (!user) return;
    setWorking("delete");
    try {
      await deleteItem(user, target.id);
      toast("Item deleted.", "success");
      router.push("/dashboard");
    } catch (deleteError) {
      toast(deleteError instanceof Error ? deleteError.message : "Could not delete item.", "error");
      setWorking(null);
    }
  }

  if (loading) return <LoadingState label="Loading item" />;
  if (error) return <div className="panel p-5 text-warm-rust">{error}</div>;
  if (!item) return <div className="panel p-6 text-sm text-warm-greige">Item not found.</div>;

  if (item.isPrivate && !unlocked) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="panel p-8 text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-warm-copper" />
          <h1 className="text-xl font-semibold text-warm-cream">Private item</h1>
          <p className="mt-2 text-sm text-warm-greige">Enter your PIN to decrypt and view this item.</p>
          <Button type="button" className="mt-6" onClick={() => setPinOpen(true)}>
            Unlock
          </Button>
        </div>
        <PinModal open={pinOpen} onClose={() => setPinOpen(false)} />
      </div>
    );
  }

  const interval = item.consumptionIntervalDays > 0 ? item.consumptionIntervalDays : 1;
  const remaining = daysRemaining(item.quantity, item.dailyConsumptionRate, interval);
  const consumeProgress = item.dailyConsumptionRate > 0 ? Math.min(100, Math.max(0, (item.quantity / Math.max(item.quantity, item.dailyConsumptionRate * 7)) * 100)) : 0;

  return (
    <PageTransition>
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2 text-sm text-warm-copper">
            <Package className="h-4 w-4" />
            {item.status === "finished" ? "Finished item" : "Inventory item"}
          </div>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-warm-cream">
            {item.isPrivate ? <Lock className="h-6 w-6 text-warm-copper" /> : null}
            {item.name}
          </h1>
          <p className="mt-2 flex gap-2 text-warm-cream/85">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-warm-copper" />
            <span>{item.location}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-warm-greige">
            <span className="rounded-full bg-warm-card px-2.5 py-1">{item.roomCategory}</span>
            <span className="rounded-full bg-warm-card px-2.5 py-1">{item.category}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {item.dailyConsumptionRate > 0 ? (
            <Button type="button" onClick={() => user && runAction("consume", () => consumeItem(user, item), "Consumption recorded.")} loading={working === "consume"}>
              <MinusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Consume One</span>
            </Button>
          ) : null}
          <Link
            href={`/items/${item.id}/edit`}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-warm-border bg-[#24251F] px-3 py-2 text-sm font-semibold text-warm-cream transition hover:bg-warm-border sm:gap-2 sm:px-4"
          >
            <Edit3 className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setLocationDraft(item.location || "");
              setRoomDraft(item.roomCategory || "Other");
              setEditingLocation(true);
            }}
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Location</span>
          </Button>
          <Button type="button" variant="secondary" onClick={() => user && runAction("finish", () => markItemFinished(user, item.id), "Marked as finished.")} loading={working === "finish"}>
            <span className="hidden sm:inline">Mark as Empty</span>
          </Button>
          <Button type="button" variant="danger" onClick={() => handleDelete(item)} loading={working === "delete"}>
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      {editingLocation ? (
        <div className="panel grid gap-4 p-5 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
          <label className="space-y-2">
            <span className="field-label">Location</span>
            <input className="input-shell" value={locationDraft} onChange={(event) => setLocationDraft(event.target.value)} />
          </label>
          <label className="space-y-2">
            <span className="field-label">Room</span>
            <select className="input-shell" value={roomDraft} onChange={(event) => setRoomDraft(event.target.value)}>
              {ROOM_CATEGORIES.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            onClick={() =>
              runAction(
                "location",
                async () => {
                  if (!user) return;
                  let encryptedData = item.encryptedData;
                  let encryptionSalt = item.encryptionSalt;
                  if (item.isPrivate) {
                    encryptionSalt = encryptionSalt || generateSalt();
                    encryptedData = await encryptPrivatePayload(pin!, encryptionSalt, {
                      name: item.name || "",
                      location: locationDraft,
                      notes: item.notes || ""
                    });
                  }
                  await updateItemLocation(user, item.id, {
                    location: locationDraft,
                    roomCategory: roomDraft,
                    encryptedData,
                    encryptionSalt
                  });
                  setEditingLocation(false);
                },
                "Location updated."
              )
            }
            loading={working === "location"}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <div className="panel overflow-hidden">
            {item.photoURL ? (
              <button type="button" onClick={() => setLightbox(true)} className="relative block h-48 w-full bg-warm-bg text-left sm:h-64 lg:h-80">
                <Image src={item.photoURL} alt={item.name || "Private item"} fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" priority />
              </button>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-warm-greige/50">
                <ImageIcon className="h-12 w-12" />
                <span className="text-sm">No photo saved</span>
              </div>
            )}
          </div>

          <div className="panel p-5">
            <h2 className="font-semibold text-warm-cream">Notes</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-warm-cream/85">{item.notes || "No notes yet."}</p>
          </div>

          <section>
            <div className="mb-3 flex items-center gap-2 text-warm-cream">
              <History className="h-5 w-5 text-warm-copper" />
              <h2 className="font-semibold">Consumption history</h2>
            </div>
            {logs.length ? (
              <div className="panel divide-y divide-warm-border">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                    <span className="text-warm-cream/85">{log.date}</span>
                    <span className="font-medium text-warm-cream">-{log.quantityConsumed}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel p-5 text-sm text-warm-greige/75">No consumption logged yet.</div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <InfoPanel label="Quantity" value={String(item.quantity)} />
          <InfoPanel label="Expiry" value={item.expiryDate ? formatDate(item.expiryDate) : "Not set"} />
          <InfoPanel label="Daily rate" value={item.dailyConsumptionRate > 0 ? `${item.dailyConsumptionRate}/day` : "Not tracked"} />
          <InfoPanel label="Added" value={item.createdAt ? format(timestampToDate(item.createdAt)!, "MMM d, yyyy") : "Unknown"} />

          {item.dailyConsumptionRate > 0 ? (
            <div className="panel p-5">
              <div className="text-sm text-warm-greige">Stock estimate</div>
              <div className="mt-2 text-2xl font-semibold text-warm-cream">{remaining} days remaining</div>
              <p className="mt-2 text-sm text-warm-greige">
                Based on {item.dailyConsumptionRate} consumed every {interval} day{interval > 1 ? "s" : ""}, stock will last about {remaining} more uses.
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#24251F]">
                <div className="h-full rounded-full bg-warm-copper" style={{ width: `${consumeProgress}%` }} />
              </div>
            </div>
          ) : null}
        </aside>
      </section>

      {lightbox && item.photoURL ? (
        <button type="button" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(false)} aria-label="Close image">
          <span className="relative block h-full max-h-[86vh] w-full max-w-5xl">
            <Image src={item.photoURL} alt={item.name || "Private item"} fill sizes="100vw" className="object-contain" />
          </span>
        </button>
      ) : null}
    </div>
    </PageTransition>
  );
}

function InfoPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-5">
      <div className="text-sm text-warm-greige/75">{label}</div>
      <div className="mt-1 text-lg font-semibold text-warm-cream">{value}</div>
    </div>
  );
}
