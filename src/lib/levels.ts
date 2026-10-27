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
  clues: [string, string, string];
  shareLine: string;
};

export type Level = EpisodeSeed & {
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
  brasilia: ["Cheira a Planalto demais.", "Cerrado planejado? Pista fria."],
  rio: ["Orla carioca não fecha.", "Cristo no fundo? Não é o caso."],
  saopaulo: ["Paulista e garoa não batem.", "SP aponta outro lado."],
  salvador: ["Pelourinho não assina essa pista.", "Axé ficou pra outra hora."],
  belohorizonte: ["Pão de queijo não salva essa pista.", "BH não fecha o mapa."],
  curitiba: ["Frio curitibano? Pista fria mesmo.", "Jardim botânico não aparece aqui."],
  recife: ["Pontes do Recife não batem.", "Frevo ficou pra depois."],
  miami: ["Boardwalk pastel? Não.", "Miami não fecha o mapa."],
  novayork: ["Big Apple demais pra essa pista.", "NY não assina esse áudio."],
  cancun: ["Turquesa mexicano? Pista fria.", "All-inclusive não aparece."],
  buenosaires: ["Tango e bife? Não é aqui.", "Portenho demais pra essa pista."],
  lisboa: ["Elétrico e nata? Pista fria.", "Lisboa não fecha."],
  londres: ["Chuva inglesa não bate.", "Londres aponta outro lado."],
  paris: ["Croissant e torre? Depois.", "Paris não assina."],
  barcelona: ["Gaudí não aparece nessa pista.", "Barcelona ficou frio."],
  roma: ["Fontana e gelato? Não.", "Roma não fecha o mapa."],
  dubai: ["Neon do Golfo? Pista fria.", "Dubai não fecha."],
  toquio: ["Neon japonês não bate.", "Tóquio aponta outro lado."],
};

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
    clues: [
      "Pediu água de coco e perguntou se a TV aberta pegava bem.",
      "Blazer azul passou perto de guarda-sóis listrados.",
      "Selfie borrada: Cristo no fundo, areia nos sapatos.",
    ],
    shareLine: "Achei o Flavinho no Rio!",
  },
  {
    id: "rio-bondinho",
    title: "Sinal no bondinho",
    correctCity: "rio",
    difficulty: "medium",
    clues: [
      "Áudio: 'sobe que a vista vale mais que a CPI'.",
      "Comprou bilhete e sumiu no meio de turistas de chapéu.",
      "Informante: 'não é SP. Tem bondinho e brisa salgada'.",
    ],
    shareLine: "Flavinho no Rio, de novo.",
  },
  {
    id: "rio-posto9",
    title: "Posto Nove sem aviso",
    correctCity: "rio",
    difficulty: "easy",
    clues: [
      "Alguém viu um blazer no meio de sunga e cooler.",
      "Pediu mate e perguntou se 'o clima esfriou'.",
      "Hashtag local: orla lotada, zero Planalto.",
    ],
    shareLine: "Flavinho no Posto Nove?!",
  },
  {
    id: "rio-lapa",
    title: "Eco na Lapa",
    correctCity: "rio",
    difficulty: "medium",
    clues: [
      "Música ao vivo, arcos ao fundo, blazer no meio da roda.",
      "Pediu chope e pediu pra ninguém filmar a cara.",
      "Testemunha: 'carioca, mas tentando parecer turista'.",
    ],
    shareLine: "Achei o Flavinho na Lapa",
  },
  {
    id: "rio-barco",
    title: "Barca pra Niterói",
    correctCity: "rio",
    difficulty: "hard",
    clues: [
      "Comprou passagem de última hora com cara de 'só indo'.",
      "Vento na baía, skyline de costas, blazer amarrotado.",
      "Mensagem: 'me acha do outro lado da água'.",
    ],
    shareLine: "Flavinho cruzando a baía",
  },
  {
    id: "rio-maracana",
    title: "Fora de jogo",
    correctCity: "rio",
    difficulty: "medium",
    clues: [
      "Grito de torcida e um blazer no meio da galera.",
      "Pediu hot dog e perguntou o placar errado de propósito.",
      "Não era estádio de Brasília. Era Maraca lotado.",
    ],
    shareLine: "Flavinho no Maracanã",
  },
  {
    id: "rio-sugarloaf",
    title: "Fila do Pão de Açúcar",
    correctCity: "rio",
    difficulty: "hard",
    clues: [
      "Fila interminável, selfie stick, blazer suando.",
      "Comentário: 'a vista tapa qualquer manchete'.",
      "Cartão postal com oceano dos dois lados.",
    ],
    shareLine: "Flavinho no Pão de Açúcar",
  },
  {
    id: "rio-feira",
    title: "Feira de artesanato",
    correctCity: "rio",
    difficulty: "easy",
    clues: [
      "Barganhou um chinelo e um chapéu de palha.",
      "Vendedor jurou: 'esse de blazer não é daqui, mas tá se esforçando'.",
      "Cheiro de sol, areia e água de coco no ar.",
    ],
    shareLine: "Flavinho na feirinha do Rio",
  },

  // Brasília
  {
    id: "bsb-planalto",
    title: "Fantasma do Planalto",
    correctCity: "brasilia",
    difficulty: "medium",
    clues: [
      "Café com leite e pergunta sobre 'agenda reservada'.",
      "Sapato no mármore, eco de corredor longo.",
      "Blazer azul perto de prédio que parece nave espacial.",
    ],
    shareLine: "Flavinho em Brasília",
  },
  {
    id: "bsb-eixo",
    title: "Eixo Monumental",
    correctCity: "brasilia",
    difficulty: "easy",
    clues: [
      "Caminhou num gramado largo demais pra ser carioca.",
      "Pediu Uber e o motorista falou 'setor hoteleiro'.",
      "Céu seco, modernismo e zero orla.",
    ],
    shareLine: "Flavinho no Eixo",
  },
  {
    id: "bsb-congresso",
    title: "Sombra das cúpulas",
    correctCity: "brasilia",
    difficulty: "hard",
    clues: [
      "Foto vazada: duas cúpulas brancas ao fundo.",
      "Segurança perguntou credencial. Ele sorriu e sumiu.",
      "Áudio: 'aqui todo mundo finge que não me viu'.",
    ],
    shareLine: "Flavinho no Congresso",
  },
  {
    id: "bsb-lago",
    title: "Volta no Paranoá",
    correctCity: "brasilia",
    difficulty: "medium",
    clues: [
      "Alugou bike e pediu rota 'sem jornalista'.",
      "Pôr do sol no lago, blazer no guidão.",
      "Não é marina de Dubai. É cerrado com água.",
    ],
    shareLine: "Flavinho no Paranoá",
  },
  {
    id: "bsb-asa",
    title: "Asa Sul depois das 22",
    correctCity: "brasilia",
    difficulty: "medium",
    clues: [
      "Bar de superquadra, conversa baixa, blazer no canto.",
      "Pediu porção e pediu nota fiscal no nome de outra pessoa.",
      "Cidade planejada demais pra ser improvisada no Rio.",
    ],
    shareLine: "Flavinho na Asa Sul",
  },
  {
    id: "bsb-aeroporto",
    title: "Conexão em BSB",
    correctCity: "brasilia",
    difficulty: "easy",
    clues: [
      "Embarque doméstico, óculos escuros, pressa fingida.",
      "Comprou chiclete e perguntou o portão errado de propósito.",
      "Painel: voos pra todo canto. Ele não pegou nenhum... ainda.",
    ],
    shareLine: "Flavinho no aeroporto de BSB",
  },
  {
    id: "bsb-tv-torre",
    title: "Torre de TV",
    correctCity: "brasilia",
    difficulty: "hard",
    clues: [
      "Mirante seco, vento no Cerrado, blazer batendo.",
      "Turista perguntou: 'isso aqui é o Congresso?' Ele só riu.",
      "Vista 360 de cidade que parece desenho técnico.",
    ],
    shareLine: "Flavinho na Torre de TV",
  },
  {
    id: "bsb-feira",
    title: "Feira da Torre",
    correctCity: "brasilia",
    difficulty: "easy",
    clues: [
      "Comprou pastel e sumiu entre barracas.",
      "Alguém gritou 'doutor!' e ele acelerou o passo.",
      "Brasília de domingo: feira, sol e disfarce fraco.",
    ],
    shareLine: "Flavinho na feira de Brasília",
  },

  // São Paulo
  {
    id: "sp-garoa",
    title: "Camuflagem na garoa",
    correctCity: "saopaulo",
    difficulty: "medium",
    clues: [
      "Sumiu atrás de um mar de guarda-chuvas cinza.",
      "Reclamou do trânsito na Paulista num áudio vazado.",
      "Reflexo de prédios no asfalto molhado.",
    ],
    shareLine: "Flavinho na Paulista",
  },
  {
    id: "sp-metro",
    title: "Linha vermelha",
    correctCity: "saopaulo",
    difficulty: "hard",
    clues: [
      "Embarcou no metrô com cara de quem nunca pega metrô.",
      "Segurou o teto e evitou contato visual com todo mundo.",
      "Estação lotada, anúncio incompreensível, blazer apertado.",
    ],
    shareLine: "Flavinho no metrô de SP",
  },
  {
    id: "sp- Liberdade",
    title: "Neon na Liberdade",
    correctCity: "saopaulo",
    difficulty: "medium",
    clues: [
      "Comprou pastel chinês e pediu pra embrulhar 'discreto'.",
      "Lanternas vermelhas, multidões, blazer no meio.",
      "Não era Paris. Era Liberdade num sábado.",
    ],
    shareLine: "Flavinho na Liberdade",
  },
  {
    id: "sp-masp",
    title: "Vão livre",
    correctCity: "saopaulo",
    difficulty: "easy",
    clues: [
      "Passou embaixo do MASP fingindo olhar arte.",
      "Alguém reconheceu o blazer. Ele cruzou a faixa correndo.",
      "Paulista, museu vermelho, trânsito eterno.",
    ],
    shareLine: "Flavinho no MASP",
  },
  {
    id: "sp-mercado",
    title: "Mercado Municipal",
    correctCity: "saopaulo",
    difficulty: "medium",
    clues: [
      "Pediu mortadela no pão e olhou demais pro celular.",
      "Cheiro de tempero, teto alto, blazer no balcão.",
      "SP clássica. Nada de orla, nada de Planalto.",
    ],
    shareLine: "Flavinho no Mercadão",
  },
  {
    id: "sp-ibirapuera",
    title: "Volta no Ibirapuera",
    correctCity: "saopaulo",
    difficulty: "easy",
    clues: [
      "Trotou no parque com fone e cara de 'não sou eu'.",
      "Parou pra foto com o lago... e cancelou a foto.",
      "Cidade cinza ao redor, verde no meio.",
    ],
    shareLine: "Flavinho no Ibirapuera",
  },
  {
    id: "sp-rooftop",
    title: "Rooftop sem convite",
    correctCity: "saopaulo",
    difficulty: "hard",
    clues: [
      "Lista VIP, nome falso, blazer na fila.",
      "Skyline de concreto e néon laranja.",
      "Alguém sussurrou: 'esse aí sumiu dos trending topics'.",
    ],
    shareLine: "Flavinho no rooftop de SP",
  },
  {
    id: "sp-feira-livros",
    title: "Banca de revista",
    correctCity: "saopaulo",
    difficulty: "medium",
    clues: [
      "Folheou capa de revista e colocou de volta depressa demais.",
      "Chuva fina, calçada estreita, blazer pingando.",
      "Cidade que não dorme e não perdoa selfie.",
    ],
    shareLine: "Flavinho numa banca em SP",
  },

  // Miami
  {
    id: "mia-boardwalk",
    title: "Escala tropical",
    correctCity: "miami",
    difficulty: "hard",
    clues: [
      "Motel pastel, inglês com sotaque e suco verde caro.",
      "Story com palmeira e legenda 'só um dia'.",
      "Boardwalk com ar de novela, não Europa.",
    ],
    shareLine: "Flavinho em Miami",
  },
  {
    id: "mia-ocean",
    title: "Ocean Drive",
    correctCity: "miami",
    difficulty: "medium",
    clues: [
      "Carros antigos pastel, blazer no meio de shorts.",
      "Pediu iced coffee e pagou em dólar.",
      "Art déco demais pra ser Copacabana.",
    ],
    shareLine: "Flavinho na Ocean Drive",
  },
  {
    id: "mia-mall",
    title: "Shopping com ar gelado",
    correctCity: "miami",
    difficulty: "easy",
    clues: [
      "Entrou no ar-condicionado como quem entra em bunker.",
      "Comprou óculos e perguntou se aceitava PIX. Não aceitava.",
      "Inglês no caixa, sotaque no troco.",
    ],
    shareLine: "Flavinho no shopping de Miami",
  },
  {
    id: "mia-marina",
    title: "Marina florida",
    correctCity: "miami",
    difficulty: "hard",
    clues: [
      "Olhou iates como quem compara agenda.",
      "Alguém falou 'south beach' e ele fingiu não ouvir.",
      "Sol forte, pastel nos prédios, zero Cristo Redentor.",
    ],
    shareLine: "Flavinho na marina de Miami",
  },
  {
    id: "mia-brunch",
    title: "Brunch sem Instagram",
    correctCity: "miami",
    difficulty: "medium",
    clues: [
      "Abacate no prato, blazer na cadeira, mesa na calçada.",
      "Garçom: 'where you from?' Resposta evasiva.",
      "Florida no cardápio. Brasil na cara.",
    ],
    shareLine: "Flavinho no brunch",
  },
  {
    id: "mia-night",
    title: "Neon depois das 23",
    correctCity: "miami",
    difficulty: "hard",
    clues: [
      "Fila de clube, lista fake, blazer ainda no corpo.",
      "DJ alto demais pra ouvir manchete.",
      "Não era Dubai. Era Miami tentando ser Dubai.",
    ],
    shareLine: "Flavinho na noite de Miami",
  },
  {
    id: "mia-uber",
    title: "Uber com sotaque",
    correctCity: "miami",
    difficulty: "easy",
    clues: [
      "Motorista brasileiro reconheceu o blazer e mudou de assunto.",
      "GPS falando inglês, rádio em espanhol.",
      "Destino: 'anywhere quiet'.",
    ],
    shareLine: "Flavinho de Uber em Miami",
  },
  {
    id: "mia-beach",
    title: "Toalha alugada",
    correctCity: "miami",
    difficulty: "medium",
    clues: [
      "Alugou cadeira, não tirou o blazer, surreal.",
      "Pediu água de coco... em inglês.",
      "Areia clara, prédios pastel, zero Pão de Açúcar.",
    ],
    shareLine: "Flavinho na praia de Miami",
  },

  // Paris
  {
    id: "par-cafe",
    title: "Café e disfarce",
    correctCity: "paris",
    difficulty: "hard",
    clues: [
      "Café e croissant. Recusou pagar em real.",
      "Selfie borrada com torre metálica longe.",
      "'Aqui ninguém me reconhece... eu acho.'",
    ],
    shareLine: "Flavinho em Paris",
  },
  {
    id: "par-metro",
    title: "Métro linha quem?",
    correctCity: "paris",
    difficulty: "medium",
    clues: [
      "Olhou o mapa do metrô de cabeça torta.",
      "Bilhete amassado, blazer no horário de pico.",
      "Francês no alto-falante, pânico educado no rosto.",
    ],
    shareLine: "Flavinho no metrô de Paris",
  },
  {
    id: "par-seine",
    title: "Beira do Sena",
    correctCity: "paris",
    difficulty: "easy",
    clues: [
      "Andou na margem fingindo ser poeta.",
      "Livros usados, pontes de pedra, blazer ao vento.",
      "Não era Paranoá. Era Sena com pose.",
    ],
    shareLine: "Flavinho no Sena",
  },
  {
    id: "par-louvre",
    title: "Fila do Louvre",
    correctCity: "paris",
    difficulty: "hard",
    clues: [
      "Entrou na fila e saiu três vezes.",
      "Comprou ímã de geladeira e se arrependeu.",
      "Pirâmide de vidro ao fundo. Blazer no meio.",
    ],
    shareLine: "Flavinho no Louvre",
  },
  {
    id: "par-night",
    title: "Luzes da torre",
    correctCity: "paris",
    difficulty: "medium",
    clues: [
      "Torre piscando de hora em hora, multidão aplaudindo.",
      "Ele só olhava o celular e a saída.",
      "Europa óbvia demais. Disfarce fraco demais.",
    ],
    shareLine: "Flavinho sob a Torre Eiffel",
  },
  {
    id: "par-bakery",
    title: "Padaria das 7h",
    correctCity: "paris",
    difficulty: "easy",
    clues: [
      "Primeiro da fila do pão. Último a sorrir.",
      "Pediu 'um desse' apontando pro croissant.",
      "Amanhecer cinza, calçada molhada, blazer limpo.",
    ],
    shareLine: "Flavinho na padaria parisiense",
  },
  {
    id: "par-museum",
    title: "Museu sem selfie",
    correctCity: "paris",
    difficulty: "hard",
    clues: [
      "Proibiram flash. Ele agradeceu baixo.",
      "Passou rápido demais pelas salas famosas.",
      "Saiu perguntando onde pegar Uber... em Paris.",
    ],
    shareLine: "Flavinho no museu",
  },
  {
    id: "par-bridge",
    title: "Cadeados da ponte",
    correctCity: "paris",
    difficulty: "medium",
    clues: [
      "Olhou os cadeados e murmurou 'isso não ia rolar no Senado'.",
      "Turistas beijando, ele só atravessando.",
      "Rio urbano, pedra velha, zero calçadão carioca.",
    ],
    shareLine: "Flavinho na ponte de Paris",
  },

  // Dubai
  {
    id: "dxb-neon",
    title: "Neon no deserto",
    correctCity: "dubai",
    difficulty: "hard",
    clues: [
      "Noite, ar-condicionado lendário.",
      "Marina espelhada, skyline de videogame.",
      "'Me encontra depois do pôr do sol, perto da água.'",
    ],
    shareLine: "Flavinho em Dubai",
  },
  {
    id: "dxb-mall",
    title: "Mall infinito",
    correctCity: "dubai",
    difficulty: "medium",
    clues: [
      "Andou no shopping como quem foge da temperatura lá fora.",
      "Fonte dançante, vitrine de relógio, blazer intacto.",
      "Árabe no anúncio, inglês no caixa, sumiço no meio.",
    ],
    shareLine: "Flavinho no mall de Dubai",
  },
  {
    id: "dxb-yacht",
    title: "Convite pro iate",
    correctCity: "dubai",
    difficulty: "hard",
    clues: [
      "Recusou o iate duas vezes. Aceitou a foto zero vezes.",
      "Água verde-azulada, prédio torto ao fundo.",
      "Não era Miami pastel. Era Golfo neon.",
    ],
    shareLine: "Flavinho no iate? Quase.",
  },
  {
    id: "dxb-souk",
    title: "Souk de ouro",
    correctCity: "dubai",
    difficulty: "medium",
    clues: [
      "Passou rápido demais pelas joias.",
      "Vendedor ofereceu chá. Ele pediu a saída.",
      "Mercado antigo, ar-condicionado moderno, blazer no labirinto.",
    ],
    shareLine: "Flavinho no souk",
  },
  {
    id: "dxb-desert",
    title: "Safari de fim de tarde",
    correctCity: "dubai",
    difficulty: "easy",
    clues: [
      "Areia no sapato social. Combinação estranha.",
      "Pôr do sol no deserto, selfie negada.",
      "Guia falou 'smile!' Ele fingiu tosse.",
    ],
    shareLine: "Flavinho no deserto",
  },
  {
    id: "dxb-fountain",
    title: "Show das fontes",
    correctCity: "dubai",
    difficulty: "medium",
    clues: [
      "Multidão filmando água dançando.",
      "Ele filmou a saída de emergência.",
      "Lago artificial, arranha-céus, zero garoa paulista.",
    ],
    shareLine: "Flavinho nas fontes de Dubai",
  },
  {
    id: "dxb-airport",
    title: "Escala DXB",
    correctCity: "dubai",
    difficulty: "easy",
    clues: [
      "Duty free absurdo, blazer no tapete rolante.",
      "Olhou voos pra 'qualquer lugar mais quieto'.",
      "Aeroporto que parece cidade. Ele parecia escala.",
    ],
    shareLine: "Flavinho em escala em Dubai",
  },
  {
    id: "dxb-frame",
    title: "Janela no céu",
    correctCity: "dubai",
    difficulty: "hard",
    clues: [
      "Mirante com moldura gigante sobre a cidade.",
      "Vento seco, vista cara, blazer teimoso.",
      "Cartão postal do Golfo. Rastro quente.",
    ],
    shareLine: "Flavinho no mirante de Dubai",
  },

  // Salvador
  {
    id: "ssa-pelourinho",
    title: "Ladeira no Pelô",
    correctCity: "salvador",
    difficulty: "easy",
    clues: [
      "Subiu ladeira colorida com blazer suando.",
      "Pediu acarajé e pediu pra não postar.",
      "Tambor ao longe. Não era Rio.",
    ],
    shareLine: "Flavinho em Salvador",
  },
  {
    id: "ssa-elevator",
    title: "Elevador Lacerda",
    correctCity: "salvador",
    difficulty: "medium",
    clues: [
      "Desceu de elevador urbano com vista pra baía.",
      "Comprou foto polaroid e rasgou depois.",
      "Bahia óbvia. Disfarce fraco.",
    ],
    shareLine: "Flavinho no Elevador Lacerda",
  },
  {
    id: "ssa-barra",
    title: "Farol da Barra",
    correctCity: "salvador",
    difficulty: "hard",
    clues: [
      "Farol ao fundo, pôr do sol lotado.",
      "Alguém gritou 'ô meu rei' e ele acelerou.",
      "Atlantico baiano, zero Cristo Redentor.",
    ],
    shareLine: "Flavinho no Farol da Barra",
  },

  // BH
  {
    id: "bh-pao",
    title: "Fila do pão de queijo",
    correctCity: "belohorizonte",
    difficulty: "easy",
    clues: [
      "Pediu pão de queijo e café com leite.",
      "Mineiro no balcão reconheceu o blazer e fingiu demência.",
      "Serra ao fundo. Nada de orla.",
    ],
    shareLine: "Flavinho em BH",
  },
  {
    id: "bh-liberade",
    title: "Feira hippie",
    correctCity: "belohorizonte",
    difficulty: "medium",
    clues: [
      "Domingo na Praça da Liberdade, barraca e sol.",
      "Comprou bijuteria e sumiu entre famílias.",
      "BH clássica. Sem neon de Dubai.",
    ],
    shareLine: "Flavinho na Liberdade (BH)",
  },

  // Curitiba
  {
    id: "cwb-botanico",
    title: "Estufa gelada",
    correctCity: "curitiba",
    difficulty: "easy",
    clues: [
      "Casaco por cima do blazer. Sinais de Paraná.",
      "Foto na estufa de vidro, cancelada na hora.",
      "Frio demais pra ser Salvador.",
    ],
    shareLine: "Flavinho em Curitiba",
  },
  {
    id: "cwb-bus",
    title: "Tubo de ônibus",
    correctCity: "curitiba",
    difficulty: "medium",
    clues: [
      "Entrou num tubo de estação de ônibus biarticulado.",
      "Pegou cartão transporte no nome errado.",
      "Organização curitibana. Zero caos carioca.",
    ],
    shareLine: "Flavinho no transporte de Curitiba",
  },

  // Recife
  {
    id: "rec-ponte",
    title: "Pontes e mangue",
    correctCity: "recife",
    difficulty: "medium",
    clues: [
      "Atravessou ponte com cheiro de maré.",
      "Pediu tapioca e olhou demais pro celular.",
      "Recife antigo. Frevo longe, blazer perto.",
    ],
    shareLine: "Flavinho no Recife",
  },
  {
    id: "rec-porto",
    title: "Marco Zero",
    correctCity: "recife",
    difficulty: "hard",
    clues: [
      "Palco vazio, praça aberta, vento do porto.",
      "Alguém vendeu cordel com a cara dele. Ele negou.",
      "Nordeste urbano. Sem Paulista.",
    ],
    shareLine: "Flavinho no Marco Zero",
  },

  // Buenos Aires
  {
    id: "bue-tango",
    title: "Milonga improvisada",
    correctCity: "buenosaires",
    difficulty: "medium",
    clues: [
      "Passou por milonga e recusou dançar.",
      "Pediu bife de chorizo e pagou em peso.",
      "Espanhol portenho. Não era Miami.",
    ],
    shareLine: "Flavinho em Buenos Aires",
  },
  {
    id: "bue-caminito",
    title: "Cores em La Boca",
    correctCity: "buenosaires",
    difficulty: "easy",
    clues: [
      "Casas coloridas, turistas, blazer no meio.",
      "Selfie com bandeira argentina... apagada.",
      "Caminito lotado. Rastro óbvio.",
    ],
    shareLine: "Flavinho em La Boca",
  },

  // Lisboa
  {
    id: "lis-tram",
    title: "Elétrico 28",
    correctCity: "lisboa",
    difficulty: "easy",
    clues: [
      "Subiu no elétrico amarelo lotado.",
      "Pediu pastel de nata e um espresso.",
      "Lisboa de cartão postal. Blazer amarrotado.",
    ],
    shareLine: "Flavinho em Lisboa",
  },
  {
    id: "lis-belem",
    title: "Fila em Belém",
    correctCity: "lisboa",
    difficulty: "hard",
    clues: [
      "Fila eterna de pastel. Ele desistiu no meio.",
      "Tejo ao fundo, torre de pedra.",
      "Portugal. Real brasileiro não passou no caixa.",
    ],
    shareLine: "Flavinho em Belém",
  },

  // Londres
  {
    id: "lon-tube",
    title: "Mind the gap",
    correctCity: "londres",
    difficulty: "medium",
    clues: [
      "Desceu no Tube com cara de quem odeia fila.",
      "Comprou umbrella barato sob chuva fina.",
      "Inglês no alto-falante. Blazer molhado.",
    ],
    shareLine: "Flavinho em Londres",
  },
  {
    id: "lon-bridge",
    title: "Tower Bridge selfie",
    correctCity: "londres",
    difficulty: "hard",
    clues: [
      "Pose quase feita. Foto cancelada.",
      "Ônibus vermelho passou na frente.",
      "Tâmisa cinza. Nada de marina neon.",
    ],
    shareLine: "Flavinho na Tower Bridge",
  },

  // Nova York
  {
    id: "nyc-subway",
    title: "Subway sem mapa",
    correctCity: "novayork",
    difficulty: "hard",
    clues: [
      "Olhou o mapa do subway de cabeça pra baixo.",
      "Pediu coffee to go e sumiu na multidãos.",
      "NY em rush hour. Zero disfarce bom.",
    ],
    shareLine: "Flavinho em Nova York",
  },
  {
    id: "nyc-central",
    title: "Central Park escape",
    correctCity: "novayork",
    difficulty: "medium",
    clues: [
      "Sentou num banco e fingiu ler jornal.",
      "Carruagem passou. Ele não olhou.",
      "Manhattan verde no meio do caos.",
    ],
    shareLine: "Flavinho no Central Park",
  },

  // Barcelona
  {
    id: "bcn-sagrada",
    title: "Fila da Sagrada",
    correctCity: "barcelona",
    difficulty: "medium",
    clues: [
      "Olhou a fachada e desistiu da fila.",
      "Pediu tapas e pagou em euro.",
      "Catalunha óbvia. Blazer no sol.",
    ],
    shareLine: "Flavinho em Barcelona",
  },
  {
    id: "bcn-beach",
    title: "Barceloneta",
    correctCity: "barcelona",
    difficulty: "easy",
    clues: [
      "Areia europeia, sem Cristo no fundo.",
      "Pediu sangria e pediu a conta rápido.",
      "Mediterrâneo. Não era Copacabana.",
    ],
    shareLine: "Flavinho na Barceloneta",
  },

  // Roma
  {
    id: "rom-fountain",
    title: "Moeda na fonte",
    correctCity: "roma",
    difficulty: "easy",
    clues: [
      "Jogou moeda e pediu pra ninguém filmar.",
      "Gelato na mão, blazer no ombro.",
      "Fontana lotada. Italiano no ar.",
    ],
    shareLine: "Flavinho em Roma",
  },
  {
    id: "rom-coliseu",
    title: "Selfie no Coliseu",
    correctCity: "roma",
    difficulty: "hard",
    clues: [
      "Quase tirou foto com gladiador de mentira.",
      "Desistiu. Saiu andando rápido.",
      "Ruína romana. Zero Dubai.",
    ],
    shareLine: "Flavinho no Coliseu",
  },

  // Cancún
  {
    id: "cun-resort",
    title: "All-inclusive",
    correctCity: "cancun",
    difficulty: "easy",
    clues: [
      "Pulseira de resort, blazer no buffet.",
      "Pediu margarita e olhou a saída.",
      "Turquesa mexicano. Espanhol de aeroporto.",
    ],
    shareLine: "Flavinho em Cancún",
  },
  {
    id: "cun-ruins",
    title: "Ruínas sob sol",
    correctCity: "cancun",
    difficulty: "medium",
    clues: [
      "Subiu pirâmide pequena e desceu arrependido.",
      "Guia falou em espanhol. Ele sorriu mudo.",
      "Quintana Roo. Não era Roma.",
    ],
    shareLine: "Flavinho nas ruínas perto de Cancún",
  },

  // Tóquio
  {
    id: "tyo-shibuya",
    title: "Travessia de Shibuya",
    correctCity: "toquio",
    difficulty: "hard",
    clues: [
      "Atravessou com a maré humana e quase voltou.",
      "Comprou chá em máquina e se perdeu.",
      "Neon japonês. Zero português no ar.",
    ],
    shareLine: "Flavinho em Shibuya",
  },
  {
    id: "tyo-temple",
    title: "Incenso em Asakusa",
    correctCity: "toquio",
    difficulty: "medium",
    clues: [
      "Passou pelo portão vermelho sem bater foto.",
      "Comprou amulete e guardou no bolso do blazer.",
      "Tóquio tradicional. Rastro quieto.",
    ],
    shareLine: "Flavinho em Asakusa",
  },
];

export const LEVELS: Level[] = EPISODE_SEEDS.map((seed) => ({
  ...seed,
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
