export type RankEntry = {
  name: string;
  score: number;
  at: number;
};

const STORAGE_NAME = "flavinho_player_name";
const STORAGE_LOCAL_BOARD = "flavinho_local_board";
const MAX_BOARD = 20;

export function getPlayerName(): string {
  if (typeof window === "undefined") return "";
  return (window.localStorage.getItem(STORAGE_NAME) || "").trim();
}

export function setPlayerName(name: string) {
  const clean = sanitizeName(name);
  if (!clean) return "";
  window.localStorage.setItem(STORAGE_NAME, clean);
  return clean;
}

export function sanitizeName(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{N}\s._\-']/gu, "")
    .trim()
    .slice(0, 16);
}

export function readLocalBoard(): RankEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_LOCAL_BOARD);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RankEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalBoard(entries: RankEntry[]) {
  window.localStorage.setItem(STORAGE_LOCAL_BOARD, JSON.stringify(entries.slice(0, MAX_BOARD)));
}

/** Upsert by name: keep highest score. */
export function upsertLocalBoard(name: string, score: number): RankEntry[] {
  const clean = sanitizeName(name);
  if (!clean || score <= 0) return readLocalBoard();
  const board = readLocalBoard().filter((e) => e.name.toLowerCase() !== clean.toLowerCase());
  const prev = readLocalBoard().find((e) => e.name.toLowerCase() === clean.toLowerCase());
  const best = Math.max(score, prev?.score ?? 0);
  board.push({ name: clean, score: best, at: Date.now() });
  board.sort((a, b) => b.score - a.score || a.at - b.at);
  writeLocalBoard(board);
  return board;
}

export async function fetchLeaderboard(): Promise<{
  entries: RankEntry[];
  global: boolean;
}> {
  try {
    const res = await fetch("/api/rank", { cache: "no-store" });
    if (!res.ok) throw new Error("rank fetch failed");
    const data = (await res.json()) as {
      entries?: RankEntry[];
      global?: boolean;
    };
    const remote = Array.isArray(data.entries) ? data.entries : [];
    if (remote.length > 0 || data.global) {
      return { entries: remote, global: Boolean(data.global) };
    }
  } catch {
    /* fall through to local */
  }
  return { entries: readLocalBoard(), global: false };
}

export async function submitScore(
  name: string,
  score: number,
): Promise<{ entries: RankEntry[]; rank: number; global: boolean }> {
  const clean = sanitizeName(name);
  const local = upsertLocalBoard(clean, score);

  try {
    const res = await fetch("/api/rank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: clean, score }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        entries?: RankEntry[];
        rank?: number;
        global?: boolean;
      };
      const entries = Array.isArray(data.entries) ? data.entries : local;
      const rank =
        typeof data.rank === "number"
          ? data.rank
          : entries.findIndex((e) => e.name.toLowerCase() === clean.toLowerCase()) + 1;
      return {
        entries,
        rank: rank > 0 ? rank : local.findIndex((e) => e.name.toLowerCase() === clean.toLowerCase()) + 1,
        global: Boolean(data.global),
      };
    }
  } catch {
    /* local only */
  }

  const rank = local.findIndex((e) => e.name.toLowerCase() === clean.toLowerCase()) + 1;
  return { entries: local, rank: rank || local.length, global: false };
}
