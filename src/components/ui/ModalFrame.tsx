import type { ReactNode } from "react";
import { ModalClose } from "@/components/ui/ModalClose";

/**
 * Envelope do modal: shell relative + overflow visible
 * pra o X (50/50 no canto) não ser cortado; o panel rola por dentro.
 */
export function ModalFrame({
  onClose,
  children,
  className = "",
  panelClassName = "",
}: {
  onClose: () => void;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-visible ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <ModalClose onClose={onClose} />
      <div className={`overflow-x-visible ${panelClassName}`}>{children}</div>
    </div>
  );
}
