import { FieldValue } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { adminDb, apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = (await request.json()) as { items: Record<string, unknown>[] };
    const items = body.items;

    if (!Array.isArray(items) || !items.length) {
      return Response.json({ error: "items array is required." }, { status: 400 });
    }

    if (items.length > 500) {
      return Response.json({ error: "Maximum 500 items per import." }, { status: 400 });
    }

    const batch = adminDb().batch();
    const ids: string[] = [];

    for (const raw of items) {
      const ref = adminDb().collection("items").doc();
      ids.push(ref.id);

      const isPrivate = raw.isPrivate === true || raw.isPrivate === "yes";
      const name = isPrivate ? null : String(raw.name || "").trim();
      const location = isPrivate ? null : String(raw.location || "").trim();

      batch.set(ref, {
        userId: user.uid,
        name,
        location,
        roomCategory: String(raw.roomCategory || "Other").trim() || "Other",
        category: String(raw.category || "Miscellaneous").trim() || "Miscellaneous",
        isPrivate,
        encryptionSalt: null,
        encryptedData: null,
        quantity: Number(raw.quantity) || 0,
        expiryDate: raw.expiryDate ? new Date(`${raw.expiryDate}T12:00:00`) : null,
        dailyConsumptionRate: Number(raw.dailyConsumptionRate) || 0,
        consumptionIntervalDays: Math.max(0.1, Number(raw.consumptionIntervalDays) || 1),
        notes: isPrivate ? null : String(raw.notes || "").trim(),
        photoURL: null,
        status: raw.status === "finished" ? "finished" : "active",
        itemType: raw.itemType === "wishlist" ? "wishlist" : "inventory",
        estimatedPrice: null,
        priority: "medium",
        purchaseLink: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastAction: "imported",
        lastInteractedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    return Response.json({ imported: ids.length, ids });
  } catch (error) {
    return apiError(error);
  }
}
