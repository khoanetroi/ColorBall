import { create } from 'zustand';
import type { BallColorCode } from './ColorSystem';

export type Difficulty = 'easy' | 'hard';

export const GameState = {
  Start: 0,
  Tutorial: 1,
  Playing: 2,
  GameOver: 3,
  Victory: 4,
} as const;

export type GameStateCode = (typeof GameState)[keyof typeof GameState];

export interface BallData {
  id: string;
  color: BallColorCode;
  position: [number, number, number];
  isMixed?: boolean;
}

export interface DragPointerState {
  origin: [number, number, number];
  direction: [number, number, number];
  distance: number;
}

type LevelConfig = {
  objective: string;
  targetScore: number;
};

const hardTimeLimits: Record<number, number> = {
  0: 0,
  1: 120,
  2: 150,
  3: 180,
};

const levelConfigs: Record<number, LevelConfig> = {
  0: {
    objective: 'Tutorial: learn the spawner, drag a ball, and deliver it.',
    targetScore: 3,
  },
  1: {
    objective: 'Level 1: Sort the 3 primary colors (Red, Blue, Yellow).',
    targetScore: 3,
  },
  2: {
    objective: 'Level 2: Mix primary colors to create secondary colors (Orange, Purple, Green).',
    targetScore: 3,
  },
  3: {
    objective: 'Level 3: Mix to create tertiary colors (Red-Orange, Red-Purple, etc.).',
    targetScore: 6,
  },
};

const getLevelConfig = (level: number): LevelConfig => levelConfigs[level] ?? levelConfigs[1];

const createBallId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

interface GameStore {
  level: number;
  score: number;
  targetScore: number;
  timeLeft: number;
  objective: string;
  gameState: GameStateCode;
  sceneSeed: number;
  balls: BallData[];
  combo: number;
  bestCombo: number;
  candyDispenseRequests: number;
  isDraggingGlobal: boolean;
  draggedBallId: string | null;
  dragPointer: DragPointerState | null;
  difficulty: Difficulty;
  addPoint: (points: number) => void;
  tick: (delta: number) => void;
  startTutorial: () => void;
  startLevel: (level: number) => void;
  advanceLevel: () => void;
  resetGame: () => void;
  spawnBall: (color: BallColorCode, position: [number, number, number], isMixed?: boolean) => void;
  removeBall: (id: string) => void;
  clearBalls: () => void;
  requestCandyDispense: () => void;
  setIsDraggingGlobal: (dragging: boolean) => void;
  setDraggedBallId: (id: string | null) => void;
  setDragPointer: (dragPointer: DragPointerState | null) => void;
  setDifficulty: (difficulty: Difficulty) => void;
}

const startLevelState = (level: number, sceneSeed: number, difficulty: Difficulty): Pick<GameStore, 'level' | 'score' | 'targetScore' | 'timeLeft' | 'objective' | 'gameState' | 'sceneSeed' | 'balls' | 'combo' | 'bestCombo'> => {
  const config = getLevelConfig(level);
  const timeLimit = difficulty === 'hard' ? (hardTimeLimits[level] ?? 0) : 0;

  return {
    level,
    score: 0,
    targetScore: config.targetScore,
    timeLeft: timeLimit,
    objective: config.objective,
    gameState: GameState.Playing,
    sceneSeed,
    balls: [],
    combo: 0,
    bestCombo: 0,
  };
};

export const useGameStore = create<GameStore>((set) => ({
  level: 1,
  score: 0,
  targetScore: levelConfigs[1].targetScore,
  timeLeft: 0,
  objective: levelConfigs[1].objective,
  gameState: GameState.Playing,
  sceneSeed: 0,
  balls: [],
  combo: 0,
  bestCombo: 0,
  candyDispenseRequests: 0,
  isDraggingGlobal: false,
  draggedBallId: null,
  dragPointer: null,
  difficulty: 'easy' as Difficulty,

  addPoint: (points) => set((state) => {
    if (points > 0) {
      const combo = state.combo + 1;
      const comboBonus = combo >= 3 ? Math.floor((combo - 1) / 3) : 0;
      const score = Math.max(0, state.score + points + comboBonus);

      return {
        score,
        combo,
        bestCombo: Math.max(state.bestCombo, combo),
        gameState: score >= state.targetScore ? GameState.Victory : state.gameState,
      };
    }

    const score = Math.max(0, state.score + points);

    return {
      score,
      combo: 0,
      gameState: score >= state.targetScore ? GameState.Victory : state.gameState,
    };
  }),

  tick: (delta) => set((state) => {
    if (state.gameState !== GameState.Playing || state.timeLeft <= 0) {
      return state;
    }

    const timeLeft = Math.max(0, state.timeLeft - delta);

    if (timeLeft <= 0 && state.targetScore > 0) {
      return {
        timeLeft: 0,
        gameState: GameState.GameOver,
      };
    }

    return { timeLeft };
  }),

  startTutorial: () => set((state) => ({ ...startLevelState(0, state.sceneSeed + 1, state.difficulty) })),

  startLevel: (level) => set((state) => ({ ...startLevelState(level, state.sceneSeed + 1, state.difficulty) })),

  advanceLevel: () => set((state) => {
    if (state.level >= 3) {
      return {
        gameState: GameState.Victory,
        sceneSeed: state.sceneSeed + 1,
      };
    }

    return { ...startLevelState(state.level + 1, state.sceneSeed + 1, state.difficulty) };
  }),

  resetGame: () => set((state) => ({ ...startLevelState(1, state.sceneSeed + 1, state.difficulty) })),

  spawnBall: (color, position, isMixed) => set((state) => {
    const MAX_BALLS = 18; // Increased slightly to accommodate complex mixing
    const newBalls = [...state.balls];
    
    if (newBalls.length >= MAX_BALLS) {
      // Find oldest ball that is NOT dragged and NOT mixed (if possible)
      const dropIndex = newBalls.findIndex((ball) => ball.id !== state.draggedBallId && !ball.isMixed);
      if (dropIndex !== -1) {
        newBalls.splice(dropIndex, 1);
      } else {
        // Fallback: just drop the oldest non-dragged ball
        const forceDropIndex = newBalls.findIndex((ball) => ball.id !== state.draggedBallId);
        if (forceDropIndex !== -1) {
          newBalls.splice(forceDropIndex, 1);
        } else {
          return state; // Edge case: cannot spawn
        }
      }
    }
    
    newBalls.push({ id: createBallId(), color, position, isMixed });
    return { balls: newBalls };
  }),

  removeBall: (id) => set((state) => ({
    balls: state.balls.filter((ball) => ball.id !== id),
  })),

  clearBalls: () => set({ balls: [] }),

  requestCandyDispense: () => set((state) => ({
    candyDispenseRequests: state.candyDispenseRequests + 1,
  })),

  setIsDraggingGlobal: (dragging) => set({ isDraggingGlobal: dragging }),

  setDraggedBallId: (id) => set({ 
    draggedBallId: id,
    isDraggingGlobal: id !== null
  }),

  setDragPointer: (dragPointer) => set({ dragPointer }),

  setDifficulty: (difficulty) => set({ difficulty }),
}));