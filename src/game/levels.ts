/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData, Rect, Block, Enemy, CoinPickup, MovingPlatform, Hazard } from './types.ts';

export function getLevelData(levelId: number): LevelData {
  switch (levelId) {
    case 1:
      return createLevel1();
    case 2:
      return createLevel2();
    case 3:
      return createLevel3();
    default:
      return createLevel1();
  }
}

// ----------------------------------------------------
// LEVEL 1: Pradaria Encantada
// ----------------------------------------------------
function createLevel1(): LevelData {
  const width = 3200;
  const height = 720;
  const groundY = 600;

  // Ground segments with gaps
  const solids: Rect[] = [
    // Starting ground
    { x: 0, y: groundY, w: 900, h: 500 },
    // Platform cluster 1
    { x: 320, y: 460, w: 128, h: 32 },
    { x: 500, y: 380, w: 160, h: 32 },
    { x: 700, y: 460, w: 128, h: 32 },

    // Middle ground after pit 1 (pit is 900 -> 1020)
    { x: 1020, y: groundY, w: 850, h: 500 },
    // Elevated stair steps
    { x: 1180, y: 520, w: 96, h: 80 },
    { x: 1276, y: 440, w: 96, h: 160 },
    { x: 1450, y: 360, w: 192, h: 32 },

    // Middle-high cloud platforms
    { x: 1700, y: 420, w: 128, h: 28 },
    { x: 1900, y: 350, w: 160, h: 28 },

    // Ground after pit 2 (pit is 1870 -> 1990)
    { x: 1990, y: groundY, w: 1210, h: 500 },
    // Pre-exit stairway
    { x: 2500, y: 520, w: 96, h: 80 },
    { x: 2596, y: 450, w: 96, h: 150 },
    { x: 2692, y: 380, w: 96, h: 220 },
    { x: 2880, y: 480, w: 220, h: 32 },
  ];

  const blocks: Block[] = [
    // Early question blocks
    { id: 'b1', x: 260, y: 440, w: 40, h: 40, type: 'question', contains: 'coin', bumpOffset: 0, isHit: false },
    { id: 'b2', x: 300, y: 440, w: 40, h: 40, type: 'brick', contains: 'empty', bumpOffset: 0, isHit: false },
    { id: 'b3', x: 340, y: 440, w: 40, h: 40, type: 'question', contains: 'crystal', bumpOffset: 0, isHit: false },
    { id: 'b4', x: 380, y: 440, w: 40, h: 40, type: 'brick', contains: 'empty', bumpOffset: 0, isHit: false },

    // High cluster
    { id: 'b5', x: 560, y: 260, w: 40, h: 40, type: 'question', contains: 'heart', bumpOffset: 0, isHit: false },
    { id: 'b6', x: 600, y: 260, w: 40, h: 40, type: 'question', contains: 'coin', bumpOffset: 0, isHit: false },

    // Mid-level blocks
    { id: 'b7', x: 1350, y: 300, w: 40, h: 40, type: 'question', contains: 'coin', bumpOffset: 0, isHit: false },
    { id: 'b8', x: 1500, y: 220, w: 40, h: 40, type: 'question', contains: 'boots', bumpOffset: 0, isHit: false },

    // Late blocks
    { id: 'b9', x: 2200, y: 440, w: 40, h: 40, type: 'question', contains: 'coin', bumpOffset: 0, isHit: false },
    { id: 'b10', x: 2240, y: 440, w: 40, h: 40, type: 'brick', contains: 'empty', bumpOffset: 0, isHit: false },
    { id: 'b11', x: 2280, y: 440, w: 40, h: 40, type: 'question', contains: 'shield', bumpOffset: 0, isHit: false },
  ];

  const coins: CoinPickup[] = [
    { id: 'c1', x: 200, y: 550, w: 24, h: 24, collected: false, animOffset: 0 },
    { id: 'c2', x: 240, y: 550, w: 24, h: 24, collected: false, animOffset: 0.2 },
    { id: 'c3', x: 530, y: 330, w: 24, h: 24, collected: false, animOffset: 0.4 },
    { id: 'c4', x: 570, y: 330, w: 24, h: 24, collected: false, animOffset: 0.6 },
    { id: 'c5', x: 610, y: 330, w: 24, h: 24, collected: false, animOffset: 0.8 },
    { id: 'c6', x: 740, y: 410, w: 24, h: 24, collected: false, animOffset: 0.1 },
    { id: 'c7', x: 1080, y: 550, w: 24, h: 24, collected: false, animOffset: 0.3 },
    { id: 'c8', x: 1120, y: 550, w: 24, h: 24, collected: false, animOffset: 0.5 },
    { id: 'c9', x: 1720, y: 370, w: 24, h: 24, collected: false, animOffset: 0.7 },
    { id: 'c10', x: 1760, y: 370, w: 24, h: 24, collected: false, animOffset: 0.9 },
    { id: 'c11', x: 1940, y: 300, w: 24, h: 24, collected: false, animOffset: 0.2 },
    { id: 'c12', x: 1980, y: 300, w: 24, h: 24, collected: false, animOffset: 0.4 },
    { id: 'c13', x: 2360, y: 550, w: 24, h: 24, collected: false, animOffset: 0.6 },
    { id: 'c14', x: 2400, y: 550, w: 24, h: 24, collected: false, animOffset: 0.8 },
    { id: 'c15', x: 2920, y: 430, w: 24, h: 24, collected: false, animOffset: 0.1 },
    { id: 'c16', x: 2960, y: 430, w: 24, h: 24, collected: false, animOffset: 0.3 },
  ];

  const enemies: Enemy[] = [
    // Pompom ground walkers
    { id: 'e1', type: 'pompom', x: 450, y: groundY - 32, w: 32, h: 32, vx: -60, vy: 0, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0, minX: 300, maxX: 700 },
    { id: 'e2', type: 'pompom', x: 750, y: groundY - 32, w: 32, h: 32, vx: 60, vy: 0, facing: 'right', isGrounded: true, isDead: false, deadTimer: 0, minX: 600, maxX: 880 },
    // Voador flyer
    { id: 'e3', type: 'voador', x: 1250, y: 350, w: 32, h: 28, vx: -50, vy: 0, facing: 'left', isGrounded: false, isDead: false, deadTimer: 0, minX: 1150, maxX: 1400, startY: 350 },
    // Mid ground walkers
    { id: 'e4', type: 'pompom', x: 1350, y: groundY - 32, w: 32, h: 32, vx: 60, vy: 0, facing: 'right', isGrounded: true, isDead: false, deadTimer: 0, minX: 1050, maxX: 1550 },
    { id: 'e5', type: 'voador', x: 1850, y: 280, w: 32, h: 28, vx: 50, vy: 0, facing: 'right', isGrounded: false, isDead: false, deadTimer: 0, minX: 1750, maxX: 1950, startY: 280 },
    // Late section enemies
    { id: 'e6', type: 'pompom', x: 2150, y: groundY - 32, w: 32, h: 32, vx: -65, vy: 0, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0, minX: 2000, maxX: 2450 },
    { id: 'e7', type: 'pompom', x: 2350, y: groundY - 32, w: 32, h: 32, vx: 65, vy: 0, facing: 'right', isGrounded: true, isDead: false, deadTimer: 0, minX: 2100, maxX: 2480 },
    { id: 'e8', type: 'voador', x: 2750, y: 320, w: 32, h: 28, vx: -55, vy: 0, facing: 'left', isGrounded: false, isDead: false, deadTimer: 0, minX: 2650, maxX: 2850, startY: 320 },
  ];

  const movingPlatforms: MovingPlatform[] = [
    { id: 'mp1', x: 880, y: 520, w: 100, h: 24, vx: 50, vy: 0, startX: 860, startY: 520, endX: 980, endY: 520, speed: 45, t: 0 },
    { id: 'mp2', x: 1840, y: 480, w: 110, h: 24, vx: 0, vy: 40, startX: 1840, startY: 380, endX: 1840, endY: 530, speed: 40, t: 0 },
  ];

  const hazards: Hazard[] = [
    { x: 900, y: 690, w: 120, h: 40, type: 'pit' },
    { x: 1870, y: 690, w: 120, h: 40, type: 'pit' },
  ];

  return {
    id: 1,
    title: 'Fase 1',
    subtitle: 'Pradaria Encantada',
    theme: 'grass',
    width,
    height,
    playerStart: { x: 80, y: 520 },
    checkpoint: { id: 'cp1', x: 1550, y: 310, w: 32, h: 50, activated: false },
    exit: { x: 3040, y: 500, w: 60, h: 100, active: true },
    solids,
    blocks,
    coins,
    enemies,
    movingPlatforms,
    hazards,
    powerups: [],
  };
}

