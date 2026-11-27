// world.js — the scrolling farm: obstacles, pickups and hide spots.
// One job: spawn what the turkey meets, move it, and report collisions.

import { GROUND_Y, TUNE, ZONES, zoneAt } from './config.js';
import { chance, range } from './random.js';

// Kinds the spawner can place. w/h are hitbox sizes in px.
const SPAWN_TABLE = [
  { kind: 'hay', weight: 3, w: 70, h: 52 },
  { kind: 'fence', weight: 3, w: 60, h: 64 },
  { kind: 'mud', weight: 2, w: 120, h: 14 },
  { kind: 'pumpkin', weight: 2, w: 56, h: 48 },
  { kind: 'haystack', weight: 1, w: 110, h: 90 }, // hide spot, not a hazard
  { kind: 'corn', weight: 3, w: 34, h: 34 },
  { kind: 'feather', weight: 1, w: 36, h: 30 },
  { kind: 'gravy', weight: 1, w: 36, h: 30 },
];

// Kitchen-zone extras: the oven to jump and the knives that fall.
const KITCHEN_TABLE = [
  { kind: 'oven', weight: 2, w: 110, h: 96 },
  { kind: 'knife', weight: 3, w: 30, h: 90 },
];

export function createWorld(seed) {
  const rng = (function () {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();
  return {
    rng,
    items: [], // {kind, x, y, w, h, taken, warn, vy, ...}
    nextSpawnX: 900,
    distance: 0,
    knives: [], // falling knives: {x, y, vy, warned}
  };
}

function weightedPick(rng, table) {
  let total = 0;
  for (const row of table) total += row.weight;
  let roll = rng() * total;
  for (const row of table) {
    roll -= row.weight;
    if (roll <= 0) return row;
  }
  return table[0];
}

// Spawn one thing just off the right edge, spaced by the zone's density.
export function spawnAhead(world, distance) {
  const zone = zoneAt(distance);
  const gap = range(world.rng, 340, 620) / zone.density;
  const x = world.nextSpawnX;
  world.nextSpawnX = x + gap;
  const table = zone.name === 'KITCHEN GARDEN' ? [...SPAWN_TABLE, ...KITCHEN_TABLE] : SPAWN_TABLE;
  const row = weightedPick(world.rng, table);
  const item = { kind: row.kind, x, w: row.w, h: row.h, taken: false, warn: 0 };
  if (row.kind === 'mud') {
    item.y = GROUND_Y - row.h;
  } else if (row.kind === 'corn' || row.kind === 'feather' || row.kind === 'gravy') {
    // Pickups float at jump height or on the ground, alternating.
    item.y = chance(world.rng, 0.5) ? GROUND_Y - 150 : GROUND_Y - row.h - 6;
  } else if (row.kind === 'knife') {
    // A knife hangs in the air with a warning, then drops.
    item.y = 90;
    item.vy = 0;
    item.warn = TUNE.knifeWarnTime;
    item.targetX = null;
  } else {
    item.y = GROUND_Y - row.h;
  }
  world.items.push(item);
  return item;
}

// Move the world left by dx px; drop what scrolled off; spawn ahead.
export function scrollWorld(world, dx, distance) {
  world.distance = distance;
  for (const it of world.items) it.x -= dx;
  world.items = world.items.filter((it) => it.x + it.w > -80);
  world.nextSpawnX -= dx;
  while (world.nextSpawnX < 1400) spawnAhead(world, distance);
}

// Knives: while warning, hover and track the turkey's x; then fall fast.
export function updateKnives(world, dt, turkeyX) {
  for (const it of world.items) {
    if (it.kind !== 'knife' || it.taken) continue;
    if (it.warn > 0) {
      it.warn -= dt;
      if (it.targetX === null) it.targetX = turkeyX + range(world.rng, -30, 30);
      it.x += (it.targetX - it.x) * Math.min(1, dt * 6);
      if (it.warn <= 0) it.vy = 150;
    } else {
      it.vy = Math.min(1400, it.vy + 5200 * dt);
      it.y += it.vy * dt;
      if (it.y > GROUND_Y - 10) {
        it.taken = true; // stuck in the ground, harmless now
        it.stuck = true;
      }
    }
  }
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function zoneName(distance) {
  return zoneAt(distance).name;
}

export function zoneBlurb(distance) {
  return zoneAt(distance).blurb;
}

export { ZONES };
