"use client";

import type { ReactNode } from "react";

type InsightCardProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  empty?: string;
};

export function InsightCard({ title, icon, children, empty }: InsightCardProps) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-warm-greige/75">
        {icon}
        {title}
      </div>
      {children || (empty ? (
        <p className="text-sm text-warm-greige/60">{empty}</p>
      ) : null)}
    </section>
  );
}
