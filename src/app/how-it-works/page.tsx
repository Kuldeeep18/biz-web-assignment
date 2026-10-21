import type { Metadata } from "next";
import Link from "next/link";
import { FlightPath } from "@/components/home/TwoWays";
import { TwoWaysHome } from "@/components/how/TwoWaysHome";
import { Chat, HeartPulse, Plane } from "@/components/illustrations/Icons";
import { Pup } from "@/components/illustrations/Pup";
import { Passport } from "@/components/ui/Passport";
import { whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description: "Meet your puppy in our Downtown Dubai showroom or order a rare teacup breed from abroad. How adoption, delivery and collection work at TeddyPups.",
};

const CHAPTERS = [
  ["two-ways", "Two ways home"],
  ["promise", "Our premium puppy promise"],
  ["delivery", "Delivery & collection"],
  ["why-us", "Why choose us"],
];

const WORLDWIDE =
  "We safely deliver puppies to loving homes all around the world. Our trusted international cargo partners ensure your new furry friend travels comfortably and arrives safely, no matter the distance.";

export default function HowItWorksPage() {
  return (
    <div className="bg-[linear-gradient(var(--color-milk),var(--color-honey-soft)_55%,color-mix(in_oklab,var(--color-honey-soft)_60%,var(--color-honey)))] pb-28">
      <div className="page-wrap pt-10 md:pt-14">
        <header className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
          <h1 className="font-plush text-[clamp(3rem,7.6vw,6.8rem)]">How it works</h1>
          <p className="max-w-[30em] text-cocoa-soft lg:pt-4">
            Whether you choose to visit us locally or order a premium breed from overseas, TeddyPups is here to make the
            experience unforgettable.
          </p>
        </header>
        <nav aria-label="On this page" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {CHAPTERS.map(([id, label], i) => (
              <li key={id}>
                <a href={`#${id}`} className="chip inline-flex items-center gap-1.5">
                  <span className="font-plush text-toffee-deep">{i + 1}</span> {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <TwoWaysHome />

        <section id="promise" className="scroll-mt-28 pt-24" aria-labelledby="promise-title">
          <Passport
            id="promise-title"
            title="Our premium puppy promise"
            perks={[
              { stamp: "Hand-selected breeders", text: "We work only with breeders who uphold the highest ethical and health standards.", round: true },
              { stamp: "Full transparency", text: "Photos, videos, and health certificates are shared before your puppy travels.", tone: "green" },
              { stamp: "Safe, stress-free delivery", text: "We handle every detail of the import process, so your puppy arrives happy, healthy, and ready to love you.", round: true },
            ]}
          />
        </section>

        <section id="delivery" className="scroll-mt-28 grid items-center gap-12 pt-24 lg:grid-cols-2" aria-labelledby="delivery-title">
          <div>
            <h2 id="delivery-title" className="font-plush max-w-[6em] text-[clamp(2.6rem,5vw,4.4rem)]">
              Delivery &amp; collection
            </h2>
            <p className="mt-4 max-w-[32em] text-cocoa-soft">
              From a same-day visit in Downtown Dubai to a flight from Korea, every puppy travels comfortably and arrives
              safely.
            </p>
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              {[
                ["Take your puppy home the same day", "Local puppies are available immediately — visit, fall in love, and go home together."],
                ["Delivery within Dubai", "Prefer to stay home? We deliver your puppy to your door within Dubai, safely and comfortably."],
                ["Safe international cargo", "We handle all the paperwork and ensure comfortable travel so your puppy arrives happy and stress-free."],
                ["Worldwide delivery", WORLDWIDE],
              ].map(([t, d]) => (
                <div key={t} data-reveal>
                  <dt className="font-plush-text text-lg">{t}</dt>
                  <dd className="mt-1 text-sm text-cocoa-soft">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative h-72" aria-hidden>
            <svg className="skyline-line absolute inset-x-0 bottom-0 h-40 w-full" viewBox="0 0 420 140" preserveAspectRatio="xMidYMax meet">
              <path d="M30 138V90h22v48M64 138V80h20v58M100 138V104h14v34M180 138V40l-5-6v-6h3V16l4-12 4 12v12h3v6l-5 6v98M210 138V90h18v48M250 138V98h22v40M300 138V84h20v54M340 138V108h26v30" />
              <line x1="0" y1="138" x2="420" y2="138" />
            </svg>
            <FlightPath id="delivery-route" className="flight absolute inset-x-0 top-0 h-56 w-full overflow-visible" />
          </div>
        </section>

        <section id="why-us" className="scroll-mt-28 grid gap-12 pt-24 lg:grid-cols-2" aria-labelledby="why-title">
          <div>
            <h2 id="why-title" className="font-plush max-w-[5em] text-[clamp(2.6rem,5vw,4.4rem)]">
              Why choose us
            </h2>
            <p className="mt-4 max-w-[32em] text-cocoa-soft">
              We&apos;re here to help you find a new family member. From the moment you visit our site to the joyful day
              your puppy arrives at your door, we&apos;re with you every step of the way. Our mission is to make the
              entire adoption process smooth, transparent, and full of love.
            </p>
          </div>
          <ul className="grid gap-7">
            {[
              [Plane, "International cargo", WORLDWIDE],
              [Chat, "Support 24/7", "Our team is available 24/7 to answer your questions and assist you through every step of the adoption process. From choosing your puppy to post-delivery support — we're just a message away."],
              [HeartPulse, "Health guarantee", "All our puppies come with a verified health certificate from licensed vets. We ensure every puppy is vaccinated, dewormed, and thoroughly checked before joining your family."],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Plane;
              return (
                <li key={t as string} className="grid grid-cols-[2.5rem_1fr] gap-4" data-reveal>
                  <I className="size-9 text-toffee-deep" />
                  <div>
                    <h3 className="font-plush-text text-xl">{t as string}</h3>
                    <p className="mt-1 text-sm text-cocoa-soft">{d as string}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="paper relative mt-24 grid items-center gap-8 overflow-hidden p-8 sm:p-12 lg:grid-cols-[1fr_auto]" aria-labelledby="quality-title">
          <div>
            <h2 id="quality-title" className="font-plush text-[clamp(2rem,3.6vw,3rem)]">
              Unique and high quality puppies
            </h2>
            <p className="mt-4 max-w-[40em] text-cocoa-soft">
              When you choose TeddyPups, you can trust that you&apos;re getting a puppy of the highest quality. We also
              provide guidance and support to new pet owners, offering advice on training, nutrition, and general care to
              ensure a smooth transition for you and your new furry friend.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={whatsappUrl()} className="btn btn-wa">
                Ask us on WhatsApp
              </a>
              <Link href="/puppies" className="btn btn-milk">
                See available puppies
              </Link>
            </div>
          </div>
          <Pup pose="walk" className="w-44 justify-self-center" />
        </section>
      </div>
    </div>
  );
}
