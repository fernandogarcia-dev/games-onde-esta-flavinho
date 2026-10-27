"use client";

import { ShareBar } from "@/components/game/ShareBar";
import type { RankEntry } from "@/lib/ranking";

export function Leaderboard({
  entries,
  global,
  highlight,
  compact = false,
  error,
  shareText,
}: {
  entries: RankEntry[];
  global: boolean;
  highlight?: string;
  compact?: boolean;
  error?: string | null;
  shareText?: string;
}) {
  const top = entries.slice(0, compact ? 5 : 10);
  const me = highlight?.trim().toLowerCase() || "";

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
          nome · pts
        </span>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-[var(--alert)]">{error}</p>
      ) : top.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {global
            ? "Ninguém no placar ainda. Achou o rastro? Entra na história."
            : "Ranking global ainda não conectou. Confira as chaves do Supabase."}
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {top.map((e, i) => {
            const mine = me && e.name.toLowerCase() === me;
            return (
              <li
                key={`${e.name}-${e.score}-${e.at}`}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${
                  mine
                    ? "border-[var(--brand)] bg-[var(--brand)]/10"
                    : "border-[var(--ink)]/10 bg-white/70"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-display)] text-sm ${
                    i === 0
                      ? "bg-[#f5c542] text-[var(--ink)]"
                      : i === 1
                        ? "bg-[#c9d2e0] text-[var(--ink)]"
                        : i === 2
                          ? "bg-[#d4a574] text-[var(--ink)]"
                          : "bg-[var(--sand)] text-[var(--muted)]"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold text-[var(--ink)]">
                  {e.name}
                  {mine ? " · você" : ""}
                </span>
                <span className="font-[family-name:var(--font-display)] text-lg tabular-nums text-[var(--brand)]">
                  {e.score.toLocaleString("pt-BR")}
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
