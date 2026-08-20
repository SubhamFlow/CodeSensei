import React, { useEffect, useRef } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import { CodeDiagnostic, PersonaMode } from '../types';

interface MonacoEditorViewProps {
  code: string;
  language?: string;
  onChange?: (value: string) => void;
  onCursorChange?: (cursor: { line: number; column: number }) => void;
  onSelectLineForExplain?: (line: number, diagnostic?: CodeDiagnostic) => void;
  diagnostics?: CodeDiagnostic[];
  persona?: PersonaMode;
  readOnly?: boolean;
  theme?: string;
  height?: string;
  headerTitle?: string;
  peerCursors?: Array<{ name: string; color: string; cursor?: { line: number; column: number } }>;
}

export const MonacoEditorView: React.FC<MonacoEditorViewProps> = ({
  code,
  language = 'typescript',
  onChange,
  onCursorChange,
  onSelectLineForExplain,
  diagnostics = [],
  persona = 'standard',
  readOnly = false,
  theme = 'vs-dark',
  height = '100%',
  headerTitle,
  peerCursors = []
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const peerDecorationsRef = useRef<string[]>([]);

  // Configure Monaco themes on mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom themes
    monaco.editor.defineTheme('sensei-cyberpunk', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '71717a', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'f43f5e', fontStyle: 'bold' },
        { token: 'identifier', foreground: '38bdf8' },
        { token: 'string', foreground: 'fbbf24' },
        { token: 'number', foreground: 'a78bfa' },
      ],
      colors: {
        'editor.background': '#09090b',
        'editor.foreground': '#f4f4f5',
        'editor.lineHighlightBackground': '#18181b',
        'editorCursor.foreground': '#f43f5e',
        'editorWhitespace.foreground': '#27272a',
        'editorIndentGuide.background': '#27272a',
        'editorIndentGuide.activeBackground': '#3f3f46',
      }
    });

    monaco.editor.setTheme('sensei-cyberpunk');

    // Cursor position listener
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      }
    });

    // Hover or gutter click action to trigger AI explain
    editor.onMouseDown((e) => {
      if (e.target && e.target.position) {
        const line = e.target.position.lineNumber;
        const matchingDiag = diagnostics.find(d => d.line === line);
        if (matchingDiag && onSelectLineForExplain) {
          onSelectLineForExplain(line, matchingDiag);
        }
      }
    });

    updateDecorations();
  };

  // Update inline diagnostics decorations whenever diagnostics or persona change
  useEffect(() => {
    updateDecorations();
  }, [diagnostics, persona]);

  // Update peer cursors in collaborative room
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const editor = editorRef.current;

    const newDecorations = peerCursors
      .filter(p => p.cursor && p.cursor.line > 0)
      .map(p => ({
        range: new monaco.Range(p.cursor!.line, p.cursor!.column, p.cursor!.line, p.cursor!.column + 1),
        options: {
          className: 'peer-cursor-selection',
          after: {
            content: ` 👤 ${p.name} `,
            inlineClassName: 'peer-cursor-label',
            cursor: 'pointer'
          }
        }
      }));

    peerDecorationsRef.current = editor.deltaDecorations(peerDecorationsRef.current, newDecorations);
  }, [peerCursors]);

  const updateDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (!diagnostics || diagnostics.length === 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      return;
    }

    const newDecorations = diagnostics.map((diag) => {
      const isRoast = persona === 'roast';
      const isError = diag.severity === 'error';

      const glyphClassName = isRoast
        ? 'sensei-roast-glyph'
        : isError
        ? 'sensei-error-glyph'
        : 'sensei-warn-glyph';

      const lineHighlightClass = isRoast
        ? 'sensei-roast-line-highlight'
        : isError
        ? 'sensei-error-line-highlight'
        : 'sensei-warn-line-highlight';

      const hoverMessage = isRoast && diag.roastComment
        ? `🔥 **ROAST**: ${diag.roastComment}\n\n⚠️ **Root Cause**: ${diag.message}\n\n💡 Click line to Explain & Fix`
        : `⚠️ **CodeSensei Alert**: ${diag.message}\n\n💡 Click line or Explain Panel to fix`;

      return {
        range: new monaco.Range(
          diag.line,
          diag.column || 1,
          diag.endLine || diag.line,
          diag.endColumn || 100
        ),
        options: {
          isWholeLine: true,
          className: lineHighlightClass,
          glyphMarginClassName: glyphClassName,
          hoverMessage: {
            value: hoverMessage
          },
          minimap: {
            color: isRoast ? '#f97316' : isError ? '#ef4444' : '#eab308',
            position: 1
          }
        }
      };
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
      {headerTitle && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-semibold text-zinc-200">{headerTitle}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span>{language.toUpperCase()}</span>
            {readOnly && (
              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-sans font-medium">
                READ-ONLY
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 w-full min-h-[300px] relative">
        <Editor
          height={height}
          language={language}
          value={code}
          theme="sensei-cyberpunk"
          onChange={(val) => onChange && onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize: 13.5,
            lineHeight: 22,
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
            minimap: { enabled: true, scale: 0.75 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            glyphMargin: true,
            tabSize: 2,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
            lineNumbersMinChars: 3,
            renderLineHighlight: 'all',
          }}
        />
      </div>
    </div>
  );
};
