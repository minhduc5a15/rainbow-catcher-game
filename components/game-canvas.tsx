'use client';

import type React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import type { Cloud, Drop, GameState } from '@/types/game';
import { RAINBOW_COLORS } from '@/types/game';
import { GAME_CONSTANTS } from '@/constants/game';
import {
  drawWaterDrop,
  drawLightningDrop,
  drawBombDrop,
  drawRainbowDrop,
  drawHeartDrop,
  drawHailDrop,
  drawRocketDrop,
  drawReverseDrop,
  drawDoublePointsDrop,
  drawShieldDrop,
  drawMeteoriteDrop,
  drawNormalDrop,
  drawCloud,
  drawRainbow,
  drawMoonbow,
} from './draw-utils';

interface GameCanvasProps {
  dropPosition: { x: number; y: number } | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ dropPosition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (dropPosition) {
      drawDrop(ctx, dropPosition.x, dropPosition.y);
    }
  }, [dropPosition]);

  const drawDrop = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
  };

  return <canvas ref={canvasRef} width={300} height={200} style={{ border: '1px solid black' }} />;
};

export default GameCanvas;

export function useGameCanvas() {
  const drawDrop = useCallback((ctx: CanvasRenderingContext2D, drop: Drop, isTargetColor = false) => {
    ctx.save();

    // Apply 3D transformations
    ctx.translate(drop.x, drop.y);
    if (drop.scale) {
      ctx.scale(drop.scale, drop.scale);
    }
    if (drop.rotation) {
      ctx.rotate(drop.rotation);
    }

    // Add pulsing effect for target color
    if (isTargetColor && drop.type === 'normal') {
      const pulseSize = 2 + Math.sin(Date.now() * 0.01);

      // Outer glow ring
      ctx.strokeStyle = drop.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(0, 0, GAME_CONSTANTS.LARGE_DROP_RADIUS + pulseSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw the appropriate drop type
    switch (drop.type) {
      case 'water':
        drawWaterDrop(ctx);
        break;
      case 'lightning':
        drawLightningDrop(ctx);
        break;
      case 'bomb':
        drawBombDrop(ctx);
        break;
      case 'rainbow':
        drawRainbowDrop(ctx, drop);
        break;
      case 'heart':
        drawHeartDrop(ctx);
        break;
      case 'hail':
        drawHailDrop(ctx);
        break;
      case 'rocket':
        drawRocketDrop(ctx, drop);
        break;
      case 'reverse':
        drawReverseDrop(ctx);
        break;
      case 'double':
        drawDoublePointsDrop(ctx);
        break;
      case 'shield':
        drawShieldDrop(ctx);
        break;
      case 'meteorite':
        drawMeteoriteDrop(ctx, drop);
        break;
      default:
        drawNormalDrop(ctx, drop.color);
    }

    ctx.restore();
  }, []);

  const drawRainbowProgressBar = useCallback(
    (ctx: CanvasRenderingContext2D, nextColorIndex: number, perfectCount: number, showLostMessage = false, focusMode = false) => {
      // Use different dimensions based on focus mode
      const barWidth = focusMode ? GAME_CONSTANTS.FOCUS_PROGRESS_BAR_WIDTH : GAME_CONSTANTS.PROGRESS_BAR_WIDTH;
      const barHeight = GAME_CONSTANTS.PROGRESS_BAR_HEIGHT;
      const barX = focusMode ? GAME_CONSTANTS.FOCUS_PROGRESS_BAR_X : GAME_CONSTANTS.PROGRESS_BAR_X;
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
          ctx.fillRect(segmentX + 1, barY + 1, segmentWidth - 2, barHeight - 2);

          // Animated border
          ctx.strokeStyle = RAINBOW_COLORS[i].color;
          ctx.lineWidth = 2;
          ctx.strokeRect(segmentX + 1, barY + 1, segmentWidth - 2, barHeight - 2);
        } else {
          // Incomplete segments
          ctx.fillStyle = '#555555';
          ctx.fillRect(segmentX + 1, barY + 1, segmentWidth - 2, barHeight - 2);
        }
      }

      // Enhanced border with gradient
      const borderGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
      borderGradient.addColorStop(0, '#666666');
      borderGradient.addColorStop(1, '#333333');
      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 2;
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

      if (showLostMessage) {
        ctx.fillStyle = '#FF6666';
        ctx.fillText('Perfect Rainbow Lost! Starting Over...', barX + barWidth / 2, labelY + 14);
      } else {
        ctx.fillText(`Rainbow Progress (Perfect: ${perfectCount})`, barX + barWidth / 2, labelY + 14);
      }
    },
    [],
  );

  const drawPowerUpTimers = useCallback((ctx: CanvasRenderingContext2D, gameState: GameState) => {
    const now = Date.now();
    let timerY = 60;

    // Draw speed boost timer if active
    if (gameState.cloudSpeedBoostEndTime > now) {
      const timeLeft = (gameState.cloudSpeedBoostEndTime - now) / GAME_CONSTANTS.SPEED_BOOST_DURATION;
      const barWidth = 150;
      const barHeight = 10;
      const barX = 20;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, timerY, barWidth, barHeight);

      // Progress
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(barX, timerY, barWidth * timeLeft, barHeight);

      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, timerY, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Speed Boost', barX, timerY - 5);

      timerY += 30;
    }

    // Draw auto collect timer if active
    if (gameState.isAutoCollecting) {
      const timeLeft = (gameState.autoCollectEndTime - now) / GAME_CONSTANTS.AUTO_COLLECT_DURATION;
      const barWidth = 150;
      const barHeight = 10;
      const barX = 20;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, timerY, barWidth, barHeight);

      // Progress with rainbow gradient
      const gradient = ctx.createLinearGradient(barX, timerY, barX + barWidth * timeLeft, timerY);
      gradient.addColorStop(0, 'red');
      gradient.addColorStop(0.17, 'orange');
      gradient.addColorStop(0.33, 'yellow');
      gradient.addColorStop(0.5, 'green');
      gradient.addColorStop(0.67, 'blue');
      gradient.addColorStop(0.83, 'indigo');
      gradient.addColorStop(1, 'violet');
      ctx.fillStyle = gradient;
      ctx.fillRect(barX, timerY, barWidth * timeLeft, barHeight);

      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, timerY, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Auto Collect', barX, timerY - 5);

      timerY += 30;
    }

    // Draw freeze timer if active
    if (gameState.cloudFreezeEndTime > now) {
      const timeLeft = (gameState.cloudFreezeEndTime - now) / GAME_CONSTANTS.FREEZE_DURATION;
      const barWidth = 150;
      const barHeight = 10;
      const barX = 20;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, timerY, barWidth, barHeight);

      // Progress with ice blue color
      ctx.fillStyle = '#00BFFF';
      ctx.fillRect(barX, timerY, barWidth * timeLeft, barHeight);

      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, timerY, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Frozen', barX, timerY - 5);

      timerY += 30;
    }

    // Draw reverse timer if active
    if (gameState.cloudReverseEndTime > now) {
      const timeLeft = (gameState.cloudReverseEndTime - now) / GAME_CONSTANTS.REVERSE_DURATION;
      const barWidth = 150;
      const barHeight = 10;
      const barX = 20;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, timerY, barWidth, barHeight);

      // Progress with purple color
      ctx.fillStyle = '#800080';
      ctx.fillRect(barX, timerY, barWidth * timeLeft, barHeight);

      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, timerY, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Reversed', barX, timerY - 5);

      timerY += 30;
    }

    // Draw double points timer if active
    if (gameState.doublePointsEndTime > now) {
      const timeLeft = (gameState.doublePointsEndTime - now) / GAME_CONSTANTS.DOUBLE_POINTS_DURATION;
      const barWidth = 150;
      const barHeight = 10;
      const barX = 20;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, timerY, barWidth, barHeight);

      // Progress with bright yellow color
      ctx.fillStyle = '#FFFF66';
      ctx.fillRect(barX, timerY, barWidth * timeLeft, barHeight);

      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, timerY, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Double Points', barX, timerY - 5);

      timerY += 30;
    }

    // Draw shield timer if active
    if (gameState.cloudShieldEndTime > now) {
      const timeLeft = (gameState.cloudShieldEndTime - now) / GAME_CONSTANTS.SHIELD_DURATION;
      const barWidth = 150;
      const barHeight = 10;
      const barX = 20;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, timerY, barWidth, barHeight);

      // Progress with green color
      ctx.fillStyle = '#32CD32';
      ctx.fillRect(barX, timerY, barWidth * timeLeft, barHeight);

      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, timerY, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Shield Active', barX, timerY - 5);

      timerY += 30;
    }

    // Draw invincibility timer if active
    if (gameState.cloudInvincibilityEndTime > now) {
      const timeLeft = (gameState.cloudInvincibilityEndTime - now) / GAME_CONSTANTS.INVINCIBILITY_DURATION;
      const barWidth = 150;
      const barHeight = 10;
      const barX = 20;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, timerY, barWidth, barHeight);

      // Progress with flashing color
      const flashAlpha = 0.5 + 0.5 * Math.abs(Math.sin(Date.now() * 0.01));
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(barX, timerY, barWidth * timeLeft, barHeight);

      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, timerY, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Invincible', barX, timerY - 5);
    }
  }, []);

  const drawPowerUpMessages = useCallback((ctx: CanvasRenderingContext2D, gameState: GameState, focusMode = false) => {
    // Adjust message position based on focus mode
    let messageY = focusMode ? 300 : 200;
    const centerX = focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_WIDTH / 2 : GAME_CONSTANTS.CANVAS_WIDTH / 2;

    // Draw speed boost message
    if (gameState.showSpeedBoostMessage) {
      ctx.save();
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';

      // Add animation
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.translate(centerX, messageY);
      ctx.scale(scale, scale);
      ctx.fillText('⚡ SPEED UP! ⚡', 0, 0);
      ctx.restore();

      messageY += 40;
    }

    // Draw auto collect message
    if (gameState.showAutoCollectMessage) {
      ctx.save();
      ctx.textAlign = 'center';

      // Rainbow text effect
      const text = '🌈 AUTO COLLECT! 🌈';

      for (let i = 0; i < text.length; i++) {
        const hue = (Date.now() * 0.1 + i * 20) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.font = 'bold 24px Arial';
        ctx.fillText(text[i], centerX - text.length * 7 + i * 14, messageY);
      }

      ctx.restore();
      messageY += 40;
    }

    // Draw freeze message
    if (gameState.showFreezeMessage) {
      ctx.save();
      ctx.fillStyle = '#00BFFF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';

      // Add animation
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.translate(centerX, messageY);
      ctx.scale(scale, scale);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeText('❄️ FROZEN! ❄️', 0, 0);
      ctx.fillText('❄️ FROZEN! ❄️', 0, 0);
      ctx.restore();

      messageY += 40;
    }

    // Draw reverse message
    if (gameState.showReverseMessage) {
      ctx.save();
      ctx.fillStyle = '#800080';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';

      // Add animation
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.translate(centerX, messageY);
      ctx.scale(scale, scale);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeText('⇄ REVERSED! ⇄', 0, 0);
      ctx.fillText('⇄ REVERSED! ⇄', 0, 0);
      ctx.restore();

      messageY += 40;
    }

    // Draw double points message
    if (gameState.showDoublePointsMessage) {
      ctx.save();
      ctx.fillStyle = '#FFFF66';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';

      // Add animation
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.translate(centerX, messageY);
      ctx.scale(scale, scale);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText('✨ DOUBLE POINTS! ✨', 0, 0);
      ctx.fillText('✨ DOUBLE POINTS! ✨', 0, 0);
      ctx.restore();

      messageY += 40;
    }

    // Draw shield message
    if (gameState.showShieldMessage) {
      ctx.save();
      ctx.fillStyle = '#32CD32';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';

      // Add animation
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.translate(centerX, messageY);
      ctx.scale(scale, scale);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeText('🛡️ SHIELD ACTIVE! 🛡️', 0, 0);
      ctx.fillText('🛡️ SHIELD ACTIVE! 🛡️', 0, 0);
      ctx.restore();
    }
  }, []);

  const drawBackground = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      gameState: GameState,
      drawWeatherEffects?: (ctx: CanvasRenderingContext2D, timeOfDay?: 'day' | 'night') => void,
      drawStars?: (ctx: CanvasRenderingContext2D) => void,
      isLightningFlash?: boolean,
      focusMode = false,
      meteoriteActive = false, // New parameter
    ) => {
      // Get canvas dimensions based on focus mode
      const canvasWidth = focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_WIDTH : GAME_CONSTANTS.CANVAS_WIDTH;
      const canvasHeight = focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_HEIGHT : GAME_CONSTANTS.CANVAS_HEIGHT;

      // Enhanced sky gradient with day/night cycle and meteorite effect
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);

      if (meteoriteActive) {
        // Dark apocalyptic sky when meteorite is active
        gradient.addColorStop(0, '#1a0000');
        gradient.addColorStop(0.3, '#330000');
        gradient.addColorStop(0.7, '#4d0000');
        gradient.addColorStop(1, '#660000');
      } else if (isLightningFlash) {
        // Lightning flash effect
        gradient.addColorStop(0, '#F0F0C0');
        gradient.addColorStop(0.5, '#E0E0A0');
        gradient.addColorStop(1, '#D0D090');
      } else if (gameState.isRainShower) {
        if (gameState.timeOfDay === 'night') {
          gradient.addColorStop(0, '#1a1a2e');
          gradient.addColorStop(0.5, '#16213e');
          gradient.addColorStop(1, '#0f3460');
        } else {
          gradient.addColorStop(0, '#2D3748');
          gradient.addColorStop(0.5, '#4A5568');
          gradient.addColorStop(1, '#718096');
        }
      } else {
        if (gameState.timeOfDay === 'night') {
          // Night sky gradient
          gradient.addColorStop(0, '#0c0c1e');
          gradient.addColorStop(0.3, '#1a1a3a');
          gradient.addColorStop(0.7, '#2d2d5a');
          gradient.addColorStop(1, '#404070');
        } else {
          // Day sky gradient
          gradient.addColorStop(0, '#87CEEB');
          gradient.addColorStop(0.3, '#98D8E8');
          gradient.addColorStop(0.7, '#B8E6F0');
          gradient.addColorStop(1, '#E0F6FF');
        }
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw stars for nighttime (but not during meteorite)
      if (gameState.timeOfDay === 'night' && !gameState.isRainShower && !meteoriteActive && drawStars) {
        drawStars(ctx);
      }

      // Draw weather effects
      if (drawWeatherEffects) {
        drawWeatherEffects(ctx, gameState.timeOfDay);
      }

      // Draw rainbow or moonbow based on timeOfDay (but not during meteorite)
      if (!meteoriteActive) {
        if (gameState.timeOfDay === 'day') {
          drawRainbow(ctx, gameState, focusMode);
        } else {
          drawMoonbow(ctx, gameState, focusMode);
        }
      }

      // Enhanced rain effect - adjust for canvas size
      if (gameState.isRainShower) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        const rainDropCount = focusMode ? 200 : 150;
        for (let i = 0; i < rainDropCount; i++) {
          const x = Math.random() * canvasWidth;
          const y = (Date.now() * 0.8 + i * 15) % (canvasHeight + 20);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 8, y + 15);
          ctx.stroke();
        }
      }

      drawRainbowProgressBar(ctx, gameState.nextColorIndex, gameState.perfectRainbowCount, gameState.showPerfectRainbowLost, focusMode);
    },
    [drawRainbowProgressBar, drawRainbow, drawMoonbow],
  );

  const renderGame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      gameState: GameState,
      cloud: Cloud,
      drops: Drop[],
      updateAndDrawParticles: (ctx: CanvasRenderingContext2D) => void,
      updateAndDrawDamageTexts: (ctx: CanvasRenderingContext2D) => void,
      drawWeatherEffects: (ctx: CanvasRenderingContext2D, timeOfDay?: 'day' | 'night') => void,
      drawStars: (ctx: CanvasRenderingContext2D) => void,
      isLightningFlash: boolean,
      isDamaged = false,
      focusMode = false,
      meteoriteActive = false, // New parameter
    ) => {
      const canvasWidth = focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_WIDTH : GAME_CONSTANTS.CANVAS_WIDTH;
      const canvasHeight = focusMode ? GAME_CONSTANTS.FOCUS_CANVAS_HEIGHT : GAME_CONSTANTS.CANVAS_HEIGHT;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawBackground(ctx, gameState, drawWeatherEffects, drawStars, isLightningFlash, focusMode, meteoriteActive);

      // Draw drops with target color highlighting
      drops.forEach((drop) => {
        const isTargetColor = drop.type === 'normal' && drop.colorIndex === gameState.nextColorIndex;
        drawDrop(ctx, drop, isTargetColor);
      });

      drawCloud(ctx, cloud, isDamaged);
      updateAndDrawParticles(ctx);
      updateAndDrawDamageTexts(ctx);

      // Draw power-up timers
      drawPowerUpTimers(ctx, gameState);

      // Draw power-up messages
      drawPowerUpMessages(ctx, gameState, focusMode);

      // Enhanced auto-collect effect
      if (gameState.isAutoCollecting) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvasWidth, canvasHeight) / 2);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText('✨ AUTO COLLECT ACTIVE! ✨', centerX, centerY);
        ctx.fillText('✨ AUTO COLLECT ACTIVE! ✨', centerX, centerY);
      }

      // Enhanced double points effect
      if (gameState.doublePointsEndTime > Date.now()) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvasWidth, canvasHeight) / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 102, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 102, 0.05)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#FFFF66';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeText('✨ DOUBLE POINTS ACTIVE! ✨', centerX, centerY + 50);
        ctx.fillText('✨ DOUBLE POINTS ACTIVE! ✨', centerX, centerY + 50);
      }

      // Draw pointer lock instructions if game is playing
      if (gameState.state === 'playing' && !gameState.isPointerLocked) {
        const centerX = canvasWidth / 2;
        const instructionY = canvasHeight / 2 - 20;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(centerX - 200, instructionY - 20, 400, 40);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - 200, instructionY - 20, 400, 40);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click to lock cursor (ESC to unlock)', centerX, instructionY + 5);
      }
    },
    [drawBackground, drawDrop, drawPowerUpTimers, drawPowerUpMessages],
  );

  return { renderGame };
}
