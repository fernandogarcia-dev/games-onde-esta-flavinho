"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CrowdScene } from "@/components/game/CrowdScene";
import { Leaderboard } from "@/components/game/Leaderboard";
import { LegalNotice } from "@/components/game/LegalNotice";
import { PixModal } from "@/components/game/PixModal";
import { RankModal } from "@/components/game/RankModal";
import {
  ContaNickNeeded,
  PlayerNameForm,
  PlayerNameLanding,
} from "@/components/game/PlayerNameForm";
import { useAuthOptional } from "@/components/auth/AuthProvider";
import {
  ResultMark,
  ResultShell,
} from "@/components/game/ResultShell";
import { ShareBar } from "@/components/game/ShareBar";
import { ModeTheme } from "@/components/home/ModeTheme";
import { getMode } from "@/lib/modes";
import { useScrollTop } from "@/hooks/useScrollTop";
import {
  cityCatalogSize,
  dealNewRun,
  LIVES_BY_DIFFICULTY,
  rememberEpisode,
} from "@/lib/deck";
import {
  getCity,
  pickCityOptions,
  type CityId,
  type Level,
} from "@/lib/levels";
import type { Difficulty } from "@/lib/types";
import {
  checkNameAvailable,
  claimNickname,
  fetchLeaderboard,
  getPlayerName,
  sanitizeName,
  setPlayerName,
  type RankEntry,
} from "@/lib/ranking";
import { useRankSubmit } from "@/lib/use-rank-submit";
import {
  applyStreak,
  CITY_HIT_BONUS,
  CITY_MISS_PENALTY,
  CLICK_MISS_PENALTY,
  findLimitSeconds,
  findScoreAt,
  findScoreMax,
  formatClock,
  labelFindTime,
  PERFECT_FIND_BONUS,
} from "@/lib/scoring";
import {
  trackGameFinish,
  trackGameStart,
  trackNamePrompt,
  trackNameSubmit,
  trackRankingView,
  trackSupportOpen,
} from "@/lib/analytics";
import { getBestScore, saveBestScore } from "@/lib/monetization";
import { resolveClueTier } from "@/lib/city-clues";
import { crowdParamsFor, lookTip } from "@/lib/crowd";
import {
  buildInviteText,
  buildRankText,
  buildResultText,
} from "@/lib/share";

type Phase =
  | "landing"
  | "clues"
  | "find"
  | "win"
  | "fail-city"
  | "fail-time";

