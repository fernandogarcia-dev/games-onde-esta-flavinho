/** Cache local do nick Conta — evita flash do form anônimo enquanto /api/profile carrega. */

const NICK_KEY = "cade_conta_nick";
const UID_KEY = "cade_conta_uid";

export function readContaCache(userId: string | null | undefined): string {
  if (typeof window === "undefined" || !userId) return "";
  try {
    if (localStorage.getItem(UID_KEY) !== userId) return "";
    return (localStorage.getItem(NICK_KEY) || "").trim();
  } catch {
    return "";
  }
}

/** Nick Conta cacheado neste aparelho (mesmo sem uid ainda hidratado). */
export function peekContaNick(): string {
  if (typeof window === "undefined") return "";
  try {
    return (localStorage.getItem(NICK_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function peekContaUid(): string {
  if (typeof window === "undefined") return "";
  try {
    return (localStorage.getItem(UID_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function writeContaCache(userId: string, nick: string) {
  if (typeof window === "undefined" || !userId) return;
  try {
    const clean = nick.trim();
    if (!clean) {
      localStorage.removeItem(NICK_KEY);
      localStorage.removeItem(UID_KEY);
      return;
    }
    localStorage.setItem(UID_KEY, userId);
    localStorage.setItem(NICK_KEY, clean);
  } catch {
    /* ignore */
  }
}

export function clearContaCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(NICK_KEY);
    localStorage.removeItem(UID_KEY);
  } catch {
    /* ignore */
  }
}
