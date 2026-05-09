import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { adminDb, apiError, ApiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const MAX_QUESTIONS = 2;
const VALID_INDICES = Array.from({ length: 10 }, (_, i) => i);

function assertQuestions(body: unknown): { questionIndex: number; answer: string }[] {
  if (!body || typeof body !== "object" || !Array.isArray((body as Record<string, unknown>).questions)) {
    throw new ApiError("Invalid request.", 400);
  }
  const questions = (body as { questions: unknown[] }).questions;
  if (questions.length !== MAX_QUESTIONS) throw new ApiError(`Exactly ${MAX_QUESTIONS} questions are required.`, 400);

  const indices = new Set<number>();
  for (const q of questions) {
    if (!q || typeof q !== "object") throw new ApiError("Invalid question entry.", 400);
    const entry = q as { questionIndex?: unknown; answer?: unknown };
    const index = Number(entry.questionIndex);
    if (!VALID_INDICES.includes(index)) throw new ApiError("Invalid question index.", 400);
    if (indices.has(index)) throw new ApiError("Duplicate question.", 400);
    indices.add(index);
    if (!entry.answer || typeof entry.answer !== "string" || !entry.answer.trim()) {
      throw new ApiError("Answer must be a non-empty string.", 400);
    }
  }
  return questions as { questionIndex: number; answer: string }[];
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const snap = await adminDb().collection("users").doc(user.uid).get();
    const records = snap.data()?.securityQuestions;
    if (Array.isArray(records) && records.length === MAX_QUESTIONS) {
      return Response.json({
        hasQuestions: true,
        questions: records.map((r: { questionIndex: number }) => ({ questionIndex: r.questionIndex })),
      });
    }
    return Response.json({ hasQuestions: false, questions: [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = (await request.json()) as Record<string, unknown>;
    const questions = assertQuestions(body);

    const records = await Promise.all(
      questions.map(async (q) => ({
        questionIndex: q.questionIndex,
        answerHash: await bcrypt.hash(q.answer.trim().toLowerCase(), 10),
      }))
    );

    await adminDb().collection("users").doc(user.uid).set(
      { securityQuestions: records },
      { merge: true }
    );

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
