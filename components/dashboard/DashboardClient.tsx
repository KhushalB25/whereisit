"use client";

import Link from "next/link";
import { Children, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Clock3, Package, TrendingDown, Utensils } from "lucide-react";
import { differenceInCalendarDays, formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageTransition } from "@/components/ui/PageTransition";
import { StaggerSection } from "@/components/ui/StaggerSection";
import { ItemCard } from "@/components/items/ItemCard";
import { AddItemSheet } from "@/components/items/AddItemSheet";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { VaultStatToggle } from "@/components/security/VaultStatToggle";
import { useItems } from "@/hooks/useItems";
import { useDisplayItems } from "@/hooks/useDisplayItems";
import { consumeItem } from "@/lib/items";
import { getExpiryState, timestampToDate } from "@/lib/utils";
import type { InventoryItem } from "@/lib/types";

/** Number of sections in the dashboard — used for stagger indices */
const SECTIONS = {
  HEADER: 0,
  SUMMARY: 1,
  REMINDERS: 2,
  EXPIRY_TRACKERS: 3,
  LOCATION_TRACKERS: 4,
  EXPIRING_SOON: 5,
  FINISHED: 6,
  LOW_QTY_SIDEBAR: 7,
  RECENT_SIDEBAR: 8
} as const;

