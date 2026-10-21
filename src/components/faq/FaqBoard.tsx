"use client";

import { useId, useState } from "react";
import { Search } from "@/components/illustrations/Icons";
import { Pup } from "@/components/illustrations/Pup";
import type { QA } from "@/lib/faq";
import { whatsappUrl } from "@/lib/site";

const PINS = [
  "var(--color-toffee)",
  "color-mix(in oklab, var(--color-sky) 45%, var(--color-cocoa))",
  "var(--color-honey)",
  "color-mix(in oklab, var(--color-blush) 55%, var(--color-toffee-deep))",
];

/** Search box + corkboard of pinned notes; each note opens to show its answer. */
export function FaqBoard({ faq }: { faq: QA[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const id = useId();

  const q = query.trim().toLowerCase();
  const shown = faq.map((item, i) => ({ ...item, i })).filter((x) => !q || `${x.q} ${x.a}`.toLowerCase().includes(q));

  const toggle = (i: number) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="grid gap-12 lg:grid-cols-[18rem_1fr] lg:gap-16">
      <div className="grid content-start justify-items-start gap-4 text-milk">
        <label htmlFor={`${id}-q`} className="font-scrawl text-honey-soft">
          sniff out a question
        </label>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-cocoa" />
          <input
            id={`${id}-q`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="delivery, Korea, vaccinated…"
            className="field !rounded-full pl-11 text-cocoa"
          />
        </div>
        <p className="font-scrawl text-sm text-milk/80" aria-live="polite">
          {shown.length} {shown.length === 1 ? "note" : "notes"} on the board
        </p>
        <div className="relative mt-4 hidden lg:block" aria-hidden>
          <span className="font-plush absolute -top-6 left-16 grid size-9 place-items-center rounded-full border-2 border-cocoa bg-milk text-lg text-toffee-deep">
            ?
          </span>
          <Pup pose="sit" className="w-24" />
        </div>
        <a href={whatsappUrl("Hi TeddyPups! I have a question:")} className="btn btn-wa mt-2">
          Ask your own question
        </a>
      </div>

      <div className="corkboard p-5 sm:p-8">
        {shown.length === 0 && (
          <p className="note font-plush-text p-6 text-center" style={{ ["--tilt" as string]: "-1deg" }}>
            No notes about that yet — ask us on WhatsApp and we&apos;ll pin the answer.
          </p>
        )}
        <ul className="grid gap-7">
          {shown.map(({ q: question, a, i }, n) => {
            const isOpen = open.has(i);
            return (
              <li
                key={i}
                className={`note ${n % 2 ? "sm:ml-10" : "sm:mr-10"}`}
                data-open={isOpen}
                style={{ ["--tilt" as string]: `${[-1.6, 1.2, -0.8, 1.6, -1.2][n % 5]}deg`, ["--pin" as string]: PINS[n % PINS.length] }}
              >
                <span className="note__pin" aria-hidden />
                <h2>
                  <button
                    type="button"
                    id={`${id}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-a${i}`}
                    onClick={() => toggle(i)}
                    className="font-plush-text flex w-full items-center justify-between gap-4 px-5 pt-5 pb-4 text-left text-[clamp(1.05rem,1.6vw,1.3rem)]"
                  >
                    {question}
                    <svg className="note__chevron size-5 shrink-0 text-toffee-deep" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                      <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </h2>
                <div id={`${id}-a${i}`} role="region" aria-labelledby={`${id}-q${i}`} className="note__answer" inert={!isOpen}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-6 text-cocoa-soft">{a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
