export type PersonaMode = 'standard' | 'roast';
export type AiEngine = 'groq-llama3.3' | 'gemini-3.7-flash';

export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'roast';

export interface CodeDiagnostic {
  id: string;
  line: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  roastComment?: string;
  severity: DiagnosticSeverity;
  rule?: string;
  suggestedFix?: string;
}

export interface TestCase {
  id: string;
  name: string;
  input: string;
  expected: string;
  actual?: string;
  passed?: boolean;
  error?: string;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Nightmare';
  language: 'javascript' | 'typescript' | 'python';
  category: string;
  description: string;
  brokenCode: string;
  solutionCode: string;
  hints: string[];
  testCases: TestCase[];
  testRunnerScript?: string;
}

export type BattleStatus = 
  | 'idle'
  | 'waiting'
  | 'countdown'
  | 'active'
  | 'evaluating'
  | 'finished';

export interface BattlePlayer {
  id: string;
  username: string;
  avatar: string;
  ready: boolean;
  score: number;
  code: string;
  testResults: {
    passed: number;
    total: number;
    tests: TestCase[];
  };
  cursor?: {
    line: number;
    column: number;
  };
  finishedAt?: number;
  isWinner?: boolean;
  isAiBot?: boolean;
}

export interface CommentaryMessage {
  id: string;
  timestamp: number;
  speaker: 'Sensei' | 'RoastSensei' | 'System';
  text: string;
  highlightPlayerId?: string;
  type: 'action' | 'roast' | 'milestone' | 'win';
}

export interface BattleRoomState {
  roomId: string;
  status: BattleStatus;
  challenge: Challenge;
  players: Record<string, BattlePlayer>;
  playerOrder: string[]; // [player1Id, player2Id]
  countdown: number; // e.g. 3, 2, 1
  timeRemaining: number; // in seconds
  duration: number; // max duration in seconds
  startTime?: number;
  endTime?: number;
  winnerId?: string | null;
  commentary: CommentaryMessage[];
  persona: PersonaMode;
  aiEngine: AiEngine;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'peer';
  senderName?: string;
  text: string;
  timestamp: number;
  codeSnippet?: string;
  isStreaming?: boolean;
  persona?: PersonaMode;
}

export interface ServerConfig {
  hasGeminiKey: boolean;
  hasGroqKey: boolean;
  defaultEngine: AiEngine;
}
