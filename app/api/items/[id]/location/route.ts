import { FieldValue } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { assertOwnsItem } from "@/lib/api/items-server";
import { apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const body = (await request.json()) as {
      location?: string | null;
      roomCategory?: string;
      encryptedData?: string | null;
      encryptionSalt?: string | null;
    };
    const { ref, snap } = await assertOwnsItem(user.uid, id);
    const data = snap.data()!;
    const isPrivate = Boolean(data.isPrivate);
    const oldLocation = data.location || null;
    const oldRoom = data.roomCategory || null;
    const newLocation = isPrivate ? null : String(body.location || "").trim();
    const newRoom = String(body.roomCategory || "Other").trim() || "Other";

    await ref.update({
      location: newLocation,
      roomCategory: newRoom,
      encryptedData: isPrivate ? body.encryptedData || data.encryptedData || null : null,
      encryptionSalt: isPrivate ? body.encryptionSalt || data.encryptionSalt || null : null,
      updatedAt: FieldValue.serverTimestamp(),
      lastAction: "updated location",
      lastInteractedAt: FieldValue.serverTimestamp()
    });

    await ref.collection("locationHistory").add({
      oldLocation,
      newLocation,
      oldRoomCategory: oldRoom,
      newRoomCategory: newRoom,
      changedAt: FieldValue.serverTimestamp()
    });

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
