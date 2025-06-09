'use client';

import { useRef, useCallback } from 'react';
import { GAME_CONSTANTS } from '../constants/game';

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

export function useWeatherEffects() {
  const weatherElementsRef = useRef<WeatherElement[]>([]);
  const lastSpawnTimeRef = useRef(0);

  const createWeatherElement = useCallback((): WeatherElement => {
    const elementType = Math.random() < 0.7 ? 'wind' : Math.random() < 0.8 ? 'bird' : 'cloud';

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
      if (isRainShower) {
        weatherElementsRef.current = [];
        return;
      }

      const now = Date.now();

      // Spawn new weather elements occasionally
      if (now - lastSpawnTimeRef.current > 3000 + Math.random() * 5000) {
        weatherElementsRef.current.push(createWeatherElement());
        lastSpawnTimeRef.current = now;
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
    },
    [createWeatherElement],
  );

  const drawWeatherEffects = useCallback((ctx: CanvasRenderingContext2D) => {
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
        ctx.ellipse(element.x - 2, element.y + flapOffset, 4 * element.size, 1 * element.size, -0.3, 0, Math.PI * 2);
        ctx.ellipse(element.x + 2, element.y - flapOffset, 4 * element.size, 1 * element.size, 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (element.type === 'cloud') {
        // Draw small background cloud
        ctx.fillStyle = '#F0F0F0';
        const bobOffset = Math.sin(element.animationOffset) * 2;

        ctx.beginPath();
        ctx.arc(element.x, element.y + bobOffset, 8 * element.size, 0, Math.PI * 2);
        ctx.arc(element.x + 10, element.y + bobOffset, 6 * element.size, 0, Math.PI * 2);
        ctx.arc(element.x + 18, element.y + bobOffset, 8 * element.size, 0, Math.PI * 2);
        ctx.arc(element.x + 9, element.y + bobOffset - 5, 5 * element.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }, []);

  const clearWeatherEffects = useCallback(() => {
    weatherElementsRef.current = [];
  }, []);

  return {
    updateWeatherEffects,
    drawWeatherEffects,
    clearWeatherEffects,
  };
}
