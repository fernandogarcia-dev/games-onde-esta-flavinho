"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  buildCrowd,
  lookTip,
  spriteBox,
  type LookTier,
} from "@/lib/crowd";

type Props = {
  seed: string;
  background: string;
  crowdCount: number;
  flavinhoScale: number;
  ground: {
    yMin: number;
    yMax: number;
    xMin?: number;
    xMax?: number;
  };
  lookTier?: LookTier;
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
  ground,
  lookTier = "medium",
  onFound,
  onMiss,
  showHint,
  disabled,
}: Props) {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setPortrait(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Portrait keeps density; shrink tokens instead of gutting the crowd.
  const mobileBoost = portrait ? 1.06 : 1;
  const scale = flavinhoScale * (portrait ? 0.92 : 1);
  const count = portrait
    ? Math.max(28, Math.floor(crowdCount * 0.78))
    : crowdCount;

  const items = useMemo(() => {
    const band = portrait
      ? {
          yMin: Math.max(8, ground.yMin - 2),
          yMax: Math.min(92, ground.yMax + 2),
          xMin: Math.max(3, (ground.xMin ?? 4) - 1),
          xMax: Math.min(97, (ground.xMax ?? 96) + 1),
        }
      : ground;
    return buildCrowd(seed, count, scale, band, { mobileBoost, lookTier });
  }, [seed, count, scale, ground, mobileBoost, portrait, lookTier]);
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
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] select-none touch-manipulation"
      style={{
        aspectRatio: portrait ? "3 / 4" : "16 / 10",
        backgroundColor: "#d7d2c8",
        maxHeight: portrait ? "min(68dvh, 640px)" : undefined,
      }}
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
        const { widthPct, heightPct } = spriteBox(
          item.scale,
          item.kind,
          mobileBoost,
          lookTier === "hard" ? 3.4 : lookTier === "medium" ? 4.2 : 5.2,
        );
        const style = {
          left: `${item.x}%`,
          top: `${item.y}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
          zIndex: Math.round(item.z * 10),
          transform: `translate(-50%, -50%) scaleX(${item.facing})`,
          filter: item.filter,
        } as const;

        const shadow = (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[78%] h-[12%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/20 blur-[1.5px]"
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
                className="relative h-full w-full object-contain pointer-events-none drop-shadow-[1px_2px_0_rgba(0,0,0,0.25)]"
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
              width={160}
              height={260}
              className="relative h-full w-full object-contain drop-shadow-[1px_2px_0_rgba(0,0,0,0.2)]"
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

      <div className="pointer-events-none absolute left-2 top-2 z-[5001] max-w-[85%] rounded-lg bg-[var(--ink)]/80 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:left-3 sm:top-3 sm:text-xs">
        {lookTip(lookTier)}
      </div>
    </div>
  );
}
