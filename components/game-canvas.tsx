'use client';

import type React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import type { Cloud, Drop, GameState } from '@/types/game';
import { RAINBOW_COLORS } from '@/types/game';
import { GAME_CONSTANTS } from '@/constants/game';

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
  const drawCloud = useCallback((ctx: CanvasRenderingContext2D, cloud: Cloud, isDamaged = false) => {
    ctx.save();

    // Apply 3D transformations
    ctx.translate(cloud.x, cloud.y + cloud.bobOffset);
    ctx.scale(cloud.scale, cloud.scale);
    ctx.rotate(cloud.rotation);

    // Add freeze effect
    if (cloud.isFrozen) {
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    // Add speed boost glow effect
    else if (cloud.speedMultiplier > 1) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    // Add reverse effect
    else if (cloud.isReversed) {
      ctx.shadowColor = '#800080';
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

    // Enhanced cloud drawing with effects
    let cloudColor = '#FFFFFF';
    if (isDamaged) {
      cloudColor = '#FFB3B3';
    } else if (cloud.isFrozen) {
      cloudColor = '#B0E0E6'; // Light blue for frozen
    } else if (cloud.speedMultiplier > 1) {
      cloudColor = '#FFFACD';
    } else if (cloud.isReversed) {
      cloudColor = '#E6E6FA'; // Light purple for reversed
    }

    ctx.fillStyle = cloudColor;

    // Main cloud body with multiple overlapping circles for fluffy effect
    ctx.beginPath();

    // Bottom layer (larger circles)
    ctx.arc(-25, 5, 18, 0, Math.PI * 2);
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.arc(25, 5, 18, 0, Math.PI * 2);

    // Middle layer
    ctx.arc(-15, -10, 15, 0, Math.PI * 2);
    ctx.arc(15, -10, 15, 0, Math.PI * 2);

    // Top layer (smaller circles for detail)
    ctx.arc(-8, -20, 12, 0, Math.PI * 2);
    ctx.arc(8, -20, 12, 0, Math.PI * 2);
    ctx.arc(0, -15, 14, 0, Math.PI * 2);

    ctx.fill();

    // Add cloud highlights for 3D effect
    ctx.fillStyle = isDamaged
      ? 'rgba(255, 255, 255, 0.4)'
      : cloud.isFrozen
      ? 'rgba(255, 255, 255, 0.8)'
      : cloud.isReversed
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(-8, -8, 8, 0, Math.PI * 2);
    ctx.arc(12, -12, 6, 0, Math.PI * 2);
    ctx.fill();

    // Add freeze crystals effect
    if (cloud.isFrozen) {
      ctx.strokeStyle = '#87CEEB';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;

      // Draw ice crystals around the cloud
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x1 = Math.cos(angle) * 35;
        const y1 = Math.sin(angle) * 35;
        const x2 = Math.cos(angle) * 45;
        const y2 = Math.sin(angle) * 45;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Cross lines
        ctx.beginPath();
        ctx.moveTo(x1 - 3, y1 - 3);
        ctx.lineTo(x1 + 3, y1 + 3);
        ctx.moveTo(x1 + 3, y1 - 3);
        ctx.lineTo(x1 - 3, y1 + 3);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Add reverse arrows effect
    if (cloud.isReversed) {
      ctx.strokeStyle = '#800080';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.8;

      // Draw reverse arrows around the cloud
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const x = Math.cos(angle) * 40;
        const y = Math.sin(angle) * 40;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI);

        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.moveTo(4, -4);
        ctx.lineTo(8, 0);
        ctx.lineTo(4, 4);
        ctx.stroke();

        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    // Add cute cloud face
    if (!isDamaged) {
      // Eyes
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(-8, -5, 2, 0, Math.PI * 2);
      ctx.arc(8, -5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Mouth - different for different states
      ctx.strokeStyle = cloud.isFrozen ? '#0066CC' : cloud.isReversed ? '#800080' : '#333333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (cloud.isFrozen) {
        // Surprised/frozen expression
        ctx.arc(0, 2, 4, 0, Math.PI * 2);
        ctx.stroke();
      } else if (cloud.isReversed) {
        // Confused expression
        ctx.moveTo(-6, 2);
        ctx.lineTo(-2, 6);
        ctx.lineTo(2, 2);
        ctx.lineTo(6, 6);
        ctx.stroke();
      } else {
        // Normal smile
        ctx.arc(0, 2, 8, 0, Math.PI);
        ctx.stroke();
      }
    } else {
      // Hurt expression
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(-8, -5, 2, 0, Math.PI * 2);
      ctx.arc(8, -5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Frown
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 8, 8, Math.PI, 0);
      ctx.stroke();
    }

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.restore();
  }, []);

  const drawColorDrop = useCallback((ctx: CanvasRenderingContext2D, drop: Drop, isTargetColor = false) => {
    ctx.save();

    // Apply 3D transformations
    ctx.translate(drop.x, drop.y);
    if (drop.scale) {
      ctx.scale(drop.scale, drop.scale);
    }
    if (drop.rotation) {
      ctx.rotate(drop.rotation);
    }

    // REMOVED: Shadow effects for drops

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

    if (drop.type === 'water') {
      // Water drop with realistic water effect
      const waterPulse = 1 + Math.sin(Date.now() * 0.03) * 0.1;

      // Main water body with gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, GAME_CONSTANTS.SPECIAL_DROP_RADIUS);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.7, '#00BFFF');
      gradient.addColorStop(1, '#0080FF');

      ctx.fillStyle = gradient;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;

      // Draw water drop shape
      ctx.beginPath();
      ctx.arc(0, 2, GAME_CONSTANTS.SPECIAL_DROP_RADIUS * waterPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Add water highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(-3, -1, 3, 0, Math.PI * 2);
      ctx.fill();

      // Water symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeText('💧', 0, 4);
      ctx.fillText('💧', 0, 4);
    } else if (drop.type === 'lightning') {
      // Enhanced golden drop with sparkle animation
      const sparkleOffset = Math.sin(Date.now() * 0.02) * 2;
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(0, 0, GAME_CONSTANTS.SPECIAL_DROP_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Animated sparkles
      ctx.fillStyle = '#FFFF00';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.rotate(sparkleOffset * 0.1);
      ctx.fillText('⚡', 0, 4);
      ctx.restore();
    } else if (drop.type === 'bomb') {
      // Enhanced black drop with danger pulsing
      const dangerPulse = 1 + Math.sin(Date.now() * 0.02) * 0.3;
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2 * dangerPulse;

      ctx.beginPath();
      ctx.arc(0, 0, GAME_CONSTANTS.SPECIAL_DROP_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FF0000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💣', 0, 4);
    } else if (drop.type === 'rainbow') {
      // Enhanced rainbow drop with rotating colors
      const time = Date.now() * 0.01;
      const hue = (time + drop.x) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(0, 0, GAME_CONSTANTS.LARGE_DROP_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotating rainbow symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.rotate(time * 0.1);
      ctx.fillText('🌈', 0, 4);
      ctx.restore();
    } else if (drop.type === 'heart') {
      // Heart drop with pulsing effect
      const heartPulse = 1 + Math.sin(Date.now() * 0.02) * 0.2;
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = '#FF1493';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(0, 0, GAME_CONSTANTS.SPECIAL_DROP_RADIUS * heartPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('❤️', 0, 4);
    } else if (drop.type === 'hail') {
      // Enhanced hail drop with better visibility
      const hailPulse = 1 + Math.sin(Date.now() * 0.03) * 0.15;

      // Main hail body with cyan color for better contrast
      ctx.fillStyle = '#00BFFF';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;

      // Draw hexagonal ice crystal
      ctx.beginPath();
      const sides = 6;
      const size = GAME_CONSTANTS.SPECIAL_DROP_RADIUS * hailPulse;

      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides + Math.PI / 6;
        const x = size * Math.cos(angle);
        const y = size * Math.sin(angle);

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
      ctx.moveTo(-size * 0.5, 0);
      ctx.lineTo(size * 0.5, 0);
      ctx.moveTo(0, -size * 0.5);
      ctx.lineTo(0, size * 0.5);
      ctx.stroke();

      // Ice crystal symbol with better contrast
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeText('❄️', 0, 4);
      ctx.fillText('❄️', 0, 4);
    } else if (drop.type === 'rocket') {
      // Rocket drop with flame trail and rotation
      const time = Date.now() * 0.01;
      const rocketPulse = 1 + Math.sin(time * 2) * 0.1;

      // Rocket body
      ctx.fillStyle = '#FF4500';
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(0, 0, GAME_CONSTANTS.SPECIAL_DROP_RADIUS * rocketPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Flame trail effect
      ctx.fillStyle = `rgba(255, ${100 + Math.sin(time * 5) * 50}, 0, 0.7)`;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-i * 3, i * 5, (5 - i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rocket emoji with rotation
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      if (drop.angle !== undefined) {
        ctx.rotate(drop.angle * 0.1);
      }
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeText('🚀', 0, 4);
      ctx.fillText('🚀', 0, 4);
      ctx.restore();
    } else if (drop.type === 'reverse') {
      // Reverse drop with spinning arrows
      const reversePulse = 1 + Math.sin(Date.now() * 0.02) * 0.15;
      const time = Date.now() * 0.01;

      // Main reverse body
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(0, 0, GAME_CONSTANTS.SPECIAL_DROP_RADIUS * reversePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spinning arrows
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.save();
      ctx.rotate(time * 0.2);

      // Draw arrows pointing in opposite directions
      for (let i = 0; i < 2; i++) {
        ctx.save();
        ctx.rotate(i * Math.PI);

        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.moveTo(4, -4);
        ctx.lineTo(8, 0);
        ctx.lineTo(4, 4);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();

      // Reverse symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeText('⇄', 0, 4);
      ctx.fillText('⇄', 0, 4);
    } else if (drop.type === 'double') {
      // Double points drop with x2 animation
      const doublePulse = 1 + Math.sin(Date.now() * 0.02) * 0.2;
      const time = Date.now() * 0.01;

      // Main double body with bright yellow
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(0, 0, GAME_CONSTANTS.SPECIAL_DROP_RADIUS * doublePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sparkle effects
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 4; i++) {
        const angle = (time + (i * Math.PI) / 2) % (Math.PI * 2);
        const sparkleX = Math.cos(angle) * 15;
        const sparkleY = Math.sin(angle) * 15;

        ctx.save();
        ctx.translate(sparkleX, sparkleY);
        ctx.rotate(time * 0.5);
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✨', 0, 0);
        ctx.restore();
      }

      // x2 symbol
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeText('x2', 0, 4);
      ctx.fillText('x2', 0, 4);
    } else {
      // Enhanced normal drop
      ctx.fillStyle = drop.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, GAME_CONSTANTS.DROP_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Enhanced highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-2, -2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
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
  }, []);

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
    }
  }, []);

  const drawPowerUpMessages = useCallback((ctx: CanvasRenderingContext2D, gameState: GameState) => {
    let messageY = 200;

    // Draw speed boost message
    if (gameState.showSpeedBoostMessage) {
      ctx.save();
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';

      // Add animation
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.translate(400, messageY);
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
      const x = 400;

      for (let i = 0; i < text.length; i++) {
        const hue = (Date.now() * 0.1 + i * 20) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.font = 'bold 24px Arial';
        ctx.fillText(text[i], x - text.length * 7 + i * 14, messageY);
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
      ctx.translate(400, messageY);
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
      ctx.translate(400, messageY);
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
      ctx.translate(400, messageY);
      ctx.scale(scale, scale);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText('✨ DOUBLE POINTS! ✨', 0, 0);
      ctx.fillText('✨ DOUBLE POINTS! ✨', 0, 0);
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

      // Draw stars for nighttime
      if (gameState.timeOfDay === 'night' && !gameState.isRainShower && drawStars) {
        drawStars(ctx);
      }

      // Draw weather effects
      if (drawWeatherEffects) {
        drawWeatherEffects(ctx, gameState.timeOfDay);
      }

      // Enhanced rainbow arc with glow
      const centerX = GAME_CONSTANTS.RAINBOW_CENTER_X;
      const centerY = GAME_CONSTANTS.RAINBOW_CENTER_Y;
      const radius = GAME_CONSTANTS.RAINBOW_BASE_RADIUS;

      for (let i = 0; i < RAINBOW_COLORS.length; i++) {
        ctx.strokeStyle = RAINBOW_COLORS[i].color;
        ctx.lineWidth = GAME_CONSTANTS.RAINBOW_SEGMENT_WIDTH;
        ctx.globalAlpha = gameState.isRainShower ? 0.2 : gameState.timeOfDay === 'night' ? 0.8 : 0.6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + i * GAME_CONSTANTS.RAINBOW_SEGMENT_WIDTH, 0, Math.PI);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

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
      drops: Drop[],
      updateAndDrawParticles: (ctx: CanvasRenderingContext2D) => void,
      updateAndDrawDamageTexts: (ctx: CanvasRenderingContext2D) => void,
      drawWeatherEffects: (ctx: CanvasRenderingContext2D, timeOfDay?: 'day' | 'night') => void,
      drawStars: (ctx: CanvasRenderingContext2D) => void,
      isLightningFlash: boolean,
      isDamaged = false,
    ) => {
      ctx.clearRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
      drawBackground(ctx, gameState, drawWeatherEffects, drawStars, isLightningFlash);

      // Draw drops with target color highlighting
      drops.forEach((drop) => {
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

      // Enhanced double points effect
      if (gameState.doublePointsEndTime > Date.now()) {
        const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 400);
        gradient.addColorStop(0, 'rgba(255, 255, 102, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 102, 0.05)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);

        ctx.fillStyle = '#FFFF66';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeText('✨ DOUBLE POINTS ACTIVE! ✨', 400, 350);
        ctx.fillText('✨ DOUBLE POINTS ACTIVE! ✨', 400, 350);
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
