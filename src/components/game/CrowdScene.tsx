"use client";

import Image from "next/image";
import {
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { buildCrowd, type CrowdPerson } from "@/lib/crowd";

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

function Decoy({ person }: { person: CrowdPerson }) {
  return (
    <g
      transform={`translate(${person.x}, ${person.y}) scale(${person.facing * person.scale * 18}, ${person.scale * 18})`}
      style={{ pointerEvents: "none" }}
    >
      <ellipse cx="0" cy="4.2" rx="1.6" ry="0.45" fill="rgba(0,0,0,0.18)" />
      <rect x="-1.2" y="0" width="2.4" height="3.2" rx="0.7" fill={person.shirt} />
      <circle cx="0" cy="-1.1" r="1.35" fill="#f2c9a0" />
      <path
        d="M-1.3 -1.5 C-1.1 -2.6 1.1 -2.6 1.3 -1.5 L1.1 -0.7 L-1.1 -0.7 Z"
        fill={person.hair}
      />
      <circle cx="-0.45" cy="-1.05" r="0.18" fill="#1c1917" />
      <circle cx="0.45" cy="-1.05" r="0.18" fill="#1c1917" />
      <path d="M-0.35 -0.45 Q0 -0.2 0.35 -0.45" stroke="#7c2d12" strokeWidth="0.12" fill="none" />
      <rect x="-1.7" y="0.3" width="0.55" height="1.8" rx="0.25" fill={person.shirt} />
      <rect x="1.15" y="0.3" width="0.55" height="1.8" rx="0.25" fill={person.shirt} />
      <rect x="-1.05" y="3" width="0.85" height="1.7" rx="0.3" fill="#1e293b" />
      <rect x="0.2" y="3" width="0.85" height="1.7" rx="0.3" fill="#1e293b" />
    </g>
  );
}

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
  const people = useMemo(
    () => buildCrowd(seed, crowdCount, flavinhoScale),
    [seed, crowdCount, flavinhoScale],
  );
  const flavinho = people.find((p) => p.isFlavinho)!;
  const [missFlash, setMissFlash] = useState<{ x: number; y: number } | null>(
    null,
  );
  const boardRef = useRef<HTMLDivElement>(null);

  function handleBoardClick(e: ReactMouseEvent<HTMLDivElement>) {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const hit =
      Math.abs(x - flavinho.x) < 3.2 && Math.abs(y - (flavinho.y - 2)) < 5.5;

    if (hit) {
      onFound();
      return;
    }

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
      ref={boardRef}
      className="relative w-full overflow-hidden rounded-2xl border-[3px] border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] select-none touch-manipulation"
      style={{ aspectRatio: "16 / 10" }}
      onClick={handleBoardClick}
      role="img"
      aria-label="Cena lotada. Encontre o Flavinho."
    >
      <Image
        src={background}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 900px"
        priority
      />

      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        {people
          .filter((p) => !p.isFlavinho)
          .map((person) => (
            <Decoy key={person.id} person={person} />
          ))}
      </svg>

      <button
        type="button"
        aria-label="Flavinho"
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none ${
          showHint ? "animate-pulse ring-4 ring-[var(--brand)] ring-offset-2" : ""
        }`}
        style={{
          left: `${flavinho.x}%`,
          top: `${flavinho.y - 2}%`,
          width: `${Math.max(flavinho.scale * 220, 28)}px`,
          height: `${Math.max(flavinho.scale * 280, 36)}px`,
        }}
        onClick={handleFlavinhoClick}
      >
        <Image
          src="/game/flavinho-sprite.jpg"
          alt="Flavinho"
          width={120}
          height={150}
          className="h-full w-full object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)] pointer-events-none mix-blend-multiply"
          draggable={false}
        />
      </button>

      {missFlash && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-[var(--alert)] animate-ping"
          style={{ left: `${missFlash.x}%`, top: `${missFlash.y}%` }}
        >
          ✕
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-[var(--ink)]/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        Toque nele. A multidão mente.
      </div>
    </div>
  );
}
