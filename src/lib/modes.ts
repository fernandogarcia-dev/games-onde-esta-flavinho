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
  },
  {
    id: "rua",
    name: "Rua da Amargura",
    tagline: "Street View. Um chute. Acertou?",
    blurb:
      "Uma rua misteriosa no Street View. Gira, anda um pouco e marca no mapa onde o Flavinho sumiu. Uma tentativa só.",
    tone: "bg-[#fff4d6] border-[#d4a017]",
    badge: "Modo 2",
    art: "/modes/rua.jpg",
    artAlt: "Flavinho sozinho numa rua vazia ao entardecer",
  },
  {
    id: "parca",
    name: "Diga-me com Quem Andas…",
    tagline: "Quem ele levou na fuga?",
    blurb:
      "O Flavinho não sumiu sozinho. Pelas dicas, descobre qual figura pública foi o parça que ele levou embora.",
    tone: "bg-[#fde8e4] border-[#c2410c]",
    badge: "Modo 3",
    art: "/modes/parca.jpg",
    artAlt: "Flavinho fugindo com um parça em silhueta",
  },
];

export function getMode(id: GameModeId): GameModeMeta {
  return GAME_MODES.find((m) => m.id === id) ?? GAME_MODES[0];
}
