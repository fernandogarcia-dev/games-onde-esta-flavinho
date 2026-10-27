export type CityId =
  | "brasilia"
  | "rio"
  | "saopaulo"
  | "miami"
  | "paris"
  | "dubai";

export type City = {
  id: CityId;
  name: string;
  country: string;
  blurb: string;
};

export type Level = {
  id: string;
  title: string;
  correctCity: CityId;
  difficulty: "easy" | "medium" | "hard";
  clues: string[];
  wrongHints: Record<CityId, string>;
  scene: {
    background: string;
    crowdCount: number;
    flavinhoScale: number;
    /** Percent band where feet can stand (keeps crowd on the ground). */
    ground: { yMin: number; yMax: number; xMin?: number; xMax?: number };
  };
  shareLine: string;
};

export const CITIES: City[] = [
  {
    id: "brasilia",
    name: "Brasília",
    country: "Brasil",
    blurb: "Planalto, corredores e muita audiência.",
  },
  {
    id: "rio",
    name: "Rio de Janeiro",
    country: "Brasil",
    blurb: "Areia, óculos escuros e disfarce de turista.",
  },
  {
    id: "saopaulo",
    name: "São Paulo",
    country: "Brasil",
    blurb: "Guarda-chuva, trânsito e anonimato urbano.",
  },
  {
    id: "miami",
    name: "Miami",
    country: "EUA",
    blurb: "Palmeiras, pastel e vista pro mar.",
  },
  {
    id: "paris",
    name: "Paris",
    country: "França",
    blurb: "Café, croissant e torre no horizonte.",
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "EAU",
    blurb: "Marina iluminada e ar-condicionado no máximo.",
  },
];

