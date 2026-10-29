import { buildShareUrl } from "@/lib/monetization";
import { getMode, type GameModeId } from "@/lib/modes";
import { formatClock } from "@/lib/scoring";
import type { Difficulty } from "@/lib/types";

export type ShareChannel =
  | "whatsapp"
  | "twitter"
  | "facebook"
  | "copy"
  | "native";

function labelMode(d: Difficulty) {
  if (d === "easy") return "Fácil";
  if (d === "medium") return "Médio";
  return "Difícil";
}

/** URL de share: home geral ou página do modo (OG bate com a arte). */
export function gameShareUrl(mode?: GameModeId | "home" | null) {
  if (!mode || mode === "home") return buildShareUrl("/");
  return buildShareUrl(getMode(mode).path);
}

export function buildInviteText(mode?: GameModeId | "home" | null) {
  if (mode && mode !== "home") {
    const meta = getMode(mode);
    return `Cadê Flavinho? · ${meta.name}\n${meta.tagline}\nEntra e joga: ${gameShareUrl(mode)}`;
  }
  return `Cadê Flavinho?\nVocê consegue achar ele na multidão antes do tempo zerar?\nEntra e joga agora: ${gameShareUrl()}`;
}

export function buildResultText(opts: {
  shareLine?: string;
  playerName?: string;
  cityName?: string;
  score: number;
  elapsedSec: number;
  findSec?: number;
  difficulty: Difficulty;
  rank?: number | null;
  won: boolean;
  mode?: GameModeId;
}) {
  const who = opts.playerName?.trim() ? `${opts.playerName.trim()} · ` : "";
  const mode = labelMode(opts.difficulty);
  const totalTime = formatClock(opts.elapsedSec);
  const findBit =
    opts.findSec != null && opts.findSec >= 0
      ? ` · achado em ${formatClock(opts.findSec)}`
      : "";
  const rankBit =
    opts.rank != null && opts.rank > 0 ? ` · #${opts.rank} no ranking` : "";
  const url = gameShareUrl(opts.mode ?? "mestre");

  if (opts.won) {
    const headline = opts.shareLine?.trim() || "Achei o Flavinho!";
    const where = opts.cityName ? ` em ${opts.cityName}` : "";
    return `${headline}\n${who}${opts.score.toLocaleString("pt-BR")} pts${where} · modo ${mode}${findBit}\nTempo de corrida: ${totalTime}${rankBit}\n${url}`;
  }

  return `Quase peguei o Flavinho…\n${who}${opts.score.toLocaleString("pt-BR")} pts · ${totalTime} de corrida · modo ${mode}\nBate meu tempo: ${url}`;
}

export function buildRankText(opts: {
  playerName?: string;
  score: number;
  rank?: number | null;
  best?: number;
  mode?: GameModeId | "home";
}) {
  const who = opts.playerName?.trim() || "Eu";
  const url = gameShareUrl(opts.mode ?? "home");
  if (opts.rank != null && opts.rank > 0) {
    return `${who} está #${opts.rank} no Cadê Flavinho com ${opts.score.toLocaleString("pt-BR")} pts!\nDesafia? ${url}`;
  }
  const pts = Math.max(opts.score, opts.best ?? 0);
  if (pts > 0) {
    return `${who} tem ${pts.toLocaleString("pt-BR")} pts no Cadê Flavinho.\nConsegue passar? ${url}`;
  }
  return buildInviteText(opts.mode);
}

export function whatsappShareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function twitterShareUrl(text: string) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function facebookShareUrl(url = gameShareUrl()) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export async function nativeShare(
  text: string,
  title = "Cadê Flavinho?",
  url = gameShareUrl(),
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

export function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
