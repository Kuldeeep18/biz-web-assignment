import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { NAV, SITE, whatsappUrl } from "@/lib/site";
import { HeaderNav } from "./HeaderNav";

export function Header() {
  return (
    <header className="site-header">
      <div className="page-wrap flex h-full items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label={`${SITE.name} — home`}>
          <Image src="/brand/logo.png" alt="" width={48} height={48} priority className="size-10 rounded-full md:size-12" />
          <span className="font-plush text-[1.4rem]">{SITE.shortName}</span>
        </Link>
        {/* Active-link state reads the URL, so it renders after the static shell */}
        <Suspense fallback={<StaticNav />}>
          <HeaderNav />
        </Suspense>
      </div>
    </header>
  );
}

function StaticNav() {
  return (
    <>
      <nav aria-label="Main" className="hidden lg:block">
        <ul className="flex gap-8">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="nav-link">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <a href={whatsappUrl()} className="btn btn-wa btn-sm hidden md:inline-flex">
        WhatsApp us
      </a>
    </>
  );
}
