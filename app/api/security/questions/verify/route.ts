import bcrypt from "bcryptjs";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { adminDb, apiError, ApiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const attemptStore = new Map<string, { count: number; windowStart: number; lockedUntil: number | null }>();

function checkRateLimit(uid: string) {
  const now = Date.now();
  const record = attemptStore.get(uid);

  if (record) {
    if (record.lockedUntil && now < record.lockedUntil) {
      const remaining = Math.ceil((record.lockedUntil - now) / 1000);
      throw new ApiError(`Too many attempts. Try again in ${remaining} seconds.`, 429);
    }
    if (now - record.windowStart > WINDOW_MS) {
      record.count = 0;
      record.windowStart = now;
      record.lockedUntil = null;
    }
  }
}

function recordAttempt(uid: string, success: boolean) {
  const now = Date.now();
  const record = attemptStore.get(uid) || { count: 0, windowStart: now, lockedUntil: null };

  if (success) {
    attemptStore.delete(uid);
    return;
  }

  record.count += 1;
  record.windowStart = record.windowStart || now;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }

  attemptStore.set(uid, record);
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    checkRateLimit(user.uid);

    const body = (await request.json()) as { answers?: unknown[] };
    const answers = body.answers;

    if (!Array.isArray(answers) || answers.length !== 2) {
      throw new ApiError("Exactly 2 answers are required.", 400);
    }

    const snap = await adminDb().collection("users").doc(user.uid).get();
    const data = snap.data();
    if (!data?.pinHash) throw new ApiError("PIN is not set.", 400);

    const storedRecords = data.securityQuestions as { questionIndex: number; answerHash: string }[] | undefined;
    if (!Array.isArray(storedRecords) || storedRecords.length !== 2) {
      throw new ApiError("Security questions are not configured.", 400);
    }

    // Validate each answer against stored hashes
    for (const answer of answers) {
      if (!answer || typeof answer !== "object") throw new ApiError("Invalid answer entry.", 400);
      const entry = answer as { questionIndex?: unknown; answer?: unknown };
      const index = Number(entry.questionIndex);
      const text = String(entry.answer || "").trim().toLowerCase();

      const stored = storedRecords.find((r) => r.questionIndex === index);
      if (!stored) throw new ApiError("Question index mismatch.", 400);
      if (!text) throw new ApiError("Answer must be non-empty.", 400);

      const verified = await bcrypt.compare(text, stored.answerHash);
      if (!verified) {
        recordAttempt(user.uid, false);
        throw new ApiError("Wrong answer.", 401);
      }
    }

    // All answers correct — reset PIN
    recordAttempt(user.uid, true);
    await adminDb().collection("users").doc(user.uid).set(
      {
        pinHash: FieldValue.delete(),
        pinUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
