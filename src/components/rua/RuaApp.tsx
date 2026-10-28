"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LegalNotice } from "@/components/game/LegalNotice";
import { PixModal } from "@/components/game/PixModal";
import { Leaderboard } from "@/components/game/Leaderboard";
import { RankModal } from "@/components/game/RankModal";
import { ShareBar } from "@/components/game/ShareBar";
import {
  dealRuaRun,
  distanceKm,
  formatDistance,
  ruaScoreForDistance,
  type CityGeo,
} from "@/lib/city-geo";
import { getMode } from "@/lib/modes";
import {
  getModeBest,
  readModeBoard,
  submitModeScore,
} from "@/lib/mode-ranking";
import {
  getPlayerName,
  sanitizeName,
  setPlayerName,
  type RankEntry,
} from "@/lib/ranking";
import { formatClock } from "@/lib/scoring";
import type { Difficulty } from "@/lib/types";
import { cityCatalogSize } from "@/lib/deck";
import { buildInviteText } from "@/lib/share";
import { hasGoogleMapsKey } from "@/lib/google-maps";
import { ModeTheme } from "@/components/home/ModeTheme";
import { useScrollTop } from "@/hooks/useScrollTop";

const GuessMap = dynamic(
  () => import("@/components/rua/GuessMap").then((m) => m.GuessMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-white sm:h-[420px]">
        <p className="text-sm font-semibold text-[var(--muted)]">
          Carregando mapa…
        </p>
      </div>
    ),
  },
);

const StreetView = dynamic(
  () => import("@/components/rua/StreetView").then((m) => m.StreetView),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-[4/3] items-center justify-center bg-[var(--sand)]">
        <p className="text-sm font-semibold text-[var(--muted)]">
          Abrindo a rua…
        </p>
      </div>
    ),
  },
);

type Phase = "landing" | "guess" | "result";

type Pin = { lat: number; lng: number };

const modeMeta = getMode("rua");

/** Acertou se ficou perto o bastante pra pontuar. */
function isHit(pts: number) {
  return pts > 0;
}

