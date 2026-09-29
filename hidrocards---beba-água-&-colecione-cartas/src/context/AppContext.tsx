import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CardDefinition, CardCustomOverride, CardFrameStyle, CardVariantInfo, ChestType, HydrationLog, ReminderSettings } from '../types';
import { ALL_151_CARDS, CARDS_BY_ID, SELL_VALUES, calculateCardSellValue } from '../data/cards';
import { CHEST_CONFIGS, openChest } from '../utils/lootbox';
import { parseCardsTxt } from '../utils/cardsParser';
import {
  playCoinSound,
  playGrandCelebrationSound,
  playMilestoneSound,
  playWaterDropSound,
  playChestUnlockSound,
  playChestOpenBurstSound
} from '../utils/audio';

interface AppContextType {
  // Hydration state
  dailyGoal: number;
  todayLogs: HydrationLog[];
  todayTotalMl: number;
  todayPercent: number;
  claimedMilestonesToday: number[];
  logs: HydrationLog[];
  quickIntakeAmounts: number[];
  addWater: (amount: number, label?: string, isManual?: boolean) => { earnedCoins: number; hitMilestones: number[] };
  deleteLog: (logId: string) => void;
  updateDailyGoal: (goal: number) => void;

  // Economy & Chests
  coins: number;
  addCoins: (amount: number) => void;
  buyAndOpenChest: (chestType: ChestType) => { success: boolean; cards?: CardDefinition[]; error?: string };
  
  // Cards & Inventory
  inventory: Record<number, number>;
  totalUniqueCards: number;
  customCardImages: Record<number, string>;
  cardOverrides: Record<number, CardCustomOverride>;
  cardVariants: Record<number, Partial<Record<CardFrameStyle, number>>>;
  defaultDisplayFrames: Record<number, CardFrameStyle>;
  getCardVariants: (cardId: number) => CardVariantInfo[];
  getCardVariantCount: (cardId: number, frameStyle: CardFrameStyle) => number;
  setDefaultDisplayFrame: (cardId: number, frame: CardFrameStyle) => void;
  saveCardOverride: (cardId: number, override: CardCustomOverride) => void;
  resetCardOverride: (cardId: number) => void;
  getEffectiveCard: (cardId: number) => CardDefinition;
  allEffectiveCards: CardDefinition[];
  setCardCustomImage: (cardId: number, image: string | null) => void;
  sellVariantDuplicate: (cardId: number, frameStyle: CardFrameStyle) => { success: boolean; coinsGained: number };
  sellSingleDuplicate: (cardId: number) => { success: boolean; coinsGained: number };
  sellAllDuplicates: () => { soldCount: number; coinsGained: number };
  getDuplicateStats: () => { totalDuplicates: number; totalValue: number };

  // Reminders & Alarms
  reminderSettings: ReminderSettings;
  updateReminderSettings: (settings: Partial<ReminderSettings>) => void;
  lastDrinkTimestamp: number | null;

  // Recent Toast / Milestone Event
  lastRewardCelebration: { coins: number; milestone: number } | null;
  clearCelebration: () => void;
}

const STORAGE_KEYS = {
  COINS: 'hidrocards_coins_v1',
  GOAL: 'hidrocards_daily_goal_v1',
  LOGS: 'hidrocards_logs_v1',
  MILESTONES: 'hidrocards_milestones_v1',
  INVENTORY: 'hidrocards_inventory_v1',
  CUSTOM_IMAGES: 'hidrocards_custom_images_v1',
  CARD_OVERRIDES: 'hidrocards_card_overrides_v1',
  CARD_VARIANTS: 'hidrocards_card_variants_v1',
  DEFAULT_DISPLAY_FRAMES: 'hidrocards_default_frames_v1',
  QUICK_AMOUNTS: 'hidrocards_quick_amounts_v1',
  REMINDERS: 'hidrocards_reminders_v1',
  LAST_DRINK: 'hidrocards_last_drink_v1'
};

const DEFAULT_REMINDERS: ReminderSettings = {
  enabled: true,
  intervalMinutes: 60,
  soundType: 'crystal_chime',
  volume: 0.8,
  startHour: 8,
  endHour: 22,
  scheduledTimes: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  useSpecificTimes: false
};

