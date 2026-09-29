import { CardDefinition, CardRarity, CardFrameStyle } from '../types';

export const RARITY_LABELS: Record<CardRarity, string> = {
  comum: 'Comum',
  rara: 'Rara',
  epica: 'Épica',
  lendaria: 'Lendária'
};

export const FRAME_LABELS: Record<CardFrameStyle, string> = {
  classic: 'Sem Moldura',
  foil: 'Foil',
  pokemon: 'Vintage',
  cosmic: 'Cósmica',
  gold_texture: 'Ouro',
  crystal: 'Cristal'
};

export const FRAME_ABBREVIATIONS: Record<CardFrameStyle, string> = {
  classic: '',
  cosmic: 'CM',
  foil: 'FL',
  gold_texture: 'OU',
  crystal: 'CR',
  pokemon: 'VT'
};

export const RARITY_COLORS: Record<CardRarity, {
  text: string;
  border: string;
  bg: string;
  badgeBg: string;
  gradient: string;
  glow: string;
  auraColor: string;
}> = {
  comum: {
    text: 'text-slate-600',
    border: 'border-slate-300',
    bg: 'bg-slate-50',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
    gradient: 'from-slate-100 to-slate-200',
    glow: 'none',
    auraColor: 'transparent'
  },
  rara: {
    text: 'text-sky-600',
    border: 'border-sky-400',
    bg: 'bg-sky-50',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-300',
    gradient: 'from-sky-100 via-sky-50 to-blue-100',
    glow: '0 0 16px rgba(56, 189, 248, 0.65)',
    auraColor: '#38bdf8'
  },
  epica: {
    text: 'text-pink-600',
    border: 'border-pink-400',
    bg: 'bg-pink-50',
    badgeBg: 'bg-pink-50 text-pink-700 border-pink-300',
    gradient: 'from-pink-100 via-rose-50 to-pink-200',
    glow: '0 0 16px rgba(244, 114, 182, 0.7)',
    auraColor: '#f472b6'
  },
  lendaria: {
    text: 'text-amber-600',
    border: 'border-amber-400',
    bg: 'bg-amber-50',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-400 shadow-sm',
    gradient: 'from-amber-100 via-yellow-50 to-orange-100',
    glow: '0 0 20px rgba(245, 158, 11, 0.8)',
    auraColor: '#f59e0b'
  }
};

/**
 * Normal card values (sem moldura):
 * Comum = 1, Rara = 2, Épica = 4, Lendária = 16
 * Todas as cartas com moldura valem o DOBRO:
 * Comum = 2, Rara = 4, Épica = 8, Lendária = 32
 */
export const SELL_VALUES: Record<CardRarity, number> = {
  comum: 1,
  rara: 2,
  epica: 4,
  lendaria: 16
};

export function calculateCardSellValue(rarity: CardRarity, frameStyle?: CardFrameStyle): number {
  const base = SELL_VALUES[rarity] || 1;
  const hasFrame = frameStyle && frameStyle !== 'classic';
  return hasFrame ? base * 2 : base;
}

