import { FieldValue } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { assertOwnsItem } from "@/lib/api/items-server";
import { apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const { ref } = await assertOwnsItem(user.uid, id);
    await ref.update({
      lastAction: "viewed",
      lastInteractedAt: FieldValue.serverTimestamp()
    });
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
