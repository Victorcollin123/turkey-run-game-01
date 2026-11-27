// turkey.js — Tom the turkey: run, jump, duck, hide, sprint.
// One job: the player's body and how it answers the controls.

import { GROUND_Y, MAX_LIVES, TUNE } from './config.js';

export function createTurkey() {
  return {
    x: 260,
    y: GROUND_Y - 74,
    w: 64,
    h: 74,
    vy: 0,
    onGround: true,
    ducking: false,
    hiding: false,
    sprinting: false,
    stamina: TUNE.staminaMax,
    lives: MAX_LIVES,
    invulnerable: 0,
    featherTime: 0, // golden-feather grace: fast + untouchable
    animTime: 0, // drives the run-cycle drawing
    mudSlow: 0, // seconds of mud drag left
    distance: 0,
    score: 0,
    corn: 0,
    feathers: 0,
    combo: 0,
    bestCombo: 0,
  };
}

export function turkeyHitbox(t) {
  // Ducking shrinks the box; hiding tucks Tom inside the haystack.
  if (t.hiding) return { x: t.x + 8, y: t.y + 30, w: 48, h: 40 };
  if (t.ducking) return { x: t.x + 4, y: t.y + 34, w: 56, h: 40 };
  return { x: t.x + 6, y: t.y, w: 52, h: t.h };
}

// Returns events the main loop turns into sound and feedback:
// 'jump' | 'land' | 'hide' | 'unhide'.
export function updateTurkey(t, input, dt, speed) {
  const events = [];
  t.animTime += dt * (t.sprinting ? 1.6 : 1);
  if (t.invulnerable > 0) t.invulnerable -= dt;
  if (t.featherTime > 0) t.featherTime -= dt;
  if (t.mudSlow > 0) t.mudSlow -= dt;

  // Sprint: Shift while there is stamina to burn.
  const wantSprint = input.held('sprint') && t.stamina > 1 && !t.ducking && !t.hiding;
  t.sprinting = wantSprint && t.featherTime <= 0 ? true : t.featherTime > 0;
  if (input.held('sprint') && t.stamina > 1 && !t.ducking && !t.hiding) {
    t.stamina = Math.max(0, t.stamina - TUNE.staminaDrain * dt);
  } else {
    t.stamina = Math.min(TUNE.staminaMax, t.stamina + TUNE.staminaRegen * dt);
  }

  // Steer: left and right shift the turkey along the ground so a falling
  // carving knife can be dodged. The run itself never stops.
  const moveSpeed = 300;
  if (input.held('left')) t.x = Math.max(140, t.x - moveSpeed * dt);
  if (input.held('right')) t.x = Math.min(560, t.x + moveSpeed * dt);

  // Jump: only from the ground, never while hiding.
  if (input.wasPressed('up') && t.onGround && !t.hiding) {
    t.vy = -TUNE.jumpVelocity;
    t.onGround = false;
    t.ducking = false;
    events.push('jump');
  }

  // Duck: hold Down on the ground. Hiding is handled by the main loop
  // (it needs to know a haystack is near).
  t.ducking = input.held('down') && t.onGround && !t.hiding;

  // Gravity and landing.
  if (!t.onGround) {
    t.vy += TUNE.gravity * dt;
    t.y += t.vy * dt;
    if (t.y >= GROUND_Y - t.h) {
      t.y = GROUND_Y - t.h;
      t.vy = 0;
      t.onGround = true;
      events.push('land');
    }
  }

  // Speed the turkey actually covers, after ducking and mud.
  let factor = 1;
  if (t.ducking) factor *= TUNE.duckSpeedFactor;
  if (t.mudSlow > 0) factor *= TUNE.mudSlowFactor;
  if (t.sprinting) factor *= 1 + TUNE.sprintBonus / speed;
  const covered = speed * factor * dt;
  t.distance += covered / 50; // 50 px = 1 metre
  t.score += (covered / 50) * TUNE.scorePerMetre; // 10 points a metre
  return { events, covered };
}

export function hurtTurkey(t) {
  if (t.invulnerable > 0 || t.featherTime > 0 || t.hiding) return false;
  t.lives -= 1;
  t.invulnerable = TUNE.invulnerableTime;
  t.combo = 0;
  return true;
}

export function healTurkey(t) {
  if (t.lives < MAX_LIVES) {
    t.lives += 1;
    t.score += TUNE.lifeScore;
    return true;
  }
  t.score += TUNE.lifeScore;
  return false;
}
