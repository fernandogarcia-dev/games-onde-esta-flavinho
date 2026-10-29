import { NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import {
  getProfile,
  setRegisteredNick,
} from "@/lib/profiles";
import { sanitizeName } from "@/lib/ranking";

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
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  }
  const user = await userFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const profile = await getProfile(user.id);
  return NextResponse.json({
    userId: user.id,
    email: user.email,
    nick: profile?.nick || "",
  });
}

export async function POST(req: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  }
  const user = await userFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: { nick?: string };
  try {
    body = (await req.json()) as { nick?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const nick = sanitizeName(String(body.nick || ""));
  const result = await setRegisteredNick(user.id, user.email, nick);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json({
    ok: true,
    nick: result.nick,
    email: user.email,
    userId: user.id,
  });
}
