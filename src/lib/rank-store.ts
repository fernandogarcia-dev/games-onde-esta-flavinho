import type { RankEntry } from "@/lib/ranking";
import { getSupabaseAdmin, supabaseConfigured } from "@/lib/supabase";

const MAX = 100;

type Row = {
  name: string;
  score: number;
  updated_at: string;
};

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

export async function upsertRank(
  name: string,
  score: number,
): Promise<{ entries: RankEntry[]; rank: number }> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    throw new Error("Supabase não configurado");
  }

  const clean = name.trim().slice(0, 16);
  const nameKey = clean.toLowerCase();

  const { data: existing, error: readErr } = await sb
    .from("leaderboard")
    .select("name, score, updated_at")
    .eq("name_key", nameKey)
    .maybeSingle();

  if (readErr) {
    console.error("[rank] read", readErr.message);
    throw new Error(readErr.message);
  }

  const prevScore = existing?.score ?? 0;
  const best = Math.max(score, prevScore);

  const { error: upsertErr } = await sb.from("leaderboard").upsert(
    {
      name: clean,
      name_key: nameKey,
      score: best,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "name_key" },
  );

  if (upsertErr) {
    console.error("[rank] upsert", upsertErr.message);
    throw new Error(upsertErr.message);
  }

  const entries = await listRanks();
  const inList =
    entries.findIndex((e) => e.name.toLowerCase() === nameKey) + 1;
  if (inList > 0) return { entries, rank: inList };

  // Outside the cached top list — count how many beat this score.
  const { count, error: countErr } = await sb
    .from("leaderboard")
    .select("name_key", { count: "exact", head: true })
    .gt("score", best);
  if (countErr) {
    console.error("[rank] count", countErr.message);
  }
  const rank = (count ?? entries.length) + 1;
  return { entries, rank };
}
