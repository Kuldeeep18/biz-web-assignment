"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Family } from "@/lib/families";

const TAPES = ["var(--color-honey-soft)", "var(--color-blush)", "var(--color-sky)", "color-mix(in oklab, var(--color-honey) 60%, white)"];

/** Masonry of polaroids; any one opens full screen with arrow-key browsing. */
export function FamilyWall({ families }: { families: Family[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const count = families.length;

  useEffect(() => {
    const d = dialog.current!;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const go = (step: number) => setOpen((n) => (n === null ? n : (n + step + count) % count));
  const current = open === null ? null : families[open];

  return (
    <>
      <ul className="columns-2 gap-5 md:columns-3 lg:columns-4 lg:gap-9">
        {families.map((f, i) => (
          <li key={f.src} className="mb-9 break-inside-avoid lg:mb-12" data-reveal>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1} of ${count}${f.caption ? `: ${f.caption}` : ""}`}
              className="polaroid block w-full text-left"
              style={{ ["--r" as string]: `${[-2.4, 1.8, -1.2, 2.4, 0.8, -1.8][i % 6]}deg`, ["--tape" as string]: TAPES[i % TAPES.length] }}
            >
              <Image
                src={f.src}
                alt={f.alt}
                width={f.width ?? 800}
                height={f.height ?? 1000}
                sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
                className="h-auto w-full"
                style={{ backgroundColor: f.color }}
              />
              <span className={`font-scrawl block px-1 text-center text-sm ${f.caption ? "pt-2 pb-3" : "pb-4"}`}>{f.caption}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        aria-label="Happy family photo"
        className="m-auto max-h-[92vh] max-w-[min(92vw,56rem)] overflow-visible bg-transparent p-0 backdrop:bg-night/85"
      >
        {current && (
          <figure className="polaroid !rotate-0 relative">
            <Image
              src={current.src}
              alt={current.alt}
              width={current.width ?? 800}
              height={current.height ?? 1000}
              sizes="92vw"
              className="h-auto max-h-[78vh] w-auto"
              style={{ backgroundColor: current.color }}
            />
            <figcaption className="font-scrawl flex items-center justify-between gap-3 px-1 py-3 text-sm">
              <span>{current.caption ?? `${open! + 1} of ${count}`}</span>
              <span className="flex gap-2">
                <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="grid size-10 place-items-center rounded-full border-2 border-cocoa font-bold">
                  ‹
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next photo" className="grid size-10 place-items-center rounded-full border-2 border-cocoa font-bold">
                  ›
                </button>
                <button type="button" onClick={() => setOpen(null)} className="btn btn-sm">
                  Close
                </button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
