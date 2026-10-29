"use client";

import { useEffect, useState } from "react";
import { AccountModal } from "@/components/auth/AccountModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import {
  claimNickname,
  clearPlayerName,
  getPlayerName,
  sanitizeName,
} from "@/lib/ranking";

/**
 * Barra compacta: nick anônimo + atalho Conta (modal).
 * Evita poluir o hero — edição pesada fica no modal.
 */
export function HomePlayerBar() {
  const { user, regNick, ready } = useAuth();
  const [anonName, setAnonName] = useState("");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [preferredNick, setPreferredNick] = useState("");

  useEffect(() => {
    const name = getPlayerName();
    setAnonName(name);
    setDraft(name);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("conta") === "1") {
      setAccountOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function saveAnon() {
    setBusy(true);
    setError(null);
    try {
      const claimed = await claimNickname(draft);
      if (!claimed.ok) {
        setError(claimed.error);
        if (claimed.suggestLogin) {
          setPreferredNick(claimed.takenName || draft);
        }
        return;
      }
      setAnonName(claimed.name);
      setDraft(claimed.name);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  const display = user && regNick ? regNick : anonName;
  const badge = user ? (regNick ? "Conta" : "Conta · sem nick") : "Anônimo";

  return (
    <>
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-3 sm:px-6 sm:pt-4">
        <div className="flex items-center gap-2 rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--paper)] px-3 py-2 shadow-[4px_4px_0_var(--ink)] sm:px-4">
          <div className="min-w-0 flex-1">
            {!editing ? (
              <>
                <p className="truncate font-[family-name:var(--font-display)] text-lg leading-tight text-[var(--ink)] sm:text-xl">
                  {display || (ready ? "Sem apelido" : "…")}
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
                    if (e.key === "Enter" && draft.trim().length >= 2 && !busy) {
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
            {error ? (
              <p className="mt-1 text-xs font-semibold text-[var(--alert)]">
                {error}{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => {
                    setPreferredNick(draft);
                    setAccountOpen(true);
                  }}
                >
                  Entrar com Google
                </button>
              </p>
            ) : null}
          </div>

          {!editing ? (
            <div className="flex shrink-0 gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDraft(anonName);
                  setEditing(true);
                  setError(null);
                }}
              >
                Nick
              </Button>
              <Button size="sm" onClick={() => setAccountOpen(true)}>
                {user ? "Conta" : "Entrar"}
              </Button>
            </div>
          ) : null}
        </div>
        {anonName && !user ? (
          <p className="mt-1.5 px-1 text-[11px] text-[var(--muted)]">
            Quer o mesmo nick em outro celular?{" "}
            <button
              type="button"
              className="font-bold text-[var(--brand)] underline"
              onClick={() => setAccountOpen(true)}
            >
              Entra com Google
            </button>
            .
          </p>
        ) : null}
        {anonName && editing ? (
          <button
            type="button"
            className="mt-1 px-1 text-[11px] font-semibold text-[var(--muted)] underline"
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
      </div>

      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        preferredNick={preferredNick || regNick || anonName}
      />
    </>
  );
}
