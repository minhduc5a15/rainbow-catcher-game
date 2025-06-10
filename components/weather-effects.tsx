'use client';

import { useCallback, useRef } from 'react';
import { GAME_CONSTANTS } from '../constants/game';
import type { BackgroundCloud } from '../types/game';

interface WeatherElement {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  opacity: number;
  type: 'wind' | 'bird' | 'cloud';
  animationOffset: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  twinkle: number;
  brightness: number;
}

export function useWeatherEffects() {
  const weatherElementsRef = useRef<WeatherElement[]>([]);
  const backgroundCloudsRef = useRef<BackgroundCloud[]>([]);
  const lastSpawnTimeRef = useRef(0);
  const lastLightningTimeRef = useRef(0);
  const lightningFlashRef = useRef(false);
  const lightningFlashDurationRef = useRef(0);
  const starSystemRef = useRef<Star[]>([]);

  const initBackgroundClouds = useCallback(() => {
    const clouds: BackgroundCloud[] = [];
    for (let i = 0; i < GAME_CONSTANTS.BACKGROUND_CLOUD_COUNT; i++) {
      clouds.push({
        x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH,
        y: Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT * 0.6),
        size: 0.3 + Math.random() * 0.7,
        speed: 0.1 + Math.random() * 0.3,
        opacity: 0.3 + Math.random() * 0.4,
      });
    }
    backgroundCloudsRef.current = clouds;
  }, []);

  const initWeatherElements = useCallback(() => {
    const elements: WeatherElement[] = [];

    // Add wind elements
    for (let i = 0; i < GAME_CONSTANTS.WIND_COUNT; i++) {
      elements.push({
        x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH,
        y: Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT - 200) + 100,
        speedX: 0.5 + Math.random() * 1.5,
        speedY: (Math.random() - 0.5) * 0.5,
        size: 0.8 + Math.random() * 0.4,
        opacity: 0.3 + Math.random() * 0.4,
        type: 'wind',
        animationOffset: Math.random() * Math.PI * 2,
      });
    }

    // Add bird elements
    for (let i = 0; i < GAME_CONSTANTS.BIRD_COUNT; i++) {
      elements.push({
        x: -50 - Math.random() * 100,
        y: Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT * 0.5) + 50,
        speedX: 0.8 + Math.random() * 1.2,
        speedY: (Math.random() - 0.5) * 0.3,
        size: 0.8 + Math.random() * 0.4,
        opacity: 0.6 + Math.random() * 0.4,
        type: 'bird',
        animationOffset: Math.random() * Math.PI * 2,
      });
    }

    weatherElementsRef.current = elements;
  }, []);

  const createWeatherElement = useCallback((): WeatherElement => {
    const elementType = Math.random() < 0.7 ? 'wind' : 'bird';

    return {
      x: -50,
      y: Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT - 200) + 100,
      speedX: 0.5 + Math.random() * 1.5,
      speedY: (Math.random() - 0.5) * 0.5,
      size: elementType === 'bird' ? 1 : 0.8 + Math.random() * 0.4,
      opacity: 0.3 + Math.random() * 0.4,
      type: elementType,
      animationOffset: Math.random() * Math.PI * 2,
    };
  }, []);

  const updateWeatherEffects = useCallback(
    (isRainShower: boolean) => {
      const now = Date.now();

      // Update lightning effects during rain shower
      if (isRainShower) {
        // Clear normal weather elements
        weatherElementsRef.current = weatherElementsRef.current.filter((el) => el.type === 'cloud');

        // Check if it's time for a new lightning flash
        if (now > lastLightningTimeRef.current) {
          lightningFlashRef.current = true;
          lightningFlashDurationRef.current = GAME_CONSTANTS.LIGHTNING_FLASH_DURATION;

          // Set next lightning time
          const nextInterval =
            GAME_CONSTANTS.LIGHTNING_INTERVAL_MIN + Math.random() * (GAME_CONSTANTS.LIGHTNING_INTERVAL_MAX - GAME_CONSTANTS.LIGHTNING_INTERVAL_MIN);
          lastLightningTimeRef.current = now + nextInterval;
        }

        // Update lightning flash duration
        if (lightningFlashRef.current) {
          lightningFlashDurationRef.current -= 16; // Approximate for 60fps
          if (lightningFlashDurationRef.current <= 0) {
            lightningFlashRef.current = false;
          }
        }
      } else {
        // Spawn new weather elements occasionally
        if (now - lastSpawnTimeRef.current > 3000 + Math.random() * 5000) {
          weatherElementsRef.current.push(createWeatherElement());
          lastSpawnTimeRef.current = now;
        }
      }

      // Update existing elements
      const elements = weatherElementsRef.current;
      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        element.x += element.speedX;
        element.y += element.speedY;
        element.animationOffset += 0.02;

        // Remove elements that have moved off screen
        if (element.x > GAME_CONSTANTS.CANVAS_WIDTH + 50) {
          elements.splice(i, 1);
        }
      }

      // Update background clouds
      backgroundCloudsRef.current.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x > GAME_CONSTANTS.CANVAS_WIDTH + 100) {
          cloud.x = -100;
          cloud.y = Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT * 0.6);
        }
      });
    },
    [createWeatherElement],
  );

  const drawBackgroundClouds = useCallback((ctx: CanvasRenderingContext2D) => {
    const clouds = backgroundCloudsRef.current;

    for (const cloud of clouds) {
      ctx.globalAlpha = cloud.opacity;
      ctx.fillStyle = '#FFFFFF';

      // Draw cloud with multiple overlapping circles without stroke
      ctx.beginPath();
      const centerX = cloud.x;
      const centerY = cloud.y;
      const baseSize = 30 * cloud.size;

      // Main cloud body
      ctx.arc(centerX, centerY, baseSize, 0, Math.PI * 2);
      ctx.arc(centerX + baseSize * 0.8, centerY, baseSize * 0.9, 0, Math.PI * 2);
      ctx.arc(centerX - baseSize * 0.8, centerY, baseSize * 0.8, 0, Math.PI * 2);
      ctx.arc(centerX + baseSize * 0.4, centerY - baseSize * 0.5, baseSize * 0.7, 0, Math.PI * 2);
      ctx.arc(centerX - baseSize * 0.4, centerY - baseSize * 0.5, baseSize * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }, []);

  const drawWeatherEffects = useCallback(
    (ctx: CanvasRenderingContext2D, timeOfDay: 'day' | 'night' = 'day') => {
      // Draw background clouds first
      drawBackgroundClouds(ctx);

      // Draw other weather elements
      const elements = weatherElementsRef.current;

      for (const element of elements) {
        ctx.globalAlpha = element.opacity;

        if (element.type === 'wind') {
          // Draw wind lines
          ctx.strokeStyle = '#E0E0E0';
          ctx.lineWidth = 1;
          const waveOffset = Math.sin(element.animationOffset) * 5;

          ctx.beginPath();
          ctx.moveTo(element.x, element.y + waveOffset);
          ctx.lineTo(element.x + 30, element.y + waveOffset + 2);
          ctx.moveTo(element.x + 5, element.y + waveOffset + 8);
          ctx.lineTo(element.x + 25, element.y + waveOffset + 10);
          ctx.moveTo(element.x + 10, element.y + waveOffset + 16);
          ctx.lineTo(element.x + 35, element.y + waveOffset + 18);
          ctx.stroke();
        } else if (element.type === 'bird') {
          // Draw simple bird silhouette
          ctx.fillStyle = '#333333';
          const flapOffset = Math.sin(element.animationOffset * 3) * 2;

          ctx.beginPath();
          // Bird body
          ctx.ellipse(element.x, element.y, 3 * element.size, 1.5 * element.size, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bird wings
          ctx.beginPath();
          ctx.ellipse(element.x - 2, element.y + flapOffset, 4 * element.size, element.size, -0.3, 0, Math.PI * 2);
          ctx.ellipse(element.x + 2, element.y - flapOffset, 4 * element.size, element.size, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    },
    [drawBackgroundClouds],
  );

  const isLightningFlash = useCallback(() => {
    return lightningFlashRef.current;
  }, []);

  const initStars = useCallback(() => {
    const stars: Star[] = [];
    for (let i = 0; i < GAME_CONSTANTS.STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH,
        y: Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT * 0.7),
        size: 1 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
        brightness: 0.5 + Math.random() * 0.5,
      });
    }
    starSystemRef.current = stars;
  }, []);

  const clearWeatherEffects = useCallback(() => {
    weatherElementsRef.current = [];
    initBackgroundClouds();
    initWeatherElements();
    initStars();
    lastLightningTimeRef.current = Date.now() + 2000;
  }, [initBackgroundClouds, initWeatherElements, initStars]);

  const updateStars = useCallback(() => {
    starSystemRef.current.forEach((star) => {
      star.twinkle += 0.05;
    });
  }, []);

  const drawStars = useCallback((ctx: CanvasRenderingContext2D) => {
    const stars = starSystemRef.current;

    for (const star of stars) {
      ctx.globalAlpha = star.brightness * (0.7 + 0.3 * Math.sin(star.twinkle));
      ctx.fillStyle = '#FFD700';

      // Draw star shape
      ctx.save();
      ctx.translate(star.x, star.y);
      ctx.beginPath();

      // Simple star shape with 5 points
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5;
        const radius = i % 2 === 0 ? star.size : star.size * 0.5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.globalAlpha = 1;
  }, []);

  return {
    updateWeatherEffects,
    drawWeatherEffects,
    clearWeatherEffects,
    isLightningFlash,
    initBackgroundClouds,
    initWeatherElements,
    initStars,
    updateStars,
    drawStars,
  };
}
