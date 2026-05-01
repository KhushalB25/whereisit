"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Mail, Plus, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import type { SharePermission } from "@/lib/types";

type ShareInviteModalProps = {
  open: boolean;
  itemId: string;
  onClose: () => void;
};

export function ShareInviteModal({ open, itemId, onClose }: ShareInviteModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharePermission>("view");
  const [sending, setSending] = useState(false);

  if (!open) return null;

  async function handleSend() {
    if (!user || !email.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/items/share", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, email: email.trim(), permission }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Could not share.");
      toast(`Shared with ${email.trim()}`, "success");
      setEmail("");
      onClose();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not share item.", "error");
    } finally {
      setSending(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="panel w-full max-w-md p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-warm-cream">Share item</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-warm-greige hover:bg-[#24251F] hover:text-warm-cream">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <label className="space-y-2">
            <span className="field-label">Email address</span>
            <input
              className="input-shell"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            />
          </label>
          <label className="space-y-2">
            <span className="field-label">Permission</span>
            <select className="input-shell" value={permission} onChange={(e) => setPermission(e.target.value as SharePermission)}>
              <option value="view">View only</option>
              <option value="edit">Can edit</option>
            </select>
          </label>
          <Button type="button" onClick={handleSend} loading={sending} disabled={!email.trim()}>
            <Plus className="h-4 w-4" />
            Send invitation
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
