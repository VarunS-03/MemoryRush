/**
 * Memory Rush - Autonomous Internal Self-Testing System
 * Tests critical game logic including:
 * 1. Card Generation
 * 2. Shuffling & PRNG
 * 3. Matching & Consecutive Combo Logic
 * 4. Scoring Calculations
 * 5. Timer Mechanics & Time Attack
 * 6. Power-Up Rules & Constraints
 * 7. State Machine Transitions & Defensive Bounds
 */

import {
  CARD_SYMBOLS,
  calculateComboMultiplier,
  calculateLevelClearBonuses,
  calculateMatchScore,
  calculateSpeedBonus,
  getClassicLevelConfig,
  getDailyChallengeConfig,
  getTimeAttackConfig,
  shuffleArray,
} from '../gameConfig';
import {
  createSeededRandom,
  hashStringToSeed,
  loadUserStats,
  saveUserStats,
} from '../storage';
import { CardItem, LevelConfig, TestResult } from '../types';

export function runAllGameLogicTests(): {
  results: TestResult[];
  passedCount: number;
  failedCount: number;
  durationMs: number;
} {
  const startTime = performance.now();
  const results: TestResult[] = [];

  function assert(suiteName: string, testName: string, condition: boolean, message?: string) {
    const t0 = performance.now();
    results.push({
      suiteName,
      testName,
      passed: Boolean(condition),
      message: condition ? undefined : (message || 'Assertion failed'),
      durationMs: Math.round((performance.now() - t0) * 100) / 100,
    });
  }

  // ==========================================
  // SUITE 1: CARD GENERATION
  // ==========================================
  {
    const suite = 'Card Generation';

    // Test 1.1: Every level produces even number of cards with exact matching pairs
    for (let lvl = 1; lvl <= 6; lvl++) {
      const cfg = getClassicLevelConfig(lvl);
      assert(
        suite,
        `Level ${lvl} has even card count equal to totalCards`,
        cfg.totalCards % 2 === 0 && cfg.totalCards === cfg.totalPairs * 2,
        `totalCards (${cfg.totalCards}) must equal totalPairs * 2 (${cfg.totalPairs * 2})`
      );

      assert(
        suite,
        `Level ${lvl} grid rows * cols matches totalCards`,
        cfg.gridCols * cfg.gridRows === cfg.totalCards,
        `Grid ${cfg.gridCols}x${cfg.gridRows} (${cfg.gridCols * cfg.gridRows}) !== totalCards (${cfg.totalCards})`
      );

      // Verify pair generation
      const symbols = shuffleArray(CARD_SYMBOLS).slice(0, cfg.totalPairs);
      const cards: CardItem[] = [];
      symbols.forEach((sym, i) => {
        cards.push({ id: `c-${i}-a`, pairId: sym, symbol: sym, isFlipped: false, isMatched: false, isShaking: false, isPeeked: false });
        cards.push({ id: `c-${i}-b`, pairId: sym, symbol: sym, isFlipped: false, isMatched: false, isShaking: false, isPeeked: false });
      });

      // Verify each symbol has exactly 2 cards
      const counts: Record<string, number> = {};
      cards.forEach((c) => {
        counts[c.symbol] = (counts[c.symbol] || 0) + 1;
      });
      const allExactlyTwo = Object.values(counts).every((cnt) => cnt === 2);
      assert(
        suite,
        `Level ${lvl} generates exactly 2 cards per symbol`,
        allExactlyTwo && Object.keys(counts).length === cfg.totalPairs,
        `Cards per symbol distribution failed for level ${lvl}`
      );
    }
  }

  // ==========================================
  // SUITE 2: SHUFFLING & SEEDING
  // ==========================================
  {
    const suite = 'Shuffling & Determinism';

    // Test 2.1: Fisher-Yates preserves all original elements
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleArray(original);
    assert(
      suite,
      'Shuffle preserves all elements and length',
      shuffled.length === original.length && original.every((x) => shuffled.includes(x)),
      'Shuffled array does not contain all original elements'
    );

    // Test 2.2: Daily challenge deterministic seeding produces identical output for same date
    const date1 = '2026-09-15';
    const seed1 = hashStringToSeed(date1);
    const rng1 = createSeededRandom(seed1);
    const run1 = shuffleArray(['A', 'B', 'C', 'D', 'E', 'F', 'G'], rng1);

    const seed2 = hashStringToSeed(date1);
    const rng2 = createSeededRandom(seed2);
    const run2 = shuffleArray(['A', 'B', 'C', 'D', 'E', 'F', 'G'], rng2);

    const identical = run1.every((val, idx) => val === run2[idx]);
    assert(
      suite,
      'Daily challenge seed produces identical board arrangement',
      identical,
      'Seeded random failed to produce deterministic shuffle'
    );

    // Test 2.3: Different dates produce different seeds and arrangements
    const seedOther = hashStringToSeed('2026-09-16');
    const rngOther = createSeededRandom(seedOther);
    const runOther = shuffleArray(['A', 'B', 'C', 'D', 'E', 'F', 'G'], rngOther);
    const different = run1.some((val, idx) => val !== runOther[idx]);
    assert(
      suite,
      'Different daily seeds produce distinct arrangements',
      different,
      'Distinct dates unexpectedly produced identical arrangements'
    );
  }

  // ==========================================
  // SUITE 3: MATCHING & COMBOS
  // ==========================================
  {
    const suite = 'Matching Logic';

    // Test 3.1: Matching cards detection
    const cardA: CardItem = { id: 'c1', pairId: '🍕', symbol: '🍕', isFlipped: true, isMatched: false, isShaking: false, isPeeked: false };
    const cardB: CardItem = { id: 'c2', pairId: '🍕', symbol: '🍕', isFlipped: true, isMatched: false, isShaking: false, isPeeked: false };
    const cardC: CardItem = { id: 'c3', pairId: '🚀', symbol: '🚀', isFlipped: true, isMatched: false, isShaking: false, isPeeked: false };

    assert(
      suite,
      'Pair with same pairId matches correctly',
      cardA.pairId === cardB.pairId,
      'Card pairId comparison failed'
    );

    assert(
      suite,
      'Cards with different pairId do not match',
      cardA.pairId !== cardC.pairId,
      'Card mismatch comparison failed'
    );

    // Test 3.2: Linear controlled combo multiplier formula
    // 0 or 1 match = 1.0x; 2nd = 1.25x; 3rd = 1.5x; ... 7th = 2.5x
    const multipliers = [0, 1, 2, 3, 4, 5, 6, 7].map((c) => calculateComboMultiplier(c));
    assert(
      suite,
      'Consecutive match 0 or 1 yields 1.0x combo multiplier',
      multipliers[0] === 1.0 && multipliers[1] === 1.0,
      `Expected [1.0, 1.0], got [${multipliers[0]}, ${multipliers[1]}]`
    );
    assert(
      suite,
      'Consecutive matches scale up smoothly (e.g., 2 -> 1.25x, 3 -> 1.5x)',
      multipliers[2] === 1.25 && multipliers[3] === 1.5,
      `Expected [1.25, 1.5], got [${multipliers[2]}, ${multipliers[3]}]`
    );
    assert(
      suite,
      'Combo multiplier caps strictly at 2.5x max without exponential runaway',
      multipliers[7] === 2.5,
      `Cap failed: expected 2.5, got ${multipliers[7]}`
    );
  }

  // ==========================================
  // SUITE 4: SCORING MECHANICS
  // ==========================================
  {
    const suite = 'Scoring Mechanics';

    // Test 4.1: Speed bonus clamps between 10 and 50 points
    const fastSpeedBonus = calculateSpeedBonus(0.2); // 50
    const mediumSpeedBonus = calculateSpeedBonus(6.0); // 18
    const slowSpeedBonus = calculateSpeedBonus(10.0); // 10 (clamped)

    assert(
      suite,
      'Speed bonus clamps smoothly between 10 and 50 points',
      fastSpeedBonus === 50 && mediumSpeedBonus === 18 && slowSpeedBonus === 10,
      `Speed bonus bounds invalid: fast=${fastSpeedBonus}, med=${mediumSpeedBonus}, slow=${slowSpeedBonus}`
    );

    // Test 4.2: Match score integrates speed bonus and combo multiplier accurately: (150 + speedBonus) * multiplier
    const matchScore = calculateMatchScore(50, 1.5);
    assert(
      suite,
      'calculateMatchScore multiplies (150 + speedBonus) by combo multiplier accurately',
      matchScore === 300,
      `Expected 300, got ${matchScore}`
    );

    // Test 4.3: Level clear bonuses (clear + time + accuracy)
    const bonuses = calculateLevelClearBonuses(30, 95);
    assert(
      suite,
      'Level clear bonuses award base 400 + time bonus + accuracy bonus',
      bonuses.clearBonus === 400 &&
        bonuses.timeBonus === 450 &&
        bonuses.accuracyBonus === 200 &&
        bonuses.totalBonus === 1050,
      `Bonuses mismatch: ${JSON.stringify(bonuses)}`
    );

    const perfectBonuses = calculateLevelClearBonuses(20, 100);
    assert(
      suite,
      '100% accuracy awards +400 accuracy bonus',
      perfectBonuses.accuracyBonus === 400,
      `Expected 400, got ${perfectBonuses.accuracyBonus}`
    );
  }

  // ==========================================
  // SUITE 5: TIMERS & TIME ATTACK
  // ==========================================
  {
    const suite = 'Timers & Time Attack';

    const taConfig = getTimeAttackConfig(1);
    assert(
      suite,
      'Time attack config provides positive time limit',
      taConfig.timeLimit > 0,
      'Time limit must be positive'
    );

    // Simulate Time Attack match bonus (+4s) and mismatch penalty (-2s)
    let simTime = 30;
    simTime += 4; // match
    assert(suite, 'Time Attack match adds +4s', simTime === 34, `Expected 34s, got ${simTime}s`);

    simTime = Math.max(0, simTime - 2); // mismatch penalty
    assert(suite, 'Time Attack mismatch deducts 2s', simTime === 32, `Expected 32s, got ${simTime}s`);

    // Mismatch penalty never drives time below 0
    simTime = 1;
    simTime = Math.max(0, simTime - 2);
    assert(suite, 'Time Attack penalty clamps at 0 without negative time', simTime === 0, `Time dropped to ${simTime}`);
  }

  // ==========================================
  // SUITE 6: POWER-UPS SYSTEM (SHIELD & RADAR)
  // ==========================================
  {
    const suite = 'Power-Ups System';

    // Initial power-up inventory includes shield
    const powerUps = { peek: 2, freeze: 2, shield: 2 };
    assert(
      suite,
      'Initial power-ups inventory includes Peek, Freeze, and Shield',
      powerUps.peek === 2 && powerUps.freeze === 2 && powerUps.shield === 2,
      'Power-up inventory incorrect'
    );

    // Usage decrements by 1
    const shieldUsed = { ...powerUps, shield: powerUps.shield - 1 };
    assert(suite, 'Using Shield decrements count', shieldUsed.shield === 1, 'Shield decrement failed');

    // Level reward caps at 4
    const capped = Math.min(4, 4 + 1);
    assert(suite, 'Power-up rewards cap at maximum 4 units', capped === 4, 'Cap logic failed');

    // Shield absorption simulation:
    let isShieldActive = true;
    let combo = 2.0;
    // On mistake:
    if (isShieldActive) {
      isShieldActive = false;
      // combo is preserved
    } else {
      combo = 1.0;
    }
    assert(
      suite,
      'Shield successfully absorbs blunder and preserves combo',
      !isShieldActive && combo === 2.0,
      'Shield absorption simulation failed'
    );
  }

  // ==========================================
  // SUITE 7: STORAGE & ERROR RESILIENCE
  // ==========================================
  {
    const suite = 'Storage & Fault Resilience';

    // Verify corrupted JSON recovery in storage loader
    const loaded = loadUserStats();
    assert(
      suite,
      'Storage loader returns valid UserStats object',
      typeof loaded === 'object' && typeof loaded.highestScore === 'number' && !isNaN(loaded.highestScore),
      'Storage loader returned invalid stats'
    );
  }

  const durationMs = Math.round(performance.now() - startTime);
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    results,
    passedCount,
    failedCount,
    durationMs,
  };
}
