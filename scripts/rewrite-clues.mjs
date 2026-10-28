/**
 * Rewrites city tip phrases into natural Brazilian Portuguese —
 * short, spoken, like a friend giving a hint (not a guidebook).
 */
import fs from "fs";

const cities = JSON.parse(fs.readFileSync("/tmp/cities.json", "utf8"));
const MORE = JSON.parse(fs.readFileSync("/tmp/more-overrides.json", "utf8"));

/** @type {Record<string, { easy: string[]; medium: string[]; hard: string[] }>} */
const OVERRIDES = {
  rio: {
    easy: [
      "Tem o Cristo lá em cima do Corcovado.",
      "Copacabana e Ipanema — praia que todo mundo conhece.",
      "O Carnaval daqui é o mais famoso do Brasil.",
      "Aquele Pão de Açúcar com o bondinho.",
      "O Maracanã fica aqui.",
    ],
    medium: [
      "O bondinho sobe até o Pão de Açúcar.",
      "Na Lapa tem aqueles Arcos famosos.",
      "As escolas de samba desfilam no Sambódromo.",
      "A escadaria toda de azulejo colorido — Selarón.",
      "Posto 9: ponto clássico da orla.",
    ],
    hard: [
      "O bondinho de Santa Teresa sobe as ladeiras.",
      "A Feira de São Cristóvão é a festa do Nordeste na cidade.",
      "No Aterro do Flamengo a vista da baía é linda.",
      "O Cais do Valongo fica na zona portuária.",
      "Do Mirante Dona Marta dá pra ver a Baía de Guanabara.",
    ],
  },
  buenosaires: {
    easy: [
      "Capital da Argentina.",
      "Terra do tango — a noite toda.",
      "Tem o Obelisco bem na 9 de Julio.",
      "Bife de chorizo é clássico por aqui.",
      "Falam espanhol com sotaque portenho.",
    ],
    medium: [
      "La Boca e o Caminito são aquele bairro colorido.",
      "Em San Telmo rola feira de antiguidades.",
      "A Casa Rosada fica na Plaza de Mayo.",
      "O Teatro Colón é a ópera famosa.",
      "Palermo é cheio de bar e parque.",
    ],
    hard: [
      "Em Recoleta tem o cemitério onde está a Evita.",
      "Puerto Madero é a orla do porto renovada.",
      "A Avenida Corrientes é tipo a Broadway de lá.",
      "O El Ateneo é uma livraria dentro de um teatro antigo.",
      "Tigre e o delta ficam a um passeio de trem.",
    ],
  },
  santiago: {
    easy: [
      "Capital do Chile.",
      "Fica bem aos pés dos Andes.",
      "Terra do vinho chileno.",
      "A Plaza de Armas é o centro velho.",
      "Tem metrô moderno por baixo da cidade.",
    ],
    medium: [
      "Do Cerro San Cristóbal dá pra ver a capital inteira.",
      "La Moneda é o palácio do presidente.",
      "Bellavista é o bairro mais boêmio.",
      "No Mercado Central o forte é frutos do mar.",
      "Valparaíso fica a poucas horas daqui.",
    ],
    hard: [
      "O Costanera Center tem o prédio mais alto.",
      "Lastarria mistura museu e café.",
      "O Cajón del Maipo é o rolê de natureza perto.",
      "Tem um Museu da Memória sobre a ditadura.",
      "Dá pra esquiar nos Andes a mais ou menos 1h.",
    ],
  },
  lima: {
    easy: [
      "Capital do Peru.",
      "A comida peruana daqui é de outro nível.",
      "Fica na costa do Pacífico.",
      "Ceviche é o prato que todo mundo pede.",
      "Machu Picchu fica no mesmo país.",
    ],
    medium: [
      "No centro histórico tem a Plaza Mayor.",
      "Miraflores é o bairro turístico na beira-mar.",
      "Barranco é o lado artístico e boêmio.",
      "De noite tem o Circuito Mágico das Águas.",
      "A Huaca Pucllana é uma pirâmide de adobe no meio da cidade.",
    ],
    hard: [
      "O Museu Larco tem cerâmica pré-colombiana demais.",
      "A Costa Verde corre na beira dos penhascos.",
      "Surquillo tem um mercado gastronômico famoso.",
      "Callao é o porto do lado.",
      "Pachacamac fica nos arredores.",
    ],
  },
  bogota: {
    easy: [
      "Capital da Colômbia.",
      "Fica a mais de 2.600 m de altitude.",
      "Café colombiano é daqui.",
      "Monserrate é aquele morro com santuário em cima.",
      "O Museu do Ouro é bem famoso.",
    ],
    medium: [
      "La Candelaria é o centro histórico colorido.",
      "A Plaza Bolívar é a praça principal.",
      "O TransMilenio é o BRT da cidade.",
      "Usaquén tem feira aos domingos.",
      "Tem teleférico subindo até o Monserrate.",
    ],
    hard: [
      "Tem tour de grafite no Bronx/Calleja.",
      "Perto daqui, Zipaquirá tem a Catedral de Sal.",
      "Chapinero mistura noite e café.",
      "O Jardim Botânico fica na zona oeste.",
      "Andes e páramos cercam a sabana.",
    ],
  },
  cidadedomexico: {
    easy: [
      "Capital do México.",
      "O Zócalo é uma das maiores praças do mundo.",
      "Taco e comida de rua são a alma daqui.",
      "No país tem pirâmide maia e asteca.",
      "Falam espanhol mexicano.",
    ],
    medium: [
      "O Museu de Antropologia é dos melhores do mundo.",
      "Em Coyoacán fica o museu da Frida Kahlo.",
      "Xochimilco tem aqueles barquinhos coloridos.",
      "Chapultepec é o parque gigante.",
      "Teotihuacán fica a pouco mais de 1h.",
    ],
    hard: [
      "Roma-Condesa é o polo de café e arte.",
      "O Palácio de Belas Artes tem aquela cúpula linda.",
      "Polanco é cheio de restaurante e museu.",
      "O Anjo da Independência fica na Reforma.",
      "Em Tlatelolco tem a praça das Três Culturas.",
    ],
  },
  novayork: {
    easy: [
      "A maior cidade dos Estados Unidos.",
      "A Estátua da Liberdade fica na baía.",
      "Times Square brilha o tempo todo.",
      "Central Park é o parque no meio de Manhattan.",
      "Aquela skyline cheia de arranha-céu.",
    ],
    medium: [
      "A Brooklyn Bridge liga Manhattan a Brooklyn.",
      "Broadway é o circuito dos musicais.",
      "O Empire State é o prédio art déco clássico.",
      "O High Line é aquele parque elevado.",
      "Wall Street é o centro financeiro.",
    ],
    hard: [
      "O One World Trade sobe no Ground Zero.",
      "Chelsea Market fica no Meatpacking.",
      "O Guggenheim tem aquela rampa em espiral.",
      "DUMBO é o ponto clássico de foto da ponte.",
      "Harlem é berço do jazz e da cultura negra.",
    ],
  },
  toronto: {
    easy: [
      "A maior cidade do Canadá.",
      "A CN Tower é o marco da skyline.",
      "Fica na beira do Lago Ontário.",
      "Cidade bem multicultural.",
      "No país convivem inglês e francês.",
    ],
    medium: [
      "A Ilha de Toronto fica de ferry.",
      "O Distillery District é tijolo e bar.",
      "Kensington Market é o bairro boêmio.",
      "O Rogers Centre fica aos pés da torre.",
      "Niagara Falls fica a umas 2h.",
    ],
    hard: [
      "Queen West é cheia de street art.",
      "O Path é uma rede subterrânea de shopping.",
      "Casa Loma é o castelo da cidade.",
      "St. Lawrence Market é o food hall clássico.",
      "The Annex é bairro de universidade.",
    ],
  },
  lisboa: {
    easy: [
      "Capital de Portugal.",
      "Aquele elétrico amarelo subindo a ladeira.",
      "Pastel de nata é o doce da casa.",
      "Fica na beira do Tejo.",
      "Fado é a música tradicional.",
    ],
    medium: [
      "Em Belém tem o Mosteiro dos Jerónimos.",
      "O elevador de Santa Justa liga a Baixa ao Chiado.",
      "Alfama é o bairro das ruelas.",
      "A Praça do Comércio abre pro Tejo.",
      "O Cristo-Rei fica do outro lado do rio.",
    ],
    hard: [
      "O LX Factory ocupa uma área industrial antiga.",
      "O Oceanário nasceu na Expo 98.",
      "A Feira da Ladra é o mercado de pulgas.",
      "O Time Out Market fica na Ribeira.",
      "O Miradouro da Senhora do Monte é bem alto.",
    ],
  },
  madrid: {
    easy: [
      "Capital da Espanha.",
      "Plaza Mayor e Puerta del Sol no centro.",
      "O Museu do Prado é um dos maiores do mundo.",
      "Tapas e jamón fazem a noite.",
      "Fica no meio da península, longe do mar.",
    ],
    medium: [
      "No Retiro tem lago e o Palácio de Cristal.",
      "O Palácio Real é enorme.",
      "Gran Vía é avenida de teatro e loja.",
      "O Bernabéu é a casa do Real Madrid.",
      "Malasaña e La Latina são o rolê de bar.",
    ],
    hard: [
      "O Triângulo da Arte: Prado, Thyssen e Reina Sofía.",
      "Tem um templo egípcio no parque — o Debod.",
      "Lavapiés é o bairro mais misturado.",
      "El Rastro é a feira de domingo.",
      "O Círculo de Bellas Artes tem terraço com vista.",
    ],
  },
  paris: {
    easy: [
      "Capital da França.",
      "Todo mundo conhece a Torre Eiffel.",
      "Croissant e café na calçada são rotina.",
      "O Sena corta a cidade.",
      "A Mona Lisa fica no Louvre.",
    ],
    medium: [
      "O Arco do Triunfo fica nos Campos Elísios.",
      "Em Montmartre tem o Sacré-Cœur.",
      "Notre-Dame fica na Île de la Cité.",
      "O metrô tem aquelas entradas art nouveau.",
      "Versailles fica nos arredores.",
    ],
    hard: [
      "O Marais é ruela e museu.",
      "A Sainte-Chapelle tem vitral demais.",
      "No Canal Saint-Martin o povo faz piquenique.",
      "Belleville é o Paris de bairro.",
      "A Fondation Louis Vuitton fica no Bois.",
    ],
  },
  londres: {
    easy: [
      "Capital do Reino Unido.",
      "Big Ben e Parlamento na beira do Tâmisa.",
      "Aqueles ônibus vermelhos de dois andares.",
      "Buckingham Palace é a casa da realeza.",
      "O metrô se chama Tube.",
    ],
    medium: [
      "A London Eye é a roda-gigante.",
      "A Tower Bridge abre em cima do rio.",
      "No British Museum tem a Pedra de Roseta.",
      "Camden Market é um caos criativo.",
      "Hyde Park é o parque real gigante.",
    ],
    hard: [
      "Shoreditch é cheia de street art.",
      "Borough Market fica na margem sul.",
      "A Tate Modern era uma usina.",
      "Notting Hill tem o Carnival.",
      "Greenwich marca o meridiano zero.",
    ],
  },
  roma: {
    easy: [
      "Capital da Itália.",
      "O Coliseu é o anfiteatro famoso.",
      "O Vaticano fica dentro da cidade.",
      "Na Fontana di Trevi o povo joga moedinha.",
      "Pizza, pasta e gelato em toda esquina.",
    ],
    medium: [
      "O Panteão tem um buraco no meio da cúpula.",
      "Na Piazza Navona tem a fonte do Bernini.",
      "O Fórum Romano fica do lado do Coliseu.",
      "Trastevere é o bairro boêmio.",
      "A escadaria da Piazza di Spagna é clássica.",
    ],
    hard: [
      "O Castel Sant’Angelo já foi mausoléu.",
      "A Via Appia ainda tem pedra romana.",
      "Testaccio é o lugar pra comer bem.",
      "A Galleria Borghese fica no parque.",
      "Ostia Antica fica a um trem.",
    ],
  },
  berlim: {
    easy: [
      "Capital da Alemanha.",
      "O Portão de Brandemburgo é o símbolo.",
      "O Muro marcou a Guerra Fria.",
      "Noite e arte de rua fortes pra caramba.",
      "Falam alemão.",
    ],
    medium: [
      "A East Side Gallery tem os grafites do muro.",
      "A Ilha dos Museus é patrimônio.",
      "Alexanderplatz tem a torre de TV.",
      "Checkpoint Charlie era posto de fronteira.",
      "Tiergarten é o parque grande.",
    ],
    hard: [
      "Kreuzberg e Neukölln são o lado alternativo.",
      "O Reichstag tem a cúpula de vidro.",
      "Tempelhof virou parque — era aeroporto.",
      "Charlottenburg tem palácio barroco.",
      "Berghain é o clube mais mítico.",
    ],
  },
  amsterdam: {
    easy: [
      "Capital dos Países Baixos.",
      "Os canais formam aqueles anéis famosos.",
      "Bicicleta é o meio de transporte da casa.",
      "Casas estreitas com frontão típico.",
      "Tulipa marca o país na primavera.",
    ],
    medium: [
      "O Museu Van Gogh é referência.",
      "A Casa de Anne Frank fica no canal.",
      "Dam Square é o centro.",
      "Tem passeio de barco pelos canais.",
      "Vondelpark é o parque urbano.",
    ],
    hard: [
      "Jordaan é bairro de café.",
      "No Rijksmuseum tem Rembrandt.",
      "Aelbert Cuyp é mercado de rua.",
      "Zaanse Schans tem moinho perto.",
      "Noord se liga pelo ferry de graça.",
    ],
  },
  atenas: {
    easy: [
      "Capital da Grécia.",
      "Acrópole e Partenon: o postal.",
      "Berço da democracia clássica.",
      "Comida com azeite, feta e moussaká.",
      "Falam grego.",
    ],
    medium: [
      "Plaka é o bairro sob a Acrópole.",
      "A Ágora Antiga fica bem aos pés.",
      "O Estádio Panathinaiko reviveu as Olimpíadas.",
      "Monastiraki tem feira e vista.",
      "O Mar Egeu fica a poucos quilômetros.",
    ],
    hard: [
      "Exarchia é o polo alternativo.",
      "O Museu da Acrópole é bem moderno.",
      "Psyrri é o rolê de bar.",
      "No Cabo Sounion tem o templo de Poseidon.",
      "Do monte Licabeto a vista à noite é linda.",
    ],
  },
  istambul: {
    easy: [
      "Fica entre Europa e Ásia.",
      "A Santa Sofia é o monumento que todo mundo conhece.",
      "O Grande Bazar é um labirinto de loja.",
      "O Bósforo corta a cidade no meio.",
      "Chá e café turco são rotina.",
    ],
    medium: [
      "A Mesquita Azul fica perto da Sofia.",
      "O Palácio Topkapi foi sede otomana.",
      "Ferry cruza o Bósforo o tempo todo.",
      "Kadıköy fica do lado asiático.",
      "Baklava é o doce clássico.",
    ],
    hard: [
      "Balat tem casa colorida.",
      "A Cisterna Basílica é subterrânea.",
      "As Ilhas dos Príncipes ficam de ferry.",
      "Karaköy e Galata têm a torre.",
      "O Corno de Ouro é a baía famosa.",
    ],
  },
  dubai: {
    easy: [
      "Fica nos Emirados Árabes.",
      "O Burj Khalifa é o prédio mais alto do mundo.",
      "A Palm Jumeirah é a ilha em forma de palmeira.",
      "Luxo no meio do deserto.",
      "O Dubai Mall é enorme.",
    ],
    medium: [
      "A Dubai Fountain dança na lagoa.",
      "O metrô elevado corta a Sheikh Zayed.",
      "O Madinat é tipo um souk.",
      "No deserto tem passeio de buggy.",
      "O Frame é aquele portal dourado.",
    ],
    hard: [
      "Al Fahidi guarda os souks no Creek.",
      "O Museum of the Future tem fachada oval.",
      "A Expo City nasceu da Expo 2020.",
      "JBR é a orla de calçadão.",
      "O DIFC é o centro financeiro.",
    ],
  },
  cairo: {
    easy: [
      "Capital do Egito.",
      "As Pirâmides de Gizé ficam na região.",
      "O Nilo corta a cidade.",
      "A Esfinge guarda as pirâmides.",
      "Falam árabe.",
    ],
    medium: [
      "O Museu Egípcio guarda as múmias e o ouro.",
      "Khan el-Khalili é o bazaar.",
      "A Cidadela tem mesquita no alto.",
      "O deserto chega perto da metrópole.",
      "Feluca navega o Nilo.",
    ],
    hard: [
      "Islamic Cairo tem mesquita medieval.",
      "Saqqara fica logo ao sul.",
      "Zamalek é a ilha residencial.",
      "O Novo Museu Egípcio (GEM) fica em Gizé.",
      "Al-Azhar é mesquita e universidade.",
    ],
  },
  capetown: {
    easy: [
      "Fica na África do Sul.",
      "A Table Mountain é o marco da cidade.",
      "Perto da ponta da África.",
      "Tem vinícola nos arredores.",
      "O Cabo da Boa Esperança fica na região.",
    ],
    medium: [
      "Tem teleférico subindo a Table Mountain.",
      "V&A Waterfront é o porto turístico.",
      "Robben Island foi a prisão do Mandela.",
      "Camps Bay é praia com vista.",
      "Stellenbosch é rota do vinho.",
    ],
    hard: [
      "Bo-Kaap tem casa colorida.",
      "Chapman’s Peak é estrada de vista linda.",
      "Kirstenbosch é o jardim botânico.",
      "Em Boulders Beach tem pinguim.",
      "Do Signal Hill dá pra ver o pôr do sol.",
    ],
  },
  toquio: {
    easy: [
      "Capital do Japão.",
      "O cruzamento de Shibuya é famoso demais.",
      "Trem pontual e néon por todo lado.",
      "Sushi e ramen são do dia a dia.",
      "Em dia limpo aparece o Monte Fuji.",
    ],
    medium: [
      "Em Asakusa tem o templo Sensō-ji.",
      "A Tokyo Skytree marca a skyline.",
      "Akihabara é o bairro otaku.",
      "O Palácio Imperial fica no centro.",
      "Harajuku é o polo da moda jovem.",
    ],
    hard: [
      "Meiji Jingu fica no meio do bosque.",
      "Ginza é de vitrine clássica.",
      "Yanaka ainda tem ruela antiga.",
      "O mercado externo de Tsukiji ainda vende peixe.",
      "O TeamLab é arte imersiva.",
    ],
  },
  seul: {
    easy: [
      "Capital da Coreia do Sul.",
      "Berço do K-pop e da onda coreana.",
      "O rio Han corta a metrópole.",
      "Tem palácio da dinastia Joseon.",
      "Kimchi é a cara da cozinha.",
    ],
    medium: [
      "Gyeongbokgung é o palácio grande.",
      "Myeongdong é rua de compra.",
      "Hongdae é o rolê jovem e street.",
      "A N Seoul Tower fica no Namsan.",
      "A DMZ fica a norte da cidade.",
    ],
    hard: [
      "Bukchon tem casa hanok.",
      "Dongdaemun é mercado 24h.",
      "Itaewon é o bairro internacional.",
      "No Han River Park tem ciclovia.",
      "Insadong vende artesanato.",
    ],
  },
  sydney: {
    easy: [
      "A cidade mais famosa da Austrália.",
      "A Ópera de Sydney é o postal.",
      "A Harbour Bridge cruza o porto.",
      "Bondi Beach é a praia icônica.",
      "Falam inglês.",
    ],
    medium: [
      "Circular Quay concentra ferry e turismo.",
      "The Rocks é o bairro histórico.",
      "Manly fica de ferry.",
      "Taronga tem zoológico com vista.",
      "Uluru fica no mesmo país, bem longe.",
    ],
    hard: [
      "Surry Hills é polo gastronômico.",
      "As Blue Mountains ficam a oeste.",
      "Coogee é praia vizinha de Bondi.",
      "Barangaroo renovou a orla.",
      "Paddington tem casa geminada.",
    ],
  },
  moscou: {
    easy: [
      "Capital da Rússia.",
      "A Praça Vermelha é o postal.",
      "O Kremlin fica do lado.",
      "O metrô tem estação luxuosa demais.",
      "O frio de inverno é lendário.",
    ],
    medium: [
      "A Catedral de São Basílio tem cúpula colorida.",
      "A GUM é a galeria comercial.",
      "O Parque Gorky é clássico.",
      "O Bolshoi é o teatro de balé.",
      "O rio Moscou corta a cidade.",
    ],
    hard: [
      "VDNKh é um complexo de exposições.",
      "Arbat é rua pedonal histórica.",
      "Kolomenskoye é reserva de igreja.",
      "Moscow-City é o cluster de torres.",
      "Novodevichy é convento e cemitério.",
    ],
  },
  saopaulo: {
    easy: [
      "A maior cidade do Brasil.",
      "A Paulista é o cartão financeiro.",
      "O MASP tem aquele vão livre famoso.",
      "Conhecida pela garoa.",
      "No Mercadão o sanduíche de mortadela é lei.",
    ],
    medium: [
      "A Liberdade é o bairro oriental.",
      "O Ibirapuera é o parque que todo mundo vai.",
      "A 25 de Março é um caos de compra.",
      "A Pinacoteca fica perto da Luz.",
      "O Morumbi é o estádio grande.",
    ],
    hard: [
      "O Beco do Batman fica em Vila Madalena.",
      "O Minhocão vira parque aos domingos.",
      "O Copan tem aquela fachada ondulada.",
      "A ponte estaiada é o marco do Pinheiros.",
      "O Teatro Municipal parece Paris.",
    ],
  },
  brasilia: {
    easy: [
      "Capital federal do Brasil.",
      "Foi planejada em forma de avião.",
      "O Congresso tem aquelas torres e cúpulas.",
      "Fica no Planalto Central.",
      "A Catedral do Niemeyer é icônica.",
    ],
    medium: [
      "O Eixo Monumental corta a cidade.",
      "Na Esplanada ficam os ministérios.",
      "O Palácio da Alvorada é a residência oficial.",
      "O Lago Paranoá é artificial.",
      "A Rodoviária fica no miolo do avião.",
    ],
    hard: [
      "Na Praça dos Três Poderes se encontram os poderes.",
      "A Superquadra é o módulo residencial.",
      "A Torre de TV tem mirante.",
      "O Itamaraty tem espelho d’água.",
      "O Memorial JK homenageia o fundador.",
    ],
  },
  salvador: {
    easy: [
      "Capital da Bahia.",
      "O Pelourinho é o centro colorido.",
      "É de onde saiu o axé.",
      "Acarajé é o quitute de rua.",
      "O Elevador Lacerda liga a Cidade Alta à Baixa.",
    ],
    medium: [
      "O Farol da Barra é o marco da baía.",
      "No Bonfim tem as fitinhas famosas.",
      "O Mercado Modelo fica aos pés do elevador.",
      "Trio elétrico é a cara do carnaval.",
      "Itapuã tem duna e lagoa.",
    ],
    hard: [
      "O Forte de São Marcelo fica no meio da baía.",
      "Rio Vermelho é o polo da noite.",
      "No Dique do Tororó tem orixá.",
      "A igreja de São Francisco é toda dourada.",
      "O Solar do Unhão abriga o MAM.",
    ],
  },
  belohorizonte: {
    easy: [
      "Capital de Minas Gerais.",
      "Pão de queijo é o quitute da casa.",
      "Cercada pela Serra do Curral.",
      "O Mineirão é o estádio grande.",
      "Terra de boteco e comida mineira.",
    ],
    medium: [
      "Na Praça da Liberdade tem um monte de museu.",
      "Na Pampulha tem a igrejinha do Niemeyer.",
      "No Mercado Central vende queijo e cachaça.",
      "A Savassi é o polo comercial.",
      "Do mirante da serra dá pra ver a cidade.",
    ],
    hard: [
      "São Francisco de Assis na Pampulha é Unesco.",
      "A Pampulha foi projeto do JK.",
      "O Palácio das Artes fica no centro cultural.",
      "A feira da Liberdade anima o fim de semana.",
      "O Circuito Cultural liga os museus.",
    ],
  },
  curitiba: {
    easy: [
      "Capital do Paraná.",
      "Famosa pelo frio e pelo ônibus-tubo.",
      "O Jardim Botânico é o postal.",
      "Tem fama de cidade planejada.",
      "O transporte coletivo é referência.",
    ],
    medium: [
      "O Parque Tanguá tem mirante.",
      "O Museu Oscar Niemeyer é aquele Olho.",
      "A Rua das Flores foi pioneira.",
      "O Parque Barigui é de corrida e lago.",
      "A Ópera de Arame fica entre as árvores.",
    ],
    hard: [
      "O Bosque Alemão homenageia a imigração.",
      "O Memorial Ucraniano fica no Tingui.",
      "A Torre Panorâmica dá vista 360º.",
      "A UFPR tem prédio histórico.",
      "O programa de reciclagem é referência.",
    ],
  },
  recife: {
    easy: [
      "Capital de Pernambuco.",
      "Cidade dos rios e das pontes.",
      "Frevo e maracatu são a cara daqui.",
      "Fica colada em Olinda.",
      "O Marco Zero é o centro.",
    ],
    medium: [
      "Brennand tem escultura no mar.",
      "Boa Viagem é a praia urbana.",
      "O Recife Antigo é o rolê de show.",
      "Ponte cruza Capibaribe e Beberibe.",
      "Olinda tem boneco e ladeira.",
    ],
    hard: [
      "O Instituto Ricardo Brennand tem castelo.",
      "O Paço Alfândega renovou o porto.",
      "Cinco Pontas abriga museu.",
      "A Casa da Cultura já foi cadeia.",
      "O Porto Digital é hub de tech.",
    ],
  },
  miami: {
    easy: [
      "Fica na Flórida.",
      "South Beach é famosa demais.",
      "Destino clássico de brasileiro.",
      "Tem Art Déco colorido.",
      "Brickell é a skyline moderna.",
    ],
    medium: [
      "Ocean Drive é a rua dos hotéis pastel.",
      "Little Havana é cultura cubana.",
      "Wynwood Walls é muro e mural.",
      "Biscayne Bay separa a ilha.",
      "O porto de cruzeiro é movimentado.",
    ],
    hard: [
      "Vizcaya é uma villa na beira da baía.",
      "Design District é de luxo.",
      "Key Biscayne fica ao sul.",
      "Coral Gables tem a Miracle Mile.",
      "Arsht Center é o complexo de artes.",
    ],
  },
};

