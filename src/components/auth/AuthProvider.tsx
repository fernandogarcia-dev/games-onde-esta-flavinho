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
import { AccountModal } from "@/components/auth/AccountModal";
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
  /** Abre modal Conta (login / trocar nick). */
  openAccount: (preferredNick?: string) => void;
  closeAccount: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [regNick, setRegNick] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [preferredNick, setPreferredNick] = useState("");

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("conta") === "1") {
      setAccountOpen(true);
      // Mantém path/query limpos (só tira conta=1), sem jogar pra "/".
      params.delete("conta");
      params.delete("auth");
      const qs = params.toString();
      const clean = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState({}, "", clean);
    }
  }, []);

  const openAccount = useCallback((nick?: string) => {
    if (nick) setPreferredNick(nick);
    setAccountOpen(true);
  }, []);

  const closeAccount = useCallback(() => setAccountOpen(false), []);

  const signInWithGoogle = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      return {
        error:
          "Login indisponível agora. Confere as chaves do Supabase no ambiente.",
      };
    }
    const origin = window.location.origin.replace(/\/$/, "");
    // Volta pra página atual (modo) com modal Conta aberto — não manda pra home.
    const path = `${window.location.pathname || "/"}${window.location.search || ""}`;
    const basePath = path.split("#")[0] || "/";
    const sep = basePath.includes("?") ? "&" : "?";
    const next = basePath.includes("conta=1")
      ? basePath
      : `${basePath}${sep}conta=1`;
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      return {
        error: error.message.includes("provider")
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
      openAccount,
      closeAccount,
    }),
    [
      ready,
      session,
      regNick,
      refreshProfile,
      signInWithGoogle,
      signOut,
      openAccount,
      closeAccount,
    ],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <AccountModal
        open={accountOpen}
        onClose={closeAccount}
        preferredNick={preferredNick || regNick}
      />
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useAuth fora do AuthProvider");
  }
  return ctx;
}

export function useAuthOptional(): AuthCtx | null {
  return useContext(Ctx);
}
