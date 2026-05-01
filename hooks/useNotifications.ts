"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export function useNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);

    // Token is already stored if user previously granted permission
    if (Notification.permission === "granted") {
      registerToken().catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function registerToken(): Promise<string | null> {
    if (!user || !("Notification" in window)) return null;

    try {
      // Dynamic import to avoid bundling FCM on every page load
      const { getMessaging, getToken } = await import("firebase/messaging");
      const { firebaseApp } = await import("@/lib/firebase");
      const messaging = getMessaging(firebaseApp);
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (currentToken) {
        await fetch("/api/notifications/register", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: currentToken }),
        });
        setToken(currentToken);
        return currentToken;
      }
    } catch {
      // FCM setup may not be complete — silently fail
    }
    return null;
  }

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported" as const;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      await registerToken();
    }
    return result;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { permission, token, requestPermission };
}
