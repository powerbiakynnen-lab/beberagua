import React, { useState } from 'react';
import { CardDefinition } from '../types';
import { CardVisual } from './CardVisual';
import { useApp } from '../context/AppContext';
import { RARITY_LABELS, RARITY_COLORS, FRAME_LABELS } from '../data/cards';
import { 
  X, 
  Coins, 
  Check
} from 'lucide-react';

interface CardDetailModalProps {
  card: CardDefinition;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card: initialCard, onClose }) => {
  const {
    inventory,
    sellSingleDuplicate,
    getEffectiveCard
  } = useApp();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const card = getEffectiveCard(initialCard.id);
  const count = inventory[card.id] || 0;
  const isOwned = count > 0;
  const isDuplicate = count > 1;
  const colors = RARITY_COLORS[card.rarity];
  const hasFrame = card.frameStyle && card.frameStyle !== 'classic';

  const handleSellOne = () => {
    const res = sellSingleDuplicate(card.id);
    if (res.success) {
      setSuccessMessage(`1 cópia repetida vendida por +${res.coinsGained} moedas!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-20"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Card Presentation Visual */}
          <div className="shrink-0 flex flex-col items-center">
            <CardVisual
              card={card}
              size="detail"
              duplicateCount={count}
            />
            <div className="mt-2 text-[11px] font-mono text-slate-400">
              {isOwned ? `Você possui ${count} ${count === 1 ? 'cópia' : 'cópias'}` : 'Não descoberta ainda'}
            </div>
          </div>

          {/* Card Details */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-400">
                  #{String(card.id).padStart(3, '0')}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${colors.badgeBg}`}>
                  {RARITY_LABELS[card.rarity]}
                </span>
                {hasFrame && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500 text-white shadow-sm">
                    {FRAME_LABELS[card.frameStyle!]}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white font-display mt-1">
                {card.name}
              </h2>

              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Descrição da Carta
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{card.description}"
                </p>
              </div>
            </div>

            {/* Sell Duplicate Option */}
            {isDuplicate && (
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    Cópia Repetida Disponível
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Você tem {count - 1} repetida(s). Venda por +{card.sellValue} moedas cada!
                  </div>
                </div>

                <button
                  onClick={handleSellOne}
                  className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-amber-500/20 whitespace-nowrap"
                >
                  Vender 1 (+{card.sellValue})
                </button>
              </div>
            )}

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
