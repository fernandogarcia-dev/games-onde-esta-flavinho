export type GameModeId = "mestre" | "rua" | "parca";

export type GameModeMeta = {
  id: GameModeId;
  /** Path canônico pra URL + OG share */
  path: `/${string}`;
  name: string;
  tagline: string;
  blurb: string;
  /** Descrição curta pra meta/OG */
  seoDescription: string;
  tone: string;
  badge: string;
  art: string;
  artAlt: string;
  /** Imagem Open Graph / WhatsApp deste modo */
  ogImage: string;
  ogWidth: number;
  ogHeight: number;
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
    path: "/mestre-dos-disfarces",
    name: "O Mestre dos Disfarces",
    tagline: "Ache o Flavinho na multidão",
    blurb:
      "Pistas da cidade, chute no mapa e depois caça ele no mar de disfarces antes do relógio zerar.",
    seoDescription:
      "Modo O Mestre dos Disfarces: ache o Flavinho na multidão com pistas, timer e ranking mundial. Grátis no navegador.",
    tone: "bg-[#e8f6ef] border-[#1f8a5b]",
    badge: "Modo 1",
    art: "/modes/mestre.jpg",
    artAlt: "Flavinho perdido numa multidão de disfarces",
    ogImage: "/modes/mestre.jpg?v=1",
    ogWidth: 1200,
    ogHeight: 900,
    cta: "Caçar na multidão",
    accent: "#1f8a5b",
    soft: "#e8f6ef",
    glow: "#6bc49a",
  },
  {
    id: "rua",
    path: "/rua-da-amargura",
    name: "Rua da Amargura",
    tagline: "Uma rua. Um chute. Acertou?",
    blurb:
      "Street View + um pin no mapa. País errado é erro; país certo conta — e a distância diz o quão perto você chegou.",
    seoDescription:
      "Modo Rua da Amargura: Street View, um chute no mapa e ranking mundial. País certo conta — grátis no navegador.",
    tone: "bg-[#fff4d6] border-[#d4a017]",
    badge: "Modo 2",
    art: "/modes/rua.jpg",
    artAlt: "Flavinho sozinho numa rua vazia ao entardecer",
    ogImage: "/modes/rua.jpg?v=1",
    ogWidth: 1200,
    ogHeight: 900,
    cta: "Abrir a rua",
    accent: "#b8860b",
    soft: "#fff4d6",
    glow: "#e4c04a",
  },
  {
    id: "parca",
    path: "/diga-me-com-quem-andas",
    name: "Diga-me com Quem Andas…",
    tagline: "Quem entrou no carro com ele?",
    blurb:
      "Não é achar o Flavinho — é descobrir qual figura pública ele levou no banco do carona. Uma tentativa.",
    seoDescription:
      "Modo Diga-me com Quem Andas: descubra quem o Flavinho levou na fuga. Uma tentativa, ranking mundial — grátis.",
    tone: "bg-[#fde8e4] border-[#c2410c]",
    badge: "Modo 3",
    art: "/modes/parca.jpg",
    artAlt: "Flavinho fugindo de carro com um passageiro misterioso",
    ogImage: "/modes/parca.jpg?v=1",
    ogWidth: 1200,
    ogHeight: 900,
    cta: "Descobrir o parça",
    accent: "#c2410c",
    soft: "#fde8e4",
    glow: "#e07a55",
  },
];

export function getMode(id: GameModeId): GameModeMeta {
  return GAME_MODES.find((m) => m.id === id) ?? GAME_MODES[0];
}

export function getModeByPath(path: string): GameModeMeta | null {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return GAME_MODES.find((m) => m.path === clean) ?? null;
}
