import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL } from "@/lib/supabase";

/** Server client (Route Handlers) — lê/grava cookies do PKCE. */
export async function getSupabaseServer() {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!SUPABASE_URL || !anon) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Em Server Component puro set pode falhar; no Route Handler ok.
        }
      },
    },
  });
}
