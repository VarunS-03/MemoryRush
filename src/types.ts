/**
 * Core type definitions for Memory Rush
 */

export type GameMode = 'classic' | 'time_attack' | 'daily_challenge';

export type GameState = 
  | 'home' 
  | 'playing' 
  | 'paused' 
  | 'level_complete' 
  | 'game_over' 
  | 'daily_challenge' 
  | 'how_to_play' 
  | 'settings';

export interface CardItem {
  id: string;
  pairId: string;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
  isShaking: boolean;
  isPeeked: boolean;
}

export type PowerUpType = 'peek' | 'freeze' | 'shield' | 'shuffle';

export interface PowerUpCounts {
  peek: number;
  freeze: number;
  shield: number;
  shuffle?: number;
}

export interface DailyResult {
  date: string; // YYYY-MM-DD
  score: number;
  time: number; // in seconds
  mistakes: number;
  accuracy: number;
  completed: boolean;
  bestCombo: number;
}

export interface UserStats {
  highestScore: number;
  highestLevel: number;
  bestStreak: number;
  bestCombo: number;
  bestClassicScore: number;
  bestTimeAttackScore: number;
  bestDailyScore: number;
  gamesPlayed: number;
  totalMatches: number;
  dailyHistory: Record<string, DailyResult>;
}

export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  reducedMotion: boolean;
}

export interface FloatingFeedbackItem {
  id: string;
  text: string;
  subtext?: string;
  color: string;
  x: number;
  y: number;
}

export interface LevelConfig {
  level: number;
  gridCols: number;
  gridRows: number;
  totalCards: number;
  totalPairs: number;
  timeLimit: number; // in seconds, 0 = unlimited or classic
  mismatchDelayMs: number;
  comboWindowSec: number;
  name: string;
}

export interface RoundSummary {
  level: number;
  mode: GameMode;
  score: number;
  timeTaken: number;
  accuracy: number;
  matches: number;
  mistakes: number;
  blunders?: number;
  clearBonus?: number;
  timeBonus?: number;
  accuracyBonus?: number;
  bestCombo: number;
  isNewRecord: boolean;
  title: string;
}

export interface GameplayAnalytics {
  gamesStarted: number;
  gamesCompleted: number;
  gamesAbandoned: number;
  totalTimePlayedSec: number;
  averageAccuracy: number;
  averageCompletionTimeSec: number;
  powerUpsUsed: {
    peek: number;
    freeze: number;
    shield: number;
    shuffle?: number;
  };
  levelAbandonCounts: Record<number, number>;
  levelCompletionCounts: Record<number, number>;
}

export interface TestResult {
  suiteName: string;
  testName: string;
  passed: boolean;
  message?: string;
  durationMs: number;
}
