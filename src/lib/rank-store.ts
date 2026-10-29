import type { GameModeId } from "@/lib/modes";
import type { RankEntry } from "@/lib/ranking";
import {
  isOwnerMetaKey,
  readNickOwner,
  writeNickOwner,
} from "@/lib/nick-owners";
import { isProfileMetaKey, getRegNickOwner } from "@/lib/profiles";
import {
  isTrackModeKey,
  normalizeRankTrack,
  trackStorageKey,
  type RankTrack,
} from "@/lib/rank-track";
import { getSupabaseAdmin, supabaseConfigured } from "@/lib/supabase";

const MAX = 100;
const MODES: GameModeId[] = ["mestre", "rua", "parca"];

type Row = {
  name: string;
  name_key: string;
  score: number;
  updated_at: string;
  device_key?: string | null;
  client_ip?: string | null;
  mode?: string | null;
};

export class RankNameTakenError extends Error {
  readonly code = "name_taken" as const;
  readonly ownerScore: number;

  constructor(ownerScore: number) {
    super(
      "Esse apelido já foi escolhido no placar anônimo. Escolhe outro ou entra com Google pro placar Conta.",
    );
    this.name = "RankNameTakenError";
    this.ownerScore = ownerScore;
  }
}

/** Prefer coluna `mode`; se o banco ainda não tiver, usa prefixo no name_key. */
let modeColumnSupported: boolean | null = null;
let deviceKeySupported: boolean | null = null;
let clientIpSupported: boolean | null = null;

function sortBoard(entries: RankEntry[]): RankEntry[] {
  return [...entries]
    .sort((a, b) => b.score - a.score || a.at - b.at)
    .slice(0, MAX);
}

function rowsToEntries(rows: Row[]): RankEntry[] {
  return sortBoard(
    rows
      .filter(
        (r) =>
          !isOwnerMetaKey(r.name_key) &&
          !isProfileMetaKey(r.name_key) &&
          !String(r.name || "").startsWith("{"),
      )
      .map((r) => ({
        name: r.name,
        score: r.score,
        at: new Date(r.updated_at).getTime() || Date.now(),
      })),
  );
}

export function isGlobalRankEnabled() {
  return supabaseConfigured();
}

export function normalizeRankMode(raw: unknown): GameModeId {
  const m = String(raw || "mestre").trim().toLowerCase();
  if (m === "rua" || m === "parca" || m === "mestre") return m;
  return "mestre";
}

export { normalizeRankTrack };
export type { RankTrack };

/**
 * Sem coluna `mode`, o Postgres trata `mode` como agregação ordered-set
 * ("WITHIN GROUP is required…") em vez de "column does not exist".
 */
function isModeSchemaError(message: string): boolean {
  return (
    /column .*mode/i.test(message) ||
    /within group.*mode/i.test(message) ||
    /ordered-set aggregate mode/i.test(message)
  );
}

function markMissingColumn(message: string) {
  if (/client_ip/i.test(message)) clientIpSupported = false;
  if (/device_key/i.test(message)) deviceKeySupported = false;
  if (isModeSchemaError(message)) modeColumnSupported = false;
}

