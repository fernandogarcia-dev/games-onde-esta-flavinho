/** X no canto — leve overlap, sem ficar quase todo fora do modal. */
export function ModalClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      aria-label="Fechar"
      className="absolute right-2 top-2 z-30 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-white text-[1.6rem] leading-none font-black text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] transition hover:bg-[#fff4d6] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
    >
      <span className="relative -top-px" aria-hidden>
        ×
      </span>
    </button>
  );
}
