"use client";

import { useEffect } from "react";
import { scrollToTop } from "@/lib/scroll";

/** Sempre que as deps mudam, joga o scroll pro topo. */
export function useScrollTop(deps: unknown[]): void {
  useEffect(() => {
    scrollToTop();
    // rAF cobre layout que monta depois (imagens / dynamic)
    const id = window.requestAnimationFrame(() => scrollToTop());
    return () => window.cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps explícitas do caller
  }, deps);
}
