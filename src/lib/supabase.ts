import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "https://elpxkbcnaexbkyynclaf.supabase.co";

/** Fallback público do site (auth callback). */
export const SITE_URL_FALLBACK = "https://cadeflavinho.com.br";

export function supabaseConfigured() {
  return Boolean(
    SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
  );
}

/** Server client — prefer service role so writes bypass RLS. */
export function getSupabaseAdmin(): SupabaseClient | null {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
