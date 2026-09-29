import { CardDefinition, CardRarity, CardFrameStyle } from '../types';
import { SELL_VALUES } from '../data/cards';

const RARITY_MAP: Record<string, CardRarity> = {
  comum: 'comum',
  rara: 'rara',
  epica: 'epica',
  épica: 'epica',
  lendaria: 'lendaria',
  lendária: 'lendaria'
};

const FRAME_MAP: Record<string, CardFrameStyle> = {
  classica: 'classic',
  clássica: 'classic',
  classic: 'classic',
  foil: 'foil',
  pokemon: 'pokemon',
  pokémon: 'pokemon',
  cosmica: 'cosmic',
  cósmica: 'cosmic',
  cosmic: 'cosmic',
  ouro_texturizado: 'gold_texture',
  ouro: 'gold_texture',
  gold_texture: 'gold_texture',
  gold: 'gold_texture',
  cristal: 'crystal',
  crystal: 'crystal'
};

export function parseCardsTxt(content: string): CardDefinition[] {
  const lines = content.split('\n');
  const cards: CardDefinition[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 3) {
      const id = parseInt(parts[0], 10);
      if (isNaN(id)) continue;

      const name = parts[1] || `Carta #${id}`;
      const rarityRaw = (parts[2] || 'comum').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const rarity: CardRarity = RARITY_MAP[rarityRaw] || 'comum';

      const frameRaw = (parts[3] || 'classica').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const frameStyle: CardFrameStyle = FRAME_MAP[frameRaw] || 'classic';

      const description = parts[4] || 'Uma carta especial da coleção HidroCards.';
      const sellValue = SELL_VALUES[rarity] || 1;

      cards.push({
        id,
        name,
        rarity,
        frameStyle,
        description,
        sellValue
      });
    }
  }

  return cards;
}
