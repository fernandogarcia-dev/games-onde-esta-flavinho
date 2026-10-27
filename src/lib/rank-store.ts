import type { RankEntry } from "@/lib/ranking";
import { getSupabaseAdmin, supabaseConfigured } from "@/lib/supabase";

const MAX = 50;

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
  const rank =
    entries.findIndex((e) => e.name.toLowerCase() === nameKey) + 1 ||
    entries.length;
  return { entries, rank };
}
