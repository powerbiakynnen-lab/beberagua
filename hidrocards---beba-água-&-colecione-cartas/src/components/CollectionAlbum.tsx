import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RARITY_LABELS, calculateCardSellValue } from '../data/cards';
import { CardDefinition, CardRarity, CardFrameStyle } from '../types';
import { CardVisual } from './CardVisual';
import { 
  Coins, 
  Lock, 
  Layers, 
  X,
  Maximize2,
  Check
} from 'lucide-react';

const ALL_FRAME_STYLES: { id: CardFrameStyle; label: string; code: string }[] = [
  { id: 'classic', label: 'Sem Moldura', code: '' },
  { id: 'foil', label: 'Foil', code: 'FL' },
  { id: 'cosmic', label: 'Cósmica', code: 'CM' },
  { id: 'gold_texture', label: 'Ouro', code: 'OU' },
  { id: 'crystal', label: 'Cristal', code: 'CR' },
  { id: 'pokemon', label: 'Vintage', code: 'VT' }
];

export const CollectionAlbum: React.FC = () => {
  const {
    inventory,
    totalUniqueCards,
    allEffectiveCards,
    getEffectiveCard,
    getCardVariants,
    getCardVariantCount,
    setDefaultDisplayFrame,
    defaultDisplayFrames,
    sellVariantDuplicate,
    sellAllDuplicates,
    getDuplicateStats
  } = useApp();

  // Currently inspected card ID for opening variants modal
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // Full-screen card view
  const [fullscreenCard, setFullscreenCard] = useState<CardDefinition | null>(null);

  const [filterMode, setFilterMode] = useState<'all' | 'owned' | 'missing' | 'duplicates'>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | CardRarity>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sellNotice, setSellNotice] = useState<string | null>(null);

  const { totalDuplicates } = getDuplicateStats();

  const handleSellAll = () => {
    const res = sellAllDuplicates();
    if (res.soldCount > 0) {
      setSellNotice(`${res.soldCount} cartas repetidas vendidas por +${res.coinsGained} moedas!`);
      setTimeout(() => setSellNotice(null), 3500);
    }
  };

  const handleCardClick = (card: CardDefinition) => {
    setSelectedCardId(card.id);
  };

  const handleCloseModal = () => {
    setSelectedCardId(null);
  };

  // Filter cards (uses live effective cards so chosen display frames reflect immediately)
  const filteredCards = allEffectiveCards.filter((card) => {
    const count = inventory[card.id] || 0;
    const isOwned = count > 0;
    const isDuplicate = count > 1;

    if (filterMode === 'owned' && !isOwned) return false;
    if (filterMode === 'missing' && isOwned) return false;
    if (filterMode === 'duplicates' && !isDuplicate) return false;

    if (rarityFilter !== 'all' && card.rarity !== rarityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = card.name.toLowerCase().includes(q);
      const matchId = String(card.id).includes(q) || `#${String(card.id).padStart(3, '0')}`.includes(q);
      return matchName || matchId;
    }

    return true;
  });

  const completionPercent = Math.round((totalUniqueCards / 151) * 100);

  const activeCard = selectedCardId ? getEffectiveCard(selectedCardId) : null;
  const activeVariants = selectedCardId ? getCardVariants(selectedCardId) : [];
  const activeTotalCopies = selectedCardId ? (inventory[selectedCardId] || 0) : 0;
  const totalOwnedDistinctVariants = activeVariants.length;

  return (
    <div className="space-y-4 pb-6">
      {/* Album Header & Collection Progress */}
      <div className="rounded-3xl bg-white border border-sky-100 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block">
              Coleção de 151 Cartas
            </span>
            <h2 className="text-base font-bold text-slate-800 font-display">
              {totalUniqueCards} de 151 Descobertas
            </h2>
          </div>

          <div className="w-24">
            <div className="flex justify-between text-[10px] font-bold text-sky-700 mb-1">
              <span>{completionPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sell All Duplicates banner */}
        {totalDuplicates > 0 && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>{totalDuplicates} {totalDuplicates === 1 ? 'repetida disponível' : 'repetidas disponíveis'}</span>
              </div>
            </div>

            <button
              onClick={handleSellAll}
              className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-1 shrink-0"
            >
              <span>Vender Todas</span>
            </button>
          </div>
        )}

        {sellNotice && (
          <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium text-center animate-in fade-in">
            {sellNotice}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou número (#001)..."
            className="w-full h-10 pl-3 pr-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 shadow-xs"
          />
        </div>

        {/* Mode filter tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs gap-1">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 py-1 px-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === 'all'
                ? 'bg-white text-sky-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todas (151)
          </button>
          <button
            onClick={() => setFilterMode('owned')}
            className={`flex-1 py-1 px-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === 'owned'
                ? 'bg-white text-sky-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Obtidas ({totalUniqueCards})
          </button>
          <button
            onClick={() => setFilterMode('missing')}
            className={`flex-1 py-1 px-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === 'missing'
                ? 'bg-white text-sky-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Faltantes ({151 - totalUniqueCards})
          </button>
          <button
            onClick={() => setFilterMode('duplicates')}
            className={`flex-1 py-1 px-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === 'duplicates'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Repetidas ({totalDuplicates})
          </button>
        </div>

        {/* Rarity filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          {(['all', 'comum', 'rara', 'epica', 'lendaria'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={`py-1 px-2.5 rounded-lg border whitespace-nowrap transition-colors ${
                rarityFilter === r
                  ? 'bg-white border-sky-400 text-sky-700 font-bold shadow-xs'
                  : 'bg-white/60 border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              {r === 'all' ? 'Todas' : RARITY_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white border border-slate-200 p-6">
          <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">
            Nenhuma carta encontrada com esses filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 justify-items-center">
          {filteredCards.map((card) => {
            const count = inventory[card.id] || 0;
            const isOwned = count > 0;
            const isDuplicate = count > 1;

            if (isOwned) {
              return (
                <div key={card.id} className="w-full flex justify-center relative group">
                  <CardVisual
                    card={card}
                    size="md"
                    duplicateCount={count}
                    onClick={() => handleCardClick(card)}
                  />

                  {/* Top-Right REPETIDO badge in collection */}
                  {isDuplicate && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-500 text-white font-extrabold text-[8px] uppercase tracking-wider shadow-md z-30 border border-amber-300 pointer-events-none">
                      REPETIDO
                    </div>
                  )}
                </div>
              );
            }

            // Locked card - NÃO exibe o nome da carta não descoberta!
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className="w-full max-w-[120px] h-48 rounded-2xl border border-slate-200 bg-slate-50 p-2 flex flex-col justify-between items-center text-center opacity-70 hover:opacity-100 transition-all cursor-pointer shadow-2xs"
              >
                <div className="w-full flex justify-between items-center text-[9px] text-slate-400">
                  <span className="font-mono">#{String(card.id).padStart(3, '0')}</span>
                  <span className="uppercase text-[8px]">{RARITY_LABELS[card.rarity]}</span>
                </div>

                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center my-auto">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>

                <div className="w-full">
                  <div className="text-[10px] font-bold text-slate-400 font-mono tracking-widest">
                    ???
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Bloqueada
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VARIANTS MODAL (WHITE BACKGROUND, ALL VARIANTS SIDE BY SIDE)              */}
      {/* ========================================================================= */}
      {selectedCardId && activeCard && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 text-slate-800 shadow-2xl relative cursor-default space-y-4 max-h-[92vh] flex flex-col"
          >
            {/* Header: Card number, name and close button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                  #{String(activeCard.id).padStart(3, '0')}
                </span>
                <h3 className="text-base font-bold font-display text-slate-900">
                  {activeTotalCopies > 0 ? activeCard.name : '??? Carta Bloqueada'}
                </h3>
                {activeTotalCopies > 1 && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500 text-white shadow-xs">
                    REPETIDO ({activeTotalCopies} cópias)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-side variants row showing all 6 variants side by side */}
            <div className="flex flex-row items-start justify-start sm:justify-center gap-4 sm:gap-5 overflow-x-auto py-3 px-1 max-w-full">
              {ALL_FRAME_STYLES.map((frameDef) => {
                const variantCard: CardDefinition = {
                  ...activeCard,
                  frameStyle: frameDef.id,
                  sellValue: calculateCardSellValue(activeCard.rarity, frameDef.id)
                };

                // Check how many copies user owns of this specific frame
                const variantOwnedCount = getCardVariantCount(activeCard.id, frameDef.id);
                const isOwned = variantOwnedCount > 0;

                const isSelectedDefault = isOwned && (
                  totalOwnedDistinctVariants === 1 ||
                  (defaultDisplayFrames[activeCard.id] || activeCard.frameStyle || 'classic') === frameDef.id
                );

                return (
                  <div
                    key={frameDef.id}
                    className={`flex flex-col items-center shrink-0 w-32 sm:w-36 transition-all ${
                      isOwned ? 'opacity-100' : 'opacity-40 grayscale contrast-75 brightness-90'
                    }`}
                  >
                    {/* Frame Name directly on top of each card */}
                    <div 
                      className={`text-xs text-center mb-1.5 truncate w-full px-1 ${
                        isOwned ? 'font-bold text-slate-900' : 'font-medium text-slate-400'
                      }`} 
                      title={frameDef.label}
                    >
                      <span>{frameDef.label}</span>
                    </div>

                    {/* The Card Visual - Clicking discovered card opens FULL SCREEN */}
                    <div 
                      className="w-full flex justify-center relative group"
                      onClick={() => {
                        if (isOwned) {
                          setFullscreenCard(variantCard);
                        }
                      }}
                    >
                      <CardVisual
                        card={variantCard}
                        size="md"
                        isLocked={!isOwned}
                        duplicateCount={isOwned ? variantOwnedCount : 0}
                      />

                      {/* Hint overlay on hover for discovered cards */}
                      {isOwned && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity pointer-events-none">
                          <span className="p-1.5 rounded-full bg-white/90 text-slate-800 shadow-md">
                            <Maximize2 className="w-4 h-4" />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Below Card: Radio Button for owned cards, or locked tag */}
                    {isOwned ? (
                      <>
                        {/* Radio button underneath card to select default */}
                        <label
                          onClick={() => setDefaultDisplayFrame(activeCard.id, frameDef.id)}
                          className={`w-full mt-2 py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            isSelectedDefault
                              ? 'bg-sky-50 border-sky-500 text-sky-800 font-bold shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 font-medium'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`default-card-${activeCard.id}`}
                            checked={isSelectedDefault}
                            onChange={() => setDefaultDisplayFrame(activeCard.id, frameDef.id)}
                            className="w-3.5 h-3.5 text-sky-600 accent-sky-500 cursor-pointer"
                          />
                          <span className="text-[11px] whitespace-nowrap">
                            {isSelectedDefault ? 'Padrão' : 'Definir'}
                          </span>
                        </label>

                        {/* Sell Duplicate button underneath if this variant has duplicate copies */}
                        {variantOwnedCount > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const res = sellVariantDuplicate(activeCard.id, frameDef.id);
                              if (res.success) {
                                setSellNotice(`1 cópia repetida vendida por +${res.coinsGained} moedas!`);
                                setTimeout(() => setSellNotice(null), 3500);
                              }
                            }}
                            className="w-full mt-1.5 py-1.5 px-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-bold text-[10px] shadow-xs transition-all flex items-center justify-center gap-1"
                          >
                            <Coins className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Vender (+{variantCard.sellValue})</span>
                          </button>
                        )}
                      </>
                    ) : (
                      /* Locked status indicator below unowned card */
                      <div className="w-full mt-2 py-1.5 px-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-semibold text-center flex items-center justify-center gap-1 select-none">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Bloqueada</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Close Button */}
            <div className="pt-2 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto sm:px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL SCREEN LIGHTBOX MODAL (DISCOVERED CARDS SHOWCASE)                     */}
      {/* ========================================================================= */}
      {fullscreenCard && (
        <div
          onClick={() => setFullscreenCard(null)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center max-w-sm w-full cursor-default space-y-4 animate-in zoom-in-95 duration-200"
          >
            {/* Fullscreen Card Visual */}
            <div className="flex justify-center drop-shadow-2xl">
              <CardVisual
                card={fullscreenCard}
                size="fullscreen"
                duplicateCount={getCardVariantCount(fullscreenCard.id, fullscreenCard.frameStyle || 'classic')}
              />
            </div>

            {/* Controls Below Fullscreen Card */}
            <div className="w-full flex flex-col gap-2">
              {/* Set as Default button */}
              <button
                type="button"
                onClick={() => {
                  setDefaultDisplayFrame(fullscreenCard.id, fullscreenCard.frameStyle || 'classic');
                }}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                  (defaultDisplayFrames[fullscreenCard.id] || 'classic') === (fullscreenCard.frameStyle || 'classic')
                    ? 'bg-sky-500 text-white'
                    : 'bg-white/90 hover:bg-white text-slate-800'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {(defaultDisplayFrames[fullscreenCard.id] || 'classic') === (fullscreenCard.frameStyle || 'classic')
                    ? 'Padrão da Coleção Ativo'
                    : 'Definir como Padrão na Coleção'}
                </span>
              </button>

              {/* If duplicates exist, Sell button */}
              {getCardVariantCount(fullscreenCard.id, fullscreenCard.frameStyle || 'classic') > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const res = sellVariantDuplicate(fullscreenCard.id, fullscreenCard.frameStyle || 'classic');
                    if (res.success) {
                      setSellNotice(`1 cópia repetida vendida por +${res.coinsGained} moedas!`);
                      setTimeout(() => setSellNotice(null), 3500);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Coins className="w-4 h-4" />
                  <span>Vender 1 Cópia Repetida (+{fullscreenCard.sellValue} moedas)</span>
                </button>
              )}

              {/* Close Fullscreen Button */}
              <button
                type="button"
                onClick={() => setFullscreenCard(null)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700"
              >
                Fechar Tela Cheia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
