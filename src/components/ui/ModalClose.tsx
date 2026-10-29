/** X semi-sobreposto no canto superior direito do modal. */
export function ModalClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Fechar"
      className="absolute -right-2 -top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-white text-2xl leading-none font-black text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] transition hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:-right-3 sm:-top-3"
    >
      ×
    </button>
  );
}
