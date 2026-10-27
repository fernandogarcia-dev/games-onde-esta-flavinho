import { LEVELS, type Level } from "@/lib/levels";

const STORAGE_RECENT = "flavinho_recent_episodes";
const STORAGE_DECK = "flavinho_active_deck";
const RECENT_LIMIT = 18; // avoid repeats until many unique dossiers play
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

/** Build a fresh run of dossiers, preferring ones not seen recently. */
export function dealNewRun(size = RUN_SIZE): Level[] {
  const recent = new Set(getRecentEpisodeIds());
  const fresh = LEVELS.filter((l) => !recent.has(l.id));
  const pool = fresh.length >= size ? fresh : LEVELS;
  const dealt = shuffle(pool).slice(0, size);

  // If pool was small, still try to diversify cities in the run
  const cities = new Set<string>();
  const diversified: Level[] = [];
  for (const level of dealt) {
    if (diversified.length >= size) break;
    if (!cities.has(level.correctCity) || diversified.length + (size - cities.size) < size) {
      diversified.push(level);
      cities.add(level.correctCity);
    }
  }
  while (diversified.length < size) {
    const extra = shuffle(LEVELS).find((l) => !diversified.some((d) => d.id === l.id));
    if (!extra) break;
    diversified.push(extra);
  }

  writeJson(
    STORAGE_DECK,
    diversified.map((l) => l.id),
  );
  return diversified;
}

export function loadSavedRun(): Level[] | null {
  const ids = readJson<string[]>(STORAGE_DECK, []);
  if (!ids.length) return null;
  const levels = ids
    .map((id) => LEVELS.find((l) => l.id === id))
    .filter(Boolean) as Level[];
  return levels.length ? levels : null;
}

export function episodeCatalogSize() {
  return LEVELS.length;
}
