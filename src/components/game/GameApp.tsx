"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CrowdScene } from "@/components/game/CrowdScene";
import { PixPanel } from "@/components/game/PixPanel";
import {
  cityCatalogSize,
  dealNewRun,
  episodeCatalogSize,
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
  buildShareUrl,
  buildWhatsAppShare,
  getBestScore,
  hasUnlockedHints,
  saveBestScore,
} from "@/lib/monetization";

type Phase = "landing" | "briefing" | "clues" | "find" | "win" | "fail-city";

const LIVES_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 5,
  medium: 3,
  hard: 2,
  mix: 3,
};

export function GameApp() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [difficulty, setDifficulty] = useState<Difficulty>("mix");
  const [run, setRun] = useState<Level[]>([]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [score, setScore] = useState(1000);
  const [misses, setMisses] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [best, setBest] = useState(0);
  const [showPix, setShowPix] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const catalogSize = episodeCatalogSize();
  const citiesTotal = cityCatalogSize();

  const level: Level | null = run[levelIndex] ?? null;
  const city = level ? getCity(level.correctCity) : null;

  const cityOptions = useMemo(() => {
    if (!level) return [];
    return pickCityOptions(level.correctCity, `${level.id}-${levelIndex}-${difficulty}`);
  }, [level, levelIndex, difficulty]);

  const crowdCount = useMemo(() => {
    if (!level) return 40;
    const base = level.scene.crowdCount;
    if (difficulty === "easy") return Math.max(28, Math.floor(base * 0.75));
    if (difficulty === "hard") return Math.floor(base * 1.3);
    return base;
  }, [level, difficulty]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const progressLabel = useMemo(
    () => (run.length ? `${levelIndex + 1} / ${run.length}` : "—"),
    [levelIndex, run.length],
  );

  function startGame(diff: Difficulty = difficulty) {
    const dealt = dealNewRun(6, diff);
    setDifficulty(diff);
    setRun(dealt);
    rememberEpisode(dealt[0].id);
    setBest(getBestScore());
    setHintUnlocked(hasUnlockedHints());
    setPhase("briefing");
    setLevelIndex(0);
    setClueIndex(0);
    setScore(1000);
    setMisses(0);
    setLives(LIVES_BY_DIFFICULTY[diff]);
    setFeedback("");
    setShowHint(false);
    setElapsed(0);
    setRunning(true);
  }

  function restartToMenu() {
    setPhase("landing");
    setRunning(false);
    setFeedback("");
    setShowHint(false);
    setShowPix(false);
  }

  function goToClues() {
    setPhase("clues");
    setClueIndex(0);
    setFeedback("");
  }

  function pickCity(id: CityId) {
    if (!level || !city) return;
    if (id === level.correctCity) {
      setFeedback(`Mapa fechou em ${city.name}. Agora é olho vivo na multidão.`);
      setScore((s) => s + 250);
      setPhase("find");
      return;
    }
    const wrong = level.wrongHints[id] || "Rastro frio. Outra cidade.";
    setFeedback(wrong);
    setScore((s) => Math.max(0, s - 80));
    setLives((l) => {
      const next = l - 1;
      if (next <= 0) {
        setPhase("fail-city");
        setRunning(false);
      }
      return next;
    });
    setClueIndex((c) => Math.min(c + 1, level.clues.length - 1));
  }

  function onFound() {
    const bonus = Math.max(50, 400 - misses * 40);
    const nextScore = score + bonus;
    setScore(nextScore);
    setRunning(false);
    saveBestScore(nextScore);
    setBest(getBestScore());
    setPhase("win");
  }

  function onMiss() {
    setMisses((m) => m + 1);
    setScore((s) => Math.max(0, s - 25));
  }

  function nextLevel() {
    if (levelIndex >= run.length - 1) {
      setPhase("landing");
      setRunning(false);
      return;
    }
    const next = levelIndex + 1;
    rememberEpisode(run[next].id);
    setLevelIndex(next);
    setClueIndex(0);
    setMisses(0);
    setLives(LIVES_BY_DIFFICULTY[difficulty]);
    setFeedback("");
    setShowHint(false);
    setPhase("briefing");
    setRunning(true);
  }

  function shareWin() {
    if (!level) return;
    const text = `${level.shareLine}\nPontuação: ${score}\n${buildShareUrl()}`;
    const url = buildWhatsAppShare(text);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function unlockVisualHint() {
    if (hintUnlocked) {
      setShowHint(true);
      return;
    }
    setShowPix(true);
  }

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
          Onde Está Flavinho?
        </button>
        <div className="flex items-center gap-2">
          {phase !== "landing" && (
            <>
              <div className="hidden rounded-full border border-[var(--ink)]/15 bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--ink)] sm:block">
                Ep {progressLabel} · {score} pts · {formatTime(elapsed)}
              </div>
              <Button variant="secondary" size="sm" onClick={restartToMenu}>
                Recomeçar
              </Button>
            </>
          )}
          <Button variant="money" size="sm" onClick={() => setShowPix((v) => !v)}>
            Apoiar
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
        {phase === "landing" && (
          <Landing
            best={best}
            catalogSize={catalogSize}
            citiesTotal={citiesTotal}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onStart={() => startGame(difficulty)}
            onPix={() => setShowPix(true)}
          />
        )}

        {phase === "briefing" && level && (
          <section className="animate-rise mx-auto max-w-2xl rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6 shadow-[8px_8px_0_var(--ink)] sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
              Pasta carimbada · confidencial
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)] sm:text-4xl">
              {level.title}
            </h1>
            <p className="mt-3 text-[var(--muted)]">
              Três recortes chegaram na mesa. Cruze as pistas, chute a cidade e,
              se o mapa fechar, ele ainda tem que aparecer no meio da multidão.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-lg bg-[var(--sand)] px-3 py-1.5">
                Modo: {labelMode(difficulty)}
              </span>
              <span className="rounded-lg bg-[var(--sand)] px-3 py-1.5">
                Dossiê: {labelDifficulty(level.difficulty)}
              </span>
              <span className="rounded-lg bg-[var(--sand)] px-3 py-1.5">
                Tentativas: {lives}
              </span>
              <span className="rounded-lg bg-[var(--sand)] px-3 py-1.5">
                Episódio {progressLabel}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={goToClues}>
                Abrir as pistas
              </Button>
              <Button variant="secondary" onClick={() => setShowPix(true)}>
                Mandar um café
              </Button>
            </div>
          </section>
        )}

        {phase === "clues" && level && (
          <section className="animate-rise grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
                Recortes da noite
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                Qual cidade fecha o mapa?
              </h2>
              <ul className="mt-4 space-y-3">
                {level.clues.slice(0, clueIndex + 1).map((clue, i) => (
                  <li
                    key={`${level.id}-${i}`}
                    className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--sand)] px-4 py-3 text-[var(--ink)]"
                  >
                    <span className="mr-2 text-xs font-bold uppercase text-[var(--muted)]">
                      Recorte {i + 1}
                    </span>
                    {clue}
                  </li>
                ))}
              </ul>
              {feedback && (
                <p className="mt-4 rounded-xl bg-[var(--alert)]/10 px-4 py-3 text-sm font-medium text-[var(--alert)]">
                  {feedback}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-[var(--muted)]">
                <span>Tentativas: {lives}</span>
                <span>·</span>
                <span>{score} pts</span>
              </div>
            </div>

            <div className="rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                Marque no mapa
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Seis cidades desta pasta (muda a cada dossiê).
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {cityOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickCity(c.id)}
                    className="rounded-2xl border-2 border-[var(--ink)] bg-white px-3 py-3 text-left transition hover:-translate-y-0.5 hover:bg-[var(--brand)]/15"
                  >
                    <div className="font-bold text-[var(--ink)]">
                      {c.name}
                      <span className="ml-1 text-xs font-semibold text-[var(--muted)]">
                        · {c.country}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted)]">{c.blurb}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {phase === "find" && level && city && (
          <section className="animate-rise space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
                  Multidão · {city.name}
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
                  Ele está aí. Ache.
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  Cliques errados: {misses} · Dezenas de disfarces. Um só é o real.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl border-2 border-[var(--ink)] bg-[var(--paper)] px-2 py-1.5 shadow-[3px_3px_0_var(--ink)]">
                  <Image
                    src="/game/disguises/real.png"
                    alt="Referência do Flavinho sem disfarce"
                    width={48}
                    height={72}
                    className="h-14 w-auto object-contain"
                    unoptimized
                  />
                  <div className="pr-1">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                      Procurado · sem disfarce
                    </p>
                    <p className="text-sm font-black text-[var(--ink)]">Flavinho</p>
                    <p className="text-[11px] text-[var(--muted)]">blazer azul, sem chapéu</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={unlockVisualHint}>
                  {showHint ? "Dica ativa" : "Pedir dica"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const text = `To no rastro do Flavinho em ${city.name}: ${buildShareUrl()}`;
                    window.open(
                      buildWhatsAppShare(text),
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                >
                  Mandar no Zap
                </Button>
              </div>
            </div>

            <CrowdScene
              seed={`${level.id}-${levelIndex}-${difficulty}`}
              background={level.scene.background}
              crowdCount={crowdCount}
              flavinhoScale={level.scene.flavinhoScale}
              ground={level.scene.ground}
              onFound={onFound}
              onMiss={onMiss}
              showHint={showHint}
            />

            {showPix && (
              <PixPanel
                mode="hint"
                onHintUnlocked={() => {
                  setHintUnlocked(true);
                  setShowHint(true);
                }}
              />
            )}
          </section>
        )}

        {phase === "win" && city && (
          <section className="animate-rise mx-auto max-w-xl rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6 text-center shadow-[8px_8px_0_var(--ink)] sm:p-8">
            <Image
              src="/game/disguises/real.png"
              alt="Flavinho encontrado"
              width={140}
              height={200}
              className="mx-auto object-contain"
              unoptimized
            />
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
              Pegou o rastro
            </h2>
            <p className="mt-2 text-[var(--muted)]">
              Local: {city.name}. Pontuação: <strong>{score}</strong> · Recorde:{" "}
              <strong>{best}</strong>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={nextLevel}>
                {levelIndex >= run.length - 1
                  ? "Nova rodada (outros dossiês)"
                  : "Próximo dossiê"}
              </Button>
              <Button variant="secondary" onClick={shareWin}>
                Estourar no Zap
              </Button>
              <Button variant="secondary" onClick={restartToMenu}>
                Recomeçar
              </Button>
              <Button variant="money" onClick={() => setShowPix(true)}>
                Café via PIX
              </Button>
            </div>
            {showPix && (
              <div className="mt-5 text-left">
                <PixPanel />
              </div>
            )}
          </section>
        )}

        {phase === "fail-city" && (
          <section className="animate-rise mx-auto max-w-xl rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6 text-center shadow-[8px_8px_0_var(--ink)]">
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Rastro apagado
            </h2>
            <p className="mt-2 text-[var(--muted)]">
              Acabaram as tentativas. Ele trocou de cidade enquanto você
              hesitava.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => startGame(difficulty)}>Tentar de novo</Button>
              <Button variant="secondary" onClick={restartToMenu}>
                Recomeçar
              </Button>
              <Button variant="money" onClick={() => setShowPix(true)}>
                Mandar um café
              </Button>
            </div>
          </section>
        )}

        {showPix && phase !== "find" && phase !== "win" && (
          <div className="mx-auto mt-8 max-w-xl">
            <PixPanel />
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-[var(--ink)]/10 px-4 py-6 text-center text-xs text-[var(--muted)]">
        Sátira / humor. Não é notícia, denúncia, campanha eleitoral nem afiliação
        partidária. Apoio via PIX é voluntário.
      </footer>
    </div>
  );
}

