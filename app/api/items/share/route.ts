import { FieldValue } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { assertOwnsItem } from "@/lib/api/items-server";
import { adminDb, apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { itemId, email, permission } = await request.json() as {
      itemId: string;
      email: string;
      permission?: string;
    };

    if (!itemId || !email) {
      return Response.json({ error: "itemId and email are required." }, { status: 400 });
    }

    if (email === user.email) {
      return Response.json({ error: "Cannot share with yourself." }, { status: 400 });
    }

    await assertOwnsItem(user.uid, itemId);

    const shareRef = adminDb.collection("shares").doc();
    await shareRef.set({
      itemId,
      ownerId: user.uid,
      ownerEmail: user.email,
      sharedWithEmail: email.trim().toLowerCase(),
      permission: permission === "edit" ? "edit" : "view",
      createdAt: FieldValue.serverTimestamp(),
      accepted: false,
    });

    return Response.json({ shareId: shareRef.id }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return Response.json({ error: "itemId is required." }, { status: 400 });
    }

    await assertOwnsItem(user.uid, itemId);

    const snapshot = await adminDb
      .collection("shares")
      .where("itemId", "==", itemId)
      .get();

    const shares = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return Response.json({ shares });
  } catch (error) {
    return apiError(error);
  }
}
