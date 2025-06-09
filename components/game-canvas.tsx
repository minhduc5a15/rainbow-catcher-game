'use client';

import { useCallback } from 'react';
import type { Cloud, ColorDrop, GameState } from '../types/game';
import { RAINBOW_COLORS } from '../types/game';

interface GameCanvasProps {
  gameState: GameState;
  cloud: Cloud;
  colorDrops: ColorDrop[];
  updateAndDrawParticles: (ctx: CanvasRenderingContext2D) => void;
}

export function useGameCanvas() {
  const drawCloud = useCallback((ctx: CanvasRenderingContext2D, cloud: Cloud, isDamaged = false) => {
    // Add speed boost glow effect
    if (cloud.speedMultiplier > 1) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
    }

    // Add damage flash effect
    if (isDamaged) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 25;
    }

    // Enhanced cloud drawing with more realistic shape
    ctx.fillStyle = isDamaged ? '#FFB3B3' : '#FFFFFF';
    ctx.strokeStyle = isDamaged ? '#FF6666' : '#E0E0E0';
    ctx.lineWidth = 2;

    // Main cloud body with multiple overlapping circles for fluffy effect
    ctx.beginPath();

    // Bottom layer (larger circles)
    ctx.arc(cloud.x - 25, cloud.y + 5, 18, 0, Math.PI * 2);
    ctx.arc(cloud.x, cloud.y, 25, 0, Math.PI * 2);
    ctx.arc(cloud.x + 25, cloud.y + 5, 18, 0, Math.PI * 2);

    // Middle layer
    ctx.arc(cloud.x - 15, cloud.y - 10, 15, 0, Math.PI * 2);
    ctx.arc(cloud.x + 15, cloud.y - 10, 15, 0, Math.PI * 2);

    // Top layer (smaller circles for detail)
    ctx.arc(cloud.x - 8, cloud.y - 20, 12, 0, Math.PI * 2);
    ctx.arc(cloud.x + 8, cloud.y - 20, 12, 0, Math.PI * 2);
    ctx.arc(cloud.x, cloud.y - 15, 14, 0, Math.PI * 2);

    ctx.fill();
    ctx.stroke();

    // Add cloud highlights for 3D effect
    ctx.fillStyle = isDamaged ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(cloud.x - 8, cloud.y - 8, 8, 0, Math.PI * 2);
    ctx.arc(cloud.x + 12, cloud.y - 12, 6, 0, Math.PI * 2);
    ctx.fill();

    // Add cute cloud face
    if (!isDamaged) {
      // Eyes
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(cloud.x - 8, cloud.y - 5, 2, 0, Math.PI * 2);
      ctx.arc(cloud.x + 8, cloud.y - 5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y + 2, 8, 0, Math.PI);
      ctx.stroke();
    } else {
      // Hurt expression
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(cloud.x - 8, cloud.y - 5, 2, 0, Math.PI * 2);
      ctx.arc(cloud.x + 8, cloud.y - 5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Frown
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y + 8, 8, Math.PI, 0);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }, []);

  const drawColorDrop = useCallback((ctx: CanvasRenderingContext2D, drop: ColorDrop, isTargetColor = false) => {
    // Add pulsing effect for target color
    if (isTargetColor && drop.type === 'normal') {
      const pulseSize = 2 + Math.sin(Date.now() * 0.01) * 1;
      ctx.shadowColor = drop.color;
      ctx.shadowBlur = 15;

      // Outer glow ring
      ctx.strokeStyle = drop.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, 12 + pulseSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (drop.type === 'golden') {
      // Enhanced golden drop with sparkle animation
      const sparkleOffset = Math.sin(Date.now() * 0.02) * 2;
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(drop.x, drop.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Animated sparkles
      ctx.fillStyle = '#FFFF00';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(drop.x, drop.y + 4);
      ctx.rotate(sparkleOffset * 0.1);
      ctx.fillText('⚡', 0, 0);
      ctx.restore();
    } else if (drop.type === 'black') {
      // Enhanced black drop with danger pulsing
      const dangerPulse = 1 + Math.sin(Date.now() * 0.02) * 0.3;
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2 * dangerPulse;
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 15 * dangerPulse;

      ctx.beginPath();
      ctx.arc(drop.x, drop.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FF0000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💣', drop.x, drop.y + 4);
    } else if (drop.type === 'rainbow') {
      // Enhanced rainbow drop with rotating colors
      const time = Date.now() * 0.01;
      const hue = (time + drop.x) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.arc(drop.x, drop.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotating rainbow symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(drop.x, drop.y + 4);
      ctx.rotate(time * 0.1);
      ctx.fillText('🌈', 0, 0);
      ctx.restore();
    } else {
      // Enhanced normal drop
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Enhanced highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(drop.x - 2, drop.y - 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }, []);

  const drawRainbowProgressBar = useCallback((ctx: CanvasRenderingContext2D, nextColorIndex: number, perfectCount: number) => {
    const barWidth = 300;
    const barHeight = 20;
    const barX = 250;
    const barY = 25;

    // Enhanced background with gradient
    const bgGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
    bgGradient.addColorStop(0, '#444');
    bgGradient.addColorStop(1, '#222');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Draw segments with glow effect
    const segmentWidth = barWidth / 7;
    for (let i = 0; i < 7; i++) {
      if (i < nextColorIndex) {
        ctx.fillStyle = RAINBOW_COLORS[i].color;
        ctx.shadowColor = RAINBOW_COLORS[i].color;
        ctx.shadowBlur = 5;
      } else {
        ctx.fillStyle = '#666';
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(barX + i * segmentWidth, barY, segmentWidth, barHeight);
    }

    // Enhanced border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 0;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Enhanced label with background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX, barY - 20, barWidth, 18);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Rainbow Progress (Perfect: ${perfectCount})`, barX + barWidth / 2, barY - 8);
  }, []);

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, gameState: GameState) => {
      // Enhanced sky gradient with more colors
      const gradient = ctx.createLinearGradient(0, 0, 0, 600);
      if (gameState.isRainShower) {
        gradient.addColorStop(0, '#2D3748');
        gradient.addColorStop(0.5, '#4A5568');
        gradient.addColorStop(1, '#718096');
      } else {
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.3, '#98D8E8');
        gradient.addColorStop(0.7, '#B8E6F0');
        gradient.addColorStop(1, '#E0F6FF');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // Enhanced rainbow arc with glow
      const centerX = 400;
      const centerY = 80;
      const radius = 140;

      for (let i = 0; i < RAINBOW_COLORS.length; i++) {
        ctx.strokeStyle = RAINBOW_COLORS[i].color;
        ctx.lineWidth = 12;
        ctx.shadowColor = RAINBOW_COLORS[i].color;
        ctx.shadowBlur = gameState.isRainShower ? 2 : 8;
        ctx.globalAlpha = gameState.isRainShower ? 0.2 : 0.6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + i * 12, 0, Math.PI);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Enhanced rain effect
      if (gameState.isRainShower) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 150; i++) {
          const x = Math.random() * 800;
          const y = (Date.now() * 0.8 + i * 15) % 620;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 8, y + 15);
          ctx.stroke();
        }
      }

      drawRainbowProgressBar(ctx, gameState.nextColorIndex, gameState.perfectRainbowCount);
    },
    [drawRainbowProgressBar],
  );

  const renderGame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      gameState: GameState,
      cloud: Cloud,
      colorDrops: ColorDrop[],
      updateAndDrawParticles: (ctx: CanvasRenderingContext2D) => void,
      updateAndDrawDamageTexts: (ctx: CanvasRenderingContext2D) => void,
      isDamaged = false,
    ) => {
      ctx.clearRect(0, 0, 800, 600);
      drawBackground(ctx, gameState);

      // Draw drops with target color highlighting
      colorDrops.forEach((drop) => {
        const isTargetColor = drop.type === 'normal' && drop.colorIndex === gameState.nextColorIndex;
        drawColorDrop(ctx, drop, isTargetColor);
      });

      drawCloud(ctx, cloud, isDamaged);
      updateAndDrawParticles(ctx);
      updateAndDrawDamageTexts(ctx);

      // Enhanced auto-collect effect
      if (gameState.isAutoCollecting) {
        const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 400);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText('✨ AUTO COLLECT ACTIVE! ✨', 400, 300);
        ctx.fillText('✨ AUTO COLLECT ACTIVE! ✨', 400, 300);
      }
    },
    [drawBackground, drawCloud, drawColorDrop],
  );

  return { renderGame };
}
