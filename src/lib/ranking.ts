import { getDeviceKey } from "@/lib/device";
import type { GameModeId } from "@/lib/modes";
import type { RankTrack } from "@/lib/rank-track";

export type RankEntry = {
  name: string;
  score: number;
  at: number;
};

export type { RankTrack };

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
  track: RankTrack = "anon",
  accessToken?: string | null,
): Promise<{
  entries: RankEntry[];
  global: boolean;
  myRank?: number;
  myScore?: number;
  error?: string;
  track: RankTrack;
}> {
  try {
    const who = sanitizeName(playerName || getPlayerName());
    const params = new URLSearchParams({ mode, track });
    if (who) params.set("name", who);
    const headers: HeadersInit = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetch(`/api/rank?${params}`, {
      cache: "no-store",
      headers,
    });
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
      track,
    };
  } catch {
    return {
      entries: [],
      global: false,
      error: "Não deu pra carregar o ranking mundial.",
      track,
    };
  }
}

/** Reserva apelido anônimo localmente após checar o placar Anônimos. */
export async function claimNickname(
  draft: string,
  board: RankEntry[] = [],
): Promise<
  | { ok: true; name: string }
  | { ok: false; error: string; suggestLogin?: boolean; takenName?: string }
> {
  const clean = sanitizeName(draft);
  if (!clean || clean.length < 2) {
    return { ok: false, error: "Apelido curto demais." };
  }
  const alreadyMine = getPlayerName().toLowerCase() === clean.toLowerCase();
  if (!alreadyMine) {
    const check = await checkNameAvailable(clean, "anon");
    if (check.error) {
      const localHit = board.find(
        (e) => e.name.toLowerCase() === clean.toLowerCase(),
      );
      if (localHit) {
        return {
          ok: false,
          error: `"${localHit.name}" já foi escolhido. Escolhe outro ou entra com Google.`,
          suggestLogin: true,
          takenName: localHit.name,
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
        suggestLogin: true,
        takenName: check.name || clean,
        error: check.ownerScore
          ? `"${check.name || clean}" já está no placar anônimo (${check.ownerScore.toLocaleString("pt-BR")} pts). Escolhe outro ou entra com Google pro placar Conta.`
          : `"${clean}" já está no placar anônimo. Escolhe outro ou entra com Google.`,
      };
    }
  }
  setPlayerName(clean);
  return { ok: true, name: clean };
}

export async function checkNameAvailable(
  name: string,
  track: RankTrack = "anon",
  accessToken?: string | null,
): Promise<{
  available: boolean;
  taken: boolean;
  ownerScore?: number;
  name?: string;
  error?: string;
  suggestLogin?: boolean;
}> {
  const clean = sanitizeName(name);
  if (clean.length < 2) {
    return { available: false, taken: false, error: "Nome curto demais" };
  }
  try {
    const deviceKey = getDeviceKey();
    const params = new URLSearchParams({ check: clean, track });
    if (deviceKey) params.set("deviceKey", deviceKey);
    const headers: HeadersInit = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetch(`/api/rank?${params}`, {
      cache: "no-store",
      headers,
    });
    const data = (await res.json()) as {
      available?: boolean;
      taken?: boolean;
      ownerScore?: number;
      name?: string;
      error?: string;
      suggestLogin?: boolean;
    };
    if (!res.ok) {
      return {
        available: false,
        taken: false,
        error: data.error || "Falha ao checar apelido",
      };
    }
    const available = data.available === true;
    const taken = Boolean(data.taken) && !available;
    return {
      available,
      taken,
      ownerScore:
        typeof data.ownerScore === "number" ? data.ownerScore : undefined,
      name: data.name,
      suggestLogin: Boolean(data.suggestLogin),
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
  opts?: {
    isNewName?: boolean;
    mode?: GameModeId;
    accumulate?: boolean;
    track?: RankTrack;
    accessToken?: string | null;
  },
): Promise<{
  entries: RankEntry[];
  rank: number;
  global: boolean;
  bestScore?: number;
  error?: string;
  code?: string;
  ownerScore?: number;
  suggestLogin?: boolean;
  track?: RankTrack;
}> {
  const clean = sanitizeName(name);
  const deviceKey = getDeviceKey();
  const isNewName = Boolean(opts?.isNewName);
  const accumulate = Boolean(opts?.accumulate);
  const mode = opts?.mode || "mestre";
  const track: RankTrack = opts?.track || "anon";

  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (opts?.accessToken) {
      headers.Authorization = `Bearer ${opts.accessToken}`;
    }
    const res = await fetch("/api/rank", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: clean,
        score,
        deviceKey,
        isNewName,
        mode,
        accumulate,
        track,
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
      suggestLogin?: boolean;
    };
    if (!res.ok) {
      return {
        entries: [],
        rank: 0,
        global: Boolean(data.global),
        error: data.error || "Falha ao gravar no ranking mundial",
        code: data.code,
        ownerScore:
          typeof data.ownerScore === "number" ? data.ownerScore : undefined,
        suggestLogin: Boolean(data.suggestLogin),
        track,
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
    if (mode === "mestre" && typeof bestScore === "number" && bestScore > 0) {
      upsertLocalBoard(clean, bestScore);
    }
    return {
      entries,
      rank: rank > 0 ? rank : 0,
      global: true,
      bestScore,
      track,
    };
  } catch {
    return {
      entries: [],
      rank: 0,
      global: false,
      error: "Falha de rede no ranking mundial",
      track,
    };
  }
}
