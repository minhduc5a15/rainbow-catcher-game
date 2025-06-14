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
      case 'shield':
        color = '#32CD32';
        colorIndex = -10;
        break;
      case 'meteorite':
        color = '#FF4500';
        colorIndex = -11;
        speedMultiplier = GAME_CONSTANTS.METEORITE_SPEED_MULTIPLIER;
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
      rotation: dropType !== 'shield' ? Math.random() * Math.PI * 2 : 0,
      shadowOffset: Math.random() * GAME_CONSTANTS.SHADOW_OFFSET_MAX,
    };

    // Add rocket-specific properties with improved cloud tracking
    if (dropType === 'rocket') {
      drop.angle = Math.random() * Math.PI * 2;
      drop.amplitude = 15 + Math.random() * 20; // Reduced amplitude further
      drop.frequency = 0.015 + Math.random() * 0.008; // Slower frequency
      drop.startY = drop.y;
      // Start rocket much closer to cloud X position for better tracking
      drop.x = cloudX + (Math.random() - 0.5) * 100; // Much reduced spread
    }

    // Add meteorite-specific properties
    if (dropType === 'meteorite') {
      // Determine spawn side and target
      const spawnFromLeft = Math.random() < 0.5;

      if (spawnFromLeft) {
        // Spawn from left third, target right third
        drop.x = Math.random() * (canvasWidth / 3);
        drop.targetX = (canvasWidth * 2) / 3 + Math.random() * (canvasWidth / 3);
        drop.direction = 'left-to-right';
      } else {
        // Spawn from right third, target left third
        drop.x = (canvasWidth * 2) / 3 + Math.random() * (canvasWidth / 3);
        drop.targetX = Math.random() * (canvasWidth / 3);
        drop.direction = 'right-to-left';
      }

      drop.startX = drop.x;
      drop.y = -100; // Start higher up
      drop.trailParticles = [];
      drop.hasHitGround = false; // New property to track if meteorite hit ground
    }

    return drop;
  }, []);

  const getRandomDropType = useCallback((): Drop['type'] => {
    const rand = Math.random();

    // Check for special drops first (total ~27.3%)
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

    cumulativeProbability += GAME_CONSTANTS.METEORITE_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      return 'meteorite';
    }

    // Shield drop (between heart and lightning)
    cumulativeProbability += GAME_CONSTANTS.SHIELD_DROP_CHANCE;
    if (rand <= cumulativeProbability) {
      return 'shield';
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

    // Everything else is normal rainbow drops (~72.7%)
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
      const canvasHeight = focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_HEIGHT : GAME_CONSTANTS.CANVAS_HEIGHT;

      // Update drop movements
      dropsRef.current.forEach((drop) => {
        // Update 3D effects
        if (drop.rotation !== undefined) {
          const dropTypes: Drop['type'][] = ['double', 'water', 'shield'];
          if (!dropTypes.includes(drop.type)) {
            drop.rotation += GAME_CONSTANTS.DROP_ROTATION_SPEED;
          }
        }

        if (drop.type === 'rainbow') {
          // Rainbow drop complex pattern
          drop.x += Math.sin(drop.y * 0.01) * 2;
        } else if (drop.type === 'rocket') {
          // Improved rocket movement with much better tracking
          if (drop.angle !== undefined && drop.amplitude !== undefined && drop.frequency !== undefined && drop.startY !== undefined) {
            drop.angle += drop.frequency;

            // Calculate direction towards cloud with improved accuracy
            const targetX = cloudX;
            const deltaX = targetX - drop.x;
            const deltaY = cloudY - drop.y;

            // Normalize direction
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > 0) {
              const directionX = deltaX / distance;
              const directionY = deltaY / distance;

              // Much reduced oscillation and better boundary checking
              const oscillation = Math.sin(drop.angle) * drop.amplitude * 0.1; // Much reduced oscillation

              // More direct movement towards cloud
              const moveX = directionX * drop.speed * 0.6 + oscillation; // Increased tracking strength
              const moveY = Math.max(
                drop.speed * 0.4, // Minimum Y movement
                directionY * drop.speed * 0.4,
              );

              // Check boundaries before moving
              const newX = drop.x + moveX;
              const canvasWidth = focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_WIDTH : GAME_CONSTANTS.CANVAS_WIDTH;

              // Only move X if it won't hit boundaries, otherwise move more towards center
              if (newX >= 20 && newX <= canvasWidth - 20) {
                drop.x = newX;
              } else {
                // If hitting boundary, move towards center instead
                const centerX = canvasWidth / 2;
                const toCenterX = centerX - drop.x;
                drop.x += toCenterX * 0.1; // Gentle movement towards center
              }

              drop.y += moveY;
            } else {
              // Fallback movement
              drop.y += drop.speed * 0.4;
            }
          }
        } else if (drop.type === 'meteorite') {
          // Meteorite diagonal movement
          if (drop.targetX !== undefined && drop.startX !== undefined) {
            const progress = (drop.y + 100) / (canvasHeight + 200); // Progress from 0 to 1
            const targetProgress = Math.min(progress, 1);

            // Calculate current X position based on progress
            drop.x = drop.startX + (drop.targetX - drop.startX) * targetProgress;

            // Update trail particles
            if (!drop.trailParticles) drop.trailParticles = [];

            // Add new trail particle
            drop.trailParticles.push({
              x: drop.x + (Math.random() - 0.5) * 20,
              y: drop.y + (Math.random() - 0.5) * 20,
              life: 30,
            });

            // Update existing trail particles
            drop.trailParticles = drop.trailParticles.filter((particle) => {
              particle.life--;
              return particle.life > 0;
            });

            // Check if meteorite hit the ground
            if (drop.y > canvasHeight && !drop.hasHitGround) {
              drop.hasHitGround = true;
              // Trigger screen shake effect
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('meteoriteImpact'));
              }
            }

            // Destroy other drops in path (but don't remove meteorite itself)
            const meteoriteRadius = GAME_CONSTANTS.METEORITE_RADIUS;
            dropsRef.current = dropsRef.current.filter((otherDrop) => {
              if (otherDrop.id === drop.id || otherDrop.type === 'meteorite') return true;

              const distance = Math.sqrt(Math.pow(otherDrop.x - drop.x, 2) + Math.pow(otherDrop.y - drop.y, 2));

              return distance > meteoriteRadius;
            });
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
