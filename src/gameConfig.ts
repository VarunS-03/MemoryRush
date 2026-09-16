import { LevelConfig } from './types';

export const CARD_SYMBOLS = [
  '🍕', '🚀', '🐼', '🌈', '🎮', '🍩', '🦊', '⚡',
  '🌙', '🔥', '🎧', '🍔', '🐸', '👾', '⭐', '🎯',
  '🛸', '🍿', '💎', '🦄', '🎸', '🏆', '🌴', '🤖',
  '🎨', '🍓', '🐨', '☀️', '🌊', '🧸', '🎲', '🚗',
  '🥑', '🦁', '🍦', '👑', '🔮', '🪐', '🌮', '🎈',
  '🧩', '🍄', '🦋', '⚓', '🍍', '🍒', '⚽', '🧁'
];

/**
 * Get balanced level configuration for Classic mode
 * Smooth progression ensuring cards fit comfortably on mobile (320px to 430px)
 */
export function getClassicLevelConfig(level: number): LevelConfig {
  if (level === 1) {
    return {
      level: 1,
      gridCols: 4,
      gridRows: 3,
      totalCards: 12,
      totalPairs: 6,
      timeLimit: 60,
      mismatchDelayMs: 850,
      comboWindowSec: 4.5,
      name: 'Rookie Rush',
    };
  }
  if (level === 2) {
    return {
      level: 2,
      gridCols: 4,
      gridRows: 4,
      totalCards: 16,
      totalPairs: 8,
      timeLimit: 75,
      mismatchDelayMs: 750,
      comboWindowSec: 4.0,
      name: 'Quick Reflexes',
    };
  }
  if (level === 3) {
    return {
      level: 3,
      gridCols: 4,
      gridRows: 5,
      totalCards: 20,
      totalPairs: 10,
      timeLimit: 90,
      mismatchDelayMs: 700,
      comboWindowSec: 3.8,
      name: 'Focus Flow',
    };
  }
  if (level === 4) {
    return {
      level: 4,
      gridCols: 4,
      gridRows: 6,
      totalCards: 24,
      totalPairs: 12,
      timeLimit: 105,
      mismatchDelayMs: 650,
      comboWindowSec: 3.5,
      name: 'Grid Master',
    };
  }
  if (level === 5) {
    return {
      level: 5,
      gridCols: 6,
      gridRows: 5,
      totalCards: 30,
      totalPairs: 15,
      timeLimit: 120,
      mismatchDelayMs: 600,
      comboWindowSec: 3.2,
      name: 'Turbo Match',
    };
  }
  // Level 6+: 6x6 (36 cards) with progressively tightening timers
  const extraLevels = level - 5;
  return {
    level,
    gridCols: 6,
    gridRows: 6,
    totalCards: 36,
    totalPairs: 18,
    timeLimit: Math.max(90, 140 - extraLevels * 10),
    mismatchDelayMs: Math.max(450, 580 - extraLevels * 25),
    comboWindowSec: Math.max(2.5, 3.0 - extraLevels * 0.1),
    name: `Challenger Tier ${extraLevels}`,
  };
}

export function getTimeAttackConfig(round = 1): LevelConfig {
  if (round === 1) {
    return {
      level: 1,
      gridCols: 4,
      gridRows: 3,
      totalCards: 12,
      totalPairs: 6,
      timeLimit: 50,
      mismatchDelayMs: 750,
      comboWindowSec: 4.0,
      name: 'Time Attack Wave 1',
    };
  }
  if (round === 2) {
    return {
      level: 2,
      gridCols: 4,
      gridRows: 4,
      totalCards: 16,
      totalPairs: 8,
      timeLimit: 60,
      mismatchDelayMs: 700,
      comboWindowSec: 3.8,
      name: 'Time Attack Wave 2',
    };
  }
  if (round === 3) {
    return {
      level: 3,
      gridCols: 4,
      gridRows: 5,
      totalCards: 20,
      totalPairs: 10,
      timeLimit: 75,
      mismatchDelayMs: 650,
      comboWindowSec: 3.5,
      name: 'Time Attack Wave 3',
    };
  }
  if (round === 4) {
    return {
      level: 4,
      gridCols: 4,
      gridRows: 6,
      totalCards: 24,
      totalPairs: 12,
      timeLimit: 85,
      mismatchDelayMs: 600,
      comboWindowSec: 3.2,
      name: 'Time Attack Wave 4',
    };
  }
  return {
    level: round,
    gridCols: 6,
    gridRows: 6,
    totalCards: 36,
    totalPairs: 18,
    timeLimit: 90,
    mismatchDelayMs: Math.max(450, 580 - (round - 4) * 20),
    comboWindowSec: Math.max(2.4, 3.0 - (round - 4) * 0.1),
    name: `Time Attack Wave ${round}`,
  };
}

export function getDailyChallengeConfig(): LevelConfig {
  return {
    level: 1,
    gridCols: 6,
    gridRows: 6,
    totalCards: 36,
    totalPairs: 18,
    timeLimit: 180, // Generous time limit for daily challenge
    mismatchDelayMs: 700,
    comboWindowSec: 3.5,
    name: 'Daily Challenge',
  };
}

/**
 * Fisher-Yates shuffle algorithm with optional custom PRNG
 */
export function shuffleArray<T>(array: T[], randomFn: () => number = Math.random): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Calculates speed bonus points (10 to 50 pts).
 * Within 2.0s: full 50 pts. Decays gently by 8 pts/sec down to 10 pts minimum.
 * Fairly rewards quick deliberate memory without punishing natural human saccades.
 */
export function calculateSpeedBonus(elapsedSec: number): number {
  if (elapsedSec <= 2.0) return 50;
  const decay = (elapsedSec - 2.0) * 8;
  return Math.max(10, Math.min(50, Math.round(50 - decay)));
}

/**
 * Calculates combo multiplier based on consecutive matches.
 * 1st match: 1.0x
 * 2nd: 1.25x
 * 3rd: 1.5x
 * 4th: 1.75x
 * 5th: 2.0x
 * 6th: 2.25x
 * 7th+: 2.5x max
 * Rewarding consistency without creating runaway exponential score anomalies.
 */
export function calculateComboMultiplier(consecutiveMatches: number): number {
  if (consecutiveMatches <= 1) return 1.0;
  const steps = consecutiveMatches - 1;
  return Math.min(2.5, 1.0 + steps * 0.25);
}

/**
 * Calculates points awarded for a matched pair: (Base 150 + SpeedBonus) * Multiplier
 */
export function calculateMatchScore(speedBonus: number, multiplier: number): number {
  return Math.round((150 + speedBonus) * multiplier);
}

/**
 * Calculates level completion bonuses:
 * - Base Clear Bonus: 400 pts
 * - Remaining Time Bonus: 15 pts/sec
 * - Accuracy Perfection Bonus: 400 pts for 100% accuracy, 200 pts for >=85%
 */
export function calculateLevelClearBonuses(timeLeft: number, accuracy: number) {
  const clearBonus = 400;
  const timeBonus = Math.round(Math.max(0, timeLeft) * 15);
  let accuracyBonus = 0;
  if (accuracy >= 100) {
    accuracyBonus = 400; // Flawless memory
  } else if (accuracy >= 85) {
    accuracyBonus = 200; // Master recall
  }
  return {
    clearBonus,
    timeBonus,
    accuracyBonus,
    totalBonus: clearBonus + timeBonus + accuracyBonus,
  };
}