// 151 Card Definitions
const RAW_CARD_NAMES: { name: string; desc: string; rarity?: CardRarity; [key: string]: any }[] = [
  // 1-10
  { name: 'Gotinha Broto', element: 'Natureza', desc: 'Nasce no orvalho matinal das folhas verdes.' },
  { name: 'Ninfa das Folhas', element: 'Natureza', desc: 'Guia as seivas das árvores mais antigas.' },
  { name: 'Vênus Aquática', element: 'Natureza', desc: 'Floresce perto de cascatas cristalinas.' },
  { name: 'Salamandra da Fonte', element: 'Vapor', desc: 'Habita fontes termais aquecidas pela terra.' },
  { name: 'Camaleão do Vapor', element: 'Vapor', desc: 'Desaparece em névoas mornas de água doce.' },
  { name: 'Dragão das Termas', element: 'Vapor', desc: 'Controla a pressão das caldeiras naturais.' },
  { name: 'Tartaruga Borbulhante', element: 'Água', desc: 'Produz bolhas de oxigênio que purificam rios.' },
  { name: 'Quelônio do Torrente', element: 'Água', desc: 'Navega correntes rápidas com facilidade.' },
  { name: 'Blastoise dos Mares', element: 'Água', desc: 'Canhões de água pura restauram a hidratação.', rarity: 'epica' },
  { name: 'Lagartinha do Orvalho', element: 'Natureza', desc: 'Bebe microgotas depositadas nas pétalas.' },
  
  // 11-20
  { name: 'Crisálida Fluvial', element: 'Água', desc: 'Repousa no fundo dos riachos aguardando a chuva.' },
  { name: 'Borboleta do Lago', element: 'Natureza', desc: 'Suas asas criam pequenas brisas úmidas.' },
  { name: 'Pintinho da Chuva', element: 'Tempestade', desc: 'Canta com alegria sempre que a tempestade chega.' },
  { name: 'Gavião dos Rios', element: 'Água', desc: 'Pesca águas límpidas dos topos montanhosos.' },
  { name: 'Águia da Névoa', element: 'Vapor', desc: 'Cruza os céus anunciando a chuva renovadora.' },
  { name: 'Ratinho da Várzea', element: 'Água', desc: 'Constrói pequenas represas com galhos secos.' },
  { name: 'Castor da Nascente', element: 'Água', desc: 'Protetor incansável das fontes de água pura.' },
  { name: 'Gaivota das Marés', element: 'Água', desc: 'Segue o ritmo calmo das marés oceânicas.' },
  { name: 'Pelicano da Chuva', element: 'Água', desc: 'Armazena litros de água pura em seu bico.' },
  { name: 'Cobrinha d\'Água', element: 'Água', desc: 'Desliza suavemente pela superfície dos lagos.' },

  // 21-30
  { name: 'Naja dos Corais', element: 'Abissal', desc: 'Guarda recifes de corais brilhantes no mar.' },
  { name: 'Raio d\'Água', element: 'Tempestade', desc: 'Centelha elétrica que energiza a água mineral.', rarity: 'rara' },
  { name: 'Trovão Hidráulico', element: 'Tempestade', desc: 'Eletricidade e hidratação em perfeita sintonia.' },
  { name: 'Tatu da Várzea', element: 'Natureza', desc: 'Escava poços naturais no solo árido.' },
  { name: 'Pangolim de Barro', element: 'Natureza', desc: 'Encontra lençóis freáticos ocultos.' },
  { name: 'Loba das Fontes', element: 'Cristal', desc: 'Uiva quando as nascentes voltam a fluir.' },
  { name: 'Raposa da Geada', element: 'Gelo', desc: 'Seu pelo reluz como gelo ao sol da manhã.' },
  { name: 'Morcego da Caverna Úmida', element: 'Místico', desc: 'Guia viajantes a grutas com estalactites d\'água.' },
  { name: 'Gotinha Azulada', element: 'Água', desc: 'Primeira gota que cai de uma nuvem alta.' },
  { name: 'Gota Resplandecente', element: 'Cristal', desc: 'Refrata as cores do arco-íris ao sol.', rarity: 'rara' },

  // 31-40
  { name: 'Rainha das Fontes', element: 'Místico', desc: 'Soberana de todos os santuários aquíferos.', rarity: 'epica' },
  { name: 'Duende da Lagoa', element: 'Natureza', desc: 'Brinca fazendo ondulações circulares na água.' },
  { name: 'Fada das Cataratas', element: 'Místico', desc: 'Dança entre os arco-íris da queda d\'água.', rarity: 'rara' },
  { name: 'Raposa de Nove Gotas', element: 'Místico', desc: 'Cada cauda carrega uma essência de vitalidade.', rarity: 'epica' },
  { name: 'Pinguim dos Glaciares', element: 'Gelo', desc: 'Desliza sobre o gelo milenar da Antártida.' },
  { name: 'Albatroz Polar', element: 'Gelo', desc: 'Mapeia os icebergs mais puros do planeta.' },
  { name: 'Golfinho Borrifador', element: 'Água', desc: 'Seu salto produz névoa refrescante.' },
  { name: 'Boto dos Encantos', element: 'Místico', desc: 'Lendas dizem que ele cura a sede de quem o vê.', rarity: 'rara' },
  { name: 'Cogumelo Hidratante', element: 'Natureza', desc: 'Absorve umidade da floresta para compartilhar.' },
  { name: 'Fungo Aquático', element: 'Natureza', desc: 'Purifica sedimentos nas margens dos córregos.' },

  // 41-50
  { name: 'Inseto Aquático', element: 'Água', desc: 'Caminha sobre a tensão superficial da água.' },
  { name: 'Libélula das Corredeiras', element: 'Água', desc: 'Pousa calmamente em folhas flutuantes.' },
  { name: 'Caranguejo da Praia', element: 'Água', desc: 'Mede a temperatura das águas rasas.' },
  { name: 'Siri Azul das Pedras', element: 'Água', desc: 'Casca azulada resistente às ondas fortes.' },
  { name: 'Caranguejo Real Gigante', element: 'Abissal', desc: 'Caminha no fundo escuro e calmo do oceano.', rarity: 'rara' },
  { name: 'Esfera Flutuante', element: 'Cristal', desc: 'Bolha mágica de água pura que nunca estoura.' },
  { name: 'Orbe de Safira', element: 'Cristal', desc: 'Condensa umidade do ar instantaneamente.', rarity: 'rara' },
  { name: 'Pato Misterioso', element: 'Místico', desc: 'Tem dores de cabeça se ficar desidratado.' },
  { name: 'Golduck do Igarapé', element: 'Místico', desc: 'Mestre da natação veloz e foco total.', rarity: 'rara' },
  { name: 'Macaco do Rio', element: 'Natureza', desc: 'Lava frutas frescas nas águas correntes.' },

  // 51-60
  { name: 'Guará das Águas Claras', element: 'Água', desc: 'Penas avermelhadas brilhando na lagoa.' },
  { name: 'Cão D\'Água Bravo', element: 'Água', desc: 'Nadador ágil de resgates em mar aberto.' },
  { name: 'Lontra Brincalhona', element: 'Água', desc: 'Dorme de mãos dadas flutuando na água.' },
  { name: 'Ariranha do Pantanal', element: 'Água', desc: 'Comanda as curvas dos grandes rios.', rarity: 'rara' },
  { name: 'Tigre das Fontes', element: 'Água', desc: 'Gosta de se banhar nas tardes de calor.' },
  { name: 'Girino Enérgico', element: 'Água', desc: 'Nenhum peixe o alcança na corrida aquática.' },
  { name: 'Sapo da Chuva', element: 'Natureza', desc: 'Canto que ecoa quando o céu começa a fechar.' },
  { name: 'Sapo Guardião', element: 'Água', desc: 'Protege poços artesianos da poluição.', rarity: 'rara' },
  { name: 'Mago dos Córregos', element: 'Místico', desc: 'Manipula o fluxo hídrico com a mente.' },
  { name: 'Alquimista da Hidratação', element: 'Cristal', desc: 'Transforma água comum em elixir supremo.', rarity: 'epica' },

  // 61-70
  { name: 'Guardião dos Quatro Rios', element: 'Água', desc: 'Quatro braços que guiam os pontos cardeais.', rarity: 'epica' },
  { name: 'Peixinho Dourado', element: 'Água', desc: 'Traz boa sorte e hidratação a quem o avista.' },
  { name: 'Peixe-Anjo Cristal', element: 'Cristal', desc: 'Barbatanas transparentes como vidro.' },
  { name: 'Carpa Saltitante', element: 'Água', desc: 'Treina saltos diários rumo à cachoeira.' },
  { name: 'Gyarados dos Mares Bravios', element: 'Abissal', desc: 'Evolução da persistência na hidratação.', rarity: 'epica' },
  { name: 'Água-Viva Bioluminescente', element: 'Abissal', desc: 'Acende luzes azuis nas profundezas oceânicas.' },
  { name: 'Caravela-Mística', element: 'Místico', desc: 'Flutua entre a água e o ar com encanto.' },
  { name: 'Pólipo de Coral', element: 'Natureza', desc: 'Constrói fortalezas submarinas de cálcio.' },
  { name: 'Estrela-do-Mar Azul', element: 'Água', desc: 'Regenera sua energia ao repousar na água limpa.' },
  { name: 'Estrela Solar Aquática', element: 'Cristal', desc: 'Brilha como o sol filtrado pela água.', rarity: 'rara' },

  // 71-80
  { name: 'Cavalo-Marinho Alado', element: 'Água', desc: 'Dança entre as algas verdejantes.' },
  { name: 'Dragão-Marinho Folhoso', element: 'Natureza', desc: 'Mimetiza folhas marinhas com maestria.', rarity: 'rara' },
  { name: 'Polvo dos Recifes', element: 'Água', desc: 'Oito tentáculos para servir copos d\'água.' },
  { name: 'Kraken dos Estreitos', element: 'Abissal', desc: 'Cria redemoinhos de água cristalina.', rarity: 'epica' },
  { name: 'Foca do Ártico', element: 'Gelo', desc: 'Mergulha em águas geladas com grande alegria.' },
  { name: 'Leão-Marinho Guardião', element: 'Gelo', desc: 'Defende praias e baías tranquilas.', rarity: 'rara' },
  { name: 'Morsa de Marfim', element: 'Gelo', desc: 'Quebra placas de gelo para liberar água doce.', rarity: 'rara' },
  { name: 'Plâncton Iluminado', element: 'Místico', desc: 'Milhões de pontos de luz nas marés noturnas.' },
  { name: 'Néctar de Gotas', element: 'Natureza', desc: 'Bebida milagrosa que sacia qualquer cansaço.' },
  { name: 'Ostra da Pérola Negra', element: 'Abissal', desc: 'Cultiva pérolas nas águas mais calmas.', rarity: 'rara' },

  // 81-90
  { name: 'Marisco Reluzente', element: 'Cristal', desc: 'Abre suas conchas para captar chuva fresca.' },
  { name: 'Molusco Blindado', element: 'Abissal', desc: 'Concha inquebrável protegendo seu frescor.' },
  { name: 'Caracol das Encostas Úmidas', element: 'Natureza', desc: 'Caminha deixando um rastro de hidratação.' },
  { name: 'Ammonite Fóssil', element: 'Abissal', desc: 'Testemunha das eras em que o mundo era puro oceano.', rarity: 'rara' },
  { name: 'Kabuto Primitivo', element: 'Abissal', desc: 'Resistiu a milhões de anos no fundo marinho.', rarity: 'rara' },
  { name: 'Trilobita das Trincheiras', element: 'Abissal', desc: 'Explorador das zonas abissais mais escuras.' },
  { name: 'Baiacu Espinhoso', element: 'Água', desc: 'Infla com 1 litro de água quando se assusta.' },
  { name: 'Peixe-Balão Cristalino', element: 'Cristal', desc: 'Espinhos translúcidos cheios de água pura.' },
  { name: 'Raia das Areias', element: 'Água', desc: 'Flutua sobre o fundo arenoso do mar calmo.' },
  { name: 'Manta Majestosa', element: 'Água', desc: 'Navega majestosamente como um pássaro aquático.', rarity: 'rara' },

  // 91-100
  { name: 'Tubarão de Pontas Azuis', element: 'Água', desc: 'Guardião veloz do equilíbrio ecológico.' },
  { name: 'Tubarão dos Abismos', element: 'Abissal', desc: 'Visão infravermelha nas fossas oceânicas.', rarity: 'rara' },
  { name: 'Baleia Jubarte Serena', element: 'Água', desc: 'Canto que acalma mares agitados.', rarity: 'epica' },
  { name: 'Cachalote das Fendas', element: 'Abissal', desc: 'Mergulha a 3000 metros de profundidade.', rarity: 'epica' },
  { name: 'Narval do Chifre de Cristal', element: 'Gelo', desc: 'Seu corno purifica a água que toca.', rarity: 'rara' },
  { name: 'Beluga Sorridente', element: 'Gelo', desc: 'Comunica-se por ecolocalização límpida.' },
  { name: 'Orca Rainha dos Mares', element: 'Gelo', desc: 'Comanda alcateias marinhas nos polos.', rarity: 'epica' },
  { name: 'Espírito do Riacho', element: 'Natureza', desc: 'Sussurra conselhos aos sedentos.' },
  { name: 'Senhor dos Lençóis Freáticos', element: 'Natureza', desc: 'Distribui água subterrânea a todos os continentes.', rarity: 'epica' },
  { name: 'Elemental da Gota Perfeita', element: 'Cristal', desc: 'A forma pura da molécula H2O em harmonia.', rarity: 'rara' },

  // 101-110
  { name: 'Ninfa das Marés Altas', element: 'Água', desc: 'Ergue o nível das águas com a lua.' },
  { name: 'Sereia das Canções Cristalinas', element: 'Místico', desc: 'Sua voz lembra o som suave da chuva caindo.', rarity: 'rara' },
  { name: 'Tritão das Três Pontas', element: 'Água', desc: 'Porta um tridente que abre novas fontes.', rarity: 'rara' },
  { name: 'Enguia Elétrica dos Rios', element: 'Tempestade', desc: 'Cargas que aceleram a eletrólise natural.' },
  { name: 'Enguia de Vidro', element: 'Cristal', desc: 'Corpo quase 100% transparente como a água.' },
  { name: 'Moreia das Grutas', element: 'Abissal', desc: 'Observa os visitantes dos túneis marinhos.' },
  { name: 'Salmão Contra a Corrente', element: 'Água', desc: 'Símbolo da perseverança e determinação.' },
  { name: 'Truta das Neves', element: 'Gelo', desc: 'Água pura e gelada é sua morada preferida.' },
  { name: 'Barracuda Relâmpago', element: 'Tempestade', desc: 'Atravessa cardumes na velocidade do som.' },
  { name: 'Atum dos Mares Abertos', element: 'Água', desc: 'Nunca para de nadar para se oxigenar.' },

  // 111-120
  { name: 'Lula das Sombras', element: 'Abissal', desc: 'Libera tinta azul que mascara sua fuga.' },
  { name: 'Lula Colossal', element: 'Abissal', desc: 'Olhos do tamanho de pratos nas profundezas.', rarity: 'epica' },
  { name: 'Guardião dos Mananciais', element: 'Natureza', desc: 'Zela pela integridade da mata ciliar.', rarity: 'rara' },
  { name: 'Guará das Águas Doces', element: 'Água', desc: 'Bebe água das nascentes mais puras.' },
  { name: 'Tartaruga de Casco Fóssil', element: 'Abissal', desc: 'Guarda a memória das primeiras chuvas da Terra.', rarity: 'rara' },
  { name: 'Tartaruga de Coral', element: 'Natureza', desc: 'Seu casco abriga um miniecossistema vibrante.' },
  { name: 'Espírito da Geada', element: 'Gelo', desc: 'Desenha cristais de gelo nas janelas de inverno.' },
  { name: 'Golem de Gelo Puro', element: 'Gelo', desc: 'Corpo esculpido em blocos de geleira milenar.', rarity: 'rara' },
  { name: 'Fênix das Águas Quentes', element: 'Vapor', desc: 'Renasce dos vapores purificadores.', rarity: 'epica' },
  { name: 'Vortex Elemental', element: 'Tempestade', desc: 'Redemoinho vivo que renova as águas paradas.', rarity: 'rara' },

  // 121-130
  { name: 'Cristal da Chuva Serena', element: 'Cristal', desc: 'Condensa pensamentos de paz e calma.' },
  { name: 'Pedra de Safira Aquífera', element: 'Cristal', desc: 'Joia que vibra na presença de água potável.', rarity: 'rara' },
  { name: 'Esmeralda dos Pântanos', element: 'Natureza', desc: 'Filtra e limpa as águas turvas das lagoas.' },
  { name: 'Topázio das Correntes', element: 'Tempestade', desc: 'Reflete os relâmpagos da tempestade estival.', rarity: 'rara' },
  { name: 'Ametista das Profundezas', element: 'Místico', desc: 'Gema sagrada usada pelos guardiões abissais.', rarity: 'epica' },
  { name: 'Diamante de Geleira', element: 'Gelo', desc: 'Pressão extrema de séculos condensou este gelo.', rarity: 'epica' },
  { name: 'Vaporizador Celeste', element: 'Vapor', desc: 'Cria nuvens cumulus fofas e brancas.' },
  { name: 'Arco-Íris Líquido', element: 'Cristal', desc: 'A união perfeita da luz solar com a água límpida.', rarity: 'rara' },
  { name: 'Carpa do Dragão', element: 'Místico', desc: 'Ao subir a cachoeira, transforma-se em divindade.', rarity: 'rara' },
  { name: 'Leviatã dos Abismos', element: 'Abissal', desc: 'Guardião ancestral dos fundos mais recônditos.', rarity: 'epica' },

  // 131-140
  { name: 'Lapras dos Glaciares', element: 'Gelo', desc: 'Gentil transportador dos mares polares.', rarity: 'epica' },
  { name: 'Ditto da Água Maleável', element: 'Água', desc: 'Adapta sua forma a qualquer copo ou recipiente.' },
  { name: 'Eevee da Nascente', element: 'Natureza', desc: 'Sente a pureza da água antes de qualquer um.' },
  { name: 'Vaporeon Cristalino', element: 'Água', desc: 'Fundiu suas células perfeitamente à água líquida.', rarity: 'epica' },
  { name: 'Jolteon da Trovoada Hídrica', element: 'Tempestade', desc: 'Carga que ioniza a água para alta absorção.', rarity: 'rara' },
  { name: 'Flareon das Termas Quentes', element: 'Vapor', desc: 'Mantém o chá e a água na temperatura ideal.', rarity: 'rara' },
  { name: 'Porygon Hidrométrico', element: 'Cristal', desc: 'Mede mililitros com precisão digital absoluta.' },
  { name: 'Omanyte da Espiral Azul', element: 'Abissal', desc: 'Concha espiralada com a proporção áurea hídrica.' },
  { name: 'Omastar dos Oceanos Antigos', element: 'Abissal', desc: 'Nadador implacável das eras paleozoicas.', rarity: 'rara' },
  { name: 'Kabutops Ceifador das Ondas', element: 'Abissal', desc: 'Lâminas afiadas que cortam a resistência d\'água.', rarity: 'rara' },

  // 141-151 (The High Tier & Legendaries!)
  { name: 'Aerodactyl da Chuva Primordial', element: 'Tempestade', desc: 'Planava sob os primeiros dilúvios do planeta.', rarity: 'epica' },
  { name: 'Snorlax do Sono Hidratado', element: 'Água', desc: 'Dormir bem e acordar com 500ml de água é sua regra.', rarity: 'rara' },
  { name: 'Dragonair das Névoas Alvas', element: 'Místico', desc: 'Orbes azuis que controlam o clima e as chuvas.', rarity: 'epica' },
  { name: 'Dragonite Mensageiro dos Mares', element: 'Tempestade', desc: 'Resgata marinheiros e conduz a portos seguros.', rarity: 'epica' },
  { name: 'Articuno Congelante', element: 'Gelo', desc: 'Pássaro lendário que sopra o sopro do gelo eterno.', rarity: 'lendaria' },
  { name: 'Zapdos da Tempestade d\'Água', element: 'Tempestade', desc: 'Ave lendária que comanda os raios e as chuvas torrenciais.', rarity: 'lendaria' },
  { name: 'Moltres do Vapor Sagrado', element: 'Vapor', desc: 'Ave lendária cujo calor purifica qualquer impureza.', rarity: 'lendaria' },
  { name: 'Kyogre Despertado', element: 'Água', desc: 'Titã primordial que expandiu todos os oceanos do mundo.', rarity: 'lendaria' },
  { name: 'Lugia das Correntes Submarinas', element: 'Abissal', desc: 'Guardião dos mares cuja batida de asas ergue tufões.', rarity: 'lendaria' },
  { name: 'Mewtwo das Profundezas Cósmicas', element: 'Místico', desc: 'Poder psíquico capaz de controlar o oceano inteiro.', rarity: 'epica' },
  { name: 'Mew Elemental da Pureza', element: 'Místico', desc: 'Contém o DNA de toda a vida nascida na água primordial.', rarity: 'lendaria' }
];

export const ALL_151_CARDS: CardDefinition[] = RAW_CARD_NAMES.map((item, index) => {
  const id = index + 1;
  let rarity: CardRarity = item.rarity || 'comum';
  
  // If not explicitly defined, distribute appropriately so we have a good pool of common and rare
  if (!item.rarity) {
    if (id % 4 === 0) {
      rarity = 'rara';
    } else {
      rarity = 'comum';
    }
  }

  const sellValue = SELL_VALUES[rarity];

  return {
    id,
    name: item.name,
    rarity,
    description: item.desc,
    sellValue
  };
});

export const CARDS_BY_ID = new Map<number, CardDefinition>(
  ALL_151_CARDS.map(c => [c.id, c])
);
