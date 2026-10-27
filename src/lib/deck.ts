import { cityCatalogSizeFor } from "@/lib/city-catalog";
import {
  clueCountForLives,
  pickCityClues,
  resolveClueTier,
} from "@/lib/city-clues";
import { LEVELS, type Level } from "@/lib/levels";
import type { Difficulty } from "@/lib/types";

/** Lives per game mode — keep in sync with GameApp. */
export const LIVES_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 5,
  medium: 3,
  hard: 2,
};

/** Attach famous city traits matched to the game difficulty + lives. */
export function withCityClues(level: Level, gameDifficulty: Difficulty): Level {
  const tier = resolveClueTier(gameDifficulty, level.difficulty);
  const lives = LIVES_BY_DIFFICULTY[gameDifficulty];
  return {
    ...level,
    clues: pickCityClues(
      level.correctCity,
      tier,
      `${level.id}:${gameDifficulty}`,
      clueCountForLives(lives),
    ),
  };
}

const STORAGE_RECENT = "flavinho_recent_episodes";
const STORAGE_DECK = "flavinho_active_deck";
const RECENT_LIMIT = 24;
const RUN_SIZE = 6;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function shuffle<T>(arr: T[], rand = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRecentEpisodeIds(): string[] {
  return readJson<string[]>(STORAGE_RECENT, []);
}

export function rememberEpisode(id: string) {
  const recent = getRecentEpisodeIds().filter((x) => x !== id);
  recent.unshift(id);
  writeJson(STORAGE_RECENT, recent.slice(0, RECENT_LIMIT));
}

function poolForDifficulty(difficulty: Difficulty): Level[] {
  return LEVELS.filter((l) => l.difficulty === difficulty);
}

/** Fresh run: prefers unseen dossiers + diverse cities. */
export function dealNewRun(
  size = RUN_SIZE,
  difficulty: Difficulty = "medium",
): Level[] {
  const recent = new Set(getRecentEpisodeIds());
  const byDiff = poolForDifficulty(difficulty);
  const base = byDiff.length >= size ? byDiff : LEVELS;
  const fresh = base.filter((l) => !recent.has(l.id));
  const pool = fresh.length >= size ? fresh : base;

  // Greedy: pick episodes that introduce new cities first
  const shuffled = shuffle(pool);
  const diversified: Level[] = [];
  const cities = new Set<string>();

  for (const level of shuffled) {
    if (diversified.length >= size) break;
    if (!cities.has(level.correctCity)) {
      diversified.push(level);
      cities.add(level.correctCity);
    }
  }
  for (const level of shuffled) {
    if (diversified.length >= size) break;
    if (!diversified.some((d) => d.id === level.id)) {
      diversified.push(level);
      cities.add(level.correctCity);
    }
  }
  while (diversified.length < size) {
    const extra = shuffle(LEVELS).find(
      (l) => !diversified.some((d) => d.id === l.id),
    );
    if (!extra) break;
    diversified.push(extra);
  }

  writeJson(
    STORAGE_DECK,
    diversified.map((l) => l.id),
  );
  return diversified.map((l) => withCityClues(l, difficulty));
}

export function episodeCatalogSize(difficulty: Difficulty = "medium") {
  return poolForDifficulty(difficulty).length;
}

export function cityCatalogSize(difficulty: Difficulty = "medium") {
  return cityCatalogSizeFor(difficulty);
}
