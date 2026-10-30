"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SiteLogo } from "@/components/home/SiteLogo";
import { Button } from "@/components/ui/Button";
import {
  claimNickname,
  clearPlayerName,
  getPlayerName,
  sanitizeName,
} from "@/lib/ranking";

/**
 * Barra global (layout): logo + nick/conta.
 * Fundo transparente — a cor da página fica por baixo (ModeTheme / home).
 * Modal Conta vive no AuthProvider (openAccount).
 */
export function HomePlayerBar() {
  const { user, regNick, ready, profileReady, signOut, openAccount } =
    useAuth();
  const [anonName, setAnonName] = useState("");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function syncAnon() {
      const name = getPlayerName();
      setAnonName(name);
      setDraft((d) => (editing ? d : name));
    }
    syncAnon();
    window.addEventListener("storage", syncAnon);
    window.addEventListener("focus", syncAnon);
    return () => {
      window.removeEventListener("storage", syncAnon);
      window.removeEventListener("focus", syncAnon);
    };
  }, [editing]);

  useEffect(() => {
    if (user) setEditing(false);
  }, [user]);

  async function saveAnon() {
    setBusy(true);
    setError(null);
    try {
      const claimed = await claimNickname(draft);
      if (!claimed.ok) {
        setError(claimed.error);
        return;
      }
      setAnonName(claimed.name);
      setDraft(claimed.name);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  const loggedIn = Boolean(user);
  const display = loggedIn
    ? regNick || (profileReady ? "Sem apelido" : "…")
    : anonName;
  const badge = loggedIn
    ? !profileReady
      ? "Conta…"
      : regNick
        ? "Conta"
        : "Conta · escolhe um nick"
    : "Anônimo";

  return (
    <header className="relative z-20 w-full">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 pt-3 sm:gap-3 sm:px-6 sm:pt-4">
        <SiteLogo />
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--paper)] px-3 py-2 shadow-[4px_4px_0_var(--ink)] sm:px-4">
          <div className="min-w-0 flex-1">
            {!editing || loggedIn ? (
              <>
                <p className="truncate font-[family-name:var(--font-display)] text-base leading-tight text-[var(--ink)] sm:text-lg">
                  {display || (ready && profileReady ? "Sem apelido" : "…")}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {badge}
                </p>
              </>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={draft}
                  onChange={(e) => setDraft(sanitizeName(e.target.value))}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      draft.trim().length >= 2 &&
                      !busy
                    ) {
                      void saveAnon();
                    }
                  }}
                  maxLength={16}
                  placeholder="Apelido anônimo"
                  autoFocus
                  disabled={busy}
                  className="min-w-0 flex-1 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => void saveAnon()}
                    disabled={busy || draft.trim().length < 2}
                  >
                    Ok
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditing(false);
                      setDraft(anonName);
                      setError(null);
                    }}
                  >
                    X
                  </Button>
                </div>
              </div>
            )}
            {error && !loggedIn ? (
              <p className="mt-1 text-xs font-semibold text-[var(--alert)]">
                {error}{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => openAccount(draft)}
                >
                  Entrar com Google
                </button>
              </p>
            ) : null}
          </div>

          {!editing || loggedIn ? (
            <div className="flex shrink-0 gap-1.5">
                {!loggedIn ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setDraft(anonName);
                      setEditing(true);
                      setError(null);
                    }}
                  >
                    Escolher Apelido
                  </Button>
                ) : null}
              <Button
                size="sm"
                onClick={() => openAccount(regNick || anonName)}
              >
                {loggedIn
                  ? regNick
                    ? "Trocar Apelido"
                    : "Escolher Apelido"
                  : "Entrar"}
              </Button>
              {loggedIn ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void signOut()}
                >
                  Sair
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {!loggedIn && anonName ? (
        <p className="mx-auto mt-1.5 max-w-5xl px-5 text-[11px] text-[var(--muted)] sm:px-7">
          Quer o mesmo nick em outro celular?{" "}
          <button
            type="button"
            className="font-bold text-[var(--brand)] underline"
            onClick={() => openAccount(anonName)}
          >
            Entra com Google
          </button>
          .
        </p>
      ) : null}
      {loggedIn && !regNick ? (
        <p className="mx-auto mt-1.5 max-w-5xl px-5 text-[11px] font-semibold text-[var(--alert)] sm:px-7">
          Conta logada —{" "}
          <button
            type="button"
            className="underline"
            onClick={() => openAccount(anonName)}
          >
            escolhe um apelido
          </button>{" "}
          pra pontuar no placar Conta.
        </p>
      ) : null}
      {!loggedIn && anonName && editing ? (
        <button
          type="button"
          className="mx-auto mt-1 block max-w-5xl px-5 text-left text-[11px] font-semibold text-[var(--muted)] underline sm:px-7"
          onClick={() => {
            clearPlayerName();
            setAnonName("");
            setDraft("");
            setError(null);
          }}
        >
          Remover nick anônimo deste aparelho
        </button>
      ) : null}
    </header>
  );
}
