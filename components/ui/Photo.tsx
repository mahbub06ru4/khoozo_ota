"use client";

import { useState } from "react";
import { asset } from "@/lib/runtime";
import { cn } from "@/lib/utils";

export function Photo({ src, alt, className, priority }: { src?: string; alt: string; className?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local static photos; next/image adds no value for these demo assets
    <img
      src={asset(src)}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("absolute inset-0 size-full object-cover", className)}
    />
  );
}
