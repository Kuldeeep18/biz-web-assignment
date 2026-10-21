"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PupStop } from "@/components/pup/PupStop";
import { Photo } from "@/components/ui/Photo";
import type { Photo as PhotoData } from "@/lib/puppies";

type Item = { slug: string; label: string; photo: PhotoData };

// Arch sizes, left to right; the mascot sits between the third and fourth
const SHAPES = [
  [136, 112],
  [166, 168],
  [146, 132],
  [146, 140],
  [170, 178],
  [134, 100],
] as const;

export function HeroArches({ pool }: { pool: Item[] }) {
  // Server render uses list order; a fresh shuffle happens after mount so each
  // visit shows a different line-up (random values can't be in the prerender).
  const [items, setItems] = useState(() => pool.slice(0, SHAPES.length));
  const [tagged, setTagged] = useState(-1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off reshuffle after hydration
    setItems(shuffled.slice(0, SHAPES.length));
  }, [pool]);

  // One breed label at a time, moving along the row
  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTagged((t) => (t + 1) % SHAPES.length), 2600);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <ul className="arches" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {items.map((item, i) => {
        const [w, h] = SHAPES[i];
        const arch = (
          <li
            key={item.slug + i}
            className={`arch ${i === 0 || i === 5 ? "max-sm:hidden" : ""} ${i === 1 || i === 4 ? "max-[480px]:hidden" : ""}`}
            data-tagged={!paused && tagged === i}
            style={{ ["--w" as string]: `${w}px`, ["--h" as string]: `${h}px`, ["--i" as string]: i }}
          >
            <Link href={`/puppies/${item.slug}`} className="arch__photo">
              <Photo photo={item.photo} sizes="180px" priority={i < 3} />
            </Link>
            <span className="arch__label">{item.label}</span>
          </li>
        );
        return i === 3 ? [<Mascot key="mascot" />, arch] : arch;
      })}
    </ul>
  );
}

function Mascot() {
  return (
    <li className="hero-mascot" aria-hidden>
      <PupStop pose="peek" facing="right" act="peekaboo" behind lane />
    </li>
  );
}
