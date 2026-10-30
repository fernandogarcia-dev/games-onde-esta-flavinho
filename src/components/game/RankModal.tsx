"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthOptional } from "@/components/auth/AuthProvider";
import { Leaderboard } from "@/components/game/Leaderboard";
import { ModalFrame } from "@/components/ui/ModalFrame";
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
 * Busca Anônimos e Conta na API (Conta não depende de login pra listar).
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
  const [track, setTrack] = useState<RankTrack>("anon");
  const [boards, setBoards] = useState<Record<RankTrack, BoardState>>({
    anon: emptyBoard(),
    reg: emptyBoard(),
  });
  const [loading, setLoading] = useState(false);
  const contaRetryRef = useRef(false);

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
    setTrack(auth?.user && auth.regNick ? "reg" : "anon");
    contaRetryRef.current = false;
  }, [open, auth?.user, auth?.regNick]);

  const loadBoards = useCallback(async () => {
    const anonWho = getPlayerName() || highlight || "";
    const regWho = auth?.regNick || "";
    const [anon, reg] = await Promise.all([
      fetchModeLeaderboard(mode, anonWho, "anon"),
      fetchModeLeaderboard(mode, regWho, "reg", auth?.accessToken),
    ]);
    return {
      anon: {
        entries: anon.entries,
        global: anon.global,
        myRank: anon.myRank && anon.myRank > 0 ? anon.myRank : null,
        myScore: anon.myScore ?? null,
        error: anon.error ?? null,
      } satisfies BoardState,
      reg: {
        entries: reg.entries,
        global: reg.global,
        myRank: reg.myRank && reg.myRank > 0 ? reg.myRank : null,
        myScore: reg.myScore ?? null,
        error: reg.error ?? null,
      } satisfies BoardState,
    };
  }, [mode, highlight, auth?.regNick, auth?.accessToken]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void loadBoards()
      .then((next) => {
        if (cancelled) return;
        setBoards(next);
      })
      .catch(() => {
        if (cancelled) return;
        setBoards({
          anon: {
            ...emptyBoard(),
            error: "Não deu pra carregar o ranking.",
          },
          reg: {
            ...emptyBoard(),
            error: "Não deu pra carregar o placar Conta.",
          },
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, loadBoards]);

  // Um retry ao abrir a aba Conta se a 1ª carga veio vazia (race/rede).
  useEffect(() => {
    if (!open || track !== "reg" || loading) return;
    if (boards.reg.entries.length > 0 || boards.reg.error) return;
    if (contaRetryRef.current) return;
    contaRetryRef.current = true;
    let cancelled = false;
    setLoading(true);
    void fetchModeLeaderboard(
      mode,
      auth?.regNick || "",
      "reg",
      auth?.accessToken,
    )
      .then((reg) => {
        if (cancelled) return;
        setBoards((prev) => ({
          ...prev,
          reg: {
            entries: reg.entries,
            global: reg.global,
            myRank: reg.myRank && reg.myRank > 0 ? reg.myRank : null,
            myScore: reg.myScore ?? null,
            error:
              reg.error ??
              (reg.entries.length === 0
                ? null
                : prev.reg.error),
          },
        }));
      })
      .catch(() => {
        if (cancelled) return;
        setBoards((prev) => ({
          ...prev,
          reg: {
            ...emptyBoard(),
            error: "Não deu pra carregar o placar Conta.",
          },
        }));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    open,
    track,
    loading,
    boards.reg.entries.length,
    boards.reg.error,
    mode,
    auth?.regNick,
    auth?.accessToken,
  ]);

  if (!open) return null;

  const board = boards[track];
  const highlightName =
    track === "reg" ? auth?.regNick || "" : getPlayerName() || highlight || "";

  const emptyHint =
    track === "reg"
      ? "Ninguém no placar Conta ainda neste modo. Entra com Google, escolhe apelido e pontua."
      : "Ninguém no placar anônimo ainda. Achou o rastro? Entra na história.";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[var(--ink)]/45 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Ranking completo"
      onClick={onClose}
    >
      <ModalFrame
        onClose={onClose}
        className="max-w-lg"
        panelClassName="max-h-[min(90vh,40rem)] overflow-y-auto"
      >
        <Leaderboard
          entries={board.entries}
          global={board.global}
          highlight={highlightName}
          myRank={board.myRank}
          myScore={board.myScore}
          error={board.error}
          loading={loading}
          emptyHint={emptyHint}
          shareText={shareText}
          shareMode={shareMode}
          track={track}
          onTrackChange={setTrack}
          full
        />
      </ModalFrame>
    </div>
  );
}
