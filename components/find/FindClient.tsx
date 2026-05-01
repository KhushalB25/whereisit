"use client";

import { useSearchParams } from "next/navigation";
import { Lock, Search } from "lucide-react";
import { useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageTransition } from "@/components/ui/PageTransition";
import { SearchResults } from "@/components/items/SearchResults";
import { VaultStatToggle } from "@/components/security/VaultStatToggle";
import { useItems } from "@/hooks/useItems";
import { useDisplayItems } from "@/hooks/useDisplayItems";

export function FindClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { items, loading, error } = useItems();
  const displayItems = useDisplayItems(items);
  const allDisplayItems = useDisplayItems(items, { includeLockedPrivate: true });
  const [includeVault, setIncludeVault] = useState(false);
  const searchItems = includeVault ? allDisplayItems : displayItems;

  if (loading) return <LoadingState label="Preparing search" variant="skeleton" />;
  if (error) return <div className="panel p-5 text-warm-rust">{error}</div>;

  return (
    <PageTransition>
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-warm-copper">
          <Search className="h-5 w-5" />
          <span className="text-sm font-medium">Find It</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-warm-cream">Instant inventory search</h1>
        <p className="mt-1 text-sm text-warm-greige">Use the search bar above. Results match item names, locations, rooms, and categories.</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-warm-border bg-warm-bg/50 p-3">
        <div className="flex items-center gap-2 text-sm text-warm-greige">
          <Lock className="h-4 w-4 text-warm-copper" />
          <span>Vault items <span className="text-warm-greige/60">— encrypted entries requiring a PIN</span></span>
        </div>
        <VaultStatToggle showing={includeVault} onToggle={setIncludeVault} />
      </div>

      <SearchResults items={searchItems} query={query} />
    </div>
    </PageTransition>
  );
}
