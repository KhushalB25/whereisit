"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ITEM_CATEGORIES } from "@/lib/types";
import { ITEM_TEMPLATES, type ItemTemplate } from "@/lib/item-templates";
import { cn } from "@/lib/utils";

type TemplatePickerModalProps = {
  open: boolean;
  onSelect: (template: ItemTemplate) => void;
  onClose: () => void;
};

export function TemplatePickerModal({ open, onSelect, onClose }: TemplatePickerModalProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(ITEM_TEMPLATES.map((t) => t.category)))],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ITEM_TEMPLATES.filter((t) => {
      if (activeCategory !== "All" && t.category !== activeCategory) return false;
      if (q && !t.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, activeCategory]);

  if (!open) return null;

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="panel flex max-h-[80vh] w-full max-w-xl flex-col p-5 sm:p-6" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-warm-cream">Choose a template</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-warm-greige transition hover:bg-[#24251F] hover:text-warm-cream">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-greige/75" />
          <input
            className="input-shell h-10 pl-10 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates..."
            autoFocus
          />
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                activeCategory === cat
                  ? "border-warm-copper/60 bg-warm-copper/15 text-warm-copper"
                  : "border-warm-border text-warm-greige hover:border-warm-copper/40 hover:text-warm-cream"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="scrollbar-thin -mx-2 grid flex-1 gap-2 overflow-y-auto px-2">
          {filtered.length ? (
            filtered.map((template) => (
              <button
                key={template.name}
                type="button"
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
                className="group flex items-center gap-3 rounded-xl border border-warm-border bg-warm-bg/60 p-3 text-left transition hover:border-warm-copper/50 hover:bg-[#24251F]/80"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-warm-cream group-hover:text-warm-copper transition-colors">
                    {template.name}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-warm-greige">
                    <span>{template.category}</span>
                    <span>{template.roomCategory}</span>
                    {template.expiryDays ? <span>Expires ~{template.expiryDays}d</span> : null}
                    {template.dailyConsumptionRate > 0 ? (
                      <span>Rate {template.dailyConsumptionRate}/{template.consumptionIntervalDays}d</span>
                    ) : null}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-warm-greige">Qty {template.quantity}</span>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-warm-greige/75">No templates match your search.</div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
