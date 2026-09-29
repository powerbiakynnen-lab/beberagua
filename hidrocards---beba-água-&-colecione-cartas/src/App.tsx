import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HydrationTracker } from './components/HydrationTracker';
import { ChestShop } from './components/ChestShop';
import { CollectionAlbum } from './components/CollectionAlbum';
import { HistoryAnalytics } from './components/HistoryAnalytics';
import { SettingsModal } from './components/SettingsModal';
import { ReminderListener } from './components/ReminderListener';
import { CelebrationToast } from './components/CelebrationToast';
import { 
  Droplet, 
  Package, 
  Layers, 
  Calendar, 
  Settings, 
  Coins
} from 'lucide-react';

type TabType = 'today' | 'shop' | 'collection' | 'history';

const MainLayout: React.FC = () => {
  const { coins } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-0 sm:p-4">
      {/* Mobile Smartphone Frame Container */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[860px] sm:max-h-[920px] bg-slate-50 text-slate-800 sm:rounded-[42px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/15 flex flex-col overflow-hidden relative">
        
        {/* Top App Header Bar */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center shadow-xs">
              <Droplet className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 font-display tracking-tight leading-none">
                HidroCards
              </h1>
              <span className="text-[10px] text-sky-600 font-semibold tracking-wide">
                Beba Água & Colecione
              </span>
            </div>
          </div>

          {/* Right header slot: Coins Pill & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('shop')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span className="font-mono text-xs font-extrabold tabular-nums">
                {coins}
              </span>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 px-4 pt-4 pb-20 overflow-y-auto">
          {activeTab === 'today' && (
            <HydrationTracker
              onOpenSettings={() => setShowSettings(true)}
              onOpenShop={() => setActiveTab('shop')}
            />
          )}

          {activeTab === 'shop' && <ChestShop />}

          {activeTab === 'collection' && <CollectionAlbum />}

          {activeTab === 'history' && <HistoryAnalytics />}
        </main>

        {/* Bottom Smartphone Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-sm flex justify-center">
          <div className="w-full grid grid-cols-4 items-center h-16 px-1">
            <button
              onClick={() => setActiveTab('today')}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
                activeTab === 'today' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Droplet className={`w-5 h-5 ${activeTab === 'today' ? 'fill-sky-500/30' : ''}`} />
              <span className="text-[10px] tracking-tight mt-1">Hoje</span>
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
                activeTab === 'shop' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Package className={`w-5 h-5 ${activeTab === 'shop' ? 'fill-amber-500/30' : ''}`} />
              <span className="text-[10px] tracking-tight mt-1">Baús</span>
            </button>

            <button
              onClick={() => setActiveTab('collection')}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
                activeTab === 'collection' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Layers className={`w-5 h-5 ${activeTab === 'collection' ? 'fill-sky-500/30' : ''}`} />
              <span className="text-[10px] tracking-tight mt-1">Coleção</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
                activeTab === 'history' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Calendar className={`w-5 h-5 ${activeTab === 'history' ? 'fill-sky-500/30' : ''}`} />
              <span className="text-[10px] tracking-tight mt-1">Histórico</span>
            </button>
          </div>
        </nav>

        {/* Global Modals & Notifications */}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        <CelebrationToast />
        <ReminderListener />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
