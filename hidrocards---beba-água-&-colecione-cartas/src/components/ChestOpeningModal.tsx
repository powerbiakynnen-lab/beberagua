import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CardDefinition, ChestType } from '../types';
import { CHEST_CONFIGS } from '../utils/lootbox';
import { CardVisual } from './CardVisual';
import { useApp } from '../context/AppContext';
import { playCardFlipSound, playLegendaryRevealSound } from '../utils/audio';
import { Eye, Check, Sparkles } from 'lucide-react';

interface ChestOpeningModalProps {
  chestType: ChestType;
  cards: CardDefinition[];
  onClose: () => void;
}

export const ChestOpeningModal: React.FC<ChestOpeningModalProps> = ({
  chestType,
  cards,
  onClose
}) => {
  const { inventory } = useApp();
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false]);
  const [isRevealedAll, setIsRevealedAll] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'reveal'>('intro');
  const [fullscreenCard, setFullscreenCard] = useState<CardDefinition | null>(null);

  const config = CHEST_CONFIGS[chestType];

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      setPhase('reveal');
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const handleFlipCard = (index: number) => {
    if (flippedCards[index]) return;

    const newFlipped = [...flippedCards];
    newFlipped[index] = true;
    setFlippedCards(newFlipped);

    const card = cards[index];
    if (card.rarity === 'lendaria' || card.rarity === 'epica') {
      playLegendaryRevealSound();
      try {
        confetti({
          particleCount: card.rarity === 'lendaria' ? 70 : 35,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch {
        // ignore
      }
    } else {
      playCardFlipSound();
    }

    if (newFlipped.every(Boolean)) {
      setIsRevealedAll(true);
    }
  };

  const handleRevealAll = () => {
    setFlippedCards([true, true, true]);
    setIsRevealedAll(true);
    playLegendaryRevealSound();
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.55 }
      });
    } catch {
      // ignore
    }
  };

  const allFlipped = flippedCards.every(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-5 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: config.accentColor }}
        />

        {phase === 'intro' ? (
          <div className="py-12 flex flex-col items-center animate-pulse">
            <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-xl border-2 border-white mb-3 animate-bounce">
              <img
                src={config.image}
                alt={config.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 font-display">
              Abrindo {config.name}...
            </h3>
            <p className="text-xs text-sky-600 mt-0.5">
              Sorteando 3 cartas místicas!
            </p>
          </div>
        ) : (
          <div className="w-full z-10">
            {/* Header */}
            <div className="mb-3">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">
                {config.name} Aberto!
              </span>
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {allFlipped ? 'Cartas Desbloqueadas' : 'Toque nas cartas para virar'}
              </h3>
            </div>

            {/* 3D Flipping Cards Row */}
            <div className="grid grid-cols-3 gap-2 my-3 justify-items-center">
              {cards.map((card, index) => {
                const isFlipped = flippedCards[index];
                const currentCount = inventory[card.id] || 1;
                const isDuplicate = currentCount > 1;

                return (
                  <div key={index} className="flex flex-col items-center w-full">
                    {/* 3D Flip Container with Perspective */}
                    <div
                      onClick={() => isFlipped ? setFullscreenCard(card) : handleFlipCard(index)}
                      className="cursor-pointer w-full flex justify-center relative group"
                      style={{ perspective: '1000px' }}
                    >
                      <div
                        className="relative transition-transform duration-700 ease-out"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}
                      >
                        {/* Front Face (Card Back before reveal) */}
                        <div
                          className="w-full"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden'
                          }}
                        >
                          <CardVisual
                            card={card}
                            size="sm"
                            isFlipped={true}
                          />
                        </div>

                        {/* Back Face (Revealed Card Artwork with Shimmer sweep) */}
                        <div
                          className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <CardVisual
                            card={card}
                            size="sm"
                            isFlipped={false}
                            isNew={!isDuplicate}
                          />

                          {/* Shimmer light sweep on flip */}
                          {isFlipped && (
                            <div
                              className="absolute inset-0 pointer-events-none animate-in fade-in duration-500"
                              style={{
                                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0.9) 52%, transparent 60%)',
                                animation: 'shimmerSweep 1s ease-out forwards'
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status pill under card */}
                    <div className="mt-2 h-4 text-center">
                      {isFlipped && (
                        isDuplicate ? (
                          <span className="text-[8px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full inline-block">
                            Repetida (+{card.sellValue})
                          </span>
                        ) : (
                          <span className="text-[8px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full inline-block">
                            Nova!
                          </span>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-3 flex flex-col gap-2">
              {!allFlipped ? (
                <button
                  onClick={handleRevealAll}
                  className="w-full py-2.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Virar Todas as Cartas
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-all hover:brightness-105 active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar na Coleção
                </button>
              )}
            </div>
          </div>
        )}

        {/* Fullscreen Lightbox Modal inside Chest Reveal */}
        {fullscreenCard && (
          <div
            onClick={() => setFullscreenCard(null)}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center max-w-sm w-full cursor-default space-y-4 animate-in zoom-in-95 duration-200"
            >
              <div className="flex justify-center drop-shadow-2xl">
                <CardVisual
                  card={fullscreenCard}
                  size="fullscreen"
                  isNew={!inventory[fullscreenCard.id] || inventory[fullscreenCard.id] <= 1}
                />
              </div>

              <button
                type="button"
                onClick={() => setFullscreenCard(null)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700 shadow-md"
              >
                Voltar ao Baú
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
