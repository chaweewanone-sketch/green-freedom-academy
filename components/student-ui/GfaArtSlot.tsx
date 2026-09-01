"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

type GfaArtSlotProps = {
  src: string;
  alt: string;
  aspect: `${number} / ${number}`;
  className?: string;
  fallback?: ReactNode;
  decorative?: boolean;
  sizes?: string;
  fit?: "cover" | "contain";
  priority?: boolean;
};

export function GfaArtSlot({
  src,
  alt,
  aspect,
  className,
  fallback,
  decorative = false,
  sizes = "(max-width: 820px) 100vw, 50vw",
  fit = "cover",
  priority = false,
}: GfaArtSlotProps) {
  const [failed, setFailed] = useState(false);
  const slotClass = ["gfaArtSlot", className].filter(Boolean).join(" ");
  const showWait = fallback === undefined;

  if (failed) {
    return (
      <div
        className={`${slotClass} gfaArtSlot-empty`}
        style={{ aspectRatio: aspect }}
        role={decorative || !showWait ? "presentation" : "img"}
        aria-hidden={decorative ? true : undefined}
        aria-label={decorative || !showWait ? undefined : alt}
      >
        {showWait ? (
          <span className="gfaArtSlotWait">รอภาพต้นฉบับ GFA</span>
        ) : (
          fallback
        )}
      </div>
    );
  }

  return (
    <div className={slotClass} style={{ aspectRatio: aspect }}>
      <Image
        src={src}
        alt={decorative ? "" : alt}
        fill
        sizes={sizes}
        unoptimized
        priority={priority}
        style={{ objectFit: fit }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
