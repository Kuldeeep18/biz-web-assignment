"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Paw } from "@/components/illustrations/Icons";
import { NAV, SITE, telUrl, whatsappUrl } from "@/lib/site";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  // a puppy profile still lights up "Puppies"; gone-home pups belong there too
  if (href === "/puppies") return pathname.startsWith("/puppies") || pathname.startsWith("/gone-home");
  return pathname.startsWith(href);
}

export function HeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  // Close the sheet whenever the route changes
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    menuButton.current?.focus();
  };

  return (
    <>
      <nav aria-label="Main" className="hidden lg:block">
        <ul className="flex gap-8">
          {NAV.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <li key={n.href}>
                <Link href={n.href} className="nav-link" aria-current={active ? "page" : undefined}>
                  {n.label}
                  <Paw className="nav-link__paw" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-3">
        <a href={whatsappUrl()} className="btn btn-wa btn-sm hidden md:inline-flex">
          WhatsApp us
        </a>
        <button
          ref={menuButton}
          type="button"
          className="btn btn-ghost btn-sm lg:hidden"
          aria-expanded={open}
          aria-controls="menu-sheet"
          onClick={() => setOpen(true)}
        >
          Menu
        </button>
      </div>

      <div id="menu-sheet" className="menu-sheet lg:hidden" data-open={open} role="dialog" aria-modal="true" aria-label="Menu" inert={!open}>
        <div className="flex items-center justify-between">
          <span className="font-scrawl text-xl text-toffee-deep">where to, friend?</span>
          <button ref={closeButton} type="button" className="btn btn-ghost btn-sm" onClick={close}>
            Close
          </button>
        </div>
        <nav aria-label="Mobile" className="mt-10 flex-1">
          <ul className="grid gap-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`font-plush text-[2.4rem] leading-tight ${isActive(pathname, n.href) ? "text-toffee-deep" : ""}`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid justify-items-start gap-3">
          <a href={whatsappUrl()} className="btn btn-wa">
            WhatsApp us
          </a>
          <a href={telUrl} className="font-medium text-cocoa-soft">
            {SITE.phoneDisplay}
          </a>
        </div>
      </div>
    </>
  );
}
