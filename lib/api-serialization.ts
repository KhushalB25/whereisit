import type { Timestamp } from "firebase-admin/firestore";

export function serializeTimestamp(value: Timestamp | null | undefined) {
  if (!value) return null;
  return {
    seconds: value.seconds,
    nanoseconds: value.nanoseconds,
    millis: value.toMillis(),
    iso: value.toDate().toISOString()
  };
}

export function serializeDoc<T extends Record<string, unknown>>(id: string, data: T) {
  return {
    id,
    ...data,
    category: data.category || "Miscellaneous",
    roomCategory: data.roomCategory || "Other",
    isPrivate: Boolean(data.isPrivate),
    encryptionSalt: data.encryptionSalt || null,
    encryptedData: data.encryptedData || null,
    quantity: Number.isFinite(Number(data.quantity)) ? Number(data.quantity) : 1,
    consumptionIntervalDays: Number.isFinite(Number(data.consumptionIntervalDays)) ? Number(data.consumptionIntervalDays) : 1,
    expiryDate: serializeTimestamp(data.expiryDate as Timestamp | null | undefined),
    createdAt: serializeTimestamp(data.createdAt as Timestamp | null | undefined),
    updatedAt: serializeTimestamp(data.updatedAt as Timestamp | null | undefined),
    lastInteractedAt: serializeTimestamp(data.lastInteractedAt as Timestamp | null | undefined),
    lastConsumedAt: serializeTimestamp(data.lastConsumedAt as Timestamp | null | undefined),
    timestamp: serializeTimestamp(data.timestamp as Timestamp | null | undefined)
  };
}
