import { NextResponse } from "next/server";
import { clientIpFromRequest } from "@/lib/client-ip";
import { getProfile } from "@/lib/profiles";
import { sanitizeName } from "@/lib/ranking";
import {
  isGlobalRankEnabled,
  isNameTaken,
  listRanks,
  lookupPlayer,
  normalizeRankMode,
  normalizeRankTrack,
  RankNameTakenError,
  upsertRank,
} from "@/lib/rank-store";
import { getSupabaseAdmin } from "@/lib/supabase";

async function userFromAuthHeader(req: Request): Promise<{
  id: string;
  email: string;
} | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email || "",
  };
}

export async function GET(req: Request) {
  if (!isGlobalRankEnabled()) {
    return NextResponse.json(
      {
        entries: [],
        global: false,
        error:
          "Supabase sem API key. Defina SUPABASE_SERVICE_ROLE_KEY (e rode o SQL da migration).",
      },
      { status: 503 },
    );
  }

  try {
    const url = new URL(req.url);
    const mode = normalizeRankMode(url.searchParams.get("mode"));
    const track = normalizeRankTrack(url.searchParams.get("track"));
    const check = sanitizeName(url.searchParams.get("check") || "");
    const deviceKey = String(url.searchParams.get("deviceKey") || "").trim();
    const user = await userFromAuthHeader(req);

    if (check) {
      const hit = await isNameTaken(check, {
        deviceKey,
        track,
        userId: user?.id,
      });
      return NextResponse.json({
        global: true,
        mode,
        track,
        available: hit.available,
        taken: hit.taken,
        name: hit.name,
        ownerScore: hit.taken ? hit.score : undefined,
        suggestLogin: hit.suggestLogin === true,
      });
    }

    const who = sanitizeName(url.searchParams.get("name") || "");
    const entries = await listRanks(mode, track);
    let myRank = 0;
    let myEntry = null as { name: string; score: number; at: number } | null;

    if (who) {
      const hit = entries.findIndex(
        (e) => e.name.toLowerCase() === who.toLowerCase(),
      );
      if (hit >= 0) {
        myRank = hit + 1;
        myEntry = entries[hit];
      } else {
        const looked = await lookupPlayer(who, mode, track);
        myRank = looked.rank;
        myEntry = looked.entry;
      }
    }

    return NextResponse.json({
      entries,
      global: true,
      mode,
      track,
      myRank: myRank > 0 ? myRank : undefined,
      myEntry: myEntry || undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha no ranking";
    return NextResponse.json(
      { entries: [], global: true, error: message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!isGlobalRankEnabled()) {
    return NextResponse.json(
      { error: "Supabase não configurado" },
      { status: 503 },
    );
  }

  let body: {
    name?: string;
    score?: number;
    deviceKey?: string;
    isNewName?: boolean;
    mode?: string;
    accumulate?: boolean;
    track?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const track = normalizeRankTrack(body.track);
  const mode = normalizeRankMode(body.mode);
  const accumulate = mode === "mestre";
  const clientIp = clientIpFromRequest(req);
  const deviceKey = String(body.deviceKey || "").trim();
  const isNewName = Boolean(body.isNewName);
  const user = await userFromAuthHeader(req);

  let name = sanitizeName(String(body.name || ""));
  let userId: string | undefined;

  if (track === "reg") {
    if (!user) {
      return NextResponse.json(
        { error: "Faça login pra pontuar no placar Conta." },
        { status: 401 },
      );
    }
    userId = user.id;
    const profile = await getProfile(user.id);
    if (!profile?.nick) {
      return NextResponse.json(
        {
          error: "Escolhe um apelido da Conta antes de pontuar.",
          code: "need_reg_nick",
        },
        { status: 400 },
      );
    }
    name = profile.nick;
  }

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Nome curto demais" }, { status: 400 });
  }
  const score = Math.floor(Number(body.score));
  if (!Number.isFinite(score) || score < 1 || score > 1_000_000) {
    return NextResponse.json({ error: "Pontuação inválida" }, { status: 400 });
  }
  if (track === "anon" && deviceKey.length < 8) {
    return NextResponse.json(
      { error: "Aparelho sem identificação. Atualiza a página." },
      { status: 400 },
    );
  }

  try {
    const { entries, rank, bestScore } = await upsertRank(
      name,
      score,
      deviceKey,
      { isNewName, mode, clientIp, accumulate, track, userId },
    );
    return NextResponse.json({
      entries,
      rank,
      bestScore,
      global: true,
      mode,
      track,
    });
  } catch (e) {
    if (e instanceof RankNameTakenError) {
      return NextResponse.json(
        {
          error: e.message,
          code: e.code,
          ownerScore: e.ownerScore,
          suggestLogin: track === "anon",
          global: true,
          mode,
          track,
        },
        { status: 409 },
      );
    }
    const message = e instanceof Error ? e.message : "Falha ao gravar";
    return NextResponse.json(
      { error: message, global: true, mode, track },
      { status: 500 },
    );
  }
}
