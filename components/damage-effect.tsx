'use client';

import { useCallback, useRef } from 'react';

interface DamageText {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  damage: number;
}

export function useDamageEffect() {
  const damageTextsRef = useRef<DamageText[]>([]);

  const createDamageText = useCallback((x: number, y: number, damage = 1) => {
    const damageText: DamageText = {
      x,
      y,
      life: 60,
      maxLife: 60,
      damage, // Store damage amount
    };
    damageTextsRef.current.push(damageText);
  }, []);

  const updateAndDrawDamageTexts = useCallback((ctx: CanvasRenderingContext2D) => {
    const texts = damageTextsRef.current;
    for (let i = texts.length - 1; i >= 0; i--) {
      const text = texts[i];

      // Update
      text.y -= 2;
      text.life--;

      // Remove dead texts
      if (text.life <= 0) {
        texts.splice(i, 1);
        continue;
      }

      // Draw with appropriate damage number
      ctx.globalAlpha = text.life / text.maxLife;
      ctx.fillStyle = text.damage > 1 ? '#FF0000' : '#FF6666'; // Darker red for higher damage
      ctx.font = text.damage > 1 ? 'bold 32px Arial' : 'bold 24px Arial'; // Larger for higher damage
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = text.damage > 1 ? 3 : 2;
      ctx.strokeText(`-${text.damage}`, text.x, text.y);
      ctx.fillText(`-${text.damage}`, text.x, text.y);
    }
    ctx.globalAlpha = 1;
  }, []);

  const clearDamageTexts = useCallback(() => {
    damageTextsRef.current = [];
  }, []);

  return {
    createDamageText,
    updateAndDrawDamageTexts,
    clearDamageTexts,
  };
}
