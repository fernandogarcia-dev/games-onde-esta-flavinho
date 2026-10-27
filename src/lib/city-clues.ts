import type { CityId, Difficulty } from "@/lib/types";

export type ClueTier = "easy" | "medium" | "hard";

/** Famous, recognizable traits — never cryptic riddles. */
export const CITY_CLUES: Record<
  CityId,
  Record<ClueTier, [string, string, string, string, string]>
> = {
  rio: {
    easy: [
      "Tem o Cristo Redentor no alto do Corcovado.",
      "Copacabana e Ipanema são praias famosas no mundo inteiro.",
      "O Pão de Açúcar aparece em quase todo postal da cidade.",
      "É a cidade do Carnaval mais famoso do Brasil.",
      "O Maracanã é um dos estádios mais conhecidos do planeta.",
    ],
    medium: [
      "O bondinho sobe o morro do Pão de Açúcar.",
      "Os Arcos da Lapa marcam a noite boêmia carioca.",
      "O Posto Nove de Ipanema é ponto clássico da orla.",
      "O Sambódromo recebe o desfile das escolas de samba.",
      "A Escadaria Selarón é coberta de azulejos coloridos.",
    ],
    hard: [
      "O Bonde de Santa Teresa ainda sobe as ladeiras do bairro.",
      "A Feira de São Cristóvão celebra a cultura nordestina na cidade.",
      "O Mirante Dona Marta vira cartão de visita da vista da Baía.",
      "O Aterro do Flamengo mistura parque, pista e vista da Baía de Guanabara.",
      "O Cais do Valongo é patrimônio ligado à história do porto.",
    ],
  },
  brasilia: {
    easy: [
      "É a capital federal do Brasil.",
      "Foi planejada do zero no formato de um avião.",
      "O Congresso Nacional tem as duas torres e as cúpulas famosas.",
      "Fica no Planalto Central, longe do litoral.",
      "A Catedral de Niemeyer tem formato de coroa de concreto.",
    ],
    medium: [
      "O Eixo Monumental corta a cidade de ponta a ponta.",
      "A Esplanada dos Ministérios é fila de prédios espelhados.",
      "O Palácio da Alvorada é a residência oficial presidencial.",
      "O Lago Paranoá foi criado artificialmente na construção.",
      "O buraco do Relógio e a Rodoviária ficam no centro do “avião”.",
    ],
    hard: [
      "A Praça dos Três Poderes reúne Executivo, Legislativo e Judiciário.",
      "O Superquadra é o módulo típico das asas residenciais.",
      "A Torre de TV tem mirante sobre o Eixo Monumental.",
      "O Palácio do Itamaraty é famoso pelos espelhos d’água.",
      "O Memorial JK homenageia o presidente que mandou erguer a capital.",
    ],
  },
  saopaulo: {
    easy: [
      "É a maior cidade do Brasil.",
      "A Avenida Paulista é o cartão-postal financeiro e cultural.",
      "Tem o Museu de Arte de São Paulo, o MASP, com o vão livre famoso.",
      "É conhecida pela garoa e pelo trânsito intenso.",
      "O Mercado Municipal — o Mercadão — vende o sanduíche de mortadela.",
    ],
    medium: [
      "A Liberdade é o bairro oriental mais famoso da cidade.",
      "O Parque Ibirapuera é o “pulmão verde” mais visitado.",
      "A Rua 25 de Março é o caos das compras populares.",
      "O Estádio do Morumbi é um dos maiores clubes-casa do futebol local.",
      "A Pinacoteca fica perto da Luz e da Estação da Luz.",
    ],
    hard: [
      "O Beco do Batman, em Vila Madalena, é muro a muro de grafite.",
      "O Elevado Pres. João Goulart vira parque aos domingos — o Minhocão.",
      "O Teatro Municipal inspira-se na Ópera de Paris.",
      "A Octávio Frias de Oliveira é a ponte estaiada curva do rio Pinheiros.",
      "O Edifício Copan, do Niemeyer, tem a fachada ondulada icônica.",
    ],
  },
  salvador: {
    easy: [
      "É a capital da Bahia.",
      "O Pelourinho é o centro histórico colorido e famoso.",
      "É berço do axé e de muito carnaval de rua.",
      "Tem acarajé como quitute típico nas ruas.",
      "O Elevador Lacerda liga a Cidade Alta à Cidade Baixa.",
    ],
    medium: [
      "O Farol da Barra marca a entrada da Baía de Todos-os-Santos.",
      "O Bonfim é a igreja das fitinhas coloridas no pulso.",
      "O carnaval tem os blocos e a rota dos trios elétricos.",
      "A Lagoa do Abaeté fica perto das dunas de Itapuã.",
      "O Mercado Modelo fica aos pés do Elevador Lacerda.",
    ],
    hard: [
      "O Forte de São Marcelo parece uma tartaruga no meio da baía.",
      "O Rio Vermelho é polo de noite e de panela de acarajé.",
      "O Dique do Tororó tem as esculturas dos orixás na água.",
      "A Igreja de São Francisco é coberta de ouro no interior.",
      "O Solar do Unhão abriga o MAM à beira da baía.",
    ],
  },
  belohorizonte: {
    easy: [
      "É a capital de Minas Gerais.",
      "Pão de queijo é o quitute mais associado à cidade.",
      "Fica cercada pela Serra do Curral.",
      "O Mineirão é o grande estádio da capital mineira.",
      "É conhecida pela comida mineira e pelos botecos.",
    ],
    medium: [
      "A Praça da Liberdade concentra palácios e museus.",
      "A Lagoa da Pampulha tem a igrejinha do Niemeyer.",
      "O Mercado Central vende queijo, cachaça e iguarias mineiras.",
      "A Savassi é o bairro das ruas comerciais e da vida noturna.",
      "O Mirante da Serra do Curral mostra a “mancha urbana” completa.",
    ],
    hard: [
      "A Igreja de São Francisco de Assis na Pampulha é patrimônio da Unesco.",
      "O Conjunto Arquitetônico da Pampulha foi projeto de JK e Niemeyer.",
      "A Rua dos Cariocas e o Centro tradicional misturam casarões e comércio.",
      "O Palácio das Artes fica no coração cultural da Praça da Liberdade.",
      "A Feira de Arte e Artesanato da Praça da Liberdade anima os fins de semana.",
    ],
  },
  curitiba: {
    easy: [
      "É a capital do Paraná.",
      "É famosa pelo frio e pelo ônibus “tubo” das estações-tubo.",
      "O Jardim Botânico com a estufa de vidro é o postal clássico.",
      "Tem fama de cidade planejada e organizada.",
      "É conhecida pelo transporte coletivo modelo.",
    ],
    medium: [
      "O Parque Tanguá tem mirante e cascata artificial.",
      "O Museu Oscar Niemeyer — o “Olho” — marca a skyline cultural.",
      "A Rua das Flores foi um dos primeiros calçadões do Brasil.",
      "O Parque Barigui é ponto de corrida, lago e mateiros.",
      "A Ópera de Arame fica no meio das árvores, em estrutura metálica.",
    ],
    hard: [
      "A Rota do Lixo e o programa de reciclagem viraram referência nacional.",
      "O Bosque Alemão homenageia a colonização e o João e Maria.",
      "A Universidade Federal do Paraná tem o prédio histórico no Centro.",
      "O Memorial Ucraniano no Parque Tingui lembra a imigração eslava.",
      "A Torre Panorâmica dá vista 360º sobre a “capital do ônibus”.",
    ],
  },
  recife: {
    easy: [
      "É a capital de Pernambuco.",
      "É conhecida como a “cidade dos rios e das pontes”.",
      "O frevo e o maracatu são marcas culturais fortes.",
      "Fica colada a Olinda, patrimônio histórico vizinho.",
      "O Marco Zero marca o marco inicial do Centro.",
    ],
    medium: [
      "O Parque das Esculturas de Brennand fica de frente ao Marco Zero.",
      "Boa Viagem é a praia urbana mais famosa, com suas pedras.",
      "O Recife Antigo anima bares e shows no fim de semana.",
      "A ponte Duarte Coelho e outras cruzam o Capibaribe e o Beberibe.",
      "O Carnaval de Olinda, ao lado, é de bonecos gigantes e ladeiras.",
    ],
    hard: [
      "O Instituto Ricardo Brennand abriga castelo e acervo de armas.",
      "A Rua da Moeda e o Paço Alfândega revitalizaram o porto antigo.",
      "O Forte das Cinco Pontas hoje abriga museu da cidade.",
      "A Casa da Cultura funcionava em antiga cadeia e vende artesanato.",
      "O Porto Digital transformou casarões do Recife Antigo em hub de tech.",
    ],
  },
  miami: {
    easy: [
      "Fica na Flórida, nos Estados Unidos.",
      "South Beach é famosa pelas praias e pelo Art Déco.",
      "É destino clássico de brasileiros no exterior.",
      "Tem clima tropical, inglês no comércio e muito sol.",
      "Os arranha-céus de Brickell marcam a skyline na baía.",
    ],
    medium: [
      "Ocean Drive é a rua dos hotéis pastel e dos carros conversíveis.",
      "Little Havana concentra a cultura cubana e o café forte.",
      "Wynwood Walls é o bairro dos murais e grafites.",
      "A Baía de Biscayne separa a ilha de Miami Beach do continente.",
      "O porto de cruzeiros é um dos mais movimentados do mundo.",
    ],
    hard: [
      "Vizcaya é a villa italiana histórica à beira da baía.",
      "O Design District concentra lojas de luxo e arquitetura moderna.",
      "Key Biscayne e o farol de Cape Florida ficam logo ao sul.",
      "O Adrienne Arsht Center é o grande complexo de artes do centro.",
      "Coral Gables mantém o estilo mediterrâneo e a Miracle Mile.",
    ],
  },
  novayork: {
    easy: [
      "É a maior cidade dos Estados Unidos.",
      "A Estátua da Liberdade fica na baía.",
      "Times Square brilha com painéis e plateias o tempo todo.",
      "Central Park é o enorme parque no meio de Manhattan.",
      "Os arranha-céus de Manhattan formam a skyline mais famosa do mundo.",
    ],
    medium: [
      "A Brooklyn Bridge liga Manhattan a Brooklyn.",
      "O Empire State Building é o arranha-céu art déco clássico.",
      "Broadway é o circuito dos musicais.",
      "O High Line é o parque elevado sobre os trilhos antigos.",
      "Wall Street e o Touro de Bronze marcam o distrito financeiro.",
    ],
    hard: [
      "O One World Trade Center sobe no Ground Zero.",
      "O metrô tem a linha A, C e E passando sob Midtown o tempo todo.",
      "Chelsea Market e o Meatpacking misturam comida e moda.",
      "O Guggenheim tem a rampa espiral do Frank Lloyd Wright.",
      "DUMBO, em Brooklyn, enquadra a ponte nas fotos clássicas.",
    ],
  },
  cancun: {
    easy: [
      "Fica no Caribe mexicano, na península de Yucatán.",
      "É famosa pela água turquesa e pela areia branca.",
      "A Zona Hotelera concentra resorts all-inclusive.",
      "É destino clássico de lua de mel e pacote de praia.",
      "Fica perto de ruínas maias famosas.",
    ],
    medium: [
      "A Avenida Kukulcán corta a Zona Hotelera em forma de sete.",
      "A Isla Mujeres fica a um ferry da costa.",
      "Chichén Itzá, a pirâmide maia, fica a poucas horas de ônibus.",
      "O Parque Nichupté é a lagoa atrás da faixa de hotéis.",
      "Playa Delfines tem o letreiro colorido de Cancún na areia.",
    ],
    hard: [
      "O Museo Maya de Cancún fica na Zona Hotelera, perto do mar.",
      "Puerto Morelos, ao sul, é mais quieto e de recife protegido.",
      "A Riviera Maya começa logo depois, rumo a Playa del Carmen.",
      "O aeroporto internacional recebe voos charter o ano todo.",
      "Xcaret e outros parques ecológicos ficam no corredor sul.",
    ],
  },
  buenosaires: {
    easy: [
      "É a capital da Argentina.",
      "O tango nasceu e ainda vive nas noites da cidade.",
      "O bife de chorizo e o vinho são marca registrada.",
      "A Obelisco marca a Avenida 9 de Julio.",
      "Fala-se espanhol com sotaque portenho bem característico.",
    ],
    medium: [
      "La Boca e Caminito são o cartão colorido dos conventillos.",
      "San Telmo tem feira de antiguidades aos domingos.",
      "Palermo reúne bares, parques e a vida noturna.",
      "A Casa Rosada é a sede do Executivo na Plaza de Mayo.",
      "O teatro Colón é uma das grandes casas de ópera do mundo.",
    ],
    hard: [
      "Recoleta tem o cemitério onde está Evita Perón.",
      "Puerto Madero revitalizou os galpões do porto com restaurantes.",
      "A Avenida Corrientes é a “Broadway” dos teatros portenhos.",
      "O El Ateneo Grand Splendid é livraria dentro de um antigo teatro.",
      "Tigre e o delta do Paraná ficam a um trem dos portenhos.",
    ],
  },
  lisboa: {
    easy: [
      "É a capital de Portugal.",
      "O elétrico amarelo sobe as ladeiras da cidade antiga.",
      "O pastel de nata é o doce mais famoso.",
      "Fica à beira do rio Tejo.",
      "O fado é a música tradicional das noites lisboetas.",
    ],
    medium: [
      "Belém guarda o Mosteiro dos Jerónimos e a torre à beira do Tejo.",
      "O elevador de Santa Justa liga a Baixa ao Chiado.",
      "Alfama é o bairro de ruelas e miradouros sobre o rio.",
      "A Praça do Comércio abre em U para o Tejo.",
      "O Cristo-Rei, do outro lado do rio, lembra o do Rio.",
    ],
    hard: [
      "O LX Factory ocupou uma antiga área industrial em Alcântara.",
      "O Parque das Nações nasceu da Expo 98, com o Oceanário.",
      "A Feira da Ladra é o mercado de pulgas clássico.",
      "O Miradouro da Senhora do Monte é um dos mais altos da cidade.",
      "O Time Out Market no Mercado da Ribeira virou polo gastronômico.",
    ],
  },
  londres: {
    easy: [
      "É a capital do Reino Unido.",
      "O Big Ben e o Parlamento ficam à beira do Tâmisa.",
      "Os ônibus vermelhos de dois andares são símbolo da cidade.",
      "A família real tem residência em Buckingham Palace.",
      "É famosa pela chuva, pelo chá e pelo metrô — o Tube.",
    ],
    medium: [
      "A London Eye é a roda-gigante na margem do Tâmisa.",
      "A Tower Bridge abre as folhas sobre o rio.",
      "O British Museum guarda a Pedra de Roseta e múmias egípcias.",
      "Camden Market é o caos de food stalls e roupa alternativa.",
      "O Hyde Park é um dos grandes parques reais.",
    ],
    hard: [
      "Shoreditch e Brick Lane concentram street art e curry houses.",
      "O Borough Market fica aos pés da Southwark Cathedral.",
      "A Tate Modern ocupou uma antiga usina na margem sul.",
      "Notting Hill é famosa pelo Carnival e pelas casinhas coloridas.",
      "O Greenwich Meridian marca o meridiano zero no Observatório.",
    ],
  },
  paris: {
    easy: [
      "É a capital da França.",
      "A Torre Eiffel é o monumento mais famoso da cidade.",
      "Croissant e café na calçada fazem parte da rotina.",
      "O rio Sena corta a cidade com suas pontes e bateaux.",
      "O Louvre abriga a Mona Lisa.",
    ],
    medium: [
      "O Arco do Triunfo fica no alto dos Campos Elísios.",
      "Montmartre e o Sacré-Cœur coroam a colina norte.",
      "Notre-Dame fica na Île de la Cité, no meio do Sena.",
      "O metrô parisiense tem as entradas art nouveau de Guimard.",
      "Versailles, o palácio do Rei Sol, fica nos arredores.",
    ],
    hard: [
      "O Marais mistura ruas medievais, falafel e museus.",
      "A Sainte-Chapelle tem os vitrais góticos mais intensos.",
      "O Canal Saint-Martin é o passeio de pontes e piqueniques.",
      "A Fondation Louis Vuitton fica no Bois de Boulogne.",
      "Belleville e a Butte-aux-Cailles guardam o Paris mais de bairro.",
    ],
  },
  barcelona: {
    easy: [
      "Fica na Catalunha, na Espanha.",
      "A Sagrada Família, de Gaudí, é o templo inacabado famoso.",
      "Tem praia urbana e clima mediterrâneo.",
      "Tapas e sangria fazem parte da mesa.",
      "O catalão aparece nas placas junto com o espanhol.",
    ],
    medium: [
      "O Park Güell é o parque colorido de bancos em mosaico.",
      "Las Ramblas corta o centro até o porto.",
      "A Casa Batlló e a Pedrera são casarões modernistas na Passeig de Gràcia.",
      "Camp Nou é a casa histórica do Barcelona FC.",
      "O bairro Gótico guarda ruas medievais e a catedral.",
    ],
    hard: [
      "O Palau de la Música Catalana é sala modernista de vitrais.",
      "Montjuïc tem o museu nacional e a fonte mágica.",
      "El Born e o Parque de la Ciutadella ficam lado a lado.",
      "A Barceloneta mistura rede de pesca e barraquinha de paella.",
      "O Tibidabo tem o templo e o parque de diversões no alto da serra.",
    ],
  },
  roma: {
    easy: [
      "É a capital da Itália.",
      "O Coliseu é o anfiteatro antigo mais famoso do mundo.",
      "O Vaticano, com a Basílica de São Pedro, fica dentro da cidade.",
      "Fontana di Trevi é a fonte onde se joga a moedinha.",
      "Pizza, pasta e gelato estão em cada esquina.",
    ],
    medium: [
      "O Panteão tem o óculo aberto no centro da cúpula.",
      "A Piazza Navona guarda a Fonte dos Quatro Rios de Bernini.",
      "O Fórum Romano fica entre o Coliseu e o Capitólio.",
      "Trastevere é o bairro boêmio do outro lado do Tibre.",
      "A Escadaria da Piazza di Spagna sobe até a Trinità dei Monti.",
    ],
    hard: [
      "O Castel Sant’Angelo foi mausoléu de Adriano e depois fortaleza.",
      "A Via Appia Antiga ainda tem trechos de pedra romana.",
      "O bairro Testaccio é referência de comida romana tradicional.",
      "A Galleria Borghese fica no meio dos jardins da Villa Borghese.",
      "Ostia Antica, o porto antigo, fica a um trem da capital.",
    ],
  },
  dubai: {
    easy: [
      "Fica nos Emirados Árabes Unidos.",
      "O Burj Khalifa é o prédio mais alto do mundo.",
      "É famosa por arranha-céus, luxo e ar-condicionado no deserto.",
      "A Palm Jumeirah é a ilha artificial em forma de palmeira.",
      "O Dubai Mall é um dos shoppings maiores do planeta.",
    ],
    medium: [
      "A Dubai Fountain dança na lagoa em frente ao Burj.",
      "O metro elevado sem motorista corta a Sheikh Zayed Road.",
      "O Madinat Jumeirah replica um souk à beira da marina.",
      "O deserto próximo oferece passeio de buggy e jantar beduíno.",
      "O Frame é o “portal” dourado com vista da cidade antiga e nova.",
    ],
    hard: [
      "Al Fahidi e o Dubai Creek guardam os souks de ouro e especiarias.",
      "O Museum of the Future tem a fachada oval com caligrafia árabe.",
      "A Expo City nasceu do legado da Expo 2020.",
      "Jumeirah Beach Residence (JBR) é a orla de calçadão e miradores.",
      "O Emirates Towers e o DIFC concentram o centro financeiro.",
    ],
  },
  toquio: {
    easy: [
      "É a capital do Japão.",
      "O cruzamento de Shibuya é um dos mais movimentados do mundo.",
      "Tem trens pontuais, néon e máquinas de venda em toda esquina.",
      "Sushi, ramen e bentô fazem parte do dia a dia.",
      "O Monte Fuji, em dias limpos, aparece ao longe.",
    ],
    medium: [
      "O templo Sensō-ji em Asakusa tem o portão vermelho Kaminarimon.",
      "A Tokyo Tower e a Tokyo Skytree dividem a skyline.",
      "Akihabara é o bairro da eletrônica e da cultura otaku.",
      "O Palácio Imperial fica no fosso verde no centro da cidade.",
      "Harajuku e a Takeshita-dōri são o polo da moda jovem.",
    ],
    hard: [
      "O Meiji Jingu fica escondido no bosque junto a Harajuku.",
      "O bairro de Ginza é o de vitrines e lojas de departamento clássicas.",
      "O TeamLab Borderless (e similares) virou atração de arte imersiva.",
      "Yanaka e Nezu guardam o Tóquio de ruelas e templos baixos.",
      "O Tsukiji externo ainda vende peixe e tamagoyaki aos visitantes.",
    ],
  },
};

function hashSalt(salt: string) {
  let h = 2166136261;
  for (let i = 0; i < salt.length; i++) {
    h ^= salt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function resolveClueTier(
  gameDifficulty: Difficulty,
  episodeDifficulty: ClueTier,
): ClueTier {
  if (gameDifficulty === "mix") return episodeDifficulty;
  return gameDifficulty;
}

/** How many city clues the player can actually use before lives run out. */
export function clueCountForLives(lives: number): number {
  return Math.max(1, Math.min(3, lives));
}

/** Distinct famous traits — count matches available city attempts. */
export function pickCityClues(
  city: CityId,
  tier: ClueTier,
  salt: string,
  count = 3,
): string[] {
  const want = Math.max(1, Math.min(5, count));
  const pool = [...CITY_CLUES[city][tier]];
  const rand = mulberry32(hashSalt(`${salt}:${city}:${tier}:clues-v2:${want}`));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, want);
}
