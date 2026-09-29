import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Droplet, 
  Plus, 
  Coins, 
  Sparkles, 
  SlidersHorizontal,
  ChevronRight,
  Clock
} from 'lucide-react';

interface HydrationTrackerProps {
  onOpenSettings: () => void;
  onOpenShop: () => void;
}

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({ onOpenSettings, onOpenShop }) => {
  const {
    dailyGoal,
    todayLogs,
    todayTotalMl,
    todayPercent,
    claimedMilestonesToday,
    quickIntakeAmounts,
    addWater,
    coins
  } = useApp();

  // User requested: "quando eu definir manualmente quero que apresente o valor zerado e eu digitar quantos ml bebi."
  const [customMl, setCustomMl] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  const handleQuickAdd = (amount: number, label: string) => {
    addWater(amount, label, false); // Shortcut click: conveyor does NOT advance
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMl, 10);
    if (!isNaN(val) && val > 0) {
      addWater(val, `Personalizado (${val}ml)`, true); // Manual input: conveyor advances!
      setCustomMl('');
      setShowCustomModal(false);
    }
  };

  // Radial calculation (Circle radius 92px)
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  // User requested: "se eu beber 100%, nao quero que mostre que bebi 150% e sim 100%. se eu beber mais quero que mostre mais."
  // The radial visual ring caps at 100% full stroke, while the text display shows the true percentage (even > 100%)
  const clampedRingPercent = Math.min(100, Math.max(0, todayPercent));
  const strokeDashoffset = circumference - (clampedRingPercent / 100) * circumference;

  return (
    <div className="space-y-5 pb-6">
      {/* Top Hydration Card with Radial Progress Gauge */}
      <div className="rounded-3xl bg-white border border-sky-100 p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
        {/* Soft background blue ambient glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-sky-100/60 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-cyan-100/60 blur-2xl pointer-events-none" />

        {/* Top Header of the Card */}
        <div className="w-full flex items-center justify-between z-10 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              Hidratação Diária
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs"
            title="Ajustar Meta"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px]">Meta</span>
          </button>
        </div>

        {/* Radial Circular Progress Gauge */}
        <div className="relative w-60 h-60 my-2 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 220 220">
            <defs>
              <linearGradient id="waterRadialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Background track circle */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="15"
              fill="transparent"
            />

            {/* Filled progress circle */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="url(#waterRadialGradient)"
              strokeWidth="15"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              filter="url(#glow)"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center of the radial gauge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center mb-1 text-sky-500 shadow-sm">
              <Droplet className="w-4 h-4 fill-sky-400" />
            </div>

            {/* Shows exact percentage: 100% when reaching goal, >100% when exceeding goal */}
            <span className="text-4xl font-extrabold text-slate-800 font-display tracking-tight tabular-nums">
              {todayPercent}%
            </span>

            <div className="text-xs font-bold text-slate-600 font-mono mt-0.5 tabular-nums">
              {todayTotalMl} <span className="text-slate-400 font-normal">/ {dailyGoal} ml</span>
            </div>

            <div className="mt-1 text-[11px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
              {todayPercent >= 100
                ? (todayPercent > 100 ? `Meta Superada! (+${todayTotalMl - dailyGoal} ml)` : 'Meta Concluída! 🎉')
                : `Faltam ${Math.max(0, dailyGoal - todayTotalMl)} ml`}
            </div>
          </div>
        </div>

        {/* 10% Milestones Indicator row */}
        <div className="w-full mt-3 pt-4 border-t border-slate-100 z-10">
          <div className="flex items-center justify-between text-xs mb-2 px-1">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              Recompensas em Moedas
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1">
            {milestones.map((step) => {
              const isClaimed = claimedMilestonesToday.includes(step);
              const isEligible = todayPercent >= step;

              return (
                <div
                  key={step}
                  className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl border text-center transition-all ${
                    isClaimed
                      ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold shadow-xs'
                      : isEligible
                      ? 'bg-sky-50 border-sky-400 text-sky-700 font-bold animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                  title={`${step}% da meta = +1 moeda`}
                >
                  <span className="text-[9px] font-mono leading-none">{step}%</span>
                  <div className="flex items-center justify-center mt-1 gap-0.5">
                    <Coins className={`w-2.5 h-2.5 ${isClaimed ? 'text-amber-500' : 'text-slate-300'}`} />
                    <span className="text-[8px] font-bold">+1</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dedicated Bonus underneath milestone row ("BONUS DE META" e "+10 moedas") */}
          {todayPercent >= 100 ? (
            <div className="mt-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 border border-amber-300 flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs text-sm">
                  🎉
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-[11px] sm:text-xs flex items-center gap-1.5">
                    <span>BONUS DE META</span>
                    <span className="text-[8px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">BÔNUS ATIVO</span>
                  </div>
                </div>
              </div>
              <span className="font-mono font-extrabold text-xs text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-300 shadow-2xs shrink-0">
                +10 moedas ✓
              </span>
            </div>
          ) : (
            <div className="mt-2.5 p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-300 flex items-center justify-center text-amber-700 text-sm font-bold">
                  🎁
                </div>
                <div>
                  <div className="font-bold text-amber-900 text-[11px] sm:text-xs flex items-center gap-1.5">
                    <span>BONUS DE META</span>
                  </div>
                </div>
              </div>
              <span className="font-mono font-extrabold text-xs text-amber-700 bg-white px-2.5 py-1 rounded-xl border border-amber-300 shadow-2xs shrink-0">
                +10 moedas
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Water Intake Buttons (Requested FIFO queue: 4 positions, new drink enters at 4th position, earlier advance forward, first drops) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Registrar Água
          </h3>
          <span className="text-[11px] text-slate-400 font-normal">
            Histórico dinâmico de 4 atalhos
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {quickIntakeAmounts.map((amount, idx) => {
            const isLatest = idx === 3;
            return (
              <button
                key={`quick_${idx}_${amount}`}
                onClick={() => handleQuickAdd(amount, `Gole (${amount}ml)`)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white border transition-all shadow-xs group active:scale-95 ${
                  isLatest
                    ? 'border-sky-400 bg-sky-50/40 ring-1 ring-sky-300'
                    : 'border-slate-200/90 hover:border-sky-400 hover:bg-sky-50/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${
                  isLatest ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-500'
                }`}>
                  <Droplet className={`w-4 h-4 ${isLatest ? 'fill-white' : 'fill-sky-500/50'}`} />
                </div>
                <span className="text-xs font-bold text-slate-800 font-mono">{amount}ml</span>
                <span className="text-[9px] text-slate-400">
                  {isLatest ? 'Mais recente' : `Slot #${idx + 1}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom ml button */}
        <button
          onClick={() => {
            setCustomMl(''); // Starts at zero/empty as requested
            setShowCustomModal(true);
          }}
          className="w-full mt-2 py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:text-sky-600 hover:border-sky-300 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-sky-500" />
          Digitar quantidade personalizada (ml)...
        </button>
      </div>

      {/* Today's Intake History List */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            Histórico de Hoje ({todayLogs.length})
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">
            Total: {todayTotalMl} ml
          </span>
        </div>

        {todayLogs.length === 0 ? (
          <div className="text-center py-5 text-slate-400 text-xs">
            Nenhum gole registrado hoje. Beba água para ganhar moedas!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
            {todayLogs.map((log) => {
              const date = new Date(log.timestamp);
              const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Droplet className="w-3 h-3 fill-sky-400" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{log.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{timeFormatted}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sky-600">
                      +{log.amount} ml
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Custom Amount (Starts cleared at zero) */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xs rounded-3xl bg-white border border-slate-200 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 font-display mb-1">
              Quantidade de Água
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Digite quantos mililitros você bebeu:
            </p>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="3000"
                  placeholder="0"
                  value={customMl}
                  onChange={(e) => setCustomMl(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xl focus:outline-none focus:border-sky-500"
                  autoFocus
                />
                <span className="absolute right-3 top-3.5 text-xs text-slate-400 font-mono font-bold">
                  ml
                </span>
              </div>

              {/* Quick suggestions if user wants */}
              <div className="flex gap-1.5">
                {[180, 260, 320, 600].map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    onClick={() => setCustomMl(ml.toString())}
                    className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700"
                  >
                    {ml}ml
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!customMl || parseInt(customMl, 10) <= 0}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
