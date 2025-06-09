export interface ColorDrop {
  x: number;
  y: number;
  color: string;
  colorIndex: number;
  speed: number;
  type: 'normal' | 'golden' | 'black' | 'rainbow';
  id: string;
}

export interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speedMultiplier: number;
}

export interface Particle {
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
  gravity: number;
}

export interface GameState {
  state: 'menu' | 'playing' | 'gameOver';
  score: number;
  missedDrops: number;
  nextColorIndex: number;
  gameSpeed: number;
  lives: number;
  perfectRainbowCount: number;
  isAutoCollecting: boolean;
  autoCollectEndTime: number;
  cloudSpeedBoostEndTime: number;
  isRainShower: boolean;
  rainShowerEndTime: number;
  nextRainShowerTime: number;
}

export interface PowerUp {
  type: 'speed' | 'autoCollect';
  endTime: number;
}

export const RAINBOW_COLORS = [
  { name: 'Red', color: '#FF0000', index: 0 },
  { name: 'Orange', color: '#FF7F00', index: 1 },
  { name: 'Yellow', color: '#FFFF00', index: 2 },
  { name: 'Green', color: '#00FF00', index: 3 },
  { name: 'Blue', color: '#0000FF', index: 4 },
  { name: 'Indigo', color: '#4B0082', index: 5 },
  { name: 'Violet', color: '#9400D3', index: 6 },
];

export const NEXT_RAIN_SHOWER_TIME = 30000; // 30 seconds
export const RAIN_SHOWER_DURATION = 5000; // 5 seconds