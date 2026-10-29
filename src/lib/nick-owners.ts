import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "nick-owners";
const FILE = (bare: string) => `${bare}.json`;

export type NickOwner = {
  device_key: string;
  client_ip: string;
  at: number;
};

let bucketReady: Promise<boolean> | null = null;

async function ensureBucket(): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data: buckets, error: listErr } = await sb.storage.listBuckets();
      if (listErr) {
        console.error("[nick-owners] listBuckets", listErr.message);
        return false;
      }
      if ((buckets || []).some((b) => b.name === BUCKET)) return true;
      const { error } = await sb.storage.createBucket(BUCKET, {
        public: false,
        fileSizeLimit: 4096,
      });
      if (error && !/already exists|duplicate/i.test(error.message)) {
        console.error("[nick-owners] createBucket", error.message);
        return false;
      }
      return true;
    })().catch((e) => {
      console.error("[nick-owners] ensureBucket", e);
      bucketReady = null;
      return false;
    });
  }
  return bucketReady;
}

/** Ownership meta when a coluna device_key/client_ip ainda não existe no Postgres. */
export async function readNickOwner(nameKey: string): Promise<NickOwner | null> {
  const bare = nameKey.trim().toLowerCase();
  if (!bare) return null;
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  if (!(await ensureBucket())) return null;
  const { data, error } = await sb.storage.from(BUCKET).download(FILE(bare));
  if (error || !data) return null;
  try {
    const parsed = JSON.parse(await data.text()) as Partial<NickOwner>;
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

export async function writeNickOwner(
  nameKey: string,
  deviceKey: string,
  clientIp: string,
): Promise<void> {
  const bare = nameKey.trim().toLowerCase();
  const device_key = (deviceKey || "").trim().slice(0, 64);
  const client_ip = (clientIp || "").trim().slice(0, 64);
  if (!bare || (!device_key && !client_ip)) return;
  const sb = getSupabaseAdmin();
  if (!sb) return;
  if (!(await ensureBucket())) return;

  const prev = await readNickOwner(bare);
  const payload: NickOwner = {
    device_key: device_key || prev?.device_key || "",
    client_ip: client_ip || prev?.client_ip || "",
    at: Date.now(),
  };
  // Prefer keep previous IP if new request has none (local/dev)
  if (!client_ip && prev?.client_ip) payload.client_ip = prev.client_ip;
  if (!device_key && prev?.device_key) payload.device_key = prev.device_key;

  const { error } = await sb.storage.from(BUCKET).upload(
    FILE(bare),
    JSON.stringify(payload),
    { contentType: "application/json", upsert: true },
  );
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
