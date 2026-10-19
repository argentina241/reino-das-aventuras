/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'victory' | 'levelselect';

export type PowerUpType = 'crystal' | 'shield' | 'boots' | 'heart';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Player extends Rect {
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isJumping: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  squashX: number;
  squashY: number;
  walkFrame: number;
  invulnerableTimer: number;
  lives: number;
  score: number;
  coins: number;
  hasShield: boolean;
  hasCrystal: boolean;
  crystalTimer: number;
  hasBoots: boolean;
  bootsTimer: number;
  isDead: boolean;
  deathTimer: number;
  winState: boolean;
}

export type EnemyType = 'pompom' | 'voador' | 'cristalino' | 'morcego' | 'chaminho' | 'boss';

export interface Enemy extends Rect {
  id: string;
  type: EnemyType;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isDead: boolean;
  deadTimer: number;
  minX?: number;
  maxX?: number;
  startY?: number;
  hp?: number;
  maxHp?: number;
  state?: 'idle' | 'walk' | 'fly' | 'shell' | 'dive' | 'charge' | 'slam' | 'vulnerable' | 'enraged';
  stateTimer?: number;
  diveTargetY?: number;
  shootTimer?: number;
  invulnerableTimer?: number;
}

export interface Block extends Rect {
  id: string;
  type: 'question' | 'brick' | 'stone';
  contains: 'coin' | 'crystal' | 'shield' | 'boots' | 'heart' | 'empty';
  bumpOffset: number;
  isHit: boolean;
}

export interface CoinPickup extends Rect {
  id: string;
  collected: boolean;
  animOffset: number;
}

export interface PowerUpItem extends Rect {
  id: string;
  type: PowerUpType;
  vx: number;
  vy: number;
  isGrounded: boolean;
  collected: boolean;
  emerging: boolean;
  emergeY: number;
}

export interface Projectile extends Rect {
  id: string;
  fromPlayer: boolean;
  vx: number;
  vy: number;
  lifeTimer: number;
  damage: number;
  color: string;
}

export interface MovingPlatform extends Rect {
  id: string;
  vx: number;
  vy: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  t: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'star' | 'smoke';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  opacity: number;
  color: string;
}

export interface Checkpoint extends Rect {
  id: string;
  activated: boolean;
}

export interface PortalExit extends Rect {
  active: boolean;
}

export interface Hazard extends Rect {
  type: 'spikes' | 'lava' | 'pit';
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  theme: 'grass' | 'crystal_cave' | 'volcano';
  width: number;
  height: number;
  playerStart: { x: number; y: number };
  exit: PortalExit;
  checkpoint: Checkpoint;
  solids: Rect[];
  blocks: Block[];
  coins: CoinPickup[];
  enemies: Enemy[];
  movingPlatforms: MovingPlatform[];
  hazards: Hazard[];
  powerups: PowerUpItem[];
}

export interface GameSaveData {
  unlockedLevel: number;
  highScore: number;
  totalCoins: number;
  soundMuted: boolean;
}
