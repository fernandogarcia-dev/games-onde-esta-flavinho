"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PIX_KEY, PIX_NAME, copyPixKey } from "@/lib/monetization";

type Props = {
  compact?: boolean;
};

export function PixPanel({ compact = false }: Props) {
  const [copied, setCopied] = useState(false);
  const isPlaceholder =
    !PIX_KEY || PIX_KEY.includes("COLOQUE_SUA") || PIX_KEY.includes("sua-chave");

  async function handleCopy() {
    const ok = await copyPixKey();
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 2000);
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
            Apoio voluntário
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Só se quiser. Valor livre. Sem obrigação e sem recompensa prometida.
          </p>
        </div>
        <span className="rounded-full bg-[var(--pix)] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
          PIX
        </span>
      </div>

      <p className="mt-3 rounded-xl border border-[var(--ink)]/10 bg-[var(--sand)] px-3 py-2 text-sm leading-relaxed text-[var(--ink)]">
        Qualquer valor vai <strong>apenas para o desenvolvedor do jogo</strong>.
        Não vai para político, partido, candidato nem campanha de ninguém.
      </p>

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
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
        Apoio 100% voluntário entre adultos. Não é doação a instituição, rifa,
        aposta, vaquinha eleitoral nem financiamento de campanha. O jogo
        continua inteiro de graça — jogar não exige pagar nada.
      </p>
    </div>
  );
}
