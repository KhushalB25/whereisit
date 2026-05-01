import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://whereisit.com"),
  title: {
    default: "WhereIsIt",
    template: "%s | WhereIsIt"
  },
  description: "A private home inventory tracker for finding items, expiry dates, and stock levels fast.",
  applicationName: "WhereIsIt",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#111311",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div id="main-content">
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
