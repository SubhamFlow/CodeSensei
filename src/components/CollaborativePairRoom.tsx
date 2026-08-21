import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Share2, 
  Send, 
  Bot, 
  Sparkles, 
  Flame, 
  Check, 
  Copy, 
  Code2, 
  MessageSquare,
  Zap,
  Radio
} from 'lucide-react';
import { getSocket } from '../lib/socket';
import { MonacoEditorView } from './MonacoEditorView';
import { ExplainPanel } from './ExplainPanel';
import { DiagnosticsList } from './DiagnosticsList';
import { CodeDiagnostic, PersonaMode, AiEngine, SupportedLanguage } from '../types';

interface CollaborativePairRoomProps {
  persona: PersonaMode;
  aiEngine: AiEngine;
}

const LANGUAGES: Array<{ id: SupportedLanguage; label: string }> = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' }
];

export const CollaborativePairRoom: React.FC<CollaborativePairRoomProps> = ({
  persona,
  aiEngine
}) => {
  const socket = getSocket();
  const [roomId, setRoomId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('pair') || 'global-pair-room';
  });
  const [username, setUsername] = useState(() => localStorage.getItem('codesensei_username') || `Dev_${Math.floor(Math.random() * 900 + 100)}`);
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [code, setCode] = useState('');
  const [diagnostics, setDiagnostics] = useState<CodeDiagnostic[]>([]);
  const [peers, setPeers] = useState<Array<{ id: string; name: string; color: string; cursor?: { line: number; column: number } }>>([]);
  const [messages, setMessages] = useState<Array<{ id: string; sender: string; text: string; timestamp: number; isAi?: boolean }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | undefined>();
  const [selectedDiag, setSelectedDiag] = useState<CodeDiagnostic | undefined>();
  const [mobileTab, setMobileTab] = useState<'code' | 'chat'>('code');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Connect to Pair Room
  useEffect(() => {
    socket.emit('pair:join', {
      roomId,
      username,
      userColor: '#' + Math.floor(Math.random()*16777215).toString(16)
    });

    const handleInit = (room: any) => {
      if (typeof room.code === 'string') {
        setCode(room.code);
      }
      if (room.language) {
        setLanguage(room.language);
      }
      if (room.peers) {
        setPeers(Object.values(room.peers));
      }
      if (room.messages) {
        setMessages(room.messages);
      }
    };

    const handleSync = (data: { code: string; language?: SupportedLanguage; senderId: string }) => {
      if (typeof data.code === 'string') {
        setCode(data.code);
      }
      if (data.language) {
        setLanguage(data.language);
      }
    };

    const handlePeers = (updatedPeers: any[]) => {
      setPeers(Array.isArray(updatedPeers) ? updatedPeers : []);
    };

    const handleLanguageSync = (newLang: SupportedLanguage) => {
      setLanguage(newLang);
    };

    const handleDecorations = (data: { diagnostics: CodeDiagnostic[]; persona: PersonaMode }) => {
      setDiagnostics(data.diagnostics || []);
    };

    const handleNewMessage = (msg: any) => {
      setMessages(prev => [...prev, msg]);
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    socket.on('pair:init', handleInit);
    socket.on('pair:sync', handleSync);
    socket.on('pair:peers', handlePeers);
    socket.on('pair:language_sync', handleLanguageSync);
    socket.on('decorations:update', handleDecorations);
    socket.on('pair:new_message', handleNewMessage);

    return () => {
      socket.off('pair:init', handleInit);
      socket.off('pair:sync', handleSync);
      socket.off('pair:peers', handlePeers);
      socket.off('pair:language_sync', handleLanguageSync);
      socket.off('decorations:update', handleDecorations);
      socket.off('pair:new_message', handleNewMessage);
    };
  }, [roomId]);

  // Code editor handler (only emitted when code content is edited)
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    socket.emit('pair:edit', {
      roomId,
      code: newCode,
      language
    });
  };

  // Cursor movement handler (never emits or overwrites code)
  const handleCursorChange = (cursor: { line: number; column: number }) => {
    socket.emit('pair:cursor', {
      roomId,
      cursor
    });
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    socket.emit('pair:set_language', {
      roomId,
      language: newLang
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    socket.emit('pair:chat_message', {
      roomId,
      text: chatInput,
      senderName: username
    });
    setChatInput('');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?pair=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateNewRoom = () => {
    const newRoomId = `pair-${Math.random().toString(36).substring(2, 8)}`;
    setRoomId(newRoomId);
    const newUrl = `${window.location.origin}?pair=${newRoomId}`;
    window.history.pushState({}, '', newUrl);
    navigator.clipboard.writeText(newUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 bg-zinc-950 overflow-hidden">
      {/* Mobile Sub-Navigation Bar (< lg screens) */}
      <div className="lg:hidden flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 flex-shrink-0 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMobileTab('code')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              mobileTab === 'code'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Code & Diagnostics
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              mobileTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Live Chat ({messages.length})
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{peers.length} Online</span>
        </div>
      </div>

      {/* Main Coding Area */}
      <div className={`flex-1 flex-col min-w-0 border-r border-zinc-800 bg-zinc-950 h-full min-h-0 overflow-hidden ${
        mobileTab === 'code' ? 'flex' : 'hidden lg:flex'
      }`}>
        {/* Pair room header */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                <Users className="w-4 h-4" />
              </span>
              <span className="font-bold text-white text-xs sm:text-sm truncate">
                Room #{roomId}
              </span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 flex-shrink-0">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`px-1.5 sm:px-2 py-0.5 text-[10px] font-mono rounded font-semibold transition-all ${
                    language === lang.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Active peer badges */}
            <div className="hidden sm:flex items-center gap-1">
              {peers.map((peer) => (
                <div
                  key={peer.id}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-[11px] text-zinc-200 border border-zinc-700"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: peer.color }} />
                  <span>{peer.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleCreateNewRoom}
              title="Create a new private pair-programming room"
              className="px-2 sm:px-2.5 py-1 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="hidden md:inline">New Room</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-2 sm:px-2.5 py-1 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-xs"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-300" /> : <Share2 className="w-3 h-3 text-white" />}
              <span>{copiedLink ? 'Link Copied!' : 'Invite Peer'}</span>
            </button>

            <button
              onClick={() => setExplainOpen(true)}
              className="px-2.5 sm:px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center gap-1 text-[11px] shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Assist</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor with peer cursors & debounced linting */}
        <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
          <MonacoEditorView
            code={code}
            language={language}
            onChange={handleCodeChange}
            onCursorChange={handleCursorChange}
            onSelectLineForExplain={(line, diag) => {
              setSelectedLine(line);
              setSelectedDiag(diag);
              setExplainOpen(true);
            }}
            diagnostics={diagnostics}
            persona={persona}
            peerCursors={peers.filter(p => p.id !== socket.id)}
          />
        </div>

        {/* Bottom Diagnostics Strip */}
        <div className="h-44 lg:h-48 p-2 sm:p-3 border-t border-zinc-800 bg-zinc-950 flex-shrink-0 overflow-y-auto">
          <DiagnosticsList
            diagnostics={diagnostics}
            persona={persona}
            onSelectDiagnostic={(diag) => {
              setSelectedLine(diag.line);
              setSelectedDiag(diag);
              setExplainOpen(true);
            }}
            onOpenExplain={() => setExplainOpen(true)}
          />
        </div>
      </div>

      {/* Right Column: Shared Pair Chat & AI Events */}
      <div className={`w-full lg:w-80 border-l border-zinc-800 bg-zinc-950 flex-col h-full min-h-0 ${
        mobileTab === 'chat' ? 'flex flex-1' : 'hidden lg:flex'
      }`}>
        <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white">Live Room Chat</h3>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            {peers.length} Developers Online
          </span>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 min-h-0 p-3 space-y-3 overflow-y-auto text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-2.5 rounded-xl border leading-relaxed ${
                m.isAi
                  ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1 text-[10px] text-zinc-500 font-mono">
                <span className="font-bold text-zinc-400">{m.sender}</span>
                <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p>{m.text}</p>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat input */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/80 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Message your peers..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Explain Drawer */}
      <ExplainPanel
        code={code}
        language={language}
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
