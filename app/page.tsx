'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Cloud, ColorDrop, GameState } from '../types/game';
import { useParticleSystem } from '../components/particle-system';
import { useDropSystem } from '../components/drop-system';
import { useGameCanvas } from '../components/game-canvas';
import { useDamageEffect } from '../components/damage-effect';
import { useWeatherEffects } from '../components/weather-effects';
import { GameUI, GameStats } from '../components/game-ui';
import { GAME_CONSTANTS } from '../constants/game';

export default function RainbowCatcher() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const mouseXRef = useRef<number>(0);
  const damageFlashRef = useRef<number>(0);
  const heartDroppedForMilestoneRef = useRef<Set<number>>(new Set());

  const [gameState, setGameState] = useState<GameState>({
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
    cloudSlowEndTime: 0, // New
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
    showSlowMessage: false, // New
    slowMessageEndTime: 0, // New
    timeOfDay: 'day', // New
  });

  const [highScore, setHighScore] = useState(0);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const cloudRef = useRef<Cloud>({
    x: 400,
    y: GAME_CONSTANTS.CLOUD_Y_POSITION,
    width: 80,
    height: 40,
    speedMultiplier: 1,
  });

  const { createCatchParticles, createPerfectRainbowEffect, createRainbowLostEffect, updateAndDrawParticles, clearParticles } = useParticleSystem();
  const { colorDropsRef, updateDrops, clearDrops } = useDropSystem();
  const { renderGame } = useGameCanvas();
  const { createDamageText, updateAndDrawDamageTexts, clearDamageTexts } = useDamageEffect();
  const {
    updateWeatherEffects,
    drawWeatherEffects,
    clearWeatherEffects,
    isLightningFlash,
    initBackgroundClouds,
    initWeatherElements,
    initStars,
    updateStars,
    drawStars,
  } = useWeatherEffects();

  const checkCollision = useCallback((cloud: Cloud, drop: ColorDrop): boolean => {
    const cloudCenterX = cloud.x;
    const cloudCenterY = cloud.y;
    const distance = Math.sqrt(Math.pow(drop.x - cloudCenterX, 2) + Math.pow(drop.y - cloudCenterY, 2));
    return distance < GAME_CONSTANTS.CLOUD_COLLISION_RADIUS;
  }, []);

  const loadHighScore = useCallback(() => {
    const savedScore = localStorage.getItem('rainbowCatcherHighScore');
    if (savedScore) {
      setHighScore(Number.parseInt(savedScore, 10));
    }
  }, []);

  const saveHighScore = useCallback(
    (newScore: number) => {
      if (newScore > highScore) {
        localStorage.setItem('rainbowCatcherHighScore', newScore.toString());
        setHighScore(newScore);
        return true;
      }
      return false;
    },
    [highScore],
  );

  const autoCollectColors = useCallback(() => {
    const drops = colorDropsRef.current;
    let collectedCount = 0;

    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      if (drop.type === 'normal') {
        createCatchParticles(drop.x, drop.y, drop.color);

        let points = GAME_CONSTANTS.NORMAL_DROP_POINTS;
        if (drop.colorIndex === gameState.nextColorIndex) {
          points += GAME_CONSTANTS.CORRECT_ORDER_BONUS;
          setGameState((prev) => ({
            ...prev,
            nextColorIndex: (prev.nextColorIndex + 1) % 7,
            perfectRainbowProgress: prev.perfectRainbowProgress + 1,
          }));
        }

        const multiplier = gameState.isRainShower ? 2 : 1;
        setGameState((prev) => ({ ...prev, score: prev.score + points * multiplier }));

        drops.splice(i, 1);
        collectedCount++;
      }
    }

    return collectedCount;
  }, [createCatchParticles, gameState.nextColorIndex, gameState.isRainShower]);

  const resetPerfectRainbow = useCallback((showMessage = true) => {
    setGameState((prev) => ({
      ...prev,
      nextColorIndex: 0,
      perfectRainbowProgress: 0,
      showPerfectRainbowLost: showMessage,
      perfectRainbowLostTime: showMessage ? Date.now() + 2000 : 0,
    }));
  }, []);

  const updateGame = useCallback(() => {
    if (gameState.state !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = Date.now();

    // Update damage flash
    if (damageFlashRef.current > 0) {
      damageFlashRef.current--;
    }

    // Update weather effects and stars
    updateWeatherEffects(gameState.isRainShower);
    if (gameState.timeOfDay === 'night') {
      updateStars();
    }

    // Update power-ups and effects
    setGameState((prev) => {
      const newState = { ...prev };

      // Update cloud speed boost
      if (now > prev.cloudSpeedBoostEndTime) {
        cloudRef.current.speedMultiplier = Math.max(cloudRef.current.speedMultiplier, 1);
      }

      // Update cloud slow effect
      if (now > prev.cloudSlowEndTime) {
        if (cloudRef.current.speedMultiplier < 1) {
          cloudRef.current.speedMultiplier = 1;
        }
      }

      // Update auto-collect
      if (prev.isAutoCollecting && now > prev.autoCollectEndTime) {
        newState.isAutoCollecting = false;
      }

      // Update rain shower
      if (prev.isRainShower && now > prev.rainShowerEndTime) {
        newState.isRainShower = false;
        newState.nextRainShowerTime = now + GAME_CONSTANTS.RAIN_SHOWER_INTERVAL;
      } else if (!prev.isRainShower && now > prev.nextRainShowerTime) {
        newState.isRainShower = true;
        newState.rainShowerEndTime = now + GAME_CONSTANTS.RAIN_SHOWER_DURATION;
      }

      // Update perfect rainbow lost message
      if (prev.showPerfectRainbowLost && now > prev.perfectRainbowLostTime) {
        newState.showPerfectRainbowLost = false;
      }

      // Update power-up messages
      if (prev.showSpeedBoostMessage && now > prev.speedBoostMessageEndTime) {
        newState.showSpeedBoostMessage = false;
      }

      if (prev.showAutoCollectMessage && now > prev.autoCollectMessageEndTime) {
        newState.showAutoCollectMessage = false;
      }

      if (prev.showSlowMessage && now > prev.slowMessageEndTime) {
        newState.showSlowMessage = false;
      }

      // Check for day/night cycle change
      const currentCycle = Math.floor(prev.perfectRainbowCount / GAME_CONSTANTS.PERFECT_RAINBOWS_FOR_NIGHT);
      const newTimeOfDay = currentCycle % 2 === 0 ? 'day' : 'night';
      if (newTimeOfDay !== prev.timeOfDay) {
        newState.timeOfDay = newTimeOfDay;
      }

      return newState;
    });

    // Auto-collect during power-up
    if (gameState.isAutoCollecting) {
      autoCollectColors();
    }

    // Update cloud position with improved mouse control
    const cloud = cloudRef.current;
    if (mouseXRef.current > 0) {
      const targetX = Math.max(GAME_CONSTANTS.CLOUD_MIN_X, Math.min(GAME_CONSTANTS.CLOUD_MAX_X, mouseXRef.current));
      const diff = targetX - cloud.x;
      const responsiveness = gameState.isPointerLocked ? GAME_CONSTANTS.MOUSE_RESPONSIVENESS_LOCKED : GAME_CONSTANTS.MOUSE_RESPONSIVENESS;
      cloud.x += diff * responsiveness * cloud.speedMultiplier;
    }

    // Update drops - pass perfect rainbow count for heart drop logic
    updateDrops(gameState.gameSpeed, gameState.isRainShower, gameState.perfectRainbowCount);

    // Handle collisions and drop removal
    const drops = colorDropsRef.current;
    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      drop.y += drop.speed;

      // Check collision
      if (checkCollision(cloud, drop)) {
        handleDropCatch(drop, now);
        drops.splice(i, 1);
        continue;
      }

      // Remove drops that fell off screen
      if (drop.y > GAME_CONSTANTS.CANVAS_HEIGHT + 20) {
        handleDropMiss(drop);
        drops.splice(i, 1);
      }
    }

    // Increase game speed over time
    setGameState((prev) => ({ ...prev, gameSpeed: Math.min(3, prev.gameSpeed + 0.001) }));

    // Render everything
    renderGame(
      ctx,
      gameState,
      cloud,
      drops,
      updateAndDrawParticles,
      updateAndDrawDamageTexts,
      drawWeatherEffects,
      drawStars,
      isLightningFlash(),
      damageFlashRef.current > 0,
    );
  }, [
    gameState,
    updateDrops,
    updateWeatherEffects,
    updateStars,
    checkCollision,
    autoCollectColors,
    renderGame,
    updateAndDrawParticles,
    updateAndDrawDamageTexts,
    drawWeatherEffects,
    drawStars,
    isLightningFlash,
  ]);

  const handleDropCatch = useCallback(
    (drop: ColorDrop, now: number) => {
      createCatchParticles(drop.x, drop.y, drop.color);

      if (drop.type === 'golden') {
        // Golden drop: speed boost
        cloudRef.current.speedMultiplier = GAME_CONSTANTS.CLOUD_SPEED_BOOST_MULTIPLIER;
        setGameState((prev) => ({
          ...prev,
          cloudSpeedBoostEndTime: now + GAME_CONSTANTS.SPEED_BOOST_DURATION,
          showSpeedBoostMessage: true,
          speedBoostMessageEndTime: now + 1500,
        }));
      } else if (drop.type === 'black') {
        // Black bomb: lose life with damage effect and reset perfect rainbow
        damageFlashRef.current = GAME_CONSTANTS.DAMAGE_FLASH_DURATION;
        createDamageText(cloudRef.current.x, cloudRef.current.y - 30);
        createRainbowLostEffect(cloudRef.current.x, cloudRef.current.y);
        resetPerfectRainbow(true);

        setGameState((prev) => {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            saveHighScore(prev.score);
            setShowGameOverDialog(true);
            return { ...prev, lives: 0, state: 'gameOver' };
          }
          return { ...prev, lives: newLives };
        });
      } else if (drop.type === 'hail') {
        // Hail: slow down cloud instead of losing life
        cloudRef.current.speedMultiplier = GAME_CONSTANTS.CLOUD_SLOW_MULTIPLIER;
        setGameState((prev) => ({
          ...prev,
          cloudSlowEndTime: now + GAME_CONSTANTS.HAIL_SLOW_DURATION,
          showSlowMessage: true,
          slowMessageEndTime: now + 1500,
        }));
      } else if (drop.type === 'rainbow') {
        // Rainbow drop: auto-collect
        setGameState((prev) => ({
          ...prev,
          isAutoCollecting: true,
          autoCollectEndTime: now + GAME_CONSTANTS.AUTO_COLLECT_DURATION,
          score: prev.score + GAME_CONSTANTS.RAINBOW_DROP_POINTS,
          showAutoCollectMessage: true,
          autoCollectMessageEndTime: now + 1500,
        }));
      } else if (drop.type === 'heart') {
        // Heart drop: gain life (max 3)
        setGameState((prev) => ({
          ...prev,
          lives: Math.min(GAME_CONSTANTS.MAX_LIVES, prev.lives + 1),
          score: prev.score + 20,
        }));
      } else {
        // Normal drop logic remains the same
        let points = GAME_CONSTANTS.NORMAL_DROP_POINTS;
        let perfectRainbow = false;

        if (drop.colorIndex === gameState.nextColorIndex) {
          points += GAME_CONSTANTS.CORRECT_ORDER_BONUS;
          const newNextIndex = (gameState.nextColorIndex + 1) % 7;
          const newProgress = gameState.perfectRainbowProgress + 1;

          if (newNextIndex === 0 && gameState.nextColorIndex === 6) {
            // Completed perfect rainbow!
            points += GAME_CONSTANTS.PERFECT_RAINBOW_BONUS;
            perfectRainbow = true;
            createPerfectRainbowEffect(drop.x, drop.y);
          }

          setGameState((prev) => ({
            ...prev,
            nextColorIndex: newNextIndex,
            perfectRainbowProgress: perfectRainbow ? 0 : newProgress,
            perfectRainbowCount: perfectRainbow ? prev.perfectRainbowCount + 1 : prev.perfectRainbowCount,
            isAutoCollecting: perfectRainbow,
            autoCollectEndTime: perfectRainbow ? now + GAME_CONSTANTS.AUTO_COLLECT_DURATION : prev.autoCollectEndTime,
            showAutoCollectMessage: perfectRainbow,
            autoCollectMessageEndTime: perfectRainbow ? now + 1500 : prev.autoCollectMessageEndTime,
          }));
        }

        const multiplier = gameState.isRainShower ? 2 : 1;
        setGameState((prev) => ({ ...prev, score: prev.score + points * multiplier }));
      }
    },
    [
      createCatchParticles,
      createPerfectRainbowEffect,
      createRainbowLostEffect,
      createDamageText,
      resetPerfectRainbow,
      gameState.nextColorIndex,
      gameState.perfectRainbowProgress,
      gameState.isRainShower,
      saveHighScore,
    ],
  );

  const handleDropMiss = useCallback((drop: ColorDrop) => {
    // Only reset perfect rainbow if missing the target color - REMOVED
    // Now only bombs reset the perfect rainbow progress
  }, []);

  const startGame = useCallback(() => {
    const now = Date.now();
    setGameState({
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
      cloudSlowEndTime: 0, // New
      isRainShower: false,
      rainShowerEndTime: 0,
      nextRainShowerTime: now + GAME_CONSTANTS.RAIN_SHOWER_INTERVAL,
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
      showSlowMessage: false, // New
      slowMessageEndTime: 0, // New
      timeOfDay: 'day', // New
    });
    clearDrops();
    clearParticles();
    clearDamageTexts();
    clearWeatherEffects();
    heartDroppedForMilestoneRef.current.clear();
    damageFlashRef.current = 0;
    cloudRef.current = {
      x: 400,
      y: GAME_CONSTANTS.CLOUD_Y_POSITION,
      width: 80,
      height: 40,
      speedMultiplier: 1,
    };
    loadHighScore();
    setShowGameOverDialog(false);
  }, [clearDrops, clearParticles, clearDamageTexts, clearWeatherEffects, loadHighScore]);

  const resetGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, state: 'menu' }));
    setShowGameOverDialog(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    // Release pointer lock if active
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      updateGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState.state === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.state, updateGame]);

  // Mouse controls and pointer lock
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
      if (gameState.isPointerLocked) {
        // Use movement for locked pointer
        mouseXRef.current = Math.max(GAME_CONSTANTS.CLOUD_MIN_X, Math.min(GAME_CONSTANTS.CLOUD_MAX_X, cloudRef.current.x + e.movementX));
      } else {
        // Use absolute position for unlocked pointer
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        mouseXRef.current = e.clientX - rect.left;
      }
    },
    [gameState.isPointerLocked],
  );

  const handleCanvasClick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState.state !== 'playing') return;

    // Request pointer lock
    if (!gameState.isPointerLocked) {
      canvas.requestPointerLock();
    }
  }, [gameState.state, gameState.isPointerLocked]);

  // Handle pointer lock changes
  useEffect(() => {
    const handlePointerLockChange = () => {
      setGameState((prev) => ({
        ...prev,
        isPointerLocked: document.pointerLockElement === canvasRef.current,
      }));
    };

    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (document.pointerLockElement === canvasRef.current) {
        handleMouseMove(e);
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMoveGlobal);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
    };
  }, [handleMouseMove]);

  const handleMouseLeave = useCallback(() => {
    if (!gameState.isPointerLocked) {
      mouseXRef.current = 0;
    }
  }, [gameState.isPointerLocked]);

  // Initialize weather effects and stars
  useEffect(() => {
    initBackgroundClouds();
    initWeatherElements();
    initStars();
  }, [initBackgroundClouds, initWeatherElements, initStars]);

  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  // Update background class to support day/night cycle
  const getBackgroundClass = () => {
    if (gameState.timeOfDay === 'night') {
      return gameState.isRainShower ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black';
    } else {
      return gameState.isRainShower ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800' : 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()} flex flex-col items-center justify-center p-4 transition-all duration-1000`}>
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">🌈 Rainbow Catcher</h1>
        <p className="text-white/90 text-xl">Control the cloud to catch falling rainbow colors!</p>
        <div className="mt-2">
          <Link href="/rules">
            <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              📖 Game Rules
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-white/95 to-purple-100/95 backdrop-blur-sm border-4 border-purple-300 shadow-2xl">
        <GameStats gameState={gameState} />

        <canvas
          ref={canvasRef}
          width={GAME_CONSTANTS.CANVAS_WIDTH}
          height={GAME_CONSTANTS.CANVAS_HEIGHT}
          className="border-4 border-purple-400 rounded-xl bg-gradient-to-b from-sky-100 to-blue-200 cursor-none shadow-inner"
          onMouseMove={gameState.isPointerLocked ? undefined : handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
        />

        <GameUI
          gameState={gameState}
          highScore={highScore}
          onStartGame={startGame}
          onResetGame={resetGame}
          showGameOverDialog={showGameOverDialog}
          onCloseGameOverDialog={() => setShowGameOverDialog(false)}
        />
      </Card>

      <div className="mt-4 text-center text-white/90 text-sm bg-black/20 rounded-lg p-3">
        <p className="font-bold">🌈 Catch rainbow colors: Red → Orange → Yellow → Green → Blue → Indigo → Violet</p>
        <p>⚡ Golden = Speed Boost | 💣 Black = Lose Life | 🌈 Rainbow = Auto-Collect | ❤️ Heart = Gain Life | ❄️ Hail = Lose Life</p>
        <p className="text-xs mt-2">🖱️ Click to lock cursor (ESC to unlock)</p>
      </div>

      {/* Author Section */}
      <div className="mt-4 text-center text-white/80 text-sm bg-black/20 rounded-lg p-3">
        <p className="font-semibold mb-1">🎮 Created by</p>
        <div className="flex items-center justify-center gap-4">
          <a href="https://github.com/minhduc5a15" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 transition-colors">
            👨‍💻 minhduc5a15
          </a>
          <span className="text-white/60">|</span>
          <a
            href="https://github.com/minhduc5a15/rainbow-catcher-game"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-300 hover:text-green-200 transition-colors"
          >
            📂 GitHub Repository
          </a>
        </div>
      </div>
    </div>
  );
}
