import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { Passport } from "@/components/ui/Passport";
import type { Family } from "@/lib/families";
import { TESTIMONIAL } from "@/lib/families";

/** Passport, a sunset over Dubai, and the wall of happy families. */
export function Dusk({ families }: { families: Family[] }) {
  return (
    <>
      <section className="passport-bg pt-12" aria-labelledby="trust-title">
        <div className="page-wrap max-w-[1240px]">
          <Passport
            id="trust-title"
            title="Why families trust TeddyPups"
            perks={[
              { stamp: "Vet-checked & healthy", text: "Every puppy comes vaccinated, dewormed, and with a verified health certificate." },
              { stamp: "Korea to Dubai, safely", text: "Trusted breeders, safe travel, and premium care from start to finish.", tone: "green", round: true },
              { stamp: "Support 24/7", text: "Always here to help, from choosing your puppy to post-delivery support." },
              { stamp: "Trusted by families worldwide", text: "Puppies delivered to loving homes all around the world.", tone: "green" },
            ]}
          />
        </div>
        <Skyline />
      </section>

      <section className="dusk pt-16 text-milk" id="families" aria-labelledby="families-title">
        <div className="page-wrap">
          <div className="grid items-end gap-12 md:grid-cols-[1.1fr_1fr]">
            <div data-reveal>
              <h2 id="families-title" className="font-plush max-w-[7em] text-[clamp(2.75rem,6.4vw,5.6rem)] text-honey-soft">
                Happy families &amp; puppies
              </h2>
              <p className="mt-5 max-w-[30em] text-milk/85">
                We are truly honored to see our puppies become cherished members of loving families. These heartwarming
                moments have been shared by our valued clients who welcomed a Teddy Pup into their homes and hearts.
              </p>
            </div>
            <figure className="quote-bubble mb-6 max-w-[500px] px-6 py-5 md:justify-self-end" data-reveal>
              <blockquote className="font-plush-text text-[1.0625rem] leading-relaxed font-medium">“{TESTIMONIAL.quote}”</blockquote>
              <figcaption className="font-scrawl mt-3 text-[0.9375rem] text-toffee-deep">{TESTIMONIAL.by}</figcaption>
            </figure>
          </div>

          <div className="brick-wall relative mt-12 px-5 pt-10 sm:px-9 sm:pt-12">
            <ul className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-9 lg:gap-y-12">
              {families.map((f, i) => (
                <li
                  key={f.src}
                  className={i >= 6 ? "max-lg:hidden" : i >= 4 ? "max-md:hidden" : ""}
                  data-reveal
                  style={{ ["--d" as string]: `${(i % 4) * 80}ms` }}
                >
                  <figure className="polaroid" style={{ ["--r" as string]: `${[-3, 2.5, -1.5, 3.5][i % 4]}deg` }}>
                    <div className="relative aspect-[1/1.08] overflow-hidden">
                      <Photo photo={f} sizes="(min-width: 1024px) 22vw, 45vw" />
                    </div>
                    <figcaption className="font-scrawl px-1 pt-2 pb-3 text-center text-sm">{f.caption}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            <div className="relative flex h-48 items-end justify-end pb-6 max-sm:h-40">
              <Lamp />
              <span
                className="absolute bottom-0 left-1/2 h-28 w-[76px] -translate-x-1/2 rounded-t-full border-[3px] border-b-0 border-cocoa shadow-[0_0_0_4px_var(--color-honey)] max-sm:left-[30%]"
                style={{ background: "linear-gradient(90deg, var(--color-toffee-deep) 49%, var(--color-cocoa) 49% 51%, var(--color-toffee-deep) 51%)" }}
                aria-hidden
              />
              <Link href="/happy-families" className="btn relative z-10">
                See every happy family
              </Link>
            </div>
          </div>
        </div>
        <div
          className="h-9 border-t-[3px] border-cocoa"
          style={{ background: "repeating-linear-gradient(90deg, var(--color-cocoa-soft) 0 95px, var(--color-cocoa) 95px 97px)" }}
          aria-hidden
        />
      </section>
    </>
  );
}

function Skyline() {
  return (
    <svg className="mt-12 block h-[clamp(90px,12vw,170px)] w-full" viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden>
      <circle cx="990" cy="110" r="96" fill="var(--color-honey-soft)" opacity=".25" />
      <circle cx="990" cy="112" r="66" fill="var(--color-honey-soft)" />
      <g fill="color-mix(in oklab, var(--color-toffee-deep) 70%, var(--color-toffee))">
        <path d="M0 170V120h40v-14h36v20h30V96h44v30h24v-10h40v-30h30v44h40V78h22l8-14 8 14h20v50h36V60h40v66h30V96h30v-6h20v50h40V60h42v40h24V20l10-20 10 20v88h30V76h50v30h40v20h40V60h50v50h40v-14h40v36h44V86h44v22h50v-24h46v44h40V96h40v30h44v-28h40v20h46v-34h40v40h44v-12h50H1440V170z" />
        <path d="M960 170V118h28v-22h34v26h22v48z" />
      </g>
    </svg>
  );
}

function Lamp() {
  return (
    <>
      <span
        className="pointer-events-none absolute bottom-[70px] left-[calc(7%-60px)] size-40 rounded-full"
        style={{ background: "radial-gradient(color-mix(in oklab, var(--color-honey-soft) 40%, transparent), transparent 70%)" }}
        aria-hidden
      />
      <svg className="absolute bottom-0 left-[7%] h-40 w-[34px]" viewBox="0 0 34 160" aria-hidden>
        <g fill="var(--color-cocoa)">
          <rect x="14" y="30" width="6" height="130" />
          <rect x="8" y="150" width="18" height="10" rx="2" />
          <path d="M5 8h24l-3 22H8z" />
          <rect x="12" y="2" width="10" height="6" rx="2" />
        </g>
        <path d="M9 11h16l-2 16H11z" fill="var(--color-honey-soft)" />
      </svg>
    </>
  );
}
