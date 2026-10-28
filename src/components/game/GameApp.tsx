"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CrowdScene } from "@/components/game/CrowdScene";
import { Leaderboard } from "@/components/game/Leaderboard";
import { LegalNotice } from "@/components/game/LegalNotice";
import { PixModal } from "@/components/game/PixModal";
import { RankModal } from "@/components/game/RankModal";
import { ShareBar } from "@/components/game/ShareBar";
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
  fetchLeaderboard,
  getPlayerName,
  sanitizeName,
  setPlayerName,
  submitScore,
  type RankEntry,
} from "@/lib/ranking";
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

export function GameApp() {
  const [phase, setPhase] = useState<Phase>("landing");
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
  const [board, setBoard] = useState<RankEntry[]>([]);
  const [boardGlobal, setBoardGlobal] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [freshClue, setFreshClue] = useState<number | null>(null);
  const findDeadlineRef = useRef<number | null>(null);
  const foundLockRef = useRef(false);
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
    setPlayerNameState(getPlayerName());
    void refreshBoard();
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!findActive || findDeadlineRef.current == null) return;
    const tick = () => {
      const deadline = findDeadlineRef.current;
      if (deadline == null) return;
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setFindRemaining(left);
      if (left <= 0) {
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
    const { entries, global, error, myRank: remoteRank, myScore } =
      await fetchLeaderboard(getPlayerName());
    setBoard(entries);
    setBoardGlobal(global);
    setBoardError(error || null);
    if (remoteRank && remoteRank > 0) setMyRank(remoteRank);
    if (typeof myScore === "number" && myScore > 0) {
      setBest((b) => Math.max(b, myScore));
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

  async function publishScore(total: number, name: string) {
    const result = await submitScore(name, total);
    setBoard(result.entries);
    setBoardGlobal(result.global);
    setBoardError(result.error || null);
    setMyRank(result.rank > 0 ? result.rank : null);
  }

  async function onFound() {
    if (foundLockRef.current || phase !== "find" || !findActive) return;
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
    saveBestScore(nextScore);
    const prevBest = getBestScore();
    setBest(prevBest);
    setNewRecord(nextScore >= prevBest && nextScore > 0);

    const existing = getPlayerName();
    if (!existing) {
      setNeedsName(true);
      setNameDraft("");
    } else {
      setNeedsName(false);
      await publishScore(nextScore, existing);
    }
    setPhase("win");
  }

  function onMiss() {
    setMisses((m) => m + 1);
    setScore((s) => Math.max(0, s - CLICK_MISS_PENALTY));
  }

  async function confirmName() {
    const clean = setPlayerName(nameDraft);
    if (!clean || clean.length < 2) return;
    setPlayerNameState(clean);
    setNeedsName(false);
    await publishScore(score, clean);
  }

  function nextLevel() {
    if (needsName) return;
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

  const inviteShareText = buildInviteText();
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
  });
  const rankShareText = buildRankText({
    playerName: playerName || nameDraft,
    score: Math.max(score, best),
    rank: myRank,
    best,
  });

  const urgent = findActive && findRemaining <= Math.max(10, findLimit * 0.2);

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[var(--brand)]/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <div className="map-grid absolute inset-0 opacity-[0.06]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <button
          type="button"
          className="font-[family-name:var(--font-display)] text-xl tracking-wide text-[var(--ink)] sm:text-2xl"
          onClick={restartToMenu}
        >
          Cadê Flavinho?
        </button>
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void refreshBoard();
              setShowRank(true);
            }}
          >
            Ranking
          </Button>
          <Button variant="money" size="sm" onClick={() => setShowPix((v) => !v)}>
            Apoio voluntário
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
              topScore={board[0]?.score ?? 0}
              topName={board[0]?.name ?? ""}
              shareText={inviteShareText}
              onDifficultyChange={setDifficulty}
              onStart={() => startGame(difficulty)}
            />
            <Leaderboard
              entries={board}
              global={boardGlobal}
              highlight={playerName}
              myRank={myRank}
              myScore={best > 0 ? best : null}
              error={boardError}
              shareText={rankShareText}
              onViewFull={() => setShowRank(true)}
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
          <section className="animate-rise mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6 text-center shadow-[8px_8px_0_var(--ink)] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
                Caçada {levelIndex + 1}/{run.length} · modo{" "}
                {labelMode(difficulty)}
              </p>
              <Image
                src="/game/disguises/real.webp"
                alt="Flavinho encontrado"
                width={120}
                height={170}
                className="mx-auto mt-2 object-contain"
                unoptimized
              />
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
                {levelIndex >= run.length - 1
                  ? "Missão fechada!"
                  : "Achei ele!"}
              </h2>
              <p className="mt-2 text-base text-[var(--muted)]">
                {levelIndex >= run.length - 1
                  ? `Sexteto completo em ${city.name}. Manda ver no placar ou abre outra rodada.`
                  : `Tava em ${city.name}. Mais ${run.length - levelIndex - 1} sumiço${run.length - levelIndex - 1 === 1 ? "" : "s"} pra fechar a caçada.`}
              </p>
              {newRecord && (
                <p className="mt-3 inline-block rounded-full border-2 border-[var(--ink)] bg-[#fff4d6] px-3 py-1 text-sm font-black text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
                  Novo recorde pessoal!
                </p>
              )}

              <div className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2 rounded-2xl border-2 border-dashed border-[var(--ink)]/30 bg-white/70 p-2">
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
                {myRank != null ? ` · você #${myRank}` : ""}
              </p>

              {needsName ? (
                <div className="mx-auto mt-5 max-w-sm text-left">
                  <p className="text-sm font-bold text-[var(--ink)]">
                    Entra no placar pra desafiar a galera
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Só um apelido. Sem login, sem frescura.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={nameDraft}
                      onChange={(e) =>
                        setNameDraft(sanitizeName(e.target.value))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void confirmName();
                      }}
                      maxLength={16}
                      placeholder="Seu apelido"
                      className="min-w-0 flex-1 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2.5 font-semibold text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                      autoFocus
                    />
                    <Button
                      onClick={() => void confirmName()}
                      disabled={nameDraft.trim().length < 2}
                    >
                      Entrar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <Button size="lg" className="w-full sm:w-auto" onClick={nextLevel}>
                    {levelIndex >= run.length - 1
                      ? "Abrir nova caçada"
                      : `Próximo sumiço (${levelIndex + 2}/${run.length})`}
                  </Button>
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    {levelIndex >= run.length - 1
                      ? myRank != null && myRank > 1
                        ? `Falta pouco pra subir do #${myRank}. Uma rodada a mais?`
                        : "Placar tá quente. Roda de novo e sobe."
                      : streak > 1
                        ? `Sequência x${streak} no ar — não para agora.`
                        : "Ele já deve estar trocando de cidade. Vai atrás."}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="secondary" size="sm" onClick={restartToMenu}>
                      Menu
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowRank(true)}
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
                />
              </div>
            </div>
            <Leaderboard
              entries={board}
              global={boardGlobal}
              highlight={playerName || nameDraft}
              myRank={myRank}
              myScore={score > 0 ? score : best > 0 ? best : null}
              compact
              error={boardError}
              shareText={rankShareText}
              onViewFull={() => setShowRank(true)}
            />
          </section>
        )}

        {(phase === "fail-city" || phase === "fail-time") && (
          <section className="animate-rise mx-auto max-w-xl rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6 text-center shadow-[8px_8px_0_var(--ink)]">
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              {phase === "fail-time" ? "Escapou no tempo" : "Errou a cidade"}
            </h2>
            <p className="mt-2 text-[var(--muted)]">
              {phase === "fail-time"
                ? "O relógio zerou. Ele já trocou de disfarce — mas a próxima caçada tá pronta."
                : "As tentativas acabaram. Abre outra rodada e pega ele dessa vez."}
            </p>
            <p className="mt-3 font-semibold text-[var(--ink)]">
              Pontuação da corrida: {score.toLocaleString("pt-BR")} ·{" "}
              {formatClock(elapsed)}
            </p>
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
        global={boardGlobal}
        highlight={playerName || nameDraft}
        myRank={myRank}
        myScore={Math.max(score, best) > 0 ? Math.max(score, best) : null}
        error={boardError}
        shareText={rankShareText}
      />

      <LegalNotice />
    </div>
  );
}

