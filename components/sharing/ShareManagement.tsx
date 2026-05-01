"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Loader2, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ShareInfo = {
  id: string;
  sharedWithEmail: string;
  permission: string;
  accepted?: boolean;
};

type ShareManagementProps = {
  itemId: string;
};

export function ShareManagement({ itemId }: ShareManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shares, setShares] = useState<ShareInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchShares = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/items/share?itemId=${itemId}`, {
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      });
      if (!res.ok) throw new Error("Could not load shares.");
      const data = await res.json();
      setShares(data.shares || []);
    } catch {
      setShares([]);
    } finally {
      setLoading(false);
    }
  }, [user, itemId]);

  useEffect(() => { fetchShares(); }, [fetchShares]);

  async function handleRevoke(shareId: string) {
    if (!user) return;
    setRevoking(shareId);
    try {
      const res = await fetch(`/api/items/share/${shareId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      });
      if (!res.ok) throw new Error("Could not revoke share.");
      setShares((prev) => prev.filter((s) => s.id !== shareId));
      toast("Share revoked.", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not revoke share.", "error");
    } finally {
      setRevoking(null);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-warm-greige/60" /></div>;
  }

  if (!shares.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-warm-greige/75">
        <Users className="h-4 w-4" />
        Shared with ({shares.length})
      </div>
      <div className="grid gap-2">
        {shares.map((share) => (
          <div key={share.id} className="flex items-center justify-between rounded-xl border border-warm-border bg-warm-bg/60 p-3">
            <div>
              <div className="text-sm font-medium text-warm-cream">{share.sharedWithEmail}</div>
              <div className="mt-0.5 text-xs text-warm-greige/75 capitalize">{share.permission} access</div>
            </div>
            <button
              type="button"
              onClick={() => handleRevoke(share.id)}
              disabled={revoking === share.id}
              className="rounded-lg p-2 text-warm-rust/60 transition hover:bg-[#24251F] hover:text-warm-rust disabled:opacity-50"
              title="Revoke access"
            >
              {revoking === share.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
