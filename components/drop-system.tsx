'use client';

import { useRef, useCallback } from 'react';
import type { ColorDrop } from '../types/game';
import { RAINBOW_COLORS } from '../types/game';

export function useDropSystem() {
  const colorDropsRef = useRef<ColorDrop[]>([]);
  const lastDropTimeRef = useRef(0);
  const dropIdCounter = useRef(0);

  const createDrop = useCallback((gameSpeed: number, isRainShower = false): ColorDrop => {
    const dropType = getRandomDropType();
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
      default:
        const randomColor = RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)];
        color = randomColor.color;
        colorIndex = randomColor.index;
    }

    const speed = (2 + gameSpeed * 0.5) * (isRainShower ? 1.5 : 1);

    return {
      x: Math.random() * 760 + 20,
      y: -10,
      color,
      colorIndex,
      speed,
      type: dropType,
      id: `drop_${dropIdCounter.current++}`,
    };
  }, []);

  const getRandomDropType = useCallback((): ColorDrop['type'] => {
    const rand = Math.random();
    if (rand < 0.02) return 'rainbow'; // 2% chance
    if (rand < 0.08) return 'golden'; // 6% chance
    if (rand < 0.15) return 'black'; // 7% chance
    return 'normal'; // 85% chance
  }, []);

  const spawnDrop = useCallback(
    (gameSpeed: number, isRainShower = false) => {
      const newDrop = createDrop(gameSpeed, isRainShower);
      colorDropsRef.current.push(newDrop);
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
