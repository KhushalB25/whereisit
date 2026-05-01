"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { PinModal } from "@/components/security/PinModal";
import { usePrivateVault } from "@/components/security/PrivateVaultProvider";

export function VaultStatToggle({ showing, onToggle }: { showing: boolean; onToggle: (show: boolean) => void }) {
  const { unlocked, hasPin } = usePrivateVault();
  const [pinOpen, setPinOpen] = useState(false);

  function handleClick() {
    if (showing) {
      onToggle(false);
      return;
    }
    if (!hasPin || unlocked) onToggle(true);
    else setPinOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-warm-border px-2.5 py-1.5 text-xs font-medium text-warm-greige transition-all duration-150 hover:border-warm-copper/60 hover:text-warm-cream active:scale-[0.96]"
      >
        {showing ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {showing ? "Hide vault" : "Include vault"}
      </button>
      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} onSuccess={() => onToggle(true)} />
    </>
  );
}
