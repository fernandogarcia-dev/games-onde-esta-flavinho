"use client";

import { useEffect, useState } from "react";
import { useAuthOptional } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Leaderboard } from "@/components/game/Leaderboard";
import { GAME_MODES, type GameModeId } from "@/lib/modes";
import { trackRankingView } from "@/lib/analytics";
import { fetchModeLeaderboard } from "@/lib/mode-ranking";
import { getPlayerName, type RankEntry, type RankTrack } from "@/lib/ranking";

type Props = {
  open: boolean;
  onClose: () => void;
};

type BoardState = {
  entries: RankEntry[];
  global: boolean;
  myRank: number | null;
  error: string | null;
};

const emptyBoard = (): BoardState => ({
  entries: [],
  global: false,
  myRank: null,
  error: null,
});

export function HomeRankingsModal({ open, onClose }: Props) {
  const auth = useAuthOptional();
  const [tab, setTab] = useState<GameModeId>("mestre");
  const [track, setTrack] = useState<RankTrack>("anon");
  const [playerName, setPlayerName] = useState("");
  const [boards, setBoards] = useState<Record<GameModeId, BoardState>>({
    mestre: emptyBoard(),
    rua: emptyBoard(),
    parca: emptyBoard(),
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
    const anon = getPlayerName();
    const who = track === "reg" ? auth?.regNick || "" : anon;
    setPlayerName(who);
    setLoading(true);
    let cancelled = false;

    void Promise.all(
      (["mestre", "rua", "parca"] as GameModeId[]).map(async (mode) => {
        const res = await fetchModeLeaderboard(
          mode,
          who,
          track,
          auth?.accessToken,
        );
        return [
          mode,
          {
            entries: res.entries,
            global: res.global,
            myRank: res.myRank && res.myRank > 0 ? res.myRank : null,
            error: res.error ?? null,
          } satisfies BoardState,
        ] as const;
      }),
    )
      .then((rows) => {
        if (cancelled) return;
        setBoards({
          mestre: rows.find((r) => r[0] === "mestre")?.[1] ?? emptyBoard(),
          rua: rows.find((r) => r[0] === "rua")?.[1] ?? emptyBoard(),
          parca: rows.find((r) => r[0] === "parca")?.[1] ?? emptyBoard(),
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, track, auth?.regNick, auth?.accessToken]);

  if (!open) return null;

  const active = GAME_MODES.find((m) => m.id === tab) ?? GAME_MODES[0];
  const board = boards[tab];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[var(--ink)]/45 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Rankings dos modos"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[1.5rem] border-[3px] border-[var(--ink)] bg-[var(--paper)] p-4 shadow-[10px_10px_0_var(--ink)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
              Placar
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] sm:text-3xl">
              Rankings
            </h2>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>

        <div
          role="tablist"
          aria-label="Tipo de placar"
          className="mt-4 grid grid-cols-2 gap-1 rounded-xl border-2 border-[var(--ink)]/15 bg-[var(--sand)]/80 p-1"
        >
          {(
            [
              ["anon", "Anônimos"],
              ["reg", "Conta"],
            ] as const
          ).map(([id, label]) => {
            const on = track === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTrack(id)}
                className={`rounded-lg px-2 py-2 text-center text-xs font-black uppercase tracking-wide transition sm:text-sm ${
                  on
                    ? "bg-white text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div
          role="tablist"
          aria-label="Modos"
          className="mt-3 grid grid-cols-3 gap-2"
        >
          {GAME_MODES.map((mode) => {
            const on = tab === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setTab(mode.id);
                  trackRankingView(mode.id, "home_tab");
                }}
                className={`rounded-xl border-2 px-2 py-2.5 text-left transition ${
                  on
                    ? "shadow-[3px_3px_0_var(--ink)] ring-2 ring-[var(--ink)]"
                    : "border-[var(--ink)]/20 bg-white/80 opacity-85 hover:opacity-100"
                }`}
                style={
                  on
                    ? {
                        background: mode.soft,
                        borderColor: mode.accent,
                      }
                    : undefined
                }
              >
                <span
                  className="block text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: mode.accent }}
                >
                  {mode.badge}
                </span>
                <span className="mt-0.5 block font-[family-name:var(--font-display)] text-sm leading-tight text-[var(--ink)]">
                  {mode.id === "mestre"
                    ? "Disfarces"
                    : mode.id === "rua"
                      ? "Rua"
                      : "Parça"}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="mt-4 rounded-2xl border-2 p-1"
          style={{ borderColor: `${active.accent}55`, background: active.soft }}
        >
          <p
            className="px-3 pb-3 pt-3 text-xs font-bold uppercase tracking-[0.16em]"
            style={{ color: active.accent }}
          >
            {active.name} · {track === "reg" ? "Conta" : "Anônimos"}
          </p>
          {loading ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--muted)]">
              Carregando…
            </p>
          ) : (
            <div className="mt-1">
              <Leaderboard
                entries={board.entries}
                global={board.global}
                highlight={playerName}
                myRank={board.myRank}
                error={board.error}
                shareMode={tab}
                compact
                full
                hideChrome
                track={track}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
