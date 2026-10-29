"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

/** Completa o OAuth PKCE no browser e manda pra home com modal Conta. */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Entrando…");

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setMsg("Login indisponível.");
      router.replace("/?conta=1&auth=config");
      return;
    }

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const err = url.searchParams.get("error_description");

    if (err) {
      setMsg(err);
      window.setTimeout(() => router.replace("/?conta=1&auth=erro"), 1200);
      return;
    }

    void (async () => {
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (error) {
          setMsg(error.message);
          window.setTimeout(() => router.replace("/?conta=1&auth=erro"), 1500);
          return;
        }
      } else {
        // detectSessionInUrl / sessão já persistida
        await sb.auth.getSession();
      }
      router.replace("/?conta=1");
    })();
  }, [router]);

  return (
    <main className="flex min-h-[50vh] items-center justify-center p-6">
      <p className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        {msg}
      </p>
    </main>
  );
}
