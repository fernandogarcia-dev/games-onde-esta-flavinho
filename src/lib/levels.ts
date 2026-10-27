import { CITY_SCENES, type SceneConfig } from "@/lib/scenes";
import type { CityId } from "@/lib/types";

export type { CityId };

export type City = {
  id: CityId;
  name: string;
  country: string;
  blurb: string;
};

export type EpisodeSeed = {
  id: string;
  title: string;
  correctCity: CityId;
  difficulty: "easy" | "medium" | "hard";
  shareLine: string;
};

export type Level = EpisodeSeed & {
  clues: string[];
  wrongHints: Record<CityId, string>;
  scene: SceneConfig;
};

export const CITIES: City[] = [
  { id: "brasilia", name: "Brasília", country: "Brasil", blurb: "Planalto e corredores longos." },
  { id: "rio", name: "Rio de Janeiro", country: "Brasil", blurb: "Orla, coco e disfarce de turista." },
  { id: "saopaulo", name: "São Paulo", country: "Brasil", blurb: "Garoa, metrô e anonimato." },
  { id: "salvador", name: "Salvador", country: "Brasil", blurb: "Pelourinho, axé e ladeiras." },
  { id: "belohorizonte", name: "Belo Horizonte", country: "Brasil", blurb: "Pão de queijo e serra." },
  { id: "curitiba", name: "Curitiba", country: "Brasil", blurb: "Frio, ônibus e jardim botânico." },
  { id: "recife", name: "Recife", country: "Brasil", blurb: "Pontes, mangue e frevo." },
  { id: "miami", name: "Miami", country: "EUA", blurb: "Pastel, inglês e boardwalk." },
  { id: "novayork", name: "Nova York", country: "EUA", blurb: "Arranha-céu e café pra viagem." },
  { id: "cancun", name: "Cancún", country: "México", blurb: "Turquesa, all-inclusive e sol." },
  { id: "buenosaires", name: "Buenos Aires", country: "Argentina", blurb: "Tango, bife e espanhol." },
  { id: "lisboa", name: "Lisboa", country: "Portugal", blurb: "Elétrico, pastel de nata." },
  { id: "londres", name: "Londres", country: "Reino Unido", blurb: "Chuva, metrô e sotaque." },
  { id: "paris", name: "Paris", country: "França", blurb: "Café, croissant e torre." },
  { id: "barcelona", name: "Barcelona", country: "Espanha", blurb: "Gaudí, praia e tapas." },
  { id: "roma", name: "Roma", country: "Itália", blurb: "Fontes, gelato e ruínas." },
  { id: "dubai", name: "Dubai", country: "EAU", blurb: "Marina, neon e ar gelado." },
  { id: "toquio", name: "Tóquio", country: "Japão", blurb: "Neon, metrô e vending machine." },
];

const GENERIC_WRONG: Record<CityId, string[]> = {
  brasilia: [
    "Essas características não batem com Brasília.",
    "Planalto e Eixo Monumental? Não é esta cidade.",
  ],
  rio: [
    "Cristo, orla e Pão de Açúcar? Não fecha com estas pistas.",
    "O Rio não combina com o que está na mesa.",
  ],
  saopaulo: [
    "Paulista, MASP e garoa? Não é São Paulo.",
    "Essas marcas não apontam para Sampa.",
  ],
  salvador: [
    "Pelourinho e Elevador Lacerda? Não é Salvador.",
    "As pistas não fecham com a Bahia.",
  ],
  belohorizonte: [
    "Pão de queijo e Serra do Curral? Não é BH.",
    "Belo Horizonte não fecha com estas características.",
  ],
  curitiba: [
    "Jardim Botânico e estação-tubo? Não é Curitiba.",
    "O frio paranaense não aparece nestas pistas.",
  ],
  recife: [
    "Pontes, frevo e Marco Zero? Não é Recife.",
    "Pernambuco não fecha com o que está na mesa.",
  ],
  miami: [
    "South Beach e Art Déco? Não é Miami.",
    "A Flórida não combina com estas pistas.",
  ],
  novayork: [
    "Estátua da Liberdade e Times Square? Não é Nova York.",
    "A Big Apple não assina estas características.",
  ],
  cancun: [
    "Água turquesa e Zona Hotelera? Não é Cancún.",
    "O Caribe mexicano não fecha com estas pistas.",
  ],
  buenosaires: [
    "Tango, Obelisco e bife? Não é Buenos Aires.",
    "A capital argentina não combina com a mesa.",
  ],
  lisboa: [
    "Elétrico amarelo e pastel de nata? Não é Lisboa.",
    "Portugal não fecha com estas características.",
  ],
  londres: [
    "Big Ben e ônibus vermelho? Não é Londres.",
    "O Reino Unido não aparece nestas pistas.",
  ],
  paris: [
    "Torre Eiffel e Louvre? Não é Paris.",
    "A França não fecha com o que está na mesa.",
  ],
  barcelona: [
    "Sagrada Família e Gaudí? Não é Barcelona.",
    "A Catalunha não combina com estas pistas.",
  ],
  roma: [
    "Coliseu e Fontana di Trevi? Não é Roma.",
    "A Itália não fecha com estas características.",
  ],
  dubai: [
    "Burj Khalifa e Palm Jumeirah? Não é Dubai.",
    "Os Emirados não aparecem nestas pistas.",
  ],
  toquio: [
    "Shibuya e templos? Não é Tóquio.",
    "O Japão não fecha com o que está na mesa.",
  ],
}

