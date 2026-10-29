"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
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
  ruaProximity,
  ruaProximityCopy,
  ruaScoreForGuess,
  type CityGeo,
  type RuaProximity,
} from "@/lib/city-geo";
import {
  ResultMark,
  ResultShell,
} from "@/components/game/ResultShell";
import {
  PlayerNameForm,
  PlayerNameLanding,
} from "@/components/game/PlayerNameForm";
import {
  countryAt,
  ensureCountryIndex,
  sameCountry,
} from "@/lib/country-lookup";
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
  submitModeScore,
} from "@/lib/mode-ranking";
import {
  claimNickname,
  getPlayerName,
  sanitizeName,
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
      <div className="flex h-[min(52svh,520px)] items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-white sm:h-[420px] lg:h-[460px]">
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
      <div className="flex h-[min(48svh,440px)] items-center justify-center bg-[var(--sand)] sm:h-auto sm:aspect-[2/1]">
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

export function RuaApp({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>("landing");
  useScrollTop([phase]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [city, setCity] = useState<CityGeo | null>(null);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState<Pin | null>(null);
  const [lastKm, setLastKm] = useState(0);
  const [proximity, setProximity] = useState<RuaProximity>("country");
  const [guessCountryName, setGuessCountryName] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const confirmingLockRef = useRef(false);
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

  const citiesTotal = cityCatalogSize(difficulty);

  async function refreshBoard() {
    const res = await fetchModeLeaderboard("rua", getPlayerName());
    setBoard(res.entries);
    setBoardGlobal(res.global);
    setBoardError(res.error || null);
    if (res.myRank && res.myRank > 0) setMyRank(res.myRank);
    if (typeof res.myScore === "number" && res.myScore > 0) {
      setBest((b) => Math.max(b, res.myScore!));
    }
  }

  useEffect(() => {
    setBest(getModeBest("rua"));
    setPlayerNameState(getPlayerName());
    void refreshBoard();
    void ensureCountryIndex().catch(() => {});
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function openRank(source: string) {
    trackRankingView("rua", source);
    void refreshBoard().then(() => setShowRank(true));
  }

  function startGame(d: Difficulty) {
    const dealt = dealRuaRun(d, 1);
    setDifficulty(d);
    setCity(dealt[0] ?? null);
    setScore(0);
    setGuess(null);
    setLastKm(0);
    setProximity("country");
    setGuessCountryName(null);
    setConfirming(false);
    confirmingLockRef.current = false;
    setElapsed(0);
    setRunning(true);
    setNeedsName(false);
    setNameFeedback("");
    setMyRank(null);
    setWon(false);
    setPhase("guess");
    trackGameStart("rua", d);
  }

  async function publishScore(
    total: number,
    name: string,
    opts?: { isNewName?: boolean },
  ) {
    setSavingRank(true);
    try {
      const result = await submitModeScore("rua", name, total, opts);
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
          result.ownerScore
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
    trackGameFinish("rua", {
      difficulty,
      won: hit,
      score: finalScore,
      elapsedSec: elapsed,
    });
    if (!hit || finalScore <= 0) return;
    const name = getPlayerName();
    if (!name) {
      setNeedsName(true);
      trackNamePrompt("rua");
      return;
    }
    await publishScore(finalScore, name);
  }

  async function confirmGuess() {
    if (!city || !guess || confirming || confirmingLockRef.current) return;
    confirmingLockRef.current = true;
    setConfirming(true);
    try {
      const km = distanceKm(guess, { lat: city.lat, lng: city.lng });
      const guessed = await countryAt(guess.lat, guess.lng);
      // GeoJSON compacto erra fronteiras (ex.: Genebra=FR). Perto da cidade = país ok.
      const countryOk =
        sameCountry(city.country, guessed?.iso) || km <= 20;
      const pts = ruaScoreForGuess(km, difficulty, countryOk);
      setLastKm(km);
      setProximity(countryOk ? ruaProximity(km) : "country");
      setGuessCountryName(guessed?.name || null);
      setScore(pts);
      await finish(pts, countryOk);
    } finally {
      setConfirming(false);
      confirmingLockRef.current = false;
    }
  }

  async function saveLandingName() {
    setSavingRank(true);
    try {
      const claimed = await claimNickname(nameDraft, board);
      if (!claimed.ok) {
        setNameFeedback(claimed.error);
        return;
      }
      setPlayerNameState(claimed.name);
      setNameFeedback("");
      trackNameSubmit("rua", { success: true });
    } finally {
      setSavingRank(false);
    }
  }

  async function saveNameAndRank() {
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
    trackNameSubmit("rua", { success: ok });
    if (ok) {
      setNeedsName(false);
      setNameFeedback("");
    }
  }

  const resultCopy = useMemo(() => {
    if (!won) {
      return {
        eyebrow: "Resultado · erro",
        title: "Errou!",
        subtitle: guessCountryName
          ? `País errado (${guessCountryName}). Mesmo perto da fronteira, não conta.`
          : "País errado — precisa cravar o país certo.",
      };
    }
    return ruaProximityCopy(proximity);
  }, [won, proximity, guessCountryName]);

  const shareText = useMemo(() => {
    if (phase === "result" && city) {
      const tag = won
        ? proximity === "street"
          ? "cravei a rua"
          : proximity === "city"
            ? "acertei a cidade"
            : proximity === "region"
              ? "acertei a região"
              : "acertei o país"
        : "errei o país";
      return `Rua da Amargura · ${tag} · ${formatDistance(lastKm)} · ${score.toLocaleString("pt-BR")} pts\n${buildInviteText("rua").split("\n").pop()}`;
    }
    return `Rua da Amargura no Cadê Flavinho — uma rua, um chute.\n${buildInviteText("rua").split("\n").pop()}`;
  }, [phase, score, lastKm, won, city, proximity]);

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
            onClick={() => openRank("header")}
          >
            Ranking
          </Button>        </div>
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

              <PlayerNameLanding
                playerName={playerName}
                draft={nameDraft}
                onDraftChange={setNameDraft}
                onSave={() => void saveLandingName()}
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
                    ? "Um Street View. Um pin no mapa. Acertou ou errou — acabou."
                    : "Pode jogar sem apelido — mas pra subir no ranking, entra no placar acima."}
              </p>
              <div className="mt-5">
                <ShareBar
                  text={shareText}
                  label="Chama a galera"
                  compact
                  mode="rua"
                  source="landing"
                />
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
              shareMode="rua"
              onViewFull={() => openRank("landing_board")}
            />
          </div>
        )}

        {phase === "guess" && city && (
          <section className="animate-rise mx-auto flex max-w-3xl flex-col gap-3 sm:gap-5">
            <div className="overflow-hidden rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[6px_6px_0_var(--ink)]">
              <StreetView
                lat={city.lat}
                lng={city.lng}
                seed={`${city.id}-${difficulty}`}
                fallbackPhoto={city.photo}
                className="!aspect-auto h-[min(48svh,440px)] sm:h-auto sm:!aspect-[2/1]"
              />
              <div className="border-t-2 border-[var(--ink)]/10 px-4 py-2.5 sm:py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand)] sm:text-xs">
                  Única tentativa
                </p>
                <h2 className="mt-0.5 font-[family-name:var(--font-display)] text-lg text-[var(--ink)] sm:mt-1 sm:text-xl">
                  Onde o Flavinho sumiu?
                </h2>
                <p className="mt-0.5 hidden text-sm text-[var(--muted)] sm:mt-1 sm:block">
                  Anda na rua (setas ou clique no chão), olha em volta, marca no
                  mapa e confirma. Um chute só.
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)] sm:hidden">
                  Anda, olha em volta, marca no mapa. Um chute só.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <GuessMap guess={guess} locked={false} onGuess={setGuess} />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="lg"
                  disabled={!guess || confirming}
                  onClick={() => void confirmGuess()}
                >
                  {confirming ? "Conferindo…" : "Confirmar chute"}
                </Button>
                <p className="text-sm text-[var(--muted)]">
                  {guess
                    ? "Pin plantado. País errado = erro; certo = vale a distância."
                    : "Toque no mapa pra chutar."}
                </p>
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                Street View © Google · mapa de chute © OpenStreetMap
              </p>
            </div>
          </section>
        )}

        {phase === "result" && city && (
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="overflow-hidden rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[8px_8px_0_var(--ink)]">
              <GuessMap
                guess={guess}
                answer={{ lat: city.lat, lng: city.lng }}
                locked
                onGuess={() => {}}
              />
            </div>
            <ResultShell
              won={won}
              eyebrow={resultCopy.eyebrow}
              title={resultCopy.title}
              subtitle={resultCopy.subtitle}
            >
              <div className="flex flex-col items-center gap-3">
                <ResultMark won={won} />
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {won ? "A rua era" : "Na verdade era"}
                </p>
                <p className="font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
                  {city.name}
                </p>
                <p
                  className={`text-base font-bold ${
                    won ? "text-[#1f8a5b]" : "text-[#c2410c]"
                  }`}
                >
                  {city.country} · você ficou a {formatDistance(lastKm)}
                </p>
                {!won ? (
                  <div className="mt-1 w-full rounded-2xl border-[3px] border-dashed border-[#c2410c]/60 bg-white/80 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#c2410c]">
                      Seu chute
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                      {guessCountryName
                        ? `Caiu em ${guessCountryName}`
                        : "Fora do país certo"}
                    </p>
                  </div>
                ) : proximity !== "street" ? (
                  <div className="mt-1 w-full rounded-2xl border-[3px] border-dashed border-[#1f8a5b]/50 bg-white/80 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1f8a5b]">
                      Quão perto
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                      {proximity === "city"
                        ? "Cidade / área metropolitana"
                        : proximity === "region"
                          ? "Região do país"
                          : "Só o país (bem longe)"}
                    </p>
                  </div>
                ) : null}
                <p className="mt-2 inline-flex rounded-full border-2 border-[var(--ink)] bg-white px-4 py-1.5 text-sm font-bold text-[var(--ink)] shadow-[3px_3px_0_var(--ink)]">
                  {score.toLocaleString("pt-BR")} pts · {formatClock(elapsed)}
                  {myRank ? ` · #${myRank} mundial` : ""}
                </p>
              </div>

              {needsName && won ? (
                <div className="mt-5 space-y-3">
                  <PlayerNameForm
                    value={nameDraft}
                    onChange={setNameDraft}
                    onSubmit={() => void saveNameAndRank()}
                    busy={savingRank}
                    error={nameFeedback}
                  />
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    Entra no placar pra gravar os{" "}
                    {score.toLocaleString("pt-BR")} pts — depois joga de novo.
                  </p>
                  <Button variant="secondary" onClick={onBack}>
                    Trocar modo
                  </Button>
                </div>
              ) : (
                <>
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
                      mode="rua"
                      source="result"
                    />
                  </div>
                </>
              )}
            </ResultShell>
          </div>
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
        shareText={shareText}
        shareMode="rua"
      />
      <LegalNotice
        onSupport={() => {
          trackSupportOpen("rua");
          setShowPix(true);
        }}
      />
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
      hint: "24 cidades · país certo já conta",
      tone: "bg-[#e8f6ef] border-[#1f8a5b]",
    },
    {
      id: "medium",
      label: "Médio",
      hint: "56 cidades · precisão na distância",
      tone: "bg-[#fff4d6] border-[#d4a017]",
    },
    {
      id: "hard",
      label: "Difícil",
      hint: "124 cidades · tem que cravar perto",
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
