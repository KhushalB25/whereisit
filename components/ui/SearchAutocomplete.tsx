"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Package, Search } from "lucide-react";
import { useItems } from "@/hooks/useItems";
import { useDisplayItems } from "@/hooks/useDisplayItems";
import { searchableText } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/types";

export function SearchAutocomplete() {
  const router = useRouter();
  const { items } = useItems();
  const displayItems = useDisplayItems(items);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? displayItems.filter((item) => searchableText(item).includes(normalized)).slice(0, 6)
    : [];

  function navigate(url: string) {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    router.push(url);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open || !results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => {
        const next = current < results.length - 1 ? current + 1 : 0;
        scrollToIndex(next);
        return next;
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => {
        const next = current > 0 ? current - 1 : results.length - 1;
        scrollToIndex(next);
        return next;
      });
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      navigate(`/items/${results[activeIndex].id}`);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  }

  function scrollToIndex(index: number) {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (normalized) {
      navigate(`/find?q=${encodeURIComponent(normalized)}`);
    }
  }

  function highlight(text: string): React.ReactNode {
    if (!normalized) return text;
    const index = text.toLowerCase().indexOf(normalized);
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <mark className="rounded-sm bg-warm-copper/30 text-warm-cream">{text.slice(index, index + normalized.length)}</mark>
        {text.slice(index + normalized.length)}
      </>
    );
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-warm-greige/75" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            handleQueryChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 200);
          }}
          onKeyDown={handleKeyDown}
          className="input-shell h-12 pl-12 text-base"
          placeholder="Find item or location..."
          aria-label="Search inventory"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="search-results-list"
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          autoComplete="off"
        />
      </form>
      {open && normalized && results.length > 0 ? (
        <div
          ref={listRef}
          id="search-results-list"
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-warm-border bg-warm-card shadow-glow backdrop-blur"
        >
          {results.map((item: InventoryItem, index: number) => (
            <button
              key={item.id}
              id={`search-result-${index}`}
              data-index={index}
              role="option"
              aria-selected={index === activeIndex}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                navigate(`/items/${item.id}`);
              }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition",
                index === activeIndex ? "bg-warm-copper/15 text-warm-cream" : "text-warm-cream/85 hover:bg-[#24251F]"
              )}
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-warm-border bg-warm-bg">
                {item.photoURL ? (
                  <Image src={item.photoURL} alt="" fill sizes="32px" className="object-cover" />
                ) : (
                  <Package className="h-4 w-4 text-warm-greige/50" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{highlight(item.name || "Unnamed item")}</div>
                <div className="mt-0.5 truncate text-xs text-warm-greige">{highlight(item.location || "")}</div>
              </div>
              <span className="shrink-0 rounded-full bg-warm-bg px-2 py-0.5 text-[11px] text-warm-greige">
                Qty {item.quantity}
              </span>
            </button>
          ))}
          <Link
            href={`/find?q=${encodeURIComponent(normalized)}`}
            onMouseDown={(event) => {
              event.preventDefault();
              navigate(`/find?q=${encodeURIComponent(normalized)}`);
            }}
            className="flex items-center justify-center border-t border-warm-border px-4 py-2.5 text-xs font-medium text-warm-copper transition hover:bg-[#24251F]"
          >
            View all {results.length} results
          </Link>
        </div>
      ) : null}
    </div>
  );
}
