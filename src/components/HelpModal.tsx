import React from 'react';
import { 
  X, 
  Flame, 
  Swords, 
  Bot, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  Code2, 
  Users 
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full p-6 text-left shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">CodeSensei Architecture Guide</h2>
              <p className="text-xs text-zinc-400">Real-Time Autonomous AI Debugging & Pair-Programming Arena</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
          {/* Feature 1 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Ultra-Low Latency AI Engine (Groq Llama 3.3 & Gemini 3.7)</span>
            </h3>
            <p className="text-zinc-400">
              Connects to Groq's <code className="text-amber-300 font-mono">llama-3.3-70b-versatile</code> for sub-second streaming inference, paired seamlessly with Google's <code className="text-indigo-300 font-mono">gemini-3.7-flash</code> for robust fullstack fallback.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <h3 className="font-bold text-sm text-rose-300 flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Persona Toggle: Standard vs. Roast Mode 🔥</span>
            </h3>
            <p className="text-zinc-400">
              Toggle between a constructive senior staff engineer and RoastSensei — a hilarious tech lead who roasts missing semicolons, questionable algorithms, variable naming crimes (<code className="text-zinc-300 font-mono">temp1</code>, <code className="text-zinc-300 font-mono">asdf</code>), and memory leaks with witty developer banter.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <h3 className="font-bold text-sm text-indigo-300 flex items-center gap-2 mb-1">
              <Swords className="w-4 h-4 text-indigo-400" />
              <span>1v1 Competitive Battle Mode & AI Shoutcaster</span>
            </h3>
            <p className="text-zinc-400">
              Injects broken code snippets into both competitors' editors simultaneously with a live 3-2-1 countdown. Features play-by-play AI Narrator commentary that streams real-time esports shoutcasting as players type, test, and debug!
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2 mb-1">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Debounced Watcher & Monaco Inline Decorations</span>
            </h3>
            <p className="text-zinc-400">
              A 1.5s debounced inactivity watcher on document state delivers instant inline squiggly warnings, flame margin glyphs in Roast mode, and word-by-word streaming explanations directly inside Monaco Editor.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-md shadow-rose-600/30 text-xs cursor-pointer"
          >
            Enter the Arena
          </button>
        </div>
      </div>
    </div>
  );
};
