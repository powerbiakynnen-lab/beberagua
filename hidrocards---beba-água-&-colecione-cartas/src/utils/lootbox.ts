import { CardDefinition, CardRarity, CardFrameStyle, ChestConfig, ChestType } from '../types';
import { ALL_151_CARDS, calculateCardSellValue } from '../data/cards';

export const SPECIAL_FRAMES: CardFrameStyle[] = [
  'foil',
  'pokemon',
  'cosmic',
  'gold_texture',
  'crystal'
];

/**
 * 80% chance sem moldura ('classic'), 20% moldura especial aleatória
 */
export function rollCardFrame(): CardFrameStyle {
  if (Math.random() < 0.8) {
    return 'classic';
  }
  const randomIndex = Math.floor(Math.random() * SPECIAL_FRAMES.length);
  return SPECIAL_FRAMES[randomIndex];
}

export const CHEST_CONFIGS: Record<ChestType, ChestConfig> = {
  wood: {
    type: 'wood',
    name: 'Baú de Madeira',
    cost: 10,
    description: '3 cartas com chances equilibradas. Excelente para iniciar sua coleção!',
    image: '/src/assets/images/chest_wood_1790615686381.jpg',
    guaranteedText: 'Baixa chance de cartas raras ou superiores',
    accentColor: '#b45309',
    odds: {
      comum: '78%',
      rara: '18%',
      epica: '3.5%',
      lendaria: '0.5%'
    }
  },
  iron: {
    type: 'iron',
    name: 'Baú de Metal',
    cost: 20,
    description: 'Contém 3 cartas, garantindo no mínimo 1 carta Rara ou superior!',
    image: '/src/assets/images/chest_iron_1790615698099.jpg',
    guaranteedText: 'Pelo menos 1 carta Rara garantida!',
    accentColor: '#38bdf8',
    odds: {
      comum: '38%',
      rara: '48%',
      epica: '11%',
      lendaria: '3%'
    }
  },
  gold: {
    type: 'gold',
    name: 'Baú de Ouro',
    cost: 30,
    description: 'Baú nobre com 3 cartas de alto nível, garantindo no mínimo 1 carta Épica!',
    image: '/src/assets/images/chest_gold_1790615708197.jpg',
    guaranteedText: 'Pelo menos 1 carta Épica garantida!',
    accentColor: '#f59e0b',
    odds: {
      comum: '0%',
      rara: '40%',
      epica: '48%',
      lendaria: '12%'
    }
  }
};

// Filter cards by rarity pool
const DEFAULT_CARDS_BY_RARITY: Record<CardRarity, CardDefinition[]> = {
  comum: ALL_151_CARDS.filter(c => c.rarity === 'comum'),
  rara: ALL_151_CARDS.filter(c => c.rarity === 'rara'),
  epica: ALL_151_CARDS.filter(c => c.rarity === 'epica'),
  lendaria: ALL_151_CARDS.filter(c => c.rarity === 'lendaria')
};

function getRandomCardFromRarity(rarity: CardRarity, poolByRarity: Record<CardRarity, CardDefinition[]>): CardDefinition {
  const pool = poolByRarity[rarity]?.length ? poolByRarity[rarity] : DEFAULT_CARDS_BY_RARITY[rarity];
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

// Roll a rarity based on custom probability weights
function rollRarity(weights: { comum: number; rara: number; epica: number; lendaria: number }): CardRarity {
  const total = weights.comum + weights.rara + weights.epica + weights.lendaria;
  let random = Math.random() * total;

  if (random < weights.comum) return 'comum';
  random -= weights.comum;

  if (random < weights.rara) return 'rara';
  random -= weights.rara;

  if (random < weights.epica) return 'epica';
  return 'lendaria';
}

/**
 * Draws 3 cards according to the specific chest type specifications
 */
export function openChest(chestType: ChestType, cardPool?: CardDefinition[]): CardDefinition[] {
  const poolByRarity: Record<CardRarity, CardDefinition[]> = cardPool ? {
    comum: cardPool.filter(c => c.rarity === 'comum'),
    rara: cardPool.filter(c => c.rarity === 'rara'),
    epica: cardPool.filter(c => c.rarity === 'epica'),
    lendaria: cardPool.filter(c => c.rarity === 'lendaria')
  } : DEFAULT_CARDS_BY_RARITY;

  const getCard = (rarity: CardRarity) => getRandomCardFromRarity(rarity, poolByRarity);
  const result: CardDefinition[] = [];

  switch (chestType) {
    case 'wood': {
      // Baú de madeira: 10 moedas. Baixa chance de raridade alta.
      // 3 cartas com chances: Comum 78%, Rara 18%, Épica 3.5%, Lendária 0.5%
      for (let i = 0; i < 3; i++) {
        const rarity = rollRarity({ comum: 78, rara: 18, epica: 3.5, lendaria: 0.5 });
        result.push(getCard(rarity));
      }
      break;
    }

    case 'iron': {
      // Baú de ferro/metal: 20 moedas. Pelo menos 1 carta rara (ou superior) garantida.
      // Carta 1: Garantida Rara+ (78% Rara, 18% Épica, 4% Lendária)
      const guaranteedRarity = rollRarity({ comum: 0, rara: 78, epica: 18, lendaria: 4 });
      result.push(getCard(guaranteedRarity));

      // Cartas 2 e 3: Comum 58%, Rara 32%, Épica 8%, Lendária 2%
      for (let i = 0; i < 2; i++) {
        const rarity = rollRarity({ comum: 58, rara: 32, epica: 8, lendaria: 2 });
        result.push(getCard(rarity));
      }
      break;
    }

    case 'gold': {
      // Baú de ouro: 30 moedas. Pelo menos 1 carta Épica (ou Lendária) garantida!
      // Carta 1: Garantida Épica ou Lendária (82% Épica, 18% Lendária)
      const guaranteedRarity = rollRarity({ comum: 0, rara: 0, epica: 82, lendaria: 18 });
      result.push(getCard(guaranteedRarity));

      // Cartas 2 e 3: Sem comuns! 60% Rara, 31% Épica, 9% Lendária
      for (let i = 0; i < 2; i++) {
        const rarity = rollRarity({ comum: 0, rara: 60, epica: 31, lendaria: 9 });
        result.push(getCard(rarity));
      }
      break;
    }
  }

  const cardsWithFrames = result.map(baseCard => {
    const frameStyle = rollCardFrame();
    return {
      ...baseCard,
      frameStyle,
      sellValue: calculateCardSellValue(baseCard.rarity, frameStyle)
    };
  });

  return cardsWithFrames;
}
