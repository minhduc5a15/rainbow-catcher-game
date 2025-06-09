'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { GameState } from '../types/game';
import { RAINBOW_COLORS } from '../types/game';

interface GameUIProps {
  gameState: GameState;
  highScore: number;
  onStartGame: () => void;
  onResetGame: () => void;
  showGameOverDialog: boolean;
  onCloseGameOverDialog: () => void;
}

export function GameUI({ gameState, highScore, onStartGame, onResetGame, showGameOverDialog, onCloseGameOverDialog }: GameUIProps) {
  return (
    <>
      <div className="mt-4 text-center">
        {gameState.state === 'menu' && (
          <div>
            <Button onClick={onStartGame} size="lg" className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              🎮 Start Game
            </Button>
            <div className="text-sm text-gray-600 space-y-1">
              <p>🖱️ Use mouse to move the cloud</p>
              <p>🌈 Catch colors in rainbow order for bonus points!</p>
              <p>⚡ Golden drops boost cloud speed</p>
              <p>💣 Avoid black drops (lose life)</p>
              <p>🌈 Rainbow drops auto-collect all colors</p>
              <p>❤️ Heart drops give extra lives</p>
              <p>💀 Game over when you lose all 3 lives</p>
            </div>
          </div>
        )}

        {gameState.state === 'playing' && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>Use mouse to move the cloud</p>
            {gameState.isRainShower && <p className="text-blue-600 font-bold animate-pulse">🌧️ RAIN SHOWER - DOUBLE POINTS!</p>}
          </div>
        )}

        {gameState.state === 'gameOver' && !showGameOverDialog && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Game Over!</h2>
            <div className="space-x-2">
              <Button onClick={onStartGame} size="lg" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                🔄 Play Again
              </Button>
              <Button onClick={onResetGame} variant="outline" size="lg">
                🏠 Main Menu
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Game Over Dialog */}
      <Dialog open={showGameOverDialog} onOpenChange={onCloseGameOverDialog}>
        <DialogContent className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-purple-800">🎮 Game Over! 🎮</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 p-4">
            <div className="bg-white/70 rounded-lg p-4 space-y-2">
              <p className="text-xl font-bold">
                Final Score: <span className="text-blue-600">{gameState.score}</span>
              </p>
              <p className="text-lg">
                Perfect Rainbows: <span className="text-purple-600">{gameState.perfectRainbowCount}</span> 🌈
              </p>
              <p className="text-lg">
                Current High Score: <span className="text-orange-600">{highScore}</span> 🏆
              </p>
              {gameState.score > highScore && <p className="text-green-600 font-bold text-xl animate-bounce">🎉 NEW RECORD! 🎉</p>}
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  onCloseGameOverDialog();
                  onStartGame();
                }}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                🔄 Play Again
              </Button>
              <Button
                onClick={() => {
                  onCloseGameOverDialog();
                  onResetGame();
                }}
                variant="outline"
                size="lg"
              >
                🏠 Main Menu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface GameStatsProps {
  gameState: GameState;
}

export function GameStats({ gameState }: GameStatsProps) {
  return (
    <div className="flex justify-between items-center mb-4 flex-wrap gap-2 bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg border-2 border-purple-200">
      <div className="text-lg font-bold bg-blue-100 px-3 py-1 rounded-full">
        Score: <span className="text-blue-600">{gameState.score}</span>
      </div>
      <div className="text-lg font-bold bg-red-100 px-3 py-1 rounded-full">
        Lives: <span className="text-red-600">{'❤️'.repeat(gameState.lives)}</span>
      </div>
      <div className="text-sm bg-white px-3 py-1 rounded-full">
        Next Color:{' '}
        <span className="px-2 py-1 rounded text-white font-bold ml-1" style={{ backgroundColor: RAINBOW_COLORS[gameState.nextColorIndex].color }}>
          {RAINBOW_COLORS[gameState.nextColorIndex].name}
        </span>
      </div>
      <div className="text-sm bg-purple-100 px-3 py-1 rounded-full">
        Perfect: <span className="text-purple-600 font-bold">{gameState.perfectRainbowCount}</span> 🌈
      </div>
    </div>
  );
}
