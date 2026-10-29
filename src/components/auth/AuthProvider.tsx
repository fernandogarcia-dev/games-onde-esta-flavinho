"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type AuthCtx = {
  ready: boolean;
  user: User | null;
  session: Session | null;
  accessToken: string | null;
  regNick: string;
  email: string;
  refreshProfile: () => Promise<void>;
  setRegNickLocal: (nick: string) => void;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [regNick, setRegNick] = useState("");

  const refreshProfile = useCallback(async () => {
    const sb = getSupabaseBrowser();
    const token = (await sb?.auth.getSession())?.data.session?.access_token;
    if (!token) {
      setRegNick("");
      return;
    }
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { nick?: string };
      setRegNick((data.nick || "").trim());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setReady(true);
      return;
    }
    let mounted = true;
    void sb.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.access_token) {
      setRegNick("");
      return;
    }
    void refreshProfile();
  }, [session?.access_token, refreshProfile]);

  const signInWithGoogle = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      return {
        error:
          "Login indisponível agora. Confere as chaves do Supabase no ambiente.",
      };
    }
    // Mesma origem do clique (evita www vs apex matar o cookie PKCE).
    const origin = window.location.origin.replace(/\/$/, "");
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/?conta=1")}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      return {
        error:
          error.message.includes("provider")
            ? "Google ainda não está ligado no Supabase Auth. Ativa o provider Google no painel."
            : error.message,
      };
    }
    return {};
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowser();
    await sb?.auth.signOut();
    setRegNick("");
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      ready,
      user: session?.user ?? null,
      session,
      accessToken: session?.access_token ?? null,
      regNick,
      email: session?.user?.email || "",
      refreshProfile,
      setRegNickLocal: setRegNick,
      signInWithGoogle,
      signOut,
    }),
    [ready, session, regNick, refreshProfile, signInWithGoogle, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useAuth fora do AuthProvider");
  }
  return ctx;
}

/** Safe fora do provider (testes / SSR boundary). */
export function useAuthOptional(): AuthCtx | null {
  return useContext(Ctx);
}