export async function listRanks(
  mode: GameModeId = "mestre",
  track: RankTrack = "anon",
): Promise<RankEntry[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  // Sempre busca um pool e filtra por track (prefixo reg::). Coluna mode
  // sozinha misturaria anônimo + conta.
  if (modeColumnSupported !== false) {
    const { data, error } = await sb
      .from("leaderboard")
      .select("name, score, updated_at, name_key, mode")
      .eq("mode", mode)
      .order("score", { ascending: false })
      .order("updated_at", { ascending: true })
      .limit(400);

    if (!error) {
      modeColumnSupported = true;
      const filtered = ((data || []) as Row[]).filter((r) =>
        isTrackModeKey(r.name_key, mode, track),
      );
      return rowsToEntries(filtered).slice(0, MAX);
    }
    if (isModeSchemaError(error.message)) {
      modeColumnSupported = false;
    } else {
      console.error("[rank] list", error.message);
      throw new Error(error.message);
    }
  }

  const { data, error } = await sb
    .from("leaderboard")
    .select("name, score, updated_at, name_key")
    .order("score", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(500);

  if (error) {
    console.error("[rank] list", error.message);
    throw new Error(error.message);
  }

  const filtered = ((data || []) as Row[]).filter((r) =>
    isTrackModeKey(r.name_key, mode, track),
  );
  return rowsToEntries(filtered).slice(0, MAX);
}

async function selectByKeys(keys: string[]): Promise<Row[]> {
  const sb = getSupabaseAdmin();
  if (!sb || !keys.length) return [];

  const attempts = [
    "name, score, updated_at, name_key, device_key, client_ip, mode",
    "name, score, updated_at, name_key, device_key, mode",
    "name, score, updated_at, name_key, device_key",
    "name, score, updated_at, name_key",
  ];

  for (const cols of attempts) {
    if (deviceKeySupported === false && cols.includes("device_key")) continue;
    if (clientIpSupported === false && cols.includes("client_ip")) continue;
    if (modeColumnSupported === false && cols.includes("mode")) continue;

    const { data, error } = await sb
      .from("leaderboard")
      .select(cols)
      .in("name_key", keys);

    if (!error) {
      if (cols.includes("device_key")) deviceKeySupported = true;
      if (cols.includes("client_ip")) clientIpSupported = true;
      if (cols.includes("mode")) modeColumnSupported = true;
      return (data || []) as unknown as Row[];
    }
    markMissingColumn(error.message);
    if (
      !/client_ip|device_key|mode/i.test(error.message) &&
      !/column/i.test(error.message) &&
      !isModeSchemaError(error.message)
    ) {
      console.error("[rank] selectByKeys", error.message);
      throw new Error(error.message);
    }
  }
  return [];
}

/** Linhas de score do nick neste placar (anon ou reg). */
async function findRowsForTrackName(
  bare: string,
  track: RankTrack,
): Promise<Row[]> {
  const keys = MODES.map((m) => trackStorageKey(m, bare, track));
  return selectByKeys(keys);
}

function deviceOwns(
  rows: Row[],
  storedDevice: string | undefined,
  deviceKey: string,
): boolean {
  const key = (deviceKey || "").trim();
  if (!key || key.length < 8) return false;
  if (storedDevice && storedDevice === key) return true;
  for (const r of rows) {
    const owner = (r.device_key || "").trim();
    if (owner && owner === key) return true;
  }
  return false;
}

export async function lookupPlayer(
  name: string,
  mode: GameModeId = "mestre",
  track: RankTrack = "anon",
): Promise<{ entry: RankEntry | null; rank: number }> {
  const bare = name.trim().toLowerCase();
  if (!bare) return { entry: null, rank: 0 };

  const key = trackStorageKey(mode, bare, track);
  const rows = await selectByKeys([key]);
  const row = rows[0];
  if (!row) return { entry: null, rank: 0 };

  const entry: RankEntry = {
    name: row.name,
    score: row.score,
    at: new Date(row.updated_at).getTime() || Date.now(),
  };

  const entries = await listRanks(mode, track);
  const inList = entries.findIndex((e) => e.name.toLowerCase() === bare) + 1;
  if (inList > 0) return { entry, rank: inList };
  return { entry, rank: entries.length + 1 };
}

function normalizeDeviceKey(raw: string | undefined): string {
  return (raw || "").trim().slice(0, 64);
}

export async function isNameTaken(
  name: string,
  opts?: {
    deviceKey?: string;
    track?: RankTrack;
    userId?: string;
  },
): Promise<{
  taken: boolean;
  available: boolean;
  score: number;
  name?: string;
  suggestLogin?: boolean;
}> {
  const clean = name.trim().slice(0, 16);
  const track = normalizeRankTrack(opts?.track);
  if (!clean) {
    return { taken: false, available: true, score: 0 };
  }
  const bare = clean.toLowerCase();

  if (track === "reg") {
    const owner = await getRegNickOwner(bare);
    if (!owner) {
      return { taken: false, available: true, score: 0 };
    }
    const mine = Boolean(opts?.userId) && owner.userId === opts?.userId;
    const rows = await findRowsForTrackName(bare, "reg");
    const best = rows.reduce((m, r) => Math.max(m, r.score), 0);
    return {
      taken: !mine,
      available: mine,
      score: best,
      name: clean,
    };
  }

  // Anônimo: se o nick já pontuou, está tomado — sem reclaim.
  // Continuação no mesmo aparelho usa localStorage (alreadyMine no client).
  const rows = await findRowsForTrackName(bare, "anon");
  if (!rows.length) {
    return { taken: false, available: true, score: 0 };
  }
  const best = rows.reduce((m, r) => Math.max(m, r.score), 0);
  return {
    taken: true,
    available: false,
    score: best,
    name: rows[0]?.name || clean,
    suggestLogin: true,
  };
}

async function writeRow(payload: Record<string, unknown>): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase não configurado");

  // Sempre chave prefixada — funciona com ou sem coluna mode.
  const useModeCol = modeColumnSupported === true;
  if (useModeCol && payload.mode) {
    // ok
  } else {
    delete payload.mode;
  }

  const onConflict = useModeCol ? "name_key,mode" : "name_key";
  const { error } = await sb.from("leaderboard").upsert(payload, {
    onConflict,
  });

  if (!error) return;

  console.error("[rank] upsert", error.message);
  if (/client_ip/i.test(error.message)) {
    clientIpSupported = false;
    delete payload.client_ip;
    return writeRow(payload);
  }
  if (/device_key/i.test(error.message)) {
    deviceKeySupported = false;
    delete payload.device_key;
    return writeRow(payload);
  }
  if (isModeSchemaError(error.message) || /on conflict|conflict target/i.test(error.message)) {
    modeColumnSupported = false;
    delete payload.mode;
    const { error: legacyErr } = await sb
      .from("leaderboard")
      .upsert(payload, { onConflict: "name_key" });
    if (legacyErr) throw new Error(legacyErr.message);
    return;
  }
  throw new Error(error.message);
}

