'use client';

import { useRef, useCallback } from 'react';
import type { Particle } from '../types/game';

export function useParticleSystem() {
  const particlesRef = useRef<Particle[]>([]);

  const createCatchParticles = useCallback((x: number, y: number, color: string) => {
    const particleCount = 20;
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
        life: 80,
        maxLife: 80,
        gravity: 0.1,
      };
      particlesRef.current.push(particle);
    }
  }, []);

  const createPerfectRainbowEffect = useCallback((x: number, y: number) => {
    const particleCount = 50;
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
        life: 120,
        maxLife: 120,
        gravity: 0.05,
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
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
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
    updateAndDrawParticles,
    clearParticles,
  };
}
