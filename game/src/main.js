// main.js — boot, the game loop, and the screens' state machine.
// One job: own the state, step it, and hand it to the renderer.

import { GROUND_Y, TUNE, VIEW, zoneAt } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createTurkey, updateTurkey, turkeyHitbox, hurtTurkey, healTurkey } from './turkey.js';
import { FARMER_SEARCH, createFarmer, farmerCaught, updateFarmer } from './farmer.js';
import { createWorld, rectsOverlap, scrollWorld, spawnAhead, updateKnives } from './world.js';
import { drawFrame } from './render.js';
import { applyShotPreset } from './shots.js';

const params = new URLSearchParams(window.location.search);
const SHOT = params.get('shot');
const SEED = Number(params.get('seed') || '20261127');

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const input = createInput(canvas);
const audio = createAudio();

function bestKey() {
  return 'turkey-run-best';
}

function loadBest() {
  try {
    return Number(window.localStorage.getItem(bestKey()) || '0') || 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    window.localStorage.setItem(bestKey(), String(Math.floor(score)));
  } catch {
    // Private mode or headless: the best score simply does not persist.
  }
}

function newState() {
  return {
    screen: 'title', // title | play | paused | caught | escaped
    time: 0,
    scroll: 0,
    distance: 0,
    score: 0,
    best: loadBest(),
    turkey: createTurkey(),
    farmer: createFarmer(),
    world: createWorld(SEED),
    seed: SEED,
    muted: false,
    flash: null, // {text, until} — one-line feedback ("+100 CORN!")
  };
}

let state = newState();

function startRun() {
  const best = state.best;
  state = newState();
  state.best = best;
  state.screen = 'play';
  audio.unlock();
  audio.gobble();
}

function endRun(escaped) {
  state.screen = escaped ? 'escaped' : 'caught';
  if (state.score > state.best) {
    state.best = Math.floor(state.score);
    saveBest(state.score);
  }
  if (escaped) audio.escaped();
  else audio.caught();
}

// Hiding: Down while a haystack overlaps the turkey tucks Tom inside it.
function nearHaystack() {
  const box = turkeyHitbox(state.turkey);
  return state.world.items.find(
    (it) => it.kind === 'haystack' && !it.taken && rectsOverlap(box, { x: it.x - 10, y: it.y, w: it.w + 20, h: it.h }),
  );
}

