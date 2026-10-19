/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GameState,
  LevelData,
  Player,
  Enemy,
  Block,
  CoinPickup,
  MovingPlatform,
  Particle,
  FloatingText,
  Projectile,
  PowerUpItem,
  GameSaveData
} from './types.ts';
import { getLevelData } from './levels.ts';
import {
  checkAABBOverlap,
  isStompAttack,
  updateCoyoteAndBuffer,
  resolveHorizontalCollision,
  resolveVerticalCollision,
  resolveOneWayPlatforms,
  calculateScoreForAction
} from './physics.ts';
import { GameRenderer } from './renderer.ts';
import { sound } from '../audio/soundEngine.ts';

export interface HudState {
  lives: number;
  score: number;
  coins: number;
  hasShield: boolean;
  hasCrystal: boolean;
  crystalTimer: number;
  hasBoots: boolean;
  bootsTimer: number;
  levelTitle: string;
  levelSubtitle: string;
  isMuted: boolean;
  bossHp: number | null;
  bossMaxHp: number | null;
  bossName: string | null;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: GameRenderer;

  public state: GameState = 'title';
  public currentLevelId: number = 1;
  public level: LevelData;
  public player: Player;

  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  private cameraX: number = 0;
  private cameraY: number = 0;
  private screenShake: number = 0;
  private hitstopTimer: number = 0;
  private gameTime: number = 0;

  // Input state
  public keys = {
    left: false,
    right: false,
    jump: false,
    attack: false,
  };
  private jumpJustPressed = false;
  private attackJustPressed = false;

  // Animation frame id
  private rafId: number | null = null;
  private lastTime: number = 0;

  // Callbacks to UI
  private onStateChange: (state: GameState) => void;
  private onHudChange: (hud: HudState) => void;
  private onSaveChange?: (save: GameSaveData) => void;

  // Save data
  public saveData: GameSaveData = {
    unlockedLevel: 1,
    highScore: 0,
    totalCoins: 0,
    soundMuted: false,
  };

  constructor(
    canvas: HTMLCanvasElement,
    onStateChange: (state: GameState) => void,
    onHudChange: (hud: HudState) => void,
    onSaveChange?: (save: GameSaveData) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.renderer = new GameRenderer(this.canvas, this.ctx);
    this.onStateChange = onStateChange;
    this.onHudChange = onHudChange;
    this.onSaveChange = onSaveChange;

    this.loadSaveData();
    this.level = getLevelData(this.currentLevelId);
    this.player = this.createInitialPlayer(this.level.playerStart.x, this.level.playerStart.y);

    this.bindEvents();
    this.resizeCanvas();
  }

  private loadSaveData() {
    try {
      const data = localStorage.getItem('reino_save_data');
      if (data) {
        const parsed = JSON.parse(data);
        this.saveData = { ...this.saveData, ...parsed };
      }
      this.onSaveChange?.(this.saveData);
    } catch {
      // Ignore
    }
  }

  public saveProgress() {
    try {
      localStorage.setItem('reino_save_data', JSON.stringify(this.saveData));
      this.onSaveChange?.(this.saveData);
    } catch {
      // Ignore
    }
  }

  public resetProgress() {
    this.saveData = {
      unlockedLevel: 1,
      highScore: 0,
      totalCoins: 0,
      soundMuted: sound.getMuted(),
    };
    this.saveProgress();
    this.currentLevelId = 1;
  }

  private createInitialPlayer(x: number, y: number): Player {
    return {
      x,
      y,
      w: 24,
      h: 32,
      vx: 0,
      vy: 0,
      facing: 'right',
      isGrounded: false,
      isJumping: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      squashX: 1,
      squashY: 1,
      walkFrame: 0,
      invulnerableTimer: 0,
      lives: 3,
      score: 0,
      coins: 0,
      hasShield: false,
      hasCrystal: false,
      crystalTimer: 0,
      hasBoots: false,
      bootsTimer: 0,
      isDead: false,
      deathTimer: 0,
      winState: false,
    };
  }

