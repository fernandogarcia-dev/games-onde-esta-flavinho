import { getCityRecord, type CityId } from "@/lib/city-catalog";
import type { Difficulty } from "@/lib/types";

export type ClueTier = "easy" | "medium" | "hard";

function hashSalt(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Map game mode + episode tier → which famous-trait deck to draw from. */
export function resolveClueTier(
  gameDifficulty: Difficulty,
  _episodeDifficulty: ClueTier,
): ClueTier {
  return gameDifficulty;
}

/** How many city clues the player can actually use before lives run out. */
export function clueCountForLives(lives: number): number {
  return Math.max(1, Math.min(3, lives));
}

/** Distinct famous traits — count matches available city attempts. */
export function pickCityClues(
  city: CityId,
  tier: ClueTier,
  salt: string,
  count = 3,
): string[] {
  const want = Math.max(1, Math.min(5, count));
  const record = getCityRecord(city);
  const pool = [...record.clues[tier]];
  const rand = mulberry32(hashSalt(`${salt}:${city}:${tier}:clues-v4:${want}`));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, want);
}
