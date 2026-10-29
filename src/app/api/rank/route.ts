import { NextResponse } from "next/server";
import { clientIpFromRequest } from "@/lib/client-ip";
import { sanitizeName } from "@/lib/ranking";
import {
  isGlobalRankEnabled,
  isNameTaken,
  listRanks,
  lookupPlayer,
  normalizeRankMode,
  RankNameTakenError,
  upsertRank,
} from "@/lib/rank-store";

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
    const check = sanitizeName(url.searchParams.get("check") || "");
    const deviceKey = String(url.searchParams.get("deviceKey") || "").trim();
    const clientIp = clientIpFromRequest(req);

    if (check) {
      const hit = await isNameTaken(check, { deviceKey, clientIp });
      return NextResponse.json({
        global: true,
        mode,
        available: hit.available,
        taken: hit.taken,
        reclaimable: hit.reclaimable,
        name: hit.name,
        ownerScore: hit.taken || hit.reclaimable ? hit.score : undefined,
      });
    }

    const who = sanitizeName(url.searchParams.get("name") || "");
    const entries = await listRanks(mode);
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
        const looked = await lookupPlayer(who, mode);
        myRank = looked.rank;
        myEntry = looked.entry;
      }
    }

    return NextResponse.json({
      entries,
      global: true,
      mode,
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
  };
  try {
    body = (await req.json()) as {
      name?: string;
      score?: number;
      deviceKey?: string;
      isNewName?: boolean;
      mode?: string;
    };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = sanitizeName(String(body.name || ""));
  const score = Math.floor(Number(body.score));
  const deviceKey = String(body.deviceKey || "").trim();
  const isNewName = Boolean(body.isNewName);
  const mode = normalizeRankMode(body.mode);
  const clientIp = clientIpFromRequest(req);

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Nome curto demais" }, { status: 400 });
  }
  if (!Number.isFinite(score) || score < 1 || score > 1_000_000) {
    return NextResponse.json({ error: "Pontuação inválida" }, { status: 400 });
  }
  if (deviceKey.length < 8) {
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
      { isNewName, mode, clientIp },
    );
    return NextResponse.json({
      entries,
      rank,
      bestScore,
      global: true,
      mode,
    });
  } catch (e) {
    if (e instanceof RankNameTakenError) {
      return NextResponse.json(
        {
          error: e.message,
          code: e.code,
          ownerScore: e.ownerScore,
          global: true,
          mode,
        },
        { status: 409 },
      );
    }
    const message = e instanceof Error ? e.message : "Falha ao gravar";
    return NextResponse.json(
      { error: message, global: true, mode },
      { status: 500 },
    );
  }
}
