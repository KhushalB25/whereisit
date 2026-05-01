"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BarChart3, CalendarClock, Heart, Home, Lock, LogOut, Map, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { usePrivateVault } from "@/components/security/PrivateVaultProvider";
import { AddItemSheet } from "@/components/items/AddItemSheet";
import { Logo } from "@/components/ui/Logo";
import { SearchAutocomplete } from "@/components/ui/SearchAutocomplete";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/find", label: "Find", icon: Search },
  { href: "/expiry", label: "Expiry", icon: CalendarClock }
];

const drawerNav = [
  { href: "/vault", label: "Vault", icon: Lock },
  { href: "/map", label: "Map", icon: Map },
  { href: "/shopping", label: "Shopping", icon: ShoppingCart },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  // { href: "/shared", label: "Shared", icon: Share2 },
  { href: "/profile", label: "Profile", icon: UserRound }
];

type DrawerState = "closed" | "open" | "leaving";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logOut } = useAuth();
  const { lock } = usePrivateVault();
  const [drawerState, setDrawerState] = useState<DrawerState>("closed");
  const drawerVisible = drawerState !== "closed";
  const drawerLeaving = drawerState === "leaving";

  function openDrawer() { setDrawerState("open"); }
  function closeDrawer() {
    setDrawerState("leaving");
    setTimeout(() => setDrawerState("closed"), 250);
  }

  const initials = useMemo(() => {
    const name = user?.displayName?.trim();
    if (name) {
      const parts = name.split(/\s+/);
      return parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
    }
    return (user?.email?.[0] || "U").toUpperCase();
  }, [user]);

  async function handleLogout() {
    lock();
    await logOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <header className="sticky top-0 z-30 border-b border-warm-border/80 bg-warm-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
          <div className="relative flex min-h-16 items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2">
              <button type="button" onClick={openDrawer} className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-warm-cream/85 hover:bg-[#24251F] hover:text-warm-cream">
                <Menu className="h-5 w-5" />
              </button>
              <nav className="hidden items-center gap-1 md:flex">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-warm-greige transition hover:bg-[#24251F] hover:text-warm-cream",
                      pathname.startsWith(item.href) && "bg-[#24251F] text-warm-cream"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <Link href="/dashboard" className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2">
              <Logo className="block h-32 w-auto pt-4 sm:h-24 sm:pt-0" />
            </Link>

            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
              <AddItemSheet buttonClassName="hidden sm:inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-warm-copper px-4 py-2 text-sm font-semibold text-warm-bg hover:bg-[#E7B877]" />
              <Link href="/profile" className="flex h-10 w-10 items-center justify-center rounded-full border border-warm-border bg-warm-card text-sm font-semibold hover:border-warm-copper/60">
                {initials}
              </Link>
              <Button type="button" variant="ghost" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <SearchAutocomplete />
        </div>
      </header>

      {drawerVisible ? (
        <div
          className={cn("fixed inset-0 z-50 bg-black/70 backdrop-blur", drawerLeaving ? "animate-fade-in" : "animate-fade-in")}
          style={drawerLeaving ? { animationDirection: "reverse", animationFillMode: "forwards" } : undefined}
          onClick={closeDrawer}
        >
          <aside
            className={cn(
              "h-full w-72 border-r border-warm-border bg-warm-bg p-4 shadow-2xl will-change-transform scrollbar-thin",
              drawerLeaving ? "animate-slide-out-left" : "animate-slide-in-left"
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="font-semibold text-warm-cream">Menu</div>
              <button type="button" onClick={closeDrawer} className="rounded-lg p-2 text-warm-greige hover:bg-[#24251F] hover:text-warm-cream">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="grid gap-2">
              {drawerNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeDrawer}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-warm-cream/85 hover:bg-[#24251F] hover:text-warm-cream",
                    pathname.startsWith(item.href) && "bg-[#24251F] text-warm-cream"
                  )}
                >
                  <item.icon className="h-4 w-4 text-warm-copper" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-warm-border bg-warm-bg/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-warm-greige/75",
                pathname.startsWith(item.href) && "bg-[#24251F] text-warm-cream"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          <AddItemSheet compact buttonClassName="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl bg-warm-copper text-[11px] font-medium text-warm-bg shadow-lg shadow-black/40" />
        </div>
      </nav>
    </div>
  );
}
