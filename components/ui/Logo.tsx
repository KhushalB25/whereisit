export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="everyai"
      className={className}
      aria-hidden="true"
    />
  );
}
