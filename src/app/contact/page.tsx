import type { Metadata } from "next";
import { LetterForm } from "@/components/forms/LetterForm";
import { Paw } from "@/components/illustrations/Icons";
import { Pup } from "@/components/illustrations/Pup";
import { Photo } from "@/components/ui/Photo";
import home from "@/data/home.json";
import { available, isNamed, type Photo as PhotoData } from "@/lib/puppies";
import { SITE, telUrl, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Visit & contact",
  description: "Visit the TeddyPups showroom in Downtown Dubai, message us on WhatsApp, or write to us about a puppy.",
};

export default function ContactPage() {
  const options = available.map((p) => ({
    value: p.slug,
    label: isNamed(p) ? `${p.name} (${p.breed}, ${p.sex.toLowerCase()})` : `${p.name} (${p.sex.toLowerCase()})`,
  }));
  const showroom = (home.showroom as PhotoData[])[0];

  return (
    <section className="bg-[linear-gradient(var(--color-milk),var(--color-honey-soft))] pb-32">
      <div className="page-wrap pt-10 md:pt-14">
        <header className="grid items-end gap-6 lg:grid-cols-[1.3fr_1fr]">
          <h1 className="font-plush max-w-[7em] text-[clamp(3rem,7.6vw,6.8rem)]">Get in touch with us</h1>
          <p className="max-w-[30em] text-cocoa-soft lg:pb-3">
            Have questions about our puppies or adoption process? Fill out the form, and our team will get back to you
            promptly. Whether ready to adopt or just seeking info, we&apos;d love to hear from you!
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.7fr]">
          <div className="grid content-start gap-7">
            <a href={whatsappUrl()} className="btn btn-wa justify-self-start">
              WhatsApp {SITE.phoneDisplay}
            </a>
            <dl className="grid gap-5">
              <div>
                <dt className="font-scrawl text-sm text-cocoa-soft">call us</dt>
                <dd>
                  <a href={telUrl} className="font-medium text-toffee-deep underline underline-offset-4">
                    {SITE.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-scrawl text-sm text-cocoa-soft">email</dt>
                <dd>
                  <a href={`mailto:${SITE.email}`} className="font-medium break-all text-toffee-deep underline underline-offset-4">
                    {SITE.email}
                  </a>
                </dd>
              </div>
            </dl>

            <section className="relative overflow-hidden rounded-2xl border-[3px] border-cocoa bg-milk" aria-labelledby="visit-title">
              <div className="awning !mx-0 !rounded-none !border-x-0 !border-t-0" aria-hidden />
              <div className="grid grid-cols-[1fr_auto] gap-4 p-5">
                <div>
                  <h2 id="visit-title" className="font-plush text-2xl">
                    Visit us in Downtown Dubai
                  </h2>
                  <p className="mt-3 text-sm text-cocoa-soft">
                    Step into our Downtown Dubai showroom and experience the joy of choosing your puppy face-to-face.
                  </p>
                  <p className="mt-4 flex items-start gap-2 text-sm font-medium">
                    <Paw className="mt-0.5 size-4 shrink-0 text-toffee" />
                    {SITE.address}
                  </p>
                  <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-milk btn-sm mt-5">
                    Open in Google Maps
                  </a>
                </div>
                <div className="relative mt-auto h-36 w-24 overflow-hidden rounded-t-full border-[3px] border-b-0 border-cocoa sm:h-44 sm:w-28">
                  <Photo photo={showroom} sizes="112px" />
                </div>
              </div>
            </section>
          </div>

          <div className="relative">
            <LetterForm puppies={options} />
            <Pup pose="sit" className="absolute -right-2 -bottom-20 hidden w-20 sm:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