/**
 * Turn guidebook phrasing into something a Brazilian would actually say.
 */
function naturalize(clue) {
  let s = clue.trim();

  const reps = [
    [/^É a capital federal do Brasil\.$/, "Capital federal do Brasil."],
    [/^É a capital (da|de|do) (.+)\.$/, (_, a, p) => `Capital ${a} ${p}.`],
    [/^É a maior cidade do Vietnã \(antiga Saigon\)\.$/, "A maior cidade do Vietnã — a antiga Saigon."],
    [/^É a maior cidade (da|de|do|dos|das) (.+)\.$/, (_, a, p) => `A maior cidade ${a} ${p}.`],
    [/^É a segunda maior cidade (da|de|do) (.+)\.$/, (_, a, p) => `A segunda maior cidade ${a} ${p}.`],
    [/^É a cidade mais famosa (da|de|do) (.+)\.$/, (_, a, p) => `A cidade mais famosa ${a} ${p}.`],
    [/^É uma das capitais (.+)\.$/, "Uma das capitais $1."],
    [/^É o polo econômico (.+)\.$/, "É o polo econômico $1."],
    [/^É famosa (pelo|pela|por|pelos|pelas) (.+)\.$/, (_, prep, rest) => `Famosa ${prep} ${rest}.`],
    [/^É conhecida (pelo|pela|por|pelos|pelas) (.+)\.$/, (_, prep, rest) => `Conhecida ${prep} ${rest}.`],
    [/^É berço (do|da|de|dos|das) (.+)\.$/, (_, a, p) => `É de onde saiu ${a === "do" || a === "dos" ? (a === "dos" ? "os " : "o ") : a === "da" || a === "das" ? (a === "das" ? "as " : "a ") : ""}${p}.`.replace(/\s+/g, " ").replace("saiu o o ", "saiu o ").replace("saiu a a ", "saiu a ")],
    [/^É destino clássico de (.+)\.$/, "Destino clássico de $1."],
    [/^É chamada de (.+) pelos (.+)\.$/, "O pessoal chama de $1."],
    [/^É terra de (.+)\.$/, "Terra de $1."],
    [/^É porta de entrada (para|pra) (.+)\.$/, "Porta de entrada $1 $2."],
    [/^É perto da (.+)\.$/, "Perto da $1."],
    [/^Fala-se (.+)\.$/, "O povo fala $1."],
    [/^Fica à beira (d[oaes]+) (.+)\.$/, (_, a, p) => `Fica na beira ${a} ${p}.`],
    [/^Fica aos pés (d[oa]) (.+)\.$/, (_, a, p) => `Fica bem aos pés ${a} ${p}.`],
    [/^Fica colada a (.+)\.$/, "Fica colada em $1."],
    [/^Fica entre (.+)\.$/, "Fica entre $1."],

    // tourism brochure verbs
    [/^(.+) marca a skyline\.$/, "$1 é o marco da skyline."],
    [/^(.+) marca a baía\.$/, "$1 é o marco da baía."],
    [/^(.+) marca a (.+)\.$/, "Tem $1 bem na $2."],
    [/^(.+) marca o (.+)\.$/, "$1 é o marco do $2."],
    [/^(.+) marcam a (.+)\.$/, "$1 são a cara da $2."],
    [/^(.+) marcam o (.+)\.$/, "$1 são a cara do $2."],
    [/^(.+) marcam (.+)\.$/, "$1 são a cara $2."],
    [/^(.+) é marca registrada\.$/, "$1 é clássico por aqui."],
    [/^(.+) são marcas\.$/, "$1 são a cara daqui."],
    [/^(.+) é cartão-postal\.$/, "Todo mundo conhece $1."],
    [/^(.+) são cartão-postal\.$/, "$1: o postal clássico."],
    [/^(.+) é o cartão\.$/, "$1 é o postal."],
    [/^(.+) é o postal\.$/, "$1 é o postal clássico."],
    [/^(.+) é o cartão turístico\.$/, "$1 é o ponto turístico clássico."],
    [/^(.+) é cartão financeiro\.$/, "$1 é o cartão financeiro."],

    [/^(.+) concentra (.+)\.$/, "Em $1 tem muito $2."],
    [/^(.+) anima (.+)\.$/, "$1 é onde o pessoal vai pra $2."],
    [/^(.+) revitalizou (.+)\.$/, "$1 renovou $2."],
    [/^(.+) abriga (.+)\.$/, "No $1 fica $2."],
    [/^(.+) guarda (.+)\.$/, "No $1 tem $2."],
    [/^(.+) mistura (.+)\.$/, "$1 junta $2."],
    [/^(.+) reúne (.+)\.$/, "$1 junta $2."],
    [/^(.+) recebe (.+)\.$/, "É no $1 que rola $2."],
    [/^(.+) oferece (.+)\.$/, "Lá tem $2."],
    [/^(.+) vende (.+)\.$/, "No $1 vende $2."],
    [/^(.+) serve (.+)\.$/, "No $1 o forte é $2."],

    [/^(.+) é referência mundial\.$/, "$1 é dos mais importantes do mundo."],
    [/^(.+) é referência\.$/, "$1 é referência mesmo."],
    [/^(.+) é monumento icônico\.$/, "$1 é o monumento que todo mundo conhece."],
    [/^(.+) é o monumento mais famoso\.$/, "Todo mundo conhece $1."],
    [/^(.+) é quitute de rua\.$/, "$1 é o quitute de rua."],
    [/^(.+) é o quitute associado\.$/, "$1 é o quitute da casa."],
    [/^(.+) é o prato mais associado\.$/, "$1 é o prato que todo mundo pede."],
    [/^(.+) é sinônimo de (.+)\.$/, "$1 é sinônimo de $2."],
    [/^(.+) é meio de transporte principal\.$/, "$1 é o meio de transporte da casa."],
    [/^(.+) formam a skyline famosa\.$/, "$1 formam aquela skyline famosa."],
    [/^(.+) formam anéis famosos\.$/, "$1 formam aqueles anéis famosos."],
    [/^(.+) convivem no país\.$/, "No país convivem $1."],
    [/^(.+) aparecem? nas placas\.$/, "$1 aparece nas placas."],
    [/^(.+) estão em toda esquina\.$/, "$1 em toda esquina."],
    [/^(.+) fazem parte da noite (.+)\.$/, "$1 fazem a noite $2."],
    [/^(.+) são rotina\.$/, "$1 são rotina."],
    [/^(.+) é constante\.$/, "$1 é constante."],
    [/^(.+) é lendário\.$/, "$1 é lendário."],
    [/^(.+) é intensa e barata\.$/, "$1 é intensa e barata."],
    [/^(.+) dominam o trânsito\.$/, "$1 dominam o trânsito."],
    [/^Tem marcas da (.+)\.$/, "Ainda dá pra ver marcas da $1."],
    [/^Tem (.+) no país\.$/, "No país tem $1."],
    [/^Os freeways dominam o trânsito\.$/, "Freeway domina o trânsito."],
    [/^Catalão aparece nas placas\.$/, "Catalão aparece nas placas."],
    [/^Tapas e sangria na mesa\.$/, "Tapas e sangria na mesa."],
    [/^Tem praia urbana\.$/, "Tem praia urbana."],
    [/^Fica na Catalunha\.$/, "Fica na Catalunha."],
  ];

  for (const [re, to] of reps) {
    if (re.test(s)) {
      s = typeof to === "function" ? s.replace(re, to) : s.replace(re, to);
      break; // one structural transform is enough
    }
  }

  // Second pass: soft polish that can stack
  s = s
    .replace(/\bmarca registrada\b/g, "clássico por aqui")
    .replace(/\bcartão-postal\b/g, "postal clássico")
    .replace(/\bconcentra\b/g, "é cheio de")
    .replace(/\banima\b/gi, (m) => (m[0] === "A" ? "É o rolê de" : "é o rolê de"))
    .replace(/\brevitalizou\b/g, "renovou")
    .replace(/\bFala-se\b/g, "O povo fala")
    .replace(/\bà beira\b/g, "na beira")
    .replace(/\bé polo de\b/g, "é o polo de")
    .replace(/\bé atrativo urbano\b/g, "é atrativo urbano")
    .replace(/\bmarco cívico\b/g, "praça principal")
    .replace(/\bBRT local\b/g, "BRT da cidade");

  // Fix awkward "É o rolê de" double from anima replace on already-transformed
  s = s.replace(/é o rolê de o rolê de/gi, "é o rolê de");
  s = s.replace(/^É o rolê de /i, (m) => m); // keep

  // Clean "No O " / "No A " from abriga transforms
  s = s.replace(/\bNo O /g, "No ").replace(/\bNo A /g, "Na ").replace(/\bNo As /g, "Nas ").replace(/\bNo Os /g, "Nos ");
  s = s.replace(/\bEm O /g, "Em ").replace(/\bEm A /g, "Em ");

  // Fix "É de onde saiu" duplicates
  s = s.replace(/É de onde saiu o o /g, "É de onde saiu o ");
  s = s.replace(/É de onde saiu a a /g, "É de onde saiu a ");

  return s;
}

