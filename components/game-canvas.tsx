'use client';

import { useCallback } from 'react';
import type { Cloud, ColorDrop, GameState } from '../types/game';
import { RAINBOW_COLORS } from '../types/game';
import { GAME_CONSTANTS } from '../constants/game';

export function useGameCanvas() {
  const drawCloud = useCallback((ctx: CanvasRenderingContext2D, cloud: Cloud, isDamaged = false) => {
    // Add speed boost glow effect - FIXED
    if (cloud.speedMultiplier > 1) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Add damage flash effect
    if (isDamaged) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Enhanced cloud drawing with more realistic shape
    ctx.fillStyle = isDamaged ? '#FFB3B3' : cloud.speedMultiplier > 1 ? '#FFFACD' : '#FFFFFF';
    ctx.strokeStyle = isDamaged ? '#FF6666' : cloud.speedMultiplier > 1 ? '#FFD700' : '#E0E0E0';
    ctx.lineWidth = cloud.speedMultiplier > 1 ? 3 : 2;

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

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
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
      ctx.arc(drop.x, drop.y, GAME_CONSTANTS.LARGE_DROP_RADIUS + pulseSize, 0, Math.PI * 2);
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
      ctx.arc(drop.x, drop.y, GAME_CONSTANTS.SPECIAL_DROP_RADIUS, 0, Math.PI * 2);
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
      ctx.arc(drop.x, drop.y, GAME_CONSTANTS.SPECIAL_DROP_RADIUS, 0, Math.PI * 2);
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
      ctx.arc(drop.x, drop.y, GAME_CONSTANTS.LARGE_DROP_RADIUS, 0, Math.PI * 2);
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
    } else if (drop.type === 'heart') {
      // Heart drop with pulsing effect
      const heartPulse = 1 + Math.sin(Date.now() * 0.02) * 0.2;
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = '#FF1493';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#FF69B4';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(drop.x, drop.y, GAME_CONSTANTS.SPECIAL_DROP_RADIUS * heartPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('❤️', drop.x, drop.y + 4);
    } else {
      // Enhanced normal drop
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, GAME_CONSTANTS.DROP_RADIUS, 0, Math.PI * 2);
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

  const drawRainbowProgressBar = useCallback((ctx: CanvasRenderingContext2D, nextColorIndex: number, perfectCount: number, showLostMessage = false) => {
    const barWidth = GAME_CONSTANTS.PROGRESS_BAR_WIDTH;
    const barHeight = GAME_CONSTANTS.PROGRESS_BAR_HEIGHT;
    const barX = GAME_CONSTANTS.PROGRESS_BAR_X;
    const barY = GAME_CONSTANTS.PROGRESS_BAR_Y;

    // Enhanced background with gradient and border
    const bgGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
    bgGradient.addColorStop(0, '#2a2a2a');
    bgGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    // Inner background
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Draw segments with enhanced effects
    const segmentWidth = barWidth / 7;
    for (let i = 0; i < 7; i++) {
      const segmentX = barX + i * segmentWidth;

      if (i < nextColorIndex) {
        // Completed segments with glow
        const gradient = ctx.createLinearGradient(segmentX, barY, segmentX, barY + barHeight);
        gradient.addColorStop(0, RAINBOW_COLORS[i].color);
        gradient.addColorStop(1, `${RAINBOW_COLORS[i].color}CC`);

        ctx.fillStyle = gradient;
        ctx.shadowColor = RAINBOW_COLORS[i].color;
        ctx.shadowBlur = 8;
        ctx.fillRect(segmentX + 1, barY + 1, segmentWidth - 2, barHeight - 2);

        // Add shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(segmentX + 1, barY + 1, segmentWidth - 2, 3);
      } else if (i === nextColorIndex) {
        // Current target segment with pulsing effect
        const pulse = 0.7 + Math.sin(Date.now() * 0.008) * 0.3;
        ctx.fillStyle = `${RAINBOW_COLORS[i].color}${Math.floor(pulse * 255)
          .toString(16)
          .padStart(2, '0')}`;
        ctx.shadowColor = RAINBOW_COLORS[i].color;
        ctx.shadowBlur = 12;
        ctx.fillRect(segmentX + 1, barY + 1, segmentWidth - 2, barHeight - 2);

        // Animated border
        ctx.strokeStyle = RAINBOW_COLORS[i].color;
        ctx.lineWidth = 2;
        ctx.strokeRect(segmentX + 1, barY + 1, segmentWidth - 2, barHeight - 2);
      } else {
        // Incomplete segments
        ctx.fillStyle = '#555555';
        ctx.shadowBlur = 0;
        ctx.fillRect(segmentX + 1, barY + 1, segmentWidth - 2, barHeight - 2);
      }
    }

    // Enhanced border with gradient
    const borderGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
    borderGradient.addColorStop(0, '#666666');
    borderGradient.addColorStop(1, '#333333');
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Segment dividers
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    for (let i = 1; i < 7; i++) {
      const dividerX = barX + i * segmentWidth;
      ctx.beginPath();
      ctx.moveTo(dividerX, barY);
      ctx.lineTo(dividerX, barY + barHeight);
      ctx.stroke();
    }

    // Enhanced label with better styling
    const labelY = barY - 25;
    const labelHeight = 20;

    // Label background with gradient
    const labelGradient = ctx.createLinearGradient(barX, labelY, barX, labelY + labelHeight);
    labelGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    labelGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = labelGradient;
    ctx.fillRect(barX, labelY, barWidth, labelHeight);

    // Label border
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, labelY, barWidth, labelHeight);

    // Label text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 2;

    if (showLostMessage) {
      ctx.fillStyle = '#FF6666';
      ctx.fillText('Perfect Rainbow Lost! Starting Over...', barX + barWidth / 2, labelY + 14);
    } else {
      ctx.fillText(`Rainbow Progress (Perfect: ${perfectCount})`, barX + barWidth / 2, labelY + 14);
    }

    ctx.shadowBlur = 0;
  }, []);

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, gameState: GameState, drawWeatherEffects?: (ctx: CanvasRenderingContext2D) => void) => {
      // Enhanced sky gradient with more colors
      const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONSTANTS.CANVAS_HEIGHT);
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
      ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);

      // Draw weather effects for normal weather
      if (!gameState.isRainShower && drawWeatherEffects) {
        drawWeatherEffects(ctx);
      }

      // Enhanced rainbow arc with glow
      const centerX = GAME_CONSTANTS.RAINBOW_CENTER_X;
      const centerY = GAME_CONSTANTS.RAINBOW_CENTER_Y;
      const radius = GAME_CONSTANTS.RAINBOW_BASE_RADIUS;

      for (let i = 0; i < RAINBOW_COLORS.length; i++) {
        ctx.strokeStyle = RAINBOW_COLORS[i].color;
        ctx.lineWidth = GAME_CONSTANTS.RAINBOW_SEGMENT_WIDTH;
        ctx.shadowColor = RAINBOW_COLORS[i].color;
        ctx.shadowBlur = gameState.isRainShower ? 2 : 8;
        ctx.globalAlpha = gameState.isRainShower ? 0.2 : 0.6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + i * GAME_CONSTANTS.RAINBOW_SEGMENT_WIDTH, 0, Math.PI);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Enhanced rain effect
      if (gameState.isRainShower) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 150; i++) {
          const x = Math.random() * GAME_CONSTANTS.CANVAS_WIDTH;
          const y = (Date.now() * 0.8 + i * 15) % (GAME_CONSTANTS.CANVAS_HEIGHT + 20);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 8, y + 15);
          ctx.stroke();
        }
      }

      drawRainbowProgressBar(ctx, gameState.nextColorIndex, gameState.perfectRainbowCount, gameState.showPerfectRainbowLost);
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
      drawWeatherEffects: (ctx: CanvasRenderingContext2D) => void,
      isDamaged = false,
    ) => {
      ctx.clearRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
      drawBackground(ctx, gameState, drawWeatherEffects);

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
        ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);

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