function Landing({
  best,
  catalogSize,
  citiesTotal,
  difficulty,
  onDifficultyChange,
  onStart,
  onPix,
}: {
  best: number;
  catalogSize: number;
  citiesTotal: number;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  onStart: () => void;
  onPix: () => void;
}) {
  const modes: { id: Difficulty; label: string; hint: string }[] = [
    { id: "easy", label: "Fácil", hint: "5 tentativas · multidão menor" },
    { id: "medium", label: "Médio", hint: "3 tentativas · padrão" },
    { id: "hard", label: "Difícil", hint: "2 tentativas · multidão cheia" },
    { id: "mix", label: "Surpresa", hint: "mistura tudo" },
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
            Onde Está Flavinho?
          </h1>
          <p className="mt-4 max-w-md text-lg text-[var(--muted)]">
            Ele saiu da agenda. Sobrou um blazer azul, {citiesTotal} cidades no
            radar e uma multidão que não colabora.
          </p>

          <div className="mt-6">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--ink)]">
              Escolha a dificuldade
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {modes.map((m) => {
                const active = difficulty === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onDifficultyChange(m.id)}
                    className={`rounded-2xl border-2 px-3 py-2.5 text-left transition ${
                      active
                        ? "border-[var(--ink)] bg-[var(--brand)] text-white shadow-[3px_3px_0_var(--ink)]"
                        : "border-[var(--ink)]/40 bg-white/80 text-[var(--ink)] hover:border-[var(--ink)] hover:bg-white"
                    }`}
                  >
                    <div className="font-[family-name:var(--font-display)] text-base">
                      {m.label}
                    </div>
                    <div
                      className={`text-[11px] leading-snug ${
                        active ? "text-white/85" : "text-[var(--muted)]"
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
              Abrir o dossiê
            </Button>
            <Button variant="secondary" size="lg" onClick={onPix}>
              Mandar um café
            </Button>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            {best > 0
              ? `Seu recorde: ${best} pts · ${catalogSize} dossiês · ${citiesTotal} cidades`
              : `${catalogSize} dossiês no arquivo. Cada rodada embaralha 6 cidades diferentes.`}
          </p>
        </div>

        <div className="animate-float relative mx-auto w-full max-w-xs">
          <div className="absolute -inset-3 rounded-[2rem] bg-[var(--brand)]/35 blur-xl" />
          <Image
            src="/game/disguises/real.png"
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

function labelDifficulty(d: Level["difficulty"]) {
  if (d === "easy") return "morna";
  if (d === "medium") return "quente";
  return "escaldante";
}

function labelMode(d: Difficulty) {
  if (d === "easy") return "Fácil";
  if (d === "medium") return "Médio";
  if (d === "hard") return "Difícil";
  return "Surpresa";
}

function formatTime(total: number) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
