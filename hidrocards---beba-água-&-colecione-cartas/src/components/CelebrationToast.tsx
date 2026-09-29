import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Coins, Sparkles, X, Award } from 'lucide-react';

export const CelebrationToast: React.FC = () => {
  const { lastRewardCelebration, clearCelebration } = useApp();

  useEffect(() => {
    if (lastRewardCelebration) {
      if (lastRewardCelebration.milestone >= 100) {
        try {
          confetti({
            particleCount: lastRewardCelebration.milestone === 100 ? 100 : 50,
            spread: 90,
            origin: { y: 0.4 }
          });
        } catch {
          // ignore
        }
      }

      const timer = setTimeout(() => {
        clearCelebration();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [lastRewardCelebration, clearCelebration]);

  if (!lastRewardCelebration) return null;

  const is100 = lastRewardCelebration.milestone === 100;
  const isOver100 = lastRewardCelebration.milestone > 100;

  return (
    <div className="fixed top-5 left-4 right-4 z-50 flex justify-center animate-in slide-in-from-top duration-300">
      <div
        className={`w-full max-w-md rounded-2xl border p-4 shadow-2xl flex items-center justify-between gap-3 ${
          is100
            ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 border-amber-400 text-amber-200'
            : isOver100
            ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-900 border-emerald-400 text-emerald-200'
            : 'bg-gradient-to-r from-sky-950 via-slate-900 to-slate-900 border-sky-400 text-sky-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              is100
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-spin'
                : isOver100
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-sky-500/20 border-sky-400 text-sky-300'
            }`}
            style={{ animationDuration: '6s' }}
          >
            {is100 ? <Award className="w-6 h-6" /> : <Coins className="w-6 h-6" />}
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {is100
                ? 'Meta de 100% Conquistada!'
                : isOver100
                ? `Meta Superada! (${lastRewardCelebration.milestone}%)`
                : `Marco de ${lastRewardCelebration.milestone}% Atingido!`}
            </div>
            <div className="text-sm font-extrabold text-white font-display mt-0.5">
              +{lastRewardCelebration.coins} {lastRewardCelebration.coins === 1 ? 'Moeda Ganha' : 'Moedas Ganhas'}!
            </div>
          </div>
        </div>

        <button
          onClick={clearCelebration}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
