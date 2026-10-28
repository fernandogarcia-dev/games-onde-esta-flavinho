export type GameModeId = "mestre" | "rua" | "parca";

export type GameModeMeta = {
  id: GameModeId;
  name: string;
  tagline: string;
  blurb: string;
  tone: string;
  badge: string;
  art: string;
  artAlt: string;
  /** Label do botão na home */
  cta: string;
  /** Cor principal do modo (borda/botão/ênfase) */
  accent: string;
  /** Fundo suave do card / páginas */
  soft: string;
  /** Segundo tom pra blobs / detalhes */
  glow: string;
};

export const GAME_MODES: GameModeMeta[] = [
  {
    id: "mestre",
    name: "O Mestre dos Disfarces",
    tagline: "Ache o Flavinho na multidão",
    blurb:
      "Pistas da cidade, chute no mapa e depois caça ele no mar de disfarces antes do relógio zerar.",
    tone: "bg-[#e8f6ef] border-[#1f8a5b]",
    badge: "Modo 1",
    art: "/modes/mestre.jpg",
    artAlt: "Flavinho perdido numa multidão de disfarces",
    cta: "Caçar na multidão",
    accent: "#1f8a5b",
    soft: "#e8f6ef",
    glow: "#6bc49a",
  },
  {
    id: "rua",
    name: "Rua da Amargura",
    tagline: "Uma rua. Um chute. Acertou?",
    blurb:
      "Uma pista da cidade (Street View quando dá). Marca no mapa onde o Flavinho sumiu. Uma tentativa só.",
    tone: "bg-[#fff4d6] border-[#d4a017]",
    badge: "Modo 2",
    art: "/modes/rua.jpg",
    artAlt: "Flavinho sozinho numa rua vazia ao entardecer",
    cta: "Abrir a rua",
    accent: "#b8860b",
    soft: "#fff4d6",
    glow: "#e4c04a",
  },
  {
    id: "parca",
    name: "Diga-me com Quem Andas…",
    tagline: "Quem entrou no carro com ele?",
    blurb:
      "Não é achar o Flavinho — é descobrir qual figura pública ele levou no banco do carona. Uma tentativa.",
    tone: "bg-[#fde8e4] border-[#c2410c]",
    badge: "Modo 3",
    art: "/modes/parca.jpg",
    artAlt: "Flavinho fugindo de carro com um passageiro misterioso",
    cta: "Descobrir o parça",
    accent: "#c2410c",
    soft: "#fde8e4",
    glow: "#e07a55",
  },
];

export function getMode(id: GameModeId): GameModeMeta {
  return GAME_MODES.find((m) => m.id === id) ?? GAME_MODES[0];
}
