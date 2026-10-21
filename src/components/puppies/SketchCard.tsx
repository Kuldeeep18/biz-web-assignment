import Link from "next/link";
import { Heart, Paw, Play, Sparkle } from "@/components/illustrations/Icons";
import { Photo } from "@/components/ui/Photo";
import { cardLine, coverOf, hasVideo, type Puppy } from "@/lib/puppies";

// Little hand-drawn extras scattered around each card, varied by position
const DOODLES = [
  [Paw, "left-[6%] top-[4%] w-5 text-toffee", ""],
  [Heart, "right-[2%] top-[58%] w-7 text-cocoa", "rotate-12"],
  [Sparkle, "right-[10%] top-[2%] w-5 text-toffee", ""],
  [Heart, "left-[0%] top-[46%] w-6 text-cocoa", "-rotate-12"],
  [Sparkle, "left-[2%] top-[62%] w-6 text-cocoa", ""],
  [Paw, "right-[0%] top-[40%] w-4 text-toffee", "rotate-12"],
] as const;

/** A puppy drawn into a sketchbook: round photo, colour wash, wobbly ink ring. */
export function SketchCard({ p, index }: { p: Puppy; index: number }) {
  const [Doodle, pos, rot] = DOODLES[index % DOODLES.length];
  const tilt = ((index * 37) % 9) / 10 - 0.4;
  return (
    <Link
      href={`/puppies/${p.slug}`}
      className="sketch group block text-center"
      aria-label={`${p.name}, ${p.breed}, ${p.sex.toLowerCase()}, ${p.age}, ${p.status === "available" ? "available" : "gone home"}`}
      style={{ ["--wash" as string]: p.wash ?? "var(--color-honey-soft)", rotate: `${tilt}deg` }}
      data-reveal
    >
      <span className="sketch__frame relative mx-auto block aspect-square w-[88%]">
        <span className="sketch__wash" aria-hidden />
        <span className="sketch__photo">
          <Photo photo={coverOf(p)} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw" alt="" />
        </span>
        <svg className="sketch__ring" viewBox="0 0 100 100" aria-hidden>
          <path d="M50 3.5C76 2.5 97 22 96.5 50S75 97.5 49 96.5 3 76 3.5 49 25 4.5 52 4" />
          <path d="M18 14C10 22 5 33 5.5 45" />
        </svg>
        <Doodle className={`absolute ${pos} ${rot}`} />
        {p.status === "available" ? (
          <span className="tag absolute top-[6%] right-[-2%]">Available</span>
        ) : (
          <span className="tag absolute top-[6%] right-[-2%] !text-toffee-deep">gone home ♥</span>
        )}
        {hasVideo(p) && (
          <span className="absolute bottom-[14%] left-[8%] inline-flex items-center gap-1 rounded-full bg-cocoa/85 px-2 py-0.5 text-[0.7rem] font-semibold text-milk">
            <Play className="size-2.5" /> video
          </span>
        )}
      </span>
      <span className="font-plush mt-3 block text-[clamp(1.3rem,1.8vw,1.75rem)] transition-colors group-hover:text-toffee-deep">
        {p.name}
      </span>
      <span className="mt-1 block text-[0.8125rem] text-cocoa-soft">{cardLine(p)}</span>
    </Link>
  );
}
