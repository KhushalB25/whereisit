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
        state.tone === "red" && "border-warm-rust/30 bg-warm-rust/12 text-warm-rust",
        state.tone === "orange" && "border-warm-mustard/30 bg-warm-mustard/12 text-warm-mustard",
        state.tone === "neutral" && "border-warm-border bg-[#24251F] text-warm-cream/85"
      )}
    >
      {state.tone !== "neutral" ? <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {state.label}
    </span>
  );
}
