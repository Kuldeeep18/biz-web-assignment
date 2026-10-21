"""Extract the reference site's content into this project's data files.

The pages are rebuilt from scratch in React; this script only harvests the
*content* (puppy details, photos, videos, captions, FAQ copy) from a saved
copy of https://puppy.instabizweb.com so it doesn't have to be retyped.

    python -I scripts/extract_content.py <path-to-saved-site>

Writes:
    src/data/puppies.json    every puppy: details, status, gallery
    src/data/families.json   the happy-families wall
    src/data/faq.json        questions and answers
    src/data/home.json       which photos the home page features
    public/media/...         images and videos, renamed by puppy slug
"""
import json
import re
import shutil
import sys
import urllib.parse
from pathlib import Path

from bs4 import BeautifulSoup
from PIL import Image

PROJECT = Path(__file__).resolve().parent.parent
DATA = PROJECT / "src" / "data"
PUBLIC = PROJECT / "public"


def soup(ref, page):
    path = ref / page.strip("/") / "index.html" if page.strip("/") else ref / "index.html"
    return BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")


def content_root(s):
    """<main>, or the streamed Suspense segment when <main> only holds a placeholder."""
    main = s.select_one("main")
    if main and main.select_one("h1"):
        return main
    for seg in s.select("div[hidden][id^='S:']"):
        if seg.select_one("h1"):
            return seg
    return main


def text(el):
    return re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip() if el else ""


def media_src(img):
    """Original /media/... path behind a next/image URL."""
    src = img.get("src", "")
    if src.startswith("/_next/image"):
        src = urllib.parse.unquote(urllib.parse.parse_qs(urllib.parse.urlparse(src).query)["url"][0])
    return src


def style_value(img, prop):
    m = re.search(prop + r":([^;]+)", img.get("style", ""))
    return m.group(1).strip() if m else None


class MediaStore:
    """Copies media into public/ under readable names, once per source file."""

    def __init__(self, ref):
        self.ref = ref
        self.done = {}

    def put(self, src, dest_stem):
        if src in self.done:
            return self.done[src]
        source = self.ref / src.lstrip("/")
        dest = PUBLIC / "media" / f"{dest_stem}{source.suffix.lower()}"
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, dest)
        info = {"src": "/" + dest.relative_to(PUBLIC).as_posix()}
        if source.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp", ".avif"):
            try:
                with Image.open(source) as im:
                    info["width"], info["height"] = im.size
                    # one-pixel average: the placeholder colour shown while the photo loads
                    info["color"] = "#%02x%02x%02x" % im.convert("RGB").resize((1, 1)).getpixel((0, 0))
            except Exception:  # noqa: BLE001 - AVIF needs a Pillow plugin; size is optional
                pass
        self.done[src] = info
        return info

    def image(self, img, dest_stem):
        info = dict(self.put(media_src(img), dest_stem))
        info["alt"] = img.get("alt", "")
        focal = style_value(img, "object-position")
        if focal and focal != "50% 50%":
            info["focal"] = focal
        color = style_value(img, "background-color")
        if color:
            info["color"] = color
        return info


def listing_cards(ref):
    """Available puppies in the order the reference lists them."""
    s = soup(ref, "/puppies")
    cards = []
    for a in s.select('main a.tp-sketch[href^="/puppies/"]'):
        label = a.get("aria-label", "")
        # the "Already gone home" strip reuses the same card
        if not label.endswith("available"):
            continue
        wash = re.search(r"--wash:([^;\"]+)", a.get("style", ""))
        cards.append({"slug": a["href"].rsplit("/", 1)[1], "label": label, "wash": wash.group(1) if wash else None})
    return cards


def tickets(ref):
    s = soup(ref, "/gone-home")
    out = []
    for li in s.select("main li.tp-ticket"):
        a = li.select_one("a[href^='/puppies/']")
        bits = [t for t in li.stripped_strings]
        # ['one ticket home', name, 'Pomeranian, boy', 'TeddyPups', 'home ♥', 'admit one']
        out.append({"slug": a["href"].rsplit("/", 1)[1], "name": bits[1], "line": bits[2], "from": bits[3]})
    return out


