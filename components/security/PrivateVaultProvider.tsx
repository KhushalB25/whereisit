"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const PIN_TIMEOUT_MS = 15_000;

type SecurityQuestion = { questionIndex: number };

type PrivateVaultContextValue = {
  unlocked: boolean;
  pin: string | null;
  hasPin: boolean | null;
  hasSecurityQuestions: boolean;
  securityQuestions: SecurityQuestion[] | null;
  verifyPin: (pin: string) => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<void>;
  resetPin: () => Promise<void>;
  lock: () => void;
  refreshPinState: () => Promise<void>;
  refreshSecurityQuestionsState: () => Promise<void>;
  setupSecurityQuestions: (questions: { questionIndex: number; answer: string }[]) => Promise<void>;
  verifySecurityQuestionsThenReset: (answers: { questionIndex: number; answer: string }[]) => Promise<void>;
};

const PrivateVaultContext = createContext<PrivateVaultContextValue | undefined>(undefined);

async function authedFetch(user: NonNullable<ReturnType<typeof useAuth>["user"]>, url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const response = await fetch(url, { ...init, signal: controller.signal, headers });
  clearTimeout(timeout);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Request failed.");
  return data;
}

export function PrivateVaultProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [pinRecord, setPinRecord] = useState<{ userId: string; pin: string } | null>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [securityQuestions, setSecurityQuestions] = useState<{ questionIndex: number }[] | null>(null);
  const hasSecurityQuestions = Array.isArray(securityQuestions) && securityQuestions.length === 2;
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

  const refreshSecurityQuestionsState = useCallback(async () => {
    if (!user) {
      setSecurityQuestions(null);
      return;
    }
    try {
      const data = (await authedFetch(user, "/api/security/questions")) as {
        hasQuestions: boolean;
        questions: { questionIndex: number }[];
      };
      setSecurityQuestions(data.hasQuestions ? data.questions : []);
    } catch {
      setSecurityQuestions([]);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    if (!user) {
      return;
    }
    Promise.all([
      authedFetch(user, "/api/security/pin") as Promise<{ hasPin: boolean }>,
      authedFetch(user, "/api/security/questions") as Promise<{ hasQuestions: boolean; questions: { questionIndex: number }[] }>,
    ])
      .then(([pinData, qData]) => {
        if (!active) return;
        setHasPin(pinData.hasPin);
        setSecurityQuestions(qData.hasQuestions ? qData.questions : []);
      })
      .catch(() => {
        if (active) {
          setHasPin(false);
          setSecurityQuestions([]);
        }
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
      hasSecurityQuestions,
      securityQuestions,
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
      refreshPinState,
      refreshSecurityQuestionsState,
      async setupSecurityQuestions(questions) {
        if (!user) throw new Error("Please log in.");
        await authedFetch(user, "/api/security/questions", {
          method: "POST",
          body: JSON.stringify({ questions }),
        });
        setSecurityQuestions(questions.map((q) => ({ questionIndex: q.questionIndex })));
      },
      async verifySecurityQuestionsThenReset(answers) {
        if (!user) throw new Error("Please log in.");
        await authedFetch(user, "/api/security/questions/verify", {
          method: "POST",
          body: JSON.stringify({ answers }),
        });
        setPinRecord(null);
        setHasPin(false);
      },
    }),
    [hasPin, hasSecurityQuestions, lock, pin, refreshPinState, refreshSecurityQuestionsState, scheduleAutoLock, securityQuestions, user]
  );

  return <PrivateVaultContext.Provider value={value}>{children}</PrivateVaultContext.Provider>;
}

export function usePrivateVault() {
  const context = useContext(PrivateVaultContext);
  if (!context) throw new Error("usePrivateVault must be used inside PrivateVaultProvider");
  return context;
}
