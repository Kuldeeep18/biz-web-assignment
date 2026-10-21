import Link from "next/link";
import { Squiggle } from "@/components/illustrations/Icons";
import { SITE, whatsappUrl } from "@/lib/site";
import { available, coverOf } from "@/lib/puppies";
import { HeroArches } from "./HeroArches";

export function Hero() {
  const pool = available.map((p) => ({ slug: p.slug, label: p.name, photo: coverOf(p) }));
  return (
    <section className="hero relative pt-10 text-center md:pt-14" aria-labelledby="hero-title">
      <div className="page-wrap">
        <p className="font-scrawl inline-block text-[clamp(1.1rem,1.6vw,1.4rem)] text-toffee-deep">
          {SITE.tagline}
          <Squiggle className="-mt-0.5 h-2.5 w-full" />
        </p>
        <h1 id="hero-title" className="font-plush mx-auto mt-3 mb-5 max-w-[9.5em] text-[clamp(3rem,7.6vw,6.8rem)]">
          <span className="block">Premium teacup</span> <span className="block">puppies in Dubai</span>
        </h1>
        <p className="mx-auto max-w-[30em] text-[clamp(1rem,1.3vw,1.125rem)] text-cocoa-soft">
          Meet your new best friend in our Dubai showroom, or order a rare miniature breed from trusted breeders
          worldwide.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-4 max-sm:[&>*]:flex-[1_1_100%]">
          <Link href="/puppies" className="btn">
            View available puppies
          </Link>
          <a href={whatsappUrl()} className="btn btn-ghost">
            Enquire on WhatsApp
          </a>
        </div>
      </div>

      <div className="relative mt-12">
        <HeroArches pool={pool} />
        <svg className="fence" aria-hidden preserveAspectRatio="none">
          <defs>
            <pattern id="scallops" width="76" height="42" patternUnits="userSpaceOnUse">
              <path className="scallop" d="M0 42V39A38 36 0 0 1 76 39V42Z" />
              <path className="dash" d="M10 42A28 26 0 0 1 66 42" />
            </pattern>
          </defs>
          <rect width="100%" height="42" fill="url(#scallops)" />
        </svg>
        <div className="lattice" />
      </div>
    </section>
  );
}
