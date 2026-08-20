import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Flame, 
  Send, 
  Bot, 
  X, 
  Code, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { CodeDiagnostic, PersonaMode, AiEngine } from '../types';

interface ExplainPanelProps {
  code: string;
  language: string;
  selectedLine?: number;
  selectedDiagnostic?: CodeDiagnostic;
  persona: PersonaMode;
  aiEngine: AiEngine;
  isOpen: boolean;
  onClose: () => void;
  onApplyFix?: (fixedCode: string) => void;
}

export const ExplainPanel: React.FC<ExplainPanelProps> = ({
  code,
  language,
  selectedLine,
  selectedDiagnostic,
  persona,
  aiEngine,
  isOpen,
  onClose,
  onApplyFix,
}) => {
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'ai'; text: string; isStreaming?: boolean }>>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll on new stream chunk
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // When selected diagnostic changes, trigger default explanation query
  useEffect(() => {
    if (isOpen && selectedDiagnostic) {
      const initialPrompt = persona === 'roast'
        ? `Roast line ${selectedDiagnostic.line} and explain why "${selectedDiagnostic.message}" breaks production.`
        : `Explain why line ${selectedDiagnostic.line} is flagged with "${selectedDiagnostic.message}" and show how to fix it.`;
      
      triggerStreamExplain(initialPrompt, selectedDiagnostic.line);
    }
  }, [selectedDiagnostic, isOpen]);

  const triggerStreamExplain = async (question: string, line?: number) => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
    }

    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: question },
      { id: aiMsgId, role: 'ai', text: '', isStreaming: true }
    ]);
    setInputQuestion('');
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          question,
          selectedLine: line || selectedLine,
          language,
          persona,
          engine: aiEngine
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start explain stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split('\n\n');

        for (const block of lines) {
          if (block.startsWith('data: ')) {
            try {
              const data = JSON.parse(block.replace('data: ', ''));
              if (data.text) {
                fullText += data.text;
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText } : m));
              }
              if (data.done) {
                break;
              }
            } catch (e) {
              // ignore parse errors on partial streams
            }
          }
        }
      }

      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { 
          ...m, 
          text: m.text ? m.text + '\n\n*(Stream ended)*' : 'Failed to retrieve AI explanation.', 
          isStreaming: false 
        } : m));
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    triggerStreamExplain(prompt);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800 w-full md:w-[420px] shadow-2xl z-30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${persona === 'roast' ? 'bg-orange-500/20 text-orange-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {persona === 'roast' ? <Flame className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{persona === 'roast' ? 'RoastSensei Live' : 'Sensei Explain'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                {aiEngine === 'groq-llama3.3' ? 'Groq Llama 3.3' : 'Gemini 3.7'}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              {selectedLine ? `Inspecting Line ${selectedLine}` : 'Interactive AI Debug Tutor'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-2 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap">
        <button
          onClick={() => handleQuickPrompt('Why is this code wrong and how does it break?')}
          className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-1"
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Why is this wrong?</span>
        </button>
        <button
          onClick={() => handleQuickPrompt('Roast this algorithm with maximum sarcasm!')}
          className="px-2.5 py-1 rounded-md bg-orange-950/40 border border-orange-800/50 text-orange-300 hover:bg-orange-900/60 transition-colors flex items-center gap-1"
        >
          <Flame className="w-3 h-3 text-orange-400" />
          <span>Roast it</span>
        </button>
        <button
          onClick={() => handleQuickPrompt('Show me the clean Senior Engineer solution.')}
          className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-1"
        >
          <Code className="w-3 h-3 text-emerald-400" />
          <span>Senior Fix</span>
        </button>
      </div>

      {/* Message Chat Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-sm font-medium text-zinc-300 mb-1">
              Autonomous AI Pair Programmer
            </p>
            <p className="text-xs text-zinc-500 max-w-[260px]">
              Click any highlighted line in Monaco or select a quick prompt above for word-by-word streaming explanations.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-rose-600 text-white rounded-br-none shadow-md shadow-rose-600/20'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-lg'
                }`}
              >
                {msg.role === 'ai' && (
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800/80 text-[10px] font-semibold text-zinc-400">
                    <span className="flex items-center gap-1">
                      {persona === 'roast' ? '🔥 RoastSensei' : '👔 CodeSensei'}
                    </span>
                    {msg.isStreaming && (
                      <span className="flex items-center gap-1 text-rose-400 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        Streaming
                      </span>
                    )}
                  </div>
                )}
                
                {/* Formatted Text rendering */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text || (msg.isStreaming ? 'Thinking...' : '')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input query bar */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputQuestion.trim() && !isStreaming) {
              triggerStreamExplain(inputQuestion);
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={persona === 'roast' ? "Ask why your code is a disaster..." : "Ask why this is wrong or how to optimize..."}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isStreaming || !inputQuestion.trim()}
            className="p-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md shadow-rose-600/30 flex items-center justify-center cursor-pointer"
          >
            {isStreaming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
