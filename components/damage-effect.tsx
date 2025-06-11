'use client';

import { useCallback, useRef } from 'react';

interface DamageText {
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

export function useDamageEffect() {
  const damageTextsRef = useRef<DamageText[]>([]);

  const createDamageText = useCallback((x: number, y: number) => {
    const damageText: DamageText = {
      x,
      y,
      life: 60,
      maxLife: 60,
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

      // Draw
      ctx.globalAlpha = text.life / text.maxLife;
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeText('-1', text.x, text.y);
      ctx.fillText('-1', text.x, text.y);
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