// ----------------------------------------------------
// LEVEL 2: Caverna dos Cristais
// ----------------------------------------------------
function createLevel2(): LevelData {
  const width = 3600;
  const height = 720;
  const groundY = 600;

  const solids: Rect[] = [
    // Entrance hall
    { x: 0, y: groundY, w: 700, h: 500 },
    { x: 250, y: 480, w: 140, h: 32 },
    { x: 450, y: 400, w: 160, h: 32 },

    // Middle cavern with upper crystal bridges and lower spike tunnels
    { x: 800, y: groundY, w: 550, h: 500 },
    { x: 900, y: 460, w: 140, h: 32 },
    { x: 1100, y: 380, w: 160, h: 32 },
    { x: 1300, y: 300, w: 180, h: 32 },

    // Upper crystal ledge
    { x: 1550, y: 260, w: 300, h: 32 },

    // Central ground
    { x: 1500, y: groundY, w: 750, h: 500 },
    { x: 1900, y: 460, w: 160, h: 32 },
    { x: 2100, y: 380, w: 160, h: 32 },

    // Floating crystal steps over deep chasms
    { x: 2400, y: 450, w: 120, h: 32 },
    { x: 2600, y: 370, w: 120, h: 32 },
    { x: 2800, y: 440, w: 140, h: 32 },

    // Final cavern chamber
    { x: 2980, y: groundY, w: 620, h: 500 },
    { x: 3120, y: 480, w: 160, h: 32 },
  ];

  const blocks: Block[] = [
    { id: 'c_b1', x: 280, y: 360, w: 40, h: 40, type: 'question', contains: 'shield', bumpOffset: 0, isHit: false },
    { id: 'c_b2', x: 480, y: 280, w: 40, h: 40, type: 'question', contains: 'coin', bumpOffset: 0, isHit: false },
    { id: 'c_b3', x: 940, y: 340, w: 40, h: 40, type: 'question', contains: 'crystal', bumpOffset: 0, isHit: false },
    { id: 'c_b4', x: 1140, y: 260, w: 40, h: 40, type: 'question', contains: 'coin', bumpOffset: 0, isHit: false },
    { id: 'c_b5', x: 1600, y: 170, w: 40, h: 40, type: 'question', contains: 'boots', bumpOffset: 0, isHit: false },
    { id: 'c_b6', x: 1650, y: 170, w: 40, h: 40, type: 'brick', contains: 'empty', bumpOffset: 0, isHit: false },
    { id: 'c_b7', x: 1700, y: 170, w: 40, h: 40, type: 'question', contains: 'heart', bumpOffset: 0, isHit: false },
    { id: 'c_b8', x: 2440, y: 330, w: 40, h: 40, type: 'question', contains: 'coin', bumpOffset: 0, isHit: false },
    { id: 'c_b9', x: 3040, y: 480, w: 40, h: 40, type: 'question', contains: 'shield', bumpOffset: 0, isHit: false },
  ];

  const coins: CoinPickup[] = [
    { id: 'cc1', x: 300, y: 430, w: 24, h: 24, collected: false, animOffset: 0 },
    { id: 'cc2', x: 500, y: 350, w: 24, h: 24, collected: false, animOffset: 0.2 },
    { id: 'cc3', x: 960, y: 410, w: 24, h: 24, collected: false, animOffset: 0.4 },
    { id: 'cc4', x: 1160, y: 330, w: 24, h: 24, collected: false, animOffset: 0.6 },
    { id: 'cc5', x: 1360, y: 250, w: 24, h: 24, collected: false, animOffset: 0.8 },
    { id: 'cc6', x: 1620, y: 210, w: 24, h: 24, collected: false, animOffset: 0.1 },
    { id: 'cc7', x: 1670, y: 210, w: 24, h: 24, collected: false, animOffset: 0.3 },
    { id: 'cc8', x: 1720, y: 210, w: 24, h: 24, collected: false, animOffset: 0.5 },
    { id: 'cc9', x: 1600, y: 550, w: 24, h: 24, collected: false, animOffset: 0.7 },
    { id: 'cc10', x: 1660, y: 550, w: 24, h: 24, collected: false, animOffset: 0.9 },
    { id: 'cc11', x: 2440, y: 390, w: 24, h: 24, collected: false, animOffset: 0.2 },
    { id: 'cc12', x: 2640, y: 310, w: 24, h: 24, collected: false, animOffset: 0.4 },
    { id: 'cc13', x: 2840, y: 380, w: 24, h: 24, collected: false, animOffset: 0.6 },
    { id: 'cc14', x: 3160, y: 430, w: 24, h: 24, collected: false, animOffset: 0.8 },
  ];

  const enemies: Enemy[] = [
    // Cristalino shell crawler (patrols ground)
    { id: 'ce1', type: 'cristalino', x: 380, y: groundY - 32, w: 32, h: 32, vx: 55, vy: 0, facing: 'right', isGrounded: true, isDead: false, deadTimer: 0, minX: 200, maxX: 650 },
    // Morcego bat (perched in cavern ceiling, dives when player nears)
    { id: 'ce2', type: 'morcego', x: 620, y: 240, w: 30, h: 26, vx: 0, vy: 0, facing: 'left', isGrounded: false, isDead: false, deadTimer: 0, startY: 240, state: 'fly' },
    // Middle section
    { id: 'ce3', type: 'cristalino', x: 980, y: groundY - 32, w: 32, h: 32, vx: -60, vy: 0, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0, minX: 850, maxX: 1300 },
    { id: 'ce4', type: 'morcego', x: 1220, y: 200, w: 30, h: 26, vx: 0, vy: 0, facing: 'left', isGrounded: false, isDead: false, deadTimer: 0, startY: 200, state: 'fly' },
    { id: 'ce5', type: 'cristalino', x: 1750, y: groundY - 32, w: 32, h: 32, vx: 60, vy: 0, facing: 'right', isGrounded: true, isDead: false, deadTimer: 0, minX: 1550, maxX: 2150 },
    { id: 'ce6', type: 'morcego', x: 2020, y: 280, w: 30, h: 26, vx: 0, vy: 0, facing: 'left', isGrounded: false, isDead: false, deadTimer: 0, startY: 280, state: 'fly' },
    { id: 'ce7', type: 'morcego', x: 2700, y: 220, w: 30, h: 26, vx: 0, vy: 0, facing: 'left', isGrounded: false, isDead: false, deadTimer: 0, startY: 220, state: 'fly' },
    { id: 'ce8', type: 'cristalino', x: 3100, y: groundY - 32, w: 32, h: 32, vx: -65, vy: 0, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0, minX: 3000, maxX: 3450 },
  ];

  const movingPlatforms: MovingPlatform[] = [
    // Moving crystal elevators across pits
    { id: 'cmp1', x: 680, y: 520, w: 110, h: 24, vx: 50, vy: 0, startX: 680, startY: 520, endX: 810, endY: 520, speed: 45, t: 0 },
    { id: 'cmp2', x: 1350, y: 480, w: 120, h: 24, vx: 0, vy: 45, startX: 1350, startY: 340, endX: 1350, endY: 520, speed: 45, t: 0 },
    { id: 'cmp3', x: 2240, y: 460, w: 120, h: 24, vx: 55, vy: 0, startX: 2230, startY: 460, endX: 2380, endY: 460, speed: 50, t: 0 },
  ];

  const hazards: Hazard[] = [
    { x: 700, y: 640, w: 100, h: 40, type: 'spikes' },
    { x: 1350, y: 690, w: 150, h: 40, type: 'pit' },
    { x: 2250, y: 640, w: 150, h: 40, type: 'spikes' },
    { x: 2520, y: 690, w: 80, h: 40, type: 'pit' },
    { x: 2720, y: 690, w: 80, h: 40, type: 'pit' },
  ];

  return {
    id: 2,
    title: 'Fase 2',
    subtitle: 'Caverna dos Cristais',
    theme: 'crystal_cave',
    width,
    height,
    playerStart: { x: 80, y: 520 },
    checkpoint: { id: 'cp2', x: 1750, y: 210, w: 32, h: 50, activated: false },
    exit: { x: 3450, y: 500, w: 60, h: 100, active: true },
    solids,
    blocks,
    coins,
    enemies,
    movingPlatforms,
    hazards,
    powerups: [],
  };
}

