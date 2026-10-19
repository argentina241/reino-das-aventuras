/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkAABBOverlap,
  isStompAttack,
  updateCoyoteAndBuffer,
  resolveHorizontalCollision,
  resolveVerticalCollision,
  resolveOneWayPlatforms,
  calculateScoreForAction
} from './physics.ts';

test('checkAABBOverlap detects overlapping rectangles', () => {
  const r1 = { x: 10, y: 10, w: 20, h: 20 };
  const r2 = { x: 25, y: 25, w: 20, h: 20 };
  const r3 = { x: 100, y: 100, w: 20, h: 20 };

  assert.equal(checkAABBOverlap(r1, r2), true, 'r1 and r2 should overlap');
  assert.equal(checkAABBOverlap(r1, r3), false, 'r1 and r3 should not overlap');
});

test('isStompAttack correctly validates falling stomp onto enemy', () => {
  const enemy = { x: 50, y: 100, w: 32, h: 32 };

  // Case 1: Player falling downward with feet landing near enemy top
  const fallingPlayer = { x: 52, y: 75, w: 28, h: 28 }; // bottom = 103, enemy top = 100
  assert.equal(isStompAttack(fallingPlayer, 150, enemy), true, 'Falling player should register stomp');

  // Case 2: Player moving upward cannot stomp
  assert.equal(isStompAttack(fallingPlayer, -150, enemy), false, 'Rising player should not stomp');

  // Case 3: Player hitting side or bottom of enemy cannot stomp
  const sidePlayer = { x: 20, y: 110, w: 28, h: 28 };
  assert.equal(isStompAttack(sidePlayer, 150, enemy), false, 'Side collision should not stomp');
});

test('coyote time and jump buffer permit responsive jumps', () => {
  // Scenario 1: Just walked off ledge (isGrounded becomes false)
  // Coyote window is active
  const c1 = updateCoyoteAndBuffer(false, true, 0.1, 0, 0.02);
  assert.equal(c1.canExecuteJump, true, 'Should jump within coyote time window');

  // Scenario 2: Coyote window expired
  const c2 = updateCoyoteAndBuffer(false, true, 0.0, 0, 0.02);
  assert.equal(c2.canExecuteJump, false, 'Should not jump when coyote time expired');

  // Scenario 3: Pre-pressed jump before landing (buffered jump)
  const c3 = updateCoyoteAndBuffer(false, true, 0.0, 0.0, 0.02);
  assert.equal(c3.jumpBufferTimer > 0, true, 'Jump buffer timer should be set');
});

test('resolveHorizontalCollision prevents walking through solid walls', () => {
  const player = { x: 80, y: 100, w: 24, h: 32 };
  const wall = { x: 100, y: 100, w: 32, h: 64 };

  const res = resolveHorizontalCollision(player, 25, [wall]);
  assert.equal(res.collided, true, 'Should detect collision with wall');
  assert.equal(res.x, wall.x - player.w, 'Should stop exactly at wall left edge');
});

test('resolveVerticalCollision prevents falling through ground and detects landing', () => {
  const player = { x: 100, y: 180, w: 24, h: 32 };
  const floor = { x: 50, y: 200, w: 200, h: 32 };

  const res = resolveVerticalCollision(player, 10, [floor]); // player bottom lands at 222 -> hits 200
  assert.equal(res.landed, true, 'Player should land on top of floor');
  assert.equal(res.y, floor.y - player.h, 'Player Y should be aligned on floor surface');
});

test('resolveOneWayPlatforms allows passing from beneath and lands from above', () => {
  const platform = { x: 50, y: 200, w: 100, h: 16 };

  // Falling from above platform
  const fallingPlayer = { x: 60, y: 201 - 32, w: 24, h: 32 }; // prev bottom was 195, now at 201
  const landRes = resolveOneWayPlatforms(fallingPlayer, 195 - 32, [platform]);
  assert.equal(landRes.landed, true, 'Should land on one-way platform from above');
  assert.equal(landRes.y, platform.y - fallingPlayer.h, 'Should align on platform top');
});

test('calculateScoreForAction awards correct points', () => {
  assert.equal(calculateScoreForAction('coin'), 100);
  assert.equal(calculateScoreForAction('stomp'), 200);
  assert.equal(calculateScoreForAction('boss_kill'), 5000);
});