function step(dt) {
  state.time += dt;
  const t = state.turkey;

  if (state.screen === 'title') {
    // The title farmyard idles: Tom bobs, Bram lurks at the fence.
    t.animTime += dt;
    if (input.wasPressed('confirm') || input.takeClick()) startRun();
    return;
  }

  if (state.screen === 'paused') {
    if (input.wasPressed('pause') || input.wasPressed('confirm')) state.screen = 'play';
    return;
  }

  if (state.screen === 'caught' || state.screen === 'escaped') {
    const click = input.takeClick();
    if (input.wasPressed('restart') || input.wasPressed('confirm')) startRun();
    else if (click && click.x >= 490 && click.x <= 790 && click.y >= 462 && click.y <= 518) startRun();
    return;
  }

  // --- play ---
  if (input.wasPressed('pause')) {
    state.screen = 'paused';
    return;
  }
  if (input.wasPressed('mute')) {
    state.muted = audio.toggleMute();
  }

  const zone = zoneAt(state.distance);
  const speed = Math.min(TUNE.maxSpeed, TUNE.baseSpeed * zone.speed) * (t.featherTime > 0 ? 1.25 : 1);

  // Hiding in a haystack.
  const stack = nearHaystack();
  if (input.held('down') && stack && t.onGround) {
    if (!t.hiding) {
      t.hiding = true;
      t.x = stack.x + stack.w / 2 - t.w / 2;
    }
  } else if (t.hiding) {
    t.hiding = false;
    // Stay where the haystack left Tom; the farmer keeps coming.
  }

  const { events } = updateTurkey(t, input, dt, speed);
  if (events.includes('jump')) audio.jump();

  const dx = speed * dt;
  state.scroll += dx;
  state.distance = t.distance;
  state.score = t.score;
  scrollWorld(state.world, dx, state.distance);
  updateKnives(state.world, dt, t.x);

  // Farmer: chase, search, corner.
  const inKitchen = zone.name === 'KITCHEN GARDEN';
  const fEvents = updateFarmer(state.farmer, dt, t, speed, inKitchen).events;
  if (fEvents.includes('spotted')) audio.spotted();
  if (fEvents.includes('search')) audio.gobble();
  if (fEvents.includes('giveup')) audio.gobble();

  // Collisions with the world.
  const box = turkeyHitbox(t);
  for (const it of state.world.items) {
    if (it.taken) continue;
    if (it.kind === 'mud') {
      if (rectsOverlap(box, it) && t.onGround) t.mudSlow = 0.6;
      continue;
    }
    if (it.kind === 'haystack') continue;
    if (it.kind === 'corn' || it.kind === 'feather' || it.kind === 'gravy') {
      if (rectsOverlap(box, it)) {
        it.taken = true;
        if (it.kind === 'corn') {
          t.corn += 1;
          t.combo += 1;
          t.bestCombo = Math.max(t.bestCombo, t.combo);
          t.score += TUNE.cornScore;
          state.farmer.gap = Math.min(420, state.farmer.gap + TUNE.cornFarmerLoss);
          state.flash = { text: `+${TUNE.cornScore} CORN!`, until: state.time + 0.9 };
          audio.corn();
        } else if (it.kind === 'feather') {
          t.feathers += 1;
          t.featherTime = 3;
          t.score += TUNE.featherScore;
          state.farmer.gap = Math.min(420, state.farmer.gap + TUNE.featherFarmerLoss);
          state.flash = { text: `GOLDEN FEATHER +${TUNE.featherScore}!`, until: state.time + 1.2 };
          audio.feather();
        } else {
          healTurkey(t);
          state.flash = { text: '+1 LIFE — GRAVY!', until: state.time + 1.2 };
          audio.feather();
        }
      }
      continue;
    }
    // Hazards: hay, fence, pumpkin, oven, knife. The hitbox is inset from
    // the drawing so a jump that looks clear is clear.
    const hazardBox = { x: it.x + 8, y: it.y + 8, w: it.w - 16, h: it.h - 8 };
    if (it.kind === 'knife' && it.warn > 0) continue; // still warning, not falling
    if (rectsOverlap(box, hazardBox)) {
      if (hurtTurkey(t)) {
        state.farmer.gap = Math.max(0, state.farmer.gap - TUNE.hitFarmerGain);
        state.flash = { text: 'OUCH!', until: state.time + 0.9 };
        audio.hit();
        if (t.lives <= 0) {
          endRun(false);
          return;
        }
      }
      if (it.kind === 'knife') it.taken = true;
    }
  }

  // Caught by the farmer, or escaped to the woods.
  if (farmerCaught(state.farmer) && state.farmer.mood !== FARMER_SEARCH) {
    endRun(false);
    return;
  }
  if (state.distance >= 1000) {
    endRun(true);
    return;
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - (frame.last || now)) / 1000 || 0.016);
  frame.last = now;
  step(dt);
  drawFrame(ctx, state);
  // One-line feedback toast.
  if (state.flash && state.time < state.flash.until) {
    ctx.font = 'bold 24px Trebuchet MS, Verdana, sans-serif';
    ctx.fillStyle = '#ffe27a';
    ctx.textAlign = 'center';
    ctx.fillText(state.flash.text, VIEW.width / 2, 220);
  }
  input.endTick();
  requestAnimationFrame(frame);
}

// Screenshot presets: a fixed state rendered by the real renderer.
if (SHOT) {
  applyShotPreset(state, SHOT);
  drawFrame(ctx, state);
  document.title = `Turkey Run — shot ${SHOT}`;
} else {
  requestAnimationFrame(frame);
}
