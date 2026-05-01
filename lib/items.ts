import type { User } from "firebase/auth";
import { resizeImage } from "@/lib/images";
import type { ConsumptionLog, InventoryFormValues, InventoryItem } from "@/lib/types";

async function authHeaders(user: User) {
  return {
    Authorization: `Bearer ${await user.getIdToken()}`
  };
}

async function apiFetch<T>(user: User, url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${await user.getIdToken()}`);

  const response = await fetch(url, {
    ...init,
    headers
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Request failed.");
  }
  return data as T;
}

async function buildItemFormData(values: InventoryFormValues) {
  const formData = new FormData();
  formData.set("name", values.name);
  formData.set("location", values.location);
  formData.set("roomCategory", values.roomCategory);
  formData.set("category", values.category === "Custom" ? values.customCategory || "Custom" : values.category);
  formData.set("isPrivate", String(values.isPrivate));
  formData.set("encryptionSalt", values.encryptionSalt || "");
  formData.set("encryptedData", values.encryptedData || "");
  formData.set("quantity", String(values.quantity));
  formData.set("expiryDate", values.expiryDate);
  formData.set("dailyConsumptionRate", String(values.dailyConsumptionRate));
  formData.set("consumptionIntervalDays", String(values.consumptionIntervalDays));
  formData.set("notes", values.notes);
  formData.set("itemType", values.itemType || "inventory");

  if (values.estimatedPrice !== undefined) {
    formData.set("estimatedPrice", String(values.estimatedPrice));
  }
  if (values.priority) formData.set("priority", values.priority);
  if (values.purchaseLink) formData.set("purchaseLink", values.purchaseLink);

  if (values.photoFile) {
    const resized = await resizeImage(values.photoFile);
    formData.set("photo", resized, "photo.jpg");
  }

  return formData;
}

export async function listItems(user: User) {
  const data = await apiFetch<{ items: InventoryItem[] }>(user, "/api/items");
  return data.items;
}

export async function createItem(user: User, values: InventoryFormValues) {
  const formData = await buildItemFormData(values);
  const data = await apiFetch<{ item: InventoryItem }>(user, "/api/items", {
    method: "POST",
    body: formData
  });
  return data.item.id;
}

export async function updateItem(user: User, itemId: string, values: InventoryFormValues) {
  const formData = await buildItemFormData(values);
  await apiFetch<{ item: InventoryItem }>(user, `/api/items/${itemId}`, {
    method: "PATCH",
    body: formData
  });
}

export async function markItemViewed(user: User, itemId: string) {
  await apiFetch<{ ok: true }>(user, `/api/items/${itemId}/view`, { method: "POST" });
}

export async function markItemFinished(user: User, itemId: string) {
  await apiFetch<{ ok: true }>(user, `/api/items/${itemId}/finish`, { method: "POST" });
}

export async function deleteItem(user: User, itemId: string) {
  await apiFetch<{ ok: true }>(user, `/api/items/${itemId}`, { method: "DELETE" });
}

export async function consumeItem(user: User, item: InventoryItem) {
  await apiFetch<{ ok: true }>(user, `/api/items/${item.id}/consume`, { method: "POST" });
}

export async function updateItemLocation(
  user: User,
  itemId: string,
  values: { location: string; roomCategory: string; encryptedData?: string | null; encryptionSalt?: string | null }
) {
  await apiFetch<{ ok: true }>(user, `/api/items/${itemId}/location`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(values)
  });
}

export async function listConsumptionLogs(user: User, itemId: string) {
  const data = await apiFetch<{ logs: ConsumptionLog[] }>(user, `/api/items/${itemId}/consumptionLogs`);
  return data.logs;
}

export async function listLocationHistory(user: User, itemId: string) {
  const data = await apiFetch<{ entries: import("./types").LocationHistoryEntry[] }>(
    user,
    `/api/items/${itemId}/location-history`
  );
  return data.entries;
}

export { authHeaders };

export async function restockItem(user: User, itemId: string, quantity: number) {
  await apiFetch<{ ok: true }>(user, "/api/items/restock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, quantity })
  });
}

export async function listShoppingList(user: User) {
  const data = await apiFetch<{ items: import("./types").ShoppingItem[] }>(user, "/api/shopping");
  return data.items;
}

export async function addShoppingItem(
  user: User,
  item: { name: string; category?: string; quantity?: number; isSuggested?: boolean; linkedItemId?: string; notes?: string }
) {
  const data = await apiFetch<{ item: import("./types").ShoppingItem }>(user, "/api/shopping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return data.item;
}

export async function deleteShoppingItem(user: User, itemId: string) {
  await apiFetch<{ ok: true }>(user, `/api/shopping?id=${itemId}`, { method: "DELETE" });
}
