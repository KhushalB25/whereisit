import { NextRequest } from "next/server";
import { adminDb, apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userEmail = user.email?.toLowerCase().trim();

    if (!userEmail) {
      return Response.json({ error: "User has no email." }, { status: 400 });
    }

    const snapshot = await adminDb()
      .collection("shares")
      .where("sharedWithEmail", "==", userEmail)
      .get();

    if (snapshot.empty) {
      return Response.json({ items: [] });
    }

    const uniqueIds = new Set(snapshot.docs.map((doc) => doc.data().itemId));
    const itemIds: string[] = [];
    uniqueIds.forEach((id) => itemIds.push(id));

    if (!itemIds.length) {
      return Response.json({ items: [] });
    }

    const itemsSnap = await adminDb()
      .collection("items")
      .where("__name__", "in", itemIds.slice(0, 30))
      .get();

    const items = itemsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return Response.json({ items });
  } catch (error) {
    return apiError(error);
  }
}
