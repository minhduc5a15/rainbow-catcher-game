'use client';

import type React from 'react';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Cloud, Drop } from '@/types/game';
import { useParticleSystem } from '@/components/particle-system';
import { useDropSystem } from '@/components/drop-system';
import { useGameCanvas } from '@/components/game-canvas';
import { useDamageEffect } from '@/components/damage-effect';
import { useWeatherEffects } from '@/components/weather-effects';
import { GameUI } from '@/components/game-ui';
import { PauseMenu } from '@/components/pause-menu';
import { updateGlobalHighScore } from '@/lib/firebase';
import { useGameStore } from '@/store/game-store';
import { GAME_CONSTANTS } from '@/constants/game';
import { GlobalHighScoreDisplay } from '@/components/global-high-score';
import { playSound, stopAllSounds, stopSound } from '@/lib/sounds';
import { useIsMobile, MOBILE_BREAKPOINT } from '@/hooks/use-mobile';

export default function RainbowCatcher() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const mouseXRef = useRef<number>(0);
  const damageFlashRef = useRef<number>(0);
  const highScoreRef = useRef<number>(0);
  const showGameOverDialogRef = useRef<boolean>(false);
  const newGlobalRecordRef = useRef<boolean>(false);

  // Thêm state cho meteorite effects và screen shake:
  const [meteoriteActive, setMeteoriteActive] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // Use Zustand store
  const gameState = useGameStore();

  const isMobile = useIsMobile();

  // Get canvas dimensions based on focus mode
  const getCanvasDimensions = useCallback(() => {
    return {
      width: gameState.focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_WIDTH : GAME_CONSTANTS.CANVAS_WIDTH,
      height: gameState.focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_HEIGHT : GAME_CONSTANTS.CANVAS_HEIGHT,
    };
  }, [gameState.focusMode]);

  // Get cloud properties based on focus mode
  const getCloudProperties = useCallback(() => {
    return {
      y: gameState.focusMode ? GAME_CONSTANTS.FOCUS_CLOUD_Y_POSITION : GAME_CONSTANTS.CLOUD_Y_POSITION,
      minX: gameState.focusMode ? GAME_CONSTANTS.FOCUS_CLOUD_MIN_X : GAME_CONSTANTS.CLOUD_MIN_X,
      maxX: gameState.focusMode ? GAME_CONSTANTS.FOCUS_CLOUD_MAX_X : GAME_CONSTANTS.CLOUD_MAX_X,
    };
  }, [gameState.focusMode]);

  const cloudRef = useRef<Cloud>({
    x: 400,
    y: GAME_CONSTANTS.CLOUD_Y_POSITION,
    width: 80,
    height: 40,
    speedMultiplier: 1,
    isFrozen: false,
    isReversed: false,
    isInvincible: false,
    isShielded: false,
    scale: 1,
    rotation: 0,
    bobOffset: 0,
  });

  const { createCatchParticles, createPerfectRainbowEffect, createRainbowLostEffect, updateAndDrawParticles, clearParticles } = useParticleSystem();
  const { dropsRef, updateDrops, clearDrops } = useDropSystem();
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

  const checkCollision = useCallback((cloud: Cloud, drop: Drop): boolean => {
    const cloudCenterX = cloud.x;
    const cloudCenterY = cloud.y;

    // Use different collision radius for meteorite - make it more accurate
    let collisionRadius: number;
    let dropRadius: number;

    if (drop.type === 'meteorite') {
      collisionRadius = GAME_CONSTANTS.CLOUD_COLLISION_RADIUS;
      dropRadius = GAME_CONSTANTS.METEORITE_RADIUS * 0.7; // Use 70% of visual radius for more accurate collision
    } else {
      collisionRadius = GAME_CONSTANTS.CLOUD_COLLISION_RADIUS;
      dropRadius = GAME_CONSTANTS.DROP_RADIUS;
    }

    const distance = Math.sqrt(Math.pow(drop.x - cloudCenterX, 2) + Math.pow(drop.y - cloudCenterY, 2));
    return distance < collisionRadius + dropRadius;
  }, []);

  const loadHighScore = useCallback(() => {
    const savedScore = localStorage.getItem('rainbowCatcherHighScore');
    if (savedScore) {
      highScoreRef.current = Number.parseInt(savedScore, 10);
    }
  }, []);

  const saveHighScore = useCallback(async (newScore: number) => {
    // Save local high score
    if (newScore > highScoreRef.current) {
      localStorage.setItem('rainbowCatcherHighScore', newScore.toString());
      highScoreRef.current = newScore;
    }

    // Try to update global high score
    try {
      const isNewGlobalRecord = await updateGlobalHighScore(newScore);
      newGlobalRecordRef.current = isNewGlobalRecord;
      return isNewGlobalRecord;
    } catch (error) {
      console.error('Failed to update global high score:', error);
      return false;
    }
  }, []);

  const autoCollectColors = useCallback(() => {
    const drops = dropsRef.current;
    let collectedCount = 0;

    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      if (drop.type === 'normal') {
        createCatchParticles(drop.x, drop.y, drop.color);

        let points = GAME_CONSTANTS.NORMAL_DROP_POINTS;
        if (drop.colorIndex === gameState.nextColorIndex) {
          points += GAME_CONSTANTS.CORRECT_ORDER_BONUS;
          gameState.setNextColorIndex((gameState.nextColorIndex + 1) % 7);
          gameState.setPerfectRainbowProgress(gameState.perfectRainbowProgress + 1);
        }

        // Apply double points if active
        const multiplier = (gameState.isRainShower ? 2 : 1) * (gameState.doublePointsEndTime > Date.now() ? 2 : 1);
        gameState.setScore(gameState.score + points * multiplier);

        drops.splice(i, 1);
        collectedCount++;
      }
    }

    return collectedCount;
  }, [createCatchParticles, gameState]);

  const resetPerfectRainbow = useCallback(
    (showMessage = true) => {
      gameState.updateGameState({
        nextColorIndex: 0,
        perfectRainbowProgress: 0,
        showPerfectRainbowLost: showMessage,
        perfectRainbowLostTime: showMessage ? Date.now() + 2000 : 0,
      });
    },
    [gameState],
  );

  // Handle focus mode toggle
  const toggleFocusMode = useCallback(() => {
    const newFocusMode = !gameState.focusMode;
    gameState.setFocusMode(newFocusMode);

    // Update cloud position constraints
    const cloudProps = newFocusMode
      ? {
          y: GAME_CONSTANTS.FOCUS_CLOUD_Y_POSITION,
          minX: GAME_CONSTANTS.FOCUS_CLOUD_MIN_X,
          maxX: GAME_CONSTANTS.FOCUS_CLOUD_MAX_X,
        }
      : {
          y: GAME_CONSTANTS.CLOUD_Y_POSITION,
          minX: GAME_CONSTANTS.CLOUD_MIN_X,
          maxX: GAME_CONSTANTS.CLOUD_MAX_X,
        };

    cloudRef.current.y = cloudProps.y;

    // Adjust cloud X position if it's outside new bounds
    if (cloudRef.current.x < cloudProps.minX) {
      cloudRef.current.x = cloudProps.minX;
    } else if (cloudRef.current.x > cloudProps.maxX) {
      cloudRef.current.x = cloudProps.maxX;
    }
  }, [gameState]);

  const updateGame = useCallback(() => {
    if (gameState.state !== 'playing' || gameState.isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = Date.now();
    const cloudProps = getCloudProperties();

    // Update damage flash
    if (damageFlashRef.current > 0) {
      damageFlashRef.current--;
    }

    // Update 3D cloud effects
    const cloud = cloudRef.current;
    cloud.bobOffset = Math.sin(now * GAME_CONSTANTS.CLOUD_BOB_FREQUENCY) * GAME_CONSTANTS.CLOUD_BOB_AMPLITUDE;
    cloud.rotation = Math.sin(now * 0.001) * 0.05;

    // Update weather effects and stars
    updateWeatherEffects(gameState.isRainShower);
    if (gameState.timeOfDay === 'night') {
      updateStars();
    }

    // Update power-ups and effects
    const updates: any = {};

    // Update cloud speed boost
    if (now > gameState.cloudSpeedBoostEndTime && gameState.cloudSpeedBoostEndTime > 0) {
      if (cloudRef.current.speedMultiplier > 1) {
        cloudRef.current.speedMultiplier = 1;
      }
      updates.cloudSpeedBoostEndTime = 0;
    }

    // Update cloud freeze effect
    if (now > gameState.cloudFreezeEndTime && gameState.cloudFreezeEndTime > 0) {
      if (cloudRef.current.isFrozen) {
        cloudRef.current.isFrozen = false;
      }
      updates.cloudFreezeEndTime = 0;
    }

    // Update cloud reverse effect
    if (now > gameState.cloudReverseEndTime && gameState.cloudReverseEndTime > 0) {
      if (cloudRef.current.isReversed) {
        cloudRef.current.isReversed = false;
      }
      updates.cloudReverseEndTime = 0;
    }

    // Update invincibility
    if (now > gameState.cloudInvincibilityEndTime && gameState.cloudInvincibilityEndTime > 0) {
      if (cloudRef.current.isInvincible) {
        cloudRef.current.isInvincible = false;
      }
      updates.cloudInvincibilityEndTime = 0;
    }

    // Update shield
    if (now > gameState.cloudShieldEndTime && gameState.cloudShieldEndTime > 0) {
      if (cloudRef.current.isShielded) {
        cloudRef.current.isShielded = false;
      }
      updates.cloudShieldEndTime = 0;
    }

    // Update double points
    if (now > gameState.doublePointsEndTime && gameState.doublePointsEndTime > 0) {
      updates.doublePointsEndTime = 0;
    }

    // Update auto-collect
    if (gameState.isAutoCollecting && now > gameState.autoCollectEndTime) {
      updates.isAutoCollecting = false;
    }

    // Update rain shower
    if (gameState.isRainShower && now > gameState.rainShowerEndTime) {
      updates.isRainShower = false;
      stopSound('rain');
    }

    // Update perfect rainbow lost message
    if (gameState.showPerfectRainbowLost && now > gameState.perfectRainbowLostTime) {
      updates.showPerfectRainbowLost = false;
    }

    // Update power-up messages
    if (gameState.showSpeedBoostMessage && now > gameState.speedBoostMessageEndTime) {
      updates.showSpeedBoostMessage = false;
    }

    if (gameState.showAutoCollectMessage && now > gameState.autoCollectMessageEndTime) {
      updates.showAutoCollectMessage = false;
    }

    if (gameState.showFreezeMessage && now > gameState.freezeMessageEndTime) {
      updates.showFreezeMessage = false;
    }

    if (gameState.showReverseMessage && now > gameState.reverseMessageEndTime) {
      updates.showReverseMessage = false;
    }

    if (gameState.showDoublePointsMessage && now > gameState.doublePointsMessageEndTime) {
      updates.showDoublePointsMessage = false;
    }

    if (gameState.showShieldMessage && now > gameState.shieldMessageEndTime) {
      updates.showShieldMessage = false;
    }

    // Check for day/night cycle change
    const currentCycle = Math.floor(gameState.perfectRainbowCount / GAME_CONSTANTS.PERFECT_RAINBOWS_FOR_SCENE_CHANGE);
    let newTimeOfDay: 'day' | 'night' = 'day';

    if (currentCycle > GAME_CONSTANTS.PERFECT_RAINBOWS_FOR_SCENE_CHANGE) {
      newTimeOfDay = 'night';
    }

    if (newTimeOfDay !== gameState.timeOfDay) {
      updates.timeOfDay = newTimeOfDay;
    }

    // Apply all updates at once
    if (Object.keys(updates).length > 0) {
      gameState.updateGameState(updates);
    }

    // Auto-collect during power-up
    if (gameState.isAutoCollecting) {
      autoCollectColors();
    }

    // Update cloud position with improved mouse control and reverse effect
    if (mouseXRef.current > 0 && !cloud.isFrozen) {
      const targetX = Math.max(cloudProps.minX, Math.min(cloudProps.maxX, mouseXRef.current));
      const diff = targetX - cloud.x;

      const responsiveness = gameState.isPointerLocked ? GAME_CONSTANTS.MOUSE_RESPONSIVENESS_LOCKED : GAME_CONSTANTS.MOUSE_RESPONSIVENESS;
      cloud.x += diff * responsiveness * cloud.speedMultiplier;

      // Keep cloud within bounds
      cloud.x = Math.max(cloudProps.minX, Math.min(cloudProps.maxX, cloud.x));
    }

    // Update drops with cloud position for rocket tracking and focus mode
    updateDrops(gameState.gameSpeed, gameState.isRainShower, cloud.x, gameState.focusMode);

    // Handle collisions and drop removal
    const drops = dropsRef.current;
    const canvasDimensions = getCanvasDimensions();

    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      drop.y += drop.speed;

      // Check collision
      if (checkCollision(cloud, drop)) {
        // For meteorite, only remove if cloud is not invincible
        if (drop.type === 'meteorite' && cloud.isInvincible) {
          // Don't remove meteorite, let it pass through
          handleDropCatch(drop, now);
          continue;
        } else {
          handleDropCatch(drop, now);
          // Remove all drops except meteorite when invincible
          if (!(drop.type === 'meteorite' && cloud.isInvincible)) {
            drops.splice(i, 1);
          }
          continue;
        }
      }

      // Remove drops that fell off screen (use current canvas height)
      if (drop.y > canvasDimensions.height + 20) {
        drops.splice(i, 1);
      }
    }

    // Increase game speed over time
    gameState.setGameSpeed(Math.min(3, gameState.gameSpeed + 0.001));

    // Render everything with focus mode flag
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
      gameState.focusMode,
      meteoriteActive, // Add this parameter
    );
  }, [
    gameState,
    getCloudProperties,
    getCanvasDimensions,
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
    meteoriteActive,
  ]);

  const handleDropCatch = useCallback(
    (drop: Drop, now: number) => {
      createCatchParticles(drop.x, drop.y, drop.color);

      if (drop.type === 'bomb' || drop.type === 'rocket') {
        // Check if cloud is protected
        if (cloudRef.current.isShielded) {
          // Shield blocks damage and creates explosion effect
          createPerfectRainbowEffect(drop.x, drop.y); // Explosion effect
          gameState.setScore(gameState.score + 25); // Bonus points for blocking
          return;
        }

        if (cloudRef.current.isInvincible) {
          // Invincibility frames - no damage taken
          return;
        }

        // Play the bonk sound effect
        playSound('bonk');

        // Take damage: lose life, activate invincibility frames, reset perfect rainbow
        damageFlashRef.current = GAME_CONSTANTS.DAMAGE_FLASH_DURATION;
        createDamageText(cloudRef.current.x, cloudRef.current.y - 30, 1);
        createRainbowLostEffect(cloudRef.current.x, cloudRef.current.y);
        resetPerfectRainbow(true);

        // Activate invincibility frames
        cloudRef.current.isInvincible = true;

        const newLives = gameState.lives - 1;
        if (newLives <= 0) {
          saveHighScore(gameState.score);
          showGameOverDialogRef.current = true;
          stopAllSounds();
          // Release pointer lock immediately on game over
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          gameState.updateGameState({ lives: 0, state: 'gameOver' });
        } else {
          gameState.updateGameState({
            lives: newLives,
            cloudInvincibilityEndTime: now + GAME_CONSTANTS.INVINCIBILITY_DURATION,
          });
        }
      } else if (drop.type === 'meteorite') {
        // Check if cloud is protected
        if (cloudRef.current.isShielded) {
          // Shield blocks meteorite damage
          createPerfectRainbowEffect(drop.x, drop.y);
          gameState.setScore(gameState.score + 50); // Bonus points for blocking meteorite
          return;
        }

        if (cloudRef.current.isInvincible) {
          // Invincibility frames - meteorite passes through, no damage taken
          // Don't remove the meteorite, let it continue
          return;
        }

        // Play the bonk sound effect (more intense)
        playSound('bonk');

        // Meteorite deals 2 damage with enhanced effects
        damageFlashRef.current = GAME_CONSTANTS.DAMAGE_FLASH_DURATION * 2; // Longer flash

        // Create multiple damage texts for 2 damage
        createDamageText(cloudRef.current.x - 15, cloudRef.current.y - 30, 1);
        createDamageText(cloudRef.current.x + 15, cloudRef.current.y - 30, 1);

        // Enhanced explosion effect
        createRainbowLostEffect(cloudRef.current.x, cloudRef.current.y);
        createPerfectRainbowEffect(cloudRef.current.x, cloudRef.current.y); // Double explosion

        resetPerfectRainbow(true);

        // Activate invincibility frames
        cloudRef.current.isInvincible = true;

        const newLives = gameState.lives - GAME_CONSTANTS.METEORITE_DAMAGE;
        if (newLives <= 0) {
          saveHighScore(gameState.score);
          showGameOverDialogRef.current = true;
          stopAllSounds();
          // Release pointer lock immediately on game over
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          gameState.updateGameState({ lives: 0, state: 'gameOver' });
        } else {
          gameState.updateGameState({
            lives: newLives,
            cloudInvincibilityEndTime: now + GAME_CONSTANTS.INVINCIBILITY_DURATION * 1.5, // Longer invincibility
          });
        }
      } else if (drop.type === 'shield') {
        // Shield drop: activate shield protection
        cloudRef.current.isShielded = true;
        cloudRef.current.isFrozen = false;
        cloudRef.current.isReversed = false;
        gameState.updateGameState({
          cloudShieldEndTime: now + GAME_CONSTANTS.SHIELD_DURATION,
          cloudFreezeEndTime: 0,
          cloudReverseEndTime: 0,
          score: gameState.score + 30,
          showShieldMessage: true,
          shieldMessageEndTime: now + 1500,
        });
      } else if (drop.type === 'water') {
        // Water drop: instantly trigger rain shower
        playSound('rain');
        gameState.updateGameState({
          isRainShower: true,
          rainShowerEndTime: now + GAME_CONSTANTS.RAIN_SHOWER_DURATION,
          score: gameState.score + 30,
        });
      } else if (drop.type === 'hail') {
        // check if the cloud is shielded
        if (cloudRef.current.isShielded) {
          // Shield blocks hail, no effect
          createPerfectRainbowEffect(drop.x, drop.y); // Explosion effect
          gameState.setScore(gameState.score + 25); // Bonus points for blocking
          return;
        }

        // Check if the cloud is invincible
        if (cloudRef.current.isInvincible) {
          // Invincibility frames - no damage taken
          return;
        }

        // Play frozen drop sound
        playSound('frozenDrop');

        // Hail: freeze cloud immediately
        cloudRef.current.isFrozen = true;
        cloudRef.current.speedMultiplier = 1;
        cloudRef.current.isReversed = false;
        gameState.updateGameState({
          cloudFreezeEndTime: now + GAME_CONSTANTS.FREEZE_DURATION,
          cloudSpeedBoostEndTime: 0,
          cloudReverseEndTime: 0,
          showFreezeMessage: true,
          freezeMessageEndTime: now + 1500,
        });
      } else if (drop.type === 'reverse') {
        // Check if the cloud is shielded
        if (cloudRef.current.isShielded) {
          createPerfectRainbowEffect(drop.x, drop.y); // Explosion effect
          gameState.setScore(gameState.score + 25); // Bonus points for blocking
          return;
        }

        if (cloudRef.current.isInvincible) {
          // Invincibility frames - no damage taken
          return;
        }

        // Player reverse drop sound
        playSound('reverseDrop');

        // Reverse: reverse cloud controls
        cloudRef.current.isReversed = true;
        cloudRef.current.isFrozen = false;
        gameState.updateGameState({
          cloudReverseEndTime: now + GAME_CONSTANTS.REVERSE_DURATION,
          cloudFreezeEndTime: 0,
          showReverseMessage: true,
          reverseMessageEndTime: now + 1500,
        });
      } else if (drop.type === 'double') {
        // Double: double points for a duration
        gameState.updateGameState({
          doublePointsEndTime: now + GAME_CONSTANTS.DOUBLE_POINTS_DURATION,
          showDoublePointsMessage: true,
          doublePointsMessageEndTime: now + 1500,
        });
      } else if (drop.type === 'lightning') {
        // Lightning drop: speed boost
        cloudRef.current.speedMultiplier = GAME_CONSTANTS.CLOUD_SPEED_BOOST_MULTIPLIER;
        cloudRef.current.isFrozen = false;
        cloudRef.current.isReversed = false;
        gameState.updateGameState({
          cloudSpeedBoostEndTime: now + GAME_CONSTANTS.SPEED_BOOST_DURATION,
          cloudFreezeEndTime: 0,
          cloudReverseEndTime: 0,
          showSpeedBoostMessage: true,
          speedBoostMessageEndTime: now + 1500,
        });
      } else if (drop.type === 'rainbow') {
        // Rainbow drop: auto-collect
        gameState.updateGameState({
          isAutoCollecting: true,
          autoCollectEndTime: now + GAME_CONSTANTS.AUTO_COLLECT_DURATION,
          score: gameState.score + GAME_CONSTANTS.RAINBOW_DROP_POINTS,
          showAutoCollectMessage: true,
          autoCollectMessageEndTime: now + 1500,
        });
      } else if (drop.type === 'heart') {
        // Heart drop: gain life (max 3)
        gameState.updateGameState({
          lives: Math.min(GAME_CONSTANTS.MAX_LIVES, gameState.lives + 1),
          score: gameState.score + 20,
        });
      } else {
        playSound('normalDrop');

        // Normal drop logic
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

          gameState.updateGameState({
            nextColorIndex: newNextIndex,
            perfectRainbowProgress: perfectRainbow ? 0 : newProgress,
            perfectRainbowCount: perfectRainbow ? gameState.perfectRainbowCount + 1 : gameState.perfectRainbowCount,
            isAutoCollecting: perfectRainbow,
            autoCollectEndTime: perfectRainbow ? now + GAME_CONSTANTS.AUTO_COLLECT_DURATION : gameState.autoCollectEndTime,
            showAutoCollectMessage: perfectRainbow,
            autoCollectMessageEndTime: perfectRainbow ? now + 1500 : gameState.autoCollectMessageEndTime,
          });
        }

        // Apply double points if active
        const multiplier = (gameState.isRainShower ? 2 : 1) * (gameState.doublePointsEndTime > now ? 2 : 1);
        gameState.setScore(gameState.score + points * multiplier);
      }
    },
    [createCatchParticles, createPerfectRainbowEffect, createRainbowLostEffect, createDamageText, resetPerfectRainbow, gameState, saveHighScore],
  );

  const startGame = useCallback(() => {
    gameState.startGame();
    clearDrops();
    clearParticles();
    clearDamageTexts();
    clearWeatherEffects();
    stopAllSounds();
    damageFlashRef.current = 0;
    newGlobalRecordRef.current = false;

    const cloudProps = getCloudProperties();
    cloudRef.current = {
      x: gameState.focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_WIDTH / 2 : 400,
      y: cloudProps.y,
      width: 80,
      height: 40,
      speedMultiplier: 1,
      isFrozen: false,
      isReversed: false,
      isInvincible: false,
      isShielded: false,
      scale: 1,
      rotation: 0,
      bobOffset: 0,
    };
    loadHighScore();
    showGameOverDialogRef.current = false;
  }, [gameState, getCloudProperties, clearDrops, clearParticles, clearDamageTexts, clearWeatherEffects, loadHighScore]);

  const resetGame = useCallback(() => {
    gameState.resetGame();
    showGameOverDialogRef.current = false;
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    // Release pointer lock if active
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [gameState]);

  // Handle pause functionality
  const handlePause = useCallback(() => {
    if (gameState.state === 'playing' && gameState.isPointerLocked) {
      gameState.pauseGame();
    }
  }, [gameState]);

  const handleResume = useCallback(() => {
    gameState.resumeGame();
  }, [gameState]);

  const handleRestart = useCallback(() => {
    gameState.resumeGame();
    startGame();
  }, [gameState, startGame]);

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

  // Keyboard controls for pause and focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState.state === 'playing') {
          if (gameState.isPaused) {
            handleResume();
          } else if (gameState.isPointerLocked) {
            document.exitPointerLock();
            handlePause();
          }
        }
      } else if (e.code === 'F11') {
        e.preventDefault();
        toggleFocusMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameState.state, gameState.isPaused, gameState.isPointerLocked, handlePause, handleResume, toggleFocusMode]);

  // Mouse controls and pointer lock
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
      const cloudProps = getCloudProperties();

      if (gameState.isPointerLocked) {
        // Use movement for locked pointer
        let movementX = e.movementX;

        // Apply reverse effect to movement
        if (cloudRef.current.isReversed) {
          movementX = -movementX;
        }

        mouseXRef.current = Math.max(cloudProps.minX, Math.min(cloudProps.maxX, cloudRef.current.x + movementX));
      } else {
        // Use absolute position for unlocked pointer
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        let targetX = e.clientX - rect.left;

        // Scale target X based on canvas size vs display size
        const canvasDimensions = getCanvasDimensions();
        targetX = (targetX / rect.width) * canvasDimensions.width;

        // Apply reverse effect to absolute positioning
        if (cloudRef.current.isReversed) {
          // Reverse the target position relative to canvas center
          const canvasCenter = canvasDimensions.width / 2;
          targetX = canvasCenter - (targetX - canvasCenter);
        }

        mouseXRef.current = targetX;
      }
    },
    [gameState.isPointerLocked, getCloudProperties, getCanvasDimensions],
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
      gameState.setIsPointerLocked(document.pointerLockElement === canvasRef.current);
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
  }, [handleMouseMove, gameState]);

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

  // Add meteorite effect listener
  useEffect(() => {
    const handleMeteoriteSpawn = () => {
      setMeteoriteActive(true);
    };

    const handleMeteoriteImpact = () => {
      setMeteoriteActive(false);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 1500);
    };

    window.addEventListener('meteoriteSpawn', handleMeteoriteSpawn);
    window.addEventListener('meteoriteImpact', handleMeteoriteImpact);

    return () => {
      window.removeEventListener('meteoriteSpawn', handleMeteoriteSpawn);
      window.removeEventListener('meteoriteImpact', handleMeteoriteImpact);
    };
  }, []);

  // Check for meteorite in drops and trigger effect
  useEffect(() => {
    const checkForMeteorite = () => {
      const hasMeteorite = dropsRef.current.some((drop) => drop.type === 'meteorite');
      if (hasMeteorite && !meteoriteActive) {
        setMeteoriteActive(true);
      } else if (!hasMeteorite && meteoriteActive) {
        setMeteoriteActive(false);
      }
    };

    const interval = setInterval(checkForMeteorite, 100);
    return () => clearInterval(interval);
  }, [meteoriteActive]);

  // Update background class to support meteorite effect
  const getBackgroundClass = () => {
    const baseClass = meteoriteActive ? 'bg-gradient-to-br from-gray-900 via-black to-red-900' : '';

    if (!baseClass) {
      if (gameState.timeOfDay === 'night') {
        return gameState.isRainShower ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black';
      } else {
        return gameState.isRainShower
          ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800'
          : 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500';
      }
    }

    return baseClass;
  };

  // Add screen shake class with proper shake animation
  const getContainerClass = () => {
    return screenShake ? 'screen-shake' : '';
  };

  // Update background class to support day/night cycle
  const getBackgroundClassOld = () => {
    if (gameState.timeOfDay === 'night') {
      return gameState.isRainShower ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black';
    } else {
      return gameState.isRainShower ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800' : 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500';
    }
  };

  const canvasDimensions = getCanvasDimensions();

  // Add screen shake CSS
  const screenShakeStyle = `
  @keyframes shake {
    0% { transform: translate(0px, 0px) rotate(0deg); }
    10% { transform: translate(-2px, -1px) rotate(-0.5deg); }
    20% { transform: translate(-1px, 0px) rotate(0.5deg); }
    30% { transform: translate(2px, 1px) rotate(0deg); }
    40% { transform: translate(1px, -1px) rotate(0.5deg); }
    50% { transform: translate(-1px, 1px) rotate(-0.5deg); }
    60% { transform: translate(-2px, 0px) rotate(0deg); }
    70% { transform: translate(2px, 1px) rotate(-0.5deg); }
    80% { transform: translate(-1px, -1px) rotate(0.5deg); }
    90% { transform: translate(1px, 1px) rotate(0deg); }
    100% { transform: translate(0px, 0px) rotate(0deg); }
  }
  .screen-shake {
    animation: shake 0.15s ease-in-out infinite;
  }
`;

  // Is mobile device, render a message to use desktop
  if (isMobile) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: screenShakeStyle }} />
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
          <div className="text-center p-6 bg-white/90 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-purple-800 mb-4">🌈 Rainbow Catcher</h1>
            <p className="text-lg text-gray-700 mb-6">This game is not supported on touch devices or screens smaller than {MOBILE_BREAKPOINT}px.</p>
            <p className="text-sm text-gray-500">Please play on a desktop or laptop for the best experience!</p>
          </div>
        </div>
      </>
    );
  }
  // Focus mode layout
  if (gameState.focusMode) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: screenShakeStyle }} />
        <div className={`min-h-screen ${getBackgroundClass()} flex items-center justify-center transition-all duration-1000 ${getContainerClass()}`}>
          <div className="relative">
            {/* Focus mode stats overlay */}
            <div className="absolute top-4 left-4 z-10 bg-black/70 rounded-lg p-3 text-white">
              <div className="flex gap-4 text-sm">
                <span>
                  Score: <strong className="text-blue-400">{gameState.score}</strong>
                </span>
                <span>
                  Lives: <strong className="text-red-400">{'❤️'.repeat(gameState.lives)}</strong>
                </span>
                <span>
                  Perfect: <strong className="text-purple-400">{gameState.perfectRainbowCount}</strong> 🌈
                </span>
                {gameState.timeOfDay === 'night' && <span className="text-indigo-400">🌙 Night</span>}
              </div>
            </div>

            {/* Focus mode controls overlay */}
            <div className="absolute top-4 right-4 z-10 bg-black/70 rounded-lg p-3 text-white text-sm">
              <div className="space-y-1">
                <p>
                  <kbd className="bg-gray-600 px-2 py-1 rounded">F11</kbd> Exit Focus Mode
                </p>
                <p>
                  <kbd className="bg-gray-600 px-2 py-1 rounded">Space</kbd> Pause
                </p>
                <p>
                  <kbd className="bg-gray-600 px-2 py-1 rounded">ESC</kbd> Unlock Cursor
                </p>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              className="border-4 border-purple-400 rounded-xl bg-gradient-to-b from-sky-100 to-blue-200 cursor-none shadow-2xl"
              onMouseMove={gameState.isPointerLocked ? undefined : handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleCanvasClick}
            />

            {/* Pause Menu Overlay */}
            {gameState.isPaused && <PauseMenu onContinue={handleResume} onRestart={handleRestart} />}

            {/* Focus mode game UI overlay */}
            {(gameState.state === 'menu' || gameState.state === 'gameOver') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="bg-white/95 rounded-lg p-8 max-w-md">
                  <GameUI
                    gameState={gameState}
                    highScore={highScoreRef.current}
                    newGlobalRecord={newGlobalRecordRef.current}
                    onStartGame={startGame}
                    onResetGame={resetGame}
                    showGameOverDialog={showGameOverDialogRef.current}
                    onCloseGameOverDialog={() => (showGameOverDialogRef.current = false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Normal mode layout
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: screenShakeStyle }} />
      <div className={`min-h-screen ${getBackgroundClass()} flex flex-col items-center justify-center p-4 transition-all duration-1000 ${getContainerClass()}`}>
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">🌈 Rainbow Catcher</h1>
          <p className="text-white/90 text-xl">Control the cloud to catch falling rainbow colors!</p>
          <div className="mt-2 flex gap-2 justify-center">
            <Link href="/rules">
              <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                📖 Game Rules
              </Button>
            </Link>
            <GlobalHighScoreDisplay />
            <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={toggleFocusMode}>
              🎯 Focus Mode (F11)
            </Button>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-white/95 to-purple-100/95 backdrop-blur-sm border-4 border-purple-300 shadow-2xl relative rounded-lg">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2 bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg border-2 border-purple-200">
            <div className="text-lg font-bold bg-blue-100 px-3 py-1 rounded-full">
              Score: <span className="text-blue-600">{gameState.score}</span>
            </div>
            <div className="text-lg font-bold bg-red-100 px-3 py-1 rounded-full">
              Lives: <span className="text-red-600">{'❤️'.repeat(gameState.lives)}</span>
            </div>
            <div className="text-sm bg-white px-3 py-1 rounded-full">
              Next Color:{' '}
              <span className="px-2 py-1 rounded text-white font-bold ml-1" style={{ backgroundColor: gameState.nextColorIndex < 7 ? '#FF0000' : '#FF0000' }}>
                Next
              </span>
            </div>
            <div className="text-sm bg-purple-100 px-3 py-1 rounded-full">
              Perfect: <span className="text-purple-600 font-bold">{gameState.perfectRainbowCount}</span> 🌈
            </div>
            {gameState.timeOfDay === 'night' && (
              <div className="text-sm bg-indigo-100 px-3 py-1 rounded-full">
                <span className="text-indigo-600 font-bold">🌙 Night</span>
              </div>
            )}
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              className="border-4 border-purple-400 rounded-xl bg-gradient-to-b from-sky-100 to-blue-200 cursor-none shadow-inner"
              onMouseMove={gameState.isPointerLocked ? undefined : handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleCanvasClick}
            />

            {/* Pause Menu Overlay */}
            {gameState.isPaused && <PauseMenu onContinue={handleResume} onRestart={handleRestart} />}
          </div>

          <GameUI
            gameState={gameState}
            highScore={highScoreRef.current}
            newGlobalRecord={newGlobalRecordRef.current}
            onStartGame={startGame}
            onResetGame={resetGame}
            showGameOverDialog={showGameOverDialogRef.current}
            onCloseGameOverDialog={() => (showGameOverDialogRef.current = false)}
          />
        </div>

        <div className="mt-4 text-center text-white/90 text-sm bg-black/20 rounded-lg p-3">
          <p className="font-bold">🌈 Catch rainbow colors: Red → Orange → Yellow → Green → Blue → Indigo → Violet</p>
          <p>⚡ Lightning = Speed Boost | 💣 Black = Lose Life | 🌈 Rainbow = Auto-Collect | ❤️ Heart = Gain Life | ❄️ Hail = Freeze | 🚀 Rocket = Lose Life</p>
          <p>⇄ Purple = Reverse Controls | ✨ Yellow = Double Points | 💧 Water = Instant Rain Storm | 🛡️ Shield = Protection</p>
          <p className="text-xs mt-2">🖱️ Click to lock cursor (ESC to unlock) | ⏸️ Press Space to pause | 🎯 Press F11 for Focus Mode</p>
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
    </>
  );
}
