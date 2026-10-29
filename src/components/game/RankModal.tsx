"use client";

import { useEffect, useState } from "react";
import { useAuthOptional } from "@/components/auth/AuthProvider";
import { Leaderboard } from "@/components/game/Leaderboard";
import { ModalClose } from "@/components/ui/ModalClose";
import { fetchModeLeaderboard } from "@/lib/mode-ranking";
import type { GameModeId } from "@/lib/modes";
import { getPlayerName, type RankEntry, type RankTrack } from "@/lib/ranking";

type BoardState = {
  entries: RankEntry[];
  global: boolean;
  myRank: number | null;
  myScore: number | null;
  error: string | null;
};

const emptyBoard = (): BoardState => ({
  entries: [],
  global: false,
  myRank: null,
  myScore: null,
  error: null,
});

/**
 * Modal de ranking por modo.
 * Sempre busca Anônimos e Conta na API — não reaproveita o board
 * do jogo (que pode estar no track Conta quando o user está logado).
 */
export function RankModal({
  open,
  onClose,
  highlight,
  shareText,
  shareMode = "home",
  mode = "mestre",
}: {
  open: boolean;
  onClose: () => void;
  /** @deprecated — modal busca sozinho; mantido pra não quebrar callers */
  entries?: RankEntry[];
  global?: boolean;
  highlight?: string;
  myRank?: number | null;
  myScore?: number | null;
  error?: string | null;
  shareText?: string;
  shareMode?: "home" | "mestre" | "rua" | "parca";
  mode?: GameModeId;
}) {
  const auth = useAuthOptional();
  const [track, setTrack] = useState<RankTrack>(
    auth?.user && auth.regNick ? "reg" : "anon",
  );
  const [boards, setBoards] = useState<Record<RankTrack, BoardState>>({
    anon: emptyBoard(),
    reg: emptyBoard(),
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // Prefer Conta se logado com nick; senão Anônimos
    setTrack(auth?.user && auth.regNick ? "reg" : "anon");
  }, [open, auth?.user, auth?.regNick]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    const anonWho = getPlayerName() || highlight || "";
    const regWho = auth?.regNick || "";

    void Promise.all([
      fetchModeLeaderboard(mode, anonWho, "anon"),
      fetchModeLeaderboard(mode, regWho, "reg", auth?.accessToken),
    ]).then(([anon, reg]) => {
      if (cancelled) return;
      setBoards({
        anon: {
          entries: anon.entries,
          global: anon.global,
          myRank: anon.myRank && anon.myRank > 0 ? anon.myRank : null,
          myScore: anon.myScore ?? null,
          error: anon.error ?? null,
        },
        reg: {
          entries: reg.entries,
          global: reg.global,
          myRank: reg.myRank && reg.myRank > 0 ? reg.myRank : null,
          myScore: reg.myScore ?? null,
          error: reg.error ?? null,
        },
      });
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [open, mode, auth?.regNick, auth?.accessToken, highlight]);

  if (!open) return null;

  const board = boards[track];
  const highlightName =
    track === "reg" ? auth?.regNick || "" : getPlayerName() || highlight || "";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[var(--ink)]/45 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Ranking completo"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalClose onClose={onClose} />
        <Leaderboard
          entries={board.entries}
          global={board.global}
          highlight={highlightName}
          myRank={board.myRank}
          myScore={board.myScore}
          error={loading ? "Carregando ranking…" : board.error}
          shareText={shareText}
          shareMode={shareMode}
          track={track}
          onTrackChange={setTrack}
          full
        />
      </div>
    </div>
  );
}
