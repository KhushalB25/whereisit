import { NextRequest } from "next/server";
import { serializeDoc } from "@/lib/api-serialization";
import { assertOwnsItem } from "@/lib/api/items-server";
import { apiError, requireUser } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const { ref } = await assertOwnsItem(user.uid, id);
    const logs = await ref.collection("consumptionLogs").orderBy("timestamp", "desc").get();
    return Response.json({ logs: logs.docs.map((doc) => serializeDoc(doc.id, doc.data())) });
  } catch (error) {
    return apiError(error);
  }
}
