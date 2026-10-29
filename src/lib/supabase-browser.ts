"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase";

let browserClient: SupabaseClient | null = null;

/**
 * Client browser com PKCE em cookie (@supabase/ssr).
 * Evita "PKCE code verifier not found" no redirect do Google.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!SUPABASE_URL || !anon) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, anon);
  }
  return browserClient;
}
