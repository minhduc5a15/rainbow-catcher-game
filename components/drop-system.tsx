'use client';

import { useRef, useCallback } from 'react';
import type { Drop } from '@/types/game';
import { RAINBOW_COLORS } from '@/types/game';
import { GAME_CONSTANTS } from '@/constants/game';

export function useDropSystem() {
  const dropsRef = useRef<Drop[]>([]);
  const lastDropTimeRef = useRef(0);
  const dropIdCounter = useRef(0);

  const createDrop = useCallback((gameSpeed: number, isRainShower = false, cloudX = 400, focusMode = false): Drop => {
    const dropType = getRandomDropType();
    let color: string;
    let colorIndex: number;
    let speedMultiplier = 1;

    // Get canvas width based on focus mode
    const canvasWidth = focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_WIDTH : GAME_CONSTANTS.CANVAS_WIDTH;

    switch (dropType) {
      case 'lightning':
        color = '#FFD700';
        colorIndex = -1;
        break;
      case 'bomb':
        color = '#000000';
        colorIndex = -2;
        speedMultiplier = GAME_CONSTANTS.BOMB_SPEED_MULTIPLIER;
        break;
      case 'rainbow':
        color = '#FFFFFF';
        colorIndex = -3;
        break;
      case 'heart':
        color = '#FF69B4';
        colorIndex = -4;
        break;
      case 'hail':
        color = '#00BFFF';
        colorIndex = -5;
        speedMultiplier = GAME_CONSTANTS.HAIL_SPEED_MULTIPLIER;
        break;
      case 'rocket':
        color = '#FF4500';
        colorIndex = -6;
        speedMultiplier = GAME_CONSTANTS.ROCKET_SPEED_MULTIPLIER;
        break;
      case 'reverse':
        color = '#800080';
        colorIndex = -7;
        speedMultiplier = GAME_CONSTANTS.REVERSE_SPEED_MULTIPLIER;
        break;
      case 'double':
        color = '#FFFF66';
        colorIndex = -8;
        break;
      case 'water':
        color = '#00BFFF';
        colorIndex = -9;
        speedMultiplier = GAME_CONSTANTS.WATER_SPEED_MULTIPLIER;
        break;
      default:
        const randomColor = RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)];
        color = randomColor.color;
        colorIndex = randomColor.index;
    }

    const speed = (GAME_CONSTANTS.DROP_BASE_SPEED + gameSpeed * 0.5) * speedMultiplier * (isRainShower ? GAME_CONSTANTS.RAIN_SPEED_MULTIPLIER : 1);

    const drop: Drop = {
      x: Math.random() * (canvasWidth - 40) + 20,
      y: -10,
      color,
      colorIndex,
      speed,
      type: dropType,
      id: `drop_${dropIdCounter.current++}`,
      // 3D effects
      scale: 0.8 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI * 2,
      shadowOffset: Math.random() * GAME_CONSTANTS.SHADOW_OFFSET_MAX,
    };

    // Add rocket-specific properties with cloud tracking
    if (dropType === 'rocket') {
      drop.angle = Math.random() * Math.PI * 2;
      drop.amplitude = 30 + Math.random() * 50;
      drop.frequency = 0.03 + Math.random() * 0.02;
      drop.startY = drop.y;
      // Start rocket closer to cloud X position for better tracking
      drop.x = cloudX + (Math.random() - 0.5) * 200;
    }

    return drop;
  }, []);

  const getRandomDropType = useCallback((): Drop['type'] => {
    const rand = Math.random();

    // Check for special drops first (total ~24.8%)
    let cumulativeProbability = 0;

    // Ultra rare drops
    cumulativeProbability += GAME_CONSTANTS.RAINBOW_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      return 'rainbow';
    }

    cumulativeProbability += GAME_CONSTANTS.HEART_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      return 'heart';
    }

    // Water drop
    cumulativeProbability += GAME_CONSTANTS.WATER_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      return 'water';
    }

    // Double points
    cumulativeProbability += GAME_CONSTANTS.DOUBLE_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      return 'double';
    }

    // Power-up drops
    cumulativeProbability += GAME_CONSTANTS.LIGHTNING_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      return 'lightning';
    }

    cumulativeProbability += GAME_CONSTANTS.HAIL_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      return 'hail';
    }

    cumulativeProbability += GAME_CONSTANTS.REVERSE_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      return 'reverse';
    }

    // Dangerous drops
    cumulativeProbability += GAME_CONSTANTS.BOMB_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      return 'bomb';
    }

    cumulativeProbability += GAME_CONSTANTS.ROCKET_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      return 'rocket';
    }

    // Everything else is normal rainbow drops (~75.2%)
    return 'normal';
  }, []);

  const spawnMultipleDrops = useCallback(
    (gameSpeed: number, isRainShower = false, cloudX = 400, focusMode = false) => {
      // Determine how many drops to spawn - more conservative
      let dropCount = GAME_CONSTANTS.DROPS_PER_SPAWN_NORMAL;

      if (focusMode && isRainShower) {
        dropCount = GAME_CONSTANTS.DROPS_PER_SPAWN_FOCUS_RAIN;
      } else if (focusMode) {
        dropCount = GAME_CONSTANTS.DROPS_PER_SPAWN_FOCUS;
      } else if (isRainShower) {
        dropCount = GAME_CONSTANTS.DROPS_PER_SPAWN_RAIN;
      }

      // Spawn drops with better spacing
      for (let i = 0; i < dropCount; i++) {
        const newDrop = createDrop(gameSpeed, isRainShower, cloudX, focusMode);

        // Add horizontal spread for multiple drops
        if (dropCount > 1) {
          const canvasWidth = focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_WIDTH : GAME_CONSTANTS.CANVAS_WIDTH;
          const spreadRange = canvasWidth * 0.4; // 40% of canvas width for better spread
          const spreadOffset = (i - (dropCount - 1) / 2) * (spreadRange / dropCount);
          newDrop.x = Math.max(20, Math.min(canvasWidth - 20, newDrop.x + spreadOffset));

          // Slight vertical offset to avoid perfect overlap
          newDrop.y = -10 - i * 20; // Increased spacing
        }

        dropsRef.current.push(newDrop);
      }
    },
    [createDrop],
  );

  const updateDrops = useCallback(
    (gameSpeed: number, isRainShower = false, cloudX = 400, focusMode = false) => {
      const now = Date.now();

      // Determine spawn rate based on mode and weather
      let spawnRate: number;

      if (focusMode && isRainShower) {
        spawnRate = GAME_CONSTANTS.DROP_SPAWN_RATE_FOCUS_RAIN;
      } else if (focusMode) {
        spawnRate = GAME_CONSTANTS.DROP_SPAWN_RATE_FOCUS;
      } else if (isRainShower) {
        spawnRate = GAME_CONSTANTS.DROP_SPAWN_RATE_RAIN;
      } else {
        spawnRate = Math.max(GAME_CONSTANTS.DROP_SPAWN_RATE_BASE, 500 / gameSpeed); // Slightly slower than before
      }

      if (now - lastDropTimeRef.current > spawnRate) {
        spawnMultipleDrops(gameSpeed, isRainShower, cloudX, focusMode);
        lastDropTimeRef.current = now;
      }

      // Get cloud Y position based on focus mode
      const cloudY = focusMode ? GAME_CONSTANTS.FOCUS_CLOUD_Y_POSITION : GAME_CONSTANTS.CLOUD_Y_POSITION;

      // Update drop movements
      dropsRef.current.forEach((drop) => {
        // Update 3D effects
        if (drop.rotation !== undefined) {
          drop.rotation += GAME_CONSTANTS.DROP_ROTATION_SPEED;
        }

        if (drop.type === 'rainbow') {
          // Rainbow drop complex pattern
          drop.x += Math.sin(drop.y * 0.01) * 2;
        } else if (drop.type === 'rocket') {
          // Enhanced rocket movement - always track towards cloud
          if (drop.angle !== undefined && drop.amplitude !== undefined && drop.frequency !== undefined && drop.startY !== undefined) {
            drop.angle += drop.frequency;

            // Calculate direction towards cloud
            const targetX = cloudX;
            const deltaX = targetX - drop.x;
            const deltaY = cloudY - drop.y;

            // Normalize direction
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > 0) {
              const directionX = deltaX / distance;
              const directionY = deltaY / distance;

              // Move towards cloud with some oscillation
              const oscillation = Math.sin(drop.angle) * (drop.amplitude * 0.3);
              drop.x += directionX * drop.speed * 0.7 + oscillation * 0.3;
              drop.y += Math.max(drop.speed * 0.8, directionY * drop.speed * 0.5);
            } else {
              // Fallback movement
              drop.y += drop.speed;
            }

            // Keep rocket within canvas bounds
            const canvasWidth = focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_WIDTH : GAME_CONSTANTS.CANVAS_WIDTH;
            drop.x = Math.max(20, Math.min(canvasWidth - 20, drop.x));
          }
        }
      });
    },
    [spawnMultipleDrops],
  );

  const clearDrops = useCallback(() => {
    dropsRef.current = [];
  }, []);

  return {
    dropsRef,
    updateDrops,
    clearDrops,
  };
}
