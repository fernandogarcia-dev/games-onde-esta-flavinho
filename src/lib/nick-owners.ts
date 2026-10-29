import { getSupabaseAdmin } from "@/lib/supabase";

/** Linha-meta no placar (não aparece no ranking: name_key tem `::`). */
const META_PREFIX = "__owner::";

export type NickOwner = {
  device_key: string;
  client_ip: string;
  at: number;
};

export function ownerMetaKey(nameKey: string): string {
  return `${META_PREFIX}${nameKey.trim().toLowerCase()}`;
}

export function isOwnerMetaKey(nameKey: string): boolean {
  return (nameKey || "").startsWith(META_PREFIX);
}

/** Ownership quando as colunas device_key/client_ip ainda não existem no Postgres. */
export async function readNickOwner(nameKey: string): Promise<NickOwner | null> {
  const bare = nameKey.trim().toLowerCase();
  if (!bare) return null;
  const sb = getSupabaseAdmin();
  if (!sb) return null;

  const { data, error } = await sb
    .from("leaderboard")
    .select("name, name_key, score")
    .eq("name_key", ownerMetaKey(bare))
    .maybeSingle();

  if (error || !data) return null;
  try {
    const parsed = JSON.parse(String(data.name || "")) as Partial<NickOwner>;
    const device_key = String(parsed.device_key || "").trim().slice(0, 64);
    const client_ip = String(parsed.client_ip || "").trim().slice(0, 64);
    if (!device_key && !client_ip) return null;
    return {
      device_key,
      client_ip,
      at: typeof parsed.at === "number" ? parsed.at : Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Grava dono do apelido.
 * - Mesmo device: atualiza IP.
 * - Sem dono ainda: grava device + IP.
 * - Reclaim por IP (forceDevice): aparelho novo no mesmo IP assume o nick.
 * - Caso contrário: IP novo NÃO rouba o device_key.
 */
export async function writeNickOwner(
  nameKey: string,
  deviceKey: string,
  clientIp: string,
  opts?: { forceDevice?: boolean },
): Promise<void> {
  const bare = nameKey.trim().toLowerCase();
  const device_key = (deviceKey || "").trim().slice(0, 64);
  const client_ip = (clientIp || "").trim().slice(0, 64);
  if (!bare || (!device_key && !client_ip)) return;
  const sb = getSupabaseAdmin();
  if (!sb) return;

  const prev = await readNickOwner(bare);
  const sameDevice =
    Boolean(device_key) &&
    Boolean(prev?.device_key) &&
    prev!.device_key === device_key;
  const noPriorDevice = !prev?.device_key;
  const forceDevice = Boolean(opts?.forceDevice);

  let nextDevice = prev?.device_key || "";
  if (forceDevice && device_key) nextDevice = device_key;
  else if (sameDevice || noPriorDevice) nextDevice = device_key || nextDevice;

  const payload: NickOwner = {
    device_key: nextDevice,
    client_ip: client_ip || prev?.client_ip || "",
    at: Date.now(),
  };
  if (!payload.client_ip && prev?.client_ip) {
    payload.client_ip = prev.client_ip;
  }

  const row: Record<string, unknown> = {
    name: JSON.stringify(payload),
    name_key: ownerMetaKey(bare),
    score: 1,
    updated_at: new Date().toISOString(),
  };
  let { error } = await sb.from("leaderboard").upsert(row, {
    onConflict: "name_key",
  });
  if (error && /mode/i.test(error.message)) {
    row.mode = "mestre";
    ({ error } = await sb.from("leaderboard").upsert(row, {
      onConflict: "name_key,mode",
    }));
  }
  if (error) console.error("[nick-owners] write", error.message);
}

export function ownerMatches(
  owner: NickOwner | null | undefined,
  deviceKey: string,
  clientIp: string,
): boolean {
  if (!owner) return false;
  const key = (deviceKey || "").trim();
  const ip = (clientIp || "").trim();
  if (key && owner.device_key && owner.device_key === key) return true;
  if (ip && owner.client_ip && owner.client_ip === ip) return true;
  return false;
}
