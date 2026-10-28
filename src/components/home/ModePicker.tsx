"use client";

import Image from "next/image";
import { GAME_MODES, type GameModeId } from "@/lib/modes";
import { LegalNotice } from "@/components/game/LegalNotice";
import { PixModal } from "@/components/game/PixModal";
import { useState } from "react";

type Props = {
  onPick: (mode: GameModeId) => void;
};

export function ModePicker({ onPick }: Props) {
  const [showPix, setShowPix] = useState(false);

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
                  Ache o Flavinho na multidão, no Street View ou descubra o
                  parça da fuga. Sem cadastro — escolhe o modo e joga.
                </p>
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

            <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
              {GAME_MODES.map((mode, i) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onPick(mode.id)}
                  className={`animate-rise group rounded-3xl border-[3px] p-5 text-left shadow-[6px_6px_0_var(--ink)] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--ink)] ${mode.tone}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/70">
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
                  <span className="mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2 text-sm font-[family-name:var(--font-display)] text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] transition group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0_var(--ink)]">
                    Entrar
                    <span aria-hidden>→</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PixModal open={showPix} onClose={() => setShowPix(false)} />
      <LegalNotice onSupport={() => setShowPix(true)} />
    </div>
  );
}
