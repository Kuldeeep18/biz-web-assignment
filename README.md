# TeddyPups U.A.E. — website clone

A rebuild of [puppy.instabizweb.com](https://puppy.instabizweb.com/), made for the Insta Biz Web technical assignment: every page, its illustrated design, its scroll scenes and its forms, written from scratch in Next.js.

**Live:** _add the deployment URL here_

## Pages

| Route | What's there |
| --- | --- |
| `/` | Hero with puppy arches peeking over a fence, a street of doors that slides sideways as you scroll (with a trotting mascot), a signpost of the two ways home, a phone chat that fills in with each step, a passport of stamps, a sunset over Dubai into the families wall, a night-time FAQ, and a front door that opens to reveal a puppy |
| `/puppies` | Sketchbook listing with breed / origin / boy-or-girl filters kept in the URL (shareable), plus a strip of puppies who have gone home |
| `/puppies/[slug]` | 42 profiles (15 available, 27 gone home): photo and video gallery with thumbnails and full-screen view, details card, what comes with every puppy, the way home, enquiry form, previous / next puppy |
| `/gone-home` | "Admit one" tickets for every puppy that found a family |
| `/happy-families` | Masonry wall of 64 polaroids with a full-screen viewer (arrow keys work) |
| `/how-it-works` | In Dubai / Imported switch, puppy promise passport, delivery and collection, why choose us |
| `/faq` | Corkboard of pinned notes that open like an accordion, with live search |
| `/contact` | The enquiry form written as a fill-in-the-blanks letter, plus the showroom card |

## Stack

- **Next.js 16** (App Router, Turbopack, Cache Components with Partial Prerendering) and **React 19**
- **TypeScript**
- **Tailwind CSS v4**, with the palette and fonts defined as theme tokens in `src/app/globals.css`
- **next/font**: Fraunces (headlines, using its `SOFT` / `WONK` axes), Figtree (body), Shantell Sans (handwritten notes)
- **next/image** for every photo, with each photo's focal point and average colour used while it loads
- No UI or animation libraries. Animations are CSS (including scroll-driven `animation-timeline: view()`) plus a few small hooks using `IntersectionObserver` and `requestAnimationFrame`

## Project structure

```
scripts/extract_content.py   pulls content (puppy data, photos, captions, FAQ) out of a saved copy of the reference site
src/
  app/                       routes, plus /api/enquiry, sitemap, robots, not-found
  components/
    layout/                  header (scalloped hem, mobile sheet), footer (wave, stars, moon), action bar
    home/                    the home page scenes
    puppies/  puppy/         listing cards and filters; profile gallery
    families/ faq/ how/      page-specific interactive pieces
    forms/                   EnquiryForm and LetterForm, both posting to /api/enquiry
    illustrations/           the mascot (Pup) and icons, all inline SVG
    ui/                      Photo, Slideshow, Passport
  data/                      generated JSON: puppies, families, faq, home
  lib/                       typed data access, site constants, shared enquiry validation, page copy
  styles/                    component styles by area (base, chrome, home, pages)
public/media/                photos and videos, named by puppy (e.g. puppies/maltipoo-max-male/01.webp)
```

## How it was built

1. **Studied the reference.** I captured every page at desktop and phone widths, scrolling in steps because several sections are pinned or animate on scroll, and noted each page's layout, interactions and copy.
2. **Extracted the content, not the code.** `scripts/extract_content.py` reads a saved copy of the reference pages and writes `src/data/*.json`. It records each puppy's details and status, every gallery photo with its focal point and placeholder colour, each video matched to its poster frame, the family photos with their captions, and the FAQ. Media files are copied into `public/media` with readable names. The site's own HTML, CSS and JavaScript are not used.
3. **Set up the design system.** The colours, fonts and the hard-offset "ink" shadows were set up as Tailwind theme tokens and a few component classes.
4. **Built the illustrations.** The mascot is one SVG component with three poses. Its fur is generated from rings of circles, each drawn twice (a dark outline underneath, the fill on top), so the overlapping circles merge into one fluffy outline.
5. **Built the pages.** Server components by default. Client components only where there is state: filters, gallery, menu, FAQ, forms, scroll scenes.
6. **Tested in a real browser**, at both widths, in development and against the production build (see Testing).

### Decisions worth knowing

- **Filters live in the URL** (`?breed=pomeranian&sex=girls`), so links from the home page and shared links just work. Reading search params suspends rendering, so the filter UI sits in a `<Suspense>` boundary whose fallback is the full, unfiltered grid. The prerendered HTML therefore already lists every puppy.
- **Puppy pages are generated from data.** `generateStaticParams` returns every slug, and `params` is awaited inside `<Suspense>`, as Cache Components recommends. An unknown slug renders the not-found page. Because the page shell has already streamed by then, the status is 200, but the page carries `noindex`.
- **Randomness happens after hydration.** The hero shows a different set of puppies on every visit. Random values are not allowed in a prerender, so the server renders a fixed order and the client shuffles it after mounting.
- **Scroll reveals use pure CSS.** An earlier version used an `IntersectionObserver` that set attributes on elements. That caused hydration mismatches, because it touched elements React had not hydrated yet. Scroll-driven CSS animations need no JavaScript; browsers without support simply show the content.
- **The pinned "Meet the pups" street** is a sticky stage inside a section as tall as the sideways distance. Scroll progress drives `translate3d` on the track, and on the walking mascot so it trots along the floor. On phones, or with reduced motion, it becomes a native swipeable row.
- **Enquiries are validated in two places with one definition.** `src/lib/enquiry.ts` is used by both forms for instant feedback and by `/api/enquiry` as the authority. A hidden "website" field (a honeypot) quietly absorbs bots. If `ENQUIRY_WEBHOOK_URL` is set (Slack, Discord, Zapier…), each enquiry is posted there as JSON; otherwise it goes to the server log. The response includes a pre-filled WhatsApp link, because that's how this business prefers to talk.
- **Accessibility:** skip link, landmark structure, visible focus rings, the menu as a modal dialog (Escape closes it, focus is returned), real buttons with `aria-expanded` on the FAQ, a tab pattern for In Dubai / Imported, labelled form fields with linked errors, and `prefers-reduced-motion` respected throughout.

### Challenges

- **Cache Components rules.** Under Next 16, `usePathname`, `useSearchParams`, `params` and `Math.random()` all have to be kept out of the static shell. The fixes are `<Suspense>` boundaries with useful fallbacks (the nav renders without its active state; the listing renders without filters) and client-side shuffling.
- **CSS cascade layers.** Tailwind v4 puts utilities inside `@layer utilities`, so unlayered component CSS always won, and `md:hidden` couldn't hide the phone action bar. The component stylesheets are now imported into `layer(components)`.
- **Hidden routes stay mounted.** With Cache Components, a page you navigate away from is kept in React's `<Activity>` and its refs are detached. A late scroll or resize callback in the pinned section then read a null ref. The effect now holds the DOM nodes directly.
- **The reference streams some pages.** Some saved puppy pages had an empty `<main>` with the content in a hidden Suspense segment, so the extractor reads from that segment when it needs to.

## AI tools

Built with **Claude Code** (Anthropic), working in the terminal on this repository. It researched the reference, wrote the extraction script, components and styles, and ran the browser tests. I directed the work, reviewed it, and made the calls on approach. The prompts and the full process are walked through in the Loom video.

## Testing

Tested with headless Chrome (Puppeteer) against both `next dev` and the production build (`next build && next start`):

- Every page at 1440px and 390px: no console errors, no failed requests, no horizontal overflow
- Interactions: FAQ accordion and search, puppy filters, gallery navigation, form validation and successful submits (profile form and contact letter), the How it works toggle, and the mobile menu with client-side navigation
- API: invalid input → 422 with field errors, malformed JSON → 400, honeypot → silent 200, valid enquiry → 200 with a WhatsApp link
- `npm run lint` and `tsc` clean; production build prerenders all 56 pages

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Optional environment variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL for metadata, sitemap and robots |
| `ENQUIRY_WEBHOOK_URL` | Where enquiries are POSTed as JSON |

Re-extracting content (only needed if the reference site changes): `python -I scripts/extract_content.py <path-to-saved-site>` (needs `beautifulsoup4` and `Pillow`).

## Deploy

Import the repository on [vercel.com/new](https://vercel.com/new). No configuration is needed; set the environment variables above if you want them.

## Credits

Content, photos and brand belong to TeddyPups U.A.E. and are used here only for this assessment.
