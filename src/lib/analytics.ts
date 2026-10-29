import type { GameModeId } from "@/lib/modes";
import type { Difficulty } from "@/lib/types";

type GtagFn = (
  command: "event" | "config" | "js" | "set",
  ...args: unknown[]
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

export type ShareMethod =
  | "whatsapp"
  | "x"
  | "facebook"
  | "copy"
  | "native";

export type AnalyticsParams = {
  mode?: GameModeId | "home" | "all";
  difficulty?: Difficulty;
  won?: boolean;
  score?: number;
  elapsed_sec?: number;
  method?: ShareMethod;
  source?: string;
  success?: boolean;
  rank?: number;
  phase?: string;
  [key: string]: string | number | boolean | undefined;
};

/** Envia evento pro GA4 (Measurement ID já no layout). Sem API key extra. */
export function track(event: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;
  const clean: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    clean[k] = v;
  }
  try {
    window.gtag?.("event", event, clean);
  } catch {
    // nunca quebra o jogo por analytics
  }
}

export function trackModeSelect(mode: GameModeId) {
  track("mode_select", { mode });
}

export function trackGameStart(mode: GameModeId, difficulty: Difficulty) {
  track("game_start", { mode, difficulty });
}

export function trackGameFinish(
  mode: GameModeId,
  opts: {
    difficulty: Difficulty;
    won: boolean;
    score: number;
    elapsedSec?: number;
  },
) {
  track("game_finish", {
    mode,
    difficulty: opts.difficulty,
    won: opts.won,
    score: opts.score,
    elapsed_sec: opts.elapsedSec ?? 0,
  });
}

export function trackNamePrompt(mode: GameModeId) {
  track("name_prompt", { mode });
}

export function trackNameSubmit(
  mode: GameModeId,
  opts: { success: boolean; rank?: number },
) {
  track("name_submit", {
    mode,
    success: opts.success,
    rank: opts.rank,
  });
}

export function trackRankingView(
  mode: GameModeId | "home" | "all",
  source: string,
) {
  track("ranking_view", { mode, source });
}

export function trackShare(
  method: ShareMethod,
  opts?: { mode?: GameModeId | "home"; source?: string },
) {
  track("share", {
    method,
    mode: opts?.mode ?? "home",
    source: opts?.source ?? "share_bar",
  });
}

export function trackSupportOpen(source: string) {
  track("support_open", { source });
}
