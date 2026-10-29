import type { GameModeId } from "@/lib/modes";
import type { RankEntry } from "@/lib/ranking";
import {
  isOwnerMetaKey,
  ownerMatches,
  readNickOwner,
  writeNickOwner,
  type NickOwner,
} from "@/lib/nick-owners";
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
    super("Esse apelido já foi escolhido. Escolhe outro nome.");
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
      .filter((r) => !isOwnerMetaKey(r.name_key))
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

/** Chave legada quando não há coluna mode: rua::apelido / parca::apelido */
function prefixedKey(mode: GameModeId, nameKey: string): string {
  return mode === "mestre" ? nameKey : `${mode}::${nameKey}`;
}

function isPrefixedForMode(nameKey: string, mode: GameModeId): boolean {
  if (mode === "mestre") {
    return !nameKey.includes("::");
  }
  return nameKey.startsWith(`${mode}::`);
}

export async function listRanks(
  mode: GameModeId = "mestre",
): Promise<RankEntry[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  if (modeColumnSupported !== false) {
    const { data, error } = await sb
      .from("leaderboard")
      .select("name, score, updated_at, name_key, mode")
      .eq("mode", mode)
      .order("score", { ascending: false })
      .order("updated_at", { ascending: true })
      .limit(MAX);

    if (!error) {
      modeColumnSupported = true;
      return rowsToEntries((data || []) as Row[]);
    }
    if (/column .*mode/i.test(error.message) || /mode/i.test(error.message)) {
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
    .limit(400);

  if (error) {
    console.error("[rank] list", error.message);
    throw new Error(error.message);
  }

  const filtered = ((data || []) as Row[]).filter((r) =>
    isPrefixedForMode(r.name_key, mode),
  );
  return rowsToEntries(filtered).slice(0, MAX);
}

const ROW_SELECT_FULL =
  "name, score, updated_at, name_key, device_key, client_ip, mode";
const ROW_SELECT_NO_IP =
  "name, score, updated_at, name_key, device_key, mode";
const ROW_SELECT_MIN = "name, score, updated_at, name_key, device_key";
const ROW_SELECT_LEGACY = "name, score, updated_at, name_key";

function markMissingColumn(message: string) {
  if (/client_ip/i.test(message)) clientIpSupported = false;
  if (/device_key/i.test(message)) deviceKeySupported = false;
  if (/column .*mode/i.test(message) || /[' ]mode[' ]/i.test(message)) {
    modeColumnSupported = false;
  }
}

function pickSelectCols(): string {
  if (
    clientIpSupported !== false &&
    deviceKeySupported !== false &&
    modeColumnSupported !== false
  ) {
    return ROW_SELECT_FULL;
  }
  if (deviceKeySupported !== false && modeColumnSupported !== false) {
    return ROW_SELECT_NO_IP;
  }
  if (deviceKeySupported !== false) return ROW_SELECT_MIN;
  return ROW_SELECT_LEGACY;
}

async function findRowsForBareName(nameKey: string): Promise<Row[]> {
  const sb = getSupabaseAdmin();
  if (!sb || !nameKey) return [];

  // Tenta schema completo e degrada se faltar coluna (device_key / mode / client_ip).
  for (let attempt = 0; attempt < 4; attempt++) {
    const selectCols = pickSelectCols();
    const useMode = modeColumnSupported !== false && selectCols.includes("mode");

    if (useMode) {
      const { data, error } = await sb
        .from("leaderboard")
        .select(selectCols)
        .eq("name_key", nameKey);
      if (!error) {
        modeColumnSupported = true;
        if (selectCols.includes("client_ip")) clientIpSupported = true;
        if (selectCols.includes("device_key")) deviceKeySupported = true;
        return (data || []) as unknown as Row[];
      }
      markMissingColumn(error.message);
      if (
        !/client_ip|device_key|mode/i.test(error.message) &&
        !/column/i.test(error.message)
      ) {
        console.error("[rank] findRows", error.message);
        throw new Error(error.message);
      }
      continue;
    }

    const keys = MODES.map((m) => prefixedKey(m, nameKey));
    const legacySelect =
      deviceKeySupported === false
        ? ROW_SELECT_LEGACY
        : clientIpSupported === false
          ? ROW_SELECT_MIN
          : "name, score, updated_at, name_key, device_key, client_ip";
    const { data, error } = await sb
      .from("leaderboard")
      .select(legacySelect)
      .in("name_key", keys);
    if (!error) {
      if (legacySelect.includes("device_key")) deviceKeySupported = true;
      if (legacySelect.includes("client_ip")) clientIpSupported = true;
      return (data || []) as unknown as Row[];
    }
    markMissingColumn(error.message);
    if (
      !/client_ip|device_key|mode/i.test(error.message) &&
      !/column/i.test(error.message)
    ) {
      console.error("[rank] findRows", error.message);
      throw new Error(error.message);
    }
  }

  // Último recurso: só colunas da migration 001
  const keys = MODES.map((m) => prefixedKey(m, nameKey));
  const { data, error } = await sb
    .from("leaderboard")
    .select(ROW_SELECT_LEGACY)
    .in("name_key", keys);
  if (error) {
    console.error("[rank] findRows", error.message);
    throw new Error(error.message);
  }
  deviceKeySupported = false;
  clientIpSupported = false;
  modeColumnSupported = false;
  return (data || []) as unknown as Row[];
}

/** Dono do apelido se bater device_key OU client_ip em qualquer linha do nick. */
export function ownsNickname(
  rows: Row[],
  deviceKey: string,
  clientIp: string,
): boolean {
  const key = (deviceKey || "").trim();
  const ip = (clientIp || "").trim();
  if (key) {
    for (const r of rows) {
      const owner = (r.device_key || "").trim();
      if (owner && owner === key) return true;
    }
  }
  if (ip) {
    for (const r of rows) {
      const ownerIp = (r.client_ip || "").trim();
      if (ownerIp && ownerIp === ip) return true;
    }
  }
  return false;
}

function rowsHaveOwnerSignal(rows: Row[]): boolean {
  return rows.some(
    (r) => Boolean((r.device_key || "").trim()) || Boolean((r.client_ip || "").trim()),
  );
}

/** Junta colunas do Postgres + meta no Storage (fallback sem migration). */
async function resolveOwner(
  bare: string,
  rows: Row[],
): Promise<{ fromRows: boolean; stored: NickOwner | null }> {
  const fromRows = rowsHaveOwnerSignal(rows);
  const stored = await readNickOwner(bare);
  return { fromRows, stored };
}

function isMine(
  rows: Row[],
  stored: NickOwner | null,
  deviceKey: string,
  clientIp: string,
): boolean {
  if (ownsNickname(rows, deviceKey, clientIp)) return true;
  return ownerMatches(stored, deviceKey, clientIp);
}

/** Absolute 1-based rank + entry for a player name in a mode. */
export async function lookupPlayer(
  name: string,
  mode: GameModeId = "mestre",
): Promise<{ entry: RankEntry | null; rank: number }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { entry: null, rank: 0 };
  const bare = name.trim().toLowerCase();
  if (!bare) return { entry: null, rank: 0 };

  let row: Row | null = null;

  if (modeColumnSupported !== false) {
    const { data, error } = await sb
      .from("leaderboard")
      .select("name, score, updated_at, name_key, mode")
      .eq("name_key", bare)
      .eq("mode", mode)
      .maybeSingle();
    if (!error) {
      modeColumnSupported = true;
      row = (data as Row | null) ?? null;
    } else if (
      /column .*mode/i.test(error.message) ||
      /mode/i.test(error.message)
    ) {
      modeColumnSupported = false;
    } else {
      console.error("[rank] lookup", error.message);
      throw new Error(error.message);
    }
  }

  if (modeColumnSupported === false) {
    const key = prefixedKey(mode, bare);
    const { data, error } = await sb
      .from("leaderboard")
      .select("name, score, updated_at, name_key")
      .eq("name_key", key)
      .maybeSingle();
    if (error) {
      console.error("[rank] lookup", error.message);
      throw new Error(error.message);
    }
    row = (data as Row | null) ?? null;
  }

  if (!row) return { entry: null, rank: 0 };

  const entry: RankEntry = {
    name: row.name,
    score: row.score,
    at: new Date(row.updated_at).getTime() || Date.now(),
  };

  const entries = await listRanks(mode);
  const inList =
    entries.findIndex((e) => e.name.toLowerCase() === bare) + 1;
  if (inList > 0) return { entry, rank: inList };

  // Fallback count for players outside top MAX
  if (modeColumnSupported) {
    const { count, error: countErr } = await sb
      .from("leaderboard")
      .select("name_key", { count: "exact", head: true })
      .eq("mode", mode)
      .gt("score", entry.score);
    if (countErr) console.error("[rank] lookup count", countErr.message);
    return { entry, rank: (count ?? 0) + 1 };
  }

  return { entry, rank: entries.length + 1 };
}

function normalizeDeviceKey(raw: string | undefined): string {
  return (raw || "").trim().slice(0, 64);
}

export async function isNameTaken(
  name: string,
  opts?: { deviceKey?: string; clientIp?: string },
): Promise<{
  taken: boolean;
  available: boolean;
  reclaimable: boolean;
  score: number;
  name?: string;
}> {
  const clean = name.trim().slice(0, 16);
  if (!clean) {
    return { taken: false, available: true, reclaimable: false, score: 0 };
  }
  const bare = clean.toLowerCase();
  const rows = await findRowsForBareName(bare);
  if (!rows.length) {
    return { taken: false, available: true, reclaimable: false, score: 0 };
  }
  const best = rows.reduce((m, r) => Math.max(m, r.score), 0);
  const deviceKey = normalizeDeviceKey(opts?.deviceKey);
  const clientIp = (opts?.clientIp || "").trim();
  const { stored } = await resolveOwner(bare, rows);
  const mine = isMine(rows, stored, deviceKey, clientIp);
  if (mine && (deviceKey || clientIp)) {
    // Atualiza vínculo (ex.: mesmo IP, aparelho novo)
    void writeNickOwner(bare, deviceKey, clientIp);
  }
  return {
    taken: !mine,
    available: mine,
    reclaimable: mine,
    score: best,
    name: rows[0]?.name || clean,
  };
}

export async function upsertRank(
  name: string,
  score: number,
  deviceKeyRaw?: string,
  opts?: {
    isNewName?: boolean;
    mode?: GameModeId;
    clientIp?: string;
    /** Soma ao placar (Mestre). Sem isso, guarda o melhor (Rua/Parça). */
    accumulate?: boolean;
  },
): Promise<{ entries: RankEntry[]; rank: number; bestScore: number }> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    throw new Error("Supabase não configurado");
  }

  const mode = normalizeRankMode(opts?.mode);
  const clean = name.trim().slice(0, 16);
  const bare = clean.toLowerCase();
  const deviceKey = normalizeDeviceKey(deviceKeyRaw);
  const clientIp = (opts?.clientIp || "").trim().slice(0, 64);
  const isNewName = Boolean(opts?.isNewName);
  const accumulate = Boolean(opts?.accumulate);
  if (deviceKey.length < 8) {
    throw new Error(
      "Aparelho sem identificação — atualiza a página e tenta de novo.",
    );
  }

  const related = await findRowsForBareName(bare);
  const modeRow =
    related.find((r) =>
      modeColumnSupported
        ? (r.mode || "mestre") === mode
        : isPrefixedForMode(r.name_key, mode),
    ) || null;
  const prevScore = modeRow?.score ?? 0;
  const { fromRows, stored } = await resolveOwner(bare, related);
  const mine = isMine(related, stored, deviceKey, clientIp);
  const hasOwner = fromRows || Boolean(stored);

  if (related.length > 0) {
    if (mine) {
      // dono (mesmo aparelho ou mesmo IP) — ok
    } else if (hasOwner) {
      throw new RankNameTakenError(prevScore || related[0].score);
    } else if (isNewName) {
      // legado sem dono registrado: bloqueia roubo de nick no claim
      throw new RankNameTakenError(prevScore || related[0].score);
    }
    // legado sem dono + score de quem já tinha o nick no aparelho → libera e grava dono
  }

  const gained = Math.max(0, Math.floor(score));
  const best = accumulate
    ? Math.min(1_000_000, prevScore + gained)
    : Math.max(gained, prevScore);
  const scoreImproved = best > prevScore;

  // Detect mode column if still unknown by probing once
  if (modeColumnSupported === null) {
    await listRanks("mestre");
  }

  const useModeCol = modeColumnSupported === true;
  const storageKey = useModeCol ? bare : prefixedKey(mode, bare);

  const payload: Record<string, unknown> = {
    name: clean,
    name_key: storageKey,
    score: best,
  };
  if (useModeCol) {
    payload.mode = mode;
  }
  if (!modeRow || scoreImproved) {
    payload.updated_at = new Date().toISOString();
  }
  if (deviceKeySupported !== false) {
    payload.device_key = deviceKey;
  }
  if (clientIpSupported !== false && clientIp) {
    payload.client_ip = clientIp;
  }

  const onConflict = useModeCol ? "name_key,mode" : "name_key";
  const { error: upsertErr } = await sb.from("leaderboard").upsert(payload, {
    onConflict,
  });

  if (upsertErr) {
    console.error("[rank] upsert", upsertErr.message);
    if (/client_ip/i.test(upsertErr.message)) {
      clientIpSupported = false;
      delete payload.client_ip;
      const { error: noIpErr } = await sb
        .from("leaderboard")
        .upsert(payload, { onConflict });
      if (!noIpErr) {
        // ok without ip column
      } else if (/device_key/i.test(noIpErr.message)) {
        deviceKeySupported = false;
        delete payload.device_key;
        const { error: fallbackErr } = await sb
          .from("leaderboard")
          .upsert(payload, { onConflict });
        if (fallbackErr) throw new Error(fallbackErr.message);
      } else {
        throw new Error(noIpErr.message);
      }
    } else if (/device_key/i.test(upsertErr.message)) {
      deviceKeySupported = false;
      delete payload.device_key;
      const { error: fallbackErr } = await sb
        .from("leaderboard")
        .upsert(payload, { onConflict });
      if (fallbackErr) {
        console.error("[rank] upsert fallback", fallbackErr.message);
        throw new Error(fallbackErr.message);
      }
    } else if (
      useModeCol &&
      (/onConflict|mode|unique/i.test(upsertErr.message) ||
        upsertErr.message.includes("name_key"))
    ) {
      // Conflict target may not exist yet — try name_key only with prefix
      modeColumnSupported = false;
      const legacyPayload: Record<string, unknown> = {
        name: clean,
        name_key: prefixedKey(mode, bare),
        score: best,
        updated_at: new Date().toISOString(),
        ...(deviceKeySupported !== false ? { device_key: deviceKey } : {}),
        ...(clientIpSupported !== false && clientIp
          ? { client_ip: clientIp }
          : {}),
      };
      const { error: legacyErr } = await sb
        .from("leaderboard")
        .upsert(legacyPayload, { onConflict: "name_key" });
      if (legacyErr) {
        console.error("[rank] upsert legacy", legacyErr.message);
        throw new Error(legacyErr.message);
      }
    } else {
      throw new Error(upsertErr.message);
    }
  }

  // Sempre amarra aparelho + IP ao apelido (coluna no DB e/ou Storage).
  await writeNickOwner(bare, deviceKey, clientIp);

  const entries = await listRanks(mode);
  const inList =
    entries.findIndex((e) => e.name.toLowerCase() === bare) + 1;
  if (inList > 0) return { entries, rank: inList, bestScore: best };

  return { entries, rank: entries.length + 1, bestScore: best };
}
