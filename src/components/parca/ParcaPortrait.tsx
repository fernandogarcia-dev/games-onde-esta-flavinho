"use client";

import Image from "next/image";
import { useState } from "react";
import { parcaArtSrc } from "@/lib/parcas";

type Props = {
  id: string;
  name: string;
  className?: string;
};

export function ParcaPortrait({ id, name, className = "" }: Props) {
  const [src, setSrc] = useState(parcaArtSrc(id));

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--sand)] shadow-[4px_4px_0_var(--ink)] ${className}`}
    >
      <Image
        src={src}
        alt={name}
        fill
        unoptimized
        className="object-contain object-bottom p-1"
        onError={() => setSrc("/game/parcas/_fallback.webp")}
      />
    </div>
  );
}
