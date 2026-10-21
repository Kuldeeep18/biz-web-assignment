"use client";

import { useState } from "react";
import { FlightPath } from "@/components/home/TwoWays";
import { Heart, Paw, Search, Van } from "@/components/illustrations/Icons";
import { Pup } from "@/components/illustrations/Pup";
import { IMPORTED, IN_DUBAI } from "@/lib/content";

const ICONS = [Search, Heart, Paw, Van];
const ICON_BG = ["bg-honey-soft", "bg-blush", "bg-sky", "bg-[color-mix(in_oklab,var(--color-leaf)_22%,white)]"];

/** "In Dubai" / "Imported" switch: swaps the story, the picture and the four steps. */
export function TwoWaysHome() {
  const [way, setWay] = useState<"dubai" | "imported">("dubai");
  const content = way === "dubai" ? IN_DUBAI : IMPORTED;

  return (
    <section id="two-ways" className="scroll-mt-28 pt-20" aria-labelledby="two-ways-title">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-scrawl text-toffee-deep">choose your way</p>
          <h2 id="two-ways-title" className="font-plush text-[clamp(2.2rem,3.6vw,3rem)]">
            Two ways home
          </h2>
        </div>
        <div className="flex items-end gap-4">
          <div role="tablist" aria-label="Choose your way" className="flex rounded-full border-[3px] border-cocoa bg-milk p-1 shadow-[4px_4px_0_var(--color-cocoa)]">
            {(
              [
                ["dubai", "In Dubai", "meet in person"],
                ["imported", "Imported", "order upon request"],
              ] as const
            ).map(([key, label, sub]) => (
              <button
                key={key}
                type="button"
                role="tab"
                id={`tab-${key}`}
                aria-selected={way === key}
                aria-controls="way-panel"
                onClick={() => setWay(key)}
                className={`rounded-full px-6 py-2 text-center transition-colors ${way === key ? "bg-toffee-deep text-milk" : "hover:bg-honey-soft"}`}
              >
                <span className="font-plush block text-lg leading-tight">{label}</span>
                <span className="block text-[0.7rem]">{sub}</span>
              </button>
            ))}
          </div>
          <Pup pose="sit" className="hidden w-16 sm:block" />
        </div>
      </div>

      <div id="way-panel" role="tabpanel" aria-labelledby={`tab-${way}`} className="mt-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h3 className="font-plush text-[clamp(1.8rem,2.6vw,2.4rem)]">{content.title}</h3>
            {content.intro.map((t) => (
              <p key={t} className="mt-4 max-w-[34em] text-cocoa-soft">
                {t}
              </p>
            ))}
          </div>
          <div className="relative h-56 overflow-hidden rounded-3xl border-[3px] border-cocoa bg-[linear-gradient(var(--color-milk),var(--color-honey-soft))] shadow-[8px_8px_0_rgb(42_23_14/0.18)] lg:rotate-1">
            {way === "dubai" ? (
              <>
                <span className="font-scrawl absolute top-4 left-5 text-sm text-toffee-deep">Downtown Dubai</span>
                <span className="absolute top-8 right-14 size-16 rounded-full bg-honey" aria-hidden />
                <svg className="skyline-line absolute inset-x-6 bottom-3 h-36 w-[calc(100%-3rem)]" viewBox="0 0 420 140" preserveAspectRatio="xMidYMax meet" aria-hidden>
                  <path d="M20 138V80h22v58M54 138V70h20v68M84 138V96h14v42M140 138V86l22 10v42M186 138V36l-5-6v-6h3V12l4-10 4 10v12h3v6l-5 6v102M210 138V84h18v54M260 138V96h22v42M300 138V76h20v62M336 138V104h26v34" />
                  <line x1="0" y1="138" x2="420" y2="138" />
                </svg>
              </>
            ) : (
              <>
                <span className="font-scrawl absolute top-4 left-5 text-sm text-toffee-deep">Europe · Korea</span>
                <span className="font-scrawl absolute top-4 right-5 text-sm text-toffee-deep">Dubai</span>
                <FlightPath id="how-route" className="flight absolute inset-x-4 top-6 h-48 w-[calc(100%-2rem)] overflow-visible" />
              </>
            )}
          </div>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.steps.map((s, i) => {
            const Icon = ICONS[i];
            return (
            <li key={s.title} className="rounded-2xl border-[3px] border-cocoa bg-milk p-5 shadow-[5px_5px_0_rgb(42_23_14/0.18)]">
              <span className={`grid size-12 place-items-center rounded-full text-toffee-deep ${ICON_BG[i]}`} aria-hidden>
                <Icon className="size-6" />
              </span>
              <span className="font-plush-text mt-4 block text-sm text-toffee-deep">Step {i + 1}</span>
              <h4 className="font-plush-text text-lg">{s.title}</h4>
              <p className="mt-2 text-sm text-cocoa-soft">{s.text}</p>
            </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
