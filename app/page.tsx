'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { NEXT_RAIN_SHOWER_TIME, RAIN_SHOWER_DURATION, type Cloud, type ColorDrop, type GameState } from '../types/game';
import { useParticleSystem } from '../components/particle-system';
import { useDropSystem } from '../components/drop-system';
import { useGameCanvas } from '../components/game-canvas';
import { useDamageEffect } from '../components/damage-effect';
import { GameUI, GameStats } from '../components/game-ui';

export default function RainbowCatcher() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseXRef = useRef<number>(0);
  const damageFlashRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>({
    state: 'menu',
    score: 0,
    missedDrops: 0,
    nextColorIndex: 0,
    gameSpeed: 1,
    lives: 3,
    perfectRainbowCount: 0,
    isAutoCollecting: false,
    autoCollectEndTime: 0,
    cloudSpeedBoostEndTime: 0,
    isRainShower: false,
    rainShowerEndTime: 0,
    nextRainShowerTime: 0,
  });

  const [highScore, setHighScore] = useState(0);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const cloudRef = useRef<Cloud>({
    x: 400,
    y: 500,
    width: 80,
    height: 40,
    speedMultiplier: 1,
  });

  const { createCatchParticles, createPerfectRainbowEffect, updateAndDrawParticles, clearParticles } = useParticleSystem();
  const { colorDropsRef, updateDrops, clearDrops } = useDropSystem();
  const { renderGame } = useGameCanvas();
  const { createDamageText, updateAndDrawDamageTexts, clearDamageTexts } = useDamageEffect();

  const checkCollision = useCallback((cloud: Cloud, drop: ColorDrop): boolean => {
    const cloudCenterX = cloud.x;
    const cloudCenterY = cloud.y;
    const distance = Math.sqrt(Math.pow(drop.x - cloudCenterX, 2) + Math.pow(drop.y - cloudCenterY, 2));
    return distance < 35;
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

        let points = 10;
        if (drop.colorIndex === gameState.nextColorIndex) {
          points += 50;
          setGameState((prev) => ({
            ...prev,
            nextColorIndex: (prev.nextColorIndex + 1) % 7,
          }));
        }

        const multiplier = gameState.isRainShower ? 2 : 1;
        setGameState((prev) => ({
          ...prev,
          score: prev.score + points * multiplier,
        }));

        drops.splice(i, 1);
        collectedCount++;
      }
    }

    return collectedCount;
  }, [createCatchParticles, gameState.nextColorIndex, gameState.isRainShower]);

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

    // Update power-ups and effects
    setGameState((prev) => {
      const newState = { ...prev };

      // Update cloud speed boost
      if (now > prev.cloudSpeedBoostEndTime) {
        cloudRef.current.speedMultiplier = 1;
      }

      // Update auto-collect
      if (prev.isAutoCollecting && now > prev.autoCollectEndTime) {
        newState.isAutoCollecting = false;
      }

      // Update rain shower
      if (prev.isRainShower && now > prev.rainShowerEndTime) {
        newState.isRainShower = false;
        newState.nextRainShowerTime = now + NEXT_RAIN_SHOWER_TIME; // Next rain in 30 seconds
      } else if (!prev.isRainShower && now > prev.nextRainShowerTime) {
        newState.isRainShower = true;
        newState.rainShowerEndTime = now + RAIN_SHOWER_DURATION; // Rain for 5 seconds
      }

      return newState;
    });

    // Auto-collect during power-up
    if (gameState.isAutoCollecting) {
      autoCollectColors();
    }

    // Update cloud position with faster movement
    const cloud = cloudRef.current;
    const moveSpeed = 7 * cloud.speedMultiplier; // Increased from 5 to 7

    if (keysRef.current['ArrowLeft'] && cloud.x > 40) {
      cloud.x -= moveSpeed;
    }
    if (keysRef.current['ArrowRight'] && cloud.x < 760) {
      cloud.x += moveSpeed;
    }

    // Enhanced mouse control
    if (mouseXRef.current > 0) {
      const targetX = Math.max(40, Math.min(760, mouseXRef.current));
      const diff = targetX - cloud.x;
      cloud.x += diff * 0.15 * cloud.speedMultiplier; // Increased responsiveness
    }

    // Update drops
    updateDrops(gameState.gameSpeed, gameState.isRainShower);

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
      if (drop.y > 620) {
        handleDropMiss(drop);
        drops.splice(i, 1);
      }
    }

    // Increase game speed over time
    setGameState((prev) => ({
      ...prev,
      gameSpeed: Math.min(3, prev.gameSpeed + 0.001),
    }));

    // Render everything
    renderGame(ctx, gameState, cloud, drops, updateAndDrawParticles, updateAndDrawDamageTexts, damageFlashRef.current > 0);
  }, [gameState, updateDrops, checkCollision, autoCollectColors, renderGame, updateAndDrawParticles, updateAndDrawDamageTexts]);

  const handleDropCatch = useCallback(
    (drop: ColorDrop, now: number) => {
      createCatchParticles(drop.x, drop.y, drop.color);

      if (drop.type === 'golden') {
        // Golden drop: speed boost
        cloudRef.current.speedMultiplier = 2;
        setGameState((prev) => ({
          ...prev,
          cloudSpeedBoostEndTime: now + 5000,
        }));
      } else if (drop.type === 'black') {
        // Black drop: lose life with damage effect
        damageFlashRef.current = 30; // Flash for 30 frames
        createDamageText(cloudRef.current.x, cloudRef.current.y - 30);

        setGameState((prev) => {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            saveHighScore(prev.score);
            setShowGameOverDialog(true);
            return { ...prev, lives: 0, state: 'gameOver' };
          }
          return { ...prev, lives: newLives, nextColorIndex: 0 }; // Reset combo
        });
      } else if (drop.type === 'rainbow') {
        // Rainbow drop: auto-collect
        setGameState((prev) => ({
          ...prev,
          isAutoCollecting: true,
          autoCollectEndTime: now + 3000,
          score: prev.score + 50,
        }));
      } else {
        // Normal drop
        let points = 10;
        let perfectRainbow = false;

        if (drop.colorIndex === gameState.nextColorIndex) {
          points += 50;
          const newNextIndex = (gameState.nextColorIndex + 1) % 7;

          if (newNextIndex === 0 && gameState.nextColorIndex === 6) {
            // Completed perfect rainbow!
            points += 100;
            perfectRainbow = true;
            createPerfectRainbowEffect(drop.x, drop.y);
          }

          setGameState((prev) => ({
            ...prev,
            nextColorIndex: newNextIndex,
            perfectRainbowCount: perfectRainbow ? prev.perfectRainbowCount + 1 : prev.perfectRainbowCount,
            isAutoCollecting: perfectRainbow,
            autoCollectEndTime: perfectRainbow ? now + 3000 : prev.autoCollectEndTime,
          }));
        }

        const multiplier = gameState.isRainShower ? 2 : 1;
        setGameState((prev) => ({
          ...prev,
          score: prev.score + points * multiplier,
        }));
      }
    },
    [createCatchParticles, createPerfectRainbowEffect, createDamageText, gameState.nextColorIndex, gameState.isRainShower, saveHighScore],
  );

  const handleDropMiss = useCallback(
    (drop: ColorDrop) => {
      // Only count as missed if it's the color we're looking for
      if (drop.type === 'normal' && drop.colorIndex === gameState.nextColorIndex) {
        setGameState((prev) => {
          const newMissed = prev.missedDrops + 1;
          if (newMissed >= 10) {
            saveHighScore(prev.score);
            setShowGameOverDialog(true);
            return { ...prev, missedDrops: newMissed, state: 'gameOver' };
          }
          return { ...prev, missedDrops: newMissed };
        });
      }
    },
    [gameState.nextColorIndex, saveHighScore],
  );

  const startGame = useCallback(() => {
    const now = Date.now();
    setGameState({
      state: 'playing',
      score: 0,
      missedDrops: 0,
      nextColorIndex: 0,
      gameSpeed: 1,
      lives: 3,
      perfectRainbowCount: 0,
      isAutoCollecting: false,
      autoCollectEndTime: 0,
      cloudSpeedBoostEndTime: 0,
      isRainShower: false,
      rainShowerEndTime: 0,
      nextRainShowerTime: now + 30000,
    });
    clearDrops();
    clearParticles();
    clearDamageTexts();
    damageFlashRef.current = 0;
    cloudRef.current = {
      x: 400,
      y: 500,
      width: 80,
      height: 40,
      speedMultiplier: 1,
    };
    loadHighScore();
    setShowGameOverDialog(false);
  }, [clearDrops, clearParticles, clearDamageTexts, loadHighScore]);

  const resetGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, state: 'menu' }));
    setShowGameOverDialog(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse controls
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseXRef.current = e.clientX - rect.left;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseXRef.current = 0;
  }, []);

  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
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
          width={800}
          height={600}
          className="border-4 border-purple-400 rounded-xl bg-gradient-to-b from-sky-100 to-blue-200 cursor-none shadow-inner"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
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
        <p>⚡ Golden = Speed Boost | 💣 Black = Lose Life | 🌈 Rainbow = Auto-Collect</p>
      </div>
    </div>
  );
}
