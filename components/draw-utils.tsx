import { GAME_CONSTANTS } from '@/constants/game';
import type { Drop } from '@/types/game';

// Draw water drop
export function drawWaterDrop(ctx: CanvasRenderingContext2D) {
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
}

// Draw lightning drop
export function drawLightningDrop(ctx: CanvasRenderingContext2D) {
  // Enhanced golden drop with sparkle animation
  const sparkleOffset = Math.sin(Date.now() * 0.02) * 2;
  ctx.fillStyle = '#FFD700';
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
}

// Draw bomb drop
export function drawBombDrop(ctx: CanvasRenderingContext2D) {
  // Enhanced black drop with danger pulsing
  const dangerPulse = 1 + Math.sin(Date.now() * 0.02) * 0.3;
  ctx.fillStyle = '#000000';
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
}

// Draw rainbow drop
export function drawRainbowDrop(ctx: CanvasRenderingContext2D, drop: Drop) {
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
}

// Draw heart drop
export function drawHeartDrop(ctx: CanvasRenderingContext2D) {
  // Heart drop with pulsing effect
  const heartPulse = 1 + Math.sin(Date.now() * 0.02) * 0.2;
  ctx.fillStyle = '#FF69B4';
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
}

// Draw hail drop
export function drawHailDrop(ctx: CanvasRenderingContext2D) {
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
}

// Draw rocket drop
export function drawRocketDrop(ctx: CanvasRenderingContext2D, drop: Drop) {
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
}

// Draw reverse drop
export function drawReverseDrop(ctx: CanvasRenderingContext2D) {
  // Reverse drop with spinning arrows
  const reversePulse = 1 + Math.sin(Date.now() * 0.02) * 0.15;
  const time = Date.now() * 0.01;

  // Main reverse body
  ctx.fillStyle = '#800080';
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
}

// Draw double points drop
export function drawDoublePointsDrop(ctx: CanvasRenderingContext2D) {
  // Double points drop with x2 animation
  const doublePulse = 1 + Math.sin(Date.now() * 0.02) * 0.2;
  const time = Date.now() * 0.01;

  // Main double body with bright yellow
  ctx.fillStyle = '#FFFF66';
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
}

// Draw normal drop
export function drawNormalDrop(ctx: CanvasRenderingContext2D, color: string) {
  // Enhanced normal drop
  ctx.fillStyle = color;
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

// Draw cloud
export function drawCloud(
  ctx: CanvasRenderingContext2D,
  cloud: {
    x: number;
    y: number;
    bobOffset: number;
    scale: number;
    rotation: number;
    isFrozen: boolean;
    speedMultiplier: number;
    isReversed: boolean;
  },
  isDamaged = false,
) {
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
}
