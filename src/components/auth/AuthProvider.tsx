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
import {
  clearContaCache,
  peekContaNick,
  readContaCache,
  writeContaCache,
} from "@/lib/conta-cache";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type AuthCtx = {
  ready: boolean;
  /** Sessão resolvida E perfil Conta já consultado (ou sem sessão). */
  profileReady: boolean;
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
  const [profileReady, setProfileReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [regNick, setRegNick] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [preferredNick, setPreferredNick] = useState("");

  const applyNick = useCallback((userId: string | undefined, nick: string) => {
    const clean = nick.trim();
    setRegNick(clean);
    if (userId && clean) writeContaCache(userId, clean);
  }, []);

  const refreshProfile = useCallback(async () => {
    const sb = getSupabaseBrowser();
    const current = (await sb?.auth.getSession())?.data.session;
    const token = current?.access_token;
    const uid = current?.user?.id;
    if (!token) {
      setProfileReady(true);
      return;
    }
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        // Mantém cache/local — não zera o nick por falha de rede.
        setProfileReady(true);
        return;
      }
      const data = (await res.json()) as { nick?: string };
      const nick = (data.nick || "").trim();
      if (nick) {
        applyNick(uid, nick);
      } else {
        // Perfil sem nick: limpa só o state; mantém cache se existir até o user salvar.
        setRegNick("");
      }
    } catch {
      /* mantém cache */
    } finally {
      setProfileReady(true);
    }
  }, [applyNick]);

  const hydrateSession = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setReady(true);
      setProfileReady(true);
      return;
    }
    const { data } = await sb.auth.getSession();
    const next = data.session;
    setSession(next);
    if (next?.user?.id) {
      const cached = readContaCache(next.user.id) || peekContaNick();
      if (cached) setRegNick(cached);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setReady(true);
      setProfileReady(true);
      return;
    }
    let mounted = true;
    void hydrateSession().then(() => {
      if (!mounted) return;
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        // Sessão caiu: NÃO apaga cache do nick — pai reabre Google e continua.
        setProfileReady(true);
      } else if (next.user?.id) {
        const cached = readContaCache(next.user.id) || peekContaNick();
        if (cached) {
          setRegNick(cached);
          writeContaCache(next.user.id, cached);
        }
        setProfileReady(false);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [hydrateSession]);

  useEffect(() => {
    if (!session?.access_token) {
      if (ready) setProfileReady(true);
      return;
    }
    setProfileReady(false);
    void refreshProfile();
  }, [session?.access_token, refreshProfile, ready]);

  // Revalida sessão ao voltar pra aba — evita “pede Google de novo” falso.
  useEffect(() => {
    function onVis() {
      if (document.visibilityState === "visible") {
        void hydrateSession();
      }
    }
    window.addEventListener("focus", onVis);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onVis);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [hydrateSession]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("conta") === "1") {
      setAccountOpen(true);
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

  const setRegNickLocal = useCallback(
    (nick: string) => {
      applyNick(session?.user?.id, nick);
    },
    [applyNick, session?.user?.id],
  );

  const signInWithGoogle = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      return {
        error:
          "Login indisponível agora. Confere as chaves do Supabase no ambiente.",
      };
    }
    const origin = window.location.origin.replace(/\/$/, "");
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
    clearContaCache();
  }, []);

  // Nick efetivo: state OU cache do aparelho (sessão caiu / ainda hidratando).
  const effectiveNick = regNick || peekContaNick();

  const value = useMemo<AuthCtx>(
    () => ({
      ready,
      profileReady,
      user: session?.user ?? null,
      session,
      accessToken: session?.access_token ?? null,
      regNick: effectiveNick,
      email: session?.user?.email || "",
      refreshProfile,
      setRegNickLocal,
      signInWithGoogle,
      signOut,
      openAccount,
      closeAccount,
    }),
    [
      ready,
      profileReady,
      session,
      effectiveNick,
      refreshProfile,
      setRegNickLocal,
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
        preferredNick={preferredNick || effectiveNick}
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
