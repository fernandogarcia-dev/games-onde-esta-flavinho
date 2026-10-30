"use client";

import Link from "next/link";
import { useAuthOptional } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { peekContaNick } from "@/lib/conta-cache";
import { sanitizeName } from "@/lib/ranking";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Começa a partida sem Conta (e sem nick, se o campo estiver vazio). */
  onPlayAnonymous?: () => void;
  busy?: boolean;
  error?: string | null;
  /** Já tem apelido salvo — só confirma no placar */
  existingName?: string;
  autoFocus?: boolean;
  className?: string;
};

function ContaStatusCard({
  nick,
  className = "",
  expired = false,
}: {
  nick: string;
  className?: string;
  expired?: boolean;
}) {
  const auth = useAuthOptional();
  return (
    <div
      className={`rounded-2xl border-2 border-dashed border-[var(--ink)]/30 bg-white/80 px-4 py-3 text-left ${className}`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
        Placar Conta
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
        Jogando como{" "}
        <strong className="font-[family-name:var(--font-display)] text-lg">
          {nick}
        </strong>
        {expired
          ? " — sessão caiu. Entra de novo com Google pra pontuar."
          : " — pontos sobem no ranking Conta. Sem digitar de novo."}
      </p>
      <Button
        className="mt-3 w-full sm:w-auto"
        onClick={() => auth?.openAccount(nick)}
      >
        {expired ? "Continuar com Google" : "Abrir Conta"}
      </Button>
    </div>
  );
}

/** Form anônimo: entra no placar Anônimos. */
export function PlayerNameForm({
  value,
  onChange,
  onSubmit,
  onPlayAnonymous,
  busy = false,
  error = null,
  existingName,
  autoFocus = true,
  className = "",
}: Props) {
  const auth = useAuthOptional();
  const cached = peekContaNick();
  const contaNick = (auth?.regNick || cached).trim();

  // Conta (viva ou cache) nunca vê form anônimo.
  if (auth?.user && contaNick) {
    return <ContaStatusCard nick={contaNick} className={className} />;
  }
  if (auth?.user && !contaNick) {
    return <ContaNickNeeded preferredNick={value} className={className} />;
  }
  if (!auth?.user && cached) {
    return (
      <ContaStatusCard nick={cached} className={className} expired />
    );
  }

  const showContaCta =
    Boolean(error) && /já|existe|escolhido|Conta|Google/i.test(error || "");

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
        <p className="mt-2 text-sm font-semibold text-[var(--alert)]">{error}</p>
      ) : null}
      {showContaCta ? (
        <Button
          className="mt-3 w-full"
          onClick={() => auth?.openAccount(value)}
        >
          Entrar com Google (placar Conta)
        </Button>
      ) : null}
      <div className="mt-3 flex flex-col gap-2">
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
          className="w-full rounded-xl border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-2.5 font-semibold text-[var(--ink)] outline-none focus:border-[var(--brand)] disabled:opacity-60"
        />
        <div className="flex flex-row gap-2">
          <Button
            variant="secondary"
            className="min-w-0 flex-1"
            disabled={busy}
            onClick={() => {
              if (value.trim().length >= 2) {
                onSubmit();
                return;
              }
              onPlayAnonymous?.();
            }}
          >
            Jogar anônimo
          </Button>
          <Button
            className="min-w-0 flex-1"
            onClick={onSubmit}
            disabled={busy || value.trim().length < 2}
          >
            {busy ? "Entrando…" : "Entrar"}
          </Button>
        </div>
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
  /** Começa a partida sem Conta / sem nick. */
  onPlayAnonymous?: () => void;
  busy?: boolean;
  error?: string | null;
};

/** Depois de pontuar: logado sem nick Conta — não mostra form anônimo. */
export function ContaNickNeeded({
  score,
  preferredNick = "",
  className = "",
}: {
  score?: number;
  preferredNick?: string;
  className?: string;
}) {
  const auth = useAuthOptional();
  return (
    <div
      className={`rounded-2xl border-[3px] border-[var(--ink)] bg-white p-4 text-left shadow-[4px_4px_0_var(--ink)] ${className}`}
    >
      <p className="text-sm font-bold text-[var(--ink)]">
        Escolhe teu apelido da Conta
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Você já está logado com Google. Falta só um nick no placar Conta
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

/**
 * Bloco na landing do modo.
 * Logado + nick Conta → pronto pra jogar (sem digitar nada).
 * Cache Conta sem sessão → pede Google de novo (nunca form anônimo).
 * Logado sem nick → modal Conta.
 * Deslogado sem cache → form anônimo.
 */
export function PlayerNameLanding({
  playerName,
  draft,
  onDraftChange,
  onSave,
  onPlayAnonymous,
  busy,
  error,
}: LandingProps) {
  const auth = useAuthOptional();
  const loggedIn = Boolean(auth?.user);
  const cached = peekContaNick();
  const regNick = (auth?.regNick || cached).trim();
  const authPending = Boolean(
    auth && (!auth.ready || (loggedIn && !auth.profileReady && !regNick)),
  );

  if (authPending) {
    return (
      <div
        className="mt-5 h-[4.5rem] animate-pulse rounded-2xl border-2 border-dashed border-[var(--ink)]/15 bg-white/50"
        aria-hidden
      />
    );
  }

  if (loggedIn && regNick) {
    return (
      <div className="mt-5">
        <ContaStatusCard nick={regNick} />
      </div>
    );
  }

  // Sessão caiu mas este aparelho já tinha Conta (ex.: Babalu) —
  // NÃO manda pro form anônimo (lá o nick “já existe”).
  if (!loggedIn && cached) {
    return (
      <div className="mt-5">
        <ContaStatusCard nick={cached} expired />
      </div>
    );
  }

  if (loggedIn && !regNick) {
    return (
      <div className="mt-5">
        <ContaNickNeeded preferredNick={draft || playerName || cached} />
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
        onPlayAnonymous={onPlayAnonymous}
        busy={busy}
        error={error}
        autoFocus={false}
      />
    </div>
  );
}
