/** Soft wavy edge, filled with currentColor. Sits on top of the section it leads into. */
export function Wave({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 72"
      preserveAspectRatio="none"
      className={className}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
      aria-hidden
    >
      <path
        d="M0 40C120 18 240 8 380 22s250 46 420 38 260-50 400-46 190 22 240 26V72H0z"
        fill="currentColor"
      />
    </svg>
  );
}
