import { FieldValue } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { adminDb, apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = (await request.json().catch(() => ({}))) as { displayName?: string; email?: string };
    await adminDb().collection("users").doc(user.uid).set(
      {
        displayName: body.displayName || user.name || "",
        email: body.email || user.email || "",
        createdAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = (await request.json().catch(() => ({}))) as { displayName?: string };
    const displayName = String(body.displayName || "").trim();
    if (!displayName) return Response.json({ error: "Display name is required." }, { status: 400 });
    await adminDb().collection("users").doc(user.uid).set(
      {
        displayName,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    await adminDb().collection("users").doc(user.uid).set({ displayName }, { merge: true });
    return Response.json({ ok: true, displayName });
  } catch (error) {
    return apiError(error);
  }
}
