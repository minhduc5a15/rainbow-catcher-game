'use client';

import { useRef, useCallback } from 'react';
import type { Drop } from '@/types/game';
import { RAINBOW_COLORS } from '@/types/game';
import { GAME_CONSTANTS } from '@/constants/game';

export function useDropSystem() {
  const dropsRef = useRef<Drop[]>([]);
  const lastDropTimeRef = useRef(0);
  const dropIdCounter = useRef(0);

  const createDrop = useCallback((gameSpeed: number, isRainShower = false, cloudX = 400): Drop => {
    const dropType = getRandomDropType();
    let color: string;
    let colorIndex: number;
    let speedMultiplier = 1;

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
      x: Math.random() * (GAME_CONSTANTS.CANVAS_WIDTH - 40) + 20,
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
      drop.amplitude = 30 + Math.random() * 50; // Reduced amplitude for better tracking
      drop.frequency = 0.03 + Math.random() * 0.02;
      drop.startY = drop.y;
      // Start rocket closer to cloud X position for better tracking
      drop.x = cloudX + (Math.random() - 0.5) * 200;
    }

    return drop;
  }, []);

  const getRandomDropType = useCallback((): Drop['type'] => {
    const rand = Math.random();
    console.log('Random value:', rand); // Debug log

    // Check for special drops first (total ~21.2%)
    let cumulativeProbability = 0;

    // Ultra rare drops
    cumulativeProbability += GAME_CONSTANTS.RAINBOW_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      console.log('Generated: rainbow');
      return 'rainbow';
    }

    cumulativeProbability += GAME_CONSTANTS.HEART_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      console.log('Generated: heart');
      return 'heart';
    }

    // Water drop
    cumulativeProbability += GAME_CONSTANTS.WATER_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      console.log('Generated: water');
      return 'water';
    }

    // Double points
    cumulativeProbability += GAME_CONSTANTS.DOUBLE_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      console.log('Generated: double');
      return 'double';
    }

    // Power-up drops
    cumulativeProbability += GAME_CONSTANTS.LIGHTNING_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      console.log('Generated: lightning');
      return 'lightning';
    }

    cumulativeProbability += GAME_CONSTANTS.HAIL_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      console.log('Generated: hail');
      return 'hail';
    }

    cumulativeProbability += GAME_CONSTANTS.REVERSE_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      console.log('Generated: reverse');
      return 'reverse';
    }

    // Dangerous drops
    cumulativeProbability += GAME_CONSTANTS.BOMB_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      console.log('Generated: bomb');
      return 'bomb';
    }

    cumulativeProbability += GAME_CONSTANTS.ROCKET_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      console.log('Generated: rocket');
      return 'rocket';
    }

    // Everything else is normal rainbow drops (~78.8%)
    console.log('Generated: normal (default)');
    return 'normal';
  }, []);

  const spawnDrop = useCallback(
    (gameSpeed: number, isRainShower = false, cloudX = 400) => {
      const newDrop = createDrop(gameSpeed, isRainShower, cloudX);
      dropsRef.current.push(newDrop);
    },
    [createDrop],
  );

  const updateDrops = useCallback(
    (gameSpeed: number, isRainShower = false, cloudX = 400) => {
      const now = Date.now();
      // Faster spawn rate for more drops
      const spawnRate = isRainShower ? 150 : Math.max(300, 800 / gameSpeed);

      if (now - lastDropTimeRef.current > spawnRate) {
        spawnDrop(gameSpeed, isRainShower, cloudX);
        lastDropTimeRef.current = now;
      }

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
            const deltaY = GAME_CONSTANTS.CLOUD_Y_POSITION - drop.y;

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
            drop.x = Math.max(20, Math.min(GAME_CONSTANTS.CANVAS_WIDTH - 20, drop.x));
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
