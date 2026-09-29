import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Flame, 
  TrendingUp, 
  Award, 
  Droplet,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const HistoryAnalytics: React.FC = () => {
  const { logs, dailyGoal } = useApp();
  // 3 buttons: 'dia' | 'semana' | 'mes'
  const [timeframe, setTimeframe] = useState<'dia' | 'semana' | 'mes'>('dia');

  // Selected date for "Dia" mode
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  // Group logs by date
  const logsByDate = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    if (!acc[log.dateStr]) acc[log.dateStr] = [];
    acc[log.dateStr].push(log);
    return acc;
  }, {});

  // Group intake amount by date
  const intakeByDate = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.dateStr] = (acc[log.dateStr] || 0) + log.amount;
    return acc;
  }, {});

  // Selected Day Calculation
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + selectedDayOffset);
  const selectedDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
  
  const dayLogs = logsByDate[selectedDateStr] || [];
  const dayTotal = dayLogs.reduce((sum, l) => sum + l.amount, 0);
  const dayPercent = dailyGoal > 0 ? Math.round((dayTotal / dailyGoal) * 100) : 0;
  const isSelectedDayGoalMet = dayTotal >= dailyGoal;

  // Hourly buckets for "Dia" mode (06:00 to 22:00 in 2-hour blocks)
  const hourlyBuckets = [
    { label: '06h-08h', startH: 6, endH: 8, amount: 0 },
    { label: '08h-10h', startH: 8, endH: 10, amount: 0 },
    { label: '10h-12h', startH: 10, endH: 12, amount: 0 },
    { label: '12h-14h', startH: 12, endH: 14, amount: 0 },
    { label: '14h-16h', startH: 14, endH: 16, amount: 0 },
    { label: '16h-18h', startH: 16, endH: 18, amount: 0 },
    { label: '18h-20h', startH: 18, endH: 20, amount: 0 },
    { label: '20h-22h', startH: 20, endH: 22, amount: 0 },
    { label: '22h+', startH: 22, endH: 24, amount: 0 },
  ];

  dayLogs.forEach(l => {
    const h = new Date(l.timestamp).getHours();
    const bucket = hourlyBuckets.find(b => h >= b.startH && h < b.endH) || hourlyBuckets[hourlyBuckets.length - 1];
    bucket.amount += l.amount;
  });

  const maxHourlyAmount = Math.max(500, ...hourlyBuckets.map(b => b.amount));

  // 7-day calculation for "Semana" mode
  const last7Days: { dateStr: string; dayLabel: string; fullDate: string; amount: number; isGoalMet: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const amount = intakeByDate[dateStr] || 0;
    last7Days.push({
      dateStr,
      dayLabel: i === 0 ? 'Hoje' : WEEK_DAYS[d.getDay()],
      fullDate: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      amount,
      isGoalMet: amount >= dailyGoal
    });
  }

  const weeklyTotal = last7Days.reduce((acc, d) => acc + d.amount, 0);
  const weeklyAvg = Math.round(weeklyTotal / 7);
  const weeklyGoalDays = last7Days.filter(d => d.isGoalMet).length;
  const maxWeeklyAmount = Math.max(dailyGoal * 1.25, ...last7Days.map(d => d.amount));

  // Monthly calculation for "Mês" mode
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0);
  const now = new Date();
  const monthDate = new Date(now.getFullYear(), now.getMonth() + selectedMonthOffset, 1);
  const mYear = monthDate.getFullYear();
  const mMonth = monthDate.getMonth();
  const daysInCurrentMonth = new Date(mYear, mMonth + 1, 0).getDate();

  const monthDays: { dayNum: number; dateStr: string; amount: number; isGoalMet: boolean }[] = [];
  let monthlyTotal = 0;
  let monthlyGoalDays = 0;
  let activeMonthDays = 0;

  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateStr = `${mYear}-${String(mMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const amount = intakeByDate[dateStr] || 0;
    if (amount > 0) activeMonthDays++;
    if (amount >= dailyGoal) monthlyGoalDays++;
    monthlyTotal += amount;
    monthDays.push({
      dayNum: day,
      dateStr,
      amount,
      isGoalMet: amount >= dailyGoal
    });
  }

  const monthlyAvg = activeMonthDays > 0 ? Math.round(monthlyTotal / activeMonthDays) : 0;
  const maxMonthlyAmount = Math.max(dailyGoal * 1.25, ...monthDays.map(d => d.amount));

  // Streak Calculation
  const calculateStreak = () => {
    let streak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 60; i++) {
      const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const dayTotal = intakeByDate[dStr] || 0;
      if (dayTotal >= dailyGoal) {
        streak++;
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  const streak = calculateStreak();

  return (
    <div className="space-y-4 pb-6">
      {/* 3 Buttons: Dia, Semana, Mês (Requested by user!) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setTimeframe('dia')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            timeframe === 'dia'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Dia
        </button>
        <button
          onClick={() => setTimeframe('semana')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            timeframe === 'semana'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Semana
        </button>
        <button
          onClick={() => setTimeframe('mes')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            timeframe === 'mes'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Mês
        </button>
      </div>

      {/* VIEW 1: DIA (Day View) */}
      {timeframe === 'dia' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Day Navigation Header */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <button
              onClick={() => setSelectedDayOffset(prev => prev - 1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-xs font-bold text-slate-900 block">
                {selectedDayOffset === 0
                  ? 'Hoje'
                  : selectedDayOffset === -1
                  ? 'Ontem'
                  : targetDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {targetDate.toLocaleDateString('pt-BR')}
              </span>
            </div>

            <button
              onClick={() => setSelectedDayOffset(prev => Math.min(0, prev + 1))}
              disabled={selectedDayOffset >= 0}
              className={`p-1.5 rounded-lg transition-colors ${
                selectedDayOffset >= 0 ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Metric Cards of the Day */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Bebido</span>
              <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5 tabular-nums">
                {dayTotal} <span className="text-[10px] font-sans font-normal text-slate-500">ml</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Meta</span>
              <div className="text-base font-extrabold text-sky-600 font-mono mt-0.5 tabular-nums">
                {dayPercent}%
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
              <div className="text-xs font-bold mt-1 truncate">
                {isSelectedDayGoalMet ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Faltam {Math.max(0, dailyGoal - dayTotal)}ml
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Hourly Intake Chart */}
          <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>Consumo por Faixa Horária</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {dayLogs.length} registros
              </span>
            </div>

            {/* Bars */}
            <div className="h-40 flex items-end justify-between gap-1.5 pt-5 pb-2 border-b border-slate-100">
              {hourlyBuckets.map((bucket, idx) => {
                const height = Math.min(100, Math.round((bucket.amount / maxHourlyAmount) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {bucket.amount > 0 && (
                      <span className="text-[8px] font-mono font-bold text-sky-700 mb-1 tabular-nums">
                        {bucket.amount}
                      </span>
                    )}

                    <div className="w-full max-w-[24px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          bucket.amount > 0
                            ? 'bg-gradient-to-t from-sky-500 to-cyan-400 shadow-xs'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${Math.max(4, height)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hourly Labels */}
            <div className="flex justify-between gap-1 text-[8px] font-mono text-slate-400 px-0.5">
              {hourlyBuckets.map((b, i) => (
                <span key={i} className="flex-1 text-center truncate">{b.label.split('-')[0]}</span>
              ))}
            </div>
          </div>

          {/* Logs List of the Selected Day */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Registros do Dia ({dayLogs.length})
            </span>

            {dayLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Nenhum registro de água nesta data.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {dayLogs.map((log) => {
                  const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-3.5 h-3.5 text-sky-500 fill-sky-200" />
                        <div>
                          <span className="font-semibold text-slate-800">{log.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{timeFormatted}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sky-600">
                        +{log.amount} ml
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SEMANA (Week View) */}
      {timeframe === 'semana' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Semanal</span>
              <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5 tabular-nums">
                {(weeklyTotal / 1000).toFixed(1)} <span className="text-[10px] font-sans font-normal text-slate-500">L</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Média / Dia</span>
              <div className="text-base font-extrabold text-sky-600 font-mono mt-0.5 tabular-nums">
                {weeklyAvg} <span className="text-[10px] font-sans font-normal text-slate-500">ml</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Metas Batidas</span>
              <div className="text-base font-extrabold text-emerald-600 font-mono mt-0.5 tabular-nums">
                {weeklyGoalDays} <span className="text-[10px] font-sans font-normal text-slate-500">/ 7 dias</span>
              </div>
            </div>
          </div>

          {/* Professional Weekly Bar Chart */}
          <div className="rounded-3xl bg-white border border-sky-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Gráfico de Consumo Semanal
                </h3>
                <span className="text-[10px] text-slate-400">
                  Linha pontilhada: Meta diária de {dailyGoal}ml
                </span>
              </div>
            </div>

            <div className="h-52 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100 relative">
              {/* Daily Goal Line */}
              <div
                className="absolute left-0 right-0 border-b border-dashed border-sky-400/80 z-10 pointer-events-none"
                style={{
                  bottom: `${Math.round((dailyGoal / maxWeeklyAmount) * 100)}%`
                }}
              >
                <span className="absolute right-0 -top-3.5 text-[8px] font-mono font-bold text-sky-600 bg-white/90 px-1 rounded shadow-2xs">
                  Meta {dailyGoal}ml
                </span>
              </div>

              {last7Days.map((d) => {
                const heightPercent = Math.min(100, Math.round((d.amount / maxWeeklyAmount) * 100));

                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[9px] font-mono font-bold text-slate-700 mb-1 tabular-nums">
                      {d.amount > 0 ? `${d.amount}` : '0'}
                    </span>

                    <div className="w-full max-w-[34px] bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          d.isGoalMet
                            ? 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-xs'
                            : d.amount > 0
                            ? 'bg-gradient-to-t from-sky-500 to-cyan-400'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${Math.max(4, heightPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Labels under chart */}
            <div className="flex justify-between gap-2 px-1">
              {last7Days.map((d) => (
                <div key={`lbl_${d.dateStr}`} className="flex-1 text-center">
                  <span className={`text-[10px] font-bold block ${d.dayLabel === 'Hoje' ? 'text-sky-600' : 'text-slate-600'}`}>
                    {d.dayLabel}
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono">
                    {d.fullDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MÊS (Month View) */}
      {timeframe === 'mes' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <button
              onClick={() => setSelectedMonthOffset(prev => prev - 1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-xs font-bold text-slate-900 block font-display">
                {MONTH_NAMES[mMonth]} {mYear}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {daysInCurrentMonth} dias
              </span>
            </div>

            <button
              onClick={() => setSelectedMonthOffset(prev => Math.min(0, prev + 1))}
              disabled={selectedMonthOffset >= 0}
              className={`p-1.5 rounded-lg transition-colors ${
                selectedMonthOffset >= 0 ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                <Droplet className="w-3.5 h-3.5 text-sky-500" />
                Total no Mês
              </div>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-1 tabular-nums">
                {(monthlyTotal / 1000).toFixed(1)} <span className="text-xs font-sans font-normal text-slate-500">Litros</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Metas Concluídas
              </div>
              <div className="text-lg font-extrabold text-amber-700 font-mono mt-1 tabular-nums">
                {monthlyGoalDays} <span className="text-xs font-sans font-normal text-slate-500">dias</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Sequência Atual
              </div>
              <div className="text-lg font-extrabold text-orange-600 font-mono mt-1 tabular-nums flex items-center gap-1">
                {streak} <span className="text-xs font-sans font-normal text-slate-500">dias</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Média Diária
              </div>
              <div className="text-lg font-extrabold text-emerald-700 font-mono mt-1 tabular-nums">
                {monthlyAvg} <span className="text-xs font-sans font-normal text-slate-500">ml</span>
              </div>
            </div>
          </div>

          {/* Professional Monthly Histogram Chart */}
          <div className="rounded-3xl bg-white border border-sky-100 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Evolução Diária do Mês ({daysInCurrentMonth} dias)
            </h3>

            <div className="h-44 flex items-end justify-between gap-1 pt-6 pb-2 border-b border-slate-100 relative">
              {/* Goal line */}
              <div
                className="absolute left-0 right-0 border-b border-dashed border-sky-400/80 z-10 pointer-events-none"
                style={{
                  bottom: `${Math.round((dailyGoal / maxMonthlyAmount) * 100)}%`
                }}
              >
                <span className="absolute right-0 -top-3.5 text-[8px] font-mono font-bold text-sky-600 bg-white px-1 rounded shadow-2xs">
                  Meta {dailyGoal}ml
                </span>
              </div>

              {monthDays.map((d) => {
                const heightPercent = Math.min(100, Math.round((d.amount / maxMonthlyAmount) * 100));

                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full bg-slate-100 rounded-t-sm h-full flex items-end">
                      <div
                        className={`w-full rounded-t-xs transition-all ${
                          d.isGoalMet
                            ? 'bg-emerald-500'
                            : d.amount > 0
                            ? 'bg-sky-500'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${Math.max(2, heightPercent)}%` }}
                        title={`Dia ${d.dayNum}: ${d.amount}ml`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[8px] text-slate-400 font-mono px-1">
              <span>Dia 1</span>
              <span>Dia 10</span>
              <span>Dia 20</span>
              <span>Dia {daysInCurrentMonth}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
