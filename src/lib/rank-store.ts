import type { RankEntry } from "@/lib/ranking";
import { getSupabaseAdmin, supabaseConfigured } from "@/lib/supabase";

const MAX = 100;

type Row = {
  name: string;
  score: number;
  updated_at: string;
  device_key?: string | null;
};

export class RankNameTakenError extends Error {
  readonly code = "name_taken" as const;
  readonly ownerScore: number;

  constructor(ownerScore: number) {
    super(
      "Esse apelido já está no placar de outro aparelho. Escolhe outro nome.",
    );
    this.name = "RankNameTakenError";
    this.ownerScore = ownerScore;
  }
}

let deviceKeySupported: boolean | null = null;

function sortBoard(entries: RankEntry[]): RankEntry[] {
  return [...entries]
    .sort((a, b) => b.score - a.score || a.at - b.at)
    .slice(0, MAX);
}

function rowsToEntries(rows: Row[]): RankEntry[] {
  return sortBoard(
    rows.map((r) => ({
      name: r.name,
      score: r.score,
      at: new Date(r.updated_at).getTime() || Date.now(),
    })),
  );
}

export function isGlobalRankEnabled() {
  return supabaseConfigured();
}

export async function listRanks(): Promise<RankEntry[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data, error } = await sb
    .from("leaderboard")
    .select("name, score, updated_at")
    .order("score", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(MAX);

  if (error) {
    console.error("[rank] list", error.message);
    throw new Error(error.message);
  }
  return rowsToEntries((data || []) as Row[]);
}

/** Absolute 1-based rank + entry for a player name (any position). */
export async function lookupPlayer(
  name: string,
): Promise<{ entry: RankEntry | null; rank: number }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { entry: null, rank: 0 };
  const nameKey = name.trim().toLowerCase();
  if (!nameKey) return { entry: null, rank: 0 };

  const { data, error } = await sb
    .from("leaderboard")
    .select("name, score, updated_at")
    .eq("name_key", nameKey)
    .maybeSingle();
  if (error) {
    console.error("[rank] lookup", error.message);
    throw new Error(error.message);
  }
  if (!data) return { entry: null, rank: 0 };

  const entry: RankEntry = {
    name: data.name,
    score: data.score,
    at: new Date(data.updated_at).getTime() || Date.now(),
  };
  const { count, error: countErr } = await sb
    .from("leaderboard")
    .select("name_key", { count: "exact", head: true })
    .gt("score", entry.score);
  if (countErr) {
    console.error("[rank] lookup count", countErr.message);
  }
  return { entry, rank: (count ?? 0) + 1 };
}

function normalizeDeviceKey(raw: string | undefined): string {
  return (raw || "").trim().slice(0, 64);
}

async function readExisting(
  nameKey: string,
): Promise<{ row: Row | null; withDevice: boolean }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { row: null, withDevice: false };

  if (deviceKeySupported !== false) {
    const { data, error } = await sb
      .from("leaderboard")
      .select("name, score, updated_at, device_key")
      .eq("name_key", nameKey)
      .maybeSingle();
    if (!error) {
      deviceKeySupported = true;
      return { row: (data as Row | null) ?? null, withDevice: true };
    }
    if (/device_key/i.test(error.message)) {
      deviceKeySupported = false;
    } else {
      console.error("[rank] read", error.message);
      throw new Error(error.message);
    }
  }

  const { data, error } = await sb
    .from("leaderboard")
    .select("name, score, updated_at")
    .eq("name_key", nameKey)
    .maybeSingle();
  if (error) {
    console.error("[rank] read", error.message);
    throw new Error(error.message);
  }
  return { row: (data as Row | null) ?? null, withDevice: false };
}

export async function upsertRank(
  name: string,
  score: number,
  deviceKeyRaw?: string,
): Promise<{ entries: RankEntry[]; rank: number; bestScore: number }> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    throw new Error("Supabase não configurado");
  }

  const clean = name.trim().slice(0, 16);
  const nameKey = clean.toLowerCase();
  const deviceKey = normalizeDeviceKey(deviceKeyRaw);
  if (deviceKey.length < 8) {
    throw new Error(
      "Aparelho sem identificação — atualiza a página e tenta de novo.",
    );
  }

  const { row, withDevice } = await readExisting(nameKey);
  const prevScore = row?.score ?? 0;
  const ownerDevice = (row?.device_key || "").trim();

  if (row && withDevice) {
    // Apelido já vinculado a outro aparelho.
    if (ownerDevice && ownerDevice !== deviceKey) {
      throw new RankNameTakenError(prevScore);
    }
    // Legado (device_key null): primeiro aparelho que gravar reivindica o apelido.
  }

  const best = Math.max(score, prevScore);
  const scoreImproved = best > prevScore;
  const payload: Record<string, unknown> = {
    name: clean,
    name_key: nameKey,
    score: best,
  };
  if (!row || scoreImproved) {
    payload.updated_at = new Date().toISOString();
  }
  if (withDevice || deviceKeySupported) {
    payload.device_key = deviceKey;
  }

  const { error: upsertErr } = await sb.from("leaderboard").upsert(payload, {
    onConflict: "name_key",
  });

  if (upsertErr) {
    console.error("[rank] upsert", upsertErr.message);
    if (/device_key/i.test(upsertErr.message)) {
      deviceKeySupported = false;
      const { error: fallbackErr } = await sb.from("leaderboard").upsert(
        {
          name: clean,
          name_key: nameKey,
          score: best,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "name_key" },
      );
      if (fallbackErr) {
        console.error("[rank] upsert fallback", fallbackErr.message);
        throw new Error(fallbackErr.message);
      }
    } else {
      throw new Error(upsertErr.message);
    }
  }

  const entries = await listRanks();
  const inList =
    entries.findIndex((e) => e.name.toLowerCase() === nameKey) + 1;
  if (inList > 0) return { entries, rank: inList, bestScore: best };

  const { count, error: countErr } = await sb
    .from("leaderboard")
    .select("name_key", { count: "exact", head: true })
    .gt("score", best);
  if (countErr) {
    console.error("[rank] count", countErr.message);
  }
  const rank = (count ?? entries.length) + 1;
  return { entries, rank, bestScore: best };
}
