"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  BOARD_GROUND,
  buildCrowd,
  crowdParamsFor,
  lookTip,
  spriteBox,
  type LookTier,
} from "@/lib/crowd";

type Props = {
  seed: string;
  /** Ignored — find board is a flat sea of Flavinhos (kept for call-site compat). */
  background?: string;
  crowdCount: number;
  flavinhoScale: number;
  ground?: {
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
  const params = crowdParamsFor(lookTier);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setPortrait(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Mobile: slightly smaller so the board still fits; keep hard dense.
  const mobileBoost = portrait ? 0.92 : 1;
  const scale = flavinhoScale;
  const count = portrait
    ? Math.max(
        lookTier === "easy" ? 18 : lookTier === "hard" ? 72 : 40,
        Math.floor(
          crowdCount *
            (lookTier === "easy" ? 0.85 : lookTier === "hard" ? 0.78 : 0.82),
        ),
      )
    : crowdCount;

  const items = useMemo(() => {
    const band = {
      yMin: ground?.yMin ?? BOARD_GROUND.yMin,
      yMax: ground?.yMax ?? BOARD_GROUND.yMax,
      xMin: ground?.xMin ?? BOARD_GROUND.xMin,
      xMax: ground?.xMax ?? BOARD_GROUND.xMax,
    };
    return buildCrowd(seed, count, scale, band, {
      mobileBoost,
      lookTier,
      maxWidthPct: params.maxWidthPct,
      minWidthPct: params.minWidthPct,
    });
  }, [seed, count, scale, ground, mobileBoost, lookTier, params.maxWidthPct, params.minWidthPct]);

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
        background:
          "radial-gradient(ellipse at 50% 30%, #eef4fb 0%, #d7e3f2 55%, #c5d4e8 100%)",
        maxHeight: portrait ? "min(72dvh, 680px)" : undefined,
      }}
      onClick={handleBoardClick}
      role="img"
      aria-label="Mar de Flavinhos. Encontre o sem disfarce."
    >
      {/* Soft grid only — no city plate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,19,32,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(11,19,32,0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {items.map((item) => {
        const { widthPct, heightPct } = spriteBox(
          item.scale,
          item.kind,
          mobileBoost,
          params.maxWidthPct,
          params.minWidthPct,
        );
        const style = {
          left: `${item.x}%`,
          top: `${item.y}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
          zIndex: Math.round(item.z * 10),
          transform: `translate(-50%, -100%) scaleX(${item.facing})`,
          filter: item.filter,
          transformOrigin: "50% 100%",
        } as const;

        const shadow = (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-[-2%] left-1/2 h-[8%] w-[55%] -translate-x-1/2 rounded-[50%] bg-black/20 blur-[1.5px]"
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
