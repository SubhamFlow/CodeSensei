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
  Zap,
  Trash2,
  CornerDownLeft
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
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-scroll on new stream chunk within fixed chatbox
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

  const handleCopyCodeSnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearHistory = () => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    }
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for Mobile / Small Screens */}
      <div 
        className="fixed inset-0 top-[62px] bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        onClick={onClose}
        aria-label="Close AI Tutor overlay"
      />

      {/* Fixed Height Right-Pinned Slide-over Chatbox */}
      <div 
        id="ai-tutor-explain-panel"
        className="fixed top-[62px] right-0 bottom-0 w-full sm:w-[480px] max-w-full h-[calc(100vh-62px)] max-h-[calc(100vh-62px)] bg-zinc-950/98 backdrop-blur-md border-l border-zinc-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Header - Fixed Height */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${persona === 'roast' ? 'bg-orange-500/20 text-orange-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {persona === 'roast' ? <Flame className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                <span>{persona === 'roast' ? 'RoastSensei Live' : 'Sensei AI Tutor'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono flex-shrink-0">
                  {aiEngine === 'groq-llama3.3' ? 'Groq Llama 3.3' : 'Gemini 3.7'}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 truncate">
                {selectedLine ? `Inspecting Line ${selectedLine} (${language.toUpperCase()})` : `Autonomous AI Pair Tutor • ${language.toUpperCase()}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80 transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close AI Tutor (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar - Fixed Height */}
        <div className="flex-shrink-0 px-3 py-2 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap scrollbar-none">
          <button
            onClick={() => handleQuickPrompt('Why is this code wrong and how does it break?')}
            className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
            <span>Why is this wrong?</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('Roast this algorithm with maximum sarcasm!')}
            className="px-2.5 py-1 rounded-md bg-orange-950/40 border border-orange-800/50 text-orange-300 hover:bg-orange-900/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Flame className="w-3 h-3 text-orange-400 flex-shrink-0" />
            <span>Roast it</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('Show me the clean Senior Engineer solution.')}
            className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Code className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span>Senior Fix</span>
          </button>
        </div>

        {/* Message Chat Feed - Strictly scrollable flex-1 with min-h-0 */}
        <div 
          ref={scrollRef} 
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 overscroll-contain"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-sm font-medium text-zinc-300 mb-1">
                Autonomous AI Debug Tutor
              </p>
              <p className="text-xs text-zinc-500 max-w-[280px]">
                Click any line in the code editor, select a quick prompt above, or ask any question about algorithmic complexity, edge cases, and refactoring.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
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
                        <span className="flex items-center gap-1 text-rose-400 animate-pulse font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Streaming...
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Formatted Text rendering with Code Snippet support */}
                  <div className="whitespace-pre-wrap font-sans text-xs break-words">
                    {msg.text || (msg.isStreaming ? 'Analyzing algorithm logic...' : '')}
                  </div>

                  {/* Copy button for AI replies */}
                  {msg.role === 'ai' && msg.text && !msg.isStreaming && (
                    <div className="mt-2 pt-1.5 border-t border-zinc-800/60 flex items-center justify-end gap-2 text-[10px]">
                      <button
                        onClick={() => handleCopyCodeSnippet(msg.text, msg.id)}
                        className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                      >
                        {copiedIndex === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-zinc-400" />
                            <span>Copy Explanation</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input query bar - Fixed Height pinned at bottom */}
        <div className="flex-shrink-0 p-3 border-t border-zinc-800 bg-zinc-900/95">
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
              ref={inputRef}
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={persona === 'roast' ? "Ask why your code is a disaster..." : "Ask why this is wrong or how to optimize..."}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isStreaming || !inputQuestion.trim()}
              className="p-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md shadow-rose-600/30 flex items-center justify-center cursor-pointer flex-shrink-0"
              title="Send (Enter)"
            >
              {isStreaming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
