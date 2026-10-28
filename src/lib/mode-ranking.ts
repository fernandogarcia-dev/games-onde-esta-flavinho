import type { GameModeId } from "@/lib/modes";
import {
  fetchLeaderboard,
  getPlayerName,
  sanitizeName,
  submitScore,
  type RankEntry,
} from "@/lib/ranking";

const bestKey = (mode: GameModeId) => `flavinho_best_${mode}`;

/** @deprecated local only — prefer fetchModeLeaderboard */
export function readModeBoard(mode: GameModeId): RankEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`flavinho_board_${mode}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RankEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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

export async function fetchModeLeaderboard(
  mode: GameModeId,
  playerName?: string,
): Promise<{
  entries: RankEntry[];
  global: boolean;
  myRank?: number;
  myScore?: number;
  error?: string;
}> {
  return fetchLeaderboard(playerName || getPlayerName(), mode);
}

export async function submitModeScore(
  mode: GameModeId,
  name: string,
  score: number,
  opts?: { isNewName?: boolean },
): Promise<{
  entries: RankEntry[];
  rank: number;
  global: boolean;
  bestScore?: number;
  error?: string;
  code?: string;
  ownerScore?: number;
}> {
  const clean = sanitizeName(name) || getPlayerName();
  const result = await submitScore(clean, score, {
    isNewName: opts?.isNewName,
    mode,
  });
  if (result.bestScore) saveModeBest(mode, result.bestScore);
  else if (score > 0) saveModeBest(mode, score);
  return result;
}
