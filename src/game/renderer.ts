/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Enemy, Block, CoinPickup, MovingPlatform, Hazard, Particle, FloatingText, LevelData, Projectile } from './types.ts';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  public render(
    level: LevelData,
    player: Player,
    cameraX: number,
    cameraY: number,
    particles: Particle[],
    floatingTexts: FloatingText[],
    projectiles: Projectile[],
    shake: number,
    gameTime: number
  ) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Apply camera shake if any
    let sx = 0;
    let sy = 0;
    if (shake > 0) {
      sx = (Math.random() - 0.5) * shake;
      sy = (Math.random() - 0.5) * shake;
    }

    // 1. Draw Parallax Background
    this.drawBackground(level.theme, cameraX, cameraY, w, h, gameTime);

    // 2. Camera Transform for World Objects
    ctx.save();
    ctx.translate(Math.round(-cameraX + sx), Math.round(-cameraY + sy));

    // Draw Hazards (Lava/Spikes)
    this.drawHazards(level.hazards, gameTime);

    // Draw Solids / Platforms
    this.drawSolids(level.solids, level.theme, gameTime);

    // Draw Moving Platforms
    this.drawMovingPlatforms(level.movingPlatforms, level.theme, gameTime);

    // Draw Blocks
    this.drawBlocks(level.blocks, gameTime);

    // Draw Checkpoint & Exit
    this.drawCheckpoint(level.checkpoint, gameTime);
    this.drawExitPortal(level.exit, gameTime);

    // Draw Coins
    this.drawCoins(level.coins, gameTime);

    // Draw Power-ups on floor
    this.drawPowerups(level.powerups, gameTime);

    // Draw Projectiles
    this.drawProjectiles(projectiles, gameTime);

    // Draw Enemies & Boss
    this.drawEnemies(level.enemies, gameTime);

    // Draw Player
    this.drawPlayer(player, gameTime);

    // Draw Particles
    this.drawParticles(particles);

    // Draw Floating Text (+100 etc)
    this.drawFloatingTexts(floatingTexts);

    ctx.restore();
    ctx.restore();
  }

  // -----------------------------------------------------------------
  // PARALLAX BACKGROUND
  // -----------------------------------------------------------------
  private drawBackground(theme: string, camX: number, camY: number, w: number, h: number, time: number) {
    const ctx = this.ctx;

    if (theme === 'grass') {
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#38bdf8'); // light sky blue
      skyGrad.addColorStop(0.7, '#bae6fd');
      skyGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Sun
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(w * 0.8, 90, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
      ctx.beginPath();
      ctx.arc(w * 0.8, 90, 65, 0, Math.PI * 2);
      ctx.fill();

      // Distant mountains (Parallax 0.1)
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.moveTo(0, h);
      const mOffset1 = (camX * 0.1) % 400;
      for (let x = -mOffset1 - 400; x < w + 400; x += 300) {
        ctx.lineTo(x, h - 220);
        ctx.lineTo(x + 150, h - 340);
        ctx.lineTo(x + 300, h - 220);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Midground Hills & Trees (Parallax 0.25)
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(0, h);
      const mOffset2 = (camX * 0.25) % 500;
      for (let x = -mOffset2 - 500; x < w + 500; x += 250) {
        ctx.quadraticCurveTo(x + 125, h - 220, x + 250, h - 140);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Clouds (Parallax 0.15 + drift)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      const cloudSpeed = time * 12;
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 320 + cloudSpeed - camX * 0.15) % (w + 400)) - 100;
        const cy = 70 + (i % 3) * 40;
        this.drawCloud(cx, cy, 50 + (i % 2) * 20);
      }
    } else if (theme === 'crystal_cave') {
      // Dark twilight cavern gradient
      const caveGrad = ctx.createLinearGradient(0, 0, 0, h);
      caveGrad.addColorStop(0, '#0f0c29');
      caveGrad.addColorStop(0.5, '#1e1338');
      caveGrad.addColorStop(1, '#2c1654');
      ctx.fillStyle = caveGrad;
      ctx.fillRect(0, 0, w, h);

      // Glowing crystal stars & stalactites in background (Parallax 0.15)
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      const cOffset = (camX * 0.15) % 300;
      for (let x = -cOffset; x < w + 300; x += 180) {
        // Stalactite
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 40, 0);
        ctx.lineTo(x + 20, 110 + Math.sin(x) * 40);
        ctx.closePath();
        ctx.fill();
      }

      // Distant glowing crystal pillars (Parallax 0.3)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      const pOffset = (camX * 0.3) % 400;
      for (let x = -pOffset; x < w + 400; x += 260) {
        ctx.fillRect(x, h - 350, 40, 350);
        // glowing crystal cap
        ctx.beginPath();
        ctx.moveTo(x + 20, h - 390);
        ctx.lineTo(x + 40, h - 350);
        ctx.lineTo(x, h - 350);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Volcano fortress background
      const volcGrad = ctx.createLinearGradient(0, 0, 0, h);
      volcGrad.addColorStop(0, '#1c0a00');
      volcGrad.addColorStop(0.5, '#450a0a');
      volcGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = volcGrad;
      ctx.fillRect(0, 0, w, h);

      // Distant fortress battlements (Parallax 0.15)
      ctx.fillStyle = '#261212';
      const fOffset = (camX * 0.15) % 400;
      for (let x = -fOffset; x < w + 400; x += 120) {
        ctx.fillRect(x, h - 300, 80, 300);
        ctx.fillRect(x - 10, h - 330, 100, 30);
      }

      // Rising lava smoke and embers
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.beginPath();
      ctx.arc(w * 0.5, h + 100, 350, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawCloud(x: number, y: number, r: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
    ctx.arc(x + r * 0.5, y - r * 0.2, r * 0.7, 0, Math.PI * 2);
    ctx.arc(x + r * 1.1, y, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // -----------------------------------------------------------------
  // SOLIDS & PLATFORMS
  // -----------------------------------------------------------------
  private drawSolids(solids: { x: number; y: number; w: number; h: number }[], theme: string, time: number) {
    const ctx = this.ctx;

    for (let i = 0; i < solids.length; i++) {
      const s = solids[i];

      if (theme === 'grass') {
        // Dirt body
        ctx.fillStyle = '#854d0e'; // rich warm brown
        ctx.fillRect(s.x, s.y, s.w, s.h);

        // Grass top trim (12px)
        ctx.fillStyle = '#22c55e'; // vibrant green
        ctx.fillRect(s.x, s.y, s.w, 14);

        // Grass tufts / fringe
        ctx.fillStyle = '#16a34a';
        for (let gx = s.x; gx < s.x + s.w - 10; gx += 16) {
          ctx.beginPath();
          ctx.moveTo(gx, s.y + 14);
          ctx.lineTo(gx + 8, s.y + 20);
          ctx.lineTo(gx + 16, s.y + 14);
          ctx.fill();
        }

        // Texture pebbles in dirt
        ctx.fillStyle = '#713f12';
        for (let px = s.x + 12; px < s.x + s.w - 12; px += 48) {
          ctx.fillRect(px, s.y + 28, 8, 8);
          ctx.fillRect(px + 20, s.y + 44, 6, 6);
        }
      } else if (theme === 'crystal_cave') {
        // Dark purple crystalline rock
        ctx.fillStyle = '#2e1065';
        ctx.fillRect(s.x, s.y, s.w, s.h);

        // Glowing cyan-purple crystal cap
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(s.x, s.y, s.w, 8);

        // Neon crystal bevel
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(s.x, s.y + 8, s.w, 4);

        // Inset crystal geometric facet lines
        ctx.strokeStyle = '#581c87';
        ctx.lineWidth = 2;
        ctx.strokeRect(s.x + 2, s.y + 12, s.w - 4, s.h - 14);
      } else {
        // Volcano: Obsidian with fiery seams
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(s.x, s.y, s.w, s.h);

        // Glowing volcanic crust top
        const glowPhase = Math.sin(time * 3 + s.x * 0.05) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(239, 68, 68, ${glowPhase})`;
        ctx.fillRect(s.x, s.y, s.w, 6);

        ctx.fillStyle = '#f97316';
        ctx.fillRect(s.x, s.y + 6, s.w, 3);

        // Red stone bricks pattern
        ctx.strokeStyle = '#441a1a';
        ctx.lineWidth = 1.5;
        for (let bx = s.x; bx < s.x + s.w; bx += 40) {
          ctx.strokeRect(bx, s.y + 9, 40, s.h - 9);
        }
      }
    }
  }

  // -----------------------------------------------------------------
  // MOVING PLATFORMS
  // -----------------------------------------------------------------
  private drawMovingPlatforms(platforms: MovingPlatform[], theme: string, time: number) {
    const ctx = this.ctx;

    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];

      if (theme === 'grass') {
        // Cloud platform
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, [12, 12, 12, 12]);
        ctx.fill();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cloud puff details
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(p.x + p.w * 0.3, p.y + p.h * 0.5, 8, 0, Math.PI * 2);
        ctx.arc(p.x + p.w * 0.7, p.y + p.h * 0.5, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (theme === 'crystal_cave') {
        // Levitating crystal slab
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(p.x, p.y, p.w, p.h);

        // Pulsing glowing edge
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p.x, p.y, p.w, 5);

        // Central glowing rune gem
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(p.x + p.w * 0.5, p.y + p.h * 0.5, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Volcanic basalt slab with lava trim
        ctx.fillStyle = '#292524';
        ctx.fillRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(p.x, p.y, p.w, 4);

        // Heat shimmer dots
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(p.x + p.w * 0.2, p.y + 8, 6, 4);
        ctx.fillRect(p.x + p.w * 0.7, p.y + 8, 6, 4);
      }
    }
  }

  // -----------------------------------------------------------------
  // BLOCKS
  // -----------------------------------------------------------------
  private drawBlocks(blocks: Block[], time: number) {
    const ctx = this.ctx;

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const by = b.y - b.bumpOffset;

      if (b.type === 'question') {
        if (b.isHit) {
          // Spent stone block
          ctx.fillStyle = '#64748b';
          ctx.fillRect(b.x, by, b.w, b.h);
          ctx.fillStyle = '#475569';
          ctx.fillRect(b.x + 4, by + 4, b.w - 8, b.h - 8);
          // 4 rivet dots
          ctx.fillStyle = '#334155';
          ctx.fillRect(b.x + 6, by + 6, 4, 4);
          ctx.fillRect(b.x + b.w - 10, by + 6, 4, 4);
          ctx.fillRect(b.x + 6, by + b.h - 10, 4, 4);
          ctx.fillRect(b.x + b.w - 10, by + b.h - 10, 4, 4);
        } else {
          // Active gleaming golden ? block
          const gleam = Math.sin(time * 6 + b.x) * 0.15 + 0.85;
          ctx.fillStyle = `rgb(${Math.round(234 * gleam)}, ${Math.round(179 * gleam)}, 8)`;
          ctx.fillRect(b.x, by, b.w, b.h);

          // Golden border
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(b.x + 2, by + 2, b.w - 4, 4);
          ctx.fillStyle = '#a16207';
          ctx.fillRect(b.x + 2, by + b.h - 6, b.w - 4, 4);

          // Inner box
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(b.x + 5, by + 5, b.w - 10, b.h - 10);

          // The '?' symbol in white with dark shadow
          ctx.fillStyle = '#713f12';
          ctx.font = 'bold 22px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', b.x + b.w / 2 + 1, by + b.h / 2 + 1);

          ctx.fillStyle = '#ffffff';
          ctx.fillText('?', b.x + b.w / 2, by + b.h / 2);
        }
      } else if (b.type === 'brick') {
        // Brick block
        ctx.fillStyle = '#b45309';
        ctx.fillRect(b.x, by, b.w, b.h);

        // Brick seam lines
        ctx.fillStyle = '#78350f';
        ctx.fillRect(b.x, by + b.h / 2 - 1, b.w, 2);
        ctx.fillRect(b.x + b.w / 2 - 1, by, 2, b.h / 2);
        ctx.fillRect(b.x + b.w / 4 - 1, by + b.h / 2, 2, b.h / 2);
        ctx.fillRect(b.x + (b.w * 3) / 4 - 1, by + b.h / 2, 2, b.h / 2);

        // Light bevel
        ctx.fillStyle = '#d97706';
        ctx.fillRect(b.x, by, b.w, 3);
      }
    }
  }

  // -----------------------------------------------------------------
  // COINS
  // -----------------------------------------------------------------
  private drawCoins(coins: CoinPickup[], time: number) {
    const ctx = this.ctx;

    for (let i = 0; i < coins.length; i++) {
      const c = coins[i];
      if (c.collected) continue;

      // Spinning 3D coin simulation via scaleX
      const phase = (time * 4 + c.animOffset) % (Math.PI * 2);
      const widthScale = Math.abs(Math.cos(phase));
      const bob = Math.sin(time * 3 + c.animOffset) * 4;

      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y + c.h / 2 + bob);
      ctx.scale(Math.max(0.15, widthScale), 1);

      // Gold outer ring
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Shiny inner highlight
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-2, -2, 7, 0, Math.PI * 2);
      ctx.fill();

      // Star / star emblem in center
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-2, -5, 4, 10);

      ctx.restore();
    }
  }

  // -----------------------------------------------------------------
  // POWER-UPS (Dropped items)
  // -----------------------------------------------------------------
  private drawPowerups(powerups: LevelData['powerups'], time: number) {
    const ctx = this.ctx;

    for (let i = 0; i < powerups.length; i++) {
      const p = powerups[i];
      if (p.collected) continue;

      const bob = Math.sin(time * 5 + p.x) * 3;
      const y = p.emerging ? p.emergeY : p.y + bob;

      ctx.save();
      ctx.translate(p.x + p.w / 2, y + p.h / 2);

      if (p.type === 'crystal') {
        // Glowing cyan energy crystal
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 14);
        ctx.lineTo(-10, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(-2, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'shield') {
        // Golden magic shield
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#b45309';
        ctx.fillRect(-2, -6, 4, 12);
        ctx.fillRect(-6, -2, 12, 4);
      } else if (p.type === 'boots') {
        // Winged speed boots
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-8, -2, 16, 12);
        ctx.fillStyle = '#6ee7b7';
        // Wings
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-16, -10);
        ctx.lineTo(-6, -4);
        ctx.closePath();
        ctx.fill();
      } else {
        // Extra Heart
        ctx.fillStyle = '#ef4444';
        this.drawHeartPath(ctx, 0, 0, 10);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawHeartPath(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.4);
    ctx.bezierCurveTo(x - size, y - size * 1.1, x - size * 1.3, y + size * 0.2, x, y + size);
    ctx.bezierCurveTo(x + size * 1.3, y + size * 0.2, x + size, y - size * 1.1, x, y - size * 0.4);
    ctx.closePath();
  }

  // -----------------------------------------------------------------
  // CHECKPOINT & EXIT PORTAL
  // -----------------------------------------------------------------
  private drawCheckpoint(cp: LevelData['checkpoint'], time: number) {
    const ctx = this.ctx;

    // Pole
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cp.x + 12, cp.y, 6, cp.h);

    // Ball top
    ctx.fillStyle = cp.activated ? '#fbbf24' : '#cbd5e1';
    ctx.beginPath();
    ctx.arc(cp.x + 15, cp.y - 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Waving banner flag
    const wave = Math.sin(time * 6) * 4;
    ctx.fillStyle = cp.activated ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.moveTo(cp.x + 18, cp.y + 4);
    ctx.quadraticCurveTo(cp.x + 32, cp.y + 10 + wave, cp.x + 46, cp.y + 12);
    ctx.lineTo(cp.x + 46, cp.y + 26);
    ctx.quadraticCurveTo(cp.x + 32, cp.y + 24 + wave, cp.x + 18, cp.y + 24);
    ctx.closePath();
    ctx.fill();
  }

  private drawExitPortal(exit: LevelData['exit'], time: number) {
    const ctx = this.ctx;

    if (!exit.active) {
      // Locked portal arch
      ctx.fillStyle = '#334155';
      ctx.fillRect(exit.x, exit.y, 16, exit.h);
      ctx.fillRect(exit.x + exit.w - 16, exit.y, 16, exit.h);
      ctx.fillRect(exit.x, exit.y, exit.w, 18);
      return;
    }

    // Active swirling Starlight Gateway Arch
    // Left & right pillars
    ctx.fillStyle = '#475569';
    ctx.fillRect(exit.x, exit.y, 14, exit.h);
    ctx.fillRect(exit.x + exit.w - 14, exit.y, 14, exit.h);
    ctx.fillRect(exit.x, exit.y, exit.w, 18);

    // Cosmic portal swirl
    const swirlGrad = ctx.createRadialGradient(
      exit.x + exit.w / 2,
      exit.y + exit.h / 2,
      5,
      exit.x + exit.w / 2,
      exit.y + exit.h / 2,
      40
    );
    swirlGrad.addColorStop(0, '#fef08a');
    swirlGrad.addColorStop(0.4, '#38bdf8');
    swirlGrad.addColorStop(0.8, '#a855f7');
    swirlGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = swirlGrad;
    ctx.fillRect(exit.x + 14, exit.y + 18, exit.w - 28, exit.h - 18);

    // Spinning starlight core
    ctx.save();
    ctx.translate(exit.x + exit.w / 2, exit.y + exit.h / 2);
    ctx.rotate(time * 2);
    ctx.fillStyle = '#ffffff';
    for (let r = 0; r < 4; r++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(-2, -18, 4, 36);
    }
    ctx.restore();
  }

  // -----------------------------------------------------------------
  // HAZARDS
  // -----------------------------------------------------------------
  private drawHazards(hazards: Hazard[], time: number) {
    const ctx = this.ctx;

    for (let i = 0; i < hazards.length; i++) {
      const h = hazards[i];

      if (h.type === 'lava') {
        // Bubbling lava pool
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(h.x, h.y, h.w, h.h);

        // Surface waves
        ctx.fillStyle = '#f97316';
        for (let x = h.x; x < h.x + h.w - 10; x += 24) {
          const wave = Math.sin(time * 5 + x * 0.1) * 4;
          ctx.beginPath();
          ctx.arc(x + 12, h.y + 4 + wave, 8, 0, Math.PI);
          ctx.fill();
        }

        // Lava glow
        ctx.fillStyle = '#fef08a';
        for (let x = h.x + 8; x < h.x + h.w - 20; x += 40) {
          const bubble = Math.sin(time * 6 + x) * 3;
          if (bubble > 1) {
            ctx.beginPath();
            ctx.arc(x, h.y + 2, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (h.type === 'spikes') {
        // Sharp metallic spikes
        ctx.fillStyle = '#94a3b8';
        for (let x = h.x; x < h.x + h.w; x += 16) {
          ctx.beginPath();
          ctx.moveTo(x, h.y + h.h);
          ctx.lineTo(x + 8, h.y);
          ctx.lineTo(x + 16, h.y + h.h);
          ctx.closePath();
          ctx.fill();

          // Glint
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 4, h.y + h.h);
          ctx.lineTo(x + 8, h.y);
          ctx.stroke();
        }
      }
    }
  }

  // -----------------------------------------------------------------
  // PROJECTILES
  // -----------------------------------------------------------------
  private drawProjectiles(projectiles: Projectile[], time: number) {
    const ctx = this.ctx;

    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i];

      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);

      if (p.fromPlayer) {
        // Starlight energy blast
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 3, 0, Math.PI * 2);
        ctx.fill();

        // Cross rays
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-p.w * 0.8, 0);
        ctx.lineTo(p.w * 0.8, 0);
        ctx.moveTo(0, -p.h * 0.8);
        ctx.lineTo(0, p.h * 0.8);
        ctx.stroke();
      } else {
        // Boss fireball
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // -----------------------------------------------------------------
  // ENEMIES & BOSS
  // -----------------------------------------------------------------
  private drawEnemies(enemies: Enemy[], time: number) {
    const ctx = this.ctx;

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];

      if (e.isDead && e.deadTimer > 0.45) continue;

      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);

      if (e.isDead) {
        // Squashed / KO effect
        ctx.scale(1.4, 0.25);
        ctx.translate(0, e.h * 0.8);
      }

      if (e.facing === 'left') {
        ctx.scale(-1, 1);
      }

      switch (e.type) {
        case 'pompom':
          this.drawPompom(ctx, e, time);
          break;
        case 'voador':
          this.drawVoador(ctx, e, time);
          break;
        case 'cristalino':
          this.drawCristalino(ctx, e, time);
          break;
        case 'morcego':
          this.drawMorcego(ctx, e, time);
          break;
        case 'chaminho':
          this.drawChaminho(ctx, e, time);
          break;
        case 'boss':
          this.drawBossIgnis(ctx, e, time);
          break;
      }

      ctx.restore();
    }
  }

  private drawPompom(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
    // Cute acorn woodland creature
    const walkBob = Math.sin(time * 12) * 2;

    // Feet
    ctx.fillStyle = '#713f12';
    ctx.beginPath();
    ctx.ellipse(-6, 12, 5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(6, 12, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Round body
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, 0 + walkBob, 14, 0, Math.PI * 2);
    ctx.fill();

    // Acorn cap
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, -6 + walkBob, 14, Math.PI, 0);
    ctx.fill();

    // Little leaf sprout
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(2, -18 + walkBob, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Expressive Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(5, 0 + walkBob, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(6, 0 + walkBob, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawVoador(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
    // Winged buzz-beetle
    const wingFlap = Math.sin(time * 20);

    // Wings
    ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
    ctx.beginPath();
    ctx.ellipse(-4, -8 + wingFlap * 4, 12, 5, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Stripes
    ctx.fillStyle = '#713f12';
    ctx.fillRect(-2, -10, 4, 20);

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, -2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(7, -2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCristalino(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
    // Armored crystal shell crawler
    if (e.state === 'shell') {
      // Spinning shell
      ctx.rotate(time * 16);
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#a855f7';
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(-3, -13, 6, 6);
      }
      return;
    }

    // Walking crystal shell crawler
    // Feet
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, 8, 6, 5);
    ctx.fillRect(4, 8, 6, 5);

    // Body & gem shell
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    // Spiky crystal ridges on back
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(-6, -12);
    ctx.lineTo(0, -20);
    ctx.lineTo(6, -12);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(7, -1, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawMorcego(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
    // Shadow bat
    const flap = Math.sin(time * 14) * 6;

    // Bat wings
    ctx.fillStyle = '#581c87';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-18, -4 + flap);
    ctx.lineTo(-8, 6 + flap);
    ctx.lineTo(0, 0);
    ctx.lineTo(18, -4 + flap);
    ctx.lineTo(8, 6 + flap);
    ctx.closePath();
    ctx.fill();

    // Round bat head
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(-8, -14);
    ctx.lineTo(-2, -8);
    ctx.moveTo(6, -6);
    ctx.lineTo(8, -14);
    ctx.lineTo(2, -8);
    ctx.fill();

    // Glowing red eyes
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(3, -1, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawChaminho(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
    // Cute flame crawler
    const flame = Math.sin(time * 16) * 3;

    // Flame body
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(-10, 10);
    ctx.quadraticCurveTo(-14, -4, 0 + flame, -18);
    ctx.quadraticCurveTo(14, -4, 10, 10);
    ctx.closePath();
    ctx.fill();

    // Inner bright yellow flame
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.quadraticCurveTo(-8, 0, 0 + flame * 0.5, -10);
    ctx.quadraticCurveTo(8, 0, 6, 8);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.ellipse(3, 2, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawBossIgnis(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
    const isVulnerable = e.state === 'vulnerable';
    const isEnraged = (e.hp || 0) <= 4;
    const hitFlash = (e.invulnerableTimer || 0) > 0;

    // Hit flash
    if (hitFlash) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Heavy basalt rock body
    ctx.fillStyle = isVulnerable ? '#475569' : '#1c1917';
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fill();

    // Horned volcanic crown
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.moveTo(-28, -25);
    ctx.lineTo(-38, -50);
    ctx.lineTo(-14, -34);
    ctx.lineTo(0, -48);
    ctx.lineTo(14, -34);
    ctx.lineTo(38, -50);
    ctx.lineTo(28, -25);
    ctx.closePath();
    ctx.fill();

    // Glowing magma veins / cooling cracks
    ctx.strokeStyle = isVulnerable ? '#06b6d4' : isEnraged ? '#fef08a' : '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-20, -10);
    ctx.lineTo(0, 5);
    ctx.lineTo(24, -8);
    ctx.moveTo(-15, 12);
    ctx.lineTo(10, 20);
    ctx.stroke();

    // Glowing core in chest (target weak spot when vulnerable!)
    const coreGrad = ctx.createRadialGradient(0, 8, 2, 0, 8, 16);
    if (isVulnerable) {
      coreGrad.addColorStop(0, '#67e8f9');
      coreGrad.addColorStop(0.8, '#0891b2');
      coreGrad.addColorStop(1, 'transparent');
    } else {
      coreGrad.addColorStop(0, '#fef08a');
      coreGrad.addColorStop(0.6, '#f97316');
      coreGrad.addColorStop(1, '#dc2626');
    }
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 8, 15, 0, Math.PI * 2);
    ctx.fill();

    // Glowing eyes
    ctx.fillStyle = isVulnerable ? '#38bdf8' : isEnraged ? '#facc15' : '#ef4444';
    ctx.beginPath();
    ctx.ellipse(-14, -10, 5, 7, -Math.PI / 8, 0, Math.PI * 2);
    ctx.ellipse(14, -10, 5, 7, Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // -----------------------------------------------------------------
  // PLAYER (AURI)
  // -----------------------------------------------------------------
  private drawPlayer(p: Player, time: number) {
    const ctx = this.ctx;

    // Flicker if invulnerable
    if (p.invulnerableTimer > 0 && Math.floor(time * 30) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);

    // Squash & Stretch
    ctx.scale(p.squashX, p.squashY);

    if (p.facing === 'left') {
      ctx.scale(-1, 1);
    }

    // SPEED BOOTS AURA
    if (p.hasBoots) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      ctx.ellipse(-10, 8, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // MAGIC SHIELD BUBBLE
    if (p.hasShield) {
      const shieldGlow = Math.sin(time * 6) * 0.15 + 0.85;
      ctx.strokeStyle = `rgba(251, 191, 36, ${shieldGlow})`;
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Small rotating star on shield
      ctx.save();
      ctx.rotate(time * 3);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(18, -3, 6, 6);
      ctx.restore();
    }

    // Running leg animation
    const runFrame = p.walkFrame % (Math.PI * 2);
    const legL = Math.sin(runFrame) * 7;
    const legR = -Math.sin(runFrame) * 7;

    // Legs / Boots
    ctx.fillStyle = p.hasBoots ? '#10b981' : '#3b82f6'; // Emerald boots or classic blue
    ctx.beginPath();
    ctx.ellipse(-5 + legL * 0.5, 13, 4, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(5 + legR * 0.5, 13, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Adventurer Tunic / Body
    ctx.fillStyle = p.hasCrystal ? '#0284c7' : '#2563eb';
    ctx.beginPath();
    ctx.roundRect(-8, -2, 16, 14, 4);
    ctx.fill();

    // Golden Belt
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-8, 5, 16, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, 5, 4, 3); // Buckle

    // Red Adventurer Scarf
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(0, -3, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Scarf tail trailing behind
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.lineTo(-12, -4 + Math.sin(time * 10) * 3);
    ctx.lineTo(-10, 2);
    ctx.closePath();
    ctx.fill();

    // Head / Face
    ctx.fillStyle = '#fed7aa'; // Warm peach skin
    ctx.beginPath();
    ctx.arc(0, -6, 9, 0, Math.PI * 2);
    ctx.fill();

    // Large friendly eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(3, -6, 2.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, -7, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Star Wanderer Pointed Hat
    ctx.fillStyle = p.hasCrystal ? '#06b6d4' : '#1d4ed8';
    ctx.beginPath();
    ctx.moveTo(-10, -11);
    ctx.quadraticCurveTo(0, -14, 10, -11);
    ctx.lineTo(-4, -26);
    ctx.closePath();
    ctx.fill();

    // Hat brim
    ctx.strokeStyle = p.hasCrystal ? '#67e8f9' : '#60a5fa';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, -11, 11, 3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Glowing Star Badge on Hat
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, -16, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // -----------------------------------------------------------------
  // PARTICLES
  // -----------------------------------------------------------------
  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const alpha = Math.max(0, p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.shape === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // -----------------------------------------------------------------
  // FLOATING TEXT
  // -----------------------------------------------------------------
  private drawFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;

    for (let i = 0; i < texts.length; i++) {
      const t = texts[i];
      ctx.save();
      ctx.globalAlpha = t.opacity;
      ctx.font = 'bold 16px "Fredoka", sans-serif';
      ctx.textAlign = 'center';

      // Outline
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, t.y);

      // Fill
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }
}
