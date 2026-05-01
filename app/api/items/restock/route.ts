import { FieldValue } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { assertOwnsItem } from "@/lib/api/items-server";
import { apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || typeof quantity !== "number" || quantity < 0) {
      return Response.json({ error: "itemId and a non-negative quantity are required." }, { status: 400 });
    }

    const { ref } = await assertOwnsItem(user.uid, itemId);
    await ref.update({
      quantity,
      status: quantity > 0 ? "active" : "finished",
      updatedAt: FieldValue.serverTimestamp(),
      lastAction: "restocked",
      lastInteractedAt: FieldValue.serverTimestamp(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
