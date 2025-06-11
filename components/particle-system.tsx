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
        // 3D effects
        z: Math.random() * GAME_CONSTANTS.PARTICLE_Z_RANGE,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        rotation: Math.random() * Math.PI * 2,
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
        // 3D effects
        z: Math.random() * GAME_CONSTANTS.PARTICLE_Z_RANGE,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * Math.PI * 2,
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
        // 3D effects
        z: Math.random() * GAME_CONSTANTS.PARTICLE_Z_RANGE,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        rotation: Math.random() * Math.PI * 2,
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

      // Update 3D effects
      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed;
      }

      // Remove dead particles
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // Draw particle with 3D effects and fading
      ctx.save();
      ctx.translate(p.x, p.y);

      // Apply 3D rotation
      if (p.rotation !== undefined) {
        ctx.rotate(p.rotation);
      }

      // Apply 3D scaling based on z-depth
      if (p.z !== undefined) {
        const scale = 0.5 + (p.z / GAME_CONSTANTS.PARTICLE_Z_RANGE) * 0.5;
        ctx.scale(scale, scale);
      }

      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
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
