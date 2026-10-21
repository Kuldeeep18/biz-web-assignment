import { PupStop } from "@/components/pup/PupStop";
import Image from "next/image";
import Link from "next/link";
import { Pup } from "@/components/illustrations/Pup";
import { Stars } from "@/components/illustrations/Stars";
import { Wave } from "@/components/illustrations/Wave";
import { FOOTER_LINKS, SITE, telUrl, whatsappUrl } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer" id="contact-footer">
      <Wave className="wave-top" />
      <Stars
        stars={[
          [6, 10, 7, 0],
          [22, 16, 6, 1],
          [44, 6, 9, 0.4],
          [63, 13, 7, 1.8],
          [71, 26, 5, 2.4],
        ]}
      />
      <span className="moon" aria-hidden />
      <div className="page-wrap relative grid gap-12 pt-20 pb-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-plush text-[clamp(2.4rem,4vw,3.4rem)] text-honey-soft">Home, at last.</p>
          <p className="mt-5 max-w-md text-milk/80">{SITE.about}</p>
          <div className="relative mt-12 hidden w-32 md:block" aria-hidden>
            <Pup pose="face" className="relative z-0 -mb-6 w-24 translate-x-4" />
            <Basket />
          </div>
        </div>
        <nav aria-labelledby="footer-explore" className="md:col-span-3 md:col-start-7">
          <h2 id="footer-explore" className="font-scrawl mb-4 text-lg text-honey">
            Explore
          </h2>
          <ul className="grid gap-3">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-medium transition-colors hover:text-honey">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <h2 className="font-scrawl mb-4 text-lg text-honey">Say hello</h2>
          <ul className="grid gap-3">
            <li>
              <a href={whatsappUrl()} className="font-semibold hover:text-honey">
                WhatsApp {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="break-all hover:text-honey">
                {SITE.email}
              </a>
            </li>
            <li className="text-milk/80">{SITE.address}</li>
          </ul>
          <ul className="mt-5 flex flex-wrap gap-2">
            {SITE.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full px-4 py-2 text-[0.8125rem] font-semibold ring-[1.5px] ring-milk/45 transition-colors hover:bg-milk/10"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="page-wrap">
        <div className="flex flex-col items-start justify-between gap-3 border-t border-milk/10 py-6 text-[0.8125rem] text-milk/70 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Image src="/brand/logo.png" alt="" width={28} height={28} className="rounded-full" />
            <span>© 2026 {SITE.name}</span>
          </div>
          <span className="font-scrawl text-[0.9375rem] text-honey">{SITE.tagline}</span>
        </div>
      </div>
    </footer>
  );
}

export function ActionBar() {
  return (
    <div className="action-bar md:hidden">
      <a href={whatsappUrl()} className="btn btn-wa flex-1">
        WhatsApp us
      </a>
      <a href={telUrl} className="btn btn-milk flex-1">
        Call
      </a>
    </div>
  );
}

function Basket() {
  return (
    <svg viewBox="0 0 130 64" className="relative z-10 w-32" aria-hidden>
      <path d="M8 16h114l-12 46H20z" fill="var(--color-honey)" stroke="var(--color-toffee-ink)" strokeWidth="2.5" />
      <path
        d="M14 30h102M18 44h94M34 16l4 46M54 16l2 46M76 16l-2 46M96 16l-4 46"
        stroke="var(--color-toffee-ink)"
        strokeWidth="1.6"
        opacity=".55"
        fill="none"
      />
      <rect x="2" y="7" width="126" height="13" rx="6.5" fill="var(--color-honey-soft)" stroke="var(--color-toffee-ink)" strokeWidth="2.5" />
    </svg>
  );
}
