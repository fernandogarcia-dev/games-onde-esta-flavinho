import type { GameModeId } from "@/lib/modes";
import { isOwnerMetaKey } from "@/lib/nick-owners";

/** Dois placares por modo: anônimo (hoje) e conta (Google). */
export type RankTrack = "anon" | "reg";

export function normalizeRankTrack(raw: unknown): RankTrack {
  return String(raw || "anon").trim().toLowerCase() === "reg" ? "reg" : "anon";
}

/** Chave de armazenamento no leaderboard (sem coluna track). */
export function trackStorageKey(
  mode: GameModeId,
  bareName: string,
  track: RankTrack,
): string {
  const bare = bareName.trim().toLowerCase();
  if (!bare) return "";
  if (track === "reg") {
    return mode === "mestre" ? `reg::${bare}` : `reg::${mode}::${bare}`;
  }
  return mode === "mestre" ? bare : `${mode}::${bare}`;
}

/** A linha pertence a este modo + placar? */
export function isTrackModeKey(
  nameKey: string,
  mode: GameModeId,
  track: RankTrack,
): boolean {
  const key = (nameKey || "").trim();
  if (!key || isOwnerMetaKey(key) || key.startsWith("__")) return false;

  if (track === "reg") {
    if (mode === "mestre") {
      // reg::nick — sem segundo segmento de modo
      return /^reg::[^:]+$/.test(key);
    }
    return key.startsWith(`reg::${mode}::`);
  }

  if (key.startsWith("reg::")) return false;
  if (mode === "mestre") return !key.includes("::");
  return key.startsWith(`${mode}::`);
}

export function trackLabel(track: RankTrack): string {
  return track === "reg" ? "Conta" : "Anônimos";
}
