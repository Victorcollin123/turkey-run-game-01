// farmer.js — Farmer Bram: chases, searches, and corners Tom.
// One job: the chaser's brain — three moods, one appetite.

import { GROUND_Y, TUNE } from './config.js';

export const FARMER_CHASE = 'chase';
export const FARMER_SEARCH = 'search';
export const FARMER_CORNER = 'corner';

export function createFarmer() {
  return {
    x: 260 - TUNE.farmerStartGap,
    y: GROUND_Y - 108,
    w: 78,
    h: 108,
    gap: TUNE.farmerStartGap, // px behind the turkey
    mood: FARMER_CHASE,
    moodTime: 0,
    searchTime: 0,
    animTime: 0,
    spotted: false, // flashing "SPOTTED!" warning
    cornered: false,
  };
}

// Returns events: 'spotted' when Bram first closes in, 'search' when he
// starts looking through a haystack, 'giveup' when he loses the trail.
export function updateFarmer(f, dt, turkey, speed, inKitchen) {
  const events = [];
  f.animTime += dt;
  f.moodTime += dt;

  if (f.mood === FARMER_SEARCH) {
    // Bram stands at the haystack, poking it with his pitchfork.
    f.searchTime -= dt;
    if (f.searchTime <= 0) {
      f.mood = FARMER_CHASE;
      f.moodTime = 0;
      f.gap += TUNE.hideFarmerLoss; // Tom slipped away while he searched
      events.push('giveup');
    }
    return { events };
  }

  // Cornered: in the kitchen Bram cuts across the yard — he gains fast.
  const closing = f.mood === FARMER_CORNER ? TUNE.farmerCloseRate * 2.1 : TUNE.farmerCloseRate;
  if (turkey.hiding) {
    // Tom is hidden: Bram slows to a prowl, then starts searching.
    f.gap += TUNE.farmerFallRate * 0.4 * dt;
    if (f.moodTime > 1.2) {
      f.mood = FARMER_SEARCH;
      f.searchTime = TUNE.searchTime;
      f.moodTime = 0;
      events.push('search');
    }
  } else if (turkey.sprinting || turkey.featherTime > 0) {
    f.gap += TUNE.farmerFallRate * dt;
  } else if (turkey.ducking || turkey.mudSlow > 0) {
    f.gap -= closing * dt;
  } else {
    // A fair run: Bram gains a little when Tom is slow, loses when fast.
    const drift = speed < 330 ? closing * 0.55 : -TUNE.farmerFallRate * 0.5;
    f.gap += drift * dt;
  }

  // Kitchen corner event: once per kitchen visit Bram tries to cut Tom off.
  if (inKitchen && !f.cornered && f.moodTime > 6 && f.gap < 130) {
    f.mood = FARMER_CORNER;
    f.moodTime = 0;
    f.cornered = true;
    events.push('spotted');
  }
  if (f.mood === FARMER_CORNER && f.moodTime > 2.2) {
    f.mood = FARMER_CHASE;
    f.moodTime = 0;
  }

  f.gap = Math.max(-10, Math.min(420, f.gap));
  // Bram stays in frame: when the gap is wide he runs just off the left
  // edge instead of vanishing, so the chase always reads on screen.
  f.x = Math.max(-24, turkey.x - f.gap - f.w + 20);

  // Spotted warning: Bram is close enough to smell the gravy.
  const wasSpotted = f.spotted;
  f.spotted = f.gap < 70 && f.mood !== FARMER_SEARCH;
  if (f.spotted && !wasSpotted) events.push('spotted');

  return { events };
}

export function farmerCaught(f) {
  return f.gap <= TUNE.farmerCatchGap;
}
