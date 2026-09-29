import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { playReminderNotificationSound } from '../utils/audio';
import { Droplet, X, Bell } from 'lucide-react';

export const ReminderListener: React.FC = () => {
  const {
    reminderSettings,
    lastDrinkTimestamp,
    addWater
  } = useApp();

  const [showAlert, setShowAlert] = useState(false);
  const lastAlertTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (!reminderSettings.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const nowTs = now.getTime();
      const currentHours = now.getHours();

      // Check quiet hours
      if (currentHours < reminderSettings.startHour || currentHours >= reminderSettings.endHour) {
        return;
      }

      // Throttle: don't alert twice within 10 minutes
      if (nowTs - lastAlertTimestampRef.current < 10 * 60 * 1000) {
        return;
      }

      let shouldAlert = false;

      if (reminderSettings.useSpecificTimes) {
        const timeStr = `${String(currentHours).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (reminderSettings.scheduledTimes.includes(timeStr)) {
          shouldAlert = true;
        }
      } else {
        const elapsedSinceLastDrink = lastDrinkTimestamp ? nowTs - lastDrinkTimestamp : Infinity;
        const requiredIntervalMs = reminderSettings.intervalMinutes * 60 * 1000;
        if (elapsedSinceLastDrink >= requiredIntervalMs) {
          shouldAlert = true;
        }
      }

      if (shouldAlert) {
        lastAlertTimestampRef.current = nowTs;
        setShowAlert(true);
        playReminderNotificationSound(reminderSettings.soundType, reminderSettings.volume);

        // Native notification if granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Hora de Beber Água! 💧', {
            body: 'Mantenha-se hidratado e continue colecionando suas cartas do HidroCards!',
            icon: '/favicon.ico'
          });
        }
      }
    }, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [reminderSettings, lastDrinkTimestamp]);

  const handleDrinkNow = () => {
    addWater(250, 'Lembrete (250ml)');
    setShowAlert(false);
  };

  if (!showAlert) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center animate-in slide-in-from-top duration-300">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-r from-sky-900 to-slate-900 border border-sky-400 p-4 shadow-2xl flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400 shrink-0 animate-bounce">
            <Droplet className="w-5 h-5 fill-sky-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" />
              Hora de se Hidratar!
            </div>
            <div className="text-xs text-slate-200 mt-0.5">
              Beba água agora para ganhar moedas e abrir baús!
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDrinkNow}
            className="py-1.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            +250ml
          </button>
          <button
            onClick={() => setShowAlert(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
