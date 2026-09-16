import { DailyResult, GameplayAnalytics, PowerUpType, UserSettings, UserStats } from './types';

const STATS_KEY = 'memory_rush_stats_v1';
const SETTINGS_KEY = 'memory_rush_settings_v1';
const ANALYTICS_KEY = 'memory_rush_analytics_v1';

const defaultStats: UserStats = {
  highestScore: 0,
  highestLevel: 1,
  bestStreak: 0,
  bestCombo: 0,
  bestClassicScore: 0,
  bestTimeAttackScore: 0,
  bestDailyScore: 0,
  gamesPlayed: 0,
  totalMatches: 0,
  dailyHistory: {},
};

const defaultAnalytics: GameplayAnalytics = {
  gamesStarted: 0,
  gamesCompleted: 0,
  gamesAbandoned: 0,
  totalTimePlayedSec: 0,
  averageAccuracy: 0,
  averageCompletionTimeSec: 0,
  powerUpsUsed: {
    peek: 0,
    freeze: 0,
    shield: 0,
  },
  levelAbandonCounts: {},
  levelCompletionCounts: {},
};

/**
 * Validates a number is finite and within range
 */
function sanitizeNumber(val: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (typeof val !== 'number' || !Number.isFinite(val) || isNaN(val)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, val));
}

/**
 * Safely loads user stats with defensive schema recovery against corruption
 */
export function loadUserStats(): UserStats {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { ...defaultStats };
  }
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...defaultStats };

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...defaultStats };
    }

    // Validate sanitized structure
    const sanitized: UserStats = {
      highestScore: sanitizeNumber(parsed.highestScore, defaultStats.highestScore),
      highestLevel: sanitizeNumber(parsed.highestLevel, defaultStats.highestLevel, 1, 999),
      bestStreak: sanitizeNumber(parsed.bestStreak, defaultStats.bestStreak),
      bestCombo: sanitizeNumber(parsed.bestCombo, defaultStats.bestCombo, 0, 99),
      bestClassicScore: sanitizeNumber(parsed.bestClassicScore, defaultStats.bestClassicScore),
      bestTimeAttackScore: sanitizeNumber(parsed.bestTimeAttackScore, defaultStats.bestTimeAttackScore),
      bestDailyScore: sanitizeNumber(parsed.bestDailyScore, defaultStats.bestDailyScore),
      gamesPlayed: sanitizeNumber(parsed.gamesPlayed, defaultStats.gamesPlayed),
      totalMatches: sanitizeNumber(parsed.totalMatches, defaultStats.totalMatches),
      dailyHistory: {},
    };

    if (parsed.dailyHistory && typeof parsed.dailyHistory === 'object') {
      for (const [dateKey, item] of Object.entries(parsed.dailyHistory)) {
        if (item && typeof item === 'object') {
          const rec = item as Partial<DailyResult>;
          sanitized.dailyHistory[dateKey] = {
            date: typeof rec.date === 'string' ? rec.date : dateKey,
            score: sanitizeNumber(rec.score, 0),
            time: sanitizeNumber(rec.time, 0),
            mistakes: sanitizeNumber(rec.mistakes, 0),
            accuracy: sanitizeNumber(rec.accuracy, 100, 0, 100),
            completed: Boolean(rec.completed),
            bestCombo: sanitizeNumber(rec.bestCombo, 1, 1, 99),
          };
        }
      }
    }

    return sanitized;
  } catch (err) {
    console.warn('Recovered from corrupted user stats in localStorage:', err);
    return { ...defaultStats };
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to persist user stats to localStorage:', e);
  }
}

export function loadUserSettings(): UserSettings {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return {
      soundEnabled: true,
      musicEnabled: false,
      reducedMotion: prefersReducedMotion,
    };
  }

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return {
        soundEnabled: true,
        musicEnabled: false,
        reducedMotion: prefersReducedMotion,
      };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {
        soundEnabled: true,
        musicEnabled: false,
        reducedMotion: prefersReducedMotion,
      };
    }

    return {
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : false,
      reducedMotion:
        typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : prefersReducedMotion,
    };
  } catch {
    return {
      soundEnabled: true,
      musicEnabled: false,
      reducedMotion: prefersReducedMotion,
    };
  }
}

export function saveUserSettings(settings: UserSettings): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to persist settings to localStorage:', e);
  }
}

export function clearUserProgress(): UserStats {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return { ...defaultStats };
  try {
    localStorage.removeItem(STATS_KEY);
  } catch (e) {
    console.warn('Failed to clear progress:', e);
  }
  return { ...defaultStats };
}

/**
 * Local Gameplay Analytics - Tracks player retention, accuracy, and difficulty curves
 */
export function loadGameplayAnalytics(): GameplayAnalytics {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return { ...defaultAnalytics };
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (!raw) return { ...defaultAnalytics };
    const parsed = JSON.parse(raw);
    return {
      ...defaultAnalytics,
      ...parsed,
      powerUpsUsed: {
        ...defaultAnalytics.powerUpsUsed,
        ...(parsed.powerUpsUsed || {}),
      },
      levelAbandonCounts: parsed.levelAbandonCounts || {},
      levelCompletionCounts: parsed.levelCompletionCounts || {},
    };
  } catch {
    return { ...defaultAnalytics };
  }
}

export function saveGameplayAnalytics(analytics: GameplayAnalytics): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch (e) {
    console.warn('Failed to persist analytics:', e);
  }
}

export function trackGameStarted(): void {
  const current = loadGameplayAnalytics();
  current.gamesStarted += 1;
  saveGameplayAnalytics(current);
}

export function trackGameCompleted(level: number, timeSec: number, accuracy: number): void {
  const current = loadGameplayAnalytics();
  current.gamesCompleted += 1;
  current.totalTimePlayedSec += timeSec;

  // Running average accuracy
  if (current.gamesCompleted === 1) {
    current.averageAccuracy = accuracy;
    current.averageCompletionTimeSec = timeSec;
  } else {
    current.averageAccuracy = Math.round((current.averageAccuracy * 0.8) + (accuracy * 0.2));
    current.averageCompletionTimeSec = Math.round(
      (current.averageCompletionTimeSec * 0.8) + (timeSec * 0.2)
    );
  }

  current.levelCompletionCounts[level] = (current.levelCompletionCounts[level] || 0) + 1;
  saveGameplayAnalytics(current);
}

export function trackGameAbandoned(level: number): void {
  const current = loadGameplayAnalytics();
  current.gamesAbandoned += 1;
  current.levelAbandonCounts[level] = (current.levelAbandonCounts[level] || 0) + 1;
  saveGameplayAnalytics(current);
}

export function trackPowerUpUsed(type: PowerUpType): void {
  const current = loadGameplayAnalytics();
  if (type === 'shield' || type === 'peek' || type === 'freeze') {
    current.powerUpsUsed[type] = (current.powerUpsUsed[type] || 0) + 1;
  }
  saveGameplayAnalytics(current);
}

/**
 * Returns today's date formatted as YYYY-MM-DD in UTC time
 * Guarantees global synchronization for the Daily Challenge
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mulberry32 32-bit PRNG generator
 */
export function createSeededRandom(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert string (like "2026-09-15") into a numerical seed
 */
export function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
