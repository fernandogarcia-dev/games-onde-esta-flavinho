const STORAGE_DEVICE = "flavinho_device_key";

function randomDeviceKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/** Stable anonymous id for this browser — used to own a leaderboard nickname. */
export function getDeviceKey(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(STORAGE_DEVICE)?.trim();
    if (existing && existing.length >= 8) return existing.slice(0, 64);
    const created = randomDeviceKey().slice(0, 64);
    window.localStorage.setItem(STORAGE_DEVICE, created);
    return created;
  } catch {
    return randomDeviceKey().slice(0, 64);
  }
}
