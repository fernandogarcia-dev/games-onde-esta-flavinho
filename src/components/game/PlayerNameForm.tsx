"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { sanitizeName } from "@/lib/ranking";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy?: boolean;
  error?: string | null;
  /** Já tem apelido salvo — só confirma no placar */
  existingName?: string;
  autoFocus?: boolean;
  className?: string;
};

/** Mesmo bloco do Mestre: entra no placar com apelido único. */
export function PlayerNameForm({
  value,
  onChange,
  onSubmit,
  busy = false,
  error = null,
  existingName,
  autoFocus = true,
  className = "",
}: Props) {
  return (
    <div
      className={`rounded-2xl border-[3px] border-[var(--ink)] bg-white p-4 text-left shadow-[4px_4px_0_var(--ink)] ${className}`}
    >
      <p className="text-sm font-bold text-[var(--ink)]">
        Entra no placar pra desafiar a galera
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Sem apelido a pontuação não sobe no ranking deste modo. O mesmo nick
        vale nos três modos, mas cada placar acumula separado. Apelido único: se
        alguém já usou, não dá pra repetir.
      </p>
      {existingName ? (
        <p className="mt-2 text-xs font-semibold text-[var(--ink)]">
          Continuando como <strong>{existingName}</strong>
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm font-semibold text-[var(--alert)]">{error}</p>
      ) : null}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) => onChange(sanitizeName(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim().length >= 2 && !busy) {
              onSubmit();
            }
          }}
          maxLength={16}
          placeholder="Seu apelido"
          autoFocus={autoFocus}
          disabled={busy}
          className="min-w-0 flex-1 rounded-xl border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-2.5 font-semibold text-[var(--ink)] outline-none focus:border-[var(--brand)] disabled:opacity-60"
        />
        <Button
          onClick={onSubmit}
          disabled={busy || value.trim().length < 2}
        >
          {busy ? "Entrando…" : "Entrar"}
        </Button>
      </div>
    </div>
  );
}

type LandingProps = {
  playerName: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  busy?: boolean;
  error?: string | null;
};

/** Bloco na home do modo: mostra quem joga ou pede apelido. */
export function PlayerNameLanding({
  playerName,
  draft,
  onDraftChange,
  onSave,
  busy,
  error,
}: LandingProps) {
  if (playerName) {
    return (
      <div className="mt-5 rounded-2xl border-2 border-dashed border-[var(--ink)]/30 bg-white/80 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
          No placar deste modo
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
          Jogando como{" "}
          <strong className="font-[family-name:var(--font-display)] text-lg">
            {playerName}
          </strong>
          {" — "}acertos sobem só no ranking deste modo.
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Quer trocar o nick?{" "}
          <Link href="/" className="font-bold text-[var(--brand)] underline">
            Volta pra home
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <PlayerNameForm
        value={draft}
        onChange={onDraftChange}
        onSubmit={onSave}
        busy={busy}
        error={error}
        autoFocus={false}
      />
    </div>
  );
}
