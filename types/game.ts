export interface Drop {
  x: number;
  y: number;
  color: string;
  colorIndex: number;
  speed: number;
  type: 'normal' | 'lightning' | 'bomb' | 'rainbow' | 'heart' | 'hail' | 'rocket' | 'reverse' | 'double' | 'water' | 'shield' | 'meteorite';
  id: string;
  // Rocket-specific properties
  angle?: number;
  amplitude?: number;
  frequency?: number;
  startY?: number;
  // Meteorite-specific properties
  targetX?: number;
  startX?: number;
  direction?: 'left-to-right' | 'right-to-left';
  trailParticles?: Array<{ x: number; y: number; life: number }>;
  hasHitGround?: boolean; // New property for meteorite ground impact
  // 3D effect properties
  scale?: number;
  rotation?: number;
  shadowOffset?: number;
}

export interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speedMultiplier: number;
  isFrozen: boolean;
  isReversed: boolean;
  isInvincible: boolean; // New: invincibility frames after damage
  isShielded: boolean; // New: shield protection
  // 3D effect properties
  scale: number;
  rotation: number;
  bobOffset: number;
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
  // 3D effect properties
  z?: number;
  rotationSpeed?: number;
  rotation?: number;
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
  cloudFreezeEndTime: number;
  cloudReverseEndTime: number;
  cloudInvincibilityEndTime: number; // New: invincibility timer
  cloudShieldEndTime: number; // New: shield timer
  doublePointsEndTime: number;
  isRainShower: boolean;
  rainShowerEndTime: number;
  nextRainShowerTime: number;
  perfectRainbowProgress: number;
  showPerfectRainbowLost: boolean;
  perfectRainbowLostTime: number;
  isPointerLocked: boolean;
  lightningFlash: boolean;
  nextLightningTime: number;
  showSpeedBoostMessage: boolean;
  speedBoostMessageEndTime: number;
  showAutoCollectMessage: boolean;
  autoCollectMessageEndTime: number;
  showFreezeMessage: boolean;
  freezeMessageEndTime: number;
  showReverseMessage: boolean;
  reverseMessageEndTime: number;
  showDoublePointsMessage: boolean;
  doublePointsMessageEndTime: number;
  showShieldMessage: boolean; // New: shield message
  shieldMessageEndTime: number; // New: shield message timer
  timeOfDay: 'day' | 'night';
  manualRainShowerOnly: boolean;
  // New: pause state
  isPaused?: boolean;
}

export interface PowerUp {
  type: 'speed' | 'autoCollect';
  endTime: number;
}

export interface BackgroundCloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  // 3D effect properties
  scale: number;
  rotation: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  twinkle: number;
  brightness: number;
  // 3D effect properties
  z: number;
  rotationSpeed: number;
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

export const MOONBOW_COLORS = [
  { name: 'Silver Red', color: '#B0A8A8', index: 0 },
  { name: 'Silver Orange', color: '#B0B0A0', index: 1 },
  { name: 'Silver Yellow', color: '#B0B8A0', index: 2 },
  { name: 'Silver Green', color: '#A0B8A0', index: 3 },
  { name: 'Silver Blue', color: '#A0B0B8', index: 4 },
  { name: 'Silver Indigo', color: '#A8A0B8', index: 5 },
  { name: 'Silver Violet', color: '#B0A0B8', index: 6 },
];
