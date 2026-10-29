/** Extrai IP do request (Vercel / proxies). */
export function clientIpFromRequest(req: Request): string {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for") || "";
  const first = forwarded.split(",")[0]?.trim() || "";
  const raw =
    first ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  return normalizeClientIp(raw);
}

export function normalizeClientIp(raw: string): string {
  let ip = (raw || "").trim();
  if (!ip) return "";
  // "[::1]:12345" ou "1.2.3.4:5678"
  if (ip.startsWith("[")) {
    const end = ip.indexOf("]");
    if (end > 0) ip = ip.slice(1, end);
  } else if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) {
    ip = ip.replace(/:\d+$/, "");
  }
  // IPv6 mapeado ::ffff:1.2.3.4
  if (ip.toLowerCase().startsWith("::ffff:")) {
    ip = ip.slice(7);
  }
  return ip.slice(0, 64);
}
