export type CardRarity = 'comum' | 'rara' | 'epica' | 'lendaria';

export type CardFrameStyle = 
  | 'classic' 
  | 'foil' 
  | 'pokemon' 
  | 'cosmic' 
  | 'gold_texture' 
  | 'crystal';

export interface CardDefinition {
  id: number;
  name: string;
  rarity: CardRarity;
  description: string;
  sellValue: number;
  frameStyle?: CardFrameStyle;
}

export interface CardVariantInfo {
  frameStyle: CardFrameStyle;
  count: number;
  sellValue: number;
  isDefault: boolean;
}

export interface CardCustomOverride {
  name?: string;
  description?: string;
  rarity?: CardRarity;
  imageUrl?: string;
  frameStyle?: CardFrameStyle;
}

export interface HydrationLog {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  amount: number; // in ml
  label: string;
}

export type ChestType = 'wood' | 'iron' | 'gold';

export interface ChestOdds {
  comum: string;
  rara: string;
  epica: string;
  lendaria: string;
}

export interface ChestConfig {
  type: ChestType;
  name: string;
  cost: number;
  description: string;
  image: string;
  guaranteedText: string;
  accentColor: string;
  odds: ChestOdds;
}

export type SoundEffectType = 
  | 'water_drop'
  | 'crystal_chime'
  | 'ocean_wave'
  | 'water_harp'
  | 'alert_ping';

export interface ReminderSettings {
  enabled: boolean;
  intervalMinutes: number;
  soundType: SoundEffectType;
  volume: number;
  startHour: number;
  endHour: number;
  scheduledTimes: string[];
  useSpecificTimes: boolean;
}
