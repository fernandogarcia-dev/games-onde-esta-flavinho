"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Leaderboard } from "@/components/game/Leaderboard";
import type { RankEntry } from "@/lib/ranking";

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
}) {
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

  if (!open) return null;

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
          entries={entries}
          global={global}
          highlight={highlight}
          myRank={myRank}
          myScore={myScore}
          error={error}
          shareText={shareText}
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
