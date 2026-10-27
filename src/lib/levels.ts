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
  brasilia: [
    "Isso cheira a Planalto demais — o rastro não fecha em Brasília.",
    "Cerrado planejado e corredor de mármore? Pista fria para cá.",
  ],
  rio: [
    "Orla carioca não fecha com essas pistas.",
    "Cristo no fundo não combina com o que chegou na mesa.",
  ],
  saopaulo: [
    "Paulista e garoa não batem com o restante do dossiê.",
    "São Paulo aponta para outro lado do mapa.",
  ],
  salvador: [
    "O Pelourinho não assina essa pista.",
    "Axé e ladeira colorida ficaram para outra pasta.",
  ],
  belohorizonte: [
    "Pão de queijo não salva essa combinação de pistas.",
    "Belo Horizonte não fecha o mapa desta vez.",
  ],
  curitiba: [
    "Frio curitibano e tubo de ônibus? Pista fria mesmo.",
    "O jardim botânico não aparece em nenhum recorte.",
  ],
  recife: [
    "As pontes do Recife não batem com o áudio.",
    "Frevo e Marco Zero ficaram para depois.",
  ],
  miami: [
    "Boardwalk pastel e dólar no caixa? Não é aqui.",
    "Miami não fecha o mapa deste dossiê.",
  ],
  novayork: [
    "Big Apple demais para o que as pistas mostram.",
    "Nova York não assina esse áudio.",
  ],
  cancun: [
    "Água turquesa mexicana? Pista fria.",
    "All-inclusive e pulseira de resort não aparecem aqui.",
  ],
  buenosaires: [
    "Tango e bife de chorizo? Não é este o destino.",
    "O espanhol portenho não combina com a pasta.",
  ],
  lisboa: [
    "Elétrico amarelo e pastel de nata? Pista fria.",
    "Lisboa não fecha com o restante das pistas.",
  ],
  londres: [
    "Chuva inglesa e Tube não batem com o dossiê.",
    "Londres aponta para outro lado do mapa.",
  ],
  paris: [
    "Croissant e Torre Eiffel ficam para outra hora.",
    "Paris não assina essas pistas.",
  ],
  barcelona: [
    "Gaudí e tapas não aparecem nesse recorte.",
    "Barcelona ficou frio demais para este rastro.",
  ],
  roma: [
    "Fontana e gelato não fecham com o restante.",
    "Roma não é o destino desta pasta.",
  ],
  dubai: [
    "Néon do Golfo e marina espelhada? Pista fria.",
    "Dubai não fecha o mapa deste dossiê.",
  ],
  toquio: [
    "Néon japonês e Shibuya não batem com as pistas.",
    "Tóquio aponta para outro lado do mapa.",
  ],
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
      "Na orla, ele pediu água de coco e perguntou se a TV aberta pegava bem na areia.",
      "Uma testemunha viu o blazer azul passando entre guarda-sóis listrados.",
      "Na selfie borrada aparece o Cristo ao fundo e areia nos sapatos sociais."
    ],
    shareLine: "Achei o Flavinho no Rio!",
  },
  {
    id: "rio-bondinho",
    title: "Sinal no bondinho",
    correctCity: "rio",
    difficulty: "medium",
    clues: [
      "Num áudio vazado ele diz: sobe que a vista vale mais do que qualquer CPI.",
      "Comprou bilhete do bondinho e sumiu no meio de turistas de chapéu.",
      "O informante jurou: não é São Paulo; tem bondinho e brisa salgada."
    ],
    shareLine: "Flavinho no Rio, de novo.",
  },
  {
    id: "rio-posto9",
    title: "Posto Nove sem aviso",
    correctCity: "rio",
    difficulty: "easy",
    clues: [
      "Alguém viu um blazer azul no meio de sungas e coolers no Posto Nove.",
      "Ele pediu mate gelado e perguntou, rindo, se o clima político tinha esfriado.",
      "Nas redes locais só aparece orla lotada — nenhum sinal de Planalto."
    ],
    shareLine: "Flavinho no Posto Nove?!",
  },
  {
    id: "rio-lapa",
    title: "Eco na Lapa",
    correctCity: "rio",
    difficulty: "medium",
    clues: [
      "Na Lapa tinha música ao vivo, os Arcos ao fundo e um blazer no meio da roda.",
      "Pediu um chope e pediu, baixo, para ninguém filmar o rosto dele.",
      "A testemunha descreveu: carioca tentando parecer turista despistado."
    ],
    shareLine: "Achei o Flavinho na Lapa",
  },
  {
    id: "rio-barco",
    title: "Barca pra Niterói",
    correctCity: "rio",
    difficulty: "hard",
    clues: [
      "Comprou passagem da barca para Niterói na última hora, com cara de quem só quer atravessar.",
      "No convés ventava na baía; o skyline do Rio ficava para trás e o blazer estava amarrotado.",
      "Mandou mensagem pedindo para alguém achá-lo do outro lado da água."
    ],
    shareLine: "Flavinho cruzando a baía",
  },
  {
    id: "rio-maracana",
    title: "Fora de jogo",
    correctCity: "rio",
    difficulty: "medium",
    clues: [
      "No meio da torcida do Maracanã, um blazer azul destoa da galera de camisa.",
      "Pediu hot dog e perguntou o placar errado de propósito para mudar de assunto.",
      "Não era estádio de Brasília: era o Maraca lotado, com gritaria e confete."
    ],
    shareLine: "Flavinho no Maracanã",
  },
  {
    id: "rio-sugarloaf",
    title: "Fila do Pão de Açúcar",
    correctCity: "rio",
    difficulty: "hard",
    clues: [
      "Entrou na fila interminável do Pão de Açúcar com selfie stick e blazer suando.",
      "Comentou com alguém na fila que a vista tapa qualquer manchete ruim.",
      "O cartão postal que mandou mostra oceano dos dois lados da baía."
    ],
    shareLine: "Flavinho no Pão de Açúcar",
  },
  {
    id: "rio-feira",
    title: "Feira de artesanato",
    correctCity: "rio",
    difficulty: "easy",
    clues: [
      "Na feirinha de artesanato barganhou chinelo e um chapéu de palha.",
      "O vendedor jurou: esse de blazer não é daqui, mas está se esforçando para parecer.",
      "No ar misturavam cheiro de sol, areia e água de coco."
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
      "Pediu café com leite num corredor e perguntou pela agenda reservada do dia.",
      "Os sapatos ecoavam no mármore de um corredor comprido demais para ser rua comum.",
      "O blazer azul apareceu perto de um prédio branco que parece nave espacial."
    ],
    shareLine: "Flavinho em Brasília",
  },
  {
    id: "bsb-eixo",
    title: "Eixo Monumental",
    correctCity: "brasilia",
    difficulty: "easy",
    clues: [
      "Caminhou por um gramado largo demais para ser calçadão carioca.",
      "No Uber, o motorista falou em setor hoteleiro e ele só assentiu.",
      "O céu estava seco, a arquitetura modernista, e não havia orla nenhuma."
    ],
    shareLine: "Flavinho no Eixo",
  },
  {
    id: "bsb-congresso",
    title: "Sombra das cúpulas",
    correctCity: "brasilia",
    difficulty: "hard",
    clues: [
      "Uma foto vazada mostra duas cúpulas brancas bem atrás dele.",
      "A segurança pediu credencial; ele sorriu sem responder e sumiu no fluxo.",
      "No áudio ele murmura que ali todo mundo finge que não o viu."
    ],
    shareLine: "Flavinho no Congresso",
  },
  {
    id: "bsb-lago",
    title: "Volta no Paranoá",
    correctCity: "brasilia",
    difficulty: "medium",
    clues: [
      "Alugou uma bike e pediu uma rota pelo lago sem passar por jornalista.",
      "No pôr do sol do Paranoá, o blazer ficou pendurado no guidão.",
      "Não era marina de Dubai: era cerrado com água espelhada."
    ],
    shareLine: "Flavinho no Paranoá",
  },
  {
    id: "bsb-asa",
    title: "Asa Sul depois das 22",
    correctCity: "brasilia",
    difficulty: "medium",
    clues: [
      "Num bar de superquadra da Asa Sul, o blazer ficou no canto com a conversa baixa.",
      "Pediu uma porção e pediu a nota fiscal no nome de outra pessoa.",
      "A cidade planejada demais para ser um improviso de rua no Rio."
    ],
    shareLine: "Flavinho na Asa Sul",
  },
  {
    id: "bsb-aeroporto",
    title: "Conexão em BSB",
    correctCity: "brasilia",
    difficulty: "easy",
    clues: [
      "No embarque doméstico de Brasília, usava óculos escuros e pressa fingida.",
      "Comprou chiclete e perguntou o portão errado de propósito.",
      "O painel mostrava voos para todo canto; ele ainda não pegou nenhum."
    ],
    shareLine: "Flavinho no aeroporto de BSB",
  },
  {
    id: "bsb-tv-torre",
    title: "Torre de TV",
    correctCity: "brasilia",
    difficulty: "hard",
    clues: [
      "No mirante da Torre de TV, o vento do Cerrado batia no blazer.",
      "Um turista perguntou se aquilo era o Congresso; ele só riu e afastou.",
      "A vista em 360 graus mostra uma cidade que parece desenho técnico."
    ],
    shareLine: "Flavinho na Torre de TV",
  },
  {
    id: "bsb-feira",
    title: "Feira da Torre",
    correctCity: "brasilia",
    difficulty: "easy",
    clues: [
      "Na Feira da Torre comprou pastel e sumiu entre as barracas.",
      "Alguém gritou doutor e ele acelerou o passo sem olhar para trás.",
      "Era Brasília de domingo: feira, sol forte e disfarce fraco."
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
      "Sumiu atrás de um mar de guarda-chuvas cinza na Paulista.",
      "Num áudio vazado ele reclama do trânsito da Avenida Paulista.",
      "O asfalto molhado refletia os prédios altos sob a garoa."
    ],
    shareLine: "Flavinho na Paulista",
  },
  {
    id: "sp-metro",
    title: "Linha vermelha",
    correctCity: "saopaulo",
    difficulty: "hard",
    clues: [
      "Embarcou no metrô com cara de quem quase nunca pega metrô.",
      "Segurou a barra do teto e evitou contato visual com todo mundo.",
      "A estação lotada anunciava algo incompreensível enquanto o blazer apertava nos ombros."
    ],
    shareLine: "Flavinho no metrô de SP",
  },
  {
    id: "sp-liberdade",
    title: "Neon na Liberdade",
    correctCity: "saopaulo",
    difficulty: "medium",
    clues: [
      "Na Liberdade comprou pastel chinês e pediu para embrulhar de forma discreta.",
      "Lanternas vermelhas, multidões e o blazer azul no meio do fluxo.",
      "Não era Paris: era o bairro da Liberdade num sábado à tarde."
    ],
    shareLine: "Flavinho na Liberdade",
  },
  {
    id: "sp-masp",
    title: "Vão livre",
    correctCity: "saopaulo",
    difficulty: "easy",
    clues: [
      "Passou embaixo do vão do MASP fingindo olhar a exposição.",
      "Alguém reconheceu o blazer e ele cruzou a faixa de pedestres correndo.",
      "Paulista, museu vermelho e o trânsito eterno de São Paulo."
    ],
    shareLine: "Flavinho no MASP",
  },
  {
    id: "sp-mercado",
    title: "Mercado Municipal",
    correctCity: "saopaulo",
    difficulty: "medium",
    clues: [
      "No Mercado Municipal pediu mortadela no pão e olhou demais para o celular.",
      "Cheiro de tempero, teto alto e o blazer encostado no balcão.",
      "São Paulo clássica: nada de orla e nada de Planalto."
    ],
    shareLine: "Flavinho no Mercadão",
  },
  {
    id: "sp-ibirapuera",
    title: "Volta no Ibirapuera",
    correctCity: "saopaulo",
    difficulty: "easy",
    clues: [
      "Trotou no Ibirapuera de fone no ouvido e cara de quem não quer ser visto.",
      "Parou para uma foto com o lago e cancelou a foto na hora.",
      "Ao redor, cidade cinza; no meio do parque, um pedaço de verde."
    ],
    shareLine: "Flavinho no Ibirapuera",
  },
  {
    id: "sp-rooftop",
    title: "Rooftop sem convite",
    correctCity: "saopaulo",
    difficulty: "hard",
    clues: [
      "Tentou entrar num rooftop com lista VIP, nome falso e blazer na fila.",
      "Do terraço dava para ver um skyline de concreto e néon laranja.",
      "Alguém sussurrou que aquele ali tinha sumido dos trending topics."
    ],
    shareLine: "Flavinho no rooftop de SP",
  },
  {
    id: "sp-feira-livros",
    title: "Banca de revista",
    correctCity: "saopaulo",
    difficulty: "medium",
    clues: [
      "Folheou a capa de uma revista na banca e colocou de volta depressa demais.",
      "Chovia fino, a calçada era estreita e o blazer pingava água.",
      "Uma cidade que não dorme e não perdoa selfie mal tirada."
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
      "Parou num motel pastel, falou inglês com sotaque e pediu um suco verde caro.",
      "No story aparece uma palmeira com a legenda dizendo que é só um dia.",
      "O boardwalk tem ar de novela americana, não de Europa."
    ],
    shareLine: "Flavinho em Miami",
  },
  {
    id: "mia-ocean",
    title: "Ocean Drive",
    correctCity: "miami",
    difficulty: "medium",
    clues: [
      "Na Ocean Drive, carros antigos pastel contrastavam com o blazer no meio dos shorts.",
      "Pediu iced coffee e pagou em dólar sem hesitar.",
      "O art déco da rua é forte demais para confundir com Copacabana."
    ],
    shareLine: "Flavinho na Ocean Drive",
  },
  {
    id: "mia-mall",
    title: "Shopping com ar gelado",
    correctCity: "miami",
    difficulty: "easy",
    clues: [
      "Entrou no shopping gelado como quem entra num bunker contra o calor.",
      "Comprou óculos escuros e perguntou se aceitavam PIX; o caixa disse que não.",
      "No caixa o inglês era limpo; no troco escapou um sotaque brasileiro."
    ],
    shareLine: "Flavinho no shopping de Miami",
  },
  {
    id: "mia-marina",
    title: "Marina florida",
    correctCity: "miami",
    difficulty: "hard",
    clues: [
      "Ficou olhando os iates na marina como quem compara agendas secretas.",
      "Alguém falou South Beach e ele fingiu que não tinha ouvido.",
      "Sol forte, prédios pastel e nenhum Cristo Redentor no horizonte."
    ],
    shareLine: "Flavinho na marina de Miami",
  },
  {
    id: "mia-brunch",
    title: "Brunch sem Instagram",
    correctCity: "miami",
    difficulty: "medium",
    clues: [
      "No brunch tinha abacate no prato, blazer na cadeira e mesa na calçada.",
      "O garçom perguntou where you from e a resposta dele foi bem evasiva.",
      "O cardápio era da Flórida; a cara ainda era do Brasil."
    ],
    shareLine: "Flavinho no brunch",
  },
  {
    id: "mia-night",
    title: "Neon depois das 23",
    correctCity: "miami",
    difficulty: "hard",
    clues: [
      "Na fila do clube depois das onze, a lista era falsa e o blazer continuava no corpo.",
      "O DJ tocava alto demais para qualquer um ouvir manchete.",
      "Não era Dubai: era Miami tentando parecer Dubai."
    ],
    shareLine: "Flavinho na noite de Miami",
  },
  {
    id: "mia-uber",
    title: "Uber com sotaque",
    correctCity: "miami",
    difficulty: "easy",
    clues: [
      "O motorista brasileiro do Uber reconheceu o blazer e mudou de assunto na hora.",
      "O GPS falava inglês e o rádio tocava em espanhol.",
      "Como destino ele só pediu anywhere quiet."
    ],
    shareLine: "Flavinho de Uber em Miami",
  },
  {
    id: "mia-beach",
    title: "Toalha alugada",
    correctCity: "miami",
    difficulty: "medium",
    clues: [
      "Alugou cadeira de praia e, surreal, não tirou o blazer.",
      "Pediu água de coco, mas pediu em inglês.",
      "Areia clara, prédios pastel e nenhum Pão de Açúcar ao fundo."
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
      "Num café de calçada pediu café e croissant e recusou pagar em real.",
      "A selfie borrada mostra uma torre metálica bem longe atrás dele.",
      "Ele murmurou que ali ninguém o reconhece — pelo menos ele acha."
    ],
    shareLine: "Flavinho em Paris",
  },
  {
    id: "par-metro",
    title: "Métro linha quem?",
    correctCity: "paris",
    difficulty: "medium",
    clues: [
      "Olhou o mapa do metrô parisiense de cabeça torta, perdido entre as linhas.",
      "O bilhete estava amassado e o blazer apertado no horário de pico.",
      "O alto-falante falava francês e o pânico no rosto dele era bem educado."
    ],
    shareLine: "Flavinho no metrô de Paris",
  },
  {
    id: "par-seine",
    title: "Beira do Sena",
    correctCity: "paris",
    difficulty: "easy",
    clues: [
      "Andou na beira do Sena fingindo pose de poeta distraído.",
      "Havia sebos de livros, pontes de pedra e o blazer ao vento.",
      "Não era o Paranoá: era o Sena com muita pose."
    ],
    shareLine: "Flavinho no Sena",
  },
  {
    id: "par-louvre",
    title: "Fila do Louvre",
    correctCity: "paris",
    difficulty: "hard",
    clues: [
      "Entrou na fila do Louvre e saiu dela três vezes sem explicar.",
      "Comprou um ímã de geladeira e se arrependeu no mesmo instante.",
      "A pirâmide de vidro ficava ao fundo e o blazer no meio da multidão."
    ],
    shareLine: "Flavinho no Louvre",
  },
  {
    id: "par-night",
    title: "Luzes da torre",
    correctCity: "paris",
    difficulty: "medium",
    clues: [
      "A Torre Eiffel piscava de hora em hora e a multidão aplaudia.",
      "Ele só olhava o celular e a melhor saída da praça.",
      "Europa óbvia demais e disfarce fraco demais para quem quer sumir."
    ],
    shareLine: "Flavinho sob a Torre Eiffel",
  },
  {
    id: "par-bakery",
    title: "Padaria das 7h",
    correctCity: "paris",
    difficulty: "easy",
    clues: [
      "Foi o primeiro da fila do pão às sete da manhã e o último a sorrir.",
      "Apontou para o croissant e pediu um desse, sem acertar o nome em francês.",
      "O amanhecer estava cinza, a calçada molhada e o blazer ainda limpo."
    ],
    shareLine: "Flavinho na padaria parisiense",
  },
  {
    id: "par-museum",
    title: "Museu sem selfie",
    correctCity: "paris",
    difficulty: "hard",
    clues: [
      "No museu proibiram flash e ele agradeceu baixinho, aliviado.",
      "Passou rápido demais pelas salas mais famosas, sem parar para ver.",
      "Na saída perguntou onde pegar Uber — ainda em Paris."
    ],
    shareLine: "Flavinho no museu",
  },
  {
    id: "par-bridge",
    title: "Cadeados da ponte",
    correctCity: "paris",
    difficulty: "medium",
    clues: [
      "Olhou os cadeados da ponte e murmurou que isso não ia rolar no Senado.",
      "Enquanto os turistas se beijavam, ele só atravessava sem olhar.",
      "Rio urbano, pedra velha e nenhum calçadão carioca à vista."
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
      "À noite o ar-condicionado era tão forte que parecia outro clima.",
      "A marina espelhava um skyline de videogame sobre a água.",
      "Mandou recado: me encontra depois do pôr do sol, perto da água."
    ],
    shareLine: "Flavinho em Dubai",
  },
  {
    id: "dxb-mall",
    title: "Mall infinito",
    correctCity: "dubai",
    difficulty: "medium",
    clues: [
      "Andou no shopping enorme como quem foge do calor lá fora.",
      "Passou pela fonte dançante e pela vitrine de relógios com o blazer intacto.",
      "O anúncio falava árabe, o caixa falava inglês e ele sumiu no meio do fluxo."
    ],
    shareLine: "Flavinho no mall de Dubai",
  },
  {
    id: "dxb-yacht",
    title: "Convite pro iate",
    correctCity: "dubai",
    difficulty: "hard",
    clues: [
      "Recusou o convite para o iate duas vezes e não aceitou tirar foto nenhuma.",
      "A água era verde-azulada e um prédio torto aparecia ao fundo.",
      "Não era o pastel de Miami: era o Golfo com néon."
    ],
    shareLine: "Flavinho no iate? Quase.",
  },
  {
    id: "dxb-souk",
    title: "Souk de ouro",
    correctCity: "dubai",
    difficulty: "medium",
    clues: [
      "Passou rápido demais pelas bancas de joias do souk.",
      "O vendedor ofereceu chá e ele só pediu o caminho da saída.",
      "Mercado antigo, ar-condicionado moderno e o blazer perdido no labirinto."
    ],
    shareLine: "Flavinho no souk",
  },
  {
    id: "dxb-desert",
    title: "Safari de fim de tarde",
    correctCity: "dubai",
    difficulty: "easy",
    clues: [
      "Voltou do passeio com areia no sapato social — combinação estranha.",
      "No pôr do sol do deserto alguém pediu selfie e ele negou na hora.",
      "O guia falou smile e ele fingiu uma tosse para escapar."
    ],
    shareLine: "Flavinho no deserto",
  },
  {
    id: "dxb-fountain",
    title: "Show das fontes",
    correctCity: "dubai",
    difficulty: "medium",
    clues: [
      "A multidão filmava a água dançando no show das fontes.",
      "Ele, no meio da festa, filmava a saída de emergência.",
      "Lago artificial, arranha-céus e nenhuma garoa paulista."
    ],
    shareLine: "Flavinho nas fontes de Dubai",
  },
  {
    id: "dxb-airport",
    title: "Escala DXB",
    correctCity: "dubai",
    difficulty: "easy",
    clues: [
      "No duty free absurdo, o blazer deslizava no tapete rolante.",
      "Ficou olhando voos para qualquer lugar mais quieto.",
      "O aeroporto parece uma cidade inteira; ele parecia só uma escala."
    ],
    shareLine: "Flavinho em escala em Dubai",
  },
  {
    id: "dxb-frame",
    title: "Janela no céu",
    correctCity: "dubai",
    difficulty: "hard",
    clues: [
      "Subiu num mirante com moldura gigante aberta sobre a cidade.",
      "O vento era seco, a vista era cara e o blazer seguia teimoso no calor.",
      "Era cartão postal do Golfo — e o rastro dele estava quente."
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
      "Subiu a ladeira colorida do Pelourinho com o blazer suando nas costas.",
      "Pediu acarajé e pediu, sério, para ninguém postar a foto.",
      "Ao longe batia um tambor; claramente não era o Rio."
    ],
    shareLine: "Flavinho em Salvador",
  },
  {
    id: "ssa-elevator",
    title: "Elevador Lacerda",
    correctCity: "salvador",
    difficulty: "medium",
    clues: [
      "Desceu o Elevador Lacerda com a vista da baía se abrindo embaixo.",
      "Comprou uma polaroid turística e rasgou a foto logo depois.",
      "Bahia óbvia demais e disfarce fraco demais."
    ],
    shareLine: "Flavinho no Elevador Lacerda",
  },
  {
    id: "ssa-barra",
    title: "Farol da Barra",
    correctCity: "salvador",
    difficulty: "hard",
    clues: [
      "No Farol da Barra o pôr do sol estava lotado e o farol ia ficando atrás.",
      "Alguém gritou ô meu rei e ele acelerou o passo na hora.",
      "Era o Atlântico baiano, sem Cristo Redentor no fundo."
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
      "Na padaria pediu pão de queijo e café com leite sem pensar duas vezes.",
      "O mineiro do balcão reconheceu o blazer e fingiu que não tinha visto.",
      "Tinha serra ao fundo e nenhuma orla à vista."
    ],
    shareLine: "Flavinho em BH",
  },
  {
    id: "bh-liberade",
    title: "Feira hippie",
    correctCity: "belohorizonte",
    difficulty: "medium",
    clues: [
      "Num domingo na Praça da Liberdade misturou-se às barracas e ao sol.",
      "Comprou uma bijuteria barata e sumiu entre as famílias passeando.",
      "BH clássica, sem nenhum néon de Dubai."
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
      "Colocou casaco por cima do blazer — sinal claro de frio paranaense.",
      "Quase tirou foto na estufa de vidro do Jardim Botânico e cancelou na hora.",
      "Estava frio demais para ser Salvador."
    ],
    shareLine: "Flavinho em Curitiba",
  },
  {
    id: "cwb-bus",
    title: "Tubo de ônibus",
    correctCity: "curitiba",
    difficulty: "medium",
    clues: [
      "Entrou no tubo de uma estação de ônibus biarticulado em Curitiba.",
      "Pegou o cartão de transporte no nome errado e fingiu naturalidade.",
      "Organização curitibana, bem longe do caos carioca."
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
      "Atravessou uma ponte do Recife com cheiro de maré subindo do mangue.",
      "Pediu tapioca e olhou demais para o celular enquanto comia.",
      "Recife Antigo à vista, frevo ao longe e blazer bem perto."
    ],
    shareLine: "Flavinho no Recife",
  },
  {
    id: "rec-porto",
    title: "Marco Zero",
    correctCity: "recife",
    difficulty: "hard",
    clues: [
      "No Marco Zero o palco estava vazio, a praça aberta e o vento vinha do porto.",
      "Alguém tentou vender um cordel com a cara dele; ele negou ser o personagem.",
      "Nordeste urbano, sem nenhum traço da Paulista."
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
      "Passou por uma milonga em Buenos Aires e recusou o convite para dançar.",
      "Pediu bife de chorizo e pagou em pesos argentinos.",
      "O espanhol era portenho; claramente não era Miami."
    ],
    shareLine: "Flavinho em Buenos Aires",
  },
  {
    id: "bue-caminito",
    title: "Cores em La Boca",
    correctCity: "buenosaires",
    difficulty: "easy",
    clues: [
      "No Caminito, entre casas coloridas e turistas, o blazer azul destoa no meio.",
      "Quase tirou selfie com a bandeira argentina e apagou a foto em seguida.",
      "La Boca lotada deixou o rastro dele óbvio demais."
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
      "Subiu no elétrico amarelo lotado que sobe as ladeiras de Lisboa.",
      "Pediu pastel de nata e um espresso sem enrolação.",
      "Lisboa de cartão postal e o blazer já amarrotado pelo dia."
    ],
    shareLine: "Flavinho em Lisboa",
  },
  {
    id: "lis-belem",
    title: "Fila em Belém",
    correctCity: "lisboa",
    difficulty: "hard",
    clues: [
      "Entrou na fila eterna dos pastéis de Belém e desistiu no meio do caminho.",
      "Ao fundo ficavam o Tejo e a torre de pedra.",
      "Estava em Portugal: real brasileiro não passou no caixa."
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
      "Desceu no Tube com cara de quem odeia fila e anúncio em inglês.",
      "Comprou um guarda-chuva barato no meio da chuva fina.",
      "O alto-falante falava inglês e o blazer já estava molhado."
    ],
    shareLine: "Flavinho em Londres",
  },
  {
    id: "lon-bridge",
    title: "Tower Bridge selfie",
    correctCity: "londres",
    difficulty: "hard",
    clues: [
      "Quase fez pose na Tower Bridge e cancelou a foto no último segundo.",
      "Um ônibus vermelho passou na frente bem na hora do clique.",
      "O Tâmisa estava cinza; nenhuma marina neon à vista."
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
      "Olhou o mapa do subway de cabeça para baixo e fingiu que entendia.",
      "Pediu um coffee to go e sumiu na multidão do rush.",
      "Nova York no horário de pico não perdoa disfarce fraco."
    ],
    shareLine: "Flavinho em Nova York",
  },
  {
    id: "nyc-central",
    title: "Central Park escape",
    correctCity: "novayork",
    difficulty: "medium",
    clues: [
      "Sentou num banco do Central Park e fingiu ler um jornal antigo.",
      "Uma carruagem passou e ele nem levantou o olhar.",
      "Um pedaço de Manhattan verde no meio do caos de concreto."
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
      "Olhou a fachada da Sagrada Família e desistiu da fila enorme.",
      "Pediu tapas num bar perto e pagou em euro.",
      "Catalunha óbvia e o blazer pegando sol na calçada."
    ],
    shareLine: "Flavinho em Barcelona",
  },
  {
    id: "bcn-beach",
    title: "Barceloneta",
    correctCity: "barcelona",
    difficulty: "easy",
    clues: [
      "Na Barceloneta a areia é europeia e não tem Cristo nenhum no fundo.",
      "Pediu sangria e pediu a conta depressa, sem demorar na mesa.",
      "Mediterrâneo à frente — definitivamente não era Copacabana."
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
      "Jogou uma moeda na Fontana di Trevi e pediu para ninguém filmar.",
      "Segurava um gelato numa mão e o blazer no ombro.",
      "A fonte estava lotada e o italiano enchia o ar ao redor."
    ],
    shareLine: "Flavinho em Roma",
  },
  {
    id: "rom-coliseu",
    title: "Selfie no Coliseu",
    correctCity: "roma",
    difficulty: "hard",
    clues: [
      "Quase tirou foto com um gladiador de fantasia na porta do Coliseu.",
      "Desistiu no meio do gesto e saiu andando rápido.",
      "Ruína romana clássica, sem nenhum traço de Dubai."
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
      "No resort all-inclusive a pulseira colorida contrastava com o blazer no buffet.",
      "Pediu uma margarita e já olhava a saída enquanto bebia.",
      "Água turquesa mexicana e espanhol de aeroporto no balcão."
    ],
    shareLine: "Flavinho em Cancún",
  },
  {
    id: "cun-ruins",
    title: "Ruínas sob sol",
    correctCity: "cancun",
    difficulty: "medium",
    clues: [
      "Subiu uma pirâmide pequena sob o sol e desceu arrependido da ideia.",
      "O guia falou em espanhol e ele só sorriu, sem responder.",
      "Estava em Quintana Roo — claramente não era Roma."
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
      "Atravessou a faixa de Shibuya com a maré humana e quase voltou no meio.",
      "Comprou chá numa máquina de venda e se perdeu na saída da estação.",
      "Néon japonês por todo lado e nenhum português no ar."
    ],
    shareLine: "Flavinho em Shibuya",
  },
  {
    id: "tyo-temple",
    title: "Incenso em Asakusa",
    correctCity: "toquio",
    difficulty: "medium",
    clues: [
      "Passou pelo portão vermelho de Asakusa sem bater foto nenhuma.",
      "Comprou um amulete e guardou no bolso interno do blazer.",
      "Tóquio tradicional, rastro quieto e passo apressado."
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
