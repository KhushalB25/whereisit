import bcrypt from "bcryptjs";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { adminDb, apiError, ApiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

function assertPin(pin: unknown) {
  const value = String(pin || "");
  if (!/^\d{4}$/.test(value)) throw new ApiError("PIN must be exactly 4 digits.", 400);
  return value;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const snap = await adminDb.collection("users").doc(user.uid).get();
    return Response.json({ hasPin: Boolean(snap.data()?.pinHash) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = (await request.json()) as { pin?: string };
    const pin = assertPin(body.pin);
    const pinHash = await bcrypt.hash(pin, 10);

    await adminDb.collection("users").doc(user.uid).set(
      {
        pinHash,
        pinUpdatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = (await request.json()) as { pin?: string; oldPin?: string; newPin?: string };
    const snap = await adminDb.collection("users").doc(user.uid).get();
    const hash = snap.data()?.pinHash;
    if (!hash) throw new ApiError("PIN is not set.", 400);

    if (body.newPin) {
      const oldPin = assertPin(body.oldPin);
      const newPin = assertPin(body.newPin);
      const verified = await bcrypt.compare(oldPin, hash);
      if (!verified) throw new ApiError("Old PIN is incorrect.", 401);
      await adminDb.collection("users").doc(user.uid).set(
        {
          pinHash: await bcrypt.hash(newPin, 10),
          pinUpdatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
      return Response.json({ ok: true });
    }

    const pin = assertPin(body.pin);
    const verified = await bcrypt.compare(pin, hash);
    if (!verified) throw new ApiError("Wrong PIN.", 401);
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const authAgeSeconds = Math.floor(Date.now() / 1000) - Number(user.auth_time || 0);
    if (authAgeSeconds > 300) throw new ApiError("Please log out and log in again before resetting your PIN.", 401);
    await adminDb.collection("users").doc(user.uid).set(
      {
        pinHash: FieldValue.delete(),
        pinUpdatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
