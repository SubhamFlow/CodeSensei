import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Swords, 
  Trophy, 
  Play, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Flame, 
  Bot, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Terminal,
  Zap,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { getSocket } from '../lib/socket';
import { sound } from '../lib/audio';
import { MonacoEditorView } from './MonacoEditorView';
import { ExplainPanel } from './ExplainPanel';
import { DiagnosticsList } from './DiagnosticsList';
import { 
  BattleRoomState, 
  BattlePlayer, 
  CodeDiagnostic, 
  PersonaMode, 
  AiEngine, 
  Challenge 
} from '../types';

interface BattleArenaProps {
  persona: PersonaMode;
  aiEngine: AiEngine;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  persona,
  aiEngine
}) => {
  const socket = getSocket();
  const [roomId, setRoomId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('room') || `arena-${Math.random().toString(36).substring(2, 7)}`;
  });
  const [username, setUsername] = useState(() => localStorage.getItem('codesensei_username') || `Ninja_${Math.floor(Math.random() * 900 + 100)}`);
  const [roomState, setRoomState] = useState<BattleRoomState | null>(null);
  const [myCode, setMyCode] = useState('');
  const [myDiagnostics, setMyDiagnostics] = useState<CodeDiagnostic[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | undefined>();
  const [selectedDiag, setSelectedDiag] = useState<CodeDiagnostic | undefined>();
  const [vsAiBot, setVsAiBot] = useState(true);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'tests' | 'commentary'>('editor');
  const commentaryEndRef = useRef<HTMLDivElement>(null);

  // Fetch challenge catalog on mount
  useEffect(() => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        setAllChallenges(data);
        if (data.length > 0) setSelectedChallengeId(data[0].id);
      })
      .catch(console.error);
  }, []);

  // Connect and join battle room
  useEffect(() => {
    socket.emit('battle:join', {
      roomId,
      username,
      persona,
      aiEngine,
      vsAi: vsAiBot,
      challengeId: selectedChallengeId
    });

    const handleRoomState = (state: BattleRoomState) => {
      setRoomState(state);
      const me = state.players[socket.id || ''];
      if (me) {
        // Sync code if initializing or restarting
        if ((state.status === 'active' || state.status === 'waiting') && !myCode) {
          setMyCode(me.code);
        }
      }

      // Audio cues for state transitions
      if (state.status === 'countdown') {
        sound.playCountdownBeep(false);
      } else if (state.status === 'active' && state.timeRemaining === state.duration) {
        sound.playCountdownBeep(true);
      }

      // Check for victory celebration
      if (state.status === 'finished' && state.winnerId) {
        sound.playVictoryFanfare();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    };

    const handleTick = ({ timeRemaining }: { timeRemaining: number }) => {
      setRoomState(prev => prev ? { ...prev, timeRemaining } : null);
      if (timeRemaining <= 10 && timeRemaining > 0) {
        sound.playCountdownBeep(false);
      }
    };

    const handleDecorations = (data: { diagnostics: CodeDiagnostic[]; persona: PersonaMode }) => {
      setMyDiagnostics(data.diagnostics);
    };

    const handleCommentary = (msg: any) => {
      setRoomState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          commentary: [...prev.commentary, msg]
        };
      });
      // Scroll to bottom
      commentaryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    socket.on('battle:state', handleRoomState);
    socket.on('battle:tick', handleTick);
    socket.on('decorations:update', handleDecorations);
    socket.on('battle:commentary', handleCommentary);

    return () => {
      socket.off('battle:state', handleRoomState);
      socket.off('battle:tick', handleTick);
      socket.off('decorations:update', handleDecorations);
      socket.off('battle:commentary', handleCommentary);
    };
  }, [roomId, vsAiBot]);

  // Sync code change to server
  const handleCodeChange = (newCode: string) => {
    setMyCode(newCode);
    socket.emit('battle:code_change', {
      roomId,
      code: newCode
    });
  };

  const handleToggleReady = () => {
    const me = roomState?.players[socket.id || ''];
    socket.emit('battle:ready', {
      roomId,
      ready: !me?.ready
    });
  };

  const handleRunTests = () => {
    socket.emit('battle:run_tests', { roomId });
  };

  const handleRematch = () => {
    socket.emit('battle:rematch', {
      roomId,
      challengeId: selectedChallengeId
    });
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Get current player & opponent objects
  const myPlayerId = socket.id || '';
  const myPlayer = roomState?.players[myPlayerId];
  const opponentId = roomState?.playerOrder.find(id => id !== myPlayerId);
  const opponentPlayer = opponentId ? roomState?.players[opponentId] : null;

  // Format timer
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-62px)] bg-zinc-950 overflow-hidden">
      {/* Match Banner & Progress Bar */}
      <div className="px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Challenge info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-500/20 text-rose-400">
              <Swords className="w-4 h-4" />
            </span>
            <span className="font-bold text-white text-sm">
              {roomState?.challenge.title || 'Loading Battle...'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-amber-300 border border-zinc-700">
            {roomState?.challenge.difficulty || 'Medium'}
          </span>
          <span className="text-zinc-500 font-mono hidden md:inline">
            Room: {roomId}
          </span>
        </div>

        {/* Center: Live Timer & Match Status */}
        <div className="flex items-center gap-3">
          {roomState?.status === 'active' && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-sm font-bold border transition-colors ${
              (roomState.timeRemaining || 0) <= 30
                ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
                : 'bg-zinc-950 border-zinc-700 text-zinc-100'
            }`}>
              <Clock className="w-4 h-4 text-rose-400" />
              <span>{formatTime(roomState.timeRemaining || 0)}</span>
            </div>
          )}

          {roomState?.status === 'waiting' && (
            <div className="flex items-center gap-2">
              <button
                id="ready-toggle-btn"
                onClick={handleToggleReady}
                className={`px-4 py-1.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                  myPlayer?.ready
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-bounce'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{myPlayer?.ready ? 'Ready! Waiting for Opponent...' : 'Click Ready to Battle!'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Opponent toggle & Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVsAiBot(!vsAiBot)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
              vsAiBot
                ? 'bg-indigo-950/70 border-indigo-600/60 text-indigo-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle between Sensei AI Ghost Opponent or Friend Multiplayer"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>{vsAiBot ? 'Opponent: AI Ghost Bot' : 'Multiplayer Room'}</span>
          </button>

          <button
            onClick={handleCopyShareLink}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1 text-[11px] transition-colors"
            title="Share battle room link with a friend"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3 text-zinc-400" />}
            <span>{copiedLink ? 'Copied!' : 'Invite 1v1'}</span>
          </button>
        </div>
      </div>

      {/* Main Dual Arena Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Top: Active Player Coding Arena */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800/80 bg-zinc-950">
          {/* Player header with test indicator */}
          <div className="px-3.5 py-2 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                {myPlayer?.avatar || '⚡'}
              </div>
              <span className="font-bold text-white">
                {myPlayer?.username || 'You (Player 1)'}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-emerald-400 font-mono font-semibold">
                Tests: {myPlayer?.testResults.passed || 0}/{myPlayer?.testResults.total || 4}
              </span>
            </div>

            {/* Run Tests / Submit button */}
            <div className="flex items-center gap-2">
              <button
                id="run-tests-btn"
                onClick={handleRunTests}
                disabled={roomState?.status !== 'active'}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run Test Suite</span>
              </button>

              <button
                onClick={() => setExplainOpen(true)}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium flex items-center gap-1 transition-colors"
              >
                <Bot className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">AI Tutor</span>
              </button>
            </div>
          </div>

          {/* Player Monaco Editor */}
          <div className="flex-1 relative min-h-[350px]">
            <MonacoEditorView
              code={myCode || (roomState?.challenge.brokenCode || '')}
              language={roomState?.challenge.language || 'typescript'}
              onChange={handleCodeChange}
              onSelectLineForExplain={(line, diag) => {
                setSelectedLine(line);
                setSelectedDiag(diag);
                setExplainOpen(true);
              }}
              diagnostics={myDiagnostics}
              persona={persona}
              readOnly={roomState?.status === 'waiting' || roomState?.status === 'countdown'}
            />

            {/* Live Countdown Overlay */}
            {roomState?.status === 'countdown' && (
              <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center animate-fade-in">
                <div className="text-7xl font-black text-rose-500 font-mono animate-ping">
                  {roomState.countdown}
                </div>
                <p className="mt-4 text-sm font-bold text-zinc-300 uppercase tracking-widest">
                  Get Ready to Debug!
                </p>
              </div>
            )}
          </div>

          {/* Bottom Diagnostics / Test Results Tabs */}
          <div className="h-44 border-t border-zinc-800 bg-zinc-950 flex flex-col">
            <div className="flex items-center justify-between px-3 bg-zinc-900 border-b border-zinc-800 text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 font-semibold transition-colors border-b-2 ${
                    activeTab === 'editor'
                      ? 'border-rose-500 text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  AI Diagnostics ({myDiagnostics.length})
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`px-3 py-1.5 font-semibold transition-colors border-b-2 ${
                    activeTab === 'tests'
                      ? 'border-emerald-500 text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Test Results ({myPlayer?.testResults.passed || 0}/{myPlayer?.testResults.total || 0})
                </button>
              </div>
            </div>

            <div className="flex-1 p-2 overflow-y-auto">
              {activeTab === 'editor' ? (
                <DiagnosticsList
                  diagnostics={myDiagnostics}
                  persona={persona}
                  onSelectDiagnostic={(diag) => {
                    setSelectedLine(diag.line);
                    setSelectedDiag(diag);
                    setExplainOpen(true);
                  }}
                  onOpenExplain={() => setExplainOpen(true)}
                />
              ) : (
                <div className="space-y-1.5">
                  {myPlayer?.testResults.tests.map((test) => (
                    <div
                      key={test.id}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                        test.passed
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {test.passed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-zinc-600" />
                        )}
                        <span className="font-semibold text-zinc-200">{test.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {test.passed ? 'PASSED' : 'NOT RUN / FAILED'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Opponent Live Preview & Play-by-Play Shoutcaster */}
        <div className="w-full lg:w-[420px] flex flex-col bg-zinc-950 border-l border-zinc-800">
          {/* Opponent live status header */}
          <div className="px-3.5 py-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {opponentPlayer?.avatar || '🤖'}
              </div>
              <div>
                <span className="font-bold text-white">
                  {opponentPlayer?.username || 'Opponent'}
                </span>
                {opponentPlayer?.isAiBot && (
                  <span className="ml-1.5 px-1 py-0.2 rounded bg-indigo-900/50 text-[10px] text-indigo-300 font-mono">
                    AI Ghost
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400">Tests:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[11px] text-indigo-300 font-mono font-bold">
                {opponentPlayer?.testResults.passed || 0}/{opponentPlayer?.testResults.total || 4}
              </span>
            </div>
          </div>

          {/* Opponent Code Preview (Read-only live shadow editor) */}
          <div className="h-56 relative bg-zinc-950 border-b border-zinc-800">
            <MonacoEditorView
              code={opponentPlayer?.code || '// Waiting for opponent to connect or start...'}
              language={roomState?.challenge.language || 'typescript'}
              readOnly={true}
              headerTitle="OPPONENT LIVE FEED"
            />
          </div>

          {/* AI Narrator: Play-by-Play Shoutcaster Feed */}
          <div className="flex-1 flex flex-col min-h-[250px] bg-zinc-950">
            <div className="px-3.5 py-2 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {persona === 'roast' ? (
                  <Flame className="w-4 h-4 text-orange-400" />
                ) : (
                  <Terminal className="w-4 h-4 text-rose-400" />
                )}
                <span className="font-bold text-white">
                  {persona === 'roast' ? 'Roast Shoutcaster Live' : 'AI Play-by-Play Narrator'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 animate-pulse">
                ● LIVE
              </span>
            </div>

            {/* Commentary event stream */}
            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto text-xs">
              {roomState?.commentary.map((comm) => (
                <div
                  key={comm.id}
                  className={`p-2.5 rounded-xl border leading-relaxed ${
                    comm.type === 'win'
                      ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                      : comm.type === 'roast'
                      ? 'bg-orange-950/20 border-orange-800/40 text-orange-200'
                      : comm.type === 'milestone'
                      ? 'bg-indigo-950/20 border-indigo-800/40 text-indigo-200'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] text-zinc-500 font-mono">
                    <span className="font-bold text-zinc-400">{comm.speaker}</span>
                    <span>{new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p>{comm.text}</p>
                </div>
              ))}
              <div ref={commentaryEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Victory / Defeat Modal */}
      {roomState?.status === 'finished' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-amber-500/10">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              {roomState.winnerId === myPlayerId
                ? '🏆 YOU ARE VICTORIOUS!'
                : roomState.winnerId
                ? '💀 DEFEAT - OPPONENT WON'
                : "⏰ TIME'S UP - DRAW"}
            </h2>

            <p className="text-xs text-zinc-400 mb-6">
              {roomState.winnerId === myPlayerId
                ? 'You squashed all bugs and passed the test suite first!'
                : 'The production outage claimed a victim. Ready for revenge?'}
            </p>

            {/* Select Next Challenge */}
            <div className="mb-6 text-left">
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Next Battle Challenge:
              </label>
              <select
                value={selectedChallengeId}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-rose-500"
              >
                {allChallenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.difficulty})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRematch}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Play Rematch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Explain Drawer */}
      <ExplainPanel
        code={myCode}
        language={roomState?.challenge.language || 'typescript'}
        selectedLine={selectedLine}
        selectedDiagnostic={selectedDiag}
        persona={persona}
        aiEngine={aiEngine}
        isOpen={explainOpen}
        onClose={() => setExplainOpen(false)}
      />
    </div>
  );
};
