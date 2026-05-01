import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
};

export function Field({ label, children, hint, className }: FieldProps) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-warm-greige/75">{hint}</span> : null}
    </label>
  );
}
