import { getDeviceKey } from "@/lib/device";
import type { GameModeId } from "@/lib/modes";

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

export function clearPlayerName() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_NAME);
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
  window.localStorage.setItem(
    STORAGE_LOCAL_BOARD,
    JSON.stringify(entries.slice(0, MAX_BOARD)),
  );
}

/** Upsert by name: keep highest score. Local mirror only. */
export function upsertLocalBoard(name: string, score: number): RankEntry[] {
  const clean = sanitizeName(name);
  if (!clean || score <= 0) return readLocalBoard();
  const board = readLocalBoard().filter(
    (e) => e.name.toLowerCase() !== clean.toLowerCase(),
  );
  const prev = readLocalBoard().find(
    (e) => e.name.toLowerCase() === clean.toLowerCase(),
  );
  const best = Math.max(score, prev?.score ?? 0);
  board.push({ name: clean, score: best, at: Date.now() });
  board.sort((a, b) => b.score - a.score || a.at - b.at);
  writeLocalBoard(board);
  return board;
}

export async function fetchLeaderboard(
  playerName?: string,
  mode: GameModeId = "mestre",
): Promise<{
  entries: RankEntry[];
  global: boolean;
  myRank?: number;
  myScore?: number;
  error?: string;
}> {
  try {
    const who = sanitizeName(playerName || getPlayerName());
    const params = new URLSearchParams({ mode });
    if (who) params.set("name", who);
    const res = await fetch(`/api/rank?${params}`, { cache: "no-store" });
    const data = (await res.json()) as {
      entries?: RankEntry[];
      global?: boolean;
      myRank?: number;
      myEntry?: RankEntry;
      error?: string;
    };
    const remote = Array.isArray(data.entries) ? data.entries : [];
    return {
      entries: remote,
      global: Boolean(data.global),
      myRank:
        typeof data.myRank === "number" && data.myRank > 0
          ? data.myRank
          : undefined,
      myScore:
        typeof data.myEntry?.score === "number"
          ? data.myEntry.score
          : undefined,
      error: data.error,
    };
  } catch {
    return {
      entries: [],
      global: false,
      error: "Não deu pra carregar o ranking mundial.",
    };
  }
}

/** Reserva apelido localmente após checar disponibilidade no placar. */
export async function claimNickname(
  draft: string,
  board: RankEntry[] = [],
): Promise<{ ok: true; name: string } | { ok: false; error: string }> {
  const clean = sanitizeName(draft);
  if (!clean || clean.length < 2) {
    return { ok: false, error: "Apelido curto demais." };
  }
  const alreadyMine = getPlayerName().toLowerCase() === clean.toLowerCase();
  if (!alreadyMine) {
    const check = await checkNameAvailable(clean);
    if (check.error) {
      // Sem fail-open: rede/API fora não libera nick alheio.
      const localHit = board.find(
        (e) => e.name.toLowerCase() === clean.toLowerCase(),
      );
      if (localHit) {
        return {
          ok: false,
          error: `"${localHit.name}" já foi escolhido. Escolhe outro apelido.`,
        };
      }
      return {
        ok: false,
        error: "Não deu pra checar o apelido agora. Tenta de novo.",
      };
    }
    if (check.taken || !check.available) {
      return {
        ok: false,
        error: check.ownerScore
          ? `"${check.name || clean}" já foi escolhido (${check.ownerScore.toLocaleString("pt-BR")} pts). No mesmo aparelho ou IP dá pra reivindicar — senão escolhe outro.`
          : `"${clean}" já foi escolhido. No mesmo aparelho ou IP dá pra reivindicar — senão escolhe outro.`,
      };
    }
  }
  setPlayerName(clean);
  return { ok: true, name: clean };
}

export async function checkNameAvailable(name: string): Promise<{
  available: boolean;
  taken: boolean;
  reclaimable?: boolean;
  ownerScore?: number;
  name?: string;
  error?: string;
}> {
  const clean = sanitizeName(name);
  if (clean.length < 2) {
    return { available: false, taken: false, error: "Nome curto demais" };
  }
  try {
    const deviceKey = getDeviceKey();
    const params = new URLSearchParams({ check: clean });
    if (deviceKey) params.set("deviceKey", deviceKey);
    const res = await fetch(`/api/rank?${params}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as {
      available?: boolean;
      taken?: boolean;
      reclaimable?: boolean;
      ownerScore?: number;
      name?: string;
      error?: string;
    };
    if (!res.ok) {
      return {
        available: false,
        taken: false,
        error: data.error || "Falha ao checar apelido",
      };
    }
    const available = data.available === true || data.reclaimable === true;
    const taken = Boolean(data.taken) && !available;
    return {
      available,
      taken,
      reclaimable: Boolean(data.reclaimable),
      ownerScore:
        typeof data.ownerScore === "number" ? data.ownerScore : undefined,
      name: data.name,
    };
  } catch {
    return {
      available: false,
      taken: false,
      error: "Falha de rede ao checar apelido",
    };
  }
}

export async function submitScore(
  name: string,
  score: number,
  opts?: { isNewName?: boolean; mode?: GameModeId; accumulate?: boolean },
): Promise<{
  entries: RankEntry[];
  rank: number;
  global: boolean;
  bestScore?: number;
  error?: string;
  code?: string;
  ownerScore?: number;
}> {
  const clean = sanitizeName(name);
  const deviceKey = getDeviceKey();
  const isNewName = Boolean(opts?.isNewName);
  const accumulate = Boolean(opts?.accumulate);
  const mode = opts?.mode || "mestre";

  try {
    const res = await fetch("/api/rank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: clean,
        score,
        deviceKey,
        isNewName,
        mode,
        accumulate,
      }),
    });
    const data = (await res.json()) as {
      entries?: RankEntry[];
      rank?: number;
      bestScore?: number;
      global?: boolean;
      error?: string;
      code?: string;
      ownerScore?: number;
    };
    if (!res.ok) {
      // Nunca devolve board local como se fosse mundial.
      return {
        entries: [],
        rank: 0,
        global: Boolean(data.global),
        error: data.error || "Falha ao gravar no ranking mundial",
        code: data.code,
        ownerScore:
          typeof data.ownerScore === "number" ? data.ownerScore : undefined,
      };
    }
    const entries = Array.isArray(data.entries) ? data.entries : [];
    const rank =
      typeof data.rank === "number"
        ? data.rank
        : entries.findIndex(
            (e) => e.name.toLowerCase() === clean.toLowerCase(),
          ) + 1;
    const bestScore =
      typeof data.bestScore === "number" ? data.bestScore : undefined;
    // espelho local com o total de carreira (não o delta)
    if (mode === "mestre" && typeof bestScore === "number" && bestScore > 0) {
      upsertLocalBoard(clean, bestScore);
    }
    return {
      entries,
      rank: rank > 0 ? rank : 0,
      global: true,
      bestScore,
    };
  } catch {
    return {
      entries: [],
      rank: 0,
      global: false,
      error: "Falha de rede no ranking mundial",
    };
  }
}
