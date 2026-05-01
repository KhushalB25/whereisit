import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PrivateVaultProvider } from "@/components/security/PrivateVaultProvider";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <PrivateVaultProvider>
        <AppShell>{children}</AppShell>
      </PrivateVaultProvider>
    </ProtectedRoute>
  );
}