const DEFAULT_QUICK_AMOUNTS = [150, 250, 350, 500];

const AppContext = createContext<AppContextType | null>(null);

function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COINS);
    return saved !== null ? parseInt(saved, 10) : 30;
  });

  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOAL);
    return saved !== null ? parseInt(saved, 10) : 2000;
  });

  const [logs, setLogs] = useState<HydrationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  // Quick drink amounts queue (4 positions FIFO buffer)
  const [quickIntakeAmounts, setQuickIntakeAmounts] = useState<number[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUICK_AMOUNTS);
    if (!saved) return DEFAULT_QUICK_AMOUNTS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length === 4 ? parsed : DEFAULT_QUICK_AMOUNTS;
    } catch {
      return DEFAULT_QUICK_AMOUNTS;
    }
  });

  const [claimedMilestones, setClaimedMilestones] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    if (!saved) return {};
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  });

  const [inventory, setInventory] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (!saved) {
      return { 1: 1, 7: 1, 29: 1 };
    }
    try {
      return JSON.parse(saved);
    } catch {
      return { 1: 1, 7: 1, 29: 1 };
    }
  });

  // Variants per card: cardId -> { [frameStyle]: count }
  const [cardVariants, setCardVariants] = useState<Record<number, Partial<Record<CardFrameStyle, number>>>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CARD_VARIANTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Migration from existing inventory
    const savedInv = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (savedInv) {
      try {
        const parsedInv = JSON.parse(savedInv);
        const migrated: Record<number, Partial<Record<CardFrameStyle, number>>> = {};
        Object.entries(parsedInv).forEach(([idStr, count]) => {
          const id = parseInt(idStr, 10);
          if ((count as number) > 0) {
            migrated[id] = { classic: count as number };
          }
        });
        return migrated;
      } catch {
        // fallback
      }
    }
    return { 1: { classic: 1 }, 7: { classic: 1 }, 29: { classic: 1 } };
  });

  // Default display frame per card in album: cardId -> frameStyle
  const [defaultDisplayFrames, setDefaultDisplayFrames] = useState<Record<number, CardFrameStyle>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEFAULT_DISPLAY_FRAMES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {};
  });

  const [customCardImages, setCustomCardImages] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_IMAGES);
    if (!saved) return {};
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  });

  // Card overrides (name, description, rarity, frameStyle, imageUrl)
  const [cardOverrides, setCardOverrides] = useState<Record<number, CardCustomOverride>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CARD_OVERRIDES);
    if (!saved) return {};
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  });

  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!saved) return DEFAULT_REMINDERS;
    try {
      return { ...DEFAULT_REMINDERS, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_REMINDERS;
    }
  });

  const [lastDrinkTimestamp, setLastDrinkTimestamp] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_DRINK);
    return saved ? parseInt(saved, 10) : null;
  });

  const [lastRewardCelebration, setLastRewardCelebration] = useState<{
    coins: number;
    milestone: number;
  } | null>(null);

  // Sync to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COINS, coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOAL, dailyGoal.toString());
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUICK_AMOUNTS, JSON.stringify(quickIntakeAmounts));
  }, [quickIntakeAmounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(claimedMilestones));
  }, [claimedMilestones]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARD_VARIANTS, JSON.stringify(cardVariants));
  }, [cardVariants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEFAULT_DISPLAY_FRAMES, JSON.stringify(defaultDisplayFrames));
  }, [defaultDisplayFrames]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_IMAGES, JSON.stringify(customCardImages));
  }, [customCardImages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARD_OVERRIDES, JSON.stringify(cardOverrides));
  }, [cardOverrides]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminderSettings));
  }, [reminderSettings]);

  useEffect(() => {
    if (lastDrinkTimestamp) {
      localStorage.setItem(STORAGE_KEYS.LAST_DRINK, lastDrinkTimestamp.toString());
    }
  }, [lastDrinkTimestamp]);

  // Derived calculations for today
  const todayStr = getTodayDateStr();
  const todayLogs = logs.filter(l => l.dateStr === todayStr);
  const todayTotalMl = todayLogs.reduce((acc, l) => acc + l.amount, 0);

  // Exact percentage: 100% when reaching goal, >100% when exceeding goal!
  const todayPercent = dailyGoal > 0 ? Math.round((todayTotalMl / dailyGoal) * 100) : 0;
  const claimedMilestonesToday = claimedMilestones[todayStr] || [];

  const totalUniqueCards = Object.keys(inventory).filter(id => inventory[parseInt(id, 10)] > 0).length;

  // Database of cards loaded from public/cards.txt (with offline localStorage persistence)
  const [cardsDatabase, setCardsDatabase] = useState<CardDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('hidrocards_txt_cards_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ALL_151_CARDS;
  });

  // Automatically fetch public/cards.txt so user can configure names, rarities, frames and descriptions in text file
  useEffect(() => {
    fetch('/cards.txt')
      .then(res => {
        if (!res.ok) throw new Error('cards.txt not found');
        return res.text();
      })
      .then(text => {
        const parsed = parseCardsTxt(text);
        if (parsed.length > 0) {
          setCardsDatabase(parsed);
          localStorage.setItem('hidrocards_txt_cards_v1', JSON.stringify(parsed));

          // Ensure cardVariants and defaultDisplayFrames reflect special frames configured in cards.txt
          setCardVariants(prev => {
            const updated = { ...prev };
            let changed = false;
            parsed.forEach(c => {
              if (c.frameStyle && c.frameStyle !== 'classic') {
                const cur = updated[c.id] || {};
                // If user owns this card but only had 'classic' recorded:
                if (!cur[c.frameStyle] && cur['classic']) {
                  const count = cur['classic'];
                  updated[c.id] = {
                    ...cur,
                    [c.frameStyle]: count
                  };
                  delete updated[c.id]!['classic'];
                  changed = true;
                }
              }
            });
            return changed ? updated : prev;
          });

          setDefaultDisplayFrames(prev => {
            const updated = { ...prev };
            let changed = false;
            parsed.forEach(c => {
              if (c.frameStyle && c.frameStyle !== 'classic' && !updated[c.id]) {
                updated[c.id] = c.frameStyle;
                changed = true;
              }
            });
            return changed ? updated : prev;
          });
        }
      })
      .catch(() => {
        // Keeps cached/fallback cards
      });
  }, []);

  const cardsDatabaseMap = new Map<number, CardDefinition>(cardsDatabase.map(c => [c.id, c]));

  // Helper to get effective card definition merged with custom override and chosen display frame
  const getEffectiveCard = (cardId: number): CardDefinition => {
    const base = cardsDatabaseMap.get(cardId) || CARDS_BY_ID.get(cardId) || {
      id: cardId,
      name: `Carta #${cardId}`,
      rarity: 'comum' as const,
      description: 'Uma carta misteriosa das fontes cristalinas.',
      sellValue: 1,
      frameStyle: 'classic' as const
    };

    const override = cardOverrides[cardId];
    const chosenFrame: CardFrameStyle = defaultDisplayFrames[cardId] || override?.frameStyle || base.frameStyle || 'classic';
    const rarity = override?.rarity || base.rarity;
    const sellValue = calculateCardSellValue(rarity, chosenFrame);

    return {
      ...base,
      name: override?.name?.trim() ? override.name : base.name,
      description: override?.description !== undefined ? override.description : base.description,
      rarity,
      sellValue,
      frameStyle: chosenFrame
    };
  };

  const getCardVariants = (cardId: number): CardVariantInfo[] => {
    const baseCard = getEffectiveCard(cardId);
    let variants = { ...(cardVariants[cardId] || {}) };
    const totalCount = inventory[cardId] || 0;

    // If card is owned in inventory but variants is empty or only had classic while baseCard has special frame:
    if (totalCount > 0) {
      const targetFrame = defaultDisplayFrames[cardId] || baseCard.frameStyle || 'classic';
      if (Object.keys(variants).length === 0) {
        variants[targetFrame] = totalCount;
      } else if (targetFrame !== 'classic' && !variants[targetFrame] && variants['classic']) {
        variants[targetFrame] = variants['classic'];
        delete variants['classic'];
      }
    }

    const currentDefault = defaultDisplayFrames[cardId] || baseCard.frameStyle || 'classic';

    return Object.entries(variants)
      .filter(([_, count]) => (count || 0) > 0)
      .map(([frame, count]) => {
        const frameStyle = frame as CardFrameStyle;
        return {
          frameStyle,
          count: count || 0,
          sellValue: calculateCardSellValue(baseCard.rarity, frameStyle),
          isDefault: frameStyle === currentDefault
        };
      });
  };

  const getCardVariantCount = (cardId: number, frameStyle: CardFrameStyle): number => {
    const variants = getCardVariants(cardId);
    const found = variants.find(v => v.frameStyle === frameStyle);
    return found ? found.count : 0;
  };

  const setDefaultDisplayFrame = (cardId: number, frame: CardFrameStyle) => {
    setDefaultDisplayFrames(prev => ({
      ...prev,
      [cardId]: frame
    }));
  };

  const allEffectiveCards = cardsDatabase.map(c => getEffectiveCard(c.id));

  const saveCardOverride = (cardId: number, override: CardCustomOverride) => {
    setCardOverrides(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        ...override
      }
    }));

    if (override.imageUrl !== undefined) {
      if (override.imageUrl) {
        setCustomCardImages(prev => ({ ...prev, [cardId]: override.imageUrl! }));
      } else {
        setCustomCardImages(prev => {
          const updated = { ...prev };
          delete updated[cardId];
          return updated;
        });
      }
    }
  };

  const resetCardOverride = (cardId: number) => {
    setCardOverrides(prev => {
      const updated = { ...prev };
      delete updated[cardId];
      return updated;
    });
    setCustomCardImages(prev => {
      const updated = { ...prev };
      delete updated[cardId];
      return updated;
    });
  };

  // Add water log: updates intake, shifts the 4-position quick queue FIFO buffer ONLY if manual
  const addWater = (amount: number, label = 'Gole d\'Água', isManual = false) => {
    const now = Date.now();
    const newLog: HydrationLog = {
      id: `log_${now}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      dateStr: todayStr,
      amount,
      label
    };

    const newLogs = [newLog, ...logs];
    setLogs(newLogs);
    setLastDrinkTimestamp(now);

    // Requested: "a esteira de agua ande somente quando eu digitar manualmente e não quando eu beber dos 4 atalhos."
    if (isManual) {
      setQuickIntakeAmounts(prev => {
        const current = prev.length === 4 ? prev : DEFAULT_QUICK_AMOUNTS;
        // Drop first element, shift remaining forward, place new amount at 4th position
        return [current[1], current[2], current[3], amount];
      });
    }

    playWaterDropSound(reminderSettings.volume);

    const updatedTodayMl = todayTotalMl + amount;
    const newPercent = Math.round((updatedTodayMl / dailyGoal) * 100);

    // Calculate all 10% milestones reached (10, 20, 30... 100, 110, 120, etc.)
    const maxMilestone = Math.min(1000, Math.floor(newPercent / 10) * 10);
    const milestoneSteps: number[] = [];
    for (let s = 10; s <= maxMilestone; s += 10) {
      milestoneSteps.push(s);
    }

    const hitMilestones: number[] = [];
    let coinsEarned = 0;

    const alreadyClaimed = new Set(claimedMilestonesToday);

    milestoneSteps.forEach(step => {
      if (newPercent >= step && !alreadyClaimed.has(step)) {
        hitMilestones.push(step);
        alreadyClaimed.add(step);

        // Moedas são pagas somente até 150% da meta
        if (step <= 150) {
          if (step === 100) {
            coinsEarned += 11; // 1 + 10 bonus
          } else {
            coinsEarned += 1; // 1 coin for every 10% up to 150%
          }
        }
      }
    });

    if (coinsEarned > 0) {
      setCoins(prev => prev + coinsEarned);
      setClaimedMilestones(prev => ({
        ...prev,
        [todayStr]: Array.from(alreadyClaimed)
      }));

      if (hitMilestones.includes(100)) {
        setTimeout(() => playGrandCelebrationSound(reminderSettings.volume), 200);
      } else {
        setTimeout(() => playMilestoneSound(reminderSettings.volume), 200);
      }

      setLastRewardCelebration({
        coins: coinsEarned,
        milestone: Math.max(...hitMilestones)
      });
    }

    return { earnedCoins: coinsEarned, hitMilestones };
  };

  const deleteLog = (logId: string) => {
    setLogs(prev => prev.filter(l => l.id !== logId));
  };

  const updateDailyGoal = (goal: number) => {
    setDailyGoal(Math.max(500, Math.min(6000, goal)));
  };

  const addCoins = (amount: number) => {
    setCoins(prev => prev + amount);
    playCoinSound(reminderSettings.volume);
  };

  const buyAndOpenChest = (chestType: ChestType) => {
    const config = CHEST_CONFIGS[chestType];
    if (coins < config.cost) {
      return { success: false, error: `Moedas insuficientes! Você precisa de ${config.cost} moedas.` };
    }

    setCoins(prev => prev - config.cost);
    playChestUnlockSound(reminderSettings.volume);

    // Draw cards (openChest applies 80% without frame, 20% random special frame, doubled sellValue)
    const cards = openChest(chestType, cardsDatabase);

    // Update variant counts
    setCardVariants(prev => {
      const updatedVariants = { ...prev };
      cards.forEach(card => {
        const frame = card.frameStyle || 'classic';
        const cardVar = { ...(updatedVariants[card.id] || {}) };
        cardVar[frame] = (cardVar[frame] || 0) + 1;
        updatedVariants[card.id] = cardVar;
      });
      return updatedVariants;
    });

    // Update total count per card
    setInventory(prev => {
      const updated = { ...prev };
      cards.forEach(card => {
        updated[card.id] = (updated[card.id] || 0) + 1;
      });
      return updated;
    });

    // If card doesn't have a default display frame yet, set it to the drawn frame
    setDefaultDisplayFrames(prev => {
      const updated = { ...prev };
      cards.forEach(card => {
        if (!updated[card.id]) {
          updated[card.id] = card.frameStyle || 'classic';
        }
      });
      return updated;
    });

    setTimeout(() => {
      playChestOpenBurstSound(reminderSettings.volume);
    }, 300);

    return { success: true, cards };
  };

  const setCardCustomImage = (cardId: number, image: string | null) => {
    saveCardOverride(cardId, { imageUrl: image || '' });
  };

  // Sell 1 duplicate copy of a specific frame variant
  // Framed cards sell for DOUBLE of non-framed cards
  const sellVariantDuplicate = (cardId: number, frameStyle: CardFrameStyle) => {
    const totalCopies = inventory[cardId] || 0;
    const variantCount = cardVariants[cardId]?.[frameStyle] || 0;

    if (totalCopies <= 1 || variantCount <= 0) {
      return { success: false, coinsGained: 0 };
    }

    const card = getEffectiveCard(cardId);
    const coinsGained = calculateCardSellValue(card.rarity, frameStyle);

    setCardVariants(prev => {
      const updated = { ...prev };
      const current = { ...(updated[cardId] || {}) };
      const newCount = (current[frameStyle] || 0) - 1;
      if (newCount <= 0) {
        delete current[frameStyle];
      } else {
        current[frameStyle] = newCount;
      }
      updated[cardId] = current;
      return updated;
    });

    setInventory(prev => ({
      ...prev,
      [cardId]: Math.max(1, (prev[cardId] || 1) - 1)
    }));

    // If user sold the last copy of the variant that was default display, switch to another owned variant
    setDefaultDisplayFrames(prev => {
      if (prev[cardId] === frameStyle && variantCount <= 1) {
        const remaining = Object.keys(cardVariants[cardId] || {}).filter(f => f !== frameStyle) as CardFrameStyle[];
        if (remaining.length > 0) {
          return { ...prev, [cardId]: remaining[0] };
        }
      }
      return prev;
    });

    setCoins(prev => prev + coinsGained);
    playCoinSound(reminderSettings.volume);

    return { success: true, coinsGained };
  };

  const sellSingleDuplicate = (cardId: number) => {
    const totalCopies = inventory[cardId] || 0;
    if (totalCopies <= 1) {
      return { success: false, coinsGained: 0 };
    }

    const variants = cardVariants[cardId] || {};
    const defaultFrame = defaultDisplayFrames[cardId] || 'classic';

    // Prioritize selling a variant that has > 1 copy, or non-default
    const entries = Object.entries(variants).filter(([_, count]) => (count || 0) > 0) as [CardFrameStyle, number][];
    let targetFrame: CardFrameStyle = entries[0]?.[0] || 'classic';

    for (const [f, cnt] of entries) {
      if (cnt > 1) {
        targetFrame = f;
        break;
      } else if (f !== defaultFrame) {
        targetFrame = f;
      }
    }

    return sellVariantDuplicate(cardId, targetFrame);
  };

  const sellAllDuplicates = () => {
    let soldCount = 0;
    let coinsGained = 0;

    const newVariants: Record<number, Partial<Record<CardFrameStyle, number>>> = {};
    const newInventory: Record<number, number> = {};

    Object.entries(cardVariants).forEach(([idStr, variants]) => {
      const cardId = parseInt(idStr, 10);
      const card = getEffectiveCard(cardId);
      const defaultFrame = defaultDisplayFrames[cardId] || 'classic';

      const entries = Object.entries(variants || {}).filter(([_, cnt]) => (cnt || 0) > 0) as [CardFrameStyle, number][];
      const totalCopies = entries.reduce((sum, [_, cnt]) => sum + cnt, 0);

      if (totalCopies <= 1) {
        newVariants[cardId] = variants;
        newInventory[cardId] = totalCopies;
        return;
      }

      // Prioritize keeping the defaultFrame if owned, otherwise the first entry
      const keptFrame: CardFrameStyle = entries.find(([f]) => f === defaultFrame)?.[0] || entries[0][0];

      entries.forEach(([frame, count]) => {
        let countToSell = count;
        if (frame === keptFrame) {
          countToSell = count - 1; // keep 1
        }
        if (countToSell > 0) {
          soldCount += countToSell;
          coinsGained += countToSell * calculateCardSellValue(card.rarity, frame);
        }
      });

      newVariants[cardId] = { [keptFrame]: 1 };
      newInventory[cardId] = 1;
    });

    if (soldCount > 0) {
      setCardVariants(newVariants);
      setInventory(newInventory);
      setCoins(prev => prev + coinsGained);
      playCoinSound(reminderSettings.volume);
    }

    return { soldCount, coinsGained };
  };

  const getDuplicateStats = () => {
    let totalDuplicates = 0;
    let totalValue = 0;

    Object.entries(cardVariants).forEach(([idStr, variants]) => {
      const cardId = parseInt(idStr, 10);
      const card = getEffectiveCard(cardId);
      const defaultFrame = defaultDisplayFrames[cardId] || 'classic';

      const entries = Object.entries(variants || {}).filter(([_, cnt]) => (cnt || 0) > 0) as [CardFrameStyle, number][];
      const totalCopies = entries.reduce((sum, [_, cnt]) => sum + cnt, 0);

      if (totalCopies > 1) {
        const keptFrame: CardFrameStyle = entries.find(([f]) => f === defaultFrame)?.[0] || entries[0][0];
        entries.forEach(([frame, count]) => {
          let extra = count;
          if (frame === keptFrame) {
            extra = count - 1;
          }
          if (extra > 0) {
            totalDuplicates += extra;
            totalValue += extra * calculateCardSellValue(card.rarity, frame);
          }
        });
      }
    });

    return { totalDuplicates, totalValue };
  };

  const updateReminderSettings = (settings: Partial<ReminderSettings>) => {
    setReminderSettings(prev => ({ ...prev, ...settings }));
  };

  const clearCelebration = () => {
    setLastRewardCelebration(null);
  };

  return (
    <AppContext.Provider
      value={{
        dailyGoal,
        todayLogs,
        todayTotalMl,
        todayPercent,
        claimedMilestonesToday,
        logs,
        quickIntakeAmounts,
        addWater,
        deleteLog,
        updateDailyGoal,
        coins,
        addCoins,
        buyAndOpenChest,
        inventory,
        totalUniqueCards,
        customCardImages,
        cardOverrides,
        cardVariants,
        defaultDisplayFrames,
        getCardVariants,
        getCardVariantCount,
        setDefaultDisplayFrame,
        saveCardOverride,
        resetCardOverride,
        getEffectiveCard,
        allEffectiveCards,
        setCardCustomImage,
        sellVariantDuplicate,
        sellSingleDuplicate,
        sellAllDuplicates,
        getDuplicateStats,
        reminderSettings,
        updateReminderSettings,
        lastDrinkTimestamp,
        lastRewardCelebration,
        clearCelebration
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
