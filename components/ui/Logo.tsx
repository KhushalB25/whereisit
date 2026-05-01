export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="14" fill="#111311" />
      <path
        d="M32 15 C25 15 21 19.5 21 25 C21 30.5 27 37 32 44 C37 37 43 30.5 43 25 C43 19.5 39 15 32 15Z"
        fill="#E8B84B"
        stroke="none"
      />
      <polyline
        points="27 26 31 30 38 22"
        fill="none"
        stroke="#1A1C18"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
