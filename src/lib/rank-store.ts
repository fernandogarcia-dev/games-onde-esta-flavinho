import type { RankEntry } from "@/lib/ranking";

const KEY = "flavinho:leaderboard";
const MAX = 50;

type MemoryStore = { entries: RankEntry[] };

function memory(): MemoryStore {
  const g = globalThis as typeof globalThis & { __flavinhoRank?: MemoryStore };
  if (!g.__flavinhoRank) g.__flavinhoRank = { entries: [] };
  return g.__flavinhoRank;
}

function upstashConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

async function redisCommand(args: (string | number)[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL!.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!.trim();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = (await res.json()) as { result?: unknown };
  return data.result;
}

function sortBoard(entries: RankEntry[]): RankEntry[] {
  return [...entries]
    .sort((a, b) => b.score - a.score || a.at - b.at)
    .slice(0, MAX);
}

export function isGlobalRankEnabled() {
  return upstashConfigured();
}

export async function listRanks(): Promise<RankEntry[]> {
  if (upstashConfigured()) {
    try {
      const raw = await redisCommand(["GET", KEY]);
      if (typeof raw === "string" && raw) {
        const parsed = JSON.parse(raw) as RankEntry[];
        if (Array.isArray(parsed)) return sortBoard(parsed);
      }
      return [];
    } catch {
      return sortBoard(memory().entries);
    }
  }
  return sortBoard(memory().entries);
}

export async function upsertRank(
  name: string,
  score: number,
): Promise<{ entries: RankEntry[]; rank: number }> {
  const clean = name.trim().slice(0, 16);
  const entries = await listRanks();
  const others = entries.filter((e) => e.name.toLowerCase() !== clean.toLowerCase());
  const prev = entries.find((e) => e.name.toLowerCase() === clean.toLowerCase());
  const best = Math.max(score, prev?.score ?? 0);
  const next = sortBoard([...others, { name: clean, score: best, at: Date.now() }]);

  if (upstashConfigured()) {
    try {
      await redisCommand(["SET", KEY, JSON.stringify(next)]);
    } catch {
      memory().entries = next;
    }
  } else {
    memory().entries = next;
  }

  const rank = next.findIndex((e) => e.name.toLowerCase() === clean.toLowerCase()) + 1;
  return { entries: next, rank: rank || next.length };
}
