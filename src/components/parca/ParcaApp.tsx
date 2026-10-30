"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LegalNotice } from "@/components/game/LegalNotice";
import { PixModal } from "@/components/game/PixModal";
import { Leaderboard } from "@/components/game/Leaderboard";
import { RankModal } from "@/components/game/RankModal";
import { ShareBar } from "@/components/game/ShareBar";
import { getMode } from "@/lib/modes";
import {
  trackGameFinish,
  trackGameStart,
  trackNamePrompt,
  trackNameSubmit,
  trackRankingView,
  trackSupportOpen,
} from "@/lib/analytics";
import {
  fetchModeLeaderboard,
  getModeBest,
} from "@/lib/mode-ranking";
import {
  ContaNickNeeded,
  PlayerNameForm,
  PlayerNameLanding,
} from "@/components/game/PlayerNameForm";
import { useAuthOptional } from "@/components/auth/AuthProvider";
import { ResultShell } from "@/components/game/ResultShell";
import { ModeTheme } from "@/components/home/ModeTheme";
import { ParcaPortrait } from "@/components/parca/ParcaPortrait";
import { useScrollTop } from "@/hooks/useScrollTop";
import {
  cluesFor,
  dealParcaRun,
  PARCA_HIT_BONUS,
  pickParcaOptions,
  type ParcaPerson,
} from "@/lib/parcas";
import {
  claimNickname,
  getPlayerName,
  sanitizeName,
  type RankEntry,
} from "@/lib/ranking";
import { formatClock } from "@/lib/scoring";
import type { Difficulty } from "@/lib/types";
import { buildInviteText } from "@/lib/share";
import { useRankSubmit } from "@/lib/use-rank-submit";

type Phase = "landing" | "clues" | "result";

const modeMeta = getMode("parca");

