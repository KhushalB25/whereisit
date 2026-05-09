import { AlertTriangle } from "lucide-react";
import { cn, getExpiryState } from "@/lib/utils";
import type { InventoryItem } from "@/lib/types";

export function ExpiryBadge({ item }: { item: InventoryItem }) {
  const state = getExpiryState(item);
  if (!state.label) return null;

  return (
    <span
      role="status"
      aria-label={`Expiry: ${state.label}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        state.tone === "red" && "border-blood/30 bg-blood-muted text-blood",
        state.tone === "orange" && "border-gold/30 bg-gold-dim text-gold-light",
        state.tone === "neutral" && "border-white/[0.06] bg-white/[0.04] text-parchment/85"
      )}
    >
      {state.tone !== "neutral" ? <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {state.label}
    </span>
  );
}
