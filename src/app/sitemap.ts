import type { MetadataRoute } from "next";
import { puppies } from "@/lib/puppies";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/puppies", "/gone-home", "/happy-families", "/how-it-works", "/faq", "/contact"];
  return [...pages.map((p) => ({ url: `${BASE}${p}` })), ...puppies.map((p) => ({ url: `${BASE}/puppies/${p.slug}` }))];
}
