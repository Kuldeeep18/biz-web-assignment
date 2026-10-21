"use client";

import { useEffect, useState } from "react";
import type { Photo as PhotoData } from "@/lib/puppies";
import { Photo } from "./Photo";

/** Cross-fades through photos stacked in a positioned parent. */
export function Slideshow({ photos, sizes, every = 2800 }: { photos: PhotoData[]; sizes: string; every?: number }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (photos.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % photos.length), every);
    return () => clearInterval(id);
  }, [photos.length, every]);

  return photos.map((p, n) => (
    <Photo
      key={p.src}
      photo={p}
      sizes={sizes}
      className={`transition-opacity duration-700 ${n === i ? "opacity-100" : "opacity-0"}`}
      alt={n === i ? p.alt : ""}
    />
  ));
}
