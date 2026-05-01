import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { adminDb, apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const snapshot = await adminDb()
      .collection("users")
      .doc(user.uid)
      .collection("shoppingList")
      .orderBy("createdAt", "desc")
      .get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: Timestamp.fromMillis(doc.data().createdAt?.toMillis?.() ?? Date.now()),
    }));

    return Response.json({ items });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();

    const docRef = adminDb().collection("users").doc(user.uid).collection("shoppingList").doc();
    const data = {
      name: body.name || "Untitled",
      category: body.category || "Miscellaneous",
      quantity: typeof body.quantity === "number" ? body.quantity : 1,
      isSuggested: !!body.isSuggested,
      linkedItemId: body.linkedItemId || null,
      notes: body.notes || null,
      createdAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(data);
    const doc = await docRef.get();

    return Response.json({
      item: { id: docRef.id, ...data, createdAt: Timestamp.fromMillis(doc.createTime?.toMillis() ?? Date.now()) },
    }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");
    if (!itemId) return Response.json({ error: "Missing id parameter" }, { status: 400 });

    await adminDb().collection("users").doc(user.uid).collection("shoppingList").doc(itemId).delete();
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
