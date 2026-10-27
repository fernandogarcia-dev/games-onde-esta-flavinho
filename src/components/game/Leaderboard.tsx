"use client";

import { ShareBar } from "@/components/game/ShareBar";
import type { RankEntry } from "@/lib/ranking";

type Row =
  | { type: "entry"; rank: number; entry: RankEntry; mine: boolean }
  | { type: "gap" };

function buildRows(
  entries: RankEntry[],
  highlight?: string,
  myRank?: number | null,
  myScore?: number | null,
): Row[] {
  const me = highlight?.trim().toLowerCase() || "";
  const top = entries.slice(0, 10);
  const rows: Row[] = top.map((entry, i) => ({
    type: "entry" as const,
    rank: i + 1,
    entry,
    mine: Boolean(me && entry.name.toLowerCase() === me),
  }));

  const inTop10 = me
    ? top.some((e) => e.name.toLowerCase() === me)
    : false;
  if (inTop10 || !me) return rows;

  const idx = entries.findIndex((e) => e.name.toLowerCase() === me);
  let rank =
    typeof myRank === "number" && myRank > 0
      ? myRank
      : idx >= 0
        ? idx + 1
        : 0;
  let entry: RankEntry | null =
    idx >= 0
      ? entries[idx]
      : typeof myScore === "number" && myScore > 0
        ? { name: highlight!.trim(), score: myScore, at: Date.now() }
        : null;

  if (rank <= 10 || !entry) return rows;

  rows.push({ type: "gap" });
  rows.push({ type: "entry", rank, entry, mine: true });
  return rows;
}

export function Leaderboard({
  entries,
  global,
  highlight,
  myRank,
  myScore,
  compact = false,
  error,
  shareText,
}: {
  entries: RankEntry[];
  global: boolean;
  highlight?: string;
  /** Absolute rank (1-based), even when outside the returned list. */
  myRank?: number | null;
  myScore?: number | null;
  compact?: boolean;
  error?: string | null;
  shareText?: string;
}) {
  const rows = buildRows(entries, highlight, myRank, myScore);

  return (
    <div
      className={`rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[6px_6px_0_var(--ink)] ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
            Ranking mundial
          </p>
          <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Caçadores de Flavinho
          </h3>
        </div>
        <span className="rounded-lg bg-[var(--sand)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
          top 10 · você
        </span>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-[var(--alert)]">{error}</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {global
            ? "Ninguém no placar ainda. Achou o rastro? Entra na história."
            : "Ranking global ainda não conectou. Confira as chaves do Supabase."}
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {rows.map((row) => {
            if (row.type === "gap") {
              return (
                <li
                  key="gap"
                  aria-hidden
                  className="flex items-center justify-center py-1 text-lg font-black tracking-widest text-[var(--muted)]"
                >
                  ···
                </li>
              );
            }
            const { rank, entry, mine } = row;
            const label = mine ? "Você" : entry.name;
            return (
              <li
                key={`${entry.name}-${entry.score}-${rank}`}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${
                  mine
                    ? "border-[var(--brand)] bg-[var(--brand)]/10"
                    : "border-[var(--ink)]/10 bg-white/70"
                }`}
              >
                <span
                  className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-1 font-[family-name:var(--font-display)] text-sm tabular-nums ${
                    rank === 1
                      ? "bg-[#f5c542] text-[var(--ink)]"
                      : rank === 2
                        ? "bg-[#c9d2e0] text-[var(--ink)]"
                        : rank === 3
                          ? "bg-[#d4a574] text-[var(--ink)]"
                          : mine
                            ? "bg-[var(--brand)] text-white"
                            : "bg-[var(--sand)] text-[var(--muted)]"
                  }`}
                >
                  {rank}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold text-[var(--ink)]">
                  {label}
                </span>
                <span className="font-[family-name:var(--font-display)] text-lg tabular-nums text-[var(--brand)]">
                  {entry.score.toLocaleString("pt-BR")}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {shareText && (
        <div className="mt-4 border-t border-[var(--ink)]/10 pt-4">
          <ShareBar
            text={shareText}
            label="Desafia no ranking"
            compact
          />
        </div>
      )}
    </div>
  );
}
