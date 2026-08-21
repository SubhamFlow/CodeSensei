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
  Check,
  Globe
} from 'lucide-react';
import { MonacoEditorView } from './MonacoEditorView';
import { ExplainPanel } from './ExplainPanel';
import { DiagnosticsList } from './DiagnosticsList';
import { sound } from '../lib/audio';
import { runClientHeuristicLint } from '../lib/linter';
import { Challenge, CodeDiagnostic, PersonaMode, AiEngine, TestCase, SupportedLanguage } from '../types';

interface SoloDojoProps {
  persona: PersonaMode;
  aiEngine: AiEngine;
}

const LANGUAGES: Array<{ id: SupportedLanguage; label: string; ext: string }> = [
  { id: 'javascript', label: 'JavaScript', ext: 'JS' },
  { id: 'python', label: 'Python', ext: 'PY' },
  { id: 'cpp', label: 'C++', ext: 'CPP' },
  { id: 'java', label: 'Java', ext: 'JAVA' }
];

export const SoloDojo: React.FC<SoloDojoProps> = ({
  persona,
  aiEngine
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [code, setCode] = useState('');
  const [diagnostics, setDiagnostics] = useState<CodeDiagnostic[]>([]);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | undefined>();
  const [selectedDiag, setSelectedDiag] = useState<CodeDiagnostic | undefined>();
  const [showHints, setShowHints] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'tests'>('diagnostics');
  const [mobileView, setMobileView] = useState<'editor' | 'problem' | 'results'>('editor');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lintAbortControllerRef = useRef<AbortController | null>(null);

  // Fetch challenges
  useEffect(() => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        setChallenges(data);
        if (data.length > 0) {
          loadChallenge(data[0], selectedLanguage);
        }
      })
      .catch(console.error);
  }, []);

  const getCodeForLanguage = (ch: Challenge, lang: SupportedLanguage) => {
    if (ch.starterCodes && ch.starterCodes[lang]) {
      return ch.starterCodes[lang];
    }
    return ch.brokenCode || '';
  };

  const loadChallenge = (ch: Challenge, lang: SupportedLanguage = selectedLanguage, switchToEditor: boolean = true) => {
    setSelectedChallenge(ch);
    const starterCode = getCodeForLanguage(ch, lang);
    setCode(starterCode);
    setTestResults(ch.testCases.map(t => ({ ...t, passed: undefined })));
    setShowHints(false);
    triggerDebouncedLint(starterCode, lang);
    if (switchToEditor) {
      setMobileView('editor');
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    if (selectedChallenge) {
      const newCode = getCodeForLanguage(selectedChallenge, lang);
      setCode(newCode);
      triggerDebouncedLint(newCode, lang);
    }
  };

  // Debounced watcher for code modifications
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (!selectedChallenge) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      triggerDebouncedLint(newCode, selectedLanguage);
    }, 1500);
  };

  const triggerDebouncedLint = async (codeToLint: string, language: string) => {
    // Abort previous pending lint fetch if still running
    if (lintAbortControllerRef.current) {
      lintAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    lintAbortControllerRef.current = abortController;

    // Run client heuristic check first for instant feedback
    const clientHeuristics = runClientHeuristicLint(codeToLint, language, persona);
    if (clientHeuristics.length > 0) {
      setDiagnostics(clientHeuristics);
    }

    try {
      const res = await fetch('/api/ai/lint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToLint,
          language,
          persona,
          engine: aiEngine
        }),
        signal: abortController.signal
      });

      if (!res.ok) {
        throw new Error(`Lint HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.diagnostics && Array.isArray(data.diagnostics)) {
        setDiagnostics(data.diagnostics);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      // If backend API request fails or is unavailable, use client heuristics seamlessly
      const fallbackDiags = runClientHeuristicLint(codeToLint, language, persona);
      setDiagnostics(fallbackDiags);
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
          language: selectedLanguage,
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
      const original = getCodeForLanguage(selectedChallenge, selectedLanguage);
      setCode(original);
      triggerDebouncedLint(original, selectedLanguage);
    }
  };

  const passedCount = testResults.filter(t => t.passed === true).length;
  const totalCount = testResults.length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 bg-zinc-950 overflow-hidden">
      {/* Mobile Mode Switcher Bar (Only visible on < lg screens) */}
      <div className="lg:hidden flex items-center justify-between px-2.5 py-1.5 bg-zinc-900 border-b border-zinc-800 flex-shrink-0 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMobileView('editor')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              mobileView === 'editor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setMobileView('problem')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              mobileView === 'problem'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Problem ({challenges.length})
          </button>
          <button
            onClick={() => setMobileView('results')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              mobileView === 'results'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tests & AI ({diagnostics.length})
          </button>
        </div>

        {/* Quick Problem Select Dropdown for Mobile */}
        <select
          value={selectedChallenge?.id || ''}
          onChange={(e) => {
            const ch = challenges.find(c => c.id === e.target.value);
            if (ch) loadChallenge(ch, selectedLanguage);
          }}
          className="bg-zinc-950 text-zinc-300 text-[11px] border border-zinc-800 rounded-lg px-2 py-1 max-w-[140px] truncate"
        >
          {challenges.map(c => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Left Column: Challenge Selector & Problem Spec (Desktop always, Mobile conditional) */}
      <div className={`w-full lg:w-80 border-r border-zinc-800 bg-zinc-950 flex-col h-full min-h-0 ${mobileView === 'problem' ? 'flex flex-1' : 'hidden lg:flex'}`}>
        <div className="h-11 px-3 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              DSA Problem Library
            </h3>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
            {challenges.length} Problems
          </span>
        </div>

        {/* Challenge list */}
        <div className="p-2 space-y-1 overflow-y-auto flex-1 border-b lg:border-b-0 border-zinc-800 min-h-0">
          {challenges.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                loadChallenge(c, selectedLanguage, true);
              }}
              className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
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
                {c.category}
              </span>
            </button>
          ))}
        </div>

        {/* Challenge Spec & Hints */}
        {selectedChallenge && (
          <div className="p-3.5 bg-zinc-900/40 border-t border-zinc-800 overflow-y-auto max-h-56 lg:max-h-64 text-xs flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-bold text-zinc-200">Problem Objective</h4>
              <button
                onClick={() => setMobileView('editor')}
                className="lg:hidden px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
              >
                <Code2 className="w-3 h-3" />
                <span>Open Editor</span>
              </button>
            </div>
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

      {/* Center & Right: Monaco Editor & Controls & Diagnostics */}
      <div className={`flex-1 flex flex-col bg-zinc-950 min-w-0 min-h-0 h-full overflow-hidden ${mobileView === 'problem' ? 'hidden lg:flex' : 'flex'}`}>
        {/* Editor action header */}
        <div className="h-11 px-3 sm:px-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-2 text-xs flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-bold text-white truncate max-w-[120px] sm:max-w-[220px]">
              {selectedChallenge?.title || 'Dojo Editor'}
            </span>

            {/* Language Selector */}
            <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-mono rounded-md font-semibold transition-all ${
                    selectedLanguage === lang.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleResetCode}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium flex items-center gap-1 text-[11px] transition-colors"
              title="Reset code"
            >
              <RotateCcw className="w-3 h-3 text-zinc-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-2.5 sm:px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1 text-[11px] shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isRunningTests ? 'Evaluating...' : 'Run Tests'}</span>
            </button>

            <button
              onClick={() => setExplainOpen(true)}
              className="px-2.5 sm:px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center gap-1 text-[11px] shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor (Visible when in editor view or on desktop) */}
        <div className={`flex-1 min-h-0 relative flex flex-col overflow-hidden ${mobileView === 'results' ? 'hidden lg:flex' : 'flex'}`}>
          <MonacoEditorView
            code={code}
            language={selectedLanguage}
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

        {/* Bottom Diagnostics / Test Results Tabs (Desktop bottom / Mobile results view) */}
        <div className={`border-t border-zinc-800 bg-zinc-950 flex flex-col flex-shrink-0 ${
          mobileView === 'results'
            ? 'flex-1 min-h-0'
            : 'h-44 sm:h-48 lg:h-52 hidden lg:flex'
        }`}>
          <div className="flex items-center justify-between px-3 bg-zinc-900 border-b border-zinc-800 text-xs flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`px-3 py-1.5 font-semibold transition-colors border-b-2 ${
                  activeTab === 'diagnostics'
                    ? 'border-rose-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                AI Linting ({diagnostics.length})
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

            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
              Auto-syncing in {selectedLanguage.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 p-2.5 overflow-y-auto min-h-0">
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
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : test.passed === false ? (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      ) : (
                        <Terminal className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold text-zinc-200 block truncate">{test.name}</span>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">
                          Input: {test.input} ➔ Expected: {test.expected}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold flex-shrink-0 ml-2">
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
        language={selectedLanguage}
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
