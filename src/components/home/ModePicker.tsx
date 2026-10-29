"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GAME_MODES } from "@/lib/modes";
import { trackModeSelect, trackRankingView, trackSupportOpen } from "@/lib/analytics";
import { LegalNotice } from "@/components/game/LegalNotice";
import { PixModal } from "@/components/game/PixModal";
import { HomePlayerBar } from "@/components/home/HomePlayerBar";
import { HomeRankingsModal } from "@/components/home/HomeRankingsModal";
import { Button } from "@/components/ui/Button";

export function ModePicker() {
  const [showPix, setShowPix] = useState(false);
  const [showRanks, setShowRanks] = useState(false);

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[var(--brand)]/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <div className="map-grid absolute inset-0 opacity-[0.06]" />
      </div>

      <HomePlayerBar />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6">
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

          <div className="relative px-5 py-8 sm:px-10 sm:py-12">
            <div className="animate-rise grid grid-cols-[minmax(0,1fr)_5.75rem] items-start gap-x-3 gap-y-3 sm:grid-cols-[minmax(0,1fr)_9rem] sm:gap-x-6 sm:gap-y-4">
              <p className="col-start-1 row-start-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand)] sm:text-sm sm:tracking-[0.25em]">
                Jogo grátis · sem cadastro · ranking mundial
              </p>
              <div className="col-start-2 row-span-4 row-start-1 justify-self-end self-start sm:row-span-5">
                <div className="animate-float relative h-[5.75rem] w-[5.75rem] overflow-hidden rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--sand)] shadow-[5px_5px_0_var(--ink)] sm:h-36 sm:w-36 sm:shadow-[6px_6px_0_var(--ink)]">
                  <Image
                    src="/game/parcas/_flavinho.webp"
                    alt="Flavinho"
                    fill
                    priority
                    unoptimized
                    className="object-contain object-bottom p-1"
                    sizes="144px"
                  />
                </div>
              </div>
              <h1 className="col-start-1 row-start-2 font-[family-name:var(--font-display)] text-[2.1rem] leading-[0.95] text-[var(--ink)] sm:text-5xl md:text-6xl">
                Cadê Flavinho?
              </h1>
              <p className="col-start-1 row-start-3 font-[family-name:var(--font-display)] text-xl leading-tight text-[var(--ink)]/80 sm:text-2xl md:text-3xl">
                Sumiu de novo. Vai achar?
              </p>
              <p className="col-start-1 row-start-4 max-w-md text-sm leading-snug text-[var(--muted)] sm:col-span-1 sm:text-lg">
                Caça na multidão, no Street View ou no banco do carona. Três
                modos, placar mundial — clica e joga agora.
              </p>
              <div className="col-span-2 row-start-5 sm:col-span-1 sm:row-start-5">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    trackRankingView("all", "home");
                    setShowRanks(true);
                  }}
                >
                  Ver rankings
                </Button>
              </div>
            </div>

            <div className="relative mt-10 grid items-stretch gap-4 sm:grid-cols-3">
              {GAME_MODES.map((mode, i) => (
                <Link
                  key={mode.id}
                  href={mode.path}
                  onClick={() => trackModeSelect(mode.id)}
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
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PixModal open={showPix} onClose={() => setShowPix(false)} />
      <HomeRankingsModal open={showRanks} onClose={() => setShowRanks(false)} />
      <LegalNotice
        onSupport={() => {
          trackSupportOpen("home");
          setShowPix(true);
        }}
      />
    </div>
  );
}
