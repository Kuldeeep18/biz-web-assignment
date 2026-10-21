import Image from "next/image";
import type { Photo as PhotoData } from "@/lib/puppies";

/**
 * next/image filling its (positioned) parent, cropped around the photo's
 * focal point, with the photo's average colour behind it while it loads.
 */
export function Photo({
  photo,
  sizes,
  priority = false,
  className = "",
  alt,
}: {
  photo: PhotoData;
  sizes: string;
  priority?: boolean;
  className?: string;
  alt?: string;
}) {
  return (
    <Image
      src={photo.src}
      alt={alt ?? photo.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      style={{ objectPosition: photo.focal ?? "50% 50%", backgroundColor: photo.color }}
    />
  );
}