export function GameApp({
  onBackToModes,
}: {
  onBackToModes?: () => void;
} = {}) {
  const rankSubmit = useRankSubmit();
  const auth = useAuthOptional();
  const [phase, setPhase] = useState<Phase>("landing");
  useScrollTop([phase]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [run, setRun] = useState<Level[]>([]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [triedCities, setTriedCities] = useState<CityId[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [best, setBest] = useState(0);
  const [showPix, setShowPix] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [findRemaining, setFindRemaining] = useState(0);
  const [findActive, setFindActive] = useState(false);
  const [lastFindBonus, setLastFindBonus] = useState(0);
  const [lastFindSec, setLastFindSec] = useState(0);
  const [lastPerfect, setLastPerfect] = useState(false);
  const [playerName, setPlayerNameState] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [nameFeedback, setNameFeedback] = useState("");
  const [savingRank, setSavingRank] = useState(false);
  const [board, setBoard] = useState<RankEntry[]>([]);
  const [boardGlobal, setBoardGlobal] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [freshClue, setFreshClue] = useState<number | null>(null);
  const findDeadlineRef = useRef<number | null>(null);
  const foundLockRef = useRef(false);
  const pendingPublishRef = useRef(false);
  const pendingPointsRef = useRef(0);
  const cluesPanelRef = useRef<HTMLDivElement | null>(null);
  const freshClueRef = useRef<HTMLLIElement | null>(null);
  const freshClueTimerRef = useRef<number | null>(null);
  const citiesTotal = cityCatalogSize(difficulty);

  const level: Level | null = run[levelIndex] ?? null;
  const city = level ? getCity(level.correctCity) : null;
  const findLimit = findLimitSeconds(difficulty);
  const findMax = findScoreMax(difficulty);
  const liveFindPoints = findScoreAt(findRemaining, findLimit, findMax);

  const cityOptions = useMemo(() => {
    if (!level) return [];
    return pickCityOptions(
      level.correctCity,
      `${level.id}-${levelIndex}-${difficulty}`,
      difficulty,
    );
  }, [level, levelIndex, difficulty]);

  const lookTier = useMemo(
    () =>
      level
        ? resolveClueTier(difficulty, level.difficulty)
        : ("medium" as const),
    [level, difficulty],
  );

  const crowdTuning = useMemo(() => crowdParamsFor(lookTier), [lookTier]);
  const crowdCount = crowdTuning.count;
  const flavinhoScale = crowdTuning.scale;

  useEffect(() => {
    setBest(getBestScore());
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

  useEffect(() => {
    if (phase !== "win" && phase !== "fail-city" && phase !== "fail-time") {
      return;
    }
    trackGameFinish("mestre", {
      difficulty,
      won: phase === "win",
      score,
      elapsedSec: elapsed,
    });
    // só no momento em que a fase de fim muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (!findActive || findDeadlineRef.current == null) return;
    const tick = () => {
      const deadline = findDeadlineRef.current;
      if (deadline == null) return;
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setFindRemaining(left);
      if (left <= 0) {
        // Trava antes do re-render pra não aceitar clique no limiar do zero.
        foundLockRef.current = true;
        setFindActive(false);
        findDeadlineRef.current = null;
        setStreak(0);
        setPhase("fail-time");
        setRunning(false);
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [findActive]);

  const progressLabel = useMemo(
    () => (run.length ? `${levelIndex + 1} / ${run.length}` : "—"),
    [levelIndex, run.length],
  );

  async function refreshBoard() {
    // Preview na página: sempre Anônimos. Conta fica no modal de ranking.
    const { entries, global, error, myRank: remoteRank, myScore } =
      await fetchLeaderboard(getPlayerName(), "mestre", "anon");
    setBoard(entries);
    setBoardGlobal(global);
    setBoardError(error || null);
    if (remoteRank && remoteRank > 0) setMyRank(remoteRank);
    if (typeof myScore === "number" && myScore > 0) {
      setBest((b) => Math.max(b, myScore));
    }
  }

  async function saveLandingName() {
    if (auth?.user) {
      if (rankSubmit.isRegistered) return;
      auth.openAccount(nameDraft || getPlayerName());
      return;
    }
    setSavingRank(true);
    setNameFeedback("");
    try {
      const claimed = await claimNickname(nameDraft, board);
      if (!claimed.ok) {
        setNameFeedback(claimed.error);
        trackNameSubmit("mestre", { success: false });
        return;
      }
      setPlayerNameState(claimed.name);
      setNameDraft(claimed.name);
      trackNameSubmit("mestre", { success: true });
      await refreshBoard();
    } finally {
      setSavingRank(false);
    }
  }

  function startFindTimer() {
    const limit = findLimitSeconds(difficulty);
    findDeadlineRef.current = Date.now() + limit * 1000;
    foundLockRef.current = false;
    setFindRemaining(limit);
    setFindActive(true);
  }

  function stopFindTimer() {
    setFindActive(false);
    findDeadlineRef.current = null;
  }

  function openRank(source: string) {
    trackRankingView("mestre", source);
    void refreshBoard();
    setShowRank(true);
  }

  function startGame(diff: Difficulty = difficulty) {
    const dealt = dealNewRun(6, diff);
    setDifficulty(diff);
    setRun(dealt);
    rememberEpisode(dealt[0].id);
    setBest(getBestScore());
    setPhase("clues");
    setLevelIndex(0);
    setClueIndex(0);
    setTriedCities([]);
    setScore(0);
    setMisses(0);
    setStreak(0);
    setLives(LIVES_BY_DIFFICULTY[diff]);
    setFeedback("");
    setFreshClue(null);
    setElapsed(0);
    setRunning(true);
    setLastFindBonus(0);
    setLastFindSec(0);
    setLastPerfect(false);
    setNeedsName(false);
    setMyRank(null);
    setNewRecord(false);
    stopFindTimer();
    trackGameStart("mestre", diff);
  }

  function restartToMenu() {
    setPhase("landing");
    setRunning(false);
    setFeedback("");
    setShowPix(false);
    setNeedsName(false);
    stopFindTimer();
    void refreshBoard();
  }

  function focusNewClue(index: number) {
    if (freshClueTimerRef.current != null) {
      window.clearTimeout(freshClueTimerRef.current);
    }
    setFreshClue(index);
    window.requestAnimationFrame(() => {
      const target = freshClueRef.current ?? cluesPanelRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    freshClueTimerRef.current = window.setTimeout(() => {
      setFreshClue(null);
      freshClueTimerRef.current = null;
    }, 2800);
  }

  function pickCity(id: CityId) {
    if (!level || !city) return;
    if (triedCities.includes(id)) return;
    if (id === level.correctCity) {
      setFeedback(
        `Mapa fechou em ${city.name}. Relógio ligado: ${labelFindTime(difficulty)} pra achar.`,
      );
      setScore((s) => s + CITY_HIT_BONUS);
      setMisses(0);
      setPhase("find");
      startFindTimer();
      return;
    }
    setTriedCities((prev) => (prev.includes(id) ? prev : [...prev, id]));
    const unlockedNew = clueIndex < level.clues.length - 1;
    const nextClue = Math.min(clueIndex + 1, level.clues.length - 1);
    // Keep the board clean — no error banners. Just unlock + highlight the tip.
    setFeedback("");
    setScore((s) => Math.max(0, s - CITY_MISS_PENALTY));
    setLives((l) => {
      const next = l - 1;
      if (next <= 0) {
        setPhase("fail-city");
        setRunning(false);
        setStreak(0);
      }
      return next;
    });
    setClueIndex(nextClue);
    if (unlockedNew) focusNewClue(nextClue);
    else {
      window.requestAnimationFrame(() => {
        cluesPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  async function publishScore(
    points: number,
    name: string,
    opts?: { isNewName?: boolean; accumulate?: boolean },
  ) {
    const result = await rankSubmit.submit("mestre", points, {
      isNewName: opts?.isNewName,
      name,
    });
    if (result.entries.length > 0) {
      setBoard(result.entries);
      setBoardGlobal(result.global);
    } else if (result.global) {
      // Mantém o placar mundial que já tínhamos; não troca por board local.
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

    // Nunca apaga o nick nem joga a pontuação em outro apelido.
    if (result.code === "name_taken") {
      setFeedback(
        result.suggestLogin
          ? "Esse apelido anônimo já existe. Escolhe outro ou entra com Google (placar Conta)."
          : result.ownerScore
            ? `Não deu pra gravar: esse apelido já é de outra pessoa (${result.ownerScore.toLocaleString("pt-BR")} pts). Troca o nick na home.`
            : "Não deu pra gravar: esse apelido já é de outra pessoa. Troca o nick na home.",
      );
      return false;
    }
    return !result.error;
  }

  async function onFound() {
    // Usa deadline/ref — estado React pode estar stale no clique do limiar.
    if (foundLockRef.current) return;
    if (findDeadlineRef.current == null) return;
    if (Date.now() > findDeadlineRef.current) return;
    foundLockRef.current = true;
    const remaining = findRemaining;
    const base = findScoreAt(remaining, findLimit, findScoreMax(difficulty));
    const nextStreak = streak + 1;
    const withStreak = applyStreak(base, nextStreak);
    const perfect = misses === 0;
    const perfectPts = perfect ? PERFECT_FIND_BONUS : 0;
    const gained = withStreak + perfectPts;
    const nextScore = score + gained;

    stopFindTimer();
    setStreak(nextStreak);
    setLastFindBonus(gained);
    setLastFindSec(Math.max(0, findLimit - remaining));
    setLastPerfect(perfect);
    setScore(nextScore);
    setRunning(false);
    const prevBest = getBestScore();
    const isNew = nextScore > prevBest && nextScore > 0;
    saveBestScore(nextScore);
    setBest(Math.max(prevBest, nextScore));
    setNewRecord(isNew);

    if (rankSubmit.needsRegNick) {
      setNeedsName(true);
      pendingPublishRef.current = true;
      pendingPointsRef.current = gained;
      trackNamePrompt("mestre");
      auth?.openAccount(nameDraft || getPlayerName());
    } else {
      const existing = rankSubmit.playerName || getPlayerName();
      if (!existing) {
        setNeedsName(true);
        setNameDraft("");
        trackNamePrompt("mestre");
      } else {
        setNeedsName(false);
        // Soma só o ganho desta caçada ao placar de carreira
        await publishScore(gained, existing, { accumulate: true });
      }
    }
    setPhase("win");
  }

  function onMiss() {
    setMisses((m) => m + 1);
    setScore((s) => Math.max(0, s - CLICK_MISS_PENALTY));
  }

  // Conta acabou de ganhar nick → grava pontos pendentes no placar Conta.
  useEffect(() => {
    if (!needsName || !rankSubmit.isRegistered || !pendingPublishRef.current) {
      return;
    }
    const pts = pendingPointsRef.current || score;
    if (pts <= 0) return;
    pendingPublishRef.current = false;
    void (async () => {
      const ok = await publishScore(pts, rankSubmit.playerName, {
        isNewName: true,
        accumulate: true,
      });
      trackNameSubmit("mestre", { success: ok });
      if (ok) {
        setNeedsName(false);
        setFeedback("");
        setPlayerNameState(rankSubmit.playerName);
      }
    })();
  }, [needsName, rankSubmit.isRegistered, rankSubmit.playerName, score]);

  async function confirmName() {
    if (auth?.user) {
      if (rankSubmit.isRegistered) {
        setSavingRank(true);
        try {
          const pts = pendingPointsRef.current || score;
          const ok = await publishScore(pts, rankSubmit.playerName, {
            accumulate: true,
          });
          trackNameSubmit("mestre", { success: ok });
          if (ok) {
            setNeedsName(false);
            setFeedback("");
          }
        } finally {
          setSavingRank(false);
        }
        return;
      }
      pendingPublishRef.current = true;
      pendingPointsRef.current = score;
      auth.openAccount(nameDraft || getPlayerName());
      return;
    }

    const clean = sanitizeName(nameDraft);
    if (!clean || clean.length < 2 || savingRank) return;

    const alreadyMine =
      getPlayerName().toLowerCase() === clean.toLowerCase();
    const isNewName = !alreadyMine;

    setSavingRank(true);
    try {
      if (isNewName) {
        const check = await checkNameAvailable(clean);
        if (check.error) {
          const localHit = board.find(
            (e) => e.name.toLowerCase() === clean.toLowerCase(),
          );
          setFeedback(
            localHit
              ? `"${localHit.name}" já foi escolhido. Escolhe outro apelido.`
              : "Não deu pra checar o apelido agora. Tenta de novo.",
          );
          return;
        }
        if (check.taken || !check.available) {
          setFeedback(
            check.ownerScore
              ? `"${check.name || clean}" já foi escolhido (${check.ownerScore.toLocaleString("pt-BR")} pts). Escolhe outro.`
              : `"${clean}" já foi escolhido. Escolhe outro apelido.`,
          );
          return;
        }
      }

      setPlayerName(clean);
      setPlayerNameState(clean);
      // Primeira gravação com nick: soma o total da corrida atual à carreira
      const ok = await publishScore(score, clean, {
        isNewName,
        accumulate: true,
      });
      trackNameSubmit("mestre", { success: ok });
      if (ok) {
        setNeedsName(false);
        setFeedback("");
      }
    } finally {
      setSavingRank(false);
    }
  }

  function nextLevel() {
    // Permite seguir sem gravar placar (anônimo ou Conta sem nick).
    if (needsName) {
      setNeedsName(false);
      pendingPublishRef.current = false;
    }
    if (levelIndex >= run.length - 1) {
      setPhase("landing");
      setRunning(false);
      void refreshBoard();
      return;
    }
    const next = levelIndex + 1;
    rememberEpisode(run[next].id);
    setLevelIndex(next);
    setClueIndex(0);
    setTriedCities([]);
    setMisses(0);
    setLives(LIVES_BY_DIFFICULTY[difficulty]);
    setFeedback("");
    setLastFindBonus(0);
    setLastFindSec(0);
    setLastPerfect(false);
    setMyRank(null);
    setNewRecord(false);
    setPhase("clues");
    setRunning(true);
  }

  const inviteShareText = buildInviteText("mestre");
  const resultShareText = buildResultText({
    shareLine: level?.shareLine,
    playerName: playerName || nameDraft,
    cityName: city?.name,
    score,
    elapsedSec: elapsed,
    findSec: lastFindSec > 0 ? lastFindSec : undefined,
    difficulty,
    rank: myRank,
    won: phase === "win",
    mode: "mestre",
  });
  const rankShareText = buildRankText({
    playerName: playerName || nameDraft,
    score: Math.max(score, best),
    rank: myRank,
    best,
    mode: "mestre",
  });

  const urgent = findActive && findRemaining <= Math.max(10, findLimit * 0.2);

  return (
    <ModeTheme mode="mestre">
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <button
            type="button"
            className="font-[family-name:var(--font-display)] text-xl tracking-wide text-[var(--ink)] sm:text-2xl"
            onClick={onBackToModes ?? restartToMenu}
          >
            Cadê Flavinho?
          </button>
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            O Mestre dos Disfarces
          </p>
        </div>
        <div className="flex items-center gap-2">
          {phase !== "landing" && (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-[var(--ink)]/15 bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink)] sm:flex">
                <span>Ep {progressLabel}</span>
                <span className="text-[var(--muted)]">·</span>
                <span className="tabular-nums text-[var(--brand)]">
                  {score.toLocaleString("pt-BR")} pts
                </span>
                {streak > 1 && (
                  <>
                    <span className="text-[var(--muted)]">·</span>
                    <span className="text-[var(--accent)]">🔥 x{streak}</span>
                  </>
                )}
                <span className="text-[var(--muted)]">·</span>
                <span className="tabular-nums">{formatClock(elapsed)}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={restartToMenu}>
                Recomeçar
              </Button>
            </>
          )}
          {onBackToModes && (
            <Button variant="secondary" size="sm" onClick={onBackToModes}>
              Modos
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openRank("header")}
          >
            Ranking
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
        {phase === "landing" && (
          <div className="space-y-6">
            <Landing
              best={best}
              citiesTotal={citiesTotal}
              difficulty={difficulty}
              playerName={playerName}
              nameDraft={nameDraft}
              nameBusy={savingRank}
              nameError={nameFeedback || null}
              topScore={board[0]?.score ?? 0}
              topName={board[0]?.name ?? ""}
              shareText={inviteShareText}
              onDifficultyChange={setDifficulty}
              onNameDraftChange={setNameDraft}
              onSaveName={() => void saveLandingName()}
              onStart={() => startGame(difficulty)}
              onBack={onBackToModes}
            />
            <Leaderboard
              entries={board}
              global={boardGlobal}
              highlight={playerName}
              myRank={myRank}
              myScore={best > 0 ? best : null}
              error={boardError}
              shareText={rankShareText}
              shareMode="mestre"
              onViewFull={() => openRank("landing_board")}
            />
          </div>
        )}

        {phase === "clues" && level && (
          <section className="animate-rise grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div
              ref={cluesPanelRef}
              className="rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6"
            >
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
                    Caçada {levelIndex + 1}/{run.length}
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] sm:text-3xl">
                    {level.title}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Cruze as pistas e chute a cidade. Errou? Libera a próxima.
                  </p>
                </div>
                <p className="text-[11px] font-semibold text-[var(--muted)]">
                  {labelMode(difficulty)} · {labelFindTime(difficulty)} ·{" "}
                  {lives} vida{lives === 1 ? "" : "s"} ·{" "}
                  {score.toLocaleString("pt-BR")} pts
                </p>
              </div>

              <div className="mt-5 flex items-end justify-between gap-2">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--ink)]">
                  Pistas da cidade
                </p>
                <p className="text-[11px] font-semibold text-[var(--muted)]">
                  {clueIndex + 1}/{level.clues.length} abertas
                </p>
              </div>

              <ul className="mt-3 space-y-3">
                {level.clues.map((clue, i) => {
                  const unlocked = i <= clueIndex;
                  const isFresh = freshClue === i;
                  return (
                    <li
                      key={`${level.id}-${i}`}
                      ref={isFresh ? freshClueRef : undefined}
                      className={`rounded-2xl border-[3px] px-4 py-4 transition ${
                        isFresh
                          ? "border-[var(--ink)] bg-[#fff4d6] text-[var(--ink)] shadow-[5px_5px_0_var(--ink)]"
                          : unlocked
                            ? "border-[var(--ink)] bg-[#e8f6ef] text-[var(--ink)] shadow-[5px_5px_0_var(--ink)]"
                            : "border-dashed border-[var(--ink)]/30 bg-white/70 text-[var(--muted)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black ${
                            isFresh
                              ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                              : unlocked
                                ? "border-[#1f8a5b] bg-[#1f8a5b] text-white"
                                : "border-[var(--ink)]/30 bg-white text-[var(--muted)]"
                          }`}
                        >
                          {unlocked ? (isFresh ? "!" : "✓") : i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-bold uppercase tracking-wide ${
                              isFresh
                                ? "text-[#9a7b0a]"
                                : unlocked
                                  ? "text-[#1f8a5b]"
                                  : "text-[var(--muted)]"
                            }`}
                          >
                            {isFresh
                              ? "Nova pista"
                              : unlocked
                                ? `Pista ${i + 1}`
                                : `Pista ${i + 1} bloqueada`}
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
                              : "Erra uma cidade no mapa pra abrir."}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                    Marque no mapa
                  </h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Toque numa cidade. Errada fica fora.
                  </p>
                </div>
                <p className="text-[11px] font-semibold text-[var(--muted)]">
                  toque pra chutar
                </p>
              </div>
              <div
                role="list"
                className="mt-4 grid grid-cols-1 gap-2 rounded-2xl border-2 border-dashed border-[var(--ink)]/35 bg-white/70 p-2 sm:grid-cols-2"
              >
                {cityOptions.map((c) => {
                  const tried = triedCities.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="listitem"
                      disabled={tried}
                      onClick={() => pickCity(c.id)}
                      className={`rounded-xl border-2 px-3 py-3 text-left transition ${
                        tried
                          ? "cursor-not-allowed border-[var(--ink)]/20 bg-[#f3f4f6] opacity-60"
                          : "border-[var(--ink)]/25 bg-white hover:-translate-y-0.5 hover:border-[var(--ink)] hover:bg-[#fff4d6] hover:shadow-[3px_3px_0_var(--ink)]"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          aria-hidden
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                            tried
                              ? "border-[var(--alert)] bg-[var(--alert)] text-[8px] font-black text-white"
                              : "border-[var(--ink)]/35 bg-white"
                          }`}
                        >
                          {tried ? "×" : null}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[var(--ink)]">
                            {c.name}
                            <span className="ml-1 text-xs font-semibold text-[var(--muted)]">
                              · {c.country}
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-[var(--muted)]">
                            {tried ? "Descartada nesta rodada." : c.blurb}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {phase === "find" && level && city && (
          <section className="animate-rise space-y-2.5 sm:space-y-4">
            <div
              className={`flex items-center justify-between gap-2 rounded-2xl border-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 ${
                urgent
                  ? "timer-urgent border-[var(--alert)] bg-[var(--alert)]/10"
                  : "border-[var(--ink)] bg-[var(--paper)] shadow-[4px_4px_0_var(--ink)]"
              }`}
            >
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--muted)] sm:text-[10px]">
                  Tempo
                </p>
                <p
                  className={`font-[family-name:var(--font-display)] text-2xl tabular-nums sm:text-3xl ${
                    urgent ? "text-[var(--alert)]" : "text-[var(--ink)]"
                  }`}
                >
                  {formatClock(findRemaining)}
                </p>
              </div>
              <div className="min-w-0 flex-1 px-1 sm:px-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--sand)] sm:h-2">
                  <div
                    className={`h-full transition-[width] duration-200 ${
                      urgent ? "bg-[var(--alert)]" : "bg-[var(--brand)]"
                    }`}
                    style={{
                      width: `${Math.max(0, (findRemaining / findLimit) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-0.5 truncate text-[10px] text-[var(--muted)] sm:text-xs">
                  Mar de Flavinhos · {city.name} · errados {misses}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--muted)] sm:text-[10px]">
                  Agora
                </p>
                <p className="font-[family-name:var(--font-display)] text-2xl tabular-nums text-[var(--brand)] sm:text-3xl">
                  +{liveFindPoints.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 rounded-2xl border-2 border-[var(--ink)] bg-[var(--paper)] px-2 py-1 shadow-[3px_3px_0_var(--ink)]">
                <Image
                  src="/game/disguises/real.webp"
                  alt="Referência do Flavinho sem disfarce"
                  width={40}
                  height={60}
                  className="h-10 w-auto object-contain sm:h-14"
                  unoptimized
                />
                <div className="min-w-0 pr-1">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--muted)] sm:text-[10px]">
                    Sem disfarce
                  </p>
                  <p className="truncate text-sm font-black text-[var(--ink)]">
                    Flavinho
                  </p>
                  <p className="hidden text-[11px] text-[var(--muted)] sm:block">
                    terno preto, braços cruzados
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden text-xs font-semibold text-[var(--muted)] sm:inline">
                  {score.toLocaleString("pt-BR")} pts
                </span>
              </div>
            </div>

            <p className="text-center text-[11px] font-semibold text-[var(--muted)] sm:text-xs">
              {lookTip(lookTier)}
            </p>

            <CrowdScene
              seed={`${level.id}-${levelIndex}-${difficulty}`}
              crowdCount={crowdCount}
              flavinhoScale={flavinhoScale}
              lookTier={lookTier}
              onFound={() => void onFound()}
              onMiss={onMiss}
              disabled={!findActive}
            />
          </section>
        )}

        {phase === "win" && city && (
          <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <ResultShell
              won
              eyebrow={`Resultado · acerto · ${levelIndex + 1}/${run.length}`}
              title={
                levelIndex >= run.length - 1 ? "Missão fechada!" : "Acertou!"
              }
              subtitle={
                levelIndex >= run.length - 1
                  ? `Sexteto completo em ${city.name}.`
                  : `Tava em ${city.name}. Mais ${run.length - levelIndex - 1} sumiço${run.length - levelIndex - 1 === 1 ? "" : "s"}.`
              }
            >
              <div className="relative mx-auto flex w-fit items-end justify-center gap-3">
                <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-[3px] border-[var(--ink)] bg-white shadow-[4px_4px_0_var(--ink)] sm:h-32 sm:w-32">
                  <Image
                    src="/game/disguises/real.webp"
                    alt="Flavinho encontrado"
                    fill
                    unoptimized
                    className="object-contain object-bottom p-1"
                  />
                </div>
                <span className="absolute -right-2 -top-2">
                  <ResultMark won />
                </span>
              </div>

              {newRecord && (
                <p className="mt-4 inline-block rounded-full border-2 border-[var(--ink)] bg-[#fff4d6] px-3 py-1 text-sm font-black text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
                  Novo recorde pessoal!
                </p>
              )}

              <div className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2 rounded-2xl border-2 border-dashed border-[var(--ink)]/30 bg-white/80 p-2">
                <div className="rounded-xl border-2 border-[var(--ink)] bg-[#e8f6ef] px-2 py-2 shadow-[2px_2px_0_var(--ink)]">
                  <p className="text-[10px] font-bold uppercase text-[var(--muted)]">
                    Ganho
                  </p>
                  <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                    +{lastFindBonus.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="rounded-xl border-2 border-[var(--ink)] bg-[#fff4d6] px-2 py-2 shadow-[2px_2px_0_var(--ink)]">
                  <p className="text-[10px] font-bold uppercase text-[var(--muted)]">
                    Total
                  </p>
                  <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                    {score.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="rounded-xl border-2 border-[var(--ink)] bg-[#e6f7f5] px-2 py-2 shadow-[2px_2px_0_var(--ink)]">
                  <p className="text-[10px] font-bold uppercase text-[var(--muted)]">
                    Tempo
                  </p>
                  <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                    {formatClock(lastFindSec)}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm text-[var(--muted)]">
                {lastPerfect ? "Achado limpo · " : ""}
                {streak > 1 ? `sequência x${streak} · ` : ""}
                corrida {formatClock(elapsed)}
              </p>
              <p className="mt-2 inline-flex rounded-full border-2 border-[var(--ink)] bg-white px-4 py-1.5 text-sm font-bold text-[var(--ink)] shadow-[3px_3px_0_var(--ink)]">
                {score.toLocaleString("pt-BR")} pts
                {playerName && myRank != null
                  ? ` · ${playerName} #${myRank}`
                  : myRank != null
                    ? ` · #${myRank}`
                    : ""}
              </p>

              {needsName ? (
                <div className="mx-auto mt-5 max-w-sm space-y-3">
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
                      onSubmit={() => void confirmName()}
                      busy={savingRank}
                      error={feedback || null}
                    />
                  )}
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    {rankSubmit.needsRegNick
                      ? "Depois do apelido da Conta, os pontos sobem sozinhos."
                      : auth?.user
                        ? ""
                        : "Entra no placar pra gravar os pontos — ou continua sem salvar."}
                  </p>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={nextLevel}
                  >
                    {levelIndex >= run.length - 1
                      ? "Jogar de novo"
                      : `Próximo sumiço (${levelIndex + 2}/${run.length})`}
                  </Button>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={restartToMenu}
                    >
                      Menu
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={nextLevel}
                  >
                    {levelIndex >= run.length - 1
                      ? "Jogar de novo"
                      : `Próximo sumiço (${levelIndex + 2}/${run.length})`}
                  </Button>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={restartToMenu}
                    >
                      Menu
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openRank("result")}
                    >
                      Ver ranking
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-5 border-t border-[var(--ink)]/10 pt-4">
                <ShareBar
                  text={resultShareText}
                  label="Provoca a galera"
                  align="center"
                  compact
                  mode="mestre"
                  source="result_win"
                />
              </div>
            </ResultShell>
            <Leaderboard
              entries={board}
              global={boardGlobal}
              highlight={playerName || nameDraft}
              myRank={myRank}
              myScore={score > 0 ? score : best > 0 ? best : null}
              compact
              error={boardError}
              shareText={rankShareText}
              shareMode="mestre"
              onViewFull={() => openRank("result_board")}
            />
          </div>
        )}

        {(phase === "fail-city" || phase === "fail-time") && (
          <ResultShell
            won={false}
            eyebrow="Resultado · erro"
            title={phase === "fail-time" ? "Errou!" : "Errou!"}
            subtitle={
              phase === "fail-time"
                ? "O relógio zerou. Ele já trocou de disfarce."
                : "As tentativas acabaram. Ele escapou dessa."
            }
          >
            <div className="flex flex-col items-center gap-3">
              <ResultMark won={false} />
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {phase === "fail-time" ? "Escapou no tempo" : "Errou a cidade"}
              </p>
              {city ? (
                <p className="font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
                  Era {city.name}
                </p>
              ) : null}
              <p className="mt-2 inline-flex rounded-full border-2 border-[var(--ink)] bg-white px-4 py-1.5 text-sm font-bold text-[var(--ink)] shadow-[3px_3px_0_var(--ink)]">
                {score.toLocaleString("pt-BR")} pts · {formatClock(elapsed)}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => startGame(difficulty)}>
                Jogar de novo
              </Button>
              <Button variant="secondary" onClick={restartToMenu}>
                Menu
              </Button>
            </div>
            <div className="mt-5 border-t border-[var(--ink)]/10 pt-4">
              <ShareBar
                text={resultShareText}
                label="Desafia alguém nas redes"
                align="center"
                compact
                mode="mestre"
                source="result_fail"
              />
            </div>
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
        shareText={rankShareText}
        shareMode="mestre"
        mode="mestre"
      />

      <LegalNotice
        onSupport={() => {
          trackSupportOpen("mestre");
          setShowPix(true);
        }}
      />
    </ModeTheme>
  );
}

function Landing({
  best,
  citiesTotal,
  difficulty,
  playerName,
  nameDraft,
  nameBusy,
  nameError,
  topScore,
  topName,
  shareText,
  onDifficultyChange,
  onNameDraftChange,
  onSaveName,
  onStart,
  onBack,
}: {
  best: number;
  citiesTotal: number;
  difficulty: Difficulty;
  playerName: string;
  nameDraft: string;
  nameBusy: boolean;
  nameError: string | null;
  topScore: number;
  topName: string;
  shareText: string;
  onDifficultyChange: (d: Difficulty) => void;
  onNameDraftChange: (value: string) => void;
  onSaveName: () => void;
  onStart: () => void;
  onBack?: () => void;
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
      hint: "24 cidades · Flavinhos grandes",
      tone: "bg-[#e8f6ef] border-[#1f8a5b]",
    },
    {
      id: "medium",
      label: "Médio",
      hint: "56 cidades · multidão média",
      tone: "bg-[#fff4d6] border-[#d4a017]",
    },
    {
      id: "hard",
      label: "Difícil",
      hint: "124 cidades · mar pequenininho",
      tone: "bg-[#fde8e4] border-[#c2410c]",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[10px_10px_0_var(--ink)]">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/game/scene-rio-flat.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-30"
          sizes="(max-width: 768px) 100vw, 960px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--paper)] via-[var(--paper)]/92 to-[var(--paper)]/30" />
      </div>

      <div className="relative grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-rise">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--brand)]">
            Modo 1 · O Mestre dos Disfarces
          </p>
          <h1 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-[var(--ink)] sm:text-6xl md:text-7xl">
            Cadê Flavinho?
          </h1>
          <p className="mt-4 max-w-md text-lg text-[var(--muted)]">
            {playerName ? `E aí, ${playerName}. ` : ""}
            Jogue grátis: pistas, mapa e multidão. Relógio ligado — ache ele
            antes de zerar.{" "}
            {topName
              ? `Desafia ${topName} (${topScore.toLocaleString("pt-BR")} pts).`
              : "Entra no ranking mundial agora."}
          </p>
          <p className="mt-3 max-w-md text-sm text-[var(--muted)]">
            Obra ficcional de sátira humorística — grátis. Qualquer PIX é
            voluntário e cobre só servidor/custos do desenvolvedor, sem vínculo
            com imagem de terceiros, partidos ou campanhas.
          </p>

          <div className="mt-6">
            <div className="mb-2 flex items-end justify-between gap-2">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--ink)]">
                Escolha a dificuldade
              </p>
              <p className="text-[11px] font-semibold text-[var(--muted)]">
                toque pra trocar
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
                    onClick={() => onDifficultyChange(m.id)}
                    className={`rounded-xl border-2 px-2.5 py-3 text-left transition ${
                      active
                        ? `${m.tone} text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] ring-2 ring-[var(--ink)]`
                        : "border-[var(--ink)]/20 bg-white/90 text-[var(--ink)] opacity-80 hover:opacity-100 hover:border-[var(--ink)]/50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          active
                            ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                            : "border-[var(--ink)]/40 bg-white"
                        }`}
                      >
                        {active ? (
                          <span className="text-[9px] font-black leading-none">
                            ✓
                          </span>
                        ) : null}
                      </span>
                      <span className="font-[family-name:var(--font-display)] text-base leading-none">
                        {m.label}
                      </span>
                    </div>
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

          <PlayerNameLanding
            playerName={playerName}
            draft={nameDraft}
            onDraftChange={onNameDraftChange}
            onSave={onSaveName}
            busy={nameBusy}
            error={nameError}
          />

          <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={onStart}
            >
              {getMode("mestre").playCta}
            </Button>
            {onBack ? (
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={onBack}
              >
                Voltar aos modos
              </Button>
            ) : null}
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            {best > 0
              ? `Seu recorde: ${best.toLocaleString("pt-BR")} pts · modo ${labelMode(difficulty)}: ${citiesTotal} cidades`
              : playerName
                ? `Modo ${labelMode(difficulty)}: ${citiesTotal} cidades no mapa. Cada achado começa com ${findScoreMax(difficulty).toLocaleString("pt-BR")} pts no relógio.`
                : "Pode jogar sem apelido — mas pra subir no ranking, entra no placar acima."}
          </p>
          <div className="mt-5">
            <ShareBar
              text={shareText}
              label="Chama a galera"
              compact
              mode="mestre"
              source="landing"
            />
          </div>
        </div>

        <div className="animate-float relative mx-auto w-full max-w-xs">
          <div className="absolute -inset-3 rounded-[2rem] bg-[var(--brand)]/35 blur-xl" />
          <Image
            src="/game/disguises/real.webp"
            alt="Retrato do Flavinho"
            width={420}
            height={520}
            priority
            className="relative mx-auto rounded-[1.5rem] border-[3px] border-[var(--ink)] bg-[var(--sand)] object-contain p-3 shadow-[8px_8px_0_var(--ink)]"
            unoptimized
          />
          <div className="absolute -bottom-3 -right-2 rotate-[-6deg] rounded-xl border-2 border-[var(--ink)] bg-[var(--brand)] px-3 py-1.5 text-sm font-black text-white shadow-[3px_3px_0_var(--ink)]">
            SEM DISFARCE
          </div>
        </div>
      </div>
    </section>
  );
}

function labelMode(d: Difficulty) {
  if (d === "easy") return "Fácil";
  if (d === "medium") return "Médio";
  return "Difícil";
}

