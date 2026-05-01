"use client";

import { Delete, KeyRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { usePrivateVault } from "@/components/security/PrivateVaultProvider";

type PinModalProps = {
  open: boolean;
  mode?: "verify" | "setup";
  onClose: () => void;
  onSuccess?: () => void;
};

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function PinModal({ open, mode = "verify", onClose, onSuccess }: PinModalProps) {
  const { verifyPin, setupPin, resetPin } = usePrivateVault();
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const okRef = useRef<HTMLButtonElement>(null);
  const pinLength = pin.length;

  // Defer visibility until after mount for enter animation
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [open]);

  // Auto-focus OK button when PIN is complete
  useEffect(() => {
    if (pinLength === 4 && mounted) {
      okRef.current?.focus();
    }
  }, [pinLength, mounted]);

  const press = useCallback((value: string) => {
    setPin((current) => (current.length < 4 ? current + value : current));
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key >= "0" && event.key <= "9") {
        press(event.key);
      } else if (event.key === "Backspace" || event.key === "Delete") {
        setPin((current) => current.slice(0, -1));
      } else if (event.key === "Enter" && pinLength === 4) {
        submit();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pinLength]
  );

  async function submit() {
    if (pin.length !== 4) return;
    setLoading(true);
    try {
      if (mode === "setup") await setupPin(pin);
      else await verifyPin(pin);
      toast(mode === "setup" ? "PIN created." : "Private vault unlocked.", "success");
      setPin("");
      onSuccess?.();
      onClose();
    } catch (error) {
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 360);
      toast(error instanceof Error ? error.message : "Wrong PIN.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function forgotPin() {
    try {
      await resetPin();
      toast("PIN reset. Create a new PIN to unlock private items.", "success");
      onClose();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Please re-login before resetting your PIN.", "error");
    }
  }

  if (!open) return null;

  const overlay = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm",
        mounted ? "animate-fade-in" : "opacity-0"
      )}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      // Portal lives at document.body — no parent with transform/will-change can clip this
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "setup" ? "Create private PIN" : "Enter private PIN"}
        className={cn(
          "panel w-full max-w-xs p-6 sm:p-7",
          mounted && !shake ? "animate-scale-in" : "",
          shake && "animate-[shake_0.32s_ease-in-out]"
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Icon + heading */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-warm-copper/15 text-warm-copper">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-warm-cream">
            {mode === "setup" ? "Create private PIN" : "Enter private PIN"}
          </h2>
          <p className="mt-1 text-sm text-warm-greige">Use a 4-digit PIN. It is never stored in plaintext.</p>
        </div>

        {/* Masked PIN display: •••• */}
        <div className="mb-6 flex justify-center gap-3 sm:gap-4" aria-label={`PIN: ${pinLength} of 4 digits entered`} role="img">
          {[0, 1, 2, 3].map((index) => {
            const filled = pin.length > index;
            return (
              <span
                key={index}
                className={cn(
                  "flex h-12 w-9 items-center justify-center rounded-lg border text-lg font-medium transition-all duration-150 sm:h-14 sm:w-10",
                  filled
                    ? "border-warm-copper/60 bg-warm-copper/15 text-warm-copper"
                    : "border-warm-border bg-warm-bg/50 text-warm-greige/30"
                )}
              >
                {filled ? "•" : "–"}
              </span>
            );
          })}
        </div>

        {/* Numeric keypad — 3-column grid, responsive gap */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3" role="group" aria-label="Numeric keypad">
          {DIGITS.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => press(digit)}
              className="flex h-12 items-center justify-center rounded-xl bg-[#24251F] text-lg font-semibold text-warm-cream transition-all duration-100 active:scale-95 hover:bg-warm-border sm:h-14 sm:text-xl"
              tabIndex={-1}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin((current) => current.slice(0, -1))}
            className="flex h-12 items-center justify-center rounded-xl bg-[#24251F] text-warm-cream transition-all duration-100 active:scale-95 hover:bg-warm-border sm:h-14"
            aria-label="Delete last digit"
            tabIndex={-1}
          >
            <Delete className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => press("0")}
            className="flex h-12 items-center justify-center rounded-xl bg-[#24251F] text-lg font-semibold text-warm-cream transition-all duration-100 active:scale-95 hover:bg-warm-border sm:h-14 sm:text-xl"
            tabIndex={-1}
          >
            0
          </button>
          <Button
            ref={okRef}
            type="button"
            onClick={submit}
            loading={loading}
            disabled={pin.length !== 4}
            className="flex h-12 items-center justify-center sm:h-14"
            tabIndex={0}
          >
            OK
          </Button>
        </div>

        {/* Footer: cancel + forgot PIN */}
        <div className="mt-5 flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            onClick={() => {
              setPin("");
              onClose();
            }}
            className="rounded-lg px-2 py-1.5 text-warm-greige transition hover:text-warm-cream"
          >
            Cancel
          </button>
          {mode === "verify" ? (
            <button
              type="button"
              onClick={forgotPin}
              className="rounded-lg px-2 py-1.5 text-warm-copper transition hover:text-[#E7B877]"
            >
              Forgot PIN?
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
