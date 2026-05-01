import { Timestamp } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { assertOwnsItem } from "@/lib/api/items-server";
import { adminDb, apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const { ref } = await assertOwnsItem(user.uid, id);

    const snapshot = await ref
      .collection("locationHistory")
      .orderBy("changedAt", "desc")
      .limit(50)
      .get();

    const entries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      changedAt: Timestamp.fromMillis(doc.data().changedAt?.toMillis?.() ?? Date.now()),
    }));

    return Response.json({ entries });
  } catch (error) {
    return apiError(error);
  }
}