function Landing({
  best,
  citiesTotal,
  difficulty,
  playerName,
  topScore,
  topName,
  shareText,
  onDifficultyChange,
  onStart,
}: {
  best: number;
  citiesTotal: number;
  difficulty: Difficulty;
  playerName: string;
  topScore: number;
  topName: string;
  shareText: string;
  onDifficultyChange: (d: Difficulty) => void;
  onStart: () => void;
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
            Boletim relâmpago · sumiço confirmado
          </p>
          <h1 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-[var(--ink)] sm:text-6xl md:text-7xl">
            Cadê Flavinho?
          </h1>
          <p className="mt-4 max-w-md text-lg text-[var(--muted)]">
            {playerName ? `E aí, ${playerName}. ` : ""}
            Relógio ligado, pontos derretendo, ranking esperando.{" "}
            {topName
              ? `Bata ${topName} (${topScore.toLocaleString("pt-BR")} pts).`
              : "Seja o primeiro no placar."}
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

          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" onClick={onStart}>
              Cadê ele? Vamos!
            </Button>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            {best > 0
              ? `Seu recorde: ${best.toLocaleString("pt-BR")} pts · modo ${labelMode(difficulty)}: ${citiesTotal} cidades`
              : `Modo ${labelMode(difficulty)}: ${citiesTotal} cidades no mapa. Cada achado começa com ${findScoreMax(difficulty).toLocaleString("pt-BR")} pts no relógio.`}
          </p>
          <div className="mt-5">
            <ShareBar
              text={shareText}
              label="Chama a galera"
              compact
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

