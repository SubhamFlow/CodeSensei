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
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-white">
                  Code<span className="text-rose-400">Sensei</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  AI Arena
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium hidden sm:block">
                Real-Time Autonomous AI Debugging & 1v1 Arena
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile persona & connection indicators */}
            <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400 ring-2 ring-emerald-500/20' : 'bg-rose-500'}`} />
          </div>
        </div>

        {/* Center Mode Nav Navigation */}
        <nav className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 shadow-inner">
          <button
            id="tab-battle"
            onClick={() => onTabChange('battle')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'battle'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>1v1 Battle Arena</span>
          </button>

          <button
            id="tab-dojo"
            onClick={() => onTabChange('dojo')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'dojo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Solo Dojo</span>
          </button>

          <button
            id="tab-pair"
            onClick={() => onTabChange('pair')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'pair'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pair Sandbox</span>
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
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
