"use client";

import type { CSSProperties, ReactNode } from "react";
import { getMode, type GameModeId } from "@/lib/modes";

/** Aplica a identidade visual do modo (cores do card da home). */
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
  const style = {
    "--brand": meta.accent,
    "--accent": meta.glow,
    "--sand": meta.soft,
    "--mode-soft": meta.soft,
    "--mode-glow": meta.glow,
    background: `radial-gradient(1200px 600px at 10% -10%, ${meta.glow}33, transparent 55%),
      radial-gradient(900px 500px at 100% 0%, ${meta.accent}22, transparent 50%),
      linear-gradient(180deg, ${meta.soft} 0%, #f0f5fb 42%, #f7fafc 100%)`,
  } as CSSProperties;

  return (
    <div className={`relative min-h-full ${className}`} style={style}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
