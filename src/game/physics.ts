/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Rect, Player } from './types.ts';

/**
 * Checks if two axis-aligned bounding boxes overlap.
 */
export function checkAABBOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * Checks if two bounding boxes with a margin overlap.
 */
export function checkAABBOverlapMargin(a: Rect, b: Rect, margin: number): boolean {
  return (
    a.x + margin < b.x + b.w &&
    a.x + a.w - margin > b.x &&
    a.y + margin < b.y + b.h &&
    a.y + a.h - margin > b.y
  );
}

/**
 * Checks if player is stomping on top of an enemy.
 * Conditions: player's downward velocity > 0, player's feet near or above the upper half of enemy,
 * and horizontal overlap is significant.
 */
export function isStompAttack(player: Rect, playerVy: number, enemy: Rect): boolean {
  if (playerVy <= 0) return false;
  const playerBottom = player.y + player.h;
  const enemyCenterY = enemy.y + enemy.h * 0.6;
  const enemyTop = enemy.y;
  
  // Player bottom should be above enemy center and not way above enemy top
  const verticalTolerance = 14;
  const isAbove = playerBottom <= enemyCenterY && playerBottom >= enemyTop - verticalTolerance;
  
  // Horizontal overlap
  const horizontalOverlap =
    player.x + player.w * 0.7 > enemy.x &&
    player.x + player.w * 0.3 < enemy.x + enemy.w;

  return isAbove && horizontalOverlap;
}

/**
 * Updates coyote time and jump input buffer timers.
 */
export function updateCoyoteAndBuffer(
  isGrounded: boolean,
  jumpJustPressed: boolean,
  currentCoyote: number,
  currentBuffer: number,
  dt: number,
  coyoteWindow = 0.12,
  bufferWindow = 0.14
): { coyoteTimer: number; jumpBufferTimer: number; canExecuteJump: boolean } {
  let coyoteTimer = isGrounded ? coyoteWindow : Math.max(0, currentCoyote - dt);
  let jumpBufferTimer = jumpJustPressed ? bufferWindow : Math.max(0, currentBuffer - dt);

  const canExecuteJump = jumpBufferTimer > 0 && coyoteTimer > 0;

  if (canExecuteJump) {
    coyoteTimer = 0;
    jumpBufferTimer = 0;
  }

  return { coyoteTimer, jumpBufferTimer, canExecuteJump };
}

/**
 * Resolves AABB collision with solid obstacles separately on X and Y axes.
 */
export function resolveHorizontalCollision(entity: Rect, vx: number, solids: Rect[]): { x: number; collided: boolean } {
  let newX = entity.x + vx;
  let collided = false;
  const testRect: Rect = { x: newX, y: entity.y, w: entity.w, h: entity.h };

  for (let i = 0; i < solids.length; i++) {
    const s = solids[i];
    if (checkAABBOverlap(testRect, s)) {
      collided = true;
      if (vx > 0) {
        newX = s.x - entity.w;
      } else if (vx < 0) {
        newX = s.x + s.w;
      }
      testRect.x = newX;
    }
  }

  return { x: newX, collided };
}

export function resolveVerticalCollision(
  entity: Rect,
  vy: number,
  solids: Rect[]
): { y: number; landed: boolean; hitCeiling: boolean; hitBlock: Rect | null } {
  let newY = entity.y + vy;
  let landed = false;
  let hitCeiling = false;
  let hitBlock: Rect | null = null;
  const testRect: Rect = { x: entity.x, y: newY, w: entity.w, h: entity.h };

  for (let i = 0; i < solids.length; i++) {
    const s = solids[i];
    if (checkAABBOverlap(testRect, s)) {
      if (vy > 0) {
        // Falling down, landed on top
        newY = s.y - entity.h;
        landed = true;
      } else if (vy < 0) {
        // Jumping up, hit ceiling / block underside
        newY = s.y + s.h;
        hitCeiling = true;
        hitBlock = s;
      }
      testRect.y = newY;
    }
  }

  return { y: newY, landed, hitCeiling, hitBlock };
}

/**
 * Resolves one-way platform landing: only lands if player was above platform top before movement.
 */
export function resolveOneWayPlatforms(
  entity: Rect,
  prevY: number,
  platforms: Rect[]
): { y: number; landed: boolean; platform: Rect | null } {
  const prevBottom = prevY + entity.h;
  const currentBottom = entity.y + entity.h;

  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    // Check horizontal overlap
    if (entity.x + entity.w > p.x + 4 && entity.x < p.x + p.w - 4) {
      // Was strictly above platform top, now at or below
      if (prevBottom <= p.y + 4 && currentBottom >= p.y) {
        return {
          y: p.y - entity.h,
          landed: true,
          platform: p,
        };
      }
    }
  }

  return { y: entity.y, landed: false, platform: null };
}

/**
 * Calculates score earned for actions.
 */
export function calculateScoreForAction(action: 'coin' | 'stomp' | 'projectile_kill' | 'crystal' | 'boss_hit' | 'boss_kill' | 'stage_clear'): number {
  switch (action) {
    case 'coin':
      return 100;
    case 'stomp':
      return 200;
    case 'projectile_kill':
      return 150;
    case 'crystal':
      return 300;
    case 'boss_hit':
      return 500;
    case 'boss_kill':
      return 5000;
    case 'stage_clear':
      return 2000;
    default:
      return 50;
  }
}
