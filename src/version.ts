/**
 * Memory Rush - Version & Internal Changelog
 */

export const APP_VERSION = '1.1.0';
export const APP_BUILD_NAME = 'Arcade Engine Edition';

export interface ChangelogEntry {
  version: string;
  date: string;
  category: 'BUG_FIX' | 'OPTIMIZATION' | 'BALANCING' | 'UI_UX' | 'ACCESSIBILITY';
  description: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '2026-09-15',
    category: 'BUG_FIX',
    description: 'Fixed interval tick state collision where game over was invoked within setTimeLeft updater.',
  },
  {
    version: '1.1.0',
    date: '2026-09-15',
    category: 'BUG_FIX',
    description: 'Added atomic click-lock and level-complete timeout cleanup to prevent phantom card flips on rapid multi-touch.',
  },
  {
    version: '1.1.0',
    date: '2026-09-15',
    category: 'OPTIMIZATION',
    description: 'Wrapped MemoryCard in React.memo to eliminate 10-per-second card re-renders during active timer ticks.',
  },
  {
    version: '1.1.0',
    date: '2026-09-15',
    category: 'BALANCING',
    description: 'Smoothed level difficulty curve: Level 1 (12 cards), Level 2 (16 cards), Level 3 (20 cards), Level 4 (24 cards), Level 5 (30 cards), Level 6 (36 cards).',
  },
  {
    version: '1.1.0',
    date: '2026-09-15',
    category: 'BALANCING',
    description: 'Balanced Time Attack mode with calibrated wave bonuses (+20s) and mismatch penalties (-3s).',
  },
  {
    version: '1.1.0',
    date: '2026-09-15',
    category: 'UI_UX',
    description: 'Added icy frost screen overlay with live countdown during Time Freeze power-up.',
  },
  {
    version: '1.1.0',
    date: '2026-09-15',
    category: 'ACCESSIBILITY',
    description: 'Added keyboard hotkeys: [P] Pause, [1/2/3] Power-ups, [M] Sound, plus arrow key card grid navigation.',
  },
  {
    version: '1.1.0',
    date: '2026-09-15',
    category: 'BUG_FIX',
    description: 'Added defensive schema validation and fallback recovery for corrupted localStorage state.',
  },
];
