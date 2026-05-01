import { FieldValue } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { adminDb, apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return Response.json({ error: "FCM token is required." }, { status: 400 });
    }

    await adminDb.collection("users").doc(user.uid).update({
      fcmTokens: FieldValue.arrayUnion(token),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
