"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading || !user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-crimson-950 px-6 text-center">
        <div className="crimson-bg">
          <div className="crimson-grid" />
        </div>
        <div className="relative z-10">
          <Logo className="mx-auto mb-6 h-10 w-auto" />
          <div className="spinner-neural mx-auto" />
          <p className="mt-4 text-sm text-white/40">Securing your inventory</p>
        </div>
      </div>
    );
  }

  return children;
}
