'use client';

import { useRef, useCallback } from 'react';
import type { ColorDrop } from '@/types/game';
import { RAINBOW_COLORS } from '@/types/game';
import { GAME_CONSTANTS } from '@/constants/game';

export function useDropSystem() {
  const dropsRef = useRef<ColorDrop[]>([]);
  const lastDropTimeRef = useRef(0);
  const dropIdCounter = useRef(0);

  const createDrop = useCallback((gameSpeed: number, isRainShower = false): ColorDrop => {
    const dropType = getRandomDropType();
    let color: string;
    let colorIndex: number;

    switch (dropType) {
      case 'lightning':
        color = '#FFD700';
        colorIndex = -1;
        break;
      case 'bomb':
        color = '#000000';
        colorIndex = -2;
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
        break;
      case 'rocket':
        color = '#FF4500';
        colorIndex = -6;
        break;
      default:
        const randomColor = RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)];
        color = randomColor.color;
        colorIndex = randomColor.index;
    }

    const speed = (GAME_CONSTANTS.DROP_BASE_SPEED + gameSpeed * 0.5) * (isRainShower ? GAME_CONSTANTS.RAIN_SPEED_MULTIPLIER : 1);

    const drop: ColorDrop = {
      x: Math.random() * (GAME_CONSTANTS.CANVAS_WIDTH - 40) + 20,
      y: -10,
      color,
      colorIndex,
      speed,
      type: dropType,
      id: `drop_${dropIdCounter.current++}`,
    };

    // Add rocket-specific properties
    if (dropType === 'rocket') {
      drop.angle = Math.random() * Math.PI * 2; // Random angle for oscillation
      drop.amplitude = 50 + Math.random() * 100; // Random amplitude for wave motion
      drop.frequency = 0.02 + Math.random() * 0.03; // Random frequency
      drop.startY = drop.y;
    }

    return drop;
  }, []);

  const getRandomDropType = useCallback((): ColorDrop['type'] => {
    const rand = Math.random();

    if (rand <= 0.01) {
      return Math.random() < 0.5 ? 'rainbow' : 'heart';
    }

    if (rand <= GAME_CONSTANTS.LIGHTNING_DROP_CHANCE) {
      return Math.random() < 0.5 ? 'lightning' : 'hail';
    }

    if (rand <= GAME_CONSTANTS.BOMB_DROP_CHANCE) {
      return Math.random() < 0.5 ? 'bomb' : 'rocket';
    }

    return 'normal';
  }, []);

  const spawnDrop = useCallback(
    (gameSpeed: number, isRainShower = false) => {
      const newDrop = createDrop(gameSpeed, isRainShower);
      dropsRef.current.push(newDrop);
    },
    [createDrop],
  );

  const updateDrops = useCallback(
    (gameSpeed: number, isRainShower = false) => {
      const now = Date.now();
      const spawnRate = isRainShower ? 200 : 1000 / gameSpeed;

      if (now - lastDropTimeRef.current > spawnRate) {
        spawnDrop(gameSpeed, isRainShower);
        lastDropTimeRef.current = now;
      }

      // Update drop movements
      dropsRef.current.forEach((drop) => {
        if (drop.type === 'rainbow') {
          // Rainbow drop complex pattern
          drop.x += Math.sin(drop.y * 0.01) * 2;
        } else if (drop.type === 'rocket') {
          // Rocket complex movement pattern - FIXED to stay in bounds
          if (drop.angle !== undefined && drop.amplitude !== undefined && drop.frequency !== undefined && drop.startY !== undefined) {
            drop.angle += drop.frequency;

            // Calculate base movement with reduced amplitude to stay in bounds
            const centerX = GAME_CONSTANTS.CANVAS_WIDTH / 2;
            const maxAmplitude = Math.min(drop.amplitude, GAME_CONSTANTS.CANVAS_WIDTH / 3);
            const oscillation = Math.sin(drop.angle) * maxAmplitude;

            // Keep rocket within canvas bounds
            drop.x = Math.max(20, Math.min(GAME_CONSTANTS.CANVAS_WIDTH - 20, centerX + oscillation));

            // Add some vertical oscillation too but maintain downward movement
            drop.y += drop.speed * (0.9 + 0.1 * Math.sin(drop.angle * 0.5));
          }
        }
      });
    },
    [spawnDrop],
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
