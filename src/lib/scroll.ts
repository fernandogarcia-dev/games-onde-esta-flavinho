/** Volta o scroll pro topo (janela + containers comuns). */
export function scrollToTop(): void {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior: "instant" in window ? "instant" : "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
