import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SITE_URL_FALLBACK, SUPABASE_URL } from "@/lib/supabase";

/**
 * OAuth callback no servidor — troca o code usando o verifier nos cookies.
 * (O client page antigo falhava com "PKCE code verifier not found".)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") || "/?conta=1";
  const site = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    SITE_URL_FALLBACK
  ).replace(/\/$/, "");

  // Prefere o origin da request (dev localhost); em prod cadeflavinho.
  const requestOrigin = url.origin;
  const isLocal =
    requestOrigin.includes("localhost") || requestOrigin.includes("127.0.0.1");
  const origin = isLocal ? requestOrigin : site;

  const next = nextRaw.startsWith("http")
    ? nextRaw
    : `${origin}${nextRaw.startsWith("/") ? nextRaw : `/${nextRaw}`}`;

  const fail = `${origin}/?conta=1&auth=erro`;

  if (!code) {
    return NextResponse.redirect(fail);
  }

  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!SUPABASE_URL || !anon) {
    return NextResponse.redirect(`${origin}/?conta=1&auth=config`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback]", error.message);
    return NextResponse.redirect(fail);
  }

  return NextResponse.redirect(next);
}