export const LEVELS: Level[] = [
  {
    id: "ep1-rio",
    title: "Episódio 1: Sumiço na orla",
    correctCity: "rio",
    difficulty: "easy",
    clues: [
      "Última pista: alguém pediu água de coco e perguntou se o sinal da TV aberta pegava bem.",
      "Uma testemunha viu um blazer azul-marinho passando perto de guarda-sóis listrados.",
      "O informante jura: 'não é Planalto. É praia. E tem Cristo no fundo da selfie.'",
    ],
    wrongHints: {
      brasilia: "Brasília é seca demais pra essa pista de coco.",
      rio: "",
      saopaulo: "Em SP chove, mas a pista fala em orla.",
      miami: "Miami tem praia, mas a pista cheira a Cristo Redentor.",
      paris: "Paris não combina com água de coco.",
      dubai: "Dubai brilha à noite, mas a pista é de sol e areia carioca.",
    },
    scene: {
      background: "/game/scene-rio-cartoon.jpg",
      crowdCount: 48,
      flavinhoScale: 0.085,
      ground: { yMin: 62, yMax: 94, xMin: 2, xMax: 72 },
    },
    shareLine: "Achei o Flavinho no Rio no Onde Está Flavinho?!",
  },
  {
    id: "ep2-brasilia",
    title: "Episódio 2: Fantasma do Planalto",
    correctCity: "brasilia",
    difficulty: "medium",
    clues: [
      "Alguém pediu café com leite e perguntou o horário da próxima 'agenda reservada'.",
      "Pista sonora: sapato no piso de mármore e eco de corredor longo.",
      "Um estagiário murmurou: 'vi um blazer azul perto de um prédio que parece nave espacial'.",
    ],
    wrongHints: {
      brasilia: "",
      rio: "Rio é praia. Aqui a pista é mármore e corredor.",
      saopaulo: "SP é caos vertical, não modernismo espacial.",
      miami: "Miami não tem Planalto.",
      paris: "Paris tem museu, não nave-palácio.",
      dubai: "Dubai é marina, não Cerrado planejado.",
    },
    scene: {
      background: "/game/scene-brasilia-cartoon.jpg",
      crowdCount: 52,
      flavinhoScale: 0.08,
      ground: { yMin: 55, yMax: 94, xMin: 4, xMax: 96 },
    },
    shareLine: "Flavinho tava em Brasília o tempo todo 😭",
  },
  {
    id: "ep3-sp",
    title: "Episódio 3: Camuflagem na garoa",
    correctCity: "saopaulo",
    difficulty: "medium",
    clues: [
      "Testemunha: 'ele sumiu atrás de um mar de guarda-chuvas cinza'.",
      "Áudio vazado: alguém reclamando de trânsito na Paulista.",
      "Pista visual: reflexo de predinhos no asfalto molhado.",
    ],
    wrongHints: {
      brasilia: "Brasília quase não tem essa garoa dramática.",
      rio: "Rio molhado existe, mas a pista cita Paulista.",
      saopaulo: "",
      miami: "Miami raramente pede tanta capa de chuva.",
      paris: "Paris chove, mas não é Paulista.",
      dubai: "Dubai quase não conhece garoa.",
    },
    scene: {
      background: "/game/scene-sp-cartoon.jpg",
      crowdCount: 56,
      flavinhoScale: 0.078,
      ground: { yMin: 58, yMax: 95, xMin: 4, xMax: 96 },
    },
    shareLine: "Achei o Flavinho na Paulista (de guarda-chuva)!",
  },
  {
    id: "ep4-miami",
    title: "Episódio 4: Escala tropical",
    correctCity: "miami",
    difficulty: "hard",
    clues: [
      "Cartão-postal: motel pastel, inglês com sotaque e suco verde caro.",
      "Alguém postou story com palmeira e legenda 'só um dia'.",
      "Informante internacional: 'não é Europa. É Boardwalk com ar de novela'.",
    ],
    wrongHints: {
      brasilia: "Brasília não tem boardwalk pastel.",
      rio: "Rio é brasileiro demais pra essa pista em inglês.",
      saopaulo: "SP não é motel pastel à beira-mar.",
      miami: "",
      paris: "Paris não é tropical boardwalk.",
      dubai: "Dubai é deserto chic, não motel pastel.",
    },
    scene: {
      background: "/game/scene-miami-cartoon.jpg",
      crowdCount: 58,
      flavinhoScale: 0.075,
      ground: { yMin: 60, yMax: 94, xMin: 3, xMax: 78 },
    },
    shareLine: "Flavinho em Miami no jogo Onde Está Flavinho",
  },
  {
    id: "ep5-paris",
    title: "Episódio 5: Café e disfarce",
    correctCity: "paris",
    difficulty: "hard",
    clues: [
      "Pedido: café e croissant. Recusou a conta em real.",
      "Selfie borrada com uma torre metálica bem longe.",
      "Frase ouvida: 'aqui ninguém me reconhece... eu acho'.",
    ],
    wrongHints: {
      brasilia: "Brasília não serve esse croissant com torre.",
      rio: "Rio tem Cristo, não torre de ferro.",
      saopaulo: "SP tem café, mas a torre denuncia Europa.",
      miami: "Miami não esconde uma torre assim.",
      paris: "",
      dubai: "Dubai tem torre, mas a pista cheira a café parisiense.",
    },
    scene: {
      background: "/game/scene-paris-cartoon.jpg",
      crowdCount: 60,
      flavinhoScale: 0.072,
      ground: { yMin: 58, yMax: 95, xMin: 4, xMax: 96 },
    },
    shareLine: "Flavinho em Paris?! Onde Está Flavinho é viciante",
  },
  {
    id: "ep6-dubai",
    title: "Episódio 6: Neon no deserto",
    correctCity: "dubai",
    difficulty: "hard",
    clues: [
      "Horário: noite. Temperatura: ar-condicionado lendário.",
      "Pista: marina espelhada e skyline que parece videogame.",
      "Último áudio: 'me encontra depois do pôr do sol, perto da água'.",
    ],
    wrongHints: {
      brasilia: "Brasília de noite não é marina de videogame.",
      rio: "Rio tem orla, mas a pista é skyline neon.",
      saopaulo: "SP brilha, mas não é marina do Golfo.",
      miami: "Miami é mais pastel do que neon de deserto.",
      paris: "Paris não tem essa marina de videogame.",
      dubai: "",
    },
    scene: {
      background: "/game/scene-dubai-cartoon.jpg",
      crowdCount: 62,
      flavinhoScale: 0.07,
      ground: { yMin: 58, yMax: 95, xMin: 4, xMax: 96 },
    },
    shareLine: "Final: Flavinho em Dubai. Joga Onde Está Flavinho!",
  },
];

export function getCity(id: CityId): City {
  return CITIES.find((c) => c.id === id)!;
}
