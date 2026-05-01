"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const PIN_TIMEOUT_MS = 15_000;

type PrivateVaultContextValue = {
  unlocked: boolean;
  pin: string | null;
  hasPin: boolean | null;
  verifyPin: (pin: string) => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<void>;
  resetPin: () => Promise<void>;
  lock: () => void;
  refreshPinState: () => Promise<void>;
};

const PrivateVaultContext = createContext<PrivateVaultContextValue | undefined>(undefined);

async function authedFetch(user: NonNullable<ReturnType<typeof useAuth>["user"]>, url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...init, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Request failed.");
  return data;
}

export function PrivateVaultProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [pinRecord, setPinRecord] = useState<{ userId: string; pin: string } | null>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const pin = user && pinRecord?.userId === user.uid ? pinRecord.pin : null;
  const autoLockRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoLock = useCallback(() => {
    if (autoLockRef.current !== null) {
      clearTimeout(autoLockRef.current);
      autoLockRef.current = null;
    }
  }, []);

  const scheduleAutoLock = useCallback(() => {
    clearAutoLock();
    autoLockRef.current = setTimeout(() => {
      setPinRecord(null);
      autoLockRef.current = null;
    }, PIN_TIMEOUT_MS);
  }, [clearAutoLock]);

  // Cleanup auto-lock timer on unmount
  useEffect(() => clearAutoLock, [clearAutoLock]);

  const lock = useCallback(() => {
    clearAutoLock();
    setPinRecord(null);
  }, [clearAutoLock]);

  const refreshPinState = useCallback(async () => {
    if (!user) {
      setHasPin(null);
      return;
    }
    const data = (await authedFetch(user, "/api/security/pin")) as { hasPin: boolean };
    setHasPin(data.hasPin);
  }, [user]);

  useEffect(() => {
    let active = true;
    if (!user) {
      return;
    }
    authedFetch(user, "/api/security/pin")
      .then((data) => {
        if (active) setHasPin(Boolean((data as { hasPin: boolean }).hasPin));
      })
      .catch(() => {
        if (active) setHasPin(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const value = useMemo<PrivateVaultContextValue>(
    () => ({
      unlocked: Boolean(pin),
      pin,
      hasPin,
      async verifyPin(nextPin) {
        if (!user) throw new Error("Please log in.");
        await authedFetch(user, "/api/security/pin", { method: "PUT", body: JSON.stringify({ pin: nextPin }) });
        setPinRecord({ userId: user.uid, pin: nextPin });
        setHasPin(true);
        scheduleAutoLock();
      },
      async setupPin(nextPin) {
        if (!user) throw new Error("Please log in.");
        await authedFetch(user, "/api/security/pin", { method: "POST", body: JSON.stringify({ pin: nextPin }) });
        setPinRecord({ userId: user.uid, pin: nextPin });
        setHasPin(true);
        scheduleAutoLock();
      },
      async changePin(oldPin, newPin) {
        if (!user) throw new Error("Please log in.");
        await authedFetch(user, "/api/security/pin", { method: "PUT", body: JSON.stringify({ oldPin, newPin }) });
        setPinRecord({ userId: user.uid, pin: newPin });
        setHasPin(true);
        scheduleAutoLock();
      },
      async resetPin() {
        if (!user) throw new Error("Please log in.");
        await authedFetch(user, "/api/security/pin", { method: "DELETE" });
        setPinRecord(null);
        setHasPin(false);
      },
      lock,
      refreshPinState
    }),
    [hasPin, lock, pin, refreshPinState, scheduleAutoLock, user]
  );

  return <PrivateVaultContext.Provider value={value}>{children}</PrivateVaultContext.Provider>;
}

export function usePrivateVault() {
  const context = useContext(PrivateVaultContext);
  if (!context) throw new Error("usePrivateVault must be used inside PrivateVaultProvider");
  return context;
}
