import { NextRequest } from "next/server";
import { apiError, requireUser } from "@/lib/firebase-admin";
import { deleteItem, updateItem } from "@/lib/api/items-server";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const formData = await request.formData();
    return Response.json({ item: await updateItem(user.uid, id, formData) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    await deleteItem(user.uid, id);
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
