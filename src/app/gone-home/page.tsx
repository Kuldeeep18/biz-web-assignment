import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "@/components/illustrations/Icons";
import { Pup } from "@/components/illustrations/Pup";
import { Photo } from "@/components/ui/Photo";
import { coverOf, goneHome } from "@/lib/puppies";

export const metadata: Metadata = {
  title: "Gone home",
  description: "Puppies who have already joined loving families through TeddyPups U.A.E. Looking for one just like them? We'll help you find your match.",
};

export default function GoneHomePage() {
  return (
    <section className="pb-28">
      <div className="page-wrap pt-10 md:pt-14">
        <div className="flex items-end justify-between gap-8">
          <div>
            <h1 className="font-plush flex items-start gap-3 text-[clamp(3rem,7.6vw,6.8rem)]">
              Gone home
              <Heart className="mt-[0.15em] w-[0.38em] shrink-0 text-toffee" />
            </h1>
            <p className="mt-5 max-w-[34em] text-cocoa-soft">
              Every puppy here has already joined a loving family. Looking for one just like them? Tell us — we&apos;ll
              help you find your match.
            </p>
            <Link href="/puppies" className="btn mt-7">
              See available puppies
            </Link>
          </div>
          <TicketBooth />
        </div>

        <ul className="mt-14 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {goneHome.map((p, i) => (
            <li key={p.slug} data-reveal>
              <Link
                href={`/puppies/${p.slug}`}
                className="ticket"
                style={{ rotate: `${[-1.4, 0.8, -0.6, 1.2, -1][i % 5]}deg` }}
              >
                <span className="flex flex-1 items-center gap-4 p-4">
                  <span className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-full border-[3px] border-cocoa">
                    <Photo photo={coverOf(p)} sizes="72px" />
                  </span>
                  <span className="min-w-0">
                    <span className="font-scrawl block text-xs text-toffee-deep">one ticket home</span>
                    <span className="font-plush block text-2xl">{p.name}</span>
                    <span className="block text-xs text-cocoa-soft">{p.ticket?.line}</span>
                    <span className="mt-2 flex items-center gap-2 text-[0.7rem] font-bold tracking-wide uppercase">
                      {p.ticket?.from}
                      <span className="h-px w-8 border-t-2 border-dotted border-cocoa" aria-hidden />
                      <span aria-hidden>→</span>
                      <span>home ♥</span>
                    </span>
                  </span>
                </span>
                <span className="ticket__stub w-10 shrink-0">
                  <span>admit one</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TicketBooth() {
  return (
    <div className="relative hidden w-48 shrink-0 md:block" aria-hidden>
      <Pup pose="face" className="relative z-0 mx-auto -mb-9 w-24" />
      <div className="relative z-10">
        <div className="ticket-booth__awning h-7 rounded-t-lg border-[3px] border-cocoa" />
        <div className="grid h-16 place-items-center border-[3px] border-t-0 border-cocoa bg-honey-soft shadow-[5px_5px_0_rgb(42_23_14/0.18)]">
          <span className="font-plush text-lg text-toffee-deep">tickets home</span>
        </div>
      </div>
    </div>
  );
}