def puppy(ref, slug, media):
    s = soup(ref, f"/puppies/{slug}")
    main = content_root(s)
    facts = {text(dt): text(dt.find_next_sibling("dd")) for dt in main.select("dt")}
    h1 = main.select_one("h1")
    html = str(s)

    gallery = []
    thumbs = main.select('ul[aria-label^="All photos of"] li')
    hero_img = main.select_one(".tp-storypage img")
    videos = {Path(urllib.parse.unquote(v)).stem: urllib.parse.unquote(v)
              for v in re.findall(r"(/media/[\w./%-]+?\.mp4)", html.replace("%2F", "/"))}
    items = thumbs or [hero_img.parent]
    for i, li in enumerate(items, 1):
        img = li.select_one("img")
        # thumbnails carry no alt; the story-page image has the descriptive one
        alt = hero_img.get("alt", "") if hero_img else ""
        entry = media.image(img, f"puppies/{slug}/{i:02d}")
        entry["alt"] = alt if i == 1 else f"{alt}, photo {i}"
        entry["type"] = "image"
        if "▶" in li.get_text():
            # a video's poster frame is named after it: <video stem>f000.jpg (or f001, f002…)
            stem = re.sub(r"f\d{3}$", "", Path(media_src(img)).stem)
            video = videos.get(stem)
            if video:
                entry = {"type": "video", "poster": entry, **media.put(video, f"puppies/{slug}/{i:02d}-video")}
            else:
                print(f"  {slug}: video thumbnail {i} has no matching .mp4, keeping the poster")
        gallery.append(entry)

    meta = s.find("meta", attrs={"name": "description"})
    return {
        "slug": slug,
        "name": text(h1),
        "breed": facts.get("Breed", ""),
        "sex": facts.get("Boy or girl", ""),
        "age": facts.get("Age", ""),
        "where": facts.get("Where", ""),
        "description": meta["content"] if meta else "",
        "gallery": gallery,
    }


def families(ref, media):
    s = soup(ref, "/happy-families")
    out = []
    for i, li in enumerate(s.select("main li.tp-wall__item"), 1):
        img = li.select_one("img")
        entry = media.image(img, f"families/{i:02d}")
        cap = li.select_one(".tp-polaroid__caption, figcaption")
        caption = text(cap) if cap else ""
        if not caption:
            texts = [t for t in li.stripped_strings]
            caption = texts[-1] if texts else ""
        if caption:
            entry["caption"] = caption
        out.append(entry)
    return out


def faq(ref):
    s = soup(ref, "/faq")
    return [{"q": text(li.select_one(".tp-note__q")), "a": text(li.select_one(".tp-note__answer"))}
            for li in s.select("main li.tp-note")]


def home(ref, media):
    s = soup(ref, "/")
    showroom = []
    for img in s.select("main img"):
        if "showroom" in img.get("alt", "").lower() and media_src(img) not in {x["_src"] for x in showroom}:
            info = media.image(img, f"showroom/{len(showroom) + 1:02d}")
            showroom.append({**info, "_src": media_src(img)})
    return {"showroom": [{k: v for k, v in x.items() if k != "_src"} for x in showroom]}


def main():
    ref = Path(sys.argv[1] if len(sys.argv) > 1 else PROJECT.parent / "clone of website" / "mirror").resolve()
    if not (ref / "index.html").exists():
        sys.exit(f"no saved site at {ref}")
    DATA.mkdir(parents=True, exist_ok=True)
    shutil.rmtree(PUBLIC / "media", ignore_errors=True)
    media = MediaStore(ref)

    available = listing_cards(ref)
    gone = tickets(ref)
    slugs = [c["slug"] for c in available] + [t["slug"] for t in gone if t["slug"] not in {c["slug"] for c in available}]

    puppies = []
    for slug in slugs:
        p = puppy(ref, slug, media)
        card = next((c for c in available if c["slug"] == slug), None)
        ticket = next((t for t in gone if t["slug"] == slug), None)
        p["status"] = "available" if card else "gone-home"
        if card:
            p["wash"] = card["wash"]
        if ticket:
            p["ticket"] = {"line": ticket["line"], "from": ticket["from"]}
        puppies.append(p)

    (DATA / "puppies.json").write_text(json.dumps(puppies, indent=2, ensure_ascii=False), encoding="utf-8")
    (DATA / "families.json").write_text(json.dumps(families(ref, media), indent=2, ensure_ascii=False), encoding="utf-8")
    (DATA / "faq.json").write_text(json.dumps(faq(ref), indent=2, ensure_ascii=False), encoding="utf-8")
    (DATA / "home.json").write_text(json.dumps(home(ref, media), indent=2, ensure_ascii=False), encoding="utf-8")

    for src, dest in [("brand/logo.png", "brand/logo.png")]:
        (PUBLIC / dest).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ref / src, PUBLIC / dest)

    print(f"{len(puppies)} puppies ({len(available)} available), {len(media.done)} media files")


if __name__ == "__main__":
    main()
