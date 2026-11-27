// config.js — tuning, zones and the autumn palette for Turkey Run.
// One job: every number the rest of the game agrees on lives here.

export const VIEW = { width: 1280, height: 720 };
export const GROUND_Y = 600;
export const TURKEY_X = 260;
export const ESCAPE_DISTANCE = 1000; // metres to the woods: reach it and Tom is free.
export const MAX_LIVES = 3;

export const TUNE = {
  baseSpeed: 260, // px/s at the farmyard gate
  maxSpeed: 520, // px/s in the woods
  sprintBonus: 120, // px/s while Shift is held
  staminaMax: 100,
  staminaDrain: 34, // per second of sprinting
  staminaRegen: 22, // per second while not sprinting
  gravity: 2500, // px/s^2
  jumpVelocity: 1050, // px/s — ~0.84 s of air, high enough to clear the oven
  duckSpeedFactor: 0.55,
  mudSlowFactor: 0.45,
  farmerStartGap: 150, // px behind the turkey when the run begins
  farmerCatchGap: 0, // gap <= this and the farmer has Tom
  farmerCloseRate: 26, // px/s the farmer gains when Tom dawdles
  farmerFallRate: 34, // px/s the farmer loses when Tom runs well
  hitFarmerGain: 46, // px the farmer gains when Tom is hit
  cornFarmerLoss: 10, // px the farmer loses per corn eaten
  featherFarmerLoss: 60, // px the farmer loses per golden feather
  hideFarmerLoss: 90, // px the farmer loses after searching a haystack in vain
  searchTime: 2.4, // seconds the farmer spends searching a haystack
  knifeWarnTime: 0.65, // seconds of warning before a carving knife lands
  invulnerableTime: 1.6, // seconds of grace after a hit
  scorePerMetre: 10,
  cornScore: 100,
  featherScore: 250,
  lifeScore: 500,
};

// The four stages of the escape, each harder and each with its own sky.
export const ZONES = [
  {
    name: 'FARMYARD',
    from: 0,
    to: 250,
    sky: ['#f7b733', '#fc4a1a'],
    ground: '#8a5a2b',
    grass: '#7da13c',
    speed: 1.0,
    density: 0.55,
    blurb: 'Dawn over the farmyard — run!',
  },
  {
    name: 'CORNFIELD',
    from: 250,
    to: 500,
    sky: ['#f9d976', '#f39c12'],
    ground: '#7a4a21',
    grass: '#c98f1b',
    speed: 1.18,
    density: 0.75,
    blurb: 'Through the corn — the farmer is gaining.',
  },
  {
    name: 'KITCHEN GARDEN',
    from: 500,
    to: 750,
    sky: ['#e67e22', '#8e44ad'],
    ground: '#5d3a1a',
    grass: '#4e7a2e',
    speed: 1.38,
    density: 0.95,
    blurb: 'Past the kitchen — ovens and carving knives!',
  },
  {
    name: 'THE WOODS',
    from: 750,
    to: 1000,
    sky: ['#1b2a4a', '#2c4a6e'],
    ground: '#2e2118',
    grass: '#2f5d33',
    speed: 1.58,
    density: 1.15,
    blurb: 'The woods — freedom is 250 metres away.',
  },
];

export function zoneAt(distance) {
  for (const z of ZONES) if (distance < z.to) return z;
  return ZONES[ZONES.length - 1];
}

// Palette for the characters and the farm.
export const PALETTE = {
  turkeyBody: '#8d5a2b',
  turkeyWing: '#6e4420',
  turkeyHead: '#c96f4a',
  turkeyWattle: '#d92626',
  turkeyBeak: '#f5a623',
  turkeyTail: ['#b5651d', '#d98e32', '#8d5a2b', '#e0a458', '#a0522d'],
  farmerShirt: '#3b6ea5',
  farmerOveralls: '#2e4a6b',
  farmerHat: '#d9c07a',
  farmerSkin: '#e8b88a',
  ovenBody: '#4a4a55',
  ovenGlow: '#ff7b24',
  knifeBlade: '#dfe6ee',
  knifeHandle: '#3a2a1a',
  hay: '#e0b64f',
  fence: '#9c6b30',
  corn: '#ffd94d',
  feather: '#ffe27a',
  pumpkin: '#e67e22',
  mud: '#5a3a1e',
};
