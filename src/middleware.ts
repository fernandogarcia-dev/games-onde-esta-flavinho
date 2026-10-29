import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL } from "@/lib/supabase";

/** Mantém sessão Auth fresca e cookies PKCE consistentes. */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!SUPABASE_URL || !anon) return response;

  const supabase = createServerClient(SUPABASE_URL, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Não use getSession aqui — getUser revalida no Auth server.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    /*
     * Tudo exceto assets estáticos / imagens.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
