"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { ModalClose } from "@/components/ui/ModalClose";
import { sanitizeName } from "@/lib/ranking";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Prefill nick after "nome já usado" → login */
  preferredNick?: string;
};

/**
 * Tudo de conta/login fica no modal — home fica limpa.
 */
export function AccountModal({ open, onClose, preferredNick = "" }: Props) {
  const {
    user,
    email,
    regNick,
    accessToken,
    signInWithGoogle,
    signOut,
    setRegNickLocal,
    refreshProfile,
  } = useAuth();
  const [draft, setDraft] = useState(preferredNick || regNick);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(preferredNick || regNick || "");
    setError(null);
    setOk(null);
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
  }, [open, onClose, preferredNick, regNick]);

  if (!open) return null;

  async function loginGoogle() {
    setBusy(true);
    setError(null);
    const res = await signInWithGoogle();
    if (res.error) setError(res.error);
    setBusy(false);
  }

  async function saveNick() {
    if (!accessToken) return;
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ nick: draft }),
      });
      const data = (await res.json()) as { nick?: string; error?: string };
      if (!res.ok) {
        setError(data.error || "Não deu pra salvar o apelido.");
        return;
      }
      const nick = sanitizeName(data.nick || draft);
      setRegNickLocal(nick);
      setDraft(nick);
      setOk("Apelido da Conta salvo. Pontos vão pro placar Conta.");
      await refreshProfile();
      window.setTimeout(() => onClose(), 450);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-[var(--ink)]/45 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Conta"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-[1.5rem] border-[3px] border-[var(--ink)] bg-[var(--paper)] p-4 shadow-[10px_10px_0_var(--ink)] sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalClose onClose={onClose} />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
            Conta
          </p>
          <h2 className="mt-1 pr-8 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            {user ? "Seu login" : "Entrar"}
          </h2>
        </div>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Anônimo e Conta são placares separados. Mesmo nome pode existir nos
          dois — na Conta o nick fica no seu Google.
        </p>

        {error ? (
          <p className="mt-3 text-sm font-semibold text-[var(--alert)]">{error}</p>
        ) : null}
        {ok ? (
          <p className="mt-3 text-sm font-semibold text-[#1f8a5b]">{ok}</p>
        ) : null}

        {!user ? (
          <div className="mt-4 space-y-3">
            <Button
              size="lg"
              className="w-full"
              disabled={busy}
              onClick={() => void loginGoogle()}
            >
              {busy ? "Abrindo Google…" : "Continuar com Google"}
            </Button>
            <p className="text-[11px] text-[var(--muted)]">
              Sem senha. Depois escolhe o apelido do placar Conta.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="truncate text-xs font-semibold text-[var(--muted)]">
              {email}
            </p>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[var(--ink)]">
              {regNick ? "Trocar apelido da Conta" : "Apelido no placar Conta"}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={draft}
                onChange={(e) => setDraft(sanitizeName(e.target.value))}
                maxLength={16}
                placeholder="Seu apelido"
                disabled={busy}
                className="min-w-0 flex-1 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2.5 font-semibold text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              />
              <Button
                onClick={() => void saveNick()}
                disabled={
                  busy ||
                  draft.trim().length < 2 ||
                  draft.trim().toLowerCase() === regNick.toLowerCase()
                }
              >
                {busy ? "Salvando…" : regNick ? "Trocar" : "Salvar"}
              </Button>
            </div>
            {regNick ? (
              <p className="text-xs text-[var(--muted)]">
                Ativo: <strong className="text-[var(--ink)]">{regNick}</strong>
                . Se trocar, o placar Conta atualiza pro novo nome — nick já
                usado por outra conta não rola.
              </p>
            ) : (
              <p className="text-xs font-semibold text-[var(--alert)]">
                Escolhe um apelido pra pontuar no placar Conta.
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                void signOut().then(() => onClose());
              }}
            >
              Sair da conta
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
