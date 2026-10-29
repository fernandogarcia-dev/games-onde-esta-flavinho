"use client";

import { useEffect } from "react";
import { PixPanel } from "@/components/game/PixPanel";
import { ModalClose } from "@/components/ui/ModalClose";

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
        <ModalClose onClose={onClose} />
        <PixPanel />
      </div>
    </div>
  );
}