function buildWrongHints(correct: CityId): Record<CityId, string> {
  const out = {} as Record<CityId, string>;
  for (const city of CITIES) {
    const id = city.id;
    if (id === correct) {
      out[id] = "";
      continue;
    }
    const pool = GENERIC_WRONG[id];
    out[id] = pool[(correct.length + id.length) % pool.length];
  }
  return out;
}

/** Dozens of dossiers. Same city can appear in many different stories. */
export const EPISODE_SEEDS: EpisodeSeed[] = [
  // Rio
  {
    id: "rio-coco-tv",
    title: "Sumiço na orla",
    correctCity: "rio",
    difficulty: "easy",
    shareLine: "Achei o Flavinho no Rio!",
  },
  {
    id: "rio-bondinho",
    title: "Sinal no bondinho",
    correctCity: "rio",
    difficulty: "medium",
    shareLine: "Flavinho no Rio, de novo.",
  },
  {
    id: "rio-posto9",
    title: "Posto Nove sem aviso",
    correctCity: "rio",
    difficulty: "easy",
    shareLine: "Flavinho no Posto Nove?!",
  },
  {
    id: "rio-lapa",
    title: "Eco na Lapa",
    correctCity: "rio",
    difficulty: "medium",
    shareLine: "Achei o Flavinho na Lapa",
  },
  {
    id: "rio-barco",
    title: "Barca pra Niterói",
    correctCity: "rio",
    difficulty: "hard",
    shareLine: "Flavinho cruzando a baía",
  },
  {
    id: "rio-maracana",
    title: "Fora de jogo",
    correctCity: "rio",
    difficulty: "medium",
    shareLine: "Flavinho no Maracanã",
  },
  {
    id: "rio-sugarloaf",
    title: "Fila do Pão de Açúcar",
    correctCity: "rio",
    difficulty: "hard",
    shareLine: "Flavinho no Pão de Açúcar",
  },
  {
    id: "rio-feira",
    title: "Feira de artesanato",
    correctCity: "rio",
    difficulty: "easy",
    shareLine: "Flavinho na feirinha do Rio",
  },

  // Brasília
  {
    id: "bsb-planalto",
    title: "Fantasma do Planalto",
    correctCity: "brasilia",
    difficulty: "medium",
    shareLine: "Flavinho em Brasília",
  },
  {
    id: "bsb-eixo",
    title: "Eixo Monumental",
    correctCity: "brasilia",
    difficulty: "easy",
    shareLine: "Flavinho no Eixo",
  },
  {
    id: "bsb-congresso",
    title: "Sombra das cúpulas",
    correctCity: "brasilia",
    difficulty: "hard",
    shareLine: "Flavinho no Congresso",
  },
  {
    id: "bsb-lago",
    title: "Volta no Paranoá",
    correctCity: "brasilia",
    difficulty: "medium",
    shareLine: "Flavinho no Paranoá",
  },
  {
    id: "bsb-asa",
    title: "Asa Sul depois das 22",
    correctCity: "brasilia",
    difficulty: "medium",
    shareLine: "Flavinho na Asa Sul",
  },
  {
    id: "bsb-aeroporto",
    title: "Conexão em BSB",
    correctCity: "brasilia",
    difficulty: "easy",
    shareLine: "Flavinho no aeroporto de BSB",
  },
  {
    id: "bsb-tv-torre",
    title: "Torre de TV",
    correctCity: "brasilia",
    difficulty: "hard",
    shareLine: "Flavinho na Torre de TV",
  },
  {
    id: "bsb-feira",
    title: "Feira da Torre",
    correctCity: "brasilia",
    difficulty: "easy",
    shareLine: "Flavinho na feira de Brasília",
  },

  // São Paulo
  {
    id: "sp-garoa",
    title: "Camuflagem na garoa",
    correctCity: "saopaulo",
    difficulty: "medium",
    shareLine: "Flavinho na Paulista",
  },
  {
    id: "sp-metro",
    title: "Linha vermelha",
    correctCity: "saopaulo",
    difficulty: "hard",
    shareLine: "Flavinho no metrô de SP",
  },
  {
    id: "sp-liberdade",
    title: "Neon na Liberdade",
    correctCity: "saopaulo",
    difficulty: "medium",
    shareLine: "Flavinho na Liberdade",
  },
  {
    id: "sp-masp",
    title: "Vão livre",
    correctCity: "saopaulo",
    difficulty: "easy",
    shareLine: "Flavinho no MASP",
  },
  {
    id: "sp-mercado",
    title: "Mercado Municipal",
    correctCity: "saopaulo",
    difficulty: "medium",
    shareLine: "Flavinho no Mercadão",
  },
  {
    id: "sp-ibirapuera",
    title: "Volta no Ibirapuera",
    correctCity: "saopaulo",
    difficulty: "easy",
    shareLine: "Flavinho no Ibirapuera",
  },
  {
    id: "sp-rooftop",
    title: "Rooftop sem convite",
    correctCity: "saopaulo",
    difficulty: "hard",
    shareLine: "Flavinho no rooftop de SP",
  },
  {
    id: "sp-feira-livros",
    title: "Banca de revista",
    correctCity: "saopaulo",
    difficulty: "medium",
    shareLine: "Flavinho numa banca em SP",
  },

  // Miami
  {
    id: "mia-boardwalk",
    title: "Escala tropical",
    correctCity: "miami",
    difficulty: "hard",
    shareLine: "Flavinho em Miami",
  },
  {
    id: "mia-ocean",
    title: "Ocean Drive",
    correctCity: "miami",
    difficulty: "medium",
    shareLine: "Flavinho na Ocean Drive",
  },
  {
    id: "mia-mall",
    title: "Shopping com ar gelado",
    correctCity: "miami",
    difficulty: "easy",
    shareLine: "Flavinho no shopping de Miami",
  },
  {
    id: "mia-marina",
    title: "Marina florida",
    correctCity: "miami",
    difficulty: "hard",
    shareLine: "Flavinho na marina de Miami",
  },
  {
    id: "mia-brunch",
    title: "Brunch sem Instagram",
    correctCity: "miami",
    difficulty: "medium",
    shareLine: "Flavinho no brunch",
  },
  {
    id: "mia-night",
    title: "Neon depois das 23",
    correctCity: "miami",
    difficulty: "hard",
    shareLine: "Flavinho na noite de Miami",
  },
  {
    id: "mia-uber",
    title: "Uber com sotaque",
    correctCity: "miami",
    difficulty: "easy",
    shareLine: "Flavinho de Uber em Miami",
  },
  {
    id: "mia-beach",
    title: "Toalha alugada",
    correctCity: "miami",
    difficulty: "medium",
    shareLine: "Flavinho na praia de Miami",
  },

  // Paris
  {
    id: "par-cafe",
    title: "Café e disfarce",
    correctCity: "paris",
    difficulty: "hard",
    shareLine: "Flavinho em Paris",
  },
  {
    id: "par-metro",
    title: "Métro linha quem?",
    correctCity: "paris",
    difficulty: "medium",
    shareLine: "Flavinho no metrô de Paris",
  },
  {
    id: "par-seine",
    title: "Beira do Sena",
    correctCity: "paris",
    difficulty: "easy",
    shareLine: "Flavinho no Sena",
  },
  {
    id: "par-louvre",
    title: "Fila do Louvre",
    correctCity: "paris",
    difficulty: "hard",
    shareLine: "Flavinho no Louvre",
  },
  {
    id: "par-night",
    title: "Luzes da torre",
    correctCity: "paris",
    difficulty: "medium",
    shareLine: "Flavinho sob a Torre Eiffel",
  },
  {
    id: "par-bakery",
    title: "Padaria das 7h",
    correctCity: "paris",
    difficulty: "easy",
    shareLine: "Flavinho na padaria parisiense",
  },
  {
    id: "par-museum",
    title: "Museu sem selfie",
    correctCity: "paris",
    difficulty: "hard",
    shareLine: "Flavinho no museu",
  },
  {
    id: "par-bridge",
    title: "Cadeados da ponte",
    correctCity: "paris",
    difficulty: "medium",
    shareLine: "Flavinho na ponte de Paris",
  },

  // Dubai
  {
    id: "dxb-neon",
    title: "Neon no deserto",
    correctCity: "dubai",
    difficulty: "hard",
    shareLine: "Flavinho em Dubai",
  },
  {
    id: "dxb-mall",
    title: "Mall infinito",
    correctCity: "dubai",
    difficulty: "medium",
    shareLine: "Flavinho no mall de Dubai",
  },
  {
    id: "dxb-yacht",
    title: "Convite pro iate",
    correctCity: "dubai",
    difficulty: "hard",
    shareLine: "Flavinho no iate? Quase.",
  },
  {
    id: "dxb-souk",
    title: "Souk de ouro",
    correctCity: "dubai",
    difficulty: "medium",
    shareLine: "Flavinho no souk",
  },
  {
    id: "dxb-desert",
    title: "Safari de fim de tarde",
    correctCity: "dubai",
    difficulty: "easy",
    shareLine: "Flavinho no deserto",
  },
  {
    id: "dxb-fountain",
    title: "Show das fontes",
    correctCity: "dubai",
    difficulty: "medium",
    shareLine: "Flavinho nas fontes de Dubai",
  },
  {
    id: "dxb-airport",
    title: "Escala DXB",
    correctCity: "dubai",
    difficulty: "easy",
    shareLine: "Flavinho em escala em Dubai",
  },
  {
    id: "dxb-frame",
    title: "Janela no céu",
    correctCity: "dubai",
    difficulty: "hard",
    shareLine: "Flavinho no mirante de Dubai",
  },

  // Salvador
  {
    id: "ssa-pelourinho",
    title: "Ladeira no Pelô",
    correctCity: "salvador",
    difficulty: "easy",
    shareLine: "Flavinho em Salvador",
  },
  {
    id: "ssa-elevator",
    title: "Elevador Lacerda",
    correctCity: "salvador",
    difficulty: "medium",
    shareLine: "Flavinho no Elevador Lacerda",
  },
  {
    id: "ssa-barra",
    title: "Farol da Barra",
    correctCity: "salvador",
    difficulty: "hard",
    shareLine: "Flavinho no Farol da Barra",
  },

  // BH
  {
    id: "bh-pao",
    title: "Fila do pão de queijo",
    correctCity: "belohorizonte",
    difficulty: "easy",
    shareLine: "Flavinho em BH",
  },
  {
    id: "bh-liberade",
    title: "Feira hippie",
    correctCity: "belohorizonte",
    difficulty: "medium",
    shareLine: "Flavinho na Liberdade (BH)",
  },

  // Curitiba
  {
    id: "cwb-botanico",
    title: "Estufa gelada",
    correctCity: "curitiba",
    difficulty: "easy",
    shareLine: "Flavinho em Curitiba",
  },
  {
    id: "cwb-bus",
    title: "Tubo de ônibus",
    correctCity: "curitiba",
    difficulty: "medium",
    shareLine: "Flavinho no transporte de Curitiba",
  },

  // Recife
  {
    id: "rec-ponte",
    title: "Pontes e mangue",
    correctCity: "recife",
    difficulty: "medium",
    shareLine: "Flavinho no Recife",
  },
  {
    id: "rec-porto",
    title: "Marco Zero",
    correctCity: "recife",
    difficulty: "hard",
    shareLine: "Flavinho no Marco Zero",
  },

  // Buenos Aires
  {
    id: "bue-tango",
    title: "Milonga improvisada",
    correctCity: "buenosaires",
    difficulty: "medium",
    shareLine: "Flavinho em Buenos Aires",
  },
  {
    id: "bue-caminito",
    title: "Cores em La Boca",
    correctCity: "buenosaires",
    difficulty: "easy",
    shareLine: "Flavinho em La Boca",
  },

  // Lisboa
  {
    id: "lis-tram",
    title: "Elétrico 28",
    correctCity: "lisboa",
    difficulty: "easy",
    shareLine: "Flavinho em Lisboa",
  },
  {
    id: "lis-belem",
    title: "Fila em Belém",
    correctCity: "lisboa",
    difficulty: "hard",
    shareLine: "Flavinho em Belém",
  },

  // Londres
  {
    id: "lon-tube",
    title: "Mind the gap",
    correctCity: "londres",
    difficulty: "medium",
    shareLine: "Flavinho em Londres",
  },
  {
    id: "lon-bridge",
    title: "Tower Bridge selfie",
    correctCity: "londres",
    difficulty: "hard",
    shareLine: "Flavinho na Tower Bridge",
  },

  // Nova York
  {
    id: "nyc-subway",
    title: "Subway sem mapa",
    correctCity: "novayork",
    difficulty: "hard",
    shareLine: "Flavinho em Nova York",
  },
  {
    id: "nyc-central",
    title: "Central Park escape",
    correctCity: "novayork",
    difficulty: "medium",
    shareLine: "Flavinho no Central Park",
  },

  // Barcelona
  {
    id: "bcn-sagrada",
    title: "Fila da Sagrada",
    correctCity: "barcelona",
    difficulty: "medium",
    shareLine: "Flavinho em Barcelona",
  },
  {
    id: "bcn-beach",
    title: "Barceloneta",
    correctCity: "barcelona",
    difficulty: "easy",
    shareLine: "Flavinho na Barceloneta",
  },

  // Roma
  {
    id: "rom-fountain",
    title: "Moeda na fonte",
    correctCity: "roma",
    difficulty: "easy",
    shareLine: "Flavinho em Roma",
  },
  {
    id: "rom-coliseu",
    title: "Selfie no Coliseu",
    correctCity: "roma",
    difficulty: "hard",
    shareLine: "Flavinho no Coliseu",
  },

  // Cancún
  {
    id: "cun-resort",
    title: "All-inclusive",
    correctCity: "cancun",
    difficulty: "easy",
    shareLine: "Flavinho em Cancún",
  },
  {
    id: "cun-ruins",
    title: "Ruínas sob sol",
    correctCity: "cancun",
    difficulty: "medium",
    shareLine: "Flavinho nas ruínas perto de Cancún",
  },

  // Tóquio
  {
    id: "tyo-shibuya",
    title: "Travessia de Shibuya",
    correctCity: "toquio",
    difficulty: "hard",
    shareLine: "Flavinho em Shibuya",
  },
  {
    id: "tyo-temple",
    title: "Incenso em Asakusa",
    correctCity: "toquio",
    difficulty: "medium",
    shareLine: "Flavinho em Asakusa",
  },
];

export const LEVELS: Level[] = EPISODE_SEEDS.map((seed) => ({
  ...seed,
  clues: [] as string[],
  wrongHints: buildWrongHints(seed.correctCity),
  scene: CITY_SCENES[seed.correctCity],
}));

export function getCity(id: CityId): City {
  return CITIES.find((c) => c.id === id)!;
}

export function getLevelById(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

/** 6 city options for the map: correct + 5 random others (changes every dossier). */
export function pickCityOptions(correct: CityId, salt: string): City[] {
  let h = 2166136261;
  for (let i = 0; i < salt.length; i++) {
    h ^= salt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h |= 0;
    h =
      (Math.imul(h ^ (h >>> 16), 2246822507) +
        Math.imul(h ^ (h >>> 13), 3266489909)) |
      0;
    return ((h >>> 0) % 10000) / 10000;
  };
  const others = CITIES.filter((c) => c.id !== correct);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const picked = [getCity(correct), ...others.slice(0, 5)];
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked;
}
