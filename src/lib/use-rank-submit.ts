"use client";

import { useAuthOptional } from "@/components/auth/AuthProvider";
import type { GameModeId } from "@/lib/modes";
import { submitModeScore } from "@/lib/mode-ranking";
import { getPlayerName, type RankTrack } from "@/lib/ranking";

/**
 * Se logado com nick da Conta → placar Conta.
 * Senão → placar Anônimos (comportamento antigo).
 */
export function useRankSubmit() {
  const auth = useAuthOptional();

  function activeTrack(): RankTrack {
    if (auth?.user && auth.regNick) return "reg";
    return "anon";
  }

  function activeName(): string {
    if (auth?.user && auth.regNick) return auth.regNick;
    return getPlayerName();
  }

  async function submit(
    mode: GameModeId,
    score: number,
    opts?: { isNewName?: boolean; name?: string },
  ) {
    const track = activeTrack();
    const name =
      track === "reg"
        ? auth?.regNick || ""
        : opts?.name || getPlayerName();
    return submitModeScore(mode, name, score, {
      isNewName: opts?.isNewName,
      track,
      accessToken: auth?.accessToken,
    });
  }

  return {
    track: activeTrack(),
    playerName: activeName(),
    accessToken: auth?.accessToken ?? null,
    isRegistered: Boolean(auth?.user && auth.regNick),
    needsRegNick: Boolean(auth?.user && !auth.regNick),
    submit,
  };
}
