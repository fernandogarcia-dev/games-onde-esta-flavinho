export const PIX_KEY =
  process.env.NEXT_PUBLIC_PIX_KEY?.trim() || "cadeflavinho@gmail.com";

export const PIX_NAME =
  process.env.NEXT_PUBLIC_PIX_NAME?.trim() || "Cadê Flavinho";

export const HINT_PRICE_LABEL = "R$ 2";
export const SUPPORT_PRESETS = ["R$ 3", "R$ 5", "R$ 10", "R$ 25"] as const;

export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";

const STORAGE_TIPS = "flavinho_tips_unlocked";
const STORAGE_SCORE = "flavinho_best_score";

export function hasUnlockedHints(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_TIPS) === "1";
}

export function unlockHints(): void {
  window.localStorage.setItem(STORAGE_TIPS, "1");
}

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
