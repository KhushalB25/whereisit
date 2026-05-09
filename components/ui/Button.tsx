"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", loading, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100 focus-visible:ring-2 focus-visible:ring-blood/50 focus-visible:ring-offset-2 focus-visible:ring-offset-crimson-950",
        variant === "primary" && "bg-gradient-blood text-white hover:shadow-red-glow hover:scale-[1.02] active:scale-[0.97]",
        variant === "secondary" && "border border-white/[0.08] bg-white/[0.03] text-parchment hover:bg-white/[0.06] active:scale-[0.97]",
        variant === "ghost" && "text-white/50 hover:bg-white/[0.04] hover:text-parchment active:scale-[0.97]",
        variant === "danger" && "bg-blood text-white hover:bg-blood-deep active:scale-[0.97]",
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
});
