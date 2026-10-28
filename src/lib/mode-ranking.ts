import type { GameModeId } from "@/lib/modes";
import {
  getPlayerName,
  sanitizeName,
  type RankEntry,
} from "@/lib/ranking";

const MAX_BOARD = 20;

function storageKey(mode: GameModeId) {
  return `flavinho_board_${mode}`;
}

function bestKey(mode: GameModeId) {
  return `flavinho_best_${mode}`;
}

export function readModeBoard(mode: GameModeId): RankEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(mode));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RankEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeModeBoard(mode: GameModeId, entries: RankEntry[]) {
  window.localStorage.setItem(
    storageKey(mode),
    JSON.stringify(entries.slice(0, MAX_BOARD)),
  );
}

export function upsertModeBoard(
  mode: GameModeId,
  name: string,
  score: number,
): RankEntry[] {
  const clean = sanitizeName(name);
  if (!clean || score <= 0) return readModeBoard(mode);
  const board = readModeBoard(mode).filter(
    (e) => e.name.toLowerCase() !== clean.toLowerCase(),
  );
  const prev = readModeBoard(mode).find(
    (e) => e.name.toLowerCase() === clean.toLowerCase(),
  );
  const best = Math.max(score, prev?.score ?? 0);
  board.push({ name: clean, score: best, at: Date.now() });
  board.sort((a, b) => b.score - a.score || a.at - b.at);
  writeModeBoard(mode, board);
  return board;
}

export function getModeBest(mode: GameModeId): number {
  if (typeof window === "undefined") return 0;
  const n = Number(window.localStorage.getItem(bestKey(mode)) || 0);
  return Number.isFinite(n) ? n : 0;
}

export function saveModeBest(mode: GameModeId, score: number): number {
  const prev = getModeBest(mode);
  const next = Math.max(prev, score);
  window.localStorage.setItem(bestKey(mode), String(next));
  return next;
}

export function submitModeScore(
  mode: GameModeId,
  name: string,
  score: number,
): { entries: RankEntry[]; rank: number } {
  const clean = sanitizeName(name) || getPlayerName();
  const entries = upsertModeBoard(mode, clean, score);
  saveModeBest(mode, score);
  const rank =
    entries.findIndex((e) => e.name.toLowerCase() === clean.toLowerCase()) + 1;
  return { entries, rank: rank > 0 ? rank : 0 };
}
