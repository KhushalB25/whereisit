import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  variant?: "spinner" | "skeleton";
};

export function LoadingState({ label = "Loading", variant = "spinner" }: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className="panel overflow-hidden p-6">
        <div className="space-y-4">
          <div className="h-4 w-2/5 rounded-lg bg-[linear-gradient(90deg,#1E201C_25%,#2A2C24_50%,#1E201C_75%)] bg-[length:200%_100%] animate-shimmer" />
          <div className="h-4 w-3/5 rounded-lg bg-[linear-gradient(90deg,#1E201C_25%,#2A2C24_50%,#1E201C_75%)] bg-[length:200%_100%] animate-shimmer" />
          <div className="h-4 w-1/3 rounded-lg bg-[linear-gradient(90deg,#1E201C_25%,#2A2C24_50%,#1E201C_75%)] bg-[length:200%_100%] animate-shimmer" />
          <div className="h-20 w-full rounded-xl bg-[linear-gradient(90deg,#1E201C_25%,#2A2C24_50%,#1E201C_75%)] bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("panel flex min-h-48 items-center justify-center gap-2 text-warm-greige")}>
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
