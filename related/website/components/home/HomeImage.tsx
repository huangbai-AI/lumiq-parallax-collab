"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import images from "@/lib/home-image-manifest.json";

type Asset = { base: string; widths: number[]; preview: string };
const assets: Record<string, Asset> = images;

/** Pre-sized CDN files avoid a cold image transformation during scrolling. */
export default function HomeImage(props: ImageProps) {
  const asset = typeof props.src === "string" ? assets[props.src] : undefined;
  const [failed, setFailed] = useState(false);
  if (!asset) return <Image {...props} alt={props.alt} />;
  return (
    <Image
      {...props}
      alt={props.alt}
      data-home-image
      src={failed ? asset.preview : props.src}
      unoptimized={failed}
      loader={({ width }) => `${asset.base}-${asset.widths.find(w => w >= width) ?? asset.widths.at(-1)}.webp`}
      placeholder={asset.preview as `data:image/${string}`}
      onError={() => setFailed(true)}
    />
  );
}
