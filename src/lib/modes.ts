export type GameModeId = "mestre" | "rua" | "parca";

export type GameModeMeta = {
  id: GameModeId;
  name: string;
  tagline: string;
  blurb: string;
  tone: string;
  badge: string;
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
  },
  {
    id: "rua",
    name: "Rua da Amargura",
    tagline: "Street View. Marca no mapa.",
    blurb:
      "Panorama 360° da rua. Gira, anda um pouco e aponta no mapa-múndi onde o Flavinho sumiu.",
    tone: "bg-[#fff4d6] border-[#d4a017]",
    badge: "Modo 2",
  },
  {
    id: "parca",
    name: "Diga-me com Quem Andas…",
    tagline: "Quem tava com ele na fuga?",
    blurb:
      "Dicas afiadas, tom de meme. Descobre qual figura pública era o parça do sumiço.",
    tone: "bg-[#fde8e4] border-[#c2410c]",
    badge: "Modo 3",
  },
];

export function getMode(id: GameModeId): GameModeMeta {
  return GAME_MODES.find((m) => m.id === id) ?? GAME_MODES[0];
}
