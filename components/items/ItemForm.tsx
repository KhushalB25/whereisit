"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Camera, LayoutTemplate, Save } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { PinModal } from "@/components/security/PinModal";
import { usePrivateVault } from "@/components/security/PrivateVaultProvider";
import { createItem, updateItem } from "@/lib/items";
import { encryptPrivatePayload, generateSalt } from "@/lib/private-crypto";
import { timestampToDate } from "@/lib/utils";
import { ITEM_CATEGORIES, ROOM_CATEGORIES, type InventoryFormValues, type InventoryItem } from "@/lib/types";
import { TemplatePickerModal } from "@/components/items/TemplatePickerModal";
import type { ItemTemplate } from "@/lib/item-templates";

type ItemFormProps = {
  item?: InventoryItem;
  mode?: "location" | "expiry" | "edit" | "wishlist";
};

export function ItemForm({ item, mode = item ? "edit" : "location" }: ItemFormProps) {
  const searchParams = useSearchParams();
  const barcodeName = searchParams.get("name");
  const barcodeCategory = searchParams.get("category");
  const { user } = useAuth();
  const { pin, unlocked, hasPin } = usePrivateVault();
  const router = useRouter();
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(item?.photoURL ?? null);
  const [saving, setSaving] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const isExpiryMode = mode === "expiry" || mode === "edit";
  const isWishlistMode = mode === "wishlist";
  const [values, setValues] = useState<InventoryFormValues>(() => ({
    name: item?.name ?? barcodeName ?? "",
    location: item?.location ?? "",
    roomCategory: item?.roomCategory ?? "Other",
    category: barcodeCategory && ITEM_CATEGORIES.includes(barcodeCategory as never)
      ? (barcodeCategory as InventoryFormValues["category"])
      : ITEM_CATEGORIES.includes(item?.category as never)
        ? (item?.category as InventoryFormValues["category"])
        : item?.category ? "Custom" : "Miscellaneous",
    customCategory: item?.category && !ITEM_CATEGORIES.includes(item.category as never) ? item.category : "",
    isPrivate: item?.isPrivate ?? false,
    encryptionSalt: item?.encryptionSalt ?? null,
    encryptedData: item?.encryptedData ?? null,
    quantity: item?.quantity ?? 1,
    expiryDate: item?.expiryDate ? format(timestampToDate(item.expiryDate)!, "yyyy-MM-dd") : "",
    dailyConsumptionRate: item?.dailyConsumptionRate ?? 0,
    consumptionIntervalDays: item?.consumptionIntervalDays ?? 1,
    notes: item?.notes ?? "",
    photoFile: null,
    itemType: item?.itemType ?? (isWishlistMode ? "wishlist" : "inventory"),
    estimatedPrice: item?.estimatedPrice ?? undefined,
    priority: item?.priority ?? "medium",
    purchaseLink: item?.purchaseLink ?? ""
  }));

  const title = item ? "Edit item" : mode === "expiry" ? "Add Expiry Tracker" : mode === "wishlist" ? "Add Wishlist Item" : "Add Location Tracker";
  const canSave = useMemo(() => {
    if (!values.name.trim()) return false;
    if (isWishlistMode) return true;
    if (!values.location.trim()) return false;
    if (!isExpiryMode) return true;
    return (
      !Number.isNaN(values.quantity) &&
      values.quantity >= 0 &&
      !Number.isNaN(values.dailyConsumptionRate) &&
      values.dailyConsumptionRate >= 0 &&
      !Number.isNaN(values.consumptionIntervalDays) &&
      values.consumptionIntervalDays >= 1
    );
  }, [isExpiryMode, isWishlistMode, values]);

  function updateValue<Key extends keyof InventoryFormValues>(key: Key, value: InventoryFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast("Choose an image under 10 MB.", "error");
      return;
    }
    updateValue("photoFile", file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleSelectTemplate(template: ItemTemplate) {
    const expiry = template.expiryDays
      ? format(new Date(Date.now() + template.expiryDays * 86_400_000), "yyyy-MM-dd")
      : "";
    setValues((current) => ({
      ...current,
      name: template.name,
      category: template.category as InventoryFormValues["category"],
      roomCategory: template.roomCategory as InventoryFormValues["roomCategory"],
      quantity: template.quantity,
      dailyConsumptionRate: template.dailyConsumptionRate,
      consumptionIntervalDays: template.consumptionIntervalDays,
      expiryDate: expiry,
      customCategory: ""
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !canSave) return;
    if (values.isPrivate && !pin) {
      setPinOpen(true);
      return;
    }

    setSaving(true);
    try {
      const payload = { ...values };
      payload.itemType = isWishlistMode ? "wishlist" : "inventory";
      if (payload.isPrivate) {
        const salt = payload.encryptionSalt || generateSalt();
        payload.encryptionSalt = salt;
        payload.encryptedData = await encryptPrivatePayload(pin!, salt, {
          name: payload.name,
          location: payload.location,
          notes: payload.notes
        });
      } else {
        payload.encryptionSalt = null;
        payload.encryptedData = null;
      }

      if (item) {
        await updateItem(user, item.id, payload);
        toast("Item updated.", "success");
        router.push(`/items/${item.id}`);
      } else {
        const itemId = await createItem(user, payload);
        toast("Item added.", "success");
        router.push(`/items/${itemId}`);
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save item.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-warm-cream">{title}</h1>
        <p className="mt-1 text-sm text-warm-greige">
          {mode === "expiry"
            ? "Track location, stock, expiry dates, and daily consumption."
            : mode === "wishlist"
              ? "Save items you want to buy. Mark them as purchased to move into inventory."
              : "Track exactly where the item lives. Expiry fields can be added later."}
        </p>
        {!item ? (
          <Button type="button" variant="ghost" className="mt-3" onClick={() => setTemplateOpen(true)}>
            <LayoutTemplate className="h-4 w-4" />
            Choose a template
          </Button>
        ) : null}
      </div>

      <section className="panel grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <Field label="Name">
          <input className="input-shell" value={values.name} onChange={(event) => updateValue("name", event.target.value)} required placeholder="Protein Shake" />
        </Field>
        {isExpiryMode && !isWishlistMode ? (
          <Field label="Quantity">
            <input
              className="input-shell"
              type="number"
              step="any"
              inputMode="decimal"
              value={values.quantity}
              onChange={(event) => updateValue("quantity", Math.max(0, Number(event.target.value)))}
              required
            />
          </Field>
        ) : null}
        {!isWishlistMode ? (
          <Field label="Location" className="sm:col-span-2">
            <input
              className="input-shell"
              value={values.location}
              onChange={(event) => updateValue("location", event.target.value)}
              required
              placeholder="Top shelf of kitchen cupboard"
            />
          </Field>
        ) : null}
        <Field label="Room category">
          <select className="input-shell" value={values.roomCategory} onChange={(event) => updateValue("roomCategory", event.target.value as InventoryFormValues["roomCategory"])}>
            {ROOM_CATEGORIES.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Item category">
          <select className="input-shell" value={values.category} onChange={(event) => updateValue("category", event.target.value as InventoryFormValues["category"])}>
            {ITEM_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        {values.category === "Custom" ? (
          <Field label="Custom category" className="sm:col-span-2">
            <input className="input-shell" value={values.customCategory} onChange={(event) => updateValue("customCategory", event.target.value)} placeholder="Collectibles" />
          </Field>
        ) : null}
        {isWishlistMode ? (
          <>
            <Field label="Estimated price" hint="$">
              <input
                className="input-shell"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={values.estimatedPrice ?? ""}
                onChange={(event) => updateValue("estimatedPrice", event.target.value ? Number(event.target.value) : undefined)}
              />
            </Field>
            <Field label="Priority">
              <select className="input-shell" value={values.priority} onChange={(event) => updateValue("priority", event.target.value as InventoryFormValues["priority"])}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Purchase link" className="sm:col-span-2">
              <input className="input-shell" value={values.purchaseLink ?? ""} onChange={(event) => updateValue("purchaseLink", event.target.value)} placeholder="https://store.com/product" />
            </Field>
          </>
        ) : null}
        {isExpiryMode ? (
          <>
            <Field label="Expiry date" hint="Optional">
              <input className="input-shell" type="date" value={values.expiryDate} onChange={(event) => updateValue("expiryDate", event.target.value)} />
            </Field>
            <Field label="Daily consumption rate" hint="Use 0 if this item is not consumed daily.">
              <input
                className="input-shell"
                type="number"
                step="any"
                inputMode="decimal"
                value={values.dailyConsumptionRate}
                onChange={(event) => updateValue("dailyConsumptionRate", Number(event.target.value))}
              />
            </Field>
            <Field label="Consumption cadence" hint="Example: 2 means once every 2 days.">
              <input
                className="input-shell"
                type="number"
                min="1"
                step="any"
                inputMode="decimal"
                value={values.consumptionIntervalDays}
                onChange={(event) => updateValue("consumptionIntervalDays", Math.max(1, Number(event.target.value)))}
              />
            </Field>
          </>
        ) : null}
        {!isWishlistMode ? (
          <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-xl border border-warm-border bg-warm-bg/50 p-4">
            <span>
              <span className="block text-sm font-medium text-warm-cream">Private Item</span>
              <span className="mt-1 block text-xs text-warm-greige/75">Encrypt name, location, and notes. Requires your private PIN to view.</span>
            </span>
            <input
              type="checkbox"
              checked={values.isPrivate}
              onChange={(event) => {
                updateValue("isPrivate", event.target.checked);
                if (event.target.checked && !unlocked) setPinOpen(true);
              }}
              className="h-5 w-5 accent-warm-copper"
            />
          </label>
        ) : null}
        {!isWishlistMode && values.isPrivate && hasPin === false ? (
          <div className="sm:col-span-2 rounded-xl border border-warm-mustard/30 bg-warm-mustard/10 p-4 text-sm text-warm-mustard">
            Create a private PIN to save encrypted items.
          </div>
        ) : null}
        {!isWishlistMode ? (
        <Field label="Photo" hint="Camera or file picker. Images are resized before upload." className="sm:col-span-2">
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-warm-border bg-warm-bg/70 p-5 text-center transition hover:border-warm-copper/70">
            {photoPreview ? (
              <span className="relative mb-4 block h-32 w-full overflow-hidden rounded-xl sm:h-44">
                <span
                  className="absolute inset-0 rounded-xl bg-cover bg-center transition duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url("${photoPreview}")` }}
                  role="img"
                  aria-label="Selected item photo"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-transparent transition duration-200 group-hover:bg-black/40 group-hover:text-white">
                  Change photo
                </span>
              </span>
            ) : (
              <Camera className="mb-3 h-8 w-8 text-warm-copper" />
            )}
            <span className="text-sm font-medium text-warm-cream">{photoPreview ? "Tap to change" : "Choose photo"}</span>
            <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={handlePhoto} />
          </label>
        </Field>
        ) : null}
        <Field label="Notes" hint="Optional" className="sm:col-span-2">
          <textarea
            className="input-shell min-h-32 resize-y"
            value={values.notes}
            onChange={(event) => updateValue("notes", event.target.value)}
            placeholder="Serial number, box label, refill details..."
          />
        </Field>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} disabled={!canSave}>
          <Save className="h-4 w-4" />
          Save item
        </Button>
      </div>
    </form>
    <PinModal open={pinOpen} mode={hasPin === false ? "setup" : "verify"} onClose={() => setPinOpen(false)} />
    <TemplatePickerModal open={templateOpen} onSelect={handleSelectTemplate} onClose={() => setTemplateOpen(false)} />
    </>
  );
}
