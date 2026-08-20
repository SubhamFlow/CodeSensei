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
import { CodeDiagnostic, PersonaMode, AiEngine } from '../types';

interface CollaborativePairRoomProps {
  persona: PersonaMode;
  aiEngine: AiEngine;
}

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
  const [code, setCode] = useState('');
  const [diagnostics, setDiagnostics] = useState<CodeDiagnostic[]>([]);
  const [peers, setPeers] = useState<Array<{ id: string; name: string; color: string; cursor?: { line: number; column: number } }>>([]);
  const [messages, setMessages] = useState<Array<{ id: string; sender: string; text: string; timestamp: number; isAi?: boolean }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | undefined>();
  const [selectedDiag, setSelectedDiag] = useState<CodeDiagnostic | undefined>();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Connect to Pair Room
  useEffect(() => {
    socket.emit('pair:join', {
      roomId,
      username,
      userColor: '#' + Math.floor(Math.random()*16777215).toString(16)
    });

    const handleInit = (room: any) => {
      setCode(room.code);
      setPeers(Object.values(room.peers));
      setMessages(room.messages || []);
    };

    const handleSync = (data: { code: string; senderId: string; cursor?: any }) => {
      setCode(data.code);
    };

    const handlePeers = (updatedPeers: any[]) => {
      setPeers(updatedPeers);
    };

    const handleDecorations = (data: { diagnostics: CodeDiagnostic[]; persona: PersonaMode }) => {
      setDiagnostics(data.diagnostics);
    };

    const handleNewMessage = (msg: any) => {
      setMessages(prev => [...prev, msg]);
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    socket.on('pair:init', handleInit);
    socket.on('pair:sync', handleSync);
    socket.on('pair:peers', handlePeers);
    socket.on('decorations:update', handleDecorations);
    socket.on('pair:new_message', handleNewMessage);

    return () => {
      socket.off('pair:init', handleInit);
      socket.off('pair:sync', handleSync);
      socket.off('pair:peers', handlePeers);
      socket.off('decorations:update', handleDecorations);
      socket.off('pair:new_message', handleNewMessage);
    };
  }, [roomId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    socket.emit('pair:edit', {
      roomId,
      code: newCode
    });
  };

  const handleCursorChange = (cursor: { line: number; column: number }) => {
    socket.emit('pair:edit', {
      roomId,
      code,
      cursor
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

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-62px)] bg-zinc-950 overflow-hidden">
      {/* Main Coding Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800 bg-zinc-950">
        {/* Pair room header */}
        <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                <Users className="w-4 h-4" />
              </span>
              <span className="font-bold text-white text-sm">
                Pair Room: #{roomId}
              </span>
            </div>

            {/* Active peer badges */}
            <div className="flex items-center gap-1">
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

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium flex items-center gap-1 text-[11px] transition-colors"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3 text-zinc-400" />}
              <span>{copiedLink ? 'Copied!' : 'Invite Peer'}</span>
            </button>

            <button
              onClick={() => setExplainOpen(true)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Pair Assist</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor with peer cursors & debounced linting */}
        <div className="flex-1 relative min-h-[350px]">
          <MonacoEditorView
            code={code}
            language="typescript"
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
        <div className="p-3 border-t border-zinc-800 bg-zinc-950">
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
      <div className="w-full lg:w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white">Live Room Chat</h3>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            {peers.length} Developers Online
          </span>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs">
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
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/80">
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
        language="typescript"
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
