"use client";

import Image from "next/image";
import { useState } from "react";
import { GAME_MODES, type GameModeId } from "@/lib/modes";
import { LegalNotice } from "@/components/game/LegalNotice";
import { PixModal } from "@/components/game/PixModal";
import { HomeRankingsModal } from "@/components/home/HomeRankingsModal";
import { Button } from "@/components/ui/Button";

type Props = {
  onPick: (mode: GameModeId) => void;
};

export function ModePicker({ onPick }: Props) {
  const [showPix, setShowPix] = useState(false);
  const [showRanks, setShowRanks] = useState(false);

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[var(--brand)]/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <div className="map-grid absolute inset-0 opacity-[0.06]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <section className="relative overflow-hidden rounded-[2rem] border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[10px_10px_0_var(--ink)]">
          <div className="pointer-events-none absolute inset-0">
            <Image
              src="/game/scene-rio-flat.jpg"
              alt="Cena do jogo Cadê Flavinho com multidão e cenário urbano"
              fill
              priority
              className="object-cover opacity-25"
              sizes="(max-width: 768px) 100vw, 960px"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--paper)] via-[var(--paper)]/92 to-[var(--paper)]/75" />
          </div>

          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="animate-rise flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--brand)]">
                  Jogo satírico grátis · ranking mundial
                </p>
                <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-[var(--ink)] sm:text-6xl">
                  Cadê Flavinho?
                </h1>
                <p className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--ink)]/80 sm:text-3xl">
                  Três caçadas. Um sumiço.
                </p>
                <p className="mt-4 max-w-md text-lg text-[var(--muted)]">
                  Ache o Flavinho na multidão, no Street View ou descubra quem
                  ele levou na fuga. Sem cadastro — escolhe o modo e joga.
                </p>
                <div className="mt-5">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowRanks(true)}
                  >
                    Ver rankings
                  </Button>
                </div>
              </div>
              <div className="animate-float relative w-28 shrink-0 sm:w-36">
                <Image
                  src="/game/disguises/real.webp"
                  alt="Flavinho"
                  width={180}
                  height={220}
                  priority
                  unoptimized
                  className="rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--sand)] object-contain p-2 shadow-[6px_6px_0_var(--ink)]"
                />
              </div>
            </div>

            <div className="relative mt-10 grid items-stretch gap-4 sm:grid-cols-3">
              {GAME_MODES.map((mode, i) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onPick(mode.id)}
                  className={`animate-rise group flex h-full flex-col overflow-hidden rounded-3xl border-[3px] text-left shadow-[6px_6px_0_var(--ink)] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--ink)] ${mode.tone}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="relative h-44 w-full shrink-0 overflow-hidden border-b-[3px] border-[var(--ink)]/20 bg-[var(--sand)] sm:h-48">
                    <Image
                      src={mode.art}
                      alt={mode.artAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                      priority={i === 0}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p
                      className="text-[11px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: mode.accent }}
                    >
                      {mode.badge}
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl leading-tight text-[var(--ink)] sm:text-2xl">
                      {mode.name}
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                      {mode.tagline}
                    </p>
                    <p className="mt-2 text-sm leading-snug text-[var(--ink)]/75">
                      {mode.blurb}
                    </p>
                    <span
                      className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] px-3 py-3 text-sm font-[family-name:var(--font-display)] text-white shadow-[4px_4px_0_var(--ink)] transition group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0_var(--ink)]"
                      style={{ background: mode.accent, marginTop: "1.25rem" }}
                    >
                      {mode.cta}
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PixModal open={showPix} onClose={() => setShowPix(false)} />
      <HomeRankingsModal open={showRanks} onClose={() => setShowRanks(false)} />
      <LegalNotice onSupport={() => setShowPix(true)} />
    </div>
  );
}
