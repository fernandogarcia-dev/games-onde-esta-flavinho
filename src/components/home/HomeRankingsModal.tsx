"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Leaderboard } from "@/components/game/Leaderboard";
import { GAME_MODES, type GameModeId } from "@/lib/modes";
import { readModeBoard } from "@/lib/mode-ranking";
import {
  fetchLeaderboard,
  getPlayerName,
  type RankEntry,
} from "@/lib/ranking";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function HomeRankingsModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<GameModeId>("mestre");
  const [playerName, setPlayerName] = useState("");
  const [mestreBoard, setMestreBoard] = useState<RankEntry[]>([]);
  const [mestreRank, setMestreRank] = useState<number | null>(null);
  const [mestreError, setMestreError] = useState<string | null>(null);
  const [ruaBoard, setRuaBoard] = useState<RankEntry[]>([]);
  const [parcaBoard, setParcaBoard] = useState<RankEntry[]>([]);
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
    const name = getPlayerName();
    setPlayerName(name);
    setRuaBoard(readModeBoard("rua"));
    setParcaBoard(readModeBoard("parca"));
    setLoading(true);
    void fetchLeaderboard(name)
      .then((res) => {
        setMestreBoard(res.entries);
        setMestreRank(res.myRank ?? null);
        setMestreError(res.error ?? null);
      })
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const active = GAME_MODES.find((m) => m.id === tab) ?? GAME_MODES[0];
  const board =
    tab === "mestre" ? mestreBoard : tab === "rua" ? ruaBoard : parcaBoard;

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
              Rankings dos modos
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Quem manda em cada caçada — troca a aba e compara.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>

        <div
          role="tablist"
          aria-label="Modos"
          className="mt-5 grid grid-cols-3 gap-2"
        >
          {GAME_MODES.map((mode) => {
            const on = tab === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(mode.id)}
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
          <p className="px-3 pt-2 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: active.accent }}>
            {active.name}
            {tab === "mestre" ? " · mundial" : " · neste aparelho"}
          </p>
          {loading && tab === "mestre" ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--muted)]">
              Carregando ranking mundial…
            </p>
          ) : (
            <Leaderboard
              entries={board}
              global={tab === "mestre"}
              highlight={playerName}
              myRank={tab === "mestre" ? mestreRank : null}
              error={tab === "mestre" ? mestreError : null}
              compact
              full
            />
          )}
        </div>
      </div>
    </div>
  );
}