// ----------------------------------------------------
// LEVEL 3: Fortaleza Vulcânica (With Boss Fight!)
// ----------------------------------------------------
function createLevel3(): LevelData {
  const width = 4000;
  const height = 720;
  const groundY = 600;

  const solids: Rect[] = [
    // Entrance to fortress
    { x: 0, y: groundY, w: 650, h: 500 },
    { x: 240, y: 480, w: 140, h: 32 },
    { x: 440, y: 400, w: 160, h: 32 },

    // Basalt stepping pillars over lava chasm 1
    { x: 750, y: 500, w: 100, h: 220 },
    { x: 950, y: 420, w: 110, h: 300 },
    { x: 1150, y: 350, w: 110, h: 370 },

    // Middle fortress platform
    { x: 1350, y: groundY, w: 700, h: 500 },
    { x: 1500, y: 460, w: 140, h: 32 },
    { x: 1700, y: 380, w: 160, h: 32 },
    { x: 1900, y: 460, w: 140, h: 32 },

    // Perilous lava run leading to boss chamber
    { x: 2150, y: 480, w: 120, h: 32 },
    { x: 2350, y: 400, w: 120, h: 32 },
    { x: 2550, y: 480, w: 140, h: 32 },

    // Pre-boss antechamber
    { x: 2700, y: groundY, w: 300, h: 500 },

    // BOSS ARENA (x: 3000 to x: 3950)
    // Left boundary pillar
    { x: 2980, y: 200, w: 40, h: 520 },
    // Main arena floor
    { x: 3020, y: groundY, w: 900, h: 500 },
    // Right boundary wall
    { x: 3920, y: 200, w: 50, h: 520 },

    // Boss arena tactical platforms
    { x: 3120, y: 460, w: 140, h: 28 },
    { x: 3400, y: 380, w: 160, h: 28 },
    { x: 3680, y: 460, w: 140, h: 28 },
  ];

  const blocks: Block[] = [
    { id: 'v_b1', x: 280, y: 360, w: 40, h: 40, type: 'question', contains: 'crystal', bumpOffset: 0, isHit: false },
    { id: 'v_b2', x: 480, y: 280, w: 40, h: 40, type: 'question', contains: 'coin', bumpOffset: 0, isHit: false },
    { id: 'v_b3', x: 1540, y: 340, w: 40, h: 40, type: 'question', contains: 'shield', bumpOffset: 0, isHit: false },
    { id: 'v_b4', x: 1740, y: 260, w: 40, h: 40, type: 'question', contains: 'heart', bumpOffset: 0, isHit: false },
    { id: 'v_b5', x: 2400, y: 280, w: 40, h: 40, type: 'question', contains: 'boots', bumpOffset: 0, isHit: false },
    // Arena question blocks (replenish energy for player during boss fight!)
    { id: 'v_b6', x: 3200, y: 340, w: 40, h: 40, type: 'question', contains: 'crystal', bumpOffset: 0, isHit: false },
    { id: 'v_b7', x: 3720, y: 340, w: 40, h: 40, type: 'question', contains: 'heart', bumpOffset: 0, isHit: false },
  ];

  const coins: CoinPickup[] = [
    { id: 'vc1', x: 300, y: 430, w: 24, h: 24, collected: false, animOffset: 0 },
    { id: 'vc2', x: 500, y: 350, w: 24, h: 24, collected: false, animOffset: 0.2 },
    { id: 'vc3', x: 790, y: 450, w: 24, h: 24, collected: false, animOffset: 0.4 },
    { id: 'vc4', x: 990, y: 370, w: 24, h: 24, collected: false, animOffset: 0.6 },
    { id: 'vc5', x: 1190, y: 300, w: 24, h: 24, collected: false, animOffset: 0.8 },
    { id: 'vc6', x: 1540, y: 410, w: 24, h: 24, collected: false, animOffset: 0.1 },
    { id: 'vc7', x: 1740, y: 330, w: 24, h: 24, collected: false, animOffset: 0.3 },
    { id: 'vc8', x: 1940, y: 410, w: 24, h: 24, collected: false, animOffset: 0.5 },
    { id: 'vc9', x: 2190, y: 430, w: 24, h: 24, collected: false, animOffset: 0.7 },
    { id: 'vc10', x: 2590, y: 430, w: 24, h: 24, collected: false, animOffset: 0.9 },
  ];

  const enemies: Enemy[] = [
    // Chaminho flame crawlers
    { id: 've1', type: 'chaminho', x: 350, y: groundY - 32, w: 32, h: 32, vx: 60, vy: 0, facing: 'right', isGrounded: true, isDead: false, deadTimer: 0, minX: 200, maxX: 600 },
    { id: 've2', type: 'chaminho', x: 1450, y: groundY - 32, w: 32, h: 32, vx: -65, vy: 0, facing: 'left', isGrounded: true, isDead: false, deadTimer: 0, minX: 1380, maxX: 1950 },
    { id: 've3', type: 'chaminho', x: 1800, y: groundY - 32, w: 32, h: 32, vx: 65, vy: 0, facing: 'right', isGrounded: true, isDead: false, deadTimer: 0, minX: 1400, maxX: 1980 },

    // THE BOSS: IGNIS, GUARDIÃO DE LAVA
    {
      id: 'boss_ignis',
      type: 'boss',
      x: 3500,
      y: groundY - 80,
      w: 80,
      h: 80,
      vx: -70,
      vy: 0,
      facing: 'left',
      isGrounded: true,
      isDead: false,
      deadTimer: 0,
      hp: 10,
      maxHp: 10,
      state: 'charge',
      stateTimer: 2.5,
      minX: 3040,
      maxX: 3900,
      invulnerableTimer: 0,
      shootTimer: 0,
    },
  ];

  const movingPlatforms: MovingPlatform[] = [
    { id: 'vmp1', x: 650, y: 530, w: 90, h: 24, vx: 45, vy: 0, startX: 640, startY: 530, endX: 740, endY: 530, speed: 40, t: 0 },
    { id: 'vmp2', x: 1260, y: 480, w: 90, h: 24, vx: 0, vy: 50, startX: 1260, startY: 380, endX: 1260, endY: 540, speed: 45, t: 0 },
    { id: 'vmp3', x: 2040, y: 520, w: 100, h: 24, vx: 50, vy: 0, startX: 2030, startY: 520, endX: 2140, endY: 520, speed: 45, t: 0 },
  ];

  const hazards: Hazard[] = [
    { x: 650, y: 650, w: 700, h: 70, type: 'lava' },
    { x: 2050, y: 650, w: 650, h: 70, type: 'lava' },
  ];

  return {
    id: 3,
    title: 'Fase 3',
    subtitle: 'Fortaleza Vulcânica',
    theme: 'volcano',
    width,
    height,
    playerStart: { x: 80, y: 520 },
    checkpoint: { id: 'cp3', x: 2800, y: groundY - 50, w: 32, h: 50, activated: false },
    // Portal exit is placed inside boss arena, unlocked when boss is defeated
    exit: { x: 3820, y: groundY - 100, w: 64, h: 100, active: false },
    solids,
    blocks,
    coins,
    enemies,
    movingPlatforms,
    hazards,
    powerups: [],
  };
}
