"use client";

import Link from "next/link";
import { useAuthOptional } from "@/components/auth/AuthProvider";
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

/** Form anônimo: entra no placar Anônimos. */
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
  const auth = useAuthOptional();

  return (
    <div
      className={`rounded-2xl border-[3px] border-[var(--ink)] bg-white p-4 text-left shadow-[4px_4px_0_var(--ink)] ${className}`}
    >
      <p className="text-sm font-bold text-[var(--ink)]">
        Entra no placar pra desafiar a galera
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Sem apelido a pontuação não sobe. Apelido anônimo é único — se já
        usaram, escolhe outro ou{" "}
        <button
          type="button"
          className="font-bold text-[var(--brand)] underline"
          onClick={() => auth?.openAccount(value)}
        >
          entra com Google
        </button>{" "}
        no placar Conta (pode usar o mesmo texto de nick).
      </p>
      {existingName ? (
        <p className="mt-2 text-xs font-semibold text-[var(--ink)]">
          Continuando como <strong>{existingName}</strong>
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm font-semibold text-[var(--alert)]">
          {error}
          {/já|existe|escolhido/i.test(error) ? (
            <>
              {" "}
              <button
                type="button"
                className="underline"
                onClick={() => auth?.openAccount(value)}
              >
                Usar este nome na Conta (Google)
              </button>
            </>
          ) : null}
        </p>
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
        <Button onClick={onSubmit} disabled={busy || value.trim().length < 2}>
          {busy ? "Entrando…" : "Entrar"}
        </Button>
      </div>
    </div>
  );
}

type LandingProps = {
  /** Nick anônimo local (ignorado se logado com Conta). */
  playerName: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  busy?: boolean;
  error?: string | null;
};

/**
 * Bloco na landing do modo.
 * Logado + nick Conta → pronto pra jogar.
 * Logado sem nick → pede Conta (não anônimo).
 * Deslogado → form anônimo.
 */
/** Depois de pontuar: logado sem nick Conta — não mostra form anônimo. */
export function ContaNickNeeded({
  score,
  preferredNick = "",
}: {
  score?: number;
  preferredNick?: string;
}) {
  const auth = useAuthOptional();
  return (
    <div className="rounded-2xl border-[3px] border-[var(--ink)] bg-white p-4 text-left shadow-[4px_4px_0_var(--ink)]">
      <p className="text-sm font-bold text-[var(--ink)]">
        Salva teus pontos na Conta
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Você já entrou com Google. Falta só um apelido no placar Conta
        {typeof score === "number" && score > 0
          ? ` pra gravar ${score.toLocaleString("pt-BR")} pts`
          : ""}
        . Pode ser o mesmo texto de um nick anônimo — os placares são separados.
      </p>
      <Button
        className="mt-3 w-full sm:w-auto"
        onClick={() => auth?.openAccount(preferredNick)}
      >
        Escolher apelido da Conta
      </Button>
    </div>
  );
}

export function PlayerNameLanding({
  playerName,
  draft,
  onDraftChange,
  onSave,
  busy,
  error,
}: LandingProps) {
  const auth = useAuthOptional();
  const loggedIn = Boolean(auth?.user);
  const regNick = auth?.regNick || "";

  // Evita flash do form anônimo enquanto a sessão (Google) carrega.
  if (auth && !auth.ready) {
    return (
      <div
        className="mt-5 h-[4.5rem] rounded-2xl border-2 border-dashed border-[var(--ink)]/15 bg-white/50"
        aria-hidden
      />
    );
  }

  if (loggedIn && regNick) {
    return (
      <div className="mt-5 rounded-2xl border-2 border-dashed border-[var(--ink)]/30 bg-white/80 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
          Placar Conta
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
          Jogando como{" "}
          <strong className="font-[family-name:var(--font-display)] text-lg">
            {regNick}
          </strong>
          {" — "}pontos sobem no ranking Conta deste modo.
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Quer trocar?{" "}
          <button
            type="button"
            className="font-bold text-[var(--brand)] underline"
            onClick={() => auth?.openAccount(regNick)}
          >
            Abrir Conta
          </button>
          .
        </p>
      </div>
    );
  }

  if (loggedIn && !regNick) {
    return (
      <div className="mt-5">
        <ContaNickNeeded preferredNick={draft || playerName} />
      </div>
    );
  }

  if (playerName) {
    return (
      <div className="mt-5 rounded-2xl border-2 border-dashed border-[var(--ink)]/30 bg-white/80 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
          Placar anônimo
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
          Jogando como{" "}
          <strong className="font-[family-name:var(--font-display)] text-lg">
            {playerName}
          </strong>
          {" — "}acertos sobem só no ranking anônimo deste modo.
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Quer o nick em qualquer celular?{" "}
          <button
            type="button"
            className="font-bold text-[var(--brand)] underline"
            onClick={() => auth?.openAccount(playerName)}
          >
            Entra com Google
          </button>
          {" · "}
          <Link href="/" className="font-bold text-[var(--brand)] underline">
            Home
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