function rewriteCity(city) {
  if (OVERRIDES[city.id]) return OVERRIDES[city.id];
  if (MORE[city.id]) return MORE[city.id];
  return {
    easy: city.clues.easy.map(naturalize),
    medium: city.clues.medium.map(naturalize),
    hard: city.clues.hard.map(naturalize),
  };
}

// Expand overrides: for cities without full override, naturalize
// Then also apply a second humanize pass on medium/hard that still sound stiff

function humanizeMore(s) {
  let t = s;
  // "X é o Y" encyclopedia → more spoken when pattern is stiff
  const more = [
    [/^O metrô se chama (.+)\.$/, "O metrô se chama $1."],
    [/^Fica (na|no|em) (.+)\.$/, "Fica $1 $2."],
    [/^Tem (.+)\.$/, "Tem $1."],
    [/^A comida tem (.+)\.$/, "A comida leva $1."],
    [/^Croissant e café na calçada são rotina\.$/, "Croissant e café na calçada são rotina."],
    [/^Os ônibus vermelhos de dois andares são símbolo\.$/, "Aqueles ônibus vermelhos de dois andares."],
    [/^Buckingham Palace é residência real\.$/, "Buckingham Palace é a casa da realeza."],
    [/^A Fontana di Trevi pede moedinha\.$/, "Na Fontana di Trevi o povo joga moedinha."],
    [/^Pizza, pasta e gelato estão em toda esquina\.$/, "Pizza, pasta e gelato em toda esquina."],
    [/^O Muro de Berlim marcou a Guerra Fria\.$/, "O Muro marcou a Guerra Fria."],
    [/^Tem vida noturna e arte de rua fortes\.$/, "Noite e arte de rua fortes pra caramba."],
    [/^Bicicleta é meio de transporte principal\.$/, "Bicicleta é o meio de transporte da casa."],
    [/^As casas estreitas têm frontões típicos\.$/, "Casas estreitas com frontão típico."],
    [/^Os tulipas marcam o país na primavera\.$/, "Tulipa marca o país na primavera."],
    [/^A Acrópole e o Partenon são o cartão\.$/, "Acrópole e Partenon: o postal."],
    [/^É berço da democracia clássica\.$/, "Berço da democracia clássica."],
    [/^A gastronomia de rua é intensa e barata\.$/, "A comida de rua é intensa e barata."],
    [/^As scooters dominam o trânsito\.$/, "Scooter domina o trânsito."],
    [/^O letreiro HOLLYWOOD marca as colinas\.$/, "O letreiro HOLLYWOOD nas colinas."],
    [/^South Beach é famosa\.$/, "South Beach é famosa demais."],
    [/^É destino clássico de brasileiros\.$/, "Destino clássico de brasileiro."],
    [/^Frevo e maracatu são a cara daqui\.$/, "Frevo e maracatu são a cara daqui."],
    [/^Acarajé é quitute de rua\.$/, "Acarajé é o quitute de rua."],
    [/^O Pelourinho é o centro colorido\.$/, "O Pelourinho é o centro colorido."],
    [/^Foi planejada em forma de avião\.$/, "Foi planejada em forma de avião."],
    [/^A Avenida Paulista é cartão financeiro\.$/, "A Paulista é o cartão financeiro."],
    [/^O MASP tem o vão livre famoso\.$/, "O MASP tem aquele vão livre famoso."],
    [/^O Mercadão vende o sanduíche de mortadela\.$/, "No Mercadão o sanduíche de mortadela é lei."],
    [/^Conhecida pela garoa\.$/, "Conhecida pela garoa."],
  ];
  for (const [re, to] of more) {
    if (re.test(t)) {
      t = t.replace(re, to);
      break;
    }
  }
  return t;
}

