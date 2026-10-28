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

const GuessMap = dynamic(
  () => import("@/components/rua/GuessMap").then((m) => m.GuessMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-white sm:h-[360px]">
        <p className="text-sm font-semibold text-[var(--muted)]">
          Carregando mapa…
        </p>
      </div>
    ),
  },
);

type Phase = "landing" | "guess" | "reveal" | "win" | "fail";

type Pin = { lat: number; lng: number };

const modeMeta = getMode("rua");

export function RuaApp({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>("landing");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [run, setRun] = useState<CityGeo[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [guess, setGuess] = useState<Pin | null>(null);
  const [lastKm, setLastKm] = useState(0);
  const [lastPts, setLastPts] = useState(0);
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

  const city = run[index] ?? null;
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

  const livesFor = (d: Difficulty) =>
    d === "easy" ? 5 : d === "medium" ? 3 : 2;

  function startGame(d: Difficulty) {
    const dealt = dealRuaRun(d);
    setDifficulty(d);
    setRun(dealt);
    setIndex(0);
    setScore(0);
    setLives(livesFor(d));
    setGuess(null);
    setLastKm(0);
    setLastPts(0);
    setElapsed(0);
    setRunning(true);
    setNeedsName(false);
    setMyRank(null);
    setPhase("guess");
  }

  function restartToMenu() {
    setRunning(false);
    setPhase("landing");
    setGuess(null);
    setBoard(readModeBoard("rua"));
    setBest(getModeBest("rua"));
  }

  function confirmGuess() {
    if (!city || !guess) return;
    const km = distanceKm(guess, { lat: city.lat, lng: city.lng });
    const pts = ruaScoreForDistance(km, difficulty);
    setLastKm(km);
    setLastPts(pts);
    setScore((s) => s + pts);
    if (pts <= 0) {
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setRunning(false);
        setPhase("fail");
        return;
      }
    }
    setPhase("reveal");
  }

  function advance() {
    if (index + 1 >= run.length) {
      finishRun(score);
      return;
    }
    setIndex((i) => i + 1);
    setGuess(null);
    setPhase("guess");
  }

  function finishRun(finalScore: number) {
    setRunning(false);
    setPhase("win");
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
    if (phase === "win") {
      return `Rua da Amargura · ${score.toLocaleString("pt-BR")} pts · ${formatClock(elapsed)}\nAcha a cidade pela foto?\n${buildInviteText().split("\n").pop()}`;
    }
    return `Rua da Amargura no Cadê Flavinho — marca no mapa onde ele sumiu.\n${buildInviteText().split("\n").pop()}`;
  }, [phase, score, elapsed]);

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[var(--brand)]/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <div className="map-grid absolute inset-0 opacity-[0.06]" />
      </div>

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
          {phase !== "landing" && (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-[var(--ink)]/15 bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink)] sm:flex">
                <span>
                  Ep {Math.min(index + 1, run.length)}/{run.length || 6}
                </span>
                <span className="text-[var(--muted)]">·</span>
                <span className="tabular-nums text-[var(--brand)]">
                  {score.toLocaleString("pt-BR")} pts
                </span>
                <span className="text-[var(--muted)]">·</span>
                <span>{lives} vida{lives === 1 ? "" : "s"}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={restartToMenu}>
                Recomeçar
              </Button>
            </>
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
                {modeMeta.badge} · mapa grátis
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
                {modeMeta.name}
              </h1>
              <p className="mt-3 max-w-xl text-lg text-[var(--muted)]">
                {modeMeta.blurb} Mesmas cidades do modo clássico. Sem cadastro —
                OpenStreetMap + foto Wikimedia.
              </p>

              <DifficultyPicker
                difficulty={difficulty}
                citiesTotal={citiesTotal}
                onChange={setDifficulty}
              />

              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => startGame(difficulty)}>
                  Abrir o mapa
                </Button>
                <Button variant="secondary" onClick={onBack}>
                  Voltar aos modos
                </Button>
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">
                {best > 0
                  ? `Seu recorde neste modo: ${best.toLocaleString("pt-BR")} pts`
                  : "Toque no mapa pra marcar o chute. Perto = pontos. Longe demais = perde vida."}
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

        {(phase === "guess" || phase === "reveal") && city && (
          <section className="animate-rise grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[6px_6px_0_var(--ink)]">
                <div className="relative aspect-[4/3] w-full bg-[var(--sand)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={city.photo}
                    alt={
                      phase === "reveal"
                        ? `Foto em ${city.name}`
                        : "Foto misteriosa da cidade"
                    }
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="border-t-2 border-[var(--ink)]/10 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                    Episódio {index + 1}/{run.length}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                    {phase === "reveal"
                      ? `${city.name} · ${city.country}`
                      : "Onde fica essa rua?"}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {phase === "reveal"
                      ? `${formatDistance(lastKm)} do alvo · +${lastPts.toLocaleString("pt-BR")} pts`
                      : "Olha a foto e marca no mapa. Pode arrastar e dar zoom."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <GuessMap
                guess={guess}
                answer={
                  phase === "reveal"
                    ? { lat: city.lat, lng: city.lng }
                    : null
                }
                locked={phase === "reveal"}
                onGuess={setGuess}
              />
              <div className="flex flex-wrap items-center gap-2">
                {phase === "guess" ? (
                  <>
                    <Button
                      size="lg"
                      disabled={!guess}
                      onClick={confirmGuess}
                    >
                      Confirmar chute
                    </Button>
                    <p className="text-sm text-[var(--muted)]">
                      {guess
                        ? "Pin plantado. Confirma?"
                        : "Toque no mapa pra chutar."}
                    </p>
                  </>
                ) : (
                  <Button size="lg" onClick={advance}>
                    {index + 1 >= run.length
                      ? "Ver placar"
                      : "Próxima foto"}
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                Mapa © OpenStreetMap · foto Wikimedia (uso local / MVP)
              </p>
            </div>
          </section>
        )}

        {phase === "win" && (
          <section className="animate-rise mx-auto max-w-xl rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6 text-center shadow-[8px_8px_0_var(--ink)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
              Rota completa
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Achou as ruas
            </h2>
            <p className="mt-2 text-[var(--muted)]">
              {score.toLocaleString("pt-BR")} pts · {formatClock(elapsed)}
              {myRank ? ` · #${myRank} neste modo` : ""}
            </p>
            {needsName && (
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
                Jogar de novo
              </Button>
              <Button variant="secondary" onClick={restartToMenu}>
                Menu do modo
              </Button>
              <Button variant="ghost" onClick={onBack}>
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
            <div className="mt-6">
              <Leaderboard
                entries={board}
                global={false}
                highlight={playerName || nameDraft}
                myRank={myRank}
                myScore={score}
                compact
                shareText={shareText}
                onViewFull={() => setShowRank(true)}
              />
            </div>
          </section>
        )}

        {phase === "fail" && (
          <section className="animate-rise mx-auto max-w-xl rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6 text-center shadow-[8px_8px_0_var(--ink)]">
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Se perdeu na rua
            </h2>
            <p className="mt-2 text-[var(--muted)]">
              As vidas acabaram. Pontuação: {score.toLocaleString("pt-BR")} ·{" "}
              {formatClock(elapsed)}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => startGame(difficulty)}>
                Tentar de novo
              </Button>
              <Button variant="secondary" onClick={restartToMenu}>
                Menu
              </Button>
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
    </div>
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
      hint: "24 cidades · mira mais generosa",
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