  public resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth || window.innerWidth;
      this.canvas.height = parent.clientHeight || window.innerHeight;
    }
  }

  private bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        this.keys.jump = true;
        this.jumpJustPressed = true;
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        this.keys.left = true;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        this.keys.right = true;
      }
      if (['KeyX', 'KeyK', 'KeyF'].includes(e.code)) {
        this.keys.attack = true;
        this.attackJustPressed = true;
      }
      if (['Escape', 'KeyP'].includes(e.code)) {
        if (this.state === 'playing') {
          this.setState('paused');
        } else if (this.state === 'paused') {
          this.setState('playing');
        }
      }
      if (['KeyM'].includes(e.code)) {
        this.toggleMute();
      }
      if (this.state === 'title' && ['Space', 'Enter'].includes(e.code)) {
        this.startLevel(this.currentLevelId);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        this.keys.jump = false;
        // Variable jump height cut
        if (this.player.vy < -120) {
          this.player.vy *= 0.45;
        }
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        this.keys.left = false;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        this.keys.right = false;
      }
      if (['KeyX', 'KeyK', 'KeyF'].includes(e.code)) {
        this.keys.attack = false;
      }
    });

    window.addEventListener('blur', () => {
      this.clearHeldKeys();
    });
  }

  public clearHeldKeys() {
    this.keys.left = false;
    this.keys.right = false;
    this.keys.jump = false;
    this.keys.attack = false;
    this.jumpJustPressed = false;
    this.attackJustPressed = false;
  }

  public triggerJumpPress() {
    this.keys.jump = true;
    this.jumpJustPressed = true;
  }

  public triggerJumpRelease() {
    this.keys.jump = false;
    if (this.player.vy < -120) {
      this.player.vy *= 0.45;
    }
  }

  public triggerAttackPress() {
    this.keys.attack = true;
    this.attackJustPressed = true;
  }

  public triggerAttackRelease() {
    this.keys.attack = false;
  }

  public toggleMute() {
    const isMuted = sound.toggleMute();
    this.saveData.soundMuted = isMuted;
    this.saveProgress();
    this.syncHud();
  }

  public setState(newState: GameState) {
    this.state = newState;
    document.body.dataset.state = newState === 'victory' || newState === 'gameover' ? 'gameover' : newState;

    if (newState === 'playing') {
      sound.startMusic(this.currentLevelId);
    } else if (newState === 'paused' || newState === 'title') {
      sound.stopMusic();
    }

    this.onStateChange(newState);
    this.syncHud();
  }

  public startLevel(levelId: number) {
    this.currentLevelId = levelId;
    this.level = getLevelData(levelId);
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.cameraX = 0;
    this.cameraY = 0;
    this.screenShake = 0;
    this.hitstopTimer = 0;

    // Preserve score & coins across levels if continuing, or keep existing
    const prevScore = this.player ? this.player.score : 0;
    const prevCoins = this.player ? this.player.coins : 0;
    const prevLives = this.player ? Math.max(3, this.player.lives) : 3;

    this.player = this.createInitialPlayer(this.level.playerStart.x, this.level.playerStart.y);
    this.player.score = prevScore;
    this.player.coins = prevCoins;
    this.player.lives = prevLives;

    this.clearHeldKeys();
    this.setState('playing');
  }

  public restartCurrentLevel() {
    this.startLevel(this.currentLevelId);
  }

  public startLoop() {
    if (this.rafId !== null) return;
    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      const rawDt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      this.update(dt);
      this.render();

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // -----------------------------------------------------------------
  // UPDATE
  // -----------------------------------------------------------------
  private update(dt: number) {
    this.gameTime += dt;

    if (this.state !== 'playing') {
      // Just update particles / floating text in menus or gameover
      this.updateParticles(dt);
      return;
    }

    // Hitstop freeze handling
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateScreenShake(dt);
      return;
    }

    this.updateScreenShake(dt);
    this.updatePlayer(dt);
    this.updateMovingPlatforms(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateBlocks(dt);
    this.updateCoins(dt);
    this.updatePowerupDrops(dt);
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);
    this.updateCamera(dt);
    this.syncHud();

    // Consume single-frame edge triggers
    this.jumpJustPressed = false;
    this.attackJustPressed = false;
  }

  private updateScreenShake(dt: number) {
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 30);
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    if (p.isDead) {
      p.deathTimer += dt;
      p.vy += 800 * dt;
      p.y += p.vy * dt;
      if (p.deathTimer > 2.0) {
        p.lives--;
        if (p.lives <= 0) {
          this.handleGameOver();
        } else {
          this.respawnAtCheckpoint();
        }
      }
      return;
    }

    // Squash & stretch damping
    p.squashX += (1 - p.squashX) * 10 * dt;
    p.squashY += (1 - p.squashY) * 10 * dt;

    // Timers
    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;

    if (p.hasCrystal) {
      p.crystalTimer -= dt;
      if (p.crystalTimer <= 0) {
        p.hasCrystal = false;
      }
    }

    if (p.hasBoots) {
      p.bootsTimer -= dt;
      if (p.bootsTimer <= 0) {
        p.hasBoots = false;
      }
    }

    // Movement speeds
    const maxSpeed = p.hasBoots ? 340 : 210;
    const accel = p.hasBoots ? 1400 : 1000;
    const friction = 1200;
    const gravity = 1000;

    // Horizontal acceleration
    if (this.keys.left && !this.keys.right) {
      p.vx = Math.max(-maxSpeed, p.vx - accel * dt);
      p.facing = 'left';
      p.walkFrame += dt * 14;
    } else if (this.keys.right && !this.keys.left) {
      p.vx = Math.min(maxSpeed, p.vx + accel * dt);
      p.facing = 'right';
      p.walkFrame += dt * 14;
    } else {
      // Decelerate / friction
      if (p.vx > 0) {
        p.vx = Math.max(0, p.vx - friction * dt);
      } else if (p.vx < 0) {
        p.vx = Math.min(0, p.vx + friction * dt);
      }
    }

    // Jump logic with coyote time & input buffering
    const coyoteRes = updateCoyoteAndBuffer(
      p.isGrounded,
      this.jumpJustPressed,
      p.coyoteTimer,
      p.jumpBufferTimer,
      dt
    );
    p.coyoteTimer = coyoteRes.coyoteTimer;
    p.jumpBufferTimer = coyoteRes.jumpBufferTimer;

    if (coyoteRes.canExecuteJump) {
      const jumpPower = p.hasBoots ? -460 : -420;
      p.vy = jumpPower;
      p.isGrounded = false;
      p.isJumping = true;
      p.squashX = 0.8;
      p.squashY = 1.3;
      sound.playJump();
      this.spawnJumpDust(p.x + p.w / 2, p.y + p.h);
    }

    // Gravity
    p.vy += gravity * dt;
    if (p.vy > 650) p.vy = 650; // Terminal velocity

    // Attack / Shoot projectile
    if (this.attackJustPressed) {
      if (p.hasCrystal) {
        this.shootPlayerProjectile();
      }
    }

    // Save previous Y for one-way platform resolution
    const prevY = p.y;

    // Resolve Horizontal Movement
    const allSolids = [...this.level.solids, ...this.level.blocks];
    const hRes = resolveHorizontalCollision(p, p.vx * dt, allSolids);
    p.x = Math.max(0, Math.min(this.level.width - p.w, hRes.x));
    if (hRes.collided) {
      p.vx = 0;
    }

    // Resolve Vertical Movement
    const vRes = resolveVerticalCollision(p, p.vy * dt, allSolids);
    p.y = vRes.y;

    if (vRes.landed) {
      if (!p.isGrounded) {
        // Landing impact squash
        p.squashX = 1.25;
        p.squashY = 0.75;
      }
      p.vy = 0;
      p.isGrounded = true;
      p.isJumping = false;
    } else {
      p.isGrounded = false;
    }

    if (vRes.hitCeiling) {
      p.vy = 0;
      if (vRes.hitBlock) {
        this.hitBlock(vRes.hitBlock as Block);
      }
    }

    // Check One-Way / Moving Platforms
    if (!vRes.landed && p.vy >= 0) {
      const platRes = resolveOneWayPlatforms(p, prevY, this.level.movingPlatforms);
      if (platRes.landed) {
        p.y = platRes.y;
        p.vy = 0;
        p.isGrounded = true;
        p.isJumping = false;
        // Carry moving platform velocity
        const mp = platRes.platform as MovingPlatform;
        p.x += mp.vx * dt;
      }
    }

    // Check Hazards (Pits, Lava, Spikes)
    this.checkPlayerHazards();

    // Check Checkpoint
    this.checkPlayerCheckpoint();

    // Check Exit Portal
    this.checkPlayerExit();
  }

  private shootPlayerProjectile() {
    const p = this.player;
    const dir = p.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: 'proj_' + Math.random(),
      fromPlayer: true,
      x: dir > 0 ? p.x + p.w + 2 : p.x - 14,
      y: p.y + p.h * 0.4,
      w: 12,
      h: 12,
      vx: dir * 420,
      vy: 0,
      lifeTimer: 2.0,
      damage: 1,
      color: '#38bdf8',
    });
    sound.playShoot();

    // Starlight muzzle particles
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: p.x + (dir > 0 ? p.w : 0),
        y: p.y + p.h * 0.5,
        vx: (Math.random() - 0.5) * 60 + dir * 50,
        vy: (Math.random() - 0.5) * 60,
        life: 0.25,
        maxLife: 0.25,
        size: 3,
        color: '#67e8f9',
        shape: 'star',
      });
    }
  }

  private hitBlock(b: Block) {
    if (b.isHit && b.type === 'question') return;

    sound.playBlockHit();
    b.bumpOffset = 10;

    if (b.type === 'question') {
      b.isHit = true;
      if (b.contains === 'coin') {
        sound.playCoin();
        this.addScore(calculateScoreForAction('coin'));
        this.player.coins++;
        this.saveData.totalCoins++;
        this.saveProgress();
        this.spawnFloatingText('+100', b.x + b.w / 2, b.y - 10, '#fbbf24');
        // Spawn bouncing coin particle
        this.spawnCoinSparkles(b.x + b.w / 2, b.y - 12);
      } else if (['crystal', 'shield', 'boots', 'heart'].includes(b.contains)) {
        this.spawnPowerupFromBlock(b);
      }
    } else if (b.type === 'brick') {
      // Brick bump particles
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: b.x + b.w / 2,
          y: b.y,
          vx: (Math.random() - 0.5) * 140,
          vy: -Math.random() * 120 - 40,
          life: 0.35,
          maxLife: 0.35,
          size: 4,
          color: '#d97706',
          shape: 'square',
        });
      }
    }
  }

  private spawnPowerupFromBlock(b: Block) {
    const pType = b.contains as PowerUpItem['type'];
    b.contains = 'empty';
    this.level.powerups.push({
      id: 'pup_' + Math.random(),
      type: pType,
      x: b.x + 4,
      y: b.y - 28,
      w: 24,
      h: 24,
      vx: 50,
      vy: -150,
      isGrounded: false,
      collected: false,
      emerging: true,
      emergeY: b.y,
    });
    sound.playPowerUp();
  }

  private checkPlayerHazards() {
    const p = this.player;

    // Falling below the world
    if (p.y > this.level.height + 40) {
      this.killPlayer();
      return;
    }

    // Lava and spikes
    for (let i = 0; i < this.level.hazards.length; i++) {
      const h = this.level.hazards[i];
      if (checkAABBOverlap(p, h)) {
        this.damagePlayer();
        break;
      }
    }
  }

  private checkPlayerCheckpoint() {
    const cp = this.level.checkpoint;
    if (!cp.activated && checkAABBOverlap(this.player, cp)) {
      cp.activated = true;
      sound.playCheckpoint();
      this.spawnFloatingText('CHECKPOINT!', cp.x + cp.w / 2, cp.y - 12, '#4ade80');
      // Sparkles
      for (let i = 0; i < 12; i++) {
        this.particles.push({
          x: cp.x + cp.w / 2,
          y: cp.y + 10,
          vx: (Math.random() - 0.5) * 120,
          vy: -Math.random() * 120,
          life: 0.6,
          maxLife: 0.6,
          size: 4,
          color: '#4ade80',
          shape: 'star',
        });
      }
    }
  }

  private checkPlayerExit() {
    const exit = this.level.exit;
    if (exit.active && checkAABBOverlap(this.player, exit) && !this.player.winState) {
      this.player.winState = true;
      this.player.vx = 0;
      sound.playStageClear();
      this.addScore(calculateScoreForAction('stage_clear'));

      // Unlock next level
      if (this.currentLevelId >= this.saveData.unlockedLevel) {
        this.saveData.unlockedLevel = Math.min(3, this.currentLevelId + 1);
        this.saveProgress();
      }

      setTimeout(() => {
        if (this.currentLevelId >= 3) {
          this.setState('victory');
        } else {
          this.startLevel(this.currentLevelId + 1);
        }
      }, 1400);
    }
  }

  public damagePlayer() {
    const p = this.player;
    if (p.invulnerableTimer > 0 || p.isDead) return;

    if (p.hasShield) {
      p.hasShield = false;
      p.invulnerableTimer = 1.0;
      this.screenShake = 12;
      this.hitstopTimer = 0.05;
      sound.playShieldBreak();
      this.spawnFloatingText('ESCUDO QUEBROU!', p.x + p.w / 2, p.y - 14, '#f59e0b');
      return;
    }

    this.killPlayer();
  }

  private killPlayer() {
    const p = this.player;
    p.isDead = true;
    p.deathTimer = 0;
    p.vy = -380;
    p.vx = 0;
    this.screenShake = 14;
    sound.playHurt();
    sound.stopMusic();
  }

  private respawnAtCheckpoint() {
    const p = this.player;
    const cp = this.level.checkpoint;
    const respawnPos = cp.activated
      ? { x: cp.x, y: cp.y }
      : { x: this.level.playerStart.x, y: this.level.playerStart.y };

    p.x = respawnPos.x;
    p.y = respawnPos.y;
    p.vx = 0;
    p.vy = 0;
    p.isDead = false;
    p.deathTimer = 0;
    p.hasShield = false;
    p.hasCrystal = false;
    p.hasBoots = false;
    p.invulnerableTimer = 2.0;

    sound.startMusic(this.currentLevelId);
  }

  private handleGameOver() {
    sound.playGameOver();
    this.setState('gameover');
  }

  // -----------------------------------------------------------------
  // MOVING PLATFORMS UPDATE
  // -----------------------------------------------------------------
  private updateMovingPlatforms(dt: number) {
    for (let i = 0; i < this.level.movingPlatforms.length; i++) {
      const mp = this.level.movingPlatforms[i];
      mp.t += dt * (mp.speed * 0.02);
      const pingPong = (Math.sin(mp.t) + 1) / 2;

      const prevX = mp.x;
      const prevY = mp.y;
      mp.x = mp.startX + (mp.endX - mp.startX) * pingPong;
      mp.y = mp.startY + (mp.endY - mp.startY) * pingPong;

      mp.vx = (mp.x - prevX) / dt;
      mp.vy = (mp.y - prevY) / dt;
    }
  }

  // -----------------------------------------------------------------
  // ENEMIES UPDATE
  // -----------------------------------------------------------------
  private updateEnemies(dt: number) {
    const p = this.player;

    for (let i = 0; i < this.level.enemies.length; i++) {
      const e = this.level.enemies[i];

      if (e.isDead) {
        e.deadTimer += dt;
        continue;
      }

      if (e.invulnerableTimer && e.invulnerableTimer > 0) {
        e.invulnerableTimer -= dt;
      }

      if (e.type === 'boss') {
        this.updateBoss(e, dt);
      } else if (e.type === 'voador') {
        // Sine wave flying beetle
        e.x += e.vx * dt;
        if (e.minX && e.maxX) {
          if (e.x < e.minX) {
            e.vx = Math.abs(e.vx);
            e.facing = 'right';
          } else if (e.x > e.maxX) {
            e.vx = -Math.abs(e.vx);
            e.facing = 'left';
          }
        }
        if (e.startY !== undefined) {
          e.y = e.startY + Math.sin(this.gameTime * 4 + e.x * 0.02) * 20;
        }
      } else if (e.type === 'morcego') {
        // Shadow bat dive attack
        const distToPlayer = Math.abs((p.x + p.w / 2) - (e.x + e.w / 2));
        if (distToPlayer < 180 && p.y > e.y && e.state !== 'dive') {
          e.state = 'dive';
          e.diveTargetY = p.y;
          e.vx = (p.x > e.x ? 1 : -1) * 120;
          e.vy = 160;
          e.facing = p.x > e.x ? 'right' : 'left';
        }

        if (e.state === 'dive') {
          e.x += e.vx * dt;
          e.y += e.vy * dt;
          if (e.y >= (e.diveTargetY || 500) + 10) {
            e.vy = -120; // Fly back up
          }
          if (e.y <= (e.startY || 200)) {
            e.state = 'fly';
            e.vy = 0;
            e.vx = 0;
          }
        }
      } else {
        // Ground patrol (Pompom, Cristalino, Chaminho)
        e.x += e.vx * dt;
        if (e.minX && e.maxX) {
          if (e.x <= e.minX) {
            e.vx = Math.abs(e.vx);
            e.facing = 'right';
          } else if (e.x >= e.maxX) {
            e.vx = -Math.abs(e.vx);
            e.facing = 'left';
          }
        }
      }

      // Check collision with player
      if (!p.isDead && checkAABBOverlap(p, e)) {
        if (isStompAttack(p, p.vy, e)) {
          this.handleStompEnemy(e);
        } else {
          this.damagePlayer();
        }
      }
    }
  }

  private handleStompEnemy(e: Enemy) {
    const p = this.player;

    if (e.type === 'boss') {
      if (e.state === 'vulnerable') {
        this.damageBoss(e, 2);
        p.vy = -420;
      } else {
        this.damagePlayer();
      }
      return;
    }

    sound.playStomp();
    this.hitstopTimer = 0.04;
    p.vy = -380; // Bounce player up
    e.isDead = true;
    e.deadTimer = 0;
    this.addScore(calculateScoreForAction('stomp'));
    this.spawnFloatingText('+200', e.x + e.w / 2, e.y - 10, '#ffffff');

    // Stomp cloud particles
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: e.x + e.w / 2,
        y: e.y + e.h,
        vx: (Math.random() - 0.5) * 120,
        vy: -Math.random() * 60,
        life: 0.3,
        maxLife: 0.3,
        size: 5,
        color: '#e2e8f0',
        shape: 'smoke',
      });
    }
  }

  private updateBoss(boss: Enemy, dt: number) {
    boss.stateTimer = (boss.stateTimer || 0) - dt;

    const p = this.player;
    const isEnraged = (boss.hp || 0) <= 4;
    const chargeSpeed = isEnraged ? 140 : 90;

    if (boss.state === 'charge') {
      // Charge across floor toward player
      boss.facing = p.x < boss.x ? 'left' : 'right';
      boss.vx = boss.facing === 'left' ? -chargeSpeed : chargeSpeed;
      boss.x += boss.vx * dt;

      // Constrain inside arena
      if (boss.minX && boss.x < boss.minX) boss.x = boss.minX;
      if (boss.maxX && boss.x > boss.maxX) boss.x = boss.maxX;

      if ((boss.stateTimer || 0) <= 0) {
        // Transition to Leap & Ground Slam
        boss.state = 'slam';
        boss.stateTimer = 1.8;
        boss.vy = -480;
        sound.playBossRoar();
      }
    } else if (boss.state === 'slam') {
      // High leap and heavy drop
      boss.vy += 850 * dt;
      boss.y += boss.vy * dt;

      if (boss.y >= 520) {
        boss.y = 520;
        boss.vy = 0;
        // Slam ground impact!
        this.screenShake = 22;
        this.hitstopTimer = 0.06;
        sound.playBossHit();

        // Release shockwave fireballs left & right
        this.projectiles.push({
          id: 'bproj_l_' + Math.random(),
          fromPlayer: false,
          x: boss.x - 12,
          y: boss.y + boss.h - 20,
          w: 16,
          h: 16,
          vx: -220,
          vy: 0,
          lifeTimer: 2.2,
          damage: 1,
          color: '#ef4444',
        });
        this.projectiles.push({
          id: 'bproj_r_' + Math.random(),
          fromPlayer: false,
          x: boss.x + boss.w + 12,
          y: boss.y + boss.h - 20,
          w: 16,
          h: 16,
          vx: 220,
          vy: 0,
          lifeTimer: 2.2,
          damage: 1,
          color: '#ef4444',
        });

        // Enter vulnerable cooling state!
        boss.state = 'vulnerable';
        boss.stateTimer = isEnraged ? 2.0 : 3.0;
        this.spawnFloatingText('VULNERÁVEL!', boss.x + boss.w / 2, boss.y - 18, '#38bdf8');
      }
    } else if (boss.state === 'vulnerable') {
      // Cooling down - steam hisses, exposed core
      if ((boss.stateTimer || 0) <= 0) {
        boss.state = 'charge';
        boss.stateTimer = isEnraged ? 2.0 : 3.2;
      }
    }
  }

  private damageBoss(boss: Enemy, amount: number) {
    if ((boss.invulnerableTimer || 0) > 0) return;

    boss.hp = Math.max(0, (boss.hp || 10) - amount);
    boss.invulnerableTimer = 0.6;
    this.screenShake = 16;
    this.hitstopTimer = 0.08;
    sound.playBossHit();
    this.addScore(calculateScoreForAction('boss_hit'));
    this.spawnFloatingText(`-${amount * 500}`, boss.x + boss.w / 2, boss.y - 16, '#f43f5e');

    // Boss hit spark burst
    for (let i = 0; i < 18; i++) {
      this.particles.push({
        x: boss.x + boss.w / 2,
        y: boss.y + boss.h / 2,
        vx: (Math.random() - 0.5) * 200,
        vy: -Math.random() * 150,
        life: 0.5,
        maxLife: 0.5,
        size: 5,
        color: '#fbbf24',
        shape: 'star',
      });
    }

    if (boss.hp <= 0) {
      this.defeatBoss(boss);
    }
  }

  private defeatBoss(boss: Enemy) {
    boss.isDead = true;
    boss.deadTimer = 0;
    this.screenShake = 28;
    this.hitstopTimer = 0.12;
    sound.playBossRoar();
    this.addScore(calculateScoreForAction('boss_kill'));
    this.spawnFloatingText('VITÓRIA!', boss.x + boss.w / 2, boss.y - 24, '#fbbf24');

    // Open Exit Portal in boss arena
    this.level.exit.active = true;

    // Huge explosion particles
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: boss.x + boss.w / 2,
        y: boss.y + boss.h / 2,
        vx: (Math.random() - 0.5) * 320,
        vy: (Math.random() - 0.5) * 320,
        life: 0.9,
        maxLife: 0.9,
        size: 6,
        color: i % 2 === 0 ? '#f59e0b' : '#ef4444',
        shape: 'star',
      });
    }
  }

  // -----------------------------------------------------------------
  // PROJECTILES UPDATE
  // -----------------------------------------------------------------
  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifeTimer -= dt;

      if (p.lifeTimer <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.fromPlayer) {
        // Check collision with enemies & boss
        for (let j = 0; j < this.level.enemies.length; j++) {
          const e = this.level.enemies[j];
          if (e.isDead) continue;
          if (checkAABBOverlap(p, e)) {
            if (e.type === 'boss') {
              this.damageBoss(e, 1);
            } else {
              e.isDead = true;
              e.deadTimer = 0;
              this.addScore(calculateScoreForAction('projectile_kill'));
              sound.playStomp();
              this.spawnFloatingText('+150', e.x + e.w / 2, e.y - 10, '#38bdf8');
            }
            this.projectiles.splice(i, 1);
            break;
          }
        }
      } else {
        // Boss projectile hits player
        if (!this.player.isDead && checkAABBOverlap(p, this.player)) {
          this.damagePlayer();
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  // -----------------------------------------------------------------
  // BLOCKS & COINS & DROPS
  // -----------------------------------------------------------------
  private updateBlocks(dt: number) {
    for (let i = 0; i < this.level.blocks.length; i++) {
      const b = this.level.blocks[i];
      if (b.bumpOffset > 0) {
        b.bumpOffset = Math.max(0, b.bumpOffset - 60 * dt);
      }
    }
  }

  private updateCoins(dt: number) {
    const p = this.player;
    for (let i = 0; i < this.level.coins.length; i++) {
      const c = this.level.coins[i];
      if (c.collected) continue;
      if (checkAABBOverlap(p, c)) {
        c.collected = true;
        sound.playCoin();
        p.coins++;
        this.saveData.totalCoins++;
        this.saveProgress();
        this.addScore(calculateScoreForAction('coin'));
        this.spawnFloatingText('+100', c.x + c.w / 2, c.y - 10, '#fbbf24');
        this.spawnCoinSparkles(c.x + c.w / 2, c.y + c.h / 2);
      }
    }
  }

  private updatePowerupDrops(dt: number) {
    const p = this.player;
    for (let i = this.level.powerups.length - 1; i >= 0; i--) {
      const item = this.level.powerups[i];
      if (item.collected) continue;

      if (item.emerging) {
        item.emergeY -= 40 * dt;
        if (item.emergeY <= item.y) {
          item.emerging = false;
        }
      } else {
        item.vy += 800 * dt;
        item.y += item.vy * dt;
        item.x += item.vx * dt;

        // Floor collision
        const res = resolveVerticalCollision(item, 0, this.level.solids);
        if (res.landed) {
          item.y = res.y;
          item.vy = 0;
          item.isGrounded = true;
        }
      }

      // Collect
      if (checkAABBOverlap(p, item)) {
        item.collected = true;
        sound.playPowerUp();

        switch (item.type) {
          case 'crystal':
            p.hasCrystal = true;
            p.crystalTimer = 20;
            this.addScore(300);
            this.spawnFloatingText('PODER DO CRISTAL!', p.x + p.w / 2, p.y - 16, '#38bdf8');
            break;
          case 'shield':
            p.hasShield = true;
            this.addScore(300);
            this.spawnFloatingText('ESCUDO MÁGICO!', p.x + p.w / 2, p.y - 16, '#f59e0b');
            break;
          case 'boots':
            p.hasBoots = true;
            p.bootsTimer = 18;
            this.addScore(300);
            this.spawnFloatingText('BOTAS VELOZES!', p.x + p.w / 2, p.y - 16, '#10b981');
            break;
          case 'heart':
            p.lives = Math.min(5, p.lives + 1);
            this.addScore(200);
            this.spawnFloatingText('+1 VIDA!', p.x + p.w / 2, p.y - 16, '#ef4444');
            break;
        }

        this.level.powerups.splice(i, 1);
      }
    }
  }

  // -----------------------------------------------------------------
  // PARTICLES & FLOATING TEXTS
  // -----------------------------------------------------------------
  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy * dt;
      t.opacity -= dt * 1.2;
      if (t.opacity <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private spawnJumpDust(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y,
        vx: (Math.random() - 0.5) * 60,
        vy: -Math.random() * 30,
        life: 0.25,
        maxLife: 0.25,
        size: 3,
        color: '#e2e8f0',
        shape: 'smoke',
      });
    }
  }

  private spawnCoinSparkles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 120,
        vy: -Math.random() * 100 - 30,
        life: 0.4,
        maxLife: 0.4,
        size: 4,
        color: '#facc15',
        shape: 'star',
      });
    }
  }

  private spawnFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: 'ft_' + Math.random(),
      text,
      x,
      y,
      vy: -45,
      opacity: 1,
      color,
    });
  }

  private addScore(amount: number) {
    this.player.score += amount;
    if (this.player.score > this.saveData.highScore) {
      this.saveData.highScore = this.player.score;
      this.saveProgress();
    }
  }

  // -----------------------------------------------------------------
  // CAMERA
  // -----------------------------------------------------------------
  private updateCamera(dt: number) {
    const targetX = this.player.x - this.canvas.width * 0.38;
    const maxX = Math.max(0, this.level.width - this.canvas.width);
    const clampedTargetX = Math.max(0, Math.min(maxX, targetX));

    // Smooth camera damping
    this.cameraX += (clampedTargetX - this.cameraX) * 8 * dt;

    // Vertical camera damping bounded
    let targetY = 0;
    if (this.canvas.height > this.level.height) {
      targetY = this.level.height - this.canvas.height + 30;
    } else {
      targetY = Math.max(0, Math.min(this.level.height - this.canvas.height, this.player.y - this.canvas.height * 0.6));
    }
    this.cameraY += (targetY - this.cameraY) * 6 * dt;
  }

  // -----------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------
  public render() {
    this.renderer.render(
      this.level,
      this.player,
      this.cameraX,
      this.cameraY,
      this.particles,
      this.floatingTexts,
      this.projectiles,
      this.screenShake,
      this.gameTime
    );
  }

  // -----------------------------------------------------------------
  // HUD SYNC
  // -----------------------------------------------------------------
  private syncHud() {
    const boss = this.level.enemies.find((e) => e.type === 'boss');
    const hud: HudState = {
      lives: this.player ? this.player.lives : 3,
      score: this.player ? this.player.score : 0,
      coins: this.player ? this.player.coins : 0,
      hasShield: this.player ? this.player.hasShield : false,
      hasCrystal: this.player ? this.player.hasCrystal : false,
      crystalTimer: this.player ? Math.max(0, this.player.crystalTimer) : 0,
      hasBoots: this.player ? this.player.hasBoots : false,
      bootsTimer: this.player ? Math.max(0, this.player.bootsTimer) : 0,
      levelTitle: this.level ? this.level.title : '',
      levelSubtitle: this.level ? this.level.subtitle : '',
      isMuted: sound.getMuted(),
      bossHp: boss && !boss.isDead ? boss.hp || 0 : null,
      bossMaxHp: boss ? boss.maxHp || 10 : null,
      bossName: boss && !boss.isDead ? 'Ignis, Guardião de Lava' : null,
    };
    this.onHudChange(hud);
  }
}
