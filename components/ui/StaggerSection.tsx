"use client";

import { cn } from "@/lib/utils";

type StaggerSectionProps = {
  /** 0-based index used to compute animation delay (index * 40ms) */
  index: number;
  children: React.ReactNode;
  className?: string;
  /** Animation class, defaults to fade-in-up-sm for a subtler 8px slide */
  animation?: string;
};

/**
 * Wraps content with a staggered entrance animation.
 * The `index` prop controls the delay: `index * 40ms`.
 * Respects `prefers-reduced-motion` — the animation class is removed so content appears immediately.
 */
export function StaggerSection({ index, children, className, animation = "animate-fade-in-up-sm" }: StaggerSectionProps) {
  return (
    <div
      className={cn(animation, className)}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {children}
    </div>
  );
}
