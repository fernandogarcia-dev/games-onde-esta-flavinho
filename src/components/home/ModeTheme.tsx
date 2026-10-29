"use client";

import type { CSSProperties, ReactNode } from "react";
import { getMode, type GameModeId } from "@/lib/modes";

/**
 * Identidade visual do modo.
 * Fundo fixed no viewport inteiro — a barra superior herda a cor do modo
 * (sem faixa azul do body vazando em cima).
 */
export function ModeTheme({
  mode,
  children,
  className = "",
}: {
  mode: GameModeId;
  children: ReactNode;
  className?: string;
}) {
  const meta = getMode(mode);
  const bgStyle = {
    background: `radial-gradient(1200px 600px at 10% -10%, ${meta.glow}33, transparent 55%),
      radial-gradient(900px 500px at 100% 0%, ${meta.accent}22, transparent 50%),
      linear-gradient(180deg, ${meta.soft} 0%, #f0f5fb 42%, #f7fafc 100%)`,
  } as CSSProperties;

  return (
    <div className={`relative min-h-full ${className}`}>
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={bgStyle}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div
          className="absolute -left-20 top-10 h-64 w-64 rounded-full blur-3xl"
          style={{ background: `${meta.glow}55` }}
        />
        <div
          className="absolute right-0 top-40 h-72 w-72 rounded-full blur-3xl"
          style={{ background: `${meta.accent}33` }}
        />
        <div className="map-grid absolute inset-0 opacity-[0.05]" />
      </div>
      {children}
    </div>
  );
}
