'use client';

import { Button } from '@/components/ui/button';

interface PauseMenuProps {
  onContinue: () => void;
  onRestart: () => void;
}

export function PauseMenu({ onContinue, onRestart }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
      <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-6 text-purple-800">Game Paused</h2>

        <div className="space-y-4">
          <Button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 text-lg"
          >
            Continue Game
          </Button>

          <Button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg"
          >
            Restart Game
          </Button>
        </div>

        <p className="mt-6 text-gray-600 text-sm">Press Space to resume the game</p>
      </div>
    </div>
  );
}