export function ParcaApp({ onBack }: { onBack: () => void }) {
  const rankSubmit = useRankSubmit();
  const auth = useAuthOptional();
  const [phase, setPhase] = useState<Phase>("landing");
  useScrollTop([phase]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [person, setPerson] = useState<ParcaPerson | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const pickedLockRef = useRef(false);
  const pendingPublishRef = useRef(false);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(0);
  const [board, setBoard] = useState<RankEntry[]>([]);
  const [boardGlobal, setBoardGlobal] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [playerName, setPlayerNameState] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [nameFeedback, setNameFeedback] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [showPix, setShowPix] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const [won, setWon] = useState(false);
  const [savingRank, setSavingRank] = useState(false);

  const clues = person ? cluesFor(person, difficulty) : [];

  const options = useMemo(() => {
    if (!person) return [];
    return pickParcaOptions(person, `${person.id}-${difficulty}`, 4);
  }, [person, difficulty]);

  async function refreshBoard() {
    // Preview na página: sempre Anônimos. Conta fica no modal de ranking.
    const who = getPlayerName();
    const res = await fetchModeLeaderboard("parca", who, "anon");
    setBoard(res.entries);
    setBoardGlobal(res.global);
    setBoardError(res.error || null);
    if (res.myRank && res.myRank > 0) setMyRank(res.myRank);
    if (typeof res.myScore === "number" && res.myScore > 0) {
      setBest((b) => Math.max(b, res.myScore!));
    }
  }

  useEffect(() => {
    setBest(getModeBest("parca"));
    void refreshBoard();
  }, []);

  useEffect(() => {
    const name = rankSubmit.playerName || getPlayerName();
    setPlayerNameState(name);
    if (name) setNameDraft(name);
  }, [rankSubmit.playerName]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function openRank(source: string) {
    trackRankingView("parca", source);
    setShowRank(true);
  }

  function startGame(d: Difficulty) {
    const dealt = dealParcaRun(1);
    setDifficulty(d);
    setPerson(dealt[0] ?? null);
    setPickedId(null);
    pickedLockRef.current = false;
    setScore(0);
    setElapsed(0);
    setRunning(true);
    setNeedsName(false);
    setNameFeedback("");
    setMyRank(null);
    setWon(false);
    setPhase("clues");
    trackGameStart("parca", d);
  }

  async function publishScore(
    total: number,
    name: string,
    opts?: { isNewName?: boolean },
  ) {
    setSavingRank(true);
    try {
      const result = await rankSubmit.submit("parca", total, {
        isNewName: opts?.isNewName,
        name,
      });
      if (result.entries.length > 0) {
        setBoard(result.entries);
        setBoardGlobal(result.global);
      } else if (result.global) {
        setBoardGlobal(true);
        void refreshBoard();
      } else {
        setBoardGlobal(false);
      }
      setBoardError(result.error || null);
      setMyRank(result.rank > 0 ? result.rank : null);
      if (typeof result.bestScore === "number" && result.bestScore > 0) {
        setBest((b) => Math.max(b, result.bestScore!));
      }
      if (result.code === "name_taken") {
        setNameFeedback(
          result.suggestLogin
            ? "Esse apelido anônimo já existe. Escolhe outro ou entra com Google (placar Conta)."
            : result.ownerScore
              ? `Não deu pra gravar: esse apelido já é de outra pessoa (${result.ownerScore.toLocaleString("pt-BR")} pts). Troca o nick na home.`
              : "Não deu pra gravar: esse apelido já é de outra pessoa. Troca o nick na home.",
        );
        return false;
      }
      return !result.error;
    } finally {
      setSavingRank(false);
    }
  }

  async function finish(finalScore: number, hit: boolean) {
    setRunning(false);
    setWon(hit);
    setPhase("result");
    trackGameFinish("parca", {
      difficulty,
      won: hit,
      score: finalScore,
      elapsedSec: elapsed,
    });
    if (!hit || finalScore <= 0) return;
    if (rankSubmit.isRegistered) {
      await publishScore(finalScore, rankSubmit.playerName);
      return;
    }
    if (rankSubmit.needsRegNick) {
      setNeedsName(true);
      pendingPublishRef.current = true;
      trackNamePrompt("parca");
      auth?.openAccount(nameDraft || getPlayerName());
      return;
    }
    const name = getPlayerName();
    if (!name) {
      setNeedsName(true);
      trackNamePrompt("parca");
      return;
    }
    await publishScore(finalScore, name);
  }

  useEffect(() => {
    if (!needsName || !rankSubmit.isRegistered || !pendingPublishRef.current) {
      return;
    }
    if (!won || score <= 0) return;
    pendingPublishRef.current = false;
    void (async () => {
      const ok = await publishScore(score, rankSubmit.playerName, {
        isNewName: true,
      });
      trackNameSubmit("parca", { success: ok });
      if (ok) {
        setNeedsName(false);
        setNameFeedback("");
        setPlayerNameState(rankSubmit.playerName);
      }
    })();
  }, [needsName, rankSubmit.isRegistered, rankSubmit.playerName, won, score]);

  function pickPerson(id: string) {
    if (!person || phase !== "clues" || pickedId || pickedLockRef.current) {
      return;
    }
    pickedLockRef.current = true;
    setPickedId(id);

    if (id === person.id) {
      const bonus = PARCA_HIT_BONUS[difficulty];
      setScore(bonus);
      void finish(bonus, true);
      return;
    }

    setScore(0);
    void finish(0, false);
  }

  async function saveLandingName() {
    if (auth?.user || rankSubmit.isRegistered || auth?.regNick) {
      if (rankSubmit.isRegistered || auth?.regNick) return;
      auth?.openAccount(nameDraft || getPlayerName());
      return;
    }
    setSavingRank(true);
    try {
      const claimed = await claimNickname(nameDraft, board);
      if (!claimed.ok) {
        setNameFeedback(claimed.error);
        if (claimed.useConta || claimed.suggestLogin) {
          auth?.openAccount(claimed.takenName || nameDraft);
        }
        return;
      }
      setPlayerNameState(claimed.name);
      setNameFeedback("");
      trackNameSubmit("parca", { success: true });
    } finally {
      setSavingRank(false);
    }
  }

  async function saveNameAndRank() {
    if (auth?.user) {
      if (rankSubmit.isRegistered) {
        const ok = await publishScore(score, rankSubmit.playerName);
        trackNameSubmit("parca", { success: ok });
        if (ok) {
          setNeedsName(false);
          setNameFeedback("");
        }
        return;
      }
      pendingPublishRef.current = true;
      auth.openAccount(nameDraft || getPlayerName());
      return;
    }
    const alreadyMine =
      getPlayerName().toLowerCase() === sanitizeName(nameDraft).toLowerCase();
    const claimed = await claimNickname(nameDraft, board);
    if (!claimed.ok) {
      setNameFeedback(claimed.error);
      return;
    }
    setPlayerNameState(claimed.name);
    const ok = await publishScore(score, claimed.name, {
      isNewName: !alreadyMine,
    });
    trackNameSubmit("parca", { success: ok });
    if (ok) {
      setNeedsName(false);
      setNameFeedback("");
    }
  }

  const shareText = useMemo(() => {
    if (phase === "result") {
      return `Diga-me com Quem Andas… · ${won ? "descobri quem ele levou" : "errei o parça"} · ${score.toLocaleString("pt-BR")} pts\n${buildInviteText("parca").split("\n").pop()}`;
    }
    return `Diga-me com Quem Andas… — quem o Flavinho levou na fuga?\n${buildInviteText("parca").split("\n").pop()}`;
  }, [phase, score, won]);

  const picked = options.find((o) => o.id === pickedId) ?? null;

  return (
    <ModeTheme mode="parca">
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
            onClick={() => openRank("header")}
          >
            Ranking
          </Button>        </div>
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

                <PlayerNameLanding
                  playerName={playerName}
                  draft={nameDraft}
                  onDraftChange={setNameDraft}
                  onSave={() => void saveLandingName()}
                  onPlayAnonymous={() => startGame(difficulty)}
                  busy={savingRank}
                  error={nameFeedback}
                />

                <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => startGame(difficulty)}
                  >
                    {modeMeta.playCta}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={onBack}
                  >
                    Voltar aos modos
                  </Button>
                </div>
                <p className="mt-4 text-sm text-[var(--muted)]">
                  {best > 0
                    ? `Seu recorde neste modo: ${best.toLocaleString("pt-BR")} pts`
                    : playerName
                      ? "Todas as dicas abertas. Um chute. Tela final."
                      : "Pode jogar sem apelido — mas pra subir no ranking, entra no placar acima."}
                </p>
                <div className="mt-5">
                  <ShareBar
                    text={shareText}
                    label="Chama a galera"
                    compact
                    mode="parca"
                    source="landing"
                  />
                </div>
              </div>
            </section>
            <Leaderboard
              entries={board}
              global={boardGlobal}
              highlight={playerName}
              myRank={myRank}
              myScore={best > 0 ? best : null}
              error={boardError}
              shareText={shareText}
              shareMode="parca"
              onViewFull={() => openRank("landing_board")}
            />
          </div>
        )}

        {phase === "clues" && person && (
          <section className="animate-rise mx-auto flex max-w-3xl flex-col gap-5">
            <div className="rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                <div className="flex shrink-0 items-end justify-center gap-3">
                  <div className="relative h-24 w-20 overflow-hidden rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--sand)] shadow-[4px_4px_0_var(--ink)] sm:h-20 sm:w-16">
                    <Image
                      src="/game/disguises/real.webp"
                      alt="Flavinho"
                      fill
                      unoptimized
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex h-24 w-20 flex-col items-center justify-center rounded-2xl border-[3px] border-dashed border-[var(--ink)]/50 bg-[#fff4d6] shadow-[4px_4px_0_var(--ink)] sm:h-20 sm:w-16">
                    <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
                      ?
                    </span>
                    <span className="px-1 text-center text-[9px] font-bold uppercase tracking-wide text-[var(--ink)]/70">
                      Parça
                    </span>
                  </div>
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
          <ResultShell
            won={won}
            eyebrow={won ? "Resultado · acerto" : "Resultado · erro"}
            title={won ? "Acertou!" : "Errou!"}
            subtitle={
              won
                ? "Você descobriu quem entrou no carro."
                : "Esse não era o passageiro da fuga."
            }
          >
            <div className="relative mx-auto flex w-fit items-end justify-center gap-3 sm:gap-5">
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-[3px] border-[var(--ink)] bg-white shadow-[4px_4px_0_var(--ink)] sm:h-32 sm:w-32">
                <Image
                  src="/game/parcas/_flavinho.webp"
                  alt="Flavinho"
                  fill
                  unoptimized
                  className="object-contain object-bottom p-1"
                />
              </div>
              <div
                className="mb-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-white font-[family-name:var(--font-display)] text-xl text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] sm:mb-12"
                aria-hidden
              >
                +
              </div>
              <div className="relative">
                <ParcaPortrait
                  id={person.id}
                  name={person.name}
                  className={`h-28 w-28 sm:h-32 sm:w-32 ${
                    won
                      ? "ring-4 ring-[#1f8a5b]"
                      : "ring-4 ring-[#c2410c] opacity-95"
                  }`}
                />
                <span
                  className={`absolute -right-2 -top-2 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[var(--ink)] font-[family-name:var(--font-display)] text-2xl text-white shadow-[3px_3px_0_var(--ink)] ${
                    won ? "bg-[#1f8a5b]" : "bg-[#c2410c]"
                  }`}
                  aria-hidden
                >
                  {won ? "✓" : "✕"}
                </span>
              </div>
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {won ? "O Flavinho saiu com" : "Na verdade ele saiu com"}
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
              {person.name}
            </p>
            {person.blurb ? (
              <p
                className={`mt-2 text-base font-bold ${
                  won ? "text-[#1f8a5b]" : "text-[#c2410c]"
                }`}
              >
                {person.blurb}
              </p>
            ) : null}

            {!won && picked && (
              <div className="mt-4 rounded-2xl border-[3px] border-dashed border-[#c2410c]/60 bg-white/80 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#c2410c]">
                  Seu chute
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)] line-through decoration-[#c2410c] decoration-2">
                  {picked.name}
                </p>
              </div>
            )}

            <p className="mt-4 inline-flex rounded-full border-2 border-[var(--ink)] bg-white px-4 py-1.5 text-sm font-bold text-[var(--ink)] shadow-[3px_3px_0_var(--ink)]">
              {score.toLocaleString("pt-BR")} pts · {formatClock(elapsed)}
              {myRank ? ` · #${myRank} mundial` : ""}
            </p>

            {needsName && won ? (
              <div className="mt-5 space-y-3">
                {rankSubmit.needsRegNick ? (
                  <ContaNickNeeded
                    score={score}
                    preferredNick={nameDraft || getPlayerName()}
                  />
                ) : auth?.user ? (
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    Gravando no placar Conta…
                  </p>
                ) : (
                  <PlayerNameForm
                    value={nameDraft}
                    onChange={setNameDraft}
                    onSubmit={() => void saveNameAndRank()}
                    busy={savingRank}
                    error={nameFeedback}
                  />
                )}
                <p className="text-xs font-semibold text-[var(--muted)]">
                  {rankSubmit.needsRegNick
                    ? "Depois do apelido da Conta, os pontos sobem sozinhos."
                    : auth?.user
                      ? ""
                      : `Entra no placar pra gravar os ${score.toLocaleString("pt-BR")} pts — ou joga de novo sem salvar.`}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button size="lg" onClick={() => startGame(difficulty)}>
                    Jogar de novo
                  </Button>
                  <Button variant="secondary" onClick={onBack}>
                    Trocar modo
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button size="lg" onClick={() => startGame(difficulty)}>
                    Jogar de novo
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
                    mode="parca"
                    source="result"
                  />
                </div>
              </>
            )}
          </ResultShell>
        )}
      </main>

      <PixModal open={showPix} onClose={() => setShowPix(false)} />
      <RankModal
        open={showRank}
        onClose={() => setShowRank(false)}
        entries={board}
        global={boardGlobal}
        highlight={rankSubmit.playerName || playerName || nameDraft}
        myRank={myRank}
        myScore={Math.max(score, best) > 0 ? Math.max(score, best) : null}
        error={boardError}
        shareText={shareText}
        shareMode="parca"
        mode="parca"
      />
      <LegalNotice
        onSupport={() => {
          trackSupportOpen("parca");
          setShowPix(true);
        }}
      />
    </ModeTheme>
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
