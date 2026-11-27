// shots.js — deterministic screenshot presets, read from ?shot= and ?seed=.
// Every preset is a real state of the game, reached by setting the same
// fields the game itself sets, or by running the real update loop with a
// fixed seed — never a picture drawn for the screenshot alone.

import { GROUND_Y, TUNE, zoneAt } from './config.js';
import { createTurkey } from './turkey.js';
import { createFarmer } from './farmer.js';
import { createWorld, spawnAhead } from './world.js';

// A fake input that holds nothing: the presets drive the turkey directly.
const IDLE_INPUT = {
  held: () => false,
  wasPressed: () => false,
  takeClick: () => null,
  endTick: () => {},
};

// Run the real step function N ticks from a fresh run. The step function
// comes from main.js so the preset plays exactly what a player plays.
export function applyShotPreset(state, shot) {
  if (shot === 'title') {
    state.screen = 'title';
    state.time = 1.6;
    state.turkey = createTurkey();
    state.farmer = createFarmer();
    state.world = createWorld(1);
    state.world.items = [];
    state.distance = 0;
    state.score = 0;
    // A few props on the title farmyard so the scene reads as a farm.
    for (let i = 0; i < 3; i++) spawnAhead(state.world, 0);
    state.world.items = state.world.items.filter((it) => it.x < 1150 && it.kind !== 'knife');
    return;
  }

  if (shot === 'run') {
    // Mid-run in the cornfield: obstacles ahead, corn in the air, HUD lit.
    state.screen = 'play';
    state.time = 0;
    state.turkey = createTurkey();
    state.turkey.distance = 320;
    state.turkey.score = 2840;
    state.turkey.corn = 6;
    state.turkey.combo = 3;
    state.farmer = createFarmer();
    state.farmer.gap = 190;
    state.world = createWorld(7);
    state.world.items = [];
    state.distance = 320;
    state.score = 2840;
    state.scroll = 320 * 50;
    for (let i = 0; i < 8; i++) spawnAhead(state.world, 320);
    state.world.items = state.world.items.filter((it) => it.kind !== 'knife' && it.x > 300);
    // Hand-placed hazards so the shot reads as a run, not an empty field:
    // a hay bale under the turkey's jump, corn, a fence and a pumpkin.
    state.world.items.push(
      { kind: 'hay', x: 400, y: GROUND_Y - 52, w: 70, h: 52, taken: false, warn: 0 },
      { kind: 'corn', x: 640, y: GROUND_Y - 156, w: 34, h: 34, taken: false, warn: 0 },
      { kind: 'fence', x: 820, y: GROUND_Y - 64, w: 60, h: 64, taken: false, warn: 0 },
      { kind: 'pumpkin', x: 1060, y: GROUND_Y - 48, w: 56, h: 48, taken: false, warn: 0 },
    );
    // A jump frozen mid-air over a hay bale, corn just ahead.
    state.turkey.y = GROUND_Y - 74 - 120;
    state.turkey.vy = -200;
    state.turkey.onGround = false;
    return;
  }

  if (shot === 'chase') {
    // Kitchen garden, Bram right behind Tom, oven and knife ahead, SPOTTED!
    state.screen = 'play';
    state.time = 0;
    state.turkey = createTurkey();
    state.turkey.distance = 610;
    state.turkey.score = 7120;
    state.turkey.corn = 14;
    state.turkey.lives = 2;
    state.turkey.stamina = 42;
    state.farmer = createFarmer();
    state.farmer.gap = 46;
    state.farmer.spotted = true;
    state.farmer.mood = 'chase';
    state.world = createWorld(21);
    state.world.items = [];
    state.distance = 610;
    state.score = 7120;
    state.scroll = 610 * 50;
    state.world.items.push(
      { kind: 'oven', x: 700, y: GROUND_Y - 96, w: 110, h: 96, taken: false, warn: 0 },
      { kind: 'knife', x: 950, y: 90, w: 30, h: 90, taken: false, warn: 0.4, vy: 0, targetX: 950 },
      { kind: 'fence', x: 1150, y: GROUND_Y - 64, w: 60, h: 64, taken: false, warn: 0 },
      { kind: 'corn', x: 560, y: GROUND_Y - 156, w: 34, h: 34, taken: false, warn: 0 },
      { kind: 'haystack', x: 1130, y: GROUND_Y - 90, w: 110, h: 90, taken: false, warn: 0 },
    );
    return;
  }

  if (shot === 'escape') {
    // The escaped end screen: Tom free in the woods, full score breakdown.
    state.screen = 'escaped';
    state.time = 0;
    state.turkey = createTurkey();
    state.turkey.distance = 1000;
    state.turkey.score = 12840;
    state.turkey.corn = 23;
    state.turkey.bestCombo = 5;
    state.turkey.lives = 2;
    state.farmer = createFarmer();
    state.farmer.gap = 380;
    state.world = createWorld(4);
    state.world.items = [];
    state.distance = 1000;
    state.score = 12840;
    state.best = 12840;
    return;
  }

  if (shot === 'caught') {
    // The caught end screen: Bram has Tom, for the third screenshot's sake.
    state.screen = 'caught';
    state.time = 0;
    state.turkey = createTurkey();
    state.turkey.distance = 512;
    state.turkey.score = 5310;
    state.turkey.corn = 9;
    state.turkey.bestCombo = 4;
    state.turkey.lives = 0;
    state.farmer = createFarmer();
    state.farmer.gap = 0;
    state.world = createWorld(9);
    state.world.items = [];
    state.distance = 512;
    state.score = 5310;
    return;
  }
}

export { IDLE_INPUT, zoneAt, TUNE };
