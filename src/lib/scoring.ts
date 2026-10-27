import type { Difficulty } from "@/lib/types";

/** Find-phase clock (seconds). */
export const FIND_TIME_LIMIT: Record<Difficulty, number> = {
  easy: 5 * 60,
  medium: 3 * 60,
  hard: 1 * 60,
  mix: 3 * 60,
};

/** Points on the find clock at t=0 — harder modes pay more. */
export const FIND_SCORE_MAX: Record<Difficulty, number> = {
  easy: 1000,
  medium: 2000,
  hard: 3000,
  mix: 2000,
};

export const CITY_HIT_BONUS = 200;
export const CITY_MISS_PENALTY = 80;
export const CLICK_MISS_PENALTY = 15;
export const PERFECT_FIND_BONUS = 400;
export const STREAK_BONUS_PCT = 0.12;

export function findLimitSeconds(difficulty: Difficulty): number {
  return FIND_TIME_LIMIT[difficulty];
}

export function findScoreMax(difficulty: Difficulty): number {
  return FIND_SCORE_MAX[difficulty];
}

/** Points still on the table: max at t=0, 0 at timeout. */
export function findScoreAt(
  remainingSec: number,
  limitSec: number,
  maxPoints: number,
): number {
  if (limitSec <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, remainingSec / limitSec));
  return Math.round(maxPoints * ratio);
}

export function streakMultiplier(streak: number): number {
  if (streak <= 1) return 1;
  return 1 + STREAK_BONUS_PCT * (streak - 1);
}

export function applyStreak(base: number, streak: number): number {
  return Math.round(base * streakMultiplier(streak));
}

export function labelFindTime(difficulty: Difficulty): string {
  const s = FIND_TIME_LIMIT[difficulty];
  if (s >= 60 && s % 60 === 0) return `${s / 60} min`;
  if (s >= 60) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return `${s}s`;
}

export function formatClock(totalSec: number): string {
  const m = Math.floor(Math.max(0, totalSec) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(Math.max(0, totalSec) % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
