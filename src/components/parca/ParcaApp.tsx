"use client";

import Image from "next/image";
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
import { ParcaPortrait } from "@/components/parca/ParcaPortrait";
import {
  cluesFor,
  dealParcaRun,
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

type Phase = "landing" | "clues" | "result";

const modeMeta = getMode("parca");

export function ParcaApp({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>("landing");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [person, setPerson] = useState<ParcaPerson | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
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

  const clues = person ? cluesFor(person, difficulty) : [];

  const options = useMemo(() => {
    if (!person) return [];
    return pickParcaOptions(person, `${person.id}-${difficulty}`, 4);
  }, [person, difficulty]);

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

  function startGame(d: Difficulty) {
    const dealt = dealParcaRun(1);
    setDifficulty(d);
    setPerson(dealt[0] ?? null);
    setPickedId(null);
    setScore(0);
    setElapsed(0);
    setRunning(true);
    setNeedsName(false);
    setMyRank(null);
    setWon(false);
    setPhase("clues");
  }

  function restartToMenu() {
    setRunning(false);
    setPhase("landing");
    setPerson(null);
    setPickedId(null);
    setBoard(readModeBoard("parca"));
    setBest(getModeBest("parca"));
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
    const res = submitModeScore("parca", name, finalScore);
    setBoard(res.entries);
    setMyRank(res.rank);
    setBest(getModeBest("parca"));
  }

  function pickPerson(id: string) {
    if (!person || phase !== "clues" || pickedId) return;
    setPickedId(id);

    if (id === person.id) {
      const bonus = PARCA_HIT_BONUS[difficulty];
      setScore(bonus);
      finish(bonus, true);
      return;
    }

    setScore(0);
    finish(0, false);
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
    if (phase === "result") {
      return `Diga-me com Quem Andas… · ${won ? "descobri quem ele levou" : "errei o parça"} · ${score.toLocaleString("pt-BR")} pts\n${buildInviteText().split("\n").pop()}`;
    }
    return `Diga-me com Quem Andas… — quem o Flavinho levou na fuga?\n${buildInviteText().split("\n").pop()}`;
  }, [phase, score, won]);

  const picked = options.find((o) => o.id === pickedId) ?? null;

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
          {phase === "clues" && (
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
            <section className="animate-rise overflow-hidden rounded-[2rem] border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[10px_10px_0_var(--ink)]">
              <div className="relative aspect-[21/9] w-full border-b-[3px] border-[var(--ink)]/15 sm:aspect-[3/1]">
                <Image
                  src={modeMeta.art}
                  alt={modeMeta.artAlt}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 960px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--paper)] via-transparent to-transparent" />
              </div>
              <div className="p-6 sm:p-10">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--brand)]">
                  {modeMeta.badge} · uma tentativa
                </p>
                <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
                  {modeMeta.name}
                </h1>
                <p className="mt-3 max-w-xl text-lg text-[var(--muted)]">
                  O Flavinho{" "}
                  <strong className="text-[var(--ink)]">não fugiu sozinho</strong>
                  . No banco do carona foi embora{" "}
                  <strong className="text-[var(--ink)]">uma figura pública</strong>
                  . Lê as dicas do passageiro, escolhe{" "}
                  <strong className="text-[var(--ink)]">um nome só</strong> e
                  vê se acertou — sem segunda chance.
                </p>

                <DifficultyPicker
                  difficulty={difficulty}
                  onChange={setDifficulty}
                />

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button size="lg" onClick={() => startGame(difficulty)}>
                    Quem ele levou?
                  </Button>
                  <Button variant="secondary" onClick={onBack}>
                    Voltar aos modos
                  </Button>
                </div>
                <p className="mt-4 text-sm text-[var(--muted)]">
                  {best > 0
                    ? `Seu recorde neste modo: ${best.toLocaleString("pt-BR")} pts`
                    : "Todas as dicas abertas. Um chute. Tela final."}
                </p>
                <div className="mt-5">
                  <ShareBar text={shareText} label="Chama a galera" compact />
                </div>
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
          <section className="animate-rise grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--sand)] shadow-[4px_4px_0_var(--ink)]">
                  <Image
                    src="/game/disguises/real.webp"
                    alt="Flavinho"
                    fill
                    unoptimized
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-[3px] border-dashed border-[var(--ink)]/50 bg-[#fff4d6] shadow-[4px_4px_0_var(--ink)]">
                  <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
                    ?
                  </span>
                  <span className="px-1 text-center text-[9px] font-bold uppercase tracking-wide text-[var(--ink)]/70">
                    Parça
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
                    Passageiro misterioso
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--ink)] sm:text-3xl">
                    Quem o Flavinho levou com ele?
                  </h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Não é “onde ele está”. É{" "}
                    <strong className="text-[var(--ink)]">
                      quem entrou no carro junto
                    </strong>
                    . Um nome. Acertou ou errou.
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {clues.map((clue, i) => (
                  <li
                    key={`${person.id}-${i}`}
                    className="rounded-2xl border-[3px] border-[var(--ink)] bg-[#fff4d6] px-4 py-4 text-[var(--ink)] shadow-[5px_5px_0_var(--ink)]"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide">
                      Dica do passageiro {i + 1}/{clues.length}
                    </p>
                    <p className="mt-1 text-base font-semibold leading-snug sm:text-lg">
                      {clue}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                Quem foi o parça?
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Escolhe <strong className="text-[var(--ink)]">um</strong> destes
                nomes. Sem voltar atrás.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!!pickedId}
                    onClick={() => pickPerson(opt.id)}
                    className="rounded-xl border-2 border-[var(--ink)]/25 bg-white px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--ink)] hover:bg-[#fff4d6] hover:shadow-[3px_3px_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="font-bold text-[var(--ink)]">{opt.name}</div>
                    <div className="mt-0.5 text-xs text-[var(--muted)]">
                      {opt.blurb}
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                Uma tentativa · {formatClock(elapsed)}
              </p>
            </div>
          </section>
        )}

        {phase === "result" && person && (
          <section className="animate-rise mx-auto max-w-xl rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6 text-center shadow-[8px_8px_0_var(--ink)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
              {won ? "Parça identificado" : "Errou o passageiro"}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              {won
                ? "Era esse que ele levou!"
                : "Não foi quem ele levou"}
            </h2>

            <div className="mt-5 flex items-end justify-center gap-3 sm:gap-5">
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--sand)] shadow-[4px_4px_0_var(--ink)] sm:h-32 sm:w-32">
                <Image
                  src="/game/parcas/_flavinho.webp"
                  alt="Flavinho"
                  fill
                  unoptimized
                  className="object-contain object-bottom p-1"
                />
              </div>
              <div
                className="mb-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[#fff4d6] font-[family-name:var(--font-display)] text-xl text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] sm:mb-12"
                aria-hidden
              >
                +
              </div>
              <ParcaPortrait
                id={person.id}
                name={person.name}
                className="h-28 w-28 sm:h-32 sm:w-32"
              />
            </div>

            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              O Flavinho saiu com
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
              {person.name}
            </p>
            {person.blurb ? (
              <p className="mt-2 text-base font-semibold text-[var(--brand)]">
                {person.blurb}
              </p>
            ) : null}
            {!won && picked && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Seu chute:{" "}
                <strong className="text-[var(--ink)]">{picked.name}</strong>.
              </p>
            )}
            <p className="mt-3 font-semibold text-[var(--ink)]">
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
      hint: "Dicas bem óbvias",
      tone: "bg-[#e8f6ef] border-[#1f8a5b]",
    },
    {
      id: "medium",
      label: "Médio",
      hint: "Dicas de meio-termo",
      tone: "bg-[#fff4d6] border-[#d4a017]",
    },
    {
      id: "hard",
      label: "Difícil",
      hint: "Dicas afiadas",
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
