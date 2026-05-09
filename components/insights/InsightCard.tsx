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
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/40">
        {icon}
        {title}
      </div>
      {children || (empty ? (
        <p className="text-sm text-white/40">{empty}</p>
      ) : null)}
    </section>
  );
}
