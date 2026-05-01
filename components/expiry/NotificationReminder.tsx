"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { InventoryItem } from "@/lib/types";
import { getExpiryState } from "@/lib/utils";

export function NotificationReminder({ items }: { items: InventoryItem[] }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const todayItems = items.filter((item) => getExpiryState(item).days === 0);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      toast("This browser does not support notifications.", "error");
      return;
    }

    setLoading(true);
    try {
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/sw.js");
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast("Notification permission was not granted.", "error");
        return;
      }
      if (todayItems.length) {
        new Notification("WhereIsIt expiry reminder", {
          body: `${todayItems.length} item${todayItems.length === 1 ? "" : "s"} expire today.`
        });
      }
      toast("Expiry notifications enabled.", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not enable notifications.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={enableNotifications} loading={loading}>
      <Bell className="h-4 w-4" />
      Enable reminders
    </Button>
  );
}
