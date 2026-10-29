import type { ReactNode } from "react";
import { ModalClose } from "@/components/ui/ModalClose";

/**
 * Envelope do modal: o X fica no shell (sem overflow),
 * o card interno pode rolar sem cortar o botão.
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
      className={`relative w-full pt-3 pr-3 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <ModalClose onClose={onClose} />
      <div className={panelClassName}>{children}</div>
    </div>
  );
}
