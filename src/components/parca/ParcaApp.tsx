"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LegalNotice } from "@/components/game/LegalNotice";
import { PixModal } from "@/components/game/PixModal";
import { Leaderboard } from "@/components/game/Leaderboard";
import { RankModal } from "@/components/game/RankModal";
import { ShareBar } from "@/components/game/ShareBar";
import { getMode } from "@/lib/modes";
import {
  getModeBest,
  readModeBoard,
  submitModeScore,
} from "@/lib/mode-ranking";
import {
  cluesFor,
  dealParcaRun,
  PARCA_CLUE_PENALTY,
  PARCA_HIT_BONUS,
  pickParcaOptions,
  type ParcaPerson,
} from "@/lib/parcas";
import {
  getPlayerName,
  sanitizeName,
  setPlayerName,
  type RankEntry,
} from "@/lib/ranking";
import { formatClock } from "@/lib/scoring";
import type { Difficulty } from "@/lib/types";
import { buildInviteText } from "@/lib/share";

type Phase = "landing" | "clues" | "win" | "fail";

const modeMeta = getMode("parca");

export function ParcaApp({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>("landing");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [run, setRun] = useState<ParcaPerson[]>([]);
  const [index, setIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [tried, setTried] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState("");
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

  const person = run[index] ?? null;
  const clues = person ? cluesFor(person, difficulty) : [];

  const options = useMemo(() => {
    if (!person) return [];
    return pickParcaOptions(
      person,
      `${person.id}-${index}-${difficulty}`,
      6,
    );
  }, [person, index, difficulty]);

  useEffect(() => {
    setBest(getModeBest("parca"));
    setPlayerNameState(getPlayerName());
    setBoard(readModeBoard("parca"));
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const livesFor = (d: Difficulty) =>
    d === "easy" ? 5 : d === "medium" ? 3 : 2;

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setRun(dealParcaRun());
    setIndex(0);
    setClueIndex(0);
    setTried([]);
    setScore(0);
    setLives(livesFor(d));
    setFeedback("");
    setElapsed(0);
    setRunning(true);
    setNeedsName(false);
    setMyRank(null);
    setPhase("clues");
  }

  function restartToMenu() {
    setRunning(false);
    setPhase("landing");
    setBoard(readModeBoard("parca"));
    setBest(getModeBest("parca"));
  }

  function pickPerson(id: string) {
    if (!person || tried.includes(id)) return;

    if (id === person.id) {
      const openClues = clueIndex + 1;
      const bonus = Math.max(
        200,
        PARCA_HIT_BONUS[difficulty] - (openClues - 1) * PARCA_CLUE_PENALTY,
      );
      const nextScore = score + bonus;
      setScore(nextScore);
      setFeedback(`Era ${person.name}! +${bonus.toLocaleString("pt-BR")} pts`);

      if (index + 1 >= run.length) {
        finishRun(nextScore);
        return;
      }

      window.setTimeout(() => {
        setIndex((i) => i + 1);
        setClueIndex(0);
        setTried([]);
        setFeedback("");
      }, 700);
      return;
    }

    const nextTried = [...tried, id];
    setTried(nextTried);
    const nextLives = lives - 1;
    setLives(nextLives);

    if (clueIndex + 1 < clues.length) {
      setClueIndex((c) => c + 1);
      setFeedback("Não era esse. Nova dica liberada.");
    } else {
      setFeedback("Não era esse. Sem dicas novas.");
    }

    if (nextLives <= 0) {
      setRunning(false);
      setPhase("fail");
    }
  }

  function finishRun(finalScore: number) {
    setRunning(false);
    setPhase("win");
    const name = getPlayerName();
    if (!name) {
      setNeedsName(true);
      return;
    }
    const res = submitModeScore("parca", name, finalScore);
    setBoard(res.entries);
    setMyRank(res.rank);
    setBest(getModeBest("parca"));
  }

  function saveNameAndRank() {
    const clean = setPlayerName(nameDraft);
    if (!clean) return;
    setPlayerNameState(clean);
    setNeedsName(false);
    const res = submitModeScore("parca", clean, score);
    setBoard(res.entries);
    setMyRank(res.rank);
    setBest(getModeBest("parca"));
  }

  const shareText = useMemo(() => {
    if (phase === "win") {
      return `Diga-me com Quem Andas… · ${score.toLocaleString("pt-BR")} pts\nDescobre o parça do Flavinho!\n${buildInviteText().split("\n").pop()}`;
    }
    return `Diga-me com Quem Andas… no Cadê Flavinho — quem era o parça da fuga?\n${buildInviteText().split("\n").pop()}`;
  }, [phase, score]);

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
                <span>
                  {lives} vida{lives === 1 ? "" : "s"}
                </span>
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
              setBoard(readModeBoard("parca"));
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
                {modeMeta.badge} · 150 parças
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
                {modeMeta.name}
              </h1>
              <p className="mt-3 max-w-xl text-lg text-[var(--muted)]">
                {modeMeta.blurb} Até 3 dicas por rodada — quanto menos dica,
                mais ponto.
              </p>

              <DifficultyPicker
                difficulty={difficulty}
                onChange={setDifficulty}
              />

              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => startGame(difficulty)}>
                  Quem era o parça?
                </Button>
                <Button variant="secondary" onClick={onBack}>
                  Voltar aos modos
                </Button>
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">
                {best > 0
                  ? `Seu recorde neste modo: ${best.toLocaleString("pt-BR")} pts`
                  : "Errar libera a próxima dica e gasta uma vida."}
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

        {phase === "clues" && person && (
          <section className="animate-rise grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
                    Parça {index + 1}/{run.length}
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] sm:text-3xl">
                    Com quem ele andava?
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Lê as dicas e marca o nome. Errou? Abre a próxima.
                  </p>
                </div>
                <p className="text-[11px] font-semibold text-[var(--muted)]">
                  {lives} vida{lives === 1 ? "" : "s"} ·{" "}
                  {score.toLocaleString("pt-BR")} pts
                </p>
              </div>

              <ul className="mt-5 space-y-3">
                {clues.map((clue, i) => {
                  const unlocked = i <= clueIndex;
                  return (
                    <li
                      key={`${person.id}-${i}`}
                      className={`rounded-2xl border-[3px] px-4 py-4 ${
                        unlocked
                          ? "border-[var(--ink)] bg-[#fff4d6] text-[var(--ink)] shadow-[5px_5px_0_var(--ink)]"
                          : "border-dashed border-[var(--ink)]/30 bg-white/70 text-[var(--muted)]"
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-wide">
                        {unlocked
                          ? `Dica ${i + 1}`
                          : `Dica ${i + 1} bloqueada`}
                      </p>
                      <p
                        className={`mt-1 leading-snug ${
                          unlocked
                            ? "text-base font-semibold sm:text-lg"
                            : "text-sm font-medium"
                        }`}
                      >
                        {unlocked
                          ? clue
                          : "Erra um nome pra liberar."}
                      </p>
                    </li>
                  );
                })}
              </ul>
              {feedback && (
                <p className="mt-4 rounded-xl border-2 border-[var(--ink)]/20 bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)]">
                  {feedback}
                </p>
              )}
            </div>

            <div className="rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                Marque o parça
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Seis nomes. Um certo.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {options.map((opt) => {
                  const dead = tried.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={dead}
                      onClick={() => pickPerson(opt.id)}
                      className={`rounded-xl border-2 px-3 py-3 text-left transition ${
                        dead
                          ? "cursor-not-allowed border-[var(--ink)]/20 bg-[#f3f4f6] opacity-60"
                          : "border-[var(--ink)]/25 bg-white hover:-translate-y-0.5 hover:border-[var(--ink)] hover:bg-[#fff4d6] hover:shadow-[3px_3px_0_var(--ink)]"
                      }`}
                    >
                      <div className="font-bold text-[var(--ink)]">
                        {opt.name}
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--muted)]">
                        {dead ? "Descartado." : opt.blurb}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {phase === "win" && (
          <section className="animate-rise mx-auto max-w-xl rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6 text-center shadow-[8px_8px_0_var(--ink)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
              Fuga desvendada
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Você sabe com quem ele anda
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
              Perdeu o rastro do parça
            </h2>
            <p className="mt-2 text-[var(--muted)]">
              {person
                ? `Era ${person.name}. `
                : ""}
              Pontuação: {score.toLocaleString("pt-BR")} ·{" "}
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
  onChange,
}: {
  difficulty: Difficulty;
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
      hint: "Dicas bem óbvias · 5 vidas",
      tone: "bg-[#e8f6ef] border-[#1f8a5b]",
    },
    {
      id: "medium",
      label: "Médio",
      hint: "Dicas de meio-termo · 3 vidas",
      tone: "bg-[#fff4d6] border-[#d4a017]",
    },
    {
      id: "hard",
      label: "Difícil",
      hint: "Dicas afiadas · 2 vidas",
      tone: "bg-[#fde8e4] border-[#c2410c]",
    },
  ];

  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--ink)]">
        Dificuldade das dicas
      </p>
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
