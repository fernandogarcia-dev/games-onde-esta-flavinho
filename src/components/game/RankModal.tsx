"use client";

import { useEffect, useState } from "react";
import { useAuthOptional } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Leaderboard } from "@/components/game/Leaderboard";
import { fetchModeLeaderboard } from "@/lib/mode-ranking";
import type { GameModeId } from "@/lib/modes";
import type { RankEntry, RankTrack } from "@/lib/ranking";

export function RankModal({
  open,
  onClose,
  entries,
  global,
  highlight,
  myRank,
  myScore,
  error,
  shareText,
  shareMode = "home",
  mode = "mestre",
}: {
  open: boolean;
  onClose: () => void;
  entries: RankEntry[];
  global: boolean;
  highlight?: string;
  myRank?: number | null;
  myScore?: number | null;
  error?: string | null;
  shareText?: string;
  shareMode?: "home" | "mestre" | "rua" | "parca";
  mode?: GameModeId;
}) {
  const auth = useAuthOptional();
  const [track, setTrack] = useState<RankTrack>("anon");
  const [anonBoard, setAnonBoard] = useState({
    entries,
    global,
    myRank: myRank ?? null,
    myScore: myScore ?? null,
    error: error ?? null,
  });
  const [regBoard, setRegBoard] = useState({
    entries: [] as RankEntry[],
    global: false,
    myRank: null as number | null,
    myScore: null as number | null,
    error: null as string | null,
  });
  const [loadingReg, setLoadingReg] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAnonBoard({
      entries,
      global,
      myRank: myRank ?? null,
      myScore: myScore ?? null,
      error: error ?? null,
    });
  }, [open, entries, global, myRank, myScore, error]);

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
    if (!open || track !== "reg") return;
    let cancelled = false;
    setLoadingReg(true);
    const who = auth?.regNick || highlight || "";
    void fetchModeLeaderboard(
      mode,
      who,
      "reg",
      auth?.accessToken,
    ).then((res) => {
      if (cancelled) return;
      setRegBoard({
        entries: res.entries,
        global: res.global,
        myRank: res.myRank && res.myRank > 0 ? res.myRank : null,
        myScore: res.myScore ?? null,
        error: res.error ?? null,
      });
      setLoadingReg(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, track, mode, auth?.regNick, auth?.accessToken, highlight]);

  if (!open) return null;

  const board = track === "reg" ? regBoard : anonBoard;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[var(--ink)]/45 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Ranking completo"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Leaderboard
          entries={board.entries}
          global={board.global}
          highlight={
            track === "reg" ? auth?.regNick || highlight : highlight
          }
          myRank={board.myRank}
          myScore={board.myScore}
          error={
            loadingReg && track === "reg"
              ? "Carregando placar Conta…"
              : board.error
          }
          shareText={shareText}
          shareMode={shareMode}
          track={track}
          onTrackChange={setTrack}
          full
        />
        <div className="mt-3 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
