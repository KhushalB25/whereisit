import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://everyai.in"),
  title: {
    default: "everyai — WhereIsIt",
    template: "%s | everyai — WhereIsIt"
  },
  description: "everyai — A private home inventory tracker for finding items, expiry dates, and stock levels fast.",
  applicationName: "everyai — WhereIsIt",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#0A0806",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-crimson-950 text-parchment antialiased">
        <div className="crimson-bg">
          <div className="crimson-grid" />
          <div className="crimson-particles">
            <div className="crimson-particle type-red" />
            <div className="crimson-particle type-gold" />
            <div className="crimson-particle type-red" />
            <div className="crimson-particle type-gold" />
            <div className="crimson-particle type-red" />
            <div className="crimson-particle type-gold" />
            <div className="crimson-particle type-red" />
            <div className="crimson-particle type-gold" />
            <div className="crimson-particle type-red" />
            <div className="crimson-particle type-gold" />
            <div className="crimson-particle type-red" />
            <div className="crimson-particle type-gold" />
            <div className="crimson-particle type-red" />
            <div className="crimson-particle type-gold" />
            <div className="crimson-particle type-red" />
          </div>
        </div>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div id="main-content" className="relative z-10">
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
