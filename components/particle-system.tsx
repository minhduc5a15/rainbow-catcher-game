'use client';

import { useCallback, useRef } from 'react';
import type { Particle } from '@/types/game';
import { GAME_CONSTANTS } from '@/constants/game';

export function useParticleSystem() {
  const particlesRef = useRef<Particle[]>([]);

  const createCatchParticles = useCallback((x: number, y: number, color: string) => {
    const particleCount = GAME_CONSTANTS.PARTICLE_COUNT_NORMAL;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const particle: Particle = {
        x,
        y,
        color,
        size: 2 + Math.random() * 3,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 2, // Upward bias
        life: GAME_CONSTANTS.PARTICLE_LIFETIME,
        maxLife: GAME_CONSTANTS.PARTICLE_LIFETIME,
        gravity: 0.1,
      };
      particlesRef.current.push(particle);
    }
  }, []);

  const createPerfectRainbowEffect = useCallback((x: number, y: number) => {
    const particleCount = GAME_CONSTANTS.PARTICLE_COUNT_PERFECT;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      const colorIndex = Math.floor(Math.random() * 7);
      const particle: Particle = {
        x,
        y,
        color: `hsl(${colorIndex * 51}, 100%, 50%)`,
        size: 3 + Math.random() * 5,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 3,
        life: GAME_CONSTANTS.PERFECT_PARTICLE_LIFETIME,
        maxLife: GAME_CONSTANTS.PERFECT_PARTICLE_LIFETIME,
        gravity: 0.05,
      };
      particlesRef.current.push(particle);
    }
  }, []);

  const createRainbowLostEffect = useCallback((x: number, y: number) => {
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      const particle: Particle = {
        x,
        y,
        color: '#FF0000',
        size: 2 + Math.random() * 3,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 1,
        life: 60,
        maxLife: 60,
        gravity: 0.1,
      };
      particlesRef.current.push(particle);
    }
  }, []);

  const updateAndDrawParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Update particle
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += p.gravity; // Apply gravity
      p.life--;

      // Remove dead particles
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // Draw particle with fading effect
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, []);

  const clearParticles = useCallback(() => {
    particlesRef.current = [];
  }, []);

  return {
    createCatchParticles,
    createPerfectRainbowEffect,
    createRainbowLostEffect,
    updateAndDrawParticles,
    clearParticles,
  };
}
