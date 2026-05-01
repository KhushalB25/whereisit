import { NextRequest } from "next/server";
import { adminDb, apiError } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/**
 * Scheduled endpoint (can be called via cron-job.org or Firebase Scheduled Functions)
 * Checks for items expiring in the next 3 days and expiring today, then sends FCM notifications.
 *
 * This is a stub that requires Firebase Blaze plan with Cloud Messaging configured.
 * Ensure the FCM_CRON_SECRET env var matches the secret sent by your cron trigger.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.FCM_CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = Date.now();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const snapshot = await adminDb()
      .collection("items")
      .where("expiryDate", ">=", new Date(now))
      .where("expiryDate", "<=", threeDaysFromNow)
      .get();

    if (snapshot.empty) {
      return Response.json({ notified: 0 });
    }

    // Group notifications by user
    const byUser = new Map<string, { name: string; days: number }[]>();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const userId = data.userId;
      if (!userId) continue;
      const expiry = data.expiryDate?.toDate?.();
      if (!expiry || data.isPrivate) continue;
      const days = Math.ceil((expiry.getTime() - now) / 86400000);

      if (!byUser.has(userId)) byUser.set(userId, []);
      byUser.get(userId)!.push({ name: data.name || "Untitled", days });
    }

    let notified = 0;
    const userIds = Array.from(byUser.keys());

    for (const userId of userIds) {
      const items = byUser.get(userId)!;
      const userDoc = await adminDb().collection("users").doc(userId).get();
      const tokens: string[] = userDoc.data()?.fcmTokens || [];
      if (!tokens.length) continue;

      const title = items.length === 1
        ? `"${items[0].name}" expiring ${items[0].days <= 0 ? "today" : `in ${items[0].days}d`}`
        : `${items.length} items expiring soon`;

      for (const token of tokens) {
        try {
          await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `key=${process.env.FCM_SERVER_KEY || ""}`,
            },
            body: JSON.stringify({
              to: token,
              notification: {
                title,
                body: items.map((i: { name: string; days: number }) => `${i.name} (${i.days <= 0 ? "today" : `${i.days}d`})`).join(", "),
              },
              data: { url: "/expiry" },
            }),
          });
          notified++;
        } catch {
          // Skip failed tokens
        }
      }
    }

    return Response.json({ notified });
  } catch (error) {
    return apiError(error);
  }
}
