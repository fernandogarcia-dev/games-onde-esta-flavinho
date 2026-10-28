"use client";

import { useEffect } from "react";
import { PixPanel } from "@/components/game/PixPanel";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PixModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Fechar apoio"
        className="absolute inset-0 bg-[var(--ink)]/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Apoio voluntário via PIX"
        className="animate-rise relative z-[81] w-full max-w-md"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-1 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--ink)] bg-white text-lg font-black text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]"
          aria-label="Fechar"
        >
          ×
        </button>
        <PixPanel />
      </div>
    </div>
  );
}
