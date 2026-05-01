import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import { adminDb, adminStorage, ApiError } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/api-serialization";

type ItemInput = {
  name: string | null;
  location: string | null;
  roomCategory: string;
  category: string;
  isPrivate: boolean;
  encryptionSalt: string | null;
  encryptedData: string | null;
  quantity: number;
  expiryDate?: string;
  dailyConsumptionRate: number;
  consumptionIntervalDays: number;
  notes: string | null;
  itemType?: string;
  estimatedPrice?: number;
  priority?: string;
  purchaseLink?: string;
};

export function dateStringToTimestamp(value?: string | null) {
  if (!value) return null;
  return Timestamp.fromDate(new Date(`${value}T12:00:00`));
}

export function parseItemInput(formData: FormData): ItemInput {
  const itemType = String(formData.get("itemType") || "inventory").trim() || "inventory";
  const isPrivate = String(formData.get("isPrivate") || "false") === "true";
  const isWishlist = itemType === "wishlist";
  const name = String(formData.get("name") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const encryptedData = String(formData.get("encryptedData") || "").trim() || null;
  const encryptionSalt = String(formData.get("encryptionSalt") || "").trim() || null;

  if (!isPrivate && !isWishlist && (!name || !location)) throw new ApiError("Name and location are required.", 400);
  if (isPrivate && (!encryptedData || !encryptionSalt)) throw new ApiError("Private items require encrypted data.", 400);
  if (isWishlist && !name) throw new ApiError("Wishlist items require a name.", 400);

  return {
    itemType,
    name: isPrivate ? null : name,
    location: isPrivate || isWishlist ? null : location,
    roomCategory: String(formData.get("roomCategory") || "Other").trim() || "Other",
    category: String(formData.get("category") || "Miscellaneous").trim() || "Miscellaneous",
    isPrivate,
    encryptionSalt,
    encryptedData,
    quantity: Number(formData.get("quantity") || 0),
    expiryDate: String(formData.get("expiryDate") || ""),
    dailyConsumptionRate: Number(formData.get("dailyConsumptionRate") || 0),
    consumptionIntervalDays: Math.max(0.1, Number(formData.get("consumptionIntervalDays") || 1)),
    notes: isPrivate ? null : String(formData.get("notes") || "").trim(),
    estimatedPrice: formData.has("estimatedPrice") ? Number(formData.get("estimatedPrice")) : undefined,
    priority: String(formData.get("priority") || "medium").trim() || "medium",
    purchaseLink: String(formData.get("purchaseLink") || "").trim() || undefined,
  };
}

export function itemPayload(values: ItemInput) {
  return {
    name: values.name,
    location: values.location,
    roomCategory: values.roomCategory,
    category: values.category,
    isPrivate: values.isPrivate,
    encryptionSalt: values.encryptionSalt,
    encryptedData: values.encryptedData,
    quantity: Number.isFinite(values.quantity) ? values.quantity : 0,
    expiryDate: dateStringToTimestamp(values.expiryDate),
    dailyConsumptionRate: Number.isFinite(values.dailyConsumptionRate) ? values.dailyConsumptionRate : 0,
    consumptionIntervalDays: Number.isFinite(values.consumptionIntervalDays) ? Math.max(0.1, values.consumptionIntervalDays) : 1,
    notes: values.notes,
    itemType: values.itemType || "inventory",
    estimatedPrice: Number.isFinite(values.estimatedPrice) ? values.estimatedPrice : null,
    priority: values.priority || "medium",
    purchaseLink: values.purchaseLink || null,
  };
}

export async function assertOwnsItem(userId: string, itemId: string) {
  const ref = adminDb().collection("items").doc(itemId);
  const snap = await ref.get();
  if (!snap.exists) throw new ApiError("Item not found.", 404);
  if (snap.data()?.userId !== userId) throw new ApiError("You do not have access to this item.", 403);
  return { ref, snap };
}

export async function uploadPhoto(userId: string, itemId: string, file: File | null) {
  if (!file || !file.size) return null;
  if (!file.type.startsWith("image/")) throw new ApiError("Photo must be an image.", 400);
  if (file.size > 10 * 1024 * 1024) throw new ApiError("Photo must be under 10 MB.", 400);

  const bucket = adminStorage().bucket();
  const path = `users/${userId}/items/${itemId}/photo`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const destination = bucket.file(path);
  const token = randomUUID();
  await destination.save(buffer, {
    contentType: file.type || "image/jpeg",
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000",
      metadata: {
        firebaseStorageDownloadTokens: token
      }
    }
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

export async function listItems(userId: string) {
  const snapshot = await adminDb().collection("items").where("userId", "==", userId).get();
  return snapshot.docs
    .map((doc) => serializeDoc(doc.id, doc.data()))
    .sort((a, b) => ((b.createdAt as { millis?: number } | null)?.millis ?? 0) - ((a.createdAt as { millis?: number } | null)?.millis ?? 0));
}

export async function createItem(userId: string, formData: FormData) {
  const input = parseItemInput(formData);
  const itemRef = adminDb().collection("items").doc();
  const file = formData.get("photo");
  let photoURL: string | null = null;
  const isWishlist = input.itemType === "wishlist";

  if (file instanceof File) {
    photoURL = await uploadPhoto(userId, itemRef.id, file);
  }

  const payload = {
    ...itemPayload(input),
    userId,
    photoURL,
    status: isWishlist ? "active" : "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastAction: isWishlist ? "wishlisted" : "created",
    lastInteractedAt: FieldValue.serverTimestamp()
  };

  await itemRef.set(payload);
  const snap = await itemRef.get();
  return serializeDoc(itemRef.id, snap.data() || payload);
}

export async function updateItem(userId: string, itemId: string, formData: FormData) {
  const { ref } = await assertOwnsItem(userId, itemId);
  const input = parseItemInput(formData);
  const file = formData.get("photo");
  const payload: Record<string, unknown> = {
    ...itemPayload(input),
    updatedAt: FieldValue.serverTimestamp(),
    lastAction: "updated",
    lastInteractedAt: FieldValue.serverTimestamp()
  };

  // If quantity was restored above zero, reactivate the item
  if (input.quantity > 0) payload.status = "active";

  if (file instanceof File && file.size) {
    payload.photoURL = await uploadPhoto(userId, itemId, file);
  }

  await ref.update(payload);
  const snap = await ref.get();
  return serializeDoc(snap.id, snap.data() || {});
}

export async function deleteItem(userId: string, itemId: string) {
  const { ref } = await assertOwnsItem(userId, itemId);
  const logs = await ref.collection("consumptionLogs").get();
  const batch = adminDb().batch();
  logs.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(ref);
  await batch.commit();

  await adminStorage().bucket().file(`users/${userId}/items/${itemId}/photo`).delete({ ignoreNotFound: true });
}
