import { NextResponse } from "next/server";
import { sanitizeName } from "@/lib/ranking";
import {
  isGlobalRankEnabled,
  listRanks,
  upsertRank,
} from "@/lib/rank-store";

export async function GET() {
  const entries = await listRanks();
  return NextResponse.json({
    entries: entries.slice(0, 20),
    global: isGlobalRankEnabled(),
  });
}

export async function POST(req: Request) {
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

  const { entries, rank } = await upsertRank(name, score);
  return NextResponse.json({
    entries: entries.slice(0, 20),
    rank,
    global: isGlobalRankEnabled(),
  });
}
