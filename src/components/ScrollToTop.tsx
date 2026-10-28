"use client";

import { usePathname } from "next/navigation";
import { useScrollTop } from "@/hooks/useScrollTop";

/** Reseta o scroll em navegações entre rotas do App Router. */
export function ScrollToTop() {
  const pathname = usePathname();
  useScrollTop([pathname]);
  return null;
}
