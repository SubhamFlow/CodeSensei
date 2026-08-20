import React from 'react';
import { 
  Flame, 
  UserCheck, 
  Swords, 
  Code2, 
  Users, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Zap, 
  Layers,
  HelpCircle
} from 'lucide-react';
import { PersonaMode, AiEngine } from '../types';

interface HeaderProps {
  currentTab: 'battle' | 'dojo' | 'pair';
  onTabChange: (tab: 'battle' | 'dojo' | 'pair') => void;
  persona: PersonaMode;
  onTogglePersona: () => void;
  aiEngine: AiEngine;
  onChangeEngine: (engine: AiEngine) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isConnected: boolean;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  persona,
  onTogglePersona,
  aiEngine,
  onChangeEngine,
  soundEnabled,
  onToggleSound,
  isConnected,
  onOpenHelp,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-2 flex-shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Left Controls */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-white">
                  Code<span className="text-rose-400">Sensei</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  AI Arena
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium hidden lg:block">
                Real-Time Autonomous AI Debugging & 1v1 Arena
              </p>
            </div>
          </div>

          {/* Mobile Right Quick Controls */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={onTogglePersona}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                persona === 'roast'
                  ? 'bg-orange-950/80 border-orange-500/60 text-orange-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300'
              }`}
              title={persona === 'roast' ? 'Roast Mode (Active)' : 'Standard Mode'}
            >
              {persona === 'roast' ? <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-zinc-300" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-600" />}
            </button>

            <button
              onClick={onOpenHelp}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              title="Help"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-emerald-400 ring-2 ring-emerald-500/20' : 'bg-rose-500'}`} />
          </div>
        </div>

        {/* Center Mode Nav Navigation - Perfectly centered, zero scrollbar */}
        <nav className="flex items-center justify-center bg-zinc-900/90 p-0.5 sm:p-1 rounded-xl border border-zinc-800 shadow-inner flex-shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            id="tab-battle"
            onClick={() => onTabChange('battle')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'battle'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Swords className="w-3.5 h-3.5 flex-shrink-0" />
            <span>1v1 Battle</span>
          </button>

          <button
            id="tab-dojo"
            onClick={() => onTabChange('dojo')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'dojo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Solo Dojo</span>
          </button>

          <button
            id="tab-pair"
            onClick={() => onTabChange('pair')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'pair'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Pair Sandbox</span>
          </button>
        </nav>

        {/* Right Controls - Tablet & Desktop */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
          {/* Persona Toggle (Standard vs Roast) */}
          <button
            id="persona-toggle-btn"
            onClick={onTogglePersona}
            className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              persona === 'roast'
                ? 'bg-gradient-to-r from-orange-950/80 to-red-950/80 border-orange-500/60 text-orange-200 shadow-lg shadow-orange-950/40 hover:border-orange-400'
                : 'bg-zinc-900 border-zinc-700/80 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/80'
            }`}
            title="Switch between Standard Senior Engineer and Roast Mode"
          >
            {persona === 'roast' ? (
              <>
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-orange-300 font-bold">Roast Mode</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-orange-500/20 text-orange-300 font-mono">
                  Savage
                </span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-200">Standard</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                  Senior Dev
                </span>
              </>
            )}
          </button>

          {/* AI Model Engine Selector */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs font-medium">
            <button
              onClick={() => onChangeEngine('groq-llama3.3')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                aiEngine === 'groq-llama3.3'
                  ? 'bg-zinc-800 text-amber-300 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Groq Llama 3.3 70B Versatile Ultra-Low Latency"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Groq Llama 3.3</span>
            </button>

            <button
              onClick={() => onChangeEngine('gemini-3.7-flash')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                aiEngine === 'gemini-3.7-flash'
                  ? 'bg-zinc-800 text-indigo-300 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Gemini 3.7 Flash Advanced Multimodal Reasoning"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Gemini 3.7</span>
            </button>
          </div>

          {/* Sound Mute Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              soundEnabled
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-500 hover:text-zinc-400'
            }`}
            title={soundEnabled ? 'Mute Arena SFX' : 'Enable Arena SFX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-zinc-300" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* Help modal button */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="How CodeSensei Works"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Connection status pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-400">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span>{isConnected ? 'Socket Live' : 'Connecting...'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
