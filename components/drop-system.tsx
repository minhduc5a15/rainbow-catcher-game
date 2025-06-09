'use client';

import { useRef, useCallback } from 'react';
import type { ColorDrop } from '../types/game';
import { RAINBOW_COLORS } from '../types/game';
import { GAME_CONSTANTS } from '../constants/game';

export function useDropSystem() {
  const colorDropsRef = useRef<ColorDrop[]>([]);
  const lastDropTimeRef = useRef(0);
  const dropIdCounter = useRef(0);

  const createDrop = useCallback((gameSpeed: number, isRainShower = false, perfectRainbowCount = 0): ColorDrop => {
    const dropType = getRandomDropType(perfectRainbowCount);
    let color: string;
    let colorIndex: number;

    switch (dropType) {
      case 'golden':
        color = '#FFD700';
        colorIndex = -1;
        break;
      case 'black':
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
        color = '#A5F2F3';
        colorIndex = -5;
        break;
      default:
        const randomColor = RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)];
        color = randomColor.color;
        colorIndex = randomColor.index;
    }

    const speed = (GAME_CONSTANTS.DROP_BASE_SPEED + gameSpeed * 0.5) * (isRainShower ? GAME_CONSTANTS.RAIN_SPEED_MULTIPLIER : 1);

    return {
      x: Math.random() * (GAME_CONSTANTS.CANVAS_WIDTH - 40) + 20,
      y: -10,
      color,
      colorIndex,
      speed,
      type: dropType,
      id: `drop_${dropIdCounter.current++}`,
    };
  }, []);

  const getRandomDropType = useCallback((perfectRainbowCount: number): ColorDrop['type'] => {
    const rand = Math.random();

    // Heart drops only appear if player has earned enough perfect rainbows and hasn't received hearts yet
    const canDropHeart = perfectRainbowCount > 0 && perfectRainbowCount % GAME_CONSTANTS.HEARTS_PER_PERFECT_RAINBOWS === 0;

    // Add a flag to track if hearts have been dropped for this milestone
    const heartMilestone = Math.floor(perfectRainbowCount / GAME_CONSTANTS.HEARTS_PER_PERFECT_RAINBOWS);

    if (canDropHeart && rand < GAME_CONSTANTS.HEART_DROP_CHANCE) return 'heart';
    if (rand < GAME_CONSTANTS.RAINBOW_DROP_CHANCE) return 'rainbow';
    if (rand < GAME_CONSTANTS.GOLDEN_DROP_CHANCE) return 'golden';
    if (rand < GAME_CONSTANTS.BLACK_DROP_CHANCE) return 'black';
    if (rand < GAME_CONSTANTS.HAIL_DROP_CHANCE) return 'hail';
    return 'normal';
  }, []);

  const spawnDrop = useCallback(
    (gameSpeed: number, isRainShower = false, perfectRainbowCount = 0) => {
      const newDrop = createDrop(gameSpeed, isRainShower, perfectRainbowCount);
      colorDropsRef.current.push(newDrop);
    },
    [createDrop],
  );

  const updateDrops = useCallback(
    (gameSpeed: number, isRainShower = false, perfectRainbowCount = 0) => {
      const now = Date.now();
      const spawnRate = isRainShower ? 200 : 1000 / gameSpeed;

      if (now - lastDropTimeRef.current > spawnRate) {
        spawnDrop(gameSpeed, isRainShower, perfectRainbowCount);
        lastDropTimeRef.current = now;
      }

      // Update rainbow drop movement (complex pattern)
      colorDropsRef.current.forEach((drop) => {
        if (drop.type === 'rainbow') {
          drop.x += Math.sin(drop.y * 0.01) * 2;
        }
      });
    },
    [spawnDrop],
  );

  const clearDrops = useCallback(() => {
    colorDropsRef.current = [];
  }, []);

  return {
    colorDropsRef,
    updateDrops,
    clearDrops,
  };
}
