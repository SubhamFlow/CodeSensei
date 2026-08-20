import { CodeDiagnostic, PersonaMode, SupportedLanguage } from '../types';

export function runClientHeuristicLint(
  code: string,
  language: SupportedLanguage | string,
  persona: PersonaMode
): CodeDiagnostic[] {
  if (!code || !code.trim()) return [];

  const diagnostics: CodeDiagnostic[] = [];
  const lines = code.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // 1. Explicit bug marker comments
    if (line.includes('// BUG:') || line.includes('/* BUG') || line.includes('// BUG')) {
      const bugDesc = line.replace(/\/\/|\/\*|\*\/|BUG:|BUG/g, '').trim();
      diagnostics.push({
        id: `heur-bug-${lineNum}`,
        line: lineNum,
        column: 1,
        severity: 'error',
        message: bugDesc || 'Logic flaw or unhandled edge case marker detected.',
        roastComment: persona === 'roast' 
          ? "Leaving '// BUG:' in code like a treasure map for production outages? Bold strategy!" 
          : undefined,
        rule: 'heuristic/marked-bug',
        suggestedFix: 'Refactor this logic section to satisfy the target invariants.'
      });
    }

    // 2. Legacy 'var' declaration in JS/TS
    if (/\bvar\s+[a-zA-Z_$]/.test(line) && (language === 'javascript' || language === 'typescript')) {
      diagnostics.push({
        id: `heur-var-${lineNum}`,
        line: lineNum,
        column: line.indexOf('var') + 1,
        severity: 'warning',
        message: "Use 'let' or 'const' instead of 'var' to prevent variable hoisting and lexical scope leaks.",
        roastComment: persona === 'roast' 
          ? "1995 called, Brendan Eich wants his 'var' keyword back." 
          : undefined,
        rule: 'no-var',
        suggestedFix: "Replace 'var' with 'const' or 'let'."
      });
    }

    // 3. Loose equality (== or !=) in JS/TS
    if (/[^=!><]==[^=]/.test(line) && !line.includes('typeof') && !line.includes('null') && (language === 'javascript' || language === 'typescript')) {
      diagnostics.push({
        id: `heur-eq-${lineNum}`,
        line: lineNum,
        column: line.indexOf('==') + 1,
        severity: 'info',
        message: "Prefer strict equality '===' over loose equality '==' to prevent unexpected type coercion bugs.",
        roastComment: persona === 'roast' 
          ? "Using loose equality '==' in 2026? JavaScript type coercion is laughing at your test suite." 
          : undefined,
        rule: 'eqeqeq',
        suggestedFix: "Use '===' for strict type comparison."
      });
    }

    // 4. Common off-by-one loop error
    if (/\bfor\s*\(.*<=\s*[a-zA-Z0-9_$.]+\.length\b/.test(line)) {
      diagnostics.push({
        id: `heur-offbyone-${lineNum}`,
        line: lineNum,
        column: line.indexOf('<=') + 1,
        severity: 'error',
        message: "Potential off-by-one index error: '<= length' causes array index out of bounds on the final iteration.",
        roastComment: persona === 'roast' 
          ? "Off-by-one loop indexing: classic technique for serving undefined to paying customers." 
          : undefined,
        rule: 'off-by-one/boundary-overflow',
        suggestedFix: "Change '<= .length' to '< .length'."
      });
    }

    // 5. Empty catch block
    if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(line) || (trimmed === 'catch {' || trimmed.startsWith('catch (') && lines[idx + 1]?.trim() === '}')) {
      diagnostics.push({
        id: `heur-empty-catch-${lineNum}`,
        line: lineNum,
        column: 1,
        severity: 'warning',
        message: 'Empty catch block detected. Swallowing exceptions leads to silent runtime failures.',
        roastComment: persona === 'roast' 
          ? "Empty catch block: the software engineering equivalent of sweeping radioactive waste under the carpet." 
          : undefined,
        rule: 'no-empty-catch',
        suggestedFix: 'Handle the error or log diagnostic context.'
      });
    }

    // 6. Python range off-by-one on length
    if (language === 'python' && /range\s*\(\s*len\s*\([^)]+\)\s*\+\s*1\s*\)/.test(line)) {
      diagnostics.push({
        id: `heur-py-range-${lineNum}`,
        line: lineNum,
        column: 1,
        severity: 'error',
        message: "IndexError: 'range(len(...) + 1)' accesses past the end of the list.",
        roastComment: persona === 'roast' 
          ? "IndexError speedrun: accessing len(arr) + 1 in Python." 
          : undefined,
        rule: 'python/index-out-of-range',
        suggestedFix: 'Use range(len(arr)) or iterate directly over items.'
      });
    }

    // 7. C++ array bounds overflow
    if (language === 'cpp' && /\[\s*\d+\s*\]/.test(line) && line.includes('vector') && line.includes('.size()')) {
      diagnostics.push({
        id: `heur-cpp-bounds-${lineNum}`,
        line: lineNum,
        column: 1,
        severity: 'warning',
        message: "Consider using '.at()' or verifying index bounds to prevent segmentation faults.",
        roastComment: persona === 'roast' 
          ? "Segmentation Fault (core dumped) awaits." 
          : undefined,
        rule: 'cpp/bounds-check',
        suggestedFix: 'Use bounds checking before random access.'
      });
    }
  });

  return diagnostics;
}
