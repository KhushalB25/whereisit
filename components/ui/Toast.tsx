"use client";

import { X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
type ToastMessage = { id: number; message: string; tone: ToastTone };
type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const [exitingIds, setExitingIds] = useState<number[]>([]);
  const timersRef = useRef<Map<number, number>>(new Map());

  function dismiss(id: number) {
    setExitingIds((current) => [...current, id]);
    window.setTimeout(() => {
      setMessages((current) => current.filter((item) => item.id !== id));
      setExitingIds((current) => current.filter((eid) => eid !== id));
    }, 250);
  }

  const toast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now();
    setMessages((current) => [...current, { id, message, tone }]);
    const timer = window.setTimeout(() => dismiss(id), 4200);
    timersRef.current.set(id, timer);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {messages.map((item) => {
          const exiting = exitingIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur will-change-transform will-change-opacity",
                exiting ? "animate-slide-out-right" : "animate-slide-in-right",
                item.tone === "success" && "border-warm-sage/30 bg-warm-sage/15 text-warm-sage",
                item.tone === "error" && "border-warm-rust/30 bg-warm-rust/15 text-warm-rust",
                item.tone === "info" && "border-warm-border bg-warm-card/95 text-warm-cream"
              )}
            >
              <span className="flex-1">{item.message}</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-1 text-current opacity-70 transition-opacity hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
