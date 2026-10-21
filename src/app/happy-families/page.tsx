import type { Metadata } from "next";
import { FamilyWall } from "@/components/families/FamilyWall";
import { Heart } from "@/components/illustrations/Icons";
import { Pup } from "@/components/illustrations/Pup";
import { TESTIMONIAL, families } from "@/lib/families";

export const metadata: Metadata = {
  title: "Happy families",
  description: "Moments shared by families who welcomed a TeddyPups puppy into their home.",
};

export default function HappyFamiliesPage() {
  return (
    <section className="wall-bg pb-36">
      <div className="page-wrap pt-10 md:pt-14">
        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-scrawl text-toffee-deep">our wall of happy endings</p>
            <h1 className="font-plush mt-2 flex max-w-[6em] items-end gap-4 text-[clamp(3rem,7.6vw,6.8rem)]">
              Happy families
              <Heart className="mb-[0.2em] w-[0.36em] shrink-0 text-toffee" />
            </h1>
            <p className="mt-6 max-w-[32em] text-cocoa-soft">
              Nothing makes us happier than seeing our puppies in loving homes! Here are some beautiful moments shared
              by our amazing clients after welcoming their furry friends.
            </p>
            <p className="font-scrawl mt-4 text-toffee-deep">{families.length} moments and counting</p>
          </div>
          <figure className="sticky-note relative max-w-md justify-self-end p-6 pt-7 max-lg:justify-self-start">
            <span className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2 bg-sky/70" aria-hidden />
            <blockquote className="font-plush-text leading-relaxed">“{TESTIMONIAL.quote}”</blockquote>
            <figcaption className="font-scrawl mt-3 text-sm text-toffee-deep">{TESTIMONIAL.by}</figcaption>
          </figure>
        </div>

        <div className="mt-16">
          <FamilyWall families={families} />
        </div>

        <div className="mt-10 flex items-end justify-center gap-6" aria-hidden>
          <Pup pose="walk" className="w-36" />
          <p className="font-scrawl mb-3 text-cocoa-soft">every one of them was a Teddy Pup once</p>
        </div>
      </div>
    </section>
  );
}