export async function upsertRank(
  name: string,
  score: number,
  deviceKeyRaw?: string,
  opts?: {
    isNewName?: boolean;
    mode?: GameModeId;
    clientIp?: string;
    accumulate?: boolean;
    track?: RankTrack;
    userId?: string;
  },
): Promise<{ entries: RankEntry[]; rank: number; bestScore: number }> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase não configurado");

  const mode = normalizeRankMode(opts?.mode);
  const track = normalizeRankTrack(opts?.track);
  const clean = name.trim().slice(0, 16);
  const bare = clean.toLowerCase();
  const deviceKey = normalizeDeviceKey(deviceKeyRaw);
  const clientIp = (opts?.clientIp || "").trim().slice(0, 64);
  const isNewName = Boolean(opts?.isNewName);
  const accumulate = Boolean(opts?.accumulate);
  const userId = (opts?.userId || "").trim();

  if (track === "reg") {
    if (!userId) {
      throw new Error("Faça login pra pontuar no placar Conta.");
    }
    const owner = await getRegNickOwner(bare);
    if (!owner || owner.userId !== userId) {
      throw new RankNameTakenError(0);
    }
  } else if (deviceKey.length < 8) {
    throw new Error(
      "Aparelho sem identificação — atualiza a página e tenta de novo.",
    );
  }

  const related = await findRowsForTrackName(bare, track);
  const storageKey = trackStorageKey(mode, bare, track);
  const modeRow =
    related.find((r) => r.name_key === storageKey) ||
    related.find((r) => isTrackModeKey(r.name_key, mode, track)) ||
    null;
  const prevScore = modeRow?.score ?? 0;

  if (track === "anon" && related.length > 0) {
    const stored = await readNickOwner(bare);
    const mine = deviceOwns(related, stored?.device_key, deviceKey);
    if (!mine) {
      throw new RankNameTakenError(prevScore || related[0].score);
    }
  }

  // isNewName em anon com nome já existente e mesmo device: ok (continuar)
  if (track === "anon" && isNewName && related.length > 0) {
    const stored = await readNickOwner(bare);
    if (!deviceOwns(related, stored?.device_key, deviceKey)) {
      throw new RankNameTakenError(prevScore || related[0].score);
    }
  }

  const gained = Math.max(0, Math.floor(score));
  const best = accumulate
    ? Math.min(1_000_000, prevScore + gained)
    : Math.max(gained, prevScore);
  const scoreImproved = best > prevScore;

  if (modeColumnSupported === null) {
    await listRanks("mestre", "anon");
  }

  const payload: Record<string, unknown> = {
    name: clean,
    name_key: storageKey,
    score: best,
  };
  if (modeColumnSupported === true) {
    payload.mode = mode;
  }
  if (!modeRow || scoreImproved) {
    payload.updated_at = new Date().toISOString();
  }
  if (track === "anon" && deviceKeySupported !== false) {
    payload.device_key = deviceKey;
  }
  if (track === "anon" && clientIpSupported !== false && clientIp) {
    payload.client_ip = clientIp;
  }

  await writeRow(payload);

  if (track === "anon") {
    // Só device — sem reclaim por IP.
    await writeNickOwner(bare, deviceKey, clientIp, { forceDevice: false });
    const stored = await readNickOwner(bare);
    if (!stored?.device_key) {
      await writeNickOwner(bare, deviceKey, clientIp, { forceDevice: true });
    }
  }

  const entries = await listRanks(mode, track);
  const inList = entries.findIndex((e) => e.name.toLowerCase() === bare) + 1;
  if (inList > 0) return { entries, rank: inList, bestScore: best };
  return { entries, rank: entries.length + 1, bestScore: best };
}
