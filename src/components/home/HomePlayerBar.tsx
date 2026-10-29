"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  claimNickname,
  clearPlayerName,
  getPlayerName,
  sanitizeName,
} from "@/lib/ranking";

/**
 * Troca o apelido usado em todos os modos.
 * Pontos continuam separados: cada modo tem o próprio ranking mundial.
 */
export function HomePlayerBar() {
  const [playerName, setPlayerName] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    const name = getPlayerName();
    setPlayerName(name);
    setDraft(name);
    if (!name) setEditing(true);
  }, []);

  async function save() {
    setBusy(true);
    setError(null);
    setOkMsg(null);
    try {
      const claimed = await claimNickname(draft);
      if (!claimed.ok) {
        setError(claimed.error);
        return;
      }
      setPlayerName(claimed.name);
      setDraft(claimed.name);
      setEditing(false);
      setOkMsg("Apelido atualizado pra todos os modos.");
      window.setTimeout(() => setOkMsg(null), 2800);
    } finally {
      setBusy(false);
    }
  }

  function startEdit() {
    setDraft(playerName);
    setError(null);
    setOkMsg(null);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(playerName);
    setError(null);
    if (playerName) setEditing(false);
  }

  function clearName() {
    clearPlayerName();
    setPlayerName("");
    setDraft("");
    setEditing(true);
    setError(null);
    setOkMsg("Apelido removido neste aparelho.");
    window.setTimeout(() => setOkMsg(null), 2800);
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--paper)] p-3 shadow-[5px_5px_0_var(--ink)] sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand)] sm:text-[11px]">
              Seu apelido · todos os modos
            </p>
            {!editing ? (
              <p className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)] sm:text-2xl">
                {playerName}
              </p>
            ) : (
              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                {playerName
                  ? "Trocar apelido neste aparelho"
                  : "Escolhe um apelido pra pontuar"}
              </p>
            )}
            <p className="mt-1 text-xs leading-snug text-[var(--muted)] sm:text-sm">
              Um nick nos três modos. Cada placar (Disfarces, Rua, Parça) acumula
              pontos{" "}
              <strong className="text-[var(--ink)]">só daquele modo</strong>.
            </p>
          </div>
          {!editing ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={startEdit}>
                Trocar apelido
              </Button>
            </div>
          ) : null}
        </div>

        {editing ? (
          <div className="mt-3 space-y-2">
            {error ? (
              <p className="text-sm font-semibold text-[var(--alert)]">{error}</p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={draft}
                onChange={(e) => setDraft(sanitizeName(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && draft.trim().length >= 2 && !busy) {
                    void save();
                  }
                }}
                maxLength={16}
                placeholder="Seu apelido"
                autoFocus
                disabled={busy}
                className="min-w-0 flex-1 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2.5 font-semibold text-[var(--ink)] outline-none focus:border-[var(--brand)] disabled:opacity-60"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => void save()}
                  disabled={busy || draft.trim().length < 2}
                >
                  {busy ? "Salvando…" : "Salvar"}
                </Button>
                {playerName ? (
                  <Button
                    variant="secondary"
                    onClick={cancelEdit}
                    disabled={busy}
                  >
                    Cancelar
                  </Button>
                ) : null}
                {playerName ? (
                  <Button
                    variant="ghost"
                    onClick={clearName}
                    disabled={busy}
                  >
                    Remover
                  </Button>
                ) : null}
              </div>
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              Apelido único no site. Trocar não move pontos antigos — daqui pra
              frente os acertos entram no nick novo, em cada ranking do modo.
            </p>
          </div>
        ) : null}

        {okMsg ? (
          <p className="mt-2 text-sm font-semibold text-[#1f8a5b]">{okMsg}</p>
        ) : null}
      </div>
    </div>
  );
}
