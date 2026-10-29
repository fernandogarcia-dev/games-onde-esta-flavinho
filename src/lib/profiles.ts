import { getSupabaseAdmin } from "@/lib/supabase";
import { sanitizeName } from "@/lib/ranking";

const PROFILE_PREFIX = "__profile::";
const REGNICK_PREFIX = "__regnick::";

export type UserProfile = {
  userId: string;
  nick: string;
  email: string;
  at: number;
};

function profileKey(userId: string) {
  return `${PROFILE_PREFIX}${userId}`;
}

function regNickKey(nick: string) {
  return `${REGNICK_PREFIX}${nick.trim().toLowerCase()}`;
}

export function isProfileMetaKey(nameKey: string): boolean {
  return (
    nameKey.startsWith(PROFILE_PREFIX) || nameKey.startsWith(REGNICK_PREFIX)
  );
}

async function upsertMeta(nameKey: string, payload: object): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return;
  const row: Record<string, unknown> = {
    name: JSON.stringify(payload),
    name_key: nameKey,
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
  if (error) console.error("[profiles] upsert", error.message);
}

async function readMeta<T>(nameKey: string): Promise<T | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("leaderboard")
    .select("name")
    .eq("name_key", nameKey)
    .maybeSingle();
  if (error || !data) return null;
  try {
    return JSON.parse(String(data.name || "")) as T;
  } catch {
    return null;
  }
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  const raw = await readMeta<{
    nick?: string;
    email?: string;
    at?: number;
  }>(profileKey(userId));
  if (!raw?.nick) return null;
  return {
    userId,
    nick: sanitizeName(raw.nick),
    email: String(raw.email || ""),
    at: typeof raw.at === "number" ? raw.at : Date.now(),
  };
}

export async function getRegNickOwner(
  nick: string,
): Promise<{ userId: string; email: string } | null> {
  const bare = sanitizeName(nick).toLowerCase();
  if (!bare) return null;
  const raw = await readMeta<{ user_id?: string; email?: string }>(
    regNickKey(bare),
  );
  const userId = String(raw?.user_id || "").trim();
  if (!userId) return null;
  return { userId, email: String(raw?.email || "") };
}

/**
 * Define o nick registrado do usuário.
 * - Único no placar Conta (anônimo pode ter o mesmo texto).
 * - Trocar libera o nick antigo.
 */
export async function setRegisteredNick(
  userId: string,
  email: string,
  nickRaw: string,
): Promise<{ ok: true; nick: string } | { ok: false; error: string }> {
  const nick = sanitizeName(nickRaw);
  if (!nick || nick.length < 2) {
    return { ok: false, error: "Apelido curto demais." };
  }
  const bare = nick.toLowerCase();
  const prev = await getProfile(userId);
  if (prev?.nick.toLowerCase() === bare) {
    await upsertMeta(profileKey(userId), {
      nick,
      email,
      at: Date.now(),
    });
    return { ok: true, nick };
  }

  const owner = await getRegNickOwner(bare);
  if (owner && owner.userId !== userId) {
    return {
      ok: false,
      error: `"${nick}" já está em uma conta. Escolhe outro no placar Conta.`,
    };
  }

  if (prev?.nick) {
    const oldKey = regNickKey(prev.nick);
    const sb = getSupabaseAdmin();
    if (sb) {
      await sb.from("leaderboard").delete().eq("name_key", oldKey);
    }
  }

  await upsertMeta(regNickKey(bare), {
    user_id: userId,
    email,
    at: Date.now(),
  });
  await upsertMeta(profileKey(userId), {
    nick,
    email,
    at: Date.now(),
  });
  return { ok: true, nick };
}
