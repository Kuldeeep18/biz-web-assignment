// Small inline icons. Decorative unless given a title by the caller.

type P = { className?: string };

export function Paw({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden>
      <path d="M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5z" />
      <ellipse cx="14.6" cy="29.2" rx="5" ry="6.4" transform="rotate(-28 14.6 29.2)" />
      <ellipse cx="24.2" cy="16.6" rx="5.2" ry="7" transform="rotate(-10 24.2 16.6)" />
      <ellipse cx="39.8" cy="16.6" rx="5.2" ry="7" transform="rotate(10 39.8 16.6)" />
      <ellipse cx="49.4" cy="29.2" rx="5" ry="6.4" transform="rotate(28 49.4 29.2)" />
    </svg>
  );
}

export function Heart({ className }: P) {
  return (
    <svg viewBox="0 0 32 30" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
      <path d="M16 27S3 19.4 3 10.6C3 6.3 6.3 3 10.3 3c2.5 0 4.6 1.3 5.7 3.3C17.1 4.3 19.2 3 21.7 3 25.7 3 29 6.3 29 10.6 29 19.4 16 27 16 27z" strokeLinejoin="round" />
    </svg>
  );
}

export function Check({ className }: P) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
      <path d="M4 10.5l3.8 3.8L16 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Sparkle({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 1c.6 5.6 4.4 9.4 11 11-6.6 1.6-10.4 5.4-11 11-.6-5.6-4.4-9.4-11-11C7.6 10.4 11.4 6.6 12 1z" />
    </svg>
  );
}

export function Squiggle({ className }: P) {
  return (
    <svg viewBox="0 0 160 10" preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M2 6c10-5 18 4 28 0s18-5 28 0 18 4 28 0 18-5 28 0 18 4 28 0 14-3 16-1" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function Play({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M7 4.5v15L19.5 12z" />
    </svg>
  );
}

export function Send({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" />
    </svg>
  );
}

export function Search({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" strokeLinecap="round" />
    </svg>
  );
}

export function Plane({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M2 13.5l4 .8 3.2 3.7 1.6-.6-1.4-3 5.4 1 4.8 3.4 1.6-.8-3.6-4.2 3.4-1.2c1-.4 1.3-1.6.4-2.2-.6-.4-1.4-.5-2.1-.3l-3.7 1-5.8-5.6-2 .6 3 6.1-4.7 1.2-2.6-2-1.2.4z" />
    </svg>
  );
}

export function Chat({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Van({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 7h11v9h-11zM13.5 10h4l3 3v3h-7z" />
      <circle cx="6.5" cy="17" r="1.8" fill="var(--color-milk)" />
      <circle cx="16.5" cy="17" r="1.8" fill="var(--color-milk)" />
    </svg>
  );
}

export function HeartPulse({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d="M12 20s-8-4.8-8-10.4C4 7 6 5 8.5 5c1.5 0 2.8.8 3.5 2 .7-1.2 2-2 3.5-2C18 5 20 7 20 9.6 20 15.2 12 20 12 20z" />
      <path d="M6.5 12h3l1.5-2.5 2 4.5 1.5-2h3" />
    </svg>
  );
}
