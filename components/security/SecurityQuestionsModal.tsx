"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { SECURITY_QUESTIONS_PRESET } from "@/lib/types";
import { usePrivateVault } from "@/components/security/PrivateVaultProvider";

type SecurityQuestionsModalProps = {
  open: boolean;
  mode: "setup" | "verify";
  onClose: () => void;
  onSuccess?: () => void;
};

export function SecurityQuestionsModal({ open, mode, onClose, onSuccess }: SecurityQuestionsModalProps) {
  const { securityQuestions, setupSecurityQuestions, verifySecurityQuestionsThenReset } = usePrivateVault();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [question1, setQuestion1] = useState(0);
  const [question2, setQuestion2] = useState(1);
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const answer1Ref = useRef<HTMLInputElement>(null);
  const answer2Ref = useRef<HTMLInputElement>(null);

  // Pre-populate from existing questions in verify mode
  useEffect(() => {
    if (open && mode === "verify" && securityQuestions && securityQuestions.length === 2) {
      setQuestion1(securityQuestions[0].questionIndex);
      setQuestion2(securityQuestions[1].questionIndex);
    }
    if (open && mode === "setup") {
      // Find unused indices for default selection
      setQuestion1(0);
      setQuestion2(1);
    }
  }, [open, mode, securityQuestions]);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [open]);

  useEffect(() => {
    if (step === 1 && mounted) answer1Ref.current?.focus();
  }, [step, mounted]);

  useEffect(() => {
    if (step === 2 && mounted) answer2Ref.current?.focus();
  }, [step, mounted]);

  const reset = useCallback(() => {
    setStep(1);
    setAnswer1("");
    setAnswer2("");
    setShake(false);
  }, []);

  const q1Text = SECURITY_QUESTIONS_PRESET[question1];
  const q2Text = SECURITY_QUESTIONS_PRESET[question2];

  const presetOptions = useMemo(
    () => SECURITY_QUESTIONS_PRESET.map((q, i) => ({ value: i, label: q })),
    []
  );

  async function handleSubmit() {
    setLoading(true);
    try {
      if (mode === "setup") {
        await setupSecurityQuestions([
          { questionIndex: question1, answer: answer1 },
          { questionIndex: question2, answer: answer2 },
        ]);
        toast("Security questions configured.", "success");
      } else {
        await verifySecurityQuestionsThenReset([
          { questionIndex: question1, answer: answer1 },
          { questionIndex: question2, answer: answer2 },
        ]);
        toast("PIN reset. Create a new PIN to unlock private items.", "success");
      }
      setLoading(false);
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      setShake(true);
      setTimeout(() => setShake(false), 360);
      setLoading(false);
      setAnswer1("");
      setAnswer2("");
      setStep(1);
      toast(error instanceof Error ? error.message : "Verification failed.", "error");
    }
  }

  function nextStep() {
    if (step === 1) {
      if (!answer1.trim()) {
        toast("Please enter an answer.", "error");
        return;
      }
      setStep(2);
    }
  }

  function prevStep() {
    setStep(1);
  }

  if (!open) return null;

  const title = mode === "setup" ? "Security questions" : "Forgot your PIN?";
  const subtitle = mode === "setup"
    ? "Choose 2 questions and provide answers. You will need them if you ever forget your PIN."
    : "Answer your security questions to reset your PIN and regain vault access.";

  const overlay = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm",
        mounted ? "animate-fade-in" : "opacity-0"
      )}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "panel w-full max-w-md p-5 sm:p-6",
          mounted && !shake ? "animate-scale-in" : "",
          shake && "animate-[shake_0.32s_ease-in-out]"
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Icon + heading */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blood-muted text-blood">
            <ShieldQuestion className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-parchment">{title}</h2>
          <p className="mt-1 text-sm text-white/40">{subtitle}</p>
        </div>

        {/* Step indicator */}
        <div className="mb-5 flex items-center justify-center gap-2">
          <span className={cn("h-1.5 w-6 rounded-full transition-colors", step === 1 ? "bg-blood" : "bg-white/[0.12]")} />
          <span className={cn("h-1.5 w-6 rounded-full transition-colors", step === 2 ? "bg-blood" : "bg-white/[0.12]")} />
        </div>

        {/* Step 1 */}
        {step === 1 ? (
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="field-label">
                {mode === "setup" ? "Question 1" : q1Text}
              </span>
              {mode === "setup" ? (
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-white/[0.08] bg-crimson-950 px-4 py-3 pr-10 text-parchment outline-none transition focus:border-blood/50 focus:ring-2 focus:ring-blood/10"
                    value={question1}
                    onChange={(e) => setQuestion1(Number(e.target.value))}
                  >
                    {presetOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                </div>
              ) : null}
              <input
                ref={answer1Ref}
                className="input-shell"
                type="text"
                placeholder="Your answer"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") nextStep();
                }}
              />
            </label>
            <Button type="button" className="w-full" onClick={nextStep}>
              Next
            </Button>
          </div>
        ) : null}

        {/* Step 2 */}
        {step === 2 ? (
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="field-label">
                {mode === "setup" ? "Question 2" : q2Text}
              </span>
              {mode === "setup" ? (
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-white/[0.08] bg-crimson-950 px-4 py-3 pr-10 text-parchment outline-none transition focus:border-blood/50 focus:ring-2 focus:ring-blood/10"
                    value={question2}
                    onChange={(e) => setQuestion2(Number(e.target.value))}
                  >
                    {presetOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                </div>
              ) : null}
              <input
                ref={answer2Ref}
                className="input-shell"
                type="text"
                placeholder="Your answer"
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
            </label>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="button" className="flex-[2]" onClick={handleSubmit} loading={loading}>
                {mode === "setup" ? "Save" : "Verify & Reset PIN"}
              </Button>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-lg px-2 py-1.5 text-white/40 transition hover:text-parchment"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