// Build full rewritten set
const out = cities.map((c) => {
  const clues = rewriteCity(c);
  return {
    ...c,
    clues: {
      easy: clues.easy.map(humanizeMore),
      medium: clues.medium.map(humanizeMore),
      hard: clues.hard.map(humanizeMore),
    },
  };
});

// Verify counts
for (const c of out) {
  for (const k of ["easy", "medium", "hard"]) {
    if (c.clues[k].length !== 5) {
      console.error("BAD", c.id, k, c.clues[k].length);
      process.exit(1);
    }
  }
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function clueArr(arr) {
  return `[${arr.map((s) => `"${esc(s)}"`).join(", ")}]`;
}

const header = `import type { Difficulty } from "@/lib/types";

export type SceneKey = "rio" | "miami" | "paris" | "plaza" | "sp" | "dubai";
export type CityTier = "easy" | "medium" | "hard";

export type CityRecord = {
  id: string;
  name: string;
  country: string;
  blurb: string;
  sceneKey: SceneKey;
  /** Minimum mode where this city enters the pool. */
  tier: CityTier;
  clues: { easy: string[]; medium: string[]; hard: string[] };
};

export type CityId = string;

export const CITY_CATALOG: CityRecord[] = [
`;

const body = out
  .map((c) => {
    return `  {
    id: "${c.id}",
    name: "${esc(c.name)}",
    country: "${esc(c.country)}",
    blurb: "${esc(c.blurb)}",
    sceneKey: "${c.sceneKey}",
    tier: "${c.tier}",
    clues: {
      easy: ${clueArr(c.clues.easy)},
      medium: ${clueArr(c.clues.medium)},
      hard: ${clueArr(c.clues.hard)},
    },
  }`;
  })
  .join(",\n");

const footer = `
];

const TIER_RANK: Record<CityTier, number> = { easy: 0, medium: 1, hard: 2 };

export function citiesForDifficulty(d: Difficulty): CityRecord[] {
  if (d === "hard") return CITY_CATALOG;
  if (d === "medium") return CITY_CATALOG.filter((c) => TIER_RANK[c.tier] <= 1);
  return CITY_CATALOG.filter((c) => c.tier === "easy");
}

export function getCityRecord(id: string): CityRecord {
  const hit = CITY_CATALOG.find((c) => c.id === id);
  if (!hit) throw new Error(\`Unknown city: \${id}\`);
  return hit;
}

export function cityCatalogSizeFor(d: Difficulty): number {
  return citiesForDifficulty(d).length;
}
`;

fs.writeFileSync("/workspace/src/lib/city-catalog.ts", header + body + footer);
console.log("Wrote", out.length, "cities");

// Show sample of non-override cities after naturalize
const samples = ["barcelona", "porto", "manaus", "florianopolis", "chicago", "cidadehochiminh", "havana", "quioto"];
for (const id of samples) {
  const c = out.find((x) => x.id === id);
  console.log("\n===", c.name, "===");
  console.log("E:", c.clues.easy.join(" | "));
  console.log("M:", c.clues.medium.join(" | "));
  console.log("H:", c.clues.hard.join(" | "));
}
