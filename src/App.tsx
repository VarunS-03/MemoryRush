/**
 * Memory Rush - Main Application Component
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CardItem,
  DailyResult,
  FloatingFeedbackItem,
  GameMode,
  GameState,
  LevelConfig,
  PowerUpCounts,
  PowerUpType,
  RoundSummary,
  UserSettings,
  UserStats,
} from './types';
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
} from './gameConfig';
import {
  clearUserProgress,
  createSeededRandom,
  getTodayDateString,
  hashStringToSeed,
  loadUserSettings,
  loadUserStats,
  saveUserSettings,
  saveUserStats,
  trackGameStarted,
  trackGameCompleted,
  trackGameAbandoned,
  trackPowerUpUsed,
} from './storage';
import { runAllGameLogicTests } from './testing/selfTestRunner';
import { soundManager } from './audio';
import { BackgroundParticles } from './components/BackgroundParticles';
import { HomeScreen } from './components/HomeScreen';
import { GameHUD } from './components/GameHUD';
import { ComboMeter } from './components/ComboMeter';
import { PowerUpsBar } from './components/PowerUpsBar';
import { MemoryBoard } from './components/MemoryBoard';
import { FloatingFeedback } from './components/FloatingFeedback';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';

export default function App() {
  // Persistent State
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [settings, setSettings] = useState<UserSettings>(loadUserSettings);

  // High-level App State
  const [gameState, setGameState] = useState<GameState>('home');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');

  // Active Game State
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => getClassicLevelConfig(1));
  const [cards, setCards] = useState<CardItem[]>([]);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  // Combo System
  const [combo, setCombo] = useState<number>(1);
  const [consecutiveMatches, setConsecutiveMatches] = useState<number>(0);
  const [comboTimeLeft, setComboTimeLeft] = useState<number>(0);
  const [maxComboWindow, setMaxComboWindow] = useState<number>(4.0);
  const [roundBestCombo, setRoundBestCombo] = useState<number>(1);
  const lastMatchTimestampRef = useRef<number>(0);

  // Power-Ups
  const [powerUps, setPowerUps] = useState<PowerUpCounts>({
    peek: 2,
    freeze: 2,
    shield: 2,
  });
  const [isFreezeActive, setIsFreezeActive] = useState<boolean>(false);
  const [freezeTimeLeft, setFreezeTimeLeft] = useState<number>(0);
  const [isPeekActive, setIsPeekActive] = useState<boolean>(false);
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);

  // Interaction State & Card Evaluation
  const [firstCard, setFirstCard] = useState<CardItem | null>(null);
  const [secondCard, setSecondCard] = useState<CardItem | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Authoritative Refs for race-condition elimination & timing fairness
  const activeSelectionRef = useRef<string[]>([]);
  const evaluatingRef = useRef<boolean>(false);
  const activePeekRef = useRef<boolean>(false);
  const isVictoryRef = useRef<boolean>(false);
  const pauseStartTimeRef = useRef<number | null>(null);
  const seenCardIdsRef = useRef<Set<string>>(new Set());
  const blundersCountRef = useRef<number>(0);
  const clickLockedRef = useRef<boolean>(false);
  const evalTimeoutRef = useRef<number | null>(null);
  const peekTimeoutRef = useRef<number | null>(null);
  const levelCompleteTimeoutRef = useRef<number | null>(null);

  // Floating Notifications & Modals
  const [floatingFeedbacks, setFloatingFeedbacks] = useState<FloatingFeedbackItem[]>([]);
  const [roundSummary, setRoundSummary] = useState<RoundSummary | null>(null);

  // Save settings on change
  useEffect(() => {
    saveUserSettings(settings);
    soundManager.toggleMusic(settings.musicEnabled);
  }, [settings]);

  // Save stats on change
  useEffect(() => {
    saveUserStats(stats);
  }, [stats]);

  // Clear timeouts helper
  const clearActiveTimeouts = useCallback(() => {
    if (evalTimeoutRef.current) {
      clearTimeout(evalTimeoutRef.current);
      evalTimeoutRef.current = null;
    }
    if (peekTimeoutRef.current) {
      clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = null;
    }
    if (levelCompleteTimeoutRef.current) {
      clearTimeout(levelCompleteTimeoutRef.current);
      levelCompleteTimeoutRef.current = null;
    }
    clickLockedRef.current = false;
  }, []);

  // Floating feedback generator
  const triggerFloatingFeedback = useCallback(
    (text: string, color: string, subtext?: string, x = 50, y = 45) => {
      const id = `${Date.now()}-${Math.random()}`;
      setFloatingFeedbacks((prev) => [...prev, { id, text, color, subtext, x, y }]);
      setTimeout(() => {
        setFloatingFeedbacks((prev) => prev.filter((item) => item.id !== id));
      }, 900);
    },
    []
  );

  /**
   * Generates a new board with validated matching pairs
   */
  const generateBoard = useCallback(
    (config: LevelConfig, mode: GameMode): CardItem[] => {
      let randomFn = Math.random;

      if (mode === 'daily_challenge') {
        const todayStr = getTodayDateString();
        const seed = hashStringToSeed(todayStr);
        randomFn = createSeededRandom(seed);
      }

      // Pick unique symbols
      const shuffledSymbols = shuffleArray(CARD_SYMBOLS, randomFn);
      const selectedSymbols = shuffledSymbols.slice(0, config.totalPairs);

      // Create pairs
      const cardList: CardItem[] = [];
      selectedSymbols.forEach((symbol, index) => {
        cardList.push({
          id: `card-${index}-a-${symbol}`,
          pairId: symbol,
          symbol: symbol,
          isFlipped: false,
          isMatched: false,
          isShaking: false,
          isPeeked: false,
        });
        cardList.push({
          id: `card-${index}-b-${symbol}`,
          pairId: symbol,
          symbol: symbol,
          isFlipped: false,
          isMatched: false,
          isShaking: false,
          isPeeked: false,
        });
      });

      return shuffleArray(cardList, randomFn);
    },
    []
  );

  /**
   * Initializes a game round
   */
  const startRound = useCallback(
    (level: number, mode: GameMode, resetScore = true) => {
      clearActiveTimeouts();

      let config: LevelConfig;
      if (mode === 'classic') {
        config = getClassicLevelConfig(level);
      } else if (mode === 'time_attack') {
        config = getTimeAttackConfig(level);
      } else {
        config = getDailyChallengeConfig();
      }

      const newBoard = generateBoard(config, mode);

      // Reset authoritative interaction refs
      activeSelectionRef.current = [];
      evaluatingRef.current = false;
      activePeekRef.current = false;
      isVictoryRef.current = false;
      pauseStartTimeRef.current = null;
      seenCardIdsRef.current.clear();
      blundersCountRef.current = 0;

      setCurrentLevel(level);
      setLevelConfig(config);
      setCards(newBoard);
      setMatchedPairs(0);
      setMistakes(0);
      setFirstCard(null);
      setSecondCard(null);
      setIsEvaluating(false);
      setIsPeekActive(false);
      setIsFreezeActive(false);
      setFreezeTimeLeft(0);
      setIsShieldActive(false);
      setCombo(1);
      setConsecutiveMatches(0);
      setComboTimeLeft(0);
      setMaxComboWindow(config.comboWindowSec);
      setRoundBestCombo(1);
      setRoundStartTime(Date.now());
      lastMatchTimestampRef.current = Date.now();

      if (resetScore) {
        setScore(0);
        setTimeLeft(config.timeLimit);
        setPowerUps({ peek: 2, freeze: 2, shield: 2 });
      } else {
        // Continuing in Classic: reset clock cleanly to next level's standard time limit
        if (mode === 'classic') {
          setTimeLeft(config.timeLimit);
        } else if (mode === 'time_attack') {
          // Time Attack mode carries over leftover time plus wave bonus
          setTimeLeft((prev) => prev + 25);
        }
        // Grant 1 bonus charge per level
        setPowerUps((prev) => ({
          peek: Math.min(4, prev.peek + 1),
          freeze: Math.min(4, prev.freeze + 1),
          shield: Math.min(4, prev.shield + 1),
        }));
      }

      trackGameStarted();
      setGameState('playing');
    },
    [clearActiveTimeouts, generateBoard]
  );

  // Start new run from Home
  const handleStartGame = () => {
    if (settings.soundEnabled) soundManager.playButtonClick();
    startRound(1, selectedMode, true);
  };

  // Start Daily Challenge
  const handlePlayDaily = () => {
    if (settings.soundEnabled) soundManager.playButtonClick();
    setSelectedMode('daily_challenge');
    startRound(1, 'daily_challenge', true);
  };

  // Toggle Sound FX
  const handleToggleSound = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.soundEnabled;
      if (next) soundManager.playButtonClick();
      return { ...prev, soundEnabled: next };
    });
  }, []);

  // Pause with fair timestamp bookmarking
  const handlePause = useCallback(() => {
    if (gameState === 'playing') {
      pauseStartTimeRef.current = Date.now();
      setGameState('paused');
    }
  }, [gameState]);

  // Resume with delta compensation
  const handleResume = useCallback(() => {
    if (gameState === 'paused') {
      if (pauseStartTimeRef.current) {
        const pauseDuration = Date.now() - pauseStartTimeRef.current;
        setRoundStartTime((prev) => prev + pauseDuration);
        lastMatchTimestampRef.current += pauseDuration;
        pauseStartTimeRef.current = null;
      }
      setGameState('playing');
    }
  }, [gameState]);

  // Main Timer & Combo countdown loop (runs every 100ms)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = window.setInterval(() => {
      if (isVictoryRef.current) return; // Freeze timer immediately upon completing the board

      // Freeze countdown
      if (isFreezeActive) {
        setFreezeTimeLeft((prev) => {
          if (prev <= 0.1) {
            setIsFreezeActive(false);
            return 0;
          }
          return Math.max(0, prev - 0.1);
        });
        // Note: Freeze power-up halts BOTH main game clock and combo decay!
      } else {
        // Normal game countdown
        setTimeLeft((prev) => Math.max(0, prev - 0.1));

        // Combo countdown
        setComboTimeLeft((prev) => {
          if (prev <= 0.1) {
            if (combo > 1 || consecutiveMatches > 0) {
              setCombo(1);
              setConsecutiveMatches(0);
            }
            return 0;
          }
          return Math.max(0, prev - 0.1);
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, isFreezeActive, combo, consecutiveMatches]);

  // Handle Game Over
  const handleGameOver = useCallback(() => {
    if (isVictoryRef.current) return; // Prevent game-over if victory is already locked

    clearActiveTimeouts();
    if (settings.soundEnabled) soundManager.playGameOver();

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - roundStartTime) / 1000));
    const totalAttempted = matchedPairs + mistakes;
    const accuracy = totalAttempted > 0 ? Math.round((matchedPairs / totalAttempted) * 100) : 0;
    const isNewRecord = score > stats.highestScore;

    const summary: RoundSummary = {
      level: currentLevel,
      mode: selectedMode,
      score,
      timeTaken: elapsedSeconds,
      accuracy,
      matches: matchedPairs,
      mistakes,
      blunders: blundersCountRef.current,
      bestCombo: roundBestCombo,
      isNewRecord,
      title: 'GAME OVER',
    };

    trackGameAbandoned(currentLevel);
    setRoundSummary(summary);
    setGameState('game_over');

    // Update player lifetime stats
    setStats((prev) => ({
      ...prev,
      highestScore: Math.max(prev.highestScore, score),
      highestLevel: Math.max(prev.highestLevel, currentLevel),
      bestCombo: Math.max(prev.bestCombo, roundBestCombo),
      bestClassicScore:
        selectedMode === 'classic' ? Math.max(prev.bestClassicScore, score) : prev.bestClassicScore,
      bestTimeAttackScore:
        selectedMode === 'time_attack'
          ? Math.max(prev.bestTimeAttackScore, score)
          : prev.bestTimeAttackScore,
      gamesPlayed: prev.gamesPlayed + 1,
      totalMatches: prev.totalMatches + matchedPairs,
    }));
  }, [
    clearActiveTimeouts,
    currentLevel,
    matchedPairs,
    mistakes,
    roundBestCombo,
    roundStartTime,
    score,
    selectedMode,
    settings.soundEnabled,
    stats.highestScore,
  ]);

  // Handle Level Complete
  const handleLevelComplete = useCallback(() => {
    clearActiveTimeouts();
    isVictoryRef.current = true;
    if (settings.soundEnabled) soundManager.playLevelComplete();

    const elapsedSeconds = Math.max(1, (Date.now() - roundStartTime) / 1000);
    const totalDecisions = levelConfig.totalPairs + blundersCountRef.current;
    const accuracy =
      totalDecisions > 0
        ? Math.round((levelConfig.totalPairs / totalDecisions) * 100)
        : 100;

    // Calculate clear bonuses
    const { clearBonus, timeBonus, accuracyBonus, totalBonus } = calculateLevelClearBonuses(
      timeLeft,
      accuracy
    );

    const finalRoundScore = score + totalBonus;
    setScore(finalRoundScore);

    const isNewRecord = finalRoundScore > stats.highestScore;

    const summary: RoundSummary = {
      level: currentLevel,
      mode: selectedMode,
      score: finalRoundScore,
      timeTaken: elapsedSeconds,
      accuracy,
      matches: levelConfig.totalPairs,
      mistakes,
      blunders: blundersCountRef.current,
      clearBonus,
      timeBonus,
      accuracyBonus,
      bestCombo: roundBestCombo,
      isNewRecord,
      title: selectedMode === 'time_attack' ? `WAVE ${currentLevel} CLEARED!` : 'LEVEL COMPLETE!',
    };

    trackGameCompleted(currentLevel, Math.round(elapsedSeconds), accuracy);
    setRoundSummary(summary);
    setGameState('level_complete');

    // Reward power-up on completing level (capped at 4)
    setPowerUps((prev) => {
      const types: PowerUpType[] = ['peek', 'freeze', 'shield'];
      const chosen = types[Math.floor(Math.random() * types.length)];
      return {
        ...prev,
        [chosen]: Math.min(4, prev[chosen] + 1),
      };
    });

    // Update lifetime stats with non-destructive daily history updates
    setStats((prev) => {
      const updated: UserStats = {
        ...prev,
        highestScore: Math.max(prev.highestScore, finalRoundScore),
        highestLevel: Math.max(prev.highestLevel, currentLevel + 1),
        bestCombo: Math.max(prev.bestCombo, roundBestCombo),
        bestStreak: Math.max(prev.bestStreak, currentLevel),
        totalMatches: prev.totalMatches + levelConfig.totalPairs,
      };

      if (selectedMode === 'classic') {
        updated.bestClassicScore = Math.max(prev.bestClassicScore, finalRoundScore);
      } else if (selectedMode === 'time_attack') {
        updated.bestTimeAttackScore = Math.max(prev.bestTimeAttackScore, finalRoundScore);
      } else if (selectedMode === 'daily_challenge') {
        updated.bestDailyScore = Math.max(prev.bestDailyScore, finalRoundScore);
        const todayStr = getTodayDateString();
        const existing = prev.dailyHistory[todayStr];
        const newDailyRecord: DailyResult = {
          date: todayStr,
          score: finalRoundScore,
          time: elapsedSeconds,
          mistakes,
          accuracy,
          completed: true,
          bestCombo: roundBestCombo,
        };
        // Preserve better previous scores
        if (
          !existing ||
          newDailyRecord.score > existing.score ||
          (newDailyRecord.score === existing.score && newDailyRecord.time < existing.time)
        ) {
          updated.dailyHistory = {
            ...prev.dailyHistory,
            [todayStr]: newDailyRecord,
          };
        }
      }

      return updated;
    });
  }, [
    clearActiveTimeouts,
    currentLevel,
    levelConfig.totalPairs,
    mistakes,
    roundBestCombo,
    roundStartTime,
    score,
    selectedMode,
    settings.soundEnabled,
    stats.highestScore,
    timeLeft,
  ]);

  // Handle timer expiration
  useEffect(() => {
    if (gameState === 'playing' && timeLeft <= 0 && !isFreezeActive && !isVictoryRef.current) {
      handleGameOver();
    }
  }, [gameState, timeLeft, isFreezeActive, handleGameOver]);

  // Card Click Interaction with Strict Synchronous Guards
  const handleCardClick = (clickedCard: CardItem) => {
    // Guards against rapid clicks, pause state, or clicking while evaluating / peeked
    if (gameState !== 'playing') return;
    if (evaluatingRef.current) return;
    if (activePeekRef.current) return;
    if (isVictoryRef.current) return;
    if (clickedCard.isFlipped || clickedCard.isMatched) return;
    if (activeSelectionRef.current.includes(clickedCard.id)) return;
    if (activeSelectionRef.current.length >= 2) return;

    if (settings.soundEnabled) soundManager.playCardFlip();

    // Mark as seen in player cognitive memory
    seenCardIdsRef.current.add(clickedCard.id);

    // Synchronously register click into active turn
    activeSelectionRef.current.push(clickedCard.id);

    // Flip the clicked card immediately
    setCards((prev) =>
      prev.map((c) => (c.id === clickedCard.id ? { ...c, isFlipped: true } : c))
    );

    // Case 1: First card in pair
    if (activeSelectionRef.current.length === 1) {
      setFirstCard(clickedCard);
      return;
    }

    // Case 2: Second card in pair
    setSecondCard(clickedCard);
    evaluatingRef.current = true;
    setIsEvaluating(true);

    const card1 = firstCard!;
    const isMatch = card1.pairId === clickedCard.pairId;

    if (isMatch) {
      // SUCCESSFUL MATCH!
      const now = Date.now();
      const elapsedSinceLastMatch = (now - lastMatchTimestampRef.current) / 1000;
      lastMatchTimestampRef.current = now;

      // Speed bonus
      const speedBonus = calculateSpeedBonus(elapsedSinceLastMatch);

      // Consecutive Match calculation (consecutive >= 1 -> 1.25x, 1.5x, up to 2.5x)
      const nextConsecutive = consecutiveMatches + 1;
      setConsecutiveMatches(nextConsecutive);

      const multiplier = calculateComboMultiplier(nextConsecutive);
      setCombo(multiplier);
      setComboTimeLeft(levelConfig.comboWindowSec);
      setRoundBestCombo((prev) => Math.max(prev, multiplier));

      const pointsEarned = calculateMatchScore(speedBonus, multiplier);
      setScore((prev) => prev + pointsEarned);

      // Play audio feedback
      if (settings.soundEnabled) {
        soundManager.playMatchSuccess();
        if (multiplier > 1.25) {
          soundManager.playCombo(Math.round(multiplier * 2));
        }
      }

      // Bonus power-up reward for reaching high combo
      if (nextConsecutive === 4 || nextConsecutive === 7) {
        setPowerUps((prev) => ({ ...prev, freeze: Math.min(4, prev.freeze + 1) }));
        triggerFloatingFeedback('+1 FREEZE!', 'bg-cyan-500 text-slate-950 border-cyan-300', 'Streak Reward!', 50, 35);
      }

      // Floating Feedback
      const feedbackText =
        multiplier >= 2.25
          ? 'UNSTOPPABLE! 🔥'
          : multiplier >= 1.5
          ? `COMBO ×${multiplier.toFixed(2)}!`
          : speedBonus >= 40
          ? 'RAPID RECALL! ⚡'
          : 'MATCH!';

      const feedbackColor =
        multiplier >= 2.0
          ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/40'
          : multiplier >= 1.5
          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30'
          : 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-500/30';

      triggerFloatingFeedback(`+${pointsEarned}`, feedbackColor, feedbackText);

      // In Time Attack: reward bonus time (+4 seconds)
      if (selectedMode === 'time_attack') {
        setTimeLeft((prev) => prev + 4);
        triggerFloatingFeedback('+4s', 'bg-cyan-500 text-slate-950 border-cyan-300', 'Bonus Time', 80, 20);
      }

      // Mark matched cards in board
      setCards((prev) =>
        prev.map((c) =>
          c.id === card1.id || c.id === clickedCard.id
            ? { ...c, isFlipped: true, isMatched: true }
            : c
        )
      );

      const nextMatchedCount = matchedPairs + 1;
      setMatchedPairs(nextMatchedCount);

      // Reset selection synchronously
      activeSelectionRef.current = [];
      evaluatingRef.current = false;
      setFirstCard(null);
      setSecondCard(null);
      setIsEvaluating(false);

      // Check for level completion
      if (nextMatchedCount >= levelConfig.totalPairs) {
        isVictoryRef.current = true; // Synchronous victory lock
        levelCompleteTimeoutRef.current = window.setTimeout(() => {
          handleLevelComplete();
          levelCompleteTimeoutRef.current = null;
        }, 400);
      }
    } else {
      // MISMATCH!
      setMistakes((prev) => prev + 1);

      if (isShieldActive) {
        // Shield absorbs blunder and preserves combo
        setIsShieldActive(false);
        if (settings.soundEnabled) soundManager.playPowerUp();
        triggerFloatingFeedback(
          'SHIELD SAVED COMBO! 🛡️',
          'bg-emerald-400 text-slate-950 border-emerald-300 shadow-emerald-500/40',
          'Mistake absorbed'
        );
      } else {
        // Check if this mismatch was an honest blunder:
        // A blunder occurs if the twin was already seen earlier, but forgotten!
        const card1Twin = cards.find((c) => c.pairId === card1.pairId && c.id !== card1.id);
        const clickedTwin = cards.find((c) => c.pairId === clickedCard.pairId && c.id !== clickedCard.id);
        const wasTwinAlreadySeen =
          (card1Twin && seenCardIdsRef.current.has(card1Twin.id) && card1Twin.id !== clickedCard.id) ||
          (clickedTwin && seenCardIdsRef.current.has(clickedTwin.id) && clickedTwin.id !== card1.id);

        if (wasTwinAlreadySeen) {
          blundersCountRef.current += 1;
        }

        // Break combo
        setCombo(1);
        setConsecutiveMatches(0);
        setComboTimeLeft(0);

        // Score penalty (-20 points, clamped to >= 0)
        setScore((prev) => Math.max(0, prev - 20));

        if (settings.soundEnabled) soundManager.playWrongMatch();

        // In Time Attack: deduct 2 seconds penalty
        if (selectedMode === 'time_attack') {
          setTimeLeft((prev) => Math.max(0, prev - 2));
          triggerFloatingFeedback('-2s', 'bg-rose-600 text-white border-rose-400', 'Time Penalty', 80, 20);
        }
      }

      // Trigger shake animation on the two cards
      setCards((prev) =>
        prev.map((c) =>
          c.id === card1.id || c.id === clickedCard.id
            ? { ...c, isShaking: true }
            : c
        )
      );

      // Flip back after mismatch delay
      evalTimeoutRef.current = window.setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === card1.id || c.id === clickedCard.id
              ? { ...c, isFlipped: false, isShaking: false }
              : c
          )
        );
        activeSelectionRef.current = [];
        evaluatingRef.current = false;
        setFirstCard(null);
        setSecondCard(null);
        setIsEvaluating(false);
        evalTimeoutRef.current = null;
      }, levelConfig.mismatchDelayMs);
    }
  };

  // POWER-UPS HANDLERS
  const handleUsePowerUp = useCallback((type: PowerUpType) => {
    if (
      powerUps[type] <= 0 ||
      evaluatingRef.current ||
      activePeekRef.current ||
      gameState !== 'playing' ||
      isVictoryRef.current
    ) {
      return;
    }

    trackPowerUpUsed(type);

    if (type === 'peek') {
      // RADAR / TWIN REVEAL: Intelligently highlights the twin of active card or 1 unknown pair
      if (settings.soundEnabled) soundManager.playPowerUp();

      setPowerUps((prev) => ({ ...prev, peek: prev.peek - 1 }));
      activePeekRef.current = true;
      setIsPeekActive(true);

      const unmatched = cards.filter((c) => !c.isMatched);
      let idsToReveal: string[] = [];

      if (firstCard) {
        // Reveal twin of currently flipped card
        const twin = unmatched.find((c) => c.id !== firstCard.id && c.pairId === firstCard.pairId);
        if (twin) idsToReveal = [twin.id];
      } else if (unmatched.length >= 2) {
        // Reveal 1 random pair
        const sampleCard = unmatched[Math.floor(Math.random() * unmatched.length)];
        const twin = unmatched.find((c) => c.id !== sampleCard.id && c.pairId === sampleCard.pairId);
        if (sampleCard && twin) idsToReveal = [sampleCard.id, twin.id];
      }

      setCards((prev) =>
        prev.map((c) => (idsToReveal.includes(c.id) ? { ...c, isPeeked: true } : c))
      );

      triggerFloatingFeedback('RADAR SCAN! 📡', 'bg-amber-500 text-slate-950 border-amber-300', 'Twin located');

      peekTimeoutRef.current = window.setTimeout(() => {
        setCards((prev) => prev.map((c) => ({ ...c, isPeeked: false })));
        activePeekRef.current = false;
        setIsPeekActive(false);
        peekTimeoutRef.current = null;
      }, 1500);
    } else if (type === 'freeze') {
      if (isFreezeActive) return;
      if (settings.soundEnabled) soundManager.playFreeze();

      setPowerUps((prev) => ({ ...prev, freeze: prev.freeze - 1 }));
      setIsFreezeActive(true);
      setFreezeTimeLeft(5);

      triggerFloatingFeedback('TIME FROZEN! ❄️', 'bg-cyan-500 text-slate-950 border-cyan-300', '+5s Freeze & Combo Lock');
    } else if (type === 'shield') {
      if (isShieldActive) return;
      if (settings.soundEnabled) soundManager.playPowerUp();

      setPowerUps((prev) => ({ ...prev, shield: prev.shield - 1 }));
      setIsShieldActive(true);

      triggerFloatingFeedback('SHIELD ACTIVE! 🛡️', 'bg-emerald-500 text-slate-950 border-emerald-300', 'Absorbs next mistake');
    }
  }, [
    cards,
    firstCard,
    gameState,
    isFreezeActive,
    isShieldActive,
    powerUps,
    settings.soundEnabled,
    triggerFloatingFeedback,
  ]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
          handlePause();
        } else if (gameState === 'paused') {
          handleResume();
        } else if (gameState === 'how_to_play' || gameState === 'settings' || gameState === 'daily_challenge') {
          setGameState('home');
        }
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleSound();
      } else if (gameState === 'playing') {
        if (e.key === '1') {
          handleUsePowerUp('peek');
        } else if (e.key === '2') {
          handleUsePowerUp('freeze');
        } else if (e.key === '3') {
          handleUsePowerUp('shield');
        }
      }

      // Self-testing hotkey (Shift + T)
      if (e.shiftKey && (e.key === 'T' || e.key === 't')) {
        const testReport = runAllGameLogicTests();
        triggerFloatingFeedback(
          `${testReport.passedCount} Tests Passed! ✅`,
          'bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-500/40',
          `Ran in ${testReport.durationMs}ms`,
          50,
          25
        );
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState, handlePause, handleResume, handleToggleSound, handleUsePowerUp, triggerFloatingFeedback]);

  return (
    <div
      id="app-root-container"
      className={`min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-between relative overflow-x-hidden ${
        settings.reducedMotion ? 'reduced-motion' : ''
      }`}
    >
      {/* Background Animated Particles */}
      <BackgroundParticles reducedMotion={settings.reducedMotion} />

      {/* Floating Feedback Popups */}
      <FloatingFeedback items={floatingFeedbacks} />

      {/* Frost Freeze Screen Overlay Effect */}
      {isFreezeActive && (
        <div
          id="frost-freeze-overlay"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 border-[4px] sm:border-[8px] border-cyan-400/50 shadow-[inset_0_0_90px_rgba(34,211,238,0.3)] transition-all duration-300 animate-pulse"
        >
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/80 text-cyan-300 text-xs font-black tracking-wider uppercase font-display flex items-center gap-1.5 shadow-lg shadow-cyan-500/30">
            <span>❄️ TIME FROZEN ({Math.ceil(freezeTimeLeft)}s)</span>
          </div>
        </div>
      )}

      {/* VIEW: HOME SCREEN */}
      {gameState === 'home' && (
        <HomeScreen
          stats={stats}
          settings={settings}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          onStartGame={handleStartGame}
          onOpenDaily={() => setGameState('daily_challenge')}
          onOpenHowToPlay={() => setGameState('how_to_play')}
          onOpenSettings={() => setGameState('settings')}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* VIEW: GAME PLAYING / PAUSED */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <main
          id="active-game-container"
          className="relative z-10 w-full flex-1 flex flex-col items-center justify-between max-w-4xl mx-auto py-2 px-2 select-none"
        >
          {/* Game HUD */}
          <GameHUD
            level={currentLevel}
            mode={selectedMode}
            score={score}
            timeLeft={Math.ceil(timeLeft)}
            matchedPairs={matchedPairs}
            totalPairs={levelConfig.totalPairs}
            soundEnabled={settings.soundEnabled}
            isPaused={gameState === 'paused'}
            isFrozen={isFreezeActive}
            isShieldActive={isShieldActive}
            onTogglePause={() => (gameState === 'paused' ? handleResume() : handlePause())}
            onToggleSound={handleToggleSound}
          />

          {/* Combo Meter */}
          <div className="w-full px-4 my-1">
            <ComboMeter
              combo={combo}
              comboTimeLeft={comboTimeLeft}
              maxComboTime={maxComboWindow}
            />
          </div>

          {/* Board Grid */}
          <div className="w-full flex-1 flex items-center justify-center my-auto">
            <MemoryBoard
              cards={cards}
              gridCols={levelConfig.gridCols}
              gridRows={levelConfig.gridRows}
              onCardClick={handleCardClick}
              isEvaluating={isEvaluating}
              isPeekActive={isPeekActive}
              isPaused={gameState === 'paused'}
            />
          </div>

          {/* Power-ups Bar */}
          <footer className="w-full max-w-md mx-auto my-1">
            <PowerUpsBar
              counts={powerUps}
              isFreezeActive={isFreezeActive}
              freezeTimeLeft={Math.ceil(freezeTimeLeft)}
              isPeekActive={isPeekActive}
              isEvaluating={isEvaluating}
              isShieldActive={isShieldActive}
              onUsePowerUp={handleUsePowerUp}
              disabled={gameState !== 'playing'}
            />
          </footer>
        </main>
      )}

      {/* MODAL: LEVEL COMPLETE */}
      {gameState === 'level_complete' && roundSummary && (
        <LevelCompleteModal
          summary={roundSummary}
          reducedMotion={settings.reducedMotion}
          onNextLevel={() => startRound(currentLevel + 1, selectedMode, false)}
          onHome={() => setGameState('home')}
        />
      )}

      {/* MODAL: GAME OVER */}
      {gameState === 'game_over' && roundSummary && (
        <GameOverModal
          summary={roundSummary}
          onTryAgain={() => startRound(1, selectedMode, true)}
          onHome={() => setGameState('home')}
        />
      )}

      {/* MODAL: DAILY CHALLENGE */}
      {gameState === 'daily_challenge' && (
        <DailyChallengeModal
          stats={stats}
          onPlayDaily={handlePlayDaily}
          onClose={() => setGameState('home')}
        />
      )}

      {/* MODAL: HOW TO PLAY */}
      {gameState === 'how_to_play' && (
        <HowToPlayModal onClose={() => setGameState('home')} />
      )}

      {/* MODAL: SETTINGS */}
      {gameState === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onResetProgress={() => {
            const freshStats = clearUserProgress();
            setStats(freshStats);
          }}
          onClose={() => setGameState('home')}
        />
      )}

      {/* MODAL: PAUSE */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={() => startRound(currentLevel, selectedMode, true)}
          onHome={() => setGameState('home')}
          soundEnabled={settings.soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}
    </div>
  );
}
