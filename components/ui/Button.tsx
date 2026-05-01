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
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100 focus-visible:ring-2 focus-visible:ring-warm-copper/50 focus-visible:ring-offset-2 focus-visible:ring-offset-warm-bg",
        variant === "primary" && "bg-warm-copper text-warm-bg hover:bg-[#E7B877] hover:scale-[1.02] active:scale-[0.97]",
        variant === "secondary" && "border border-warm-border bg-[#24251F] text-warm-cream hover:bg-warm-border active:scale-[0.97]",
        variant === "ghost" && "text-warm-cream/85 hover:bg-[#24251F] hover:text-warm-cream active:scale-[0.97]",
        variant === "danger" && "bg-warm-rust text-warm-cream hover:bg-[#DD7474] active:scale-[0.97]",
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
});
