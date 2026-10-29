import type { GameModeId } from "@/lib/modes";
import { trackStorageKey } from "@/lib/rank-track";
import { sanitizeName } from "@/lib/ranking";
import { getSupabaseAdmin } from "@/lib/supabase";

const PROFILE_PREFIX = "__profile::";
const REGNICK_PREFIX = "__regnick::";
const MODES: GameModeId[] = ["mestre", "rua", "parca"];

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

/** Move pontos Conta do nick antigo → novo (display name + chave). */
async function renameRegisteredScoreRows(
  oldNick: string,
  newNick: string,
): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return;
  const oldBare = oldNick.trim().toLowerCase();
  const newBare = newNick.trim().toLowerCase();
  if (!oldBare || !newBare || oldBare === newBare) return;

  for (const mode of MODES) {
    const oldKey = trackStorageKey(mode, oldBare, "reg");
    const newKey = trackStorageKey(mode, newBare, "reg");
    const { data: oldRow, error } = await sb
      .from("leaderboard")
      .select("name, name_key, score, updated_at")
      .eq("name_key", oldKey)
      .maybeSingle();
    if (error || !oldRow) continue;

    const payload: Record<string, unknown> = {
      name: newNick,
      name_key: newKey,
      score: oldRow.score,
      updated_at: oldRow.updated_at || new Date().toISOString(),
    };
    let { error: upErr } = await sb.from("leaderboard").upsert(payload, {
      onConflict: "name_key",
    });
    if (upErr && /mode/i.test(upErr.message)) {
      payload.mode = mode;
      ({ error: upErr } = await sb.from("leaderboard").upsert(payload, {
        onConflict: "name_key,mode",
      }));
    }
    if (upErr) {
      console.error("[profiles] rename score", upErr.message);
      continue;
    }
    await sb.from("leaderboard").delete().eq("name_key", oldKey);
  }
}

/**
 * Define o nick registrado do usuário.
 * - Único no placar Conta (anônimo pode ter o mesmo texto).
 * - Trocar libera o nick antigo e renomeia linhas de ranking Conta.
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

  // Também bloqueia se já existe placar Conta com esse name_key (órfão).
  const sb = getSupabaseAdmin();
  if (sb) {
    const keys = MODES.map((m) => trackStorageKey(m, bare, "reg"));
    const { data: hits } = await sb
      .from("leaderboard")
      .select("name_key")
      .in("name_key", keys)
      .limit(1);
    if (hits && hits.length > 0 && (!owner || owner.userId !== userId)) {
      // Se não há owner meta mas há score, ainda assim bloqueia (nome em uso).
      if (!owner) {
        return {
          ok: false,
          error: `"${nick}" já está no placar Conta. Escolhe outro.`,
        };
      }
    }
  }

  if (prev?.nick) {
    const oldKey = regNickKey(prev.nick);
    if (sb) {
      await sb.from("leaderboard").delete().eq("name_key", oldKey);
    }
    await renameRegisteredScoreRows(prev.nick, nick);
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
