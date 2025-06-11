import { create } from 'zustand';
import { GAME_CONSTANTS } from '@/constants/game';
import type { GameState } from '@/types/game';

interface GameStore extends GameState {
  // Actions
  startGame: () => void;
  resetGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  setNextColorIndex: (index: number) => void;
  setPerfectRainbowCount: (count: number) => void;
  setPerfectRainbowProgress: (progress: number) => void;
  setGameSpeed: (speed: number) => void;
  setIsRainShower: (isRainShower: boolean) => void;
  setRainShowerEndTime: (time: number) => void;
  setIsAutoCollecting: (isAutoCollecting: boolean) => void;
  setAutoCollectEndTime: (time: number) => void;
  setCloudSpeedBoostEndTime: (time: number) => void;
  setCloudFreezeEndTime: (time: number) => void;
  setCloudReverseEndTime: (time: number) => void;
  setDoublePointsEndTime: (time: number) => void;
  setShowPerfectRainbowLost: (show: boolean) => void;
  setPerfectRainbowLostTime: (time: number) => void;
  setIsPointerLocked: (isLocked: boolean) => void;
  setShowSpeedBoostMessage: (show: boolean) => void;
  setSpeedBoostMessageEndTime: (time: number) => void;
  setShowAutoCollectMessage: (show: boolean) => void;
  setAutoCollectMessageEndTime: (time: number) => void;
  setShowFreezeMessage: (show: boolean) => void;
  setFreezeMessageEndTime: (time: number) => void;
  setShowReverseMessage: (show: boolean) => void;
  setReverseMessageEndTime: (time: number) => void;
  setShowDoublePointsMessage: (show: boolean) => void;
  setDoublePointsMessageEndTime: (time: number) => void;
  setTimeOfDay: (timeOfDay: 'day' | 'night') => void;
  updateGameState: (updates: Partial<GameState>) => void;
}

const initialGameState: GameState = {
  state: 'menu',
  score: 0,
  missedDrops: 0,
  nextColorIndex: 0,
  gameSpeed: 1,
  lives: GAME_CONSTANTS.MAX_LIVES,
  perfectRainbowCount: 0,
  isAutoCollecting: false,
  autoCollectEndTime: 0,
  cloudSpeedBoostEndTime: 0,
  cloudFreezeEndTime: 0,
  cloudReverseEndTime: 0,
  doublePointsEndTime: 0,
  isRainShower: false,
  rainShowerEndTime: 0,
  nextRainShowerTime: 0,
  perfectRainbowProgress: 0,
  showPerfectRainbowLost: false,
  perfectRainbowLostTime: 0,
  isPointerLocked: false,
  lightningFlash: false,
  nextLightningTime: 0,
  showSpeedBoostMessage: false,
  speedBoostMessageEndTime: 0,
  showAutoCollectMessage: false,
  autoCollectMessageEndTime: 0,
  showFreezeMessage: false,
  freezeMessageEndTime: 0,
  showReverseMessage: false,
  reverseMessageEndTime: 0,
  showDoublePointsMessage: false,
  doublePointsMessageEndTime: 0,
  timeOfDay: 'day',
  manualRainShowerOnly: true,
  isPaused: false, // New state for pause functionality
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialGameState,

  // Actions
  startGame: () => {
    const now = Date.now();
    set({
      state: 'playing',
      score: 0,
      missedDrops: 0,
      nextColorIndex: 0,
      gameSpeed: 1,
      lives: GAME_CONSTANTS.MAX_LIVES,
      perfectRainbowCount: 0,
      isAutoCollecting: false,
      autoCollectEndTime: 0,
      cloudSpeedBoostEndTime: 0,
      cloudFreezeEndTime: 0,
      cloudReverseEndTime: 0,
      doublePointsEndTime: 0,
      isRainShower: false,
      rainShowerEndTime: 0,
      nextRainShowerTime: 0,
      perfectRainbowProgress: 0,
      showPerfectRainbowLost: false,
      perfectRainbowLostTime: 0,
      isPointerLocked: false,
      lightningFlash: false,
      nextLightningTime: now + 2000,
      showSpeedBoostMessage: false,
      speedBoostMessageEndTime: 0,
      showAutoCollectMessage: false,
      autoCollectMessageEndTime: 0,
      showFreezeMessage: false,
      freezeMessageEndTime: 0,
      showReverseMessage: false,
      reverseMessageEndTime: 0,
      showDoublePointsMessage: false,
      doublePointsMessageEndTime: 0,
      timeOfDay: 'day',
      manualRainShowerOnly: true,
      isPaused: false,
    });
  },

  resetGame: () => set({ state: 'menu', isPaused: false }),

  pauseGame: () => set({ isPaused: true }),

  resumeGame: () => set({ isPaused: false }),

  setScore: (score) => set({ score }),

  setLives: (lives) => set({ lives }),

  setNextColorIndex: (nextColorIndex) => set({ nextColorIndex }),

  setPerfectRainbowCount: (perfectRainbowCount) => set({ perfectRainbowCount }),

  setPerfectRainbowProgress: (perfectRainbowProgress) => set({ perfectRainbowProgress }),

  setGameSpeed: (gameSpeed) => set({ gameSpeed }),

  setIsRainShower: (isRainShower) => set({ isRainShower }),

  setRainShowerEndTime: (rainShowerEndTime) => set({ rainShowerEndTime }),

  setIsAutoCollecting: (isAutoCollecting) => set({ isAutoCollecting }),

  setAutoCollectEndTime: (autoCollectEndTime) => set({ autoCollectEndTime }),

  setCloudSpeedBoostEndTime: (cloudSpeedBoostEndTime) => set({ cloudSpeedBoostEndTime }),

  setCloudFreezeEndTime: (cloudFreezeEndTime) => set({ cloudFreezeEndTime }),

  setCloudReverseEndTime: (cloudReverseEndTime) => set({ cloudReverseEndTime }),

  setDoublePointsEndTime: (doublePointsEndTime) => set({ doublePointsEndTime }),

  setShowPerfectRainbowLost: (showPerfectRainbowLost) => set({ showPerfectRainbowLost }),

  setPerfectRainbowLostTime: (perfectRainbowLostTime) => set({ perfectRainbowLostTime }),

  setIsPointerLocked: (isPointerLocked) => set({ isPointerLocked }),

  setShowSpeedBoostMessage: (showSpeedBoostMessage) => set({ showSpeedBoostMessage }),

  setSpeedBoostMessageEndTime: (speedBoostMessageEndTime) => set({ speedBoostMessageEndTime }),

  setShowAutoCollectMessage: (showAutoCollectMessage) => set({ showAutoCollectMessage }),

  setAutoCollectMessageEndTime: (autoCollectMessageEndTime) => set({ autoCollectMessageEndTime }),

  setShowFreezeMessage: (showFreezeMessage) => set({ showFreezeMessage }),

  setFreezeMessageEndTime: (freezeMessageEndTime) => set({ freezeMessageEndTime }),

  setShowReverseMessage: (showReverseMessage) => set({ showReverseMessage }),

  setReverseMessageEndTime: (reverseMessageEndTime) => set({ reverseMessageEndTime }),

  setShowDoublePointsMessage: (showDoublePointsMessage) => set({ showDoublePointsMessage }),

  setDoublePointsMessageEndTime: (doublePointsMessageEndTime) => set({ doublePointsMessageEndTime }),

  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),

  // Batch update for multiple state changes
  updateGameState: (updates) => set(updates),
}));
