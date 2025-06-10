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

    // Enhanced cloud drawing with more realistic shape - NO STROKE
    ctx.fillStyle = isDamaged ? '#FFB3B3' : cloud.speedMultiplier > 1 ? '#FFFACD' : '#FFFFFF';

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
    } else if (drop.type === 'hail') {
      // Enhanced hail drop with better visibility
      const hailPulse = 1 + Math.sin(Date.now() * 0.03) * 0.15;

      // Outer glow for better visibility
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 15;

      // Main hail body with cyan color for better contrast
      ctx.fillStyle = '#00BFFF'; // Deep sky blue instead of light blue
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;

      // Draw hexagonal ice crystal
      ctx.beginPath();
      const sides = 6;
      const size = GAME_CONSTANTS.SPECIAL_DROP_RADIUS * hailPulse;

      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides + Math.PI / 6;
        const x = drop.x + size * Math.cos(angle);
        const y = drop.y + size * Math.sin(angle);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Add inner crystal pattern
      ctx.strokeStyle = '#87CEEB';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(drop.x - size * 0.5, drop.y);
      ctx.lineTo(drop.x + size * 0.5, drop.y);
      ctx.moveTo(drop.x, drop.y - size * 0.5);
      ctx.lineTo(drop.x, drop.y + size * 0.5);
      ctx.stroke();

      // Ice crystal symbol with better contrast
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeText('❄️', drop.x, drop.y + 4);
      ctx.fillText('❄️', drop.x, drop.y + 4);
    } else if (drop.type === 'rocket') {
      // Rocket drop with flame trail and rotation
      const time = Date.now() * 0.01;
      const rocketPulse = 1 + Math.sin(time * 2) * 0.1;

      // Rocket body
      ctx.fillStyle = '#FF4500';
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#FF6600';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(drop.x, drop.y, GAME_CONSTANTS.SPECIAL_DROP_RADIUS * rocketPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Flame trail effect
      ctx.fillStyle = `rgba(255, ${100 + Math.sin(time * 5) * 50}, 0, 0.7)`;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(drop.x - i * 3, drop.y + i * 5, (5 - i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rocket emoji with rotation
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(drop.x, drop.y + 4);
      if (drop.angle !== undefined) {
        ctx.rotate(drop.angle * 0.1);
      }
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeText('🚀', 0, 0);
      ctx.fillText('🚀', 0, 0);
      ctx.restore();
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

  const drawPowerUpTimers = useCallback((ctx: CanvasRenderingContext2D, gameState: GameState) => {
    const now = Date.now();

    // Draw speed boost timer if active
    if (gameState.cloudSpeedBoostEndTime > now) {
      const timeLeft = (gameState.cloudSpeedBoostEndTime - now) / GAME_CONSTANTS.SPEED_BOOST_DURATION;
      const barWidth = 150;
      const barHeight = 10;
      const barX = 20;
      const barY = 60;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Progress
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(barX, barY, barWidth * timeLeft, barHeight);

      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Speed Boost', barX, barY - 5);
    }

    // Draw auto collect timer if active
    if (gameState.isAutoCollecting) {
      const timeLeft = (gameState.autoCollectEndTime - now) / GAME_CONSTANTS.AUTO_COLLECT_DURATION;
      const barWidth = 150;
      const barHeight = 10;
      const barX = 20;
      const barY = 90;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Progress with rainbow gradient
      const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth * timeLeft, barY);
      gradient.addColorStop(0, 'red');
      gradient.addColorStop(0.17, 'orange');
      gradient.addColorStop(0.33, 'yellow');
      gradient.addColorStop(0.5, 'green');
      gradient.addColorStop(0.67, 'blue');
      gradient.addColorStop(0.83, 'indigo');
      gradient.addColorStop(1, 'violet');
      ctx.fillStyle = gradient;
      ctx.fillRect(barX, barY, barWidth * timeLeft, barHeight);

      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Auto Collect', barX, barY - 5);
    }

    // Draw hail slow timer if active
    if (gameState.cloudSlowEndTime > now) {
      const timeLeft = (gameState.cloudSlowEndTime - now) / GAME_CONSTANTS.HAIL_SLOW_DURATION;
      const barWidth = 150;
      const barHeight = 10;
      const barX = 20;
      const barY = 120;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Progress with ice blue color
      ctx.fillStyle = '#00BFFF';
      ctx.fillRect(barX, barY, barWidth * timeLeft, barHeight);

      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Slowed Down', barX, barY - 5);
    }
  }, []);

  const drawPowerUpMessages = useCallback((ctx: CanvasRenderingContext2D, gameState: GameState) => {
    // Draw speed boost message
    if (gameState.showSpeedBoostMessage) {
      ctx.save();
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 5;

      // Add animation
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.translate(400, 200);
      ctx.scale(scale, scale);
      ctx.fillText('⚡ SPEED UP! ⚡', 0, 0);
      ctx.restore();
    }

    // Draw auto collect message
    if (gameState.showAutoCollectMessage) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 5;

      // Rainbow text effect
      const text = '🌈 AUTO COLLECT! 🌈';
      const x = 400;
      const y = 240;

      for (let i = 0; i < text.length; i++) {
        const hue = (Date.now() * 0.1 + i * 20) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.font = 'bold 24px Arial';
        ctx.fillText(text[i], x - text.length * 7 + i * 14, y);
      }

      ctx.restore();
    }

    // Draw slow message
    if (gameState.showSlowMessage) {
      ctx.save();
      ctx.fillStyle = '#00BFFF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 5;

      // Add animation
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.translate(400, 280);
      ctx.scale(scale, scale);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeText('❄️ SLOWED DOWN! ❄️', 0, 0);
      ctx.fillText('❄️ SLOWED DOWN! ❄️', 0, 0);
      ctx.restore();
    }
  }, []);

  const drawBackground = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      gameState: GameState,
      drawWeatherEffects?: (ctx: CanvasRenderingContext2D) => void,
      drawStars?: (ctx: CanvasRenderingContext2D) => void,
      isLightningFlash?: boolean,
    ) => {
      // Enhanced sky gradient with day/night cycle
      const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONSTANTS.CANVAS_HEIGHT);

      if (isLightningFlash) {
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
      ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);

      // Draw stars for night time
      if (gameState.timeOfDay === 'night' && !gameState.isRainShower && drawStars) {
        drawStars(ctx);
      }

      // Draw weather effects
      if (drawWeatherEffects) {
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
        ctx.shadowBlur = gameState.isRainShower ? 2 : gameState.timeOfDay === 'night' ? 12 : 8;
        ctx.globalAlpha = gameState.isRainShower ? 0.2 : gameState.timeOfDay === 'night' ? 0.8 : 0.6;
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
      drawStars: (ctx: CanvasRenderingContext2D) => void,
      isLightningFlash: boolean,
      isDamaged = false,
    ) => {
      ctx.clearRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
      drawBackground(ctx, gameState, drawWeatherEffects, drawStars, isLightningFlash);

      // Draw drops with target color highlighting
      colorDrops.forEach((drop) => {
        const isTargetColor = drop.type === 'normal' && drop.colorIndex === gameState.nextColorIndex;
        drawColorDrop(ctx, drop, isTargetColor);
      });

      drawCloud(ctx, cloud, isDamaged);
      updateAndDrawParticles(ctx);
      updateAndDrawDamageTexts(ctx);

      // Draw power-up timers
      drawPowerUpTimers(ctx, gameState);

      // Draw power-up messages
      drawPowerUpMessages(ctx, gameState);

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

      // Draw pointer lock instructions if game is playing
      if (gameState.state === 'playing' && !gameState.isPointerLocked) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(200, 280, 400, 40);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(200, 280, 400, 40);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click to lock cursor (ESC to unlock)', 400, 305);
      }
    },
    [drawBackground, drawCloud, drawColorDrop, drawPowerUpTimers, drawPowerUpMessages],
  );

  return { renderGame };
}
