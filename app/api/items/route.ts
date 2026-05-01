import { NextRequest } from "next/server";
import { apiError, requireUser } from "@/lib/firebase-admin";
import { createItem, listItems } from "@/lib/api/items-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    return Response.json({ items: await listItems(user.uid) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    return Response.json({ item: await createItem(user.uid, formData) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
