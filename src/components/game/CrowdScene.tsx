"use client";

import Image from "next/image";
import {
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { buildCrowd } from "@/lib/crowd";

type Props = {
  seed: string;
  background: string;
  crowdCount: number;
  flavinhoScale: number;
  onFound: () => void;
  onMiss: () => void;
  showHint: boolean;
  disabled?: boolean;
};

export function CrowdScene({
  seed,
  background,
  crowdCount,
  flavinhoScale,
  onFound,
  onMiss,
  showHint,
  disabled,
}: Props) {
  const items = useMemo(
    () => buildCrowd(seed, crowdCount, flavinhoScale),
    [seed, crowdCount, flavinhoScale],
  );
  const [missFlash, setMissFlash] = useState<{ x: number; y: number } | null>(
    null,
  );

  function handleBoardClick(e: ReactMouseEvent<HTMLDivElement>) {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMissFlash({ x, y });
    window.setTimeout(() => setMissFlash(null), 450);
    onMiss();
  }

  function handleFlavinhoClick(e: ReactMouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    onFound();
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] select-none touch-manipulation"
      style={{ aspectRatio: "16 / 10", backgroundColor: "#9ec8e0" }}
      onClick={handleBoardClick}
      role="img"
      aria-label="Cena lotada. Encontre o Flavinho."
    >
      <Image
        src={background}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 960px"
        priority
      />

      {items.map((item) => {
        const widthPct = Math.max(
          item.scale * 100,
          item.kind === "prop" ? 3.5 : 4.2,
        );
        const heightPct = widthPct * (item.kind === "prop" ? 1.1 : 1.6);
        const style = {
          left: `${item.x}%`,
          top: `${item.y}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
          zIndex: Math.round(item.z * 10),
          transform: `translate(-50%, -100%) scaleX(${item.facing})`,
        } as const;

        const shadow = (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[96%] h-[8%] w-[55%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-[1px]"
          />
        );

        if (item.kind === "flavinho") {
          return (
            <button
              key={item.id}
              type="button"
              aria-label="Flavinho"
              className={`absolute focus:outline-none ${
                showHint
                  ? "animate-pulse ring-4 ring-[var(--brand)] ring-offset-2 rounded-md"
                  : ""
              }`}
              style={style}
              onClick={handleFlavinhoClick}
            >
              {shadow}
              <Image
                src={item.src}
                alt="Flavinho"
                width={200}
                height={320}
                className="relative h-full w-full object-contain pointer-events-none"
                draggable={false}
                unoptimized
              />
            </button>
          );
        }

        return (
          <div
            key={item.id}
            className="pointer-events-none absolute"
            style={style}
            aria-hidden
          >
            {shadow}
            <Image
              src={item.src}
              alt=""
              width={180}
              height={280}
              className="relative h-full w-full object-contain"
              draggable={false}
              unoptimized
            />
          </div>
        );
      })}

      {missFlash && (
        <div
          className="pointer-events-none absolute z-[5000] -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-[var(--alert)] animate-ping"
          style={{ left: `${missFlash.x}%`, top: `${missFlash.y}%` }}
        >
          ✕
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 z-[5001] rounded-lg bg-[var(--ink)]/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        Toque nele. A multidão mente.
      </div>
    </div>
  );
}
