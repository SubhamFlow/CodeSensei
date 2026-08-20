import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  BookOpen, 
  Lightbulb, 
  Terminal,
  Code2,
  Zap,
  Check
} from 'lucide-react';
import { MonacoEditorView } from './MonacoEditorView';
import { ExplainPanel } from './ExplainPanel';
import { DiagnosticsList } from './DiagnosticsList';
import { sound } from '../lib/audio';
import { Challenge, CodeDiagnostic, PersonaMode, AiEngine, TestCase } from '../types';

interface SoloDojoProps {
  persona: PersonaMode;
  aiEngine: AiEngine;
}

export const SoloDojo: React.FC<SoloDojoProps> = ({
  persona,
  aiEngine
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [diagnostics, setDiagnostics] = useState<CodeDiagnostic[]>([]);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | undefined>();
  const [selectedDiag, setSelectedDiag] = useState<CodeDiagnostic | undefined>();
  const [showHints, setShowHints] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'tests' | 'hints'>('diagnostics');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch challenges
  useEffect(() => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        setChallenges(data);
        if (data.length > 0) {
          loadChallenge(data[0]);
        }
      })
      .catch(console.error);
  }, []);

  const loadChallenge = (ch: Challenge) => {
    setSelectedChallenge(ch);
    setCode(ch.brokenCode);
    setTestResults(ch.testCases.map(t => ({ ...t, passed: undefined })));
    setShowHints(false);
    triggerDebouncedLint(ch.brokenCode, ch.language);
  };

  // Debounced watcher for code modifications
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (!selectedChallenge) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      triggerDebouncedLint(newCode, selectedChallenge.language);
    }, 1500);
  };

  const triggerDebouncedLint = async (codeToLint: string, language: string) => {
    try {
      const res = await fetch('/api/ai/lint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToLint,
          language,
          persona,
          engine: aiEngine
        })
      });
      const data = await res.json();
      if (data.diagnostics) {
        setDiagnostics(data.diagnostics);
      }
    } catch (err) {
      console.error('Dojo lint error:', err);
    }
  };

  // Run Test Suite
  const handleRunTests = async () => {
    if (!selectedChallenge) return;
    setIsRunningTests(true);
    setActiveTab('tests');

    try {
      const res = await fetch('/api/ai/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          challengeId: selectedChallenge.id,
          language: selectedChallenge.language,
          testCases: selectedChallenge.testCases
        })
      });
      const data = await res.json();
      if (data.tests) {
        setTestResults(data.tests);
        if (data.passed) {
          sound.playSuccess();
        } else {
          sound.playError();
        }
      }
    } catch (e) {
      console.error('Test execution error:', e);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleResetCode = () => {
    if (selectedChallenge) {
      setCode(selectedChallenge.brokenCode);
      triggerDebouncedLint(selectedChallenge.brokenCode, selectedChallenge.language);
    }
  };

  const passedCount = testResults.filter(t => t.passed === true).length;
  const totalCount = testResults.length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-62px)] bg-zinc-950 overflow-hidden">
      {/* Left Column: Challenge Selector & Problem Spec */}
      <div className="w-full lg:w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="p-3.5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Solo Dojo Challenges
            </h3>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
            {challenges.length} Available
          </span>
        </div>

        {/* Challenge list */}
        <div className="p-2 space-y-1 overflow-y-auto max-h-56 lg:max-h-none flex-1 border-b lg:border-b-0 border-zinc-800">
          {challenges.map((c) => (
            <button
              key={c.id}
              onClick={() => loadChallenge(c)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                selectedChallenge?.id === c.id
                  ? 'bg-zinc-900 border-indigo-500/80 text-white shadow-md'
                  : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-zinc-200 line-clamp-1">
                  {c.title}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  c.difficulty === 'Easy' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' :
                  c.difficulty === 'Medium' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' :
                  'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                }`}>
                  {c.difficulty}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                {c.category} • {c.language}
              </span>
            </button>
          ))}
        </div>

        {/* Challenge Spec & Hints */}
        {selectedChallenge && (
          <div className="p-4 bg-zinc-900/40 border-t border-zinc-800 overflow-y-auto max-h-60 text-xs">
            <h4 className="font-bold text-zinc-200 mb-1.5">Problem Objective</h4>
            <p className="text-zinc-400 leading-relaxed mb-3">
              {selectedChallenge.description}
            </p>

            {/* Hint dropdown toggle */}
            <div className="border-t border-zinc-800/80 pt-2">
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 mb-1.5 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHints ? 'Hide Hints' : 'Need a Hint?'}</span>
              </button>

              {showHints && (
                <ul className="space-y-1.5 pl-4 list-disc text-zinc-400 text-[11px]">
                  {selectedChallenge.hints.map((hint, i) => (
                    <li key={i}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Center: Monaco Editor & Controls */}
      <div className="flex-1 flex flex-col bg-zinc-950 min-w-0">
        {/* Editor action header */}
        <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">
              {selectedChallenge?.title || 'Dojo Editor'}
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">
              Debounced AI Watcher Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCode}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium flex items-center gap-1 transition-colors"
              title="Reset code to original broken state"
            >
              <RotateCcw className="w-3 h-3 text-zinc-400" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isRunningTests ? 'Evaluating...' : 'Run Tests'}</span>
            </button>

            <button
              onClick={() => setExplainOpen(true)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 relative min-h-[350px]">
          <MonacoEditorView
            code={code}
            language={selectedChallenge?.language || 'typescript'}
            onChange={handleCodeChange}
            onSelectLineForExplain={(line, diag) => {
              setSelectedLine(line);
              setSelectedDiag(diag);
              setExplainOpen(true);
            }}
            diagnostics={diagnostics}
            persona={persona}
          />
        </div>

        {/* Bottom Diagnostics / Test Results Tabs */}
        <div className="h-44 border-t border-zinc-800 bg-zinc-950 flex flex-col">
          <div className="flex items-center justify-between px-3 bg-zinc-900 border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`px-3 py-1.5 font-semibold transition-colors border-b-2 ${
                  activeTab === 'diagnostics'
                    ? 'border-rose-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Autonomous AI Linting ({diagnostics.length})
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-3 py-1.5 font-semibold transition-colors border-b-2 ${
                  activeTab === 'tests'
                    ? 'border-emerald-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Test Cases ({passedCount}/{totalCount})
              </button>
            </div>

            <span className="text-[10px] text-zinc-500 font-mono">
              Auto-syncing with {persona === 'roast' ? 'RoastSensei' : 'CodeSensei'}
            </span>
          </div>

          <div className="flex-1 p-2.5 overflow-y-auto">
            {activeTab === 'diagnostics' ? (
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
            ) : (
              <div className="space-y-1.5">
                {testResults.map((test) => (
                  <div
                    key={test.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                      test.passed === true
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : test.passed === false
                        ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {test.passed === true ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : test.passed === false ? (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Terminal className="w-4 h-4 text-zinc-500" />
                      )}
                      <div>
                        <span className="font-semibold text-zinc-200">{test.name}</span>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          Input: {test.input} ➔ Expected: {test.expected}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold">
                      {test.passed === true ? 'PASSED' : test.passed === false ? 'FAILED' : 'READY'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Explain Drawer */}
      <ExplainPanel
        code={code}
        language={selectedChallenge?.language || 'typescript'}
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
