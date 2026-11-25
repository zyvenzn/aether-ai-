interface AetherMarkProps {
  className?: string;
}

/** Aether's mark: a ring with a single orbiting point. */
export function AetherMark({ className }: AetherMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="7.2" r="2.6" fill="currentColor" />
    </svg>
  );
}
