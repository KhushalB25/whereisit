import { NextRequest } from "next/server";
import { adminDb, apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
  try {
    const user = await requireUser(request);
    const { shareId } = await params;

    const shareRef = adminDb().collection("shares").doc(shareId);
    const snap = await shareRef.get();

    if (!snap.exists) {
      return Response.json({ error: "Share not found." }, { status: 404 });
    }

    const data = snap.data()!;
    if (data.ownerId !== user.uid) {
      return Response.json({ error: "Only the owner can revoke shares." }, { status: 403 });
    }

    await shareRef.delete();
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
