import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Squiggle } from "@/components/illustrations/Icons";
import { Pup } from "@/components/illustrations/Pup";
import { FilterPanelPlaceholder, PuppyBrowser } from "@/components/puppies/PuppyBrowser";
import { PuppyGrid } from "@/components/puppies/PuppyGrid";
import { Photo } from "@/components/ui/Photo";
import { available, coverOf, goneHome } from "@/lib/puppies";

export const metadata: Metadata = {
  title: "Available puppies",
  description: "Teacup and miniature puppies available now at TeddyPups U.A.E. Real photos of every puppy — ask about them on WhatsApp.",
};

export default function PuppiesPage() {
  return (
    <>
      <section className="sketchbook pb-24">
        <div className="page-wrap pt-10 md:pt-14">
          <div className="flex items-start justify-between gap-8">
            <div>
              <p className="font-scrawl text-toffee-deep">from Teddy&apos;s sketchbook</p>
              <h1 className="font-plush mt-2 inline-block text-[clamp(3rem,7.6vw,6.8rem)]">
                Available puppies
                <Squiggle className="mt-1 h-3 w-full text-toffee" />
              </h1>
              <p className="mt-5 max-w-[32em] text-cocoa-soft">
                Every listing shows real photos of the actual puppy. Open a profile to see them all, then ask us about
                them on WhatsApp.
              </p>
            </div>
            <figure className="hidden shrink-0 text-center md:block">
              <div className="grid size-44 place-items-center rounded-full border-[3px] border-cocoa bg-honey-soft">
                <Pup pose="sit" className="w-28 translate-y-2" />
              </div>
              <figcaption className="font-scrawl mt-2 text-sm">self-portrait</figcaption>
            </figure>
          </div>

          {/* Filters read the URL; until then show the full list */}
          <Suspense
            fallback={
              <>
                <FilterPanelPlaceholder />
                <p className="font-scrawl mt-9 mb-6">{available.length} puppies looking for a home</p>
                <PuppyGrid puppies={available} />
              </>
            }
          >
            <PuppyBrowser />
          </Suspense>
        </div>
      </section>

      <section className="bg-honey-soft pt-16 pb-28" aria-labelledby="gone-title">
        <div className="page-wrap flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="gone-title" className="font-plush max-w-[7em] text-[clamp(2.4rem,4.4vw,3.8rem)]">
              Already gone home
            </h2>
            <p className="mt-2 text-cocoa-soft">These puppies have found their families.</p>
            <Link href="/gone-home" className="btn mt-6">
              See the puppies who&apos;ve gone home
            </Link>
          </div>
          <ul className="flex flex-wrap gap-4 sm:gap-6">
            {goneHome.slice(0, 5).map((p) => (
              <li key={p.slug}>
                <Link href={`/puppies/${p.slug}`} className="group block text-center">
                  <span className="relative block size-24 sm:size-28">
                    <span className="absolute inset-0 overflow-hidden rounded-full border-[3px] border-cocoa">
                      <Photo photo={coverOf(p)} sizes="112px" alt="" />
                    </span>
                    <span className="tag absolute -bottom-2 left-1/2 -translate-x-1/2 !rotate-[-4deg] !text-[0.7rem] !text-toffee-deep">
                      gone home ♥
                    </span>
                  </span>
                  <span className="font-plush-text mt-3 block group-hover:text-toffee-deep">{p.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
