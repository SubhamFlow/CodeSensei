import React from 'react';
import { AlertCircle, AlertTriangle, Flame, Info, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { CodeDiagnostic, PersonaMode } from '../types';

interface DiagnosticsListProps {
  diagnostics: CodeDiagnostic[];
  persona: PersonaMode;
  onSelectDiagnostic: (diag: CodeDiagnostic) => void;
  onOpenExplain: () => void;
}

export const DiagnosticsList: React.FC<DiagnosticsListProps> = ({
  diagnostics,
  persona,
  onSelectDiagnostic,
  onOpenExplain
}) => {
  if (diagnostics.length === 0) {
    return (
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">No Syntax or Concurrency Bugs Flagged</h4>
            <p className="text-[11px] text-zinc-500">Autonomous AI watcher is actively monitoring code changes (1.5s debounce)</p>
          </div>
        </div>
        <button
          onClick={onOpenExplain}
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>Ask AI</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-3.5 py-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {persona === 'roast' ? (
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span className="text-xs font-bold text-white">
            {persona === 'roast' ? `🔥 ${diagnostics.length} Issues Roasted` : `⚠️ ${diagnostics.length} Detected Warnings & Bugs`}
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono">
          Click to inspect & fix
        </span>
      </div>

      <div className="divide-y divide-zinc-900 max-h-48 overflow-y-auto">
        {diagnostics.map((diag) => {
          const isError = diag.severity === 'error';
          const isRoast = persona === 'roast';

          return (
            <button
              key={diag.id}
              onClick={() => onSelectDiagnostic(diag)}
              className="w-full text-left p-3 hover:bg-zinc-900/70 transition-colors flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className="mt-0.5">
                  {isRoast ? (
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                  ) : isError ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300 font-mono text-[10px] border border-zinc-800">
                      Line {diag.line}
                    </span>
                    {diag.rule && (
                      <span className="text-[10px] text-zinc-500 font-mono truncate">
                        {diag.rule}
                      </span>
                    )}
                  </div>
                  {isRoast && diag.roastComment ? (
                    <p className="text-xs font-medium text-orange-300 line-clamp-1 mb-0.5">
                      "{diag.roastComment}"
                    </p>
                  ) : null}
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {diag.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-zinc-500 group-hover:text-rose-400 transition-colors text-xs font-medium shrink-0">
                <span>Fix</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
