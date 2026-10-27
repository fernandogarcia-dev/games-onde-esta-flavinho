"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  HINT_PRICE_LABEL,
  PIX_KEY,
  PIX_NAME,
  SUPPORT_PRESETS,
  copyPixKey,
  unlockHints,
} from "@/lib/monetization";

type Props = {
  mode?: "support" | "hint";
  onHintUnlocked?: () => void;
  compact?: boolean;
};

export function PixPanel({
  mode = "support",
  onHintUnlocked,
  compact = false,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const isPlaceholder =
    !PIX_KEY || PIX_KEY.includes("COLOQUE_SUA") || PIX_KEY.includes("sua-chave");

  async function handleCopy() {
    const ok = await copyPixKey();
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function handleConfirmPaid() {
    unlockHints();
    setConfirmed(true);
    onHintUnlocked?.();
  }

  return (
    <div
      className={`rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[4px_4px_0_var(--ink)] ${
        compact ? "p-3" : "p-4 sm:p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
            {mode === "hint"
              ? `Dica opcional · ${HINT_PRICE_LABEL}`
              : "Apoio voluntário"}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {mode === "hint"
              ? "Valor sugerido. Sem obrigação. Sem sorteio."
              : "Café pro criador. Sem obrigação, sem recompensa prometida."}
          </p>
        </div>
        <span className="rounded-full bg-[var(--pix)] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
          PIX
        </span>
      </div>

      {!compact && mode === "support" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUPPORT_PRESETS.map((value) => (
            <span
              key={value}
              className="rounded-lg border border-[var(--ink)]/20 bg-[var(--sand)] px-2.5 py-1 text-sm font-semibold text-[var(--ink)]"
            >
              {value}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 rounded-xl bg-[var(--sand)] px-3 py-2">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
          Chave PIX · {PIX_NAME}
        </p>
        <p className="mt-0.5 break-all font-mono text-sm text-[var(--ink)]">
          {PIX_KEY}
        </p>
      </div>

      {isPlaceholder && (
        <p className="mt-2 text-xs text-[var(--alert)]">
          Configure `NEXT_PUBLIC_PIX_KEY` no Vercel pra receber de verdade.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="money" size="sm" onClick={handleCopy}>
          {copied ? "Copiado!" : "Copiar chave PIX"}
        </Button>
        {mode === "hint" && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleConfirmPaid}
            disabled={confirmed}
          >
            {confirmed ? "Dica liberada" : "Já enviei · liberar dica"}
          </Button>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
        Apoio voluntário entre adultos. Não é doação a instituição, rifa, aposta
        nem campanha eleitoral. O jogo continua jogável de graça.
      </p>
    </div>
  );
}