export function DashboardClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, loading, error, refresh } = useItems();
  const [statsIncludeVault, setStatsIncludeVault] = useState(false);
  const publicItems = useMemo(() => items.filter((item) => !item.isPrivate), [items]);
  const displayItems = useDisplayItems(publicItems);
  const allDisplayItems = useDisplayItems(items, { includeLockedPrivate: true });
  const statItems = statsIncludeVault ? allDisplayItems : displayItems;
  const active = displayItems.filter((item) => item.status !== "finished");
  const statActive = statItems.filter((item) => item.status !== "finished");
  const finished = displayItems.filter((item) => item.status === "finished");
  const expiryTrackers = active.filter((item) => item.expiryDate || item.dailyConsumptionRate > 0);
  const locationTrackers = active.filter((item) => !item.expiryDate && item.dailyConsumptionRate <= 0);
  const expiring = active.filter((item) => {
    const state = getExpiryState(item);
    return state.days !== null && state.days <= 7;
  });
  const statExpiring = statActive.filter((item) => {
    const state = getExpiryState(item);
    return state.days !== null && state.days <= 7;
  });
  const lowQuantity = [...active, ...finished.filter((item) => parseFloat(String(item.quantity)) > 0)].filter((item) => {
    // Location-only items aren't stock-managed — skip them
    if (item.dailyConsumptionRate <= 0) return false;
    const qty = parseFloat(String(item.quantity));
    // Dynamically compute: flag when less than 2 servings + 1 spare unit remain
    const threshold = item.dailyConsumptionRate * 2 + 1;
    return qty <= threshold;
  });
  const consumptionDue = expiryTrackers.filter((item) => {
    if (item.dailyConsumptionRate <= 0) return false;
    const last = timestampToDate(item.lastConsumedAt);
    if (!last) return true;
    const threshold = item.consumptionIntervalDays > 0 ? item.consumptionIntervalDays : 1;
    return differenceInCalendarDays(new Date(), last) >= Math.max(0.1, threshold);
  });
  const recent = [...displayItems]
    .filter((item) => item.lastInteractedAt || item.updatedAt)
    .sort((a, b) => (b.lastInteractedAt?.millis ?? b.updatedAt?.millis ?? 0) - (a.lastInteractedAt?.millis ?? a.updatedAt?.millis ?? 0))
    .slice(0, 5);

  // Refresh data when dashboard mounts so newly‑added items aren't served stale cache
  useEffect(() => {
    if (user) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recently-updated highlight: items interacted within the last 60s get a 3s pulse
  const [recentlyHighlighted, setRecentlyHighlighted] = useState<Set<string>>(new Set());
  useEffect(() => {
    const now = Date.now();
    const highlighted = new Set<string>();
    for (const item of items) {
      const ts = item.lastInteractedAt?.millis ?? item.updatedAt?.millis;
      if (ts && now - ts < 60_000) {
        highlighted.add(item.id);
      }
    }
    if (highlighted.size > 0) {
      setRecentlyHighlighted(highlighted);
      const timer = setTimeout(() => setRecentlyHighlighted(new Set()), 3000);
      return () => clearTimeout(timer);
    }
  }, [items]);

  if (loading) return <LoadingState label="Loading inventory" variant="skeleton" />;
  if (error) return <div className="panel p-5 text-warm-rust">{error}</div>;
  if (!items.length) return <EmptyState />;

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* ── Header ── */}
      <StaggerSection index={SECTIONS.HEADER}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-warm-cream">Dashboard</h1>
            <p className="mt-1 text-sm text-warm-greige">Everything important, sorted newest first.</p>
          </div>
          <AddItemSheet />
        </div>
      </StaggerSection>

      {/* ── Summary cards ── */}
      <StaggerSection index={SECTIONS.SUMMARY}>
        <section className="grid gap-4 md:grid-cols-3">
          <StaggerSection index={0}>
            <SummaryCard icon={<Package className="h-5 w-5" />} label="Total active items" value={statActive.length} includeVault={statsIncludeVault} onToggleVault={setStatsIncludeVault} />
          </StaggerSection>
          <StaggerSection index={1}>
            <SummaryCard icon={<AlertTriangle className="h-5 w-5" />} label="Expiring within 7 days" value={statExpiring.length} tone="orange" includeVault={statsIncludeVault} onToggleVault={setStatsIncludeVault} />
          </StaggerSection>
          <StaggerSection index={2}>
            <SummaryCard icon={<TrendingDown className="h-5 w-5" />} label="Low quantity" value={lowQuantity.length} tone="indigo" />
          </StaggerSection>
        </section>
      </StaggerSection>

      {/* ── Consumption reminders ── */}
      {consumptionDue.length ? (
        <StaggerSection index={SECTIONS.REMINDERS}>
          <section className="panel border-warm-mustard/30 bg-warm-mustard/10 p-5">
            <div className="mb-4 flex items-center gap-2 text-warm-mustard">
              <Utensils className="h-5 w-5" />
              <h2 className="font-semibold">Consumption reminders</h2>
            </div>
            <div className="grid gap-3">
              {consumptionDue.slice(0, 4).map((item) => (
                <div key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border border-warm-mustard/20 bg-warm-bg/60 p-4 transition-all duration-150 active:scale-[0.99] sm:flex-row sm:items-center">
                  <div>
                    <div className="font-semibold text-warm-cream">{item.name || "Private item"}</div>
                    <div className="mt-1 text-sm text-warm-mustard/80">
                      Due now. Rate: {item.dailyConsumptionRate} every {item.consumptionIntervalDays} day{item.consumptionIntervalDays > 1 ? "s" : ""}.
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!user) return;
                      await consumeItem(user, item);
                      await refresh();
                      toast("Marked consumed.", "success");
                    }}
                  >
                    Mark consumed
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </StaggerSection>
      ) : null}

      {/* ── Two-column layout ── */}
      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <StaggerSection index={SECTIONS.EXPIRY_TRACKERS}>
            <DashboardSection title="Expiry Trackers" icon={<CalendarClock className="h-5 w-5" />} empty="No expiry trackers yet.">
              <div className="grid gap-3">
                {expiryTrackers.map((item) => (
                  <ItemCard key={item.id} item={item} isRecentlyUpdated={recentlyHighlighted.has(item.id)} />
                ))}
              </div>
            </DashboardSection>
          </StaggerSection>

          <StaggerSection index={SECTIONS.LOCATION_TRACKERS}>
            <DashboardSection title="Location Trackers" icon={<Package className="h-5 w-5" />} empty="No location trackers yet.">
              <div className="grid gap-3">
                {locationTrackers.map((item) => (
                  <ItemCard key={item.id} item={item} isRecentlyUpdated={recentlyHighlighted.has(item.id)} />
                ))}
              </div>
            </DashboardSection>
          </StaggerSection>

          <StaggerSection index={SECTIONS.EXPIRING_SOON}>
            <DashboardSection title="Expiring soon" icon={<CalendarClock className="h-5 w-5" />} empty="No active expiry warnings.">
              {expiring.slice(0, 5).map((item) => (
                <MiniItem key={item.id} href={`/items/${item.id}`} title={item.name || "Private item"} detail={item.location || "Locked location"} isRecentlyUpdated={recentlyHighlighted.has(item.id)} />
              ))}
            </DashboardSection>
          </StaggerSection>

          {finished.length ? (
            <StaggerSection index={SECTIONS.FINISHED}>
              <DashboardSection title="Finished" icon={<TrendingDown className="h-5 w-5" />}>
                <div className="grid gap-3">
                  {finished.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </DashboardSection>
            </StaggerSection>
          ) : null}
        </div>

        <aside className="space-y-6">
          <StaggerSection index={SECTIONS.LOW_QTY_SIDEBAR}>
            <DashboardSection title="Low quantity" icon={<TrendingDown className="h-5 w-5" />} empty="No low stock items.">
              {lowQuantity.slice(0, 6).map((item) => (
                <MiniItem key={item.id} href={`/items/${item.id}`} title={item.name || "Private item"} detail={`Quantity ${item.quantity}`} />
              ))}
            </DashboardSection>
          </StaggerSection>

          <StaggerSection index={SECTIONS.RECENT_SIDEBAR}>
            <DashboardSection title="Recently interacted" icon={<Clock3 className="h-5 w-5" />} empty="No recent activity yet.">
              {recent.map((item) => (
                <MiniItem
                  key={item.id}
                  href={`/items/${item.id}`}
                  title={item.name || "Private item"}
                  detail={`You ${item.lastAction || "updated"} this ${formatDistanceToNow(timestampToDate(item.lastInteractedAt || item.updatedAt)!, { addSuffix: true })}`}
                  isRecentlyUpdated={recentlyHighlighted.has(item.id)}
                />
              ))}
            </DashboardSection>
          </StaggerSection>
        </aside>
      </section>
    </div>
    </PageTransition>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone = "neutral",
  includeVault,
  onToggleVault
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "neutral" | "orange" | "indigo";
  includeVault?: boolean;
  onToggleVault?: (show: boolean) => void;
}) {
  return (
    <div className="panel p-5 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(216,162,94,0.12),0_8px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between gap-3">
        <span className={tone === "orange" ? "text-warm-mustard" : tone === "indigo" ? "text-warm-copper" : "text-warm-greige"}>{icon}</span>
        <span className="text-3xl font-semibold text-warm-cream">{value}</span>
      </div>
      <div className="mt-3 text-sm text-warm-greige">{label}</div>
      {onToggleVault ? <VaultStatToggle showing={Boolean(includeVault)} onToggle={onToggleVault} /> : null}
    </div>
  );
}

function DashboardSection({ title, icon, children, empty }: { title: string; icon: React.ReactNode; children: React.ReactNode; empty?: string }) {
  const hasChildren = Children.count(children) > 0;
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 border-b border-warm-border/50 pb-2 text-warm-cream">
        <span className="text-warm-copper">{icon}</span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      {hasChildren ? children : empty ? <div className="panel p-5 text-sm text-warm-greige/75">{empty}</div> : null}
    </section>
  );
}

function MiniItem({ href, title, detail, isRecentlyUpdated }: { href: string; title: string; detail: string; isRecentlyUpdated?: boolean }) {
  return (
    <Link
      href={href}
      className={`panel mb-2 block p-4 transition-all duration-250 hover:scale-[1.01] hover:border-warm-copper/50 hover:shadow-glow active:scale-[0.99] ${isRecentlyUpdated ? "animate-highlight-pulse" : ""}`}
    >
      <div className="font-medium text-warm-cream">{title}</div>
      <div className="mt-1 text-sm text-warm-greige">{detail}</div>
    </Link>
  );
}
