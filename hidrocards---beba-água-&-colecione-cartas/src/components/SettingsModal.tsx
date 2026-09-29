import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SoundEffectType } from '../types';
import { playReminderNotificationSound } from '../utils/audio';
import { 
  X, 
  Volume2, 
  Play, 
  Bell, 
  Droplet, 
  Check, 
  Plus, 
  Sliders
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

const SOUND_OPTIONS: { id: SoundEffectType; name: string; desc: string }[] = [
  { id: 'water_drop', name: 'Gota Suave', desc: 'Duplo gotejamento sutil e relaxante' },
  { id: 'crystal_chime', name: 'Sino Cristalino', desc: 'Campainha brilhante e límpida' },
  { id: 'ocean_wave', name: 'Brisa Oceânica', desc: 'Acorde harmônico profundo e calmo' },
  { id: 'water_harp', name: 'Fanfarra d\'Água', desc: 'Arpejo alegre de gotas saltitantes' },
  { id: 'alert_ping', name: 'Alerta Marcante', desc: 'Sinal duplo com alta clareza sonora' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const {
    dailyGoal,
    updateDailyGoal,
    reminderSettings,
    updateReminderSettings,
    addCoins
  } = useApp();

  const [localGoal, setLocalGoal] = useState(dailyGoal);
  const [newTimeInput, setNewTimeInput] = useState('15:00');
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const handleGoalChange = (val: number) => {
    setLocalGoal(val);
    updateDailyGoal(val);
  };

  const handleTestSound = () => {
    playReminderNotificationSound(reminderSettings.soundType, reminderSettings.volume);
  };

  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('Notificações não são suportadas neste navegador.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationStatus('Permissão concedida com sucesso!');
        new Notification('HidroCards 💧', {
          body: 'Notificações ativadas! Você será avisado para beber água.',
          icon: '/favicon.ico'
        });
      } else {
        setNotificationStatus('Permissão negada ou dispensada.');
      }
    } catch {
      setNotificationStatus('Erro ao solicitar permissão.');
    }
  };

  const handleAddScheduledTime = () => {
    if (newTimeInput && !reminderSettings.scheduledTimes.includes(newTimeInput)) {
      const updated = [...reminderSettings.scheduledTimes, newTimeInput].sort();
      updateReminderSettings({ scheduledTimes: updated });
    }
  };

  const handleRemoveScheduledTime = (timeToRemove: string) => {
    const updated = reminderSettings.scheduledTimes.filter(t => t !== timeToRemove);
    updateReminderSettings({ scheduledTimes: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Configurações
              </h3>
              <p className="text-[10px] text-slate-500">
                Meta diária, cartas, alarmes e sons
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Daily Goal */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-sky-500" />
              Meta Diária de Água
            </label>
            <span className="font-mono text-sm font-extrabold text-sky-600">
              {localGoal} ml
            </span>
          </div>

          <input
            type="range"
            min="1000"
            max="4500"
            step="100"
            value={localGoal}
            onChange={(e) => handleGoalChange(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-lg bg-slate-100 appearance-none cursor-pointer accent-sky-500"
          />

          <div className="flex gap-1.5">
            {[1500, 2000, 2500, 3000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleGoalChange(preset)}
                className={`flex-1 py-1 rounded-xl border text-[11px] font-mono font-bold transition-colors ${
                  localGoal === preset
                    ? 'bg-sky-500 text-white border-sky-400 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {preset}ml
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            A cada 10% desta meta você ganha 1 moeda. Em 100%, você recebe 10 moedas extras!
          </p>
        </div>

        {/* Section 2: Alarms & Schedule */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                Lembretes & Alarmes
              </span>
              <span className="text-[10px] text-slate-400 block">
                Avisos sonoros para não esquecer de beber
              </span>
            </div>

            <button
              onClick={() => updateReminderSettings({ enabled: !reminderSettings.enabled })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                reminderSettings.enabled ? 'bg-sky-500' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  reminderSettings.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {reminderSettings.enabled && (
            <div className="space-y-3">
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => updateReminderSettings({ useSpecificTimes: false })}
                  className={`flex-1 py-1 rounded-lg font-medium transition-colors ${
                    !reminderSettings.useSpecificTimes
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Por Intervalo
                </button>
                <button
                  type="button"
                  onClick={() => updateReminderSettings({ useSpecificTimes: true })}
                  className={`flex-1 py-1 rounded-lg font-medium transition-colors ${
                    reminderSettings.useSpecificTimes
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Horários Fixos
                </button>
              </div>

              {!reminderSettings.useSpecificTimes ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                    Lembrar a cada:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => updateReminderSettings({ intervalMinutes: mins })}
                        className={`py-1.5 rounded-xl border text-xs font-mono font-bold transition-colors ${
                          reminderSettings.intervalMinutes === mins
                            ? 'bg-sky-500 text-white border-sky-400 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Horários Definidos:
                  </label>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {reminderSettings.scheduledTimes.map((time) => (
                      <span
                        key={time}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700"
                      >
                        {time}
                        <button
                          type="button"
                          onClick={() => handleRemoveScheduledTime(time)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="time"
                      value={newTimeInput}
                      onChange={(e) => setNewTimeInput(e.target.value)}
                      className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddScheduledTime}
                      className="py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Notification Sounds */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-sky-500" />
              Som do Alarme
            </label>

            <button
              onClick={handleTestSound}
              className="py-0.5 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold flex items-center gap-1 transition-colors border border-sky-200"
            >
              <Play className="w-3 h-3 fill-sky-600" />
              Ouvir Som
            </button>
          </div>

          <div className="space-y-1">
            {SOUND_OPTIONS.map((snd) => (
              <button
                key={snd.id}
                type="button"
                onClick={() => updateReminderSettings({ soundType: snd.id })}
                className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition-colors ${
                  reminderSettings.soundType === snd.id
                    ? 'bg-sky-50 border-sky-400 text-sky-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{snd.name}</div>
                  <div className="text-[10px] text-slate-400">{snd.desc}</div>
                </div>
                {reminderSettings.soundType === snd.id && (
                  <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Volume</span>
              <span className="font-mono font-bold text-sky-600">
                {Math.round(reminderSettings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={reminderSettings.volume}
              onChange={(e) => updateReminderSettings({ volume: parseFloat(e.target.value) })}
              className="w-full h-1.5 rounded-lg bg-slate-100 appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        {/* Section 4: Notifications permission */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Notificações do Sistema
            </span>
            <button
              onClick={handleRequestNotificationPermission}
              className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              Ativar
            </button>
          </div>
          {notificationStatus && (
            <div className="text-[10px] text-sky-700 bg-sky-50 p-2 rounded-lg border border-sky-100">
              {notificationStatus}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
