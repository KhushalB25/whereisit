import { FieldValue } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { assertOwnsItem } from "@/lib/api/items-server";
import { adminDb, apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const { ref, snap } = await assertOwnsItem(user.uid, id);
    const item = snap.data() || {};
    const amount = Number(item.dailyConsumptionRate || 0) > 0 ? Number(item.dailyConsumptionRate) : 1;
    const nextQuantity = Math.max(0, Number(item.quantity || 0) - amount);

    await adminDb.runTransaction(async (transaction) => {
      transaction.update(ref, {
        quantity: nextQuantity,
        status: nextQuantity <= 0 ? "finished" : item.status || "active",
        lastConsumedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastAction: "consumed",
        lastInteractedAt: FieldValue.serverTimestamp()
      });
      transaction.set(ref.collection("consumptionLogs").doc(), {
        timestamp: FieldValue.serverTimestamp(),
        quantityConsumed: amount,
        date: new Date().toISOString().slice(0, 10)
      });
    });

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
