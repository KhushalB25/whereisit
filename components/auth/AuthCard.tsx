"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, KeyRound, Mail, PackageSearch, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { isFirebaseConfigured, missingFirebaseEnv } from "@/lib/firebase";

type AuthCardProps = {
  mode: "login" | "signup";
};

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logIn, signUp } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFirebaseConfigured) {
      toast("Firebase is not configured. Add your Firebase values to .env.local and restart the dev server.", "error");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) await signUp(name, email, password);
      else await logIn(email, password);
      toast(isSignup ? "Welcome to WhereIsIt." : "Logged in.", "success");
      router.replace(searchParams.get("next") || "/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      toast(message.includes("api-key-not-valid") ? "Firebase API key is invalid. Check NEXT_PUBLIC_FIREBASE_API_KEY in .env.local." : message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="animate-scale-in mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-warm-copper/30 bg-warm-copper/12" style={{ animationDelay: "0ms" }}>
            <PackageSearch className="h-7 w-7 text-warm-copper" />
          </div>
          <h1 className="animate-fade-in-up text-3xl font-semibold tracking-tight text-warm-cream" style={{ animationDelay: "100ms" }}>WhereIsIt</h1>
          <p className="animate-fade-in-up mt-2 text-sm text-warm-greige" style={{ animationDelay: "150ms" }}>Private inventory search for the things you cannot afford to misplace.</p>
        </div>

        <form onSubmit={handleSubmit} className="animate-fade-in-up panel space-y-4 p-5 sm:p-6" style={{ animationDelay: "200ms" }}>
          <div>
            <h2 className="text-xl font-semibold text-warm-cream">{isSignup ? "Create your account" : "Log in"}</h2>
            <p className="mt-1 text-sm text-warm-greige">
              {isSignup ? "Start tracking exact locations and expiry dates." : "Open your inventory dashboard."}
            </p>
          </div>

          {!isFirebaseConfigured ? (
            <div className="rounded-xl border border-warm-mustard/30 bg-warm-mustard/10 p-4 text-sm leading-6 text-warm-mustard">
              Add Firebase credentials to <code className="rounded bg-warm-bg px-1.5 py-0.5">.env.local</code>, then restart the dev server.
              <div className="mt-2 text-xs text-warm-mustard/80">Missing: {missingFirebaseEnv.join(", ")}</div>
            </div>
          ) : null}

          {isSignup ? (
            <label className="block space-y-2">
              <span className="field-label">Name</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-greige/75" />
                <input className="input-shell pl-10" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
              </div>
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="field-label">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-greige/75" />
              <input className="input-shell pl-10" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="field-label">Password</span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-greige/75" />
              <input
                className="input-shell pl-10 pr-10"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-greige/75 hover:text-warm-cream"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <Button type="submit" className="w-full" loading={loading} disabled={!isFirebaseConfigured}>
            {isSignup ? "Sign up" : "Log in"}
          </Button>

          <p className="text-center text-sm text-warm-greige">
            {isSignup ? "Already have an account?" : "New to WhereIsIt?"}{" "}
            <Link className="font-medium text-warm-copper hover:text-[#E7B877]" href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Log in" : "Create account"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
