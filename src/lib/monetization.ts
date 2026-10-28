export const PIX_KEY =
  process.env.NEXT_PUBLIC_PIX_KEY?.trim() || "cadeflavinho@gmail.com";

export const PIX_NAME =
  process.env.NEXT_PUBLIC_PIX_NAME?.trim() || "Desenvolvedor do jogo";

const STORAGE_SCORE = "flavinho_best_score";

export function getBestScore(): number {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(STORAGE_SCORE) || "0");
}

export function saveBestScore(score: number): void {
  const best = getBestScore();
  if (score > best) {
    window.localStorage.setItem(STORAGE_SCORE, String(score));
  }
}

export async function copyPixKey(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(PIX_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Canonical site for share cards / WhatsApp / social — always the .com.br. */
export const CANONICAL_SITE = "https://cadeflavinho.com.br";

export function buildShareUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return CANONICAL_SITE;
  return `${CANONICAL_SITE}${clean}`;
}

export function buildWhatsAppShare(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
