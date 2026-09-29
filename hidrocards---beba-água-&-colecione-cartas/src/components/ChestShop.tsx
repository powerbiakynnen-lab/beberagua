import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CHEST_CONFIGS } from '../utils/lootbox';
import { ChestType, CardDefinition } from '../types';
import { Coins, Sparkles, Check, HelpCircle } from 'lucide-react';
import { ChestOpeningModal } from './ChestOpeningModal';

export const ChestShop: React.FC = () => {
  const { coins, buyAndOpenChest } = useApp();
  const [openingChestType, setOpeningChestType] = useState<ChestType | null>(null);
  const [drawnCards, setDrawnCards] = useState<CardDefinition[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showOddsModal, setShowOddsModal] = useState(false);

  const handleOpenChest = (type: ChestType) => {
    setErrorMessage(null);
    const result = buyAndOpenChest(type);
    if (!result.success) {
      setErrorMessage(result.error || 'Não foi possível abrir o baú.');
      return;
    }

    if (result.cards) {
      setOpeningChestType(type);
      setDrawnCards(result.cards);
    }
  };

  const handleCloseOpening = () => {
    setOpeningChestType(null);
    setDrawnCards(null);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Shop Header & Balance */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
            Loja de Baús Mágicos
          </span>
          <h2 className="text-base font-bold text-slate-800 font-display">
            Colecione 151 Cartas
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-amber-300 shadow-xs">
          <Coins className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          <span className="font-mono text-base font-extrabold text-amber-800 tabular-nums">
            {coins}
          </span>
          <span className="text-[10px] text-amber-600 font-bold uppercase">
            Moedas
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 text-xs underline font-bold ml-2"
          >
            Fechar
          </button>
        </div>
      )}

      {/* 3 Chests Stack */}
      <div className="space-y-3">
        {/* Baú de Madeira */}
        <div className="rounded-3xl bg-white border border-amber-100 p-4 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all">
          <div className="flex gap-3">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-amber-50 shrink-0 border border-amber-200 shadow-xs">
              <img
                src={CHEST_CONFIGS.wood.image}
                alt={CHEST_CONFIGS.wood.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    {CHEST_CONFIGS.wood.name}
                  </h3>
                  <div className="flex items-center gap-1 font-mono font-bold text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Coins className="w-3 h-3 text-amber-500" />
                    {CHEST_CONFIGS.wood.cost}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {CHEST_CONFIGS.wood.description}
                </p>
              </div>

              {/* Exact chances displayed directly on chest card */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Chances por carta:
                </span>
                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
                  <div className="bg-slate-50 py-0.5 rounded border border-slate-200 text-slate-700">
                    <span className="text-[8px] font-sans text-slate-400 block">Comum</span>
                    {CHEST_CONFIGS.wood.odds.comum}
                  </div>
                  <div className="bg-sky-50 py-0.5 rounded border border-sky-200 text-sky-700 font-bold">
                    <span className="text-[8px] font-sans text-sky-500 block">Rara</span>
                    {CHEST_CONFIGS.wood.odds.rara}
                  </div>
                  <div className="bg-pink-50 py-0.5 rounded border border-pink-200 text-pink-700 font-bold">
                    <span className="text-[8px] font-sans text-pink-500 block">Épica</span>
                    {CHEST_CONFIGS.wood.odds.epica}
                  </div>
                  <div className="bg-amber-50 py-0.5 rounded border border-amber-200 text-amber-700 font-bold">
                    <span className="text-[8px] font-sans text-amber-500 block">Lend.</span>
                    {CHEST_CONFIGS.wood.odds.lendaria}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleOpenChest('wood')}
            disabled={coins < CHEST_CONFIGS.wood.cost}
            className={`w-full mt-3 py-2.5 px-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              coins >= CHEST_CONFIGS.wood.cost
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs active:scale-98'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Abrir Baú ({CHEST_CONFIGS.wood.cost} Moedas)
          </button>
        </div>

        {/* Baú de Ferro / Metal */}
        <div className="rounded-3xl bg-white border-2 border-sky-300 p-4 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-sky-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-bl-xl shadow-xs">
            Rara Garantida
          </div>

          <div className="flex gap-3">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-sky-50 shrink-0 border border-sky-200 shadow-xs">
              <img
                src={CHEST_CONFIGS.iron.image}
                alt={CHEST_CONFIGS.iron.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pr-16">
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    {CHEST_CONFIGS.iron.name}
                  </h3>
                  <div className="flex items-center gap-1 font-mono font-bold text-sky-700 text-xs bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                    <Coins className="w-3 h-3 text-sky-600" />
                    {CHEST_CONFIGS.iron.cost}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {CHEST_CONFIGS.iron.description}
                </p>
              </div>

              {/* Exact chances displayed directly on chest card */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Chances médias por carta:
                </span>
                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
                  <div className="bg-slate-50 py-0.5 rounded border border-slate-200 text-slate-700">
                    <span className="text-[8px] font-sans text-slate-400 block">Comum</span>
                    {CHEST_CONFIGS.iron.odds.comum}
                  </div>
                  <div className="bg-sky-50 py-0.5 rounded border border-sky-200 text-sky-700 font-bold">
                    <span className="text-[8px] font-sans text-sky-500 block">Rara</span>
                    {CHEST_CONFIGS.iron.odds.rara}
                  </div>
                  <div className="bg-pink-50 py-0.5 rounded border border-pink-200 text-pink-700 font-bold">
                    <span className="text-[8px] font-sans text-pink-500 block">Épica</span>
                    {CHEST_CONFIGS.iron.odds.epica}
                  </div>
                  <div className="bg-amber-50 py-0.5 rounded border border-amber-200 text-amber-700 font-bold">
                    <span className="text-[8px] font-sans text-amber-500 block">Lend.</span>
                    {CHEST_CONFIGS.iron.odds.lendaria}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleOpenChest('iron')}
            disabled={coins < CHEST_CONFIGS.iron.cost}
            className={`w-full mt-3 py-2.5 px-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              coins >= CHEST_CONFIGS.iron.cost
                ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs active:scale-98'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Abrir Baú ({CHEST_CONFIGS.iron.cost} Moedas)
          </button>
        </div>

        {/* Baú de Ouro (Requested: "baus dourados dão ao menos 1 carta épica e não lendaria") */}
        <div className="rounded-3xl bg-gradient-to-b from-amber-50/70 to-yellow-50/50 border-2 border-amber-400 p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-pink-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-bl-xl shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-white" />
            Épica Garantida!
          </div>

          <div className="flex gap-3">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-amber-100 shrink-0 border border-amber-300 shadow-xs">
              <img
                src={CHEST_CONFIGS.gold.image}
                alt={CHEST_CONFIGS.gold.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pr-20">
                  <h3 className="text-sm font-extrabold text-amber-950 font-display">
                    {CHEST_CONFIGS.gold.name}
                  </h3>
                  <div className="flex items-center gap-1 font-mono font-bold text-amber-700 text-xs bg-white px-2 py-0.5 rounded-full border border-amber-300">
                    <Coins className="w-3 h-3 text-amber-500" />
                    {CHEST_CONFIGS.gold.cost}
                  </div>
                </div>

                <p className="text-[11px] text-amber-900 mt-1 line-clamp-1">
                  {CHEST_CONFIGS.gold.description}
                </p>
              </div>

              {/* Exact chances displayed directly on chest card */}
              <div className="mt-2 pt-2 border-t border-amber-200/60">
                <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Chances médias por carta:
                </span>
                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
                  <div className="bg-white/80 py-0.5 rounded border border-amber-200 text-slate-400">
                    <span className="text-[8px] font-sans text-slate-400 block">Comum</span>
                    {CHEST_CONFIGS.gold.odds.comum}
                  </div>
                  <div className="bg-sky-50 py-0.5 rounded border border-sky-300 text-sky-700 font-bold">
                    <span className="text-[8px] font-sans text-sky-600 block">Rara</span>
                    {CHEST_CONFIGS.gold.odds.rara}
                  </div>
                  <div className="bg-pink-100 py-0.5 rounded border border-pink-300 text-pink-700 font-extrabold">
                    <span className="text-[8px] font-sans text-pink-600 block">Épica</span>
                    {CHEST_CONFIGS.gold.odds.epica}
                  </div>
                  <div className="bg-amber-100 py-0.5 rounded border border-amber-300 text-amber-800 font-extrabold">
                    <span className="text-[8px] font-sans text-amber-600 block">Lend.</span>
                    {CHEST_CONFIGS.gold.odds.lendaria}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleOpenChest('gold')}
            disabled={coins < CHEST_CONFIGS.gold.cost}
            className={`w-full mt-3 py-2.5 px-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              coins >= CHEST_CONFIGS.gold.cost
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-105 text-slate-950 shadow-sm active:scale-98 font-extrabold'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            Abrir Baú ({CHEST_CONFIGS.gold.cost} Moedas)
          </button>
        </div>
      </div>

      {/* Probabilities Guide Footer */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <HelpCircle className="w-4 h-4 text-sky-500" />
          <span className="text-[11px]">Como funcionam os sorteios dos baús</span>
        </div>
        <button
          onClick={() => setShowOddsModal(true)}
          className="text-sky-600 hover:text-sky-700 font-semibold underline text-[11px]"
        >
          Regras Detalhadas
        </button>
      </div>

      {/* Detailed Probabilities Modal */}
      {showOddsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 font-display mb-1">
              Regras de Sorteio dos Baús
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Cada abertura sorteia 3 cartas de acordo com as especificações:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold block mb-0.5">Baú de Madeira (10 Moedas)</span>
                <p className="text-[11px] text-amber-800">
                  Cartas 1, 2 e 3: 78% Comum · 18% Rara · 3.5% Épica · 0.5% Lendária
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900">
                <span className="font-bold block mb-0.5">Baú de Metal (20 Moedas)</span>
                <p className="text-[11px] text-sky-800">
                  Carta 1: <strong>Garantida Rara ou Superior</strong> (78% Rara, 18% Épica, 4% Lendária)<br />
                  Cartas 2 e 3: 58% Comum · 32% Rara · 8% Épica · 2% Lendária
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-yellow-50 border border-amber-300 text-amber-950">
                <span className="font-bold block mb-0.5">Baú de Ouro (30 Moedas)</span>
                <p className="text-[11px] text-amber-900">
                  Carta 1: <strong className="text-pink-600">Garantida Épica ou Superior!</strong> (82% Épica, 18% Lendária)<br />
                  Cartas 2 e 3: 60% Rara · 31% Épica · 9% Lendária (sem cartas comuns)
                </p>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowOddsModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chest Opening Modal Sequence */}
      {openingChestType && drawnCards && (
        <ChestOpeningModal
          chestType={openingChestType}
          cards={drawnCards}
          onClose={handleCloseOpening}
        />
      )}
    </div>
  );
};
