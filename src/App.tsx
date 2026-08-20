import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BattleArena } from './components/BattleArena';
import { SoloDojo } from './components/SoloDojo';
import { CollaborativePairRoom } from './components/CollaborativePairRoom';
import { HelpModal } from './components/HelpModal';
import { getSocket } from './lib/socket';
import { sound } from './lib/audio';
import { PersonaMode, AiEngine } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'battle' | 'dojo' | 'pair'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pair')) return 'pair';
    if (params.get('dojo')) return 'dojo';
    return 'battle';
  });

  const [persona, setPersona] = useState<PersonaMode>(() => {
    return (localStorage.getItem('codesensei_persona') as PersonaMode) || 'roast';
  });

  const [aiEngine, setAiEngine] = useState<AiEngine>(() => {
    return (localStorage.getItem('codesensei_engine') as AiEngine) || 'gemini-3.7-flash';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => sound.isEnabled());
  const [isConnected, setIsConnected] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Sync WebSocket connection status
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Fetch server AI capabilities configuration
    fetch('/api/config')
      .then(res => res.json())
      .then(cfg => {
        if (cfg.defaultEngine && !localStorage.getItem('codesensei_engine')) {
          setAiEngine(cfg.defaultEngine);
        }
      })
      .catch(console.error);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleTogglePersona = () => {
    const next: PersonaMode = persona === 'roast' ? 'standard' : 'roast';
    setPersona(next);
    localStorage.setItem('codesensei_persona', next);
  };

  const handleChangeEngine = (engine: AiEngine) => {
    setAiEngine(engine);
    localStorage.setItem('codesensei_engine', engine);
  };

  const handleToggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation & Settings Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        persona={persona}
        onTogglePersona={handleTogglePersona}
        aiEngine={aiEngine}
        onChangeEngine={handleChangeEngine}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        isConnected={isConnected}
        onOpenHelp={() => setHelpOpen(true)}
      />

      {/* Main Mode View */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentTab === 'battle' && (
          <BattleArena persona={persona} aiEngine={aiEngine} />
        )}
        {currentTab === 'dojo' && (
          <SoloDojo persona={persona} aiEngine={aiEngine} />
        )}
        {currentTab === 'pair' && (
          <CollaborativePairRoom persona={persona} aiEngine={aiEngine} />
        )}
      </main>

      {/* Architecture & Usage Help Modal */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
