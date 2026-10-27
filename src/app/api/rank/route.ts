import { NextResponse } from "next/server";
import { sanitizeName } from "@/lib/ranking";
import {
  isGlobalRankEnabled,
  listRanks,
  lookupPlayer,
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
    const who = sanitizeName(url.searchParams.get("name") || "");
    const entries = await listRanks();
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
        const looked = await lookupPlayer(who);
        myRank = looked.rank;
        myEntry = looked.entry;
      }
    }

    return NextResponse.json({
      entries: entries.slice(0, 20),
      global: true,
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

  let body: { name?: string; score?: number };
  try {
    body = (await req.json()) as { name?: string; score?: number };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = sanitizeName(String(body.name || ""));
  const score = Math.floor(Number(body.score));

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Nome curto demais" }, { status: 400 });
  }
  if (!Number.isFinite(score) || score < 1 || score > 1_000_000) {
    return NextResponse.json({ error: "Pontuação inválida" }, { status: 400 });
  }

  try {
    const { entries, rank } = await upsertRank(name, score);
    return NextResponse.json({
      entries: entries.slice(0, 20),
      rank,
      global: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha ao gravar";
    return NextResponse.json({ error: message, global: true }, { status: 500 });
  }
}
