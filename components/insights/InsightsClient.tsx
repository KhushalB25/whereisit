"use client";

import { AlertTriangle, BarChart3, CalendarClock, PackageOpen, Timer } from "lucide-react";
import Link from "next/link";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageTransition } from "@/components/ui/PageTransition";
import { InsightCard } from "@/components/insights/InsightCard";
import { useConsumptionInsights } from "@/hooks/useConsumptionInsights";
import { Button } from "@/components/ui/Button";

export function InsightsClient() {
  const { summary, daysUntilEmpty, expiryCountdowns, trackedCount, loading, error } = useConsumptionInsights();

  if (loading) return <LoadingState label="Calculating insights" variant="skeleton" />;
  if (error) return <div className="panel p-5 text-warm-rust">{error}</div>;

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-warm-copper">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-medium">Insights</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-warm-cream">Consumption overview</h1>
          <p className="mt-1 text-sm text-warm-greige">
            See how fast you go through items, when things expire, and what needs restocking.
          </p>
        </div>

        {trackedCount === 0 ? (
          <div className="panel flex flex-col items-center gap-3 p-8 text-center">
            <BarChart3 className="h-8 w-8 text-warm-greige/50" />
            <p className="text-sm font-medium text-warm-cream">No consumption data yet</p>
            <p className="text-xs text-warm-greige/75">
              Add expiry trackers with a daily consumption rate to see insights here.
            </p>
            <Link href="/items/new?type=expiry">
              <Button type="button" variant="secondary">
                <PackageOpen className="h-4 w-4" />
                Add an expiry tracker
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {summary.map((metric) => (
                <div key={metric.label} className="panel p-4 text-center">
                  <div className="text-2xl font-bold text-warm-cream">{metric.value}</div>
                  <div className="mt-1 text-sm font-medium text-warm-greige">{metric.label}</div>
                  {metric.subtext ? (
                    <div className="mt-0.5 text-xs text-warm-greige/60">{metric.subtext}</div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InsightCard title="Running out soon" icon={<Timer className="h-4 w-4" />} empty="No tracked items running low.">
                {daysUntilEmpty.length ? (
                  <div className="grid gap-2">
                    {daysUntilEmpty.map(({ item, days }) => (
                      <Link
                        key={item.id}
                        href={`/items/${item.id}`}
                        className="flex items-center justify-between rounded-lg border border-warm-border bg-warm-bg/60 p-3 transition hover:border-warm-copper/50"
                      >
                        <span className="truncate text-sm font-medium text-warm-cream">{item.name}</span>
                        <span className={`shrink-0 text-sm font-medium ${days <= 3 ? "text-warm-rust" : days <= 7 ? "text-warm-mustard" : "text-warm-sage"}`}>
                          {days <= 0 ? "Now" : `${days}d`}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </InsightCard>

              <InsightCard title="Expiring soon" icon={<CalendarClock className="h-4 w-4" />} empty="No items expiring soon.">
                {expiryCountdowns.length ? (
                  <div className="grid gap-2">
                    {expiryCountdowns.map(({ item, daysLeft }) => (
                      <Link
                        key={item.id}
                        href={`/items/${item.id}`}
                        className="flex items-center justify-between rounded-lg border border-warm-border bg-warm-bg/60 p-3 transition hover:border-warm-copper/50"
                      >
                        <span className="truncate text-sm font-medium text-warm-cream">{item.name}</span>
                        <span className={`shrink-0 text-sm font-medium ${daysLeft <= 3 ? "text-warm-rust" : daysLeft <= 7 ? "text-warm-mustard" : "text-warm-greige/75"}`}>
                          {daysLeft <= 0 ? "Expired" : `${daysLeft}d`}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </InsightCard>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
