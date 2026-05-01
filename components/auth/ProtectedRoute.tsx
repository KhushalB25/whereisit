"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, PackageSearch } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

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
      <div className="flex min-h-screen items-center justify-center bg-warm-bg px-6 text-center">
        <div>
          <PackageSearch className="mx-auto mb-5 h-12 w-12 text-warm-copper" />
          <div className="flex items-center justify-center gap-2 text-warm-cream/85">
            <Loader2 className="h-4 w-4 animate-spin" />
            Securing your inventory
          </div>
        </div>
      </div>
    );
  }

  return children;
}
