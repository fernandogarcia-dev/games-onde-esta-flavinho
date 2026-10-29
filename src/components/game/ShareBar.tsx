"use client";

import { useEffect, useState } from "react";
import {
  trackShare,
  type ShareMethod,
} from "@/lib/analytics";
import type { GameModeId } from "@/lib/modes";
import {
  copyShareText,
  facebookShareUrl,
  gameShareUrl,
  nativeShare,
  openShareWindow,
  twitterShareUrl,
  whatsappShareUrl,
} from "@/lib/share";

type Props = {
  text: string;
  label?: string;
  align?: "left" | "center" | "right";
  compact?: boolean;
  /** Modo atual — vai no evento share do Analytics */
  mode?: GameModeId | "home";
  source?: string;
};

export function ShareBar({
  text,
  label = "Compartilhar",
  align = "left",
  compact = false,
  mode = "home",
  source = "share_bar",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    setCanNative(typeof navigator.share === "function");
  }, []);

  const alignClass =
    align === "center"
      ? "items-center text-center"
      : align === "right"
        ? "items-end text-right"
        : "items-start text-left";

  const pageUrl = gameShareUrl(mode);

  function noteShare(method: ShareMethod) {
    trackShare(method, { mode, source });
  }

  async function onCopy() {
    const ok = await copyShareText(text);
    if (!ok) return;
    noteShare("copy");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function onNative() {
    const shared = await nativeShare(text, "Cadê Flavinho?", pageUrl);
    if (shared) {
      noteShare("native");
      return;
    }
    await onCopy();
  }

  const btn =
    "inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-[var(--ink)] bg-white px-3 font-bold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--sand)] active:translate-y-0 disabled:opacity-50";
  const size = compact ? "h-9 px-2.5 text-xs" : "h-10 px-3 text-sm";

  return (
    <div className={`flex flex-col gap-2 ${alignClass}`}>
      <p
        className={`font-bold uppercase tracking-[0.16em] text-[var(--muted)] ${
          compact ? "text-[10px]" : "text-xs"
        }`}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2" style={{ justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start" }}>
        <button
          type="button"
          className={`${btn} ${size}`}
          onClick={() => {
            noteShare("whatsapp");
            openShareWindow(whatsappShareUrl(text));
          }}
          aria-label="Compartilhar no WhatsApp"
        >
          <WhatsAppIcon />
          Zap
        </button>
        <button
          type="button"
          className={`${btn} ${size}`}
          onClick={() => {
            noteShare("x");
            openShareWindow(twitterShareUrl(text));
          }}
          aria-label="Compartilhar no X"
        >
          <XIcon />
          X
        </button>
        <button
          type="button"
          className={`${btn} ${size}`}
          onClick={() => {
            noteShare("facebook");
            openShareWindow(facebookShareUrl(pageUrl));
          }}
          aria-label="Compartilhar no Facebook"
        >
          <FacebookIcon />
          Face
        </button>
        <button
          type="button"
          className={`${btn} ${size}`}
          onClick={() => void onCopy()}
          aria-label="Copiar texto"
        >
          <CopyIcon />
          {copied ? "Copiado!" : "Copiar"}
        </button>
        {canNative && (
          <button
            type="button"
            className={`${btn} ${size}`}
            onClick={() => void onNative()}
            aria-label="Mais opções de compartilhar"
          >
            <ShareIcon />
            Mais
          </button>
        )}
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.5 3.5A11 11 0 0 0 2.4 17.7L1.5 22.5l4.9-.9A11 11 0 1 0 20.5 3.5Zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-2.9.5.5-2.8-.2-.3a9.1 9.1 0 1 1 7.5 4.1Zm5-6.8c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.7.7 2.4.8 3.3.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3 0-.1-.2-.2-.5-.3Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.2 2H21l-6.6 7.5L22 22h-6.2l-4.9-6.4L5.3 22H2.5l7-8L2 2h6.3l4.4 5.8L18.2 2Zm-1.1 18h1.7L7 3.9H5.2L17.1 20Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3.1l.9-3H13v-2c0-.6.4-1 1-1Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.4 13.1 15.6 17M15.6 7 8.4 10.9" />
    </svg>
  );
}
