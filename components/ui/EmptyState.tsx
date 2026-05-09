import Link from "next/link";
import { CalendarClock, MapPinned, PackageOpen } from "lucide-react";

export function EmptyState() {
  return (
    <div className="animate-fade-in-up panel overflow-hidden p-8 text-center">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blood/10 text-blood shadow-red-sm">
        <PackageOpen className="h-10 w-10" />
      </div>
      <h2 className="text-xl font-semibold text-parchment">Add your first item</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
        Save the exact shelf, drawer, or box now, then find it in seconds later.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/items/new?type=location" className="rounded-xl border border-white/[0.06] bg-crimson-950/70 p-4 text-left transition-all duration-250 hover:scale-[1.01] hover:border-blood/50 hover:bg-crimson-900 hover:shadow-glow">
          <div className="flex items-center gap-2 font-semibold text-parchment">
            <MapPinned className="h-5 w-5 text-blood" />
            Location Tracker
          </div>
          <p className="mt-2 text-sm text-white/40">Save where something lives.</p>
        </Link>
        <Link href="/items/new?type=expiry" className="rounded-xl border border-white/[0.06] bg-crimson-950/70 p-4 text-left transition-all duration-250 hover:scale-[1.01] hover:border-gold/50 hover:bg-crimson-900 hover:shadow-glow">
          <div className="flex items-center gap-2 font-semibold text-parchment">
            <CalendarClock className="h-5 w-5 text-gold-light" />
            Expiry Tracker
          </div>
          <p className="mt-2 text-sm text-white/40">Track stock, expiry, and use.</p>
        </Link>
      </div>
    </div>
  );
}