export function RuaApp({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>("landing");
  useScrollTop([phase]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [city, setCity] = useState<CityGeo | null>(null);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState<Pin | null>(null);
  const [lastKm, setLastKm] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(0);
  const [board, setBoard] = useState<RankEntry[]>([]);
  const [playerName, setPlayerNameState] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [showPix, setShowPix] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const [won, setWon] = useState(false);

  const citiesTotal = cityCatalogSize(difficulty);

  useEffect(() => {
    setBest(getModeBest("rua"));
    setPlayerNameState(getPlayerName());
    setBoard(readModeBoard("rua"));
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function startGame(d: Difficulty) {
    const dealt = dealRuaRun(d, 1);
    setDifficulty(d);
    setCity(dealt[0] ?? null);
    setScore(0);
    setGuess(null);
    setLastKm(0);
    setElapsed(0);
    setRunning(true);
    setNeedsName(false);
    setMyRank(null);
    setWon(false);
    setPhase("guess");
  }

  function finish(finalScore: number, hit: boolean) {
    setRunning(false);
    setWon(hit);
    setPhase("result");
    if (!hit || finalScore <= 0) return;
    const name = getPlayerName();
    if (!name) {
      setNeedsName(true);
      return;
    }
    const res = submitModeScore("rua", name, finalScore);
    setBoard(res.entries);
    setMyRank(res.rank);
    setBest(getModeBest("rua"));
  }

  function confirmGuess() {
    if (!city || !guess) return;
    const km = distanceKm(guess, { lat: city.lat, lng: city.lng });
    const pts = ruaScoreForDistance(km, difficulty);
    setLastKm(km);
    setScore(pts);
    finish(pts, isHit(pts));
  }

  function saveNameAndRank() {
    const clean = setPlayerName(nameDraft);
    if (!clean) return;
    setPlayerNameState(clean);
    setNeedsName(false);
    const res = submitModeScore("rua", clean, score);
    setBoard(res.entries);
    setMyRank(res.rank);
    setBest(getModeBest("rua"));
  }

  const shareText = useMemo(() => {
    if (phase === "result" && city) {
      return `Rua da Amargura · ${won ? "achei" : "errei"} · ${formatDistance(lastKm)} · ${score.toLocaleString("pt-BR")} pts\n${buildInviteText().split("\n").pop()}`;
    }
    return `Rua da Amargura no Cadê Flavinho — uma rua, um chute.\n${buildInviteText().split("\n").pop()}`;
  }, [phase, score, lastKm, won, city]);

  return (
    <ModeTheme mode="rua">
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <button
            type="button"
            className="font-[family-name:var(--font-display)] text-xl tracking-wide text-[var(--ink)] sm:text-2xl"
            onClick={onBack}
          >
            Cadê Flavinho?
          </button>
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            {modeMeta.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {phase === "guess" && (
            <div className="hidden items-center gap-2 rounded-full border border-[var(--ink)]/15 bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink)] sm:flex">
              <span>1 chute</span>
              <span className="text-[var(--muted)]">·</span>
              <span className="tabular-nums">{formatClock(elapsed)}</span>
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={onBack}>
            Modos
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setBoard(readModeBoard("rua"));
              setShowRank(true);
            }}
          >
            Ranking
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
        {phase === "landing" && (
          <div className="space-y-6">
            <section className="animate-rise rounded-[2rem] border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6 shadow-[10px_10px_0_var(--ink)] sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--brand)]">
                {modeMeta.badge} · uma tentativa
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
                {modeMeta.name}
              </h1>
              <p className="mt-3 max-w-xl text-lg text-[var(--muted)]">
                {modeMeta.blurb}
              </p>
              {!hasGoogleMapsKey() && (
                <p className="mt-2 max-w-xl rounded-xl border-2 border-[var(--alert)]/40 bg-[#fde8e4] px-3 py-2 text-sm text-[var(--ink)]">
                  Street View precisa da chave Google no servidor (já configurada
                  no deploy se você ativou as APIs no Cloud).
                </p>
              )}

              <DifficultyPicker
                difficulty={difficulty}
                citiesTotal={citiesTotal}
                onChange={setDifficulty}
              />

              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => startGame(difficulty)}>
                  Abrir a rua
                </Button>
                <Button variant="secondary" onClick={onBack}>
                  Voltar aos modos
                </Button>
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">
                {best > 0
                  ? `Seu recorde neste modo: ${best.toLocaleString("pt-BR")} pts`
                  : "Um Street View. Um pin no mapa. Acertou ou errou — acabou."}
              </p>
              <div className="mt-5">
                <ShareBar text={shareText} label="Chama a galera" compact />
              </div>
            </section>
            <Leaderboard
              entries={board}
              global={false}
              highlight={playerName}
              myRank={myRank}
              myScore={best > 0 ? best : null}
              shareText={shareText}
              onViewFull={() => setShowRank(true)}
            />
          </div>
        )}

        {phase === "guess" && city && (
          <section className="animate-rise mx-auto flex max-w-3xl flex-col gap-5">
            <div className="overflow-hidden rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[6px_6px_0_var(--ink)]">
              <StreetView
                lat={city.lat}
                lng={city.lng}
                seed={`${city.id}-${difficulty}`}
                fallbackPhoto={city.photo}
                className="!aspect-[16/10] sm:!aspect-[2/1]"
              />
              <div className="border-t-2 border-[var(--ink)]/10 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                  Única tentativa
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                  Onde o Flavinho sumiu?
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Anda na rua (setas ou clique no chão), olha em volta, marca no
                  mapa e confirma. Um chute só.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <GuessMap guess={guess} locked={false} onGuess={setGuess} />
              <div className="flex flex-wrap items-center gap-2">
                <Button size="lg" disabled={!guess} onClick={confirmGuess}>
                  Confirmar chute
                </Button>
                <p className="text-sm text-[var(--muted)]">
                  {guess ? "Pin plantado. Confirma?" : "Toque no mapa pra chutar."}
                </p>
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                Street View © Google · mapa de chute © OpenStreetMap
              </p>
            </div>
          </section>
        )}

        {phase === "result" && city && (
          <section className="animate-rise mx-auto max-w-2xl space-y-5">
            <div className="overflow-hidden rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[8px_8px_0_var(--ink)]">
              <GuessMap
                guess={guess}
                answer={{ lat: city.lat, lng: city.lng }}
                locked
                onGuess={() => {}}
              />
            </div>
            <div className="rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6 text-center shadow-[8px_8px_0_var(--ink)]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
                {won ? "Quase na porta" : "Se perdeu"}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
                {won ? "Acertou a rua!" : "Errou o paradeiro"}
              </h2>
              <p className="mt-2 text-[var(--muted)]">
                Era <strong className="text-[var(--ink)]">{city.name}</strong> ·{" "}
                {city.country}. Você ficou a {formatDistance(lastKm)}.
              </p>
              <p className="mt-2 font-semibold text-[var(--ink)]">
                {score.toLocaleString("pt-BR")} pts · {formatClock(elapsed)}
                {myRank ? ` · #${myRank} neste modo` : ""}
              </p>
              {needsName && won && (
                <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row">
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(sanitizeName(e.target.value))}
                    placeholder="Seu apelido no ranking"
                    maxLength={16}
                    className="min-w-0 flex-1 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2.5 font-semibold text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                  />
                  <Button onClick={saveNameAndRank}>Salvar</Button>
                </div>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button size="lg" onClick={() => startGame(difficulty)}>
                  Tentar de novo
                </Button>
                <Button variant="secondary" onClick={onBack}>
                  Trocar modo
                </Button>
              </div>
              <div className="mt-5 border-t border-[var(--ink)]/10 pt-4">
                <ShareBar
                  text={shareText}
                  label="Desafia alguém"
                  align="center"
                  compact
                />
              </div>
            </div>
          </section>
        )}
      </main>

      <PixModal open={showPix} onClose={() => setShowPix(false)} />
      <RankModal
        open={showRank}
        onClose={() => setShowRank(false)}
        entries={board}
        global={false}
        highlight={playerName || nameDraft}
        myRank={myRank}
        myScore={Math.max(score, best) > 0 ? Math.max(score, best) : null}
        shareText={shareText}
      />
      <LegalNotice onSupport={() => setShowPix(true)} />
    </ModeTheme>
  );
}

function DifficultyPicker({
  difficulty,
  citiesTotal,
  onChange,
}: {
  difficulty: Difficulty;
  citiesTotal: number;
  onChange: (d: Difficulty) => void;
}) {
  const modes: {
    id: Difficulty;
    label: string;
    hint: string;
    tone: string;
  }[] = [
    {
      id: "easy",
      label: "Fácil",
      hint: "24 cidades · mira generosa",
      tone: "bg-[#e8f6ef] border-[#1f8a5b]",
    },
    {
      id: "medium",
      label: "Médio",
      hint: "56 cidades · precisão média",
      tone: "bg-[#fff4d6] border-[#d4a017]",
    },
    {
      id: "hard",
      label: "Difícil",
      hint: "124 cidades · tem que cravar",
      tone: "bg-[#fde8e4] border-[#c2410c]",
    },
  ];

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-end justify-between gap-2">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--ink)]">
          Dificuldade
        </p>
        <p className="text-[11px] font-semibold text-[var(--muted)]">
          {citiesTotal} cidades no pool
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label="Dificuldade"
        className="grid grid-cols-3 gap-2 rounded-2xl border-2 border-dashed border-[var(--ink)]/35 bg-white/70 p-2"
      >
        {modes.map((m) => {
          const active = difficulty === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(m.id)}
              className={`rounded-xl border-2 px-2.5 py-3 text-left transition ${
                active
                  ? `${m.tone} text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] ring-2 ring-[var(--ink)]`
                  : "border-[var(--ink)]/20 bg-white/90 text-[var(--ink)] opacity-80 hover:border-[var(--ink)]/50 hover:opacity-100"
              }`}
            >
              <span className="font-[family-name:var(--font-display)] text-base">
                {m.label}
              </span>
              <div
                className={`mt-1.5 text-[10px] leading-snug sm:text-[11px] ${
                  active ? "text-[var(--ink)]/80" : "text-[var(--muted)]"
                }`}
              >
                {m.hint}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
