// render.js — every pixel of Turkey Run: farm, turkey, farmer, HUD, screens.
// One job: draw the current state. It never changes the state.

import { GROUND_Y, MAX_LIVES, TUNE, VIEW, ZONES, PALETTE, zoneAt } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.font = `${weight || 'bold'} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

// --- scenery ---

function drawSky(ctx, zone, time) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  g.addColorStop(0, zone.sky[0]);
  g.addColorStop(0.62, zone.sky[1]);
  g.addColorStop(1, '#3a2a18');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Sun or moon, low and warm.
  const night = zone.name === 'THE WOODS';
  ctx.fillStyle = night ? '#f5f0dc' : '#fff3b0';
  ctx.beginPath();
  ctx.arc(1080, 110, night ? 42 : 58, 0, Math.PI * 2);
  ctx.fill();
  if (night) {
    ctx.fillStyle = '#2c4a6e';
    ctx.beginPath();
    ctx.arc(1062, 100, 38, 0, Math.PI * 2);
    ctx.fill();
    // Fireflies.
    ctx.fillStyle = '#ffe27a';
    for (let i = 0; i < 14; i++) {
      const fx = (i * 173 + Math.sin(time * 0.7 + i) * 26) % VIEW.width;
      const fy = 120 + ((i * 97) % 260) + Math.cos(time + i * 2) * 12;
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(time * 2 + i));
      ctx.beginPath();
      ctx.arc(fx, fy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // Drifting clouds.
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 370 + time * 12) % (VIEW.width + 240)) - 120;
    const cy = 70 + i * 46;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 62, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 44, cy + 8, 46, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGround(ctx, zone, scroll) {
  ctx.fillStyle = zone.ground;
  ctx.fillRect(0, GROUND_Y, VIEW.width, VIEW.height - GROUND_Y);
  ctx.fillStyle = zone.grass;
  ctx.fillRect(0, GROUND_Y, VIEW.width, 16);
  // Fence posts scrolling past, and tufts of grass.
  ctx.fillStyle = '#6b4423';
  const spacing = 140;
  const offset = -(scroll % spacing);
  for (let x = offset; x < VIEW.width; x += spacing) {
    ctx.fillRect(x, GROUND_Y - 42, 8, 42);
    ctx.fillRect(x - 4, GROUND_Y - 46, 16, 6);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let x = offset; x < VIEW.width; x += spacing) {
    ctx.fillRect(x, GROUND_Y + 16, 140, 4);
  }
  // Corn stalks in the cornfield, bare trees in the woods.
  if (zone.name === 'CORNFIELD') {
    ctx.strokeStyle = '#2f7a1e';
    ctx.lineWidth = 5;
    for (let x = offset + 60; x < VIEW.width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x + 8, GROUND_Y - 120);
      ctx.stroke();
      ctx.fillStyle = '#ffd94d';
      ctx.beginPath();
      ctx.ellipse(x + 12, GROUND_Y - 84, 10, 18, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (zone.name === 'THE WOODS') {
    ctx.fillStyle = '#1d2b1a';
    for (let x = offset + 40; x < VIEW.width; x += 260) {
      ctx.fillRect(x, GROUND_Y - 190, 16, 190);
      ctx.beginPath();
      ctx.arc(x + 8, GROUND_Y - 210, 52, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// --- characters ---

export function drawTurkey(ctx, t, time) {
  const blink = t.invulnerable > 0 && Math.floor(time * 12) % 2 === 0;
  if (blink) ctx.globalAlpha = 0.35;
  const x = t.x;
  const y = t.y;
  const runCycle = Math.sin(t.animTime * 14);
  const legSwing = t.onGround && !t.ducking ? runCycle * 10 : 0;
  ctx.save();
  ctx.translate(x, y);
  if (t.ducking || t.hiding) ctx.scale(1.15, 0.72);
  // Tail fan.
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = PALETTE.turkeyTail[i];
    ctx.save();
    ctx.translate(8, 26);
    ctx.rotate(-0.9 + i * 0.45);
    ctx.beginPath();
    ctx.ellipse(0, -26, 9, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Body.
  ctx.fillStyle = PALETTE.turkeyBody;
  ctx.beginPath();
  ctx.ellipse(34, 44, 30, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing, mid-flap.
  ctx.fillStyle = PALETTE.turkeyWing;
  ctx.beginPath();
  ctx.ellipse(30, 40 + runCycle * 3, 20, 12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Legs.
  ctx.strokeStyle = '#f5a623';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(28, 66);
  ctx.lineTo(24 + legSwing, 76);
  ctx.moveTo(42, 66);
  ctx.lineTo(46 - legSwing, 76);
  ctx.stroke();
  // Head, beak, wattle, eye.
  ctx.fillStyle = PALETTE.turkeyHead;
  ctx.beginPath();
  ctx.arc(60, 18, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.turkeyBeak;
  ctx.beginPath();
  ctx.moveTo(70, 14);
  ctx.lineTo(84, 19);
  ctx.lineTo(70, 24);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.turkeyWattle;
  ctx.beginPath();
  ctx.ellipse(66, 30, 5, 9, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(63, 14, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
  // Golden-feather glow.
  if (t.featherTime > 0) {
    ctx.strokeStyle = 'rgba(255,226,122,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(t.x + 34, t.y + 38, 52 + Math.sin(time * 8) * 4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawFarmer(ctx, f, time) {
  const x = f.x;
  const y = f.y;
  const stride = Math.sin(f.animTime * 11) * 12;
  ctx.save();
  ctx.translate(x, y);
  // Legs, mid-chase stride.
  ctx.strokeStyle = PALETTE.farmerOveralls;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(30, 66);
  ctx.lineTo(22 + stride, 106);
  ctx.moveTo(48, 66);
  ctx.lineTo(56 - stride, 106);
  ctx.stroke();
  // Body: overalls and shirt.
  ctx.fillStyle = PALETTE.farmerOveralls;
  ctx.fillRect(20, 52, 40, 40);
  ctx.fillStyle = PALETTE.farmerShirt;
  ctx.fillRect(18, 34, 44, 26);
  // Arm reaching for the turkey, pitchfork in the other hand.
  ctx.strokeStyle = PALETTE.farmerSkin;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(58, 44);
  ctx.lineTo(80, 30 + Math.sin(time * 6) * 4);
  ctx.stroke();
  ctx.strokeStyle = '#8a6b3a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(10, 96);
  ctx.lineTo(2, 20);
  ctx.stroke();
  ctx.strokeStyle = '#c8c8c8';
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(2 + i * 6, 20);
    ctx.lineTo(2 + i * 8, 6);
    ctx.stroke();
  }
  // Head, hat, moustache, angry eyes.
  ctx.fillStyle = PALETTE.farmerSkin;
  ctx.beginPath();
  ctx.arc(40, 20, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.farmerHat;
  ctx.fillRect(22, 2, 36, 8);
  ctx.fillRect(28, -8, 24, 12);
  ctx.fillStyle = '#5a3a1e';
  ctx.fillRect(30, 26, 20, 5);
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(46, 18, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Searching: a "?" bubble while he pokes the haystack.
  if (f.mood === 'search') {
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, f.x + 56, f.y - 52, 44, 44, 10);
    ctx.fill();
    text(ctx, '?', f.x + 78, f.y - 20, 30, '#c0392b', 'center');
  }
}

// --- obstacles and pickups ---

function drawItem(ctx, it, time) {
  const { x, y, w, h } = it;
  if (it.kind === 'hay') {
    ctx.fillStyle = PALETTE.hay;
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = '#b98f2e';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 12 + i * 14);
      ctx.lineTo(x + w - 8, y + 12 + i * 14);
      ctx.stroke();
    }
  } else if (it.kind === 'haystack') {
    ctx.fillStyle = PALETTE.hay;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.quadraticCurveTo(x + w / 2, y - 26, x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b98f2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 20, y + h - 20);
    ctx.quadraticCurveTo(x + w / 2, y + 6, x + w - 20, y + h - 20);
    ctx.stroke();
    text(ctx, 'HIDE!  ↓', x + w / 2, y - 14, 15, '#fff8dc', 'center');
  } else if (it.kind === 'fence') {
    ctx.fillStyle = PALETTE.fence;
    ctx.fillRect(x, y + 6, w, 10);
    ctx.fillRect(x, y + 34, w, 10);
    ctx.fillRect(x + 4, y, 8, h);
    ctx.fillRect(x + w - 12, y, 8, h);
  } else if (it.kind === 'mud') {
    ctx.fillStyle = PALETTE.mud;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2 + 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - 18, y + 4, 16, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, 'MUD', x + w / 2, y - 8, 13, '#d8c9a8', 'center');
  } else if (it.kind === 'pumpkin') {
    ctx.fillStyle = PALETTE.pumpkin;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b95c14';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.stroke();
    ctx.fillStyle = '#2f7a1e';
    ctx.fillRect(x + w / 2 - 3, y - 8, 6, 10);
  } else if (it.kind === 'oven') {
    ctx.fillStyle = PALETTE.ovenBody;
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    const glow = 0.55 + 0.45 * Math.sin(time * 5);
    ctx.fillStyle = `rgba(255,123,36,${glow})`;
    roundRect(ctx, x + 14, y + 18, w - 28, 44, 6);
    ctx.fill();
    ctx.fillStyle = '#2a2a33';
    ctx.fillRect(x + 14, y + 68, w - 28, 6);
    text(ctx, 'OVEN!', x + w / 2, y - 12, 16, '#ffb27a', 'center');
  } else if (it.kind === 'knife') {
    if (it.warn > 0) {
      // Warning: a flashing marker on the ground where the knife will land.
      const flash = Math.floor(time * 10) % 2 === 0;
      ctx.fillStyle = flash ? 'rgba(217,38,38,0.85)' : 'rgba(217,38,38,0.35)';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, GROUND_Y - 78);
      ctx.lineTo(x + w / 2 - 26, GROUND_Y - 14);
      ctx.lineTo(x + w / 2 + 26, GROUND_Y - 14);
      ctx.closePath();
      ctx.fill();
      text(ctx, '!', x + w / 2, GROUND_Y - 24, 26, '#ffffff', 'center');
    }
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(0.12);
    ctx.fillStyle = PALETTE.knifeBlade;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(10, -h / 2 + 34);
    ctx.lineTo(10, 8);
    ctx.lineTo(-10, 8);
    ctx.lineTo(-10, -h / 2 + 34);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.knifeHandle;
    roundRect(ctx, -8, 8, 16, 26, 5);
    ctx.fill();
    ctx.restore();
  } else if (it.kind === 'corn') {
    const bob = Math.sin(time * 4 + x * 0.05) * 4;
    ctx.fillStyle = PALETTE.corn;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 + bob, 11, 17, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f7a1e';
    ctx.fillRect(x + w / 2 - 2, y + h / 2 + 14 + bob, 4, 8);
  } else if (it.kind === 'feather') {
    const bob = Math.sin(time * 5 + x * 0.05) * 5;
    ctx.fillStyle = PALETTE.feather;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 + bob);
    ctx.rotate(-0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#fff3b0';
    text(ctx, '+250', x + w / 2, y - 6 + bob, 13, '#ffe27a', 'center');
  } else if (it.kind === 'gravy') {
    const bob = Math.sin(time * 4 + x * 0.05) * 4;
    ctx.fillStyle = '#f2ede4';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 + bob, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c96f2e';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 + bob - 2, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, '+1 ♥', x + w / 2, y - 6 + bob, 13, '#ff8fa3', 'center');
  }
}

// --- HUD ---

export function drawHUD(ctx, state) {
  const { turkey, farmer, distance, score } = state;
  const zone = zoneAt(distance);
  // Top bar.
  ctx.fillStyle = 'rgba(20,12,6,0.72)';
  roundRect(ctx, 16, 12, VIEW.width - 32, 100, 14);
  ctx.fill();
  text(ctx, `SCORE ${Math.floor(score).toLocaleString('en-US')}`, 36, 46, 26, '#ffffff');
  text(ctx, `DISTANCE ${Math.floor(distance)} m / 1000 m`, 36, 80, 18, '#ffd94d');
  text(ctx, `★ ${zone.name}`, 560, 46, 22, '#ffe27a', 'left');
  text(ctx, zone.blurb, 560, 78, 14, '#f5e6c8');
  // Lives as hearts.
  for (let i = 0; i < MAX_LIVES; i++) {
    const hx = 980 + i * 34;
    ctx.fillStyle = i < turkey.lives ? '#ff4d6d' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(hx, 36, 10, 0, Math.PI * 2);
    ctx.arc(hx + 16, 36, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 8, 40);
    ctx.lineTo(hx + 24, 40);
    ctx.lineTo(hx + 8, 58);
    ctx.closePath();
    ctx.fill();
  }
  text(ctx, `CORN ${turkey.corn}`, 980, 80, 16, '#ffd94d');
  // Stamina bar.
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, 36, 92, 220, 10, 5);
  ctx.fill();
  ctx.fillStyle = turkey.stamina > 25 ? '#7ddb6a' : '#ff9f43';
  roundRect(ctx, 36, 92, 220 * (turkey.stamina / TUNE.staminaMax), 10, 5);
  ctx.fill();
  text(ctx, 'STAMINA — hold SHIFT to sprint', 264, 101, 12, '#e8e0d0');
  // Farmer closeness meter: the red bar that says how near Bram is.
  const closeness = 1 - Math.max(0, farmer.gap) / 420;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, 760, 92, 220, 10, 5);
  ctx.fill();
  ctx.fillStyle = closeness > 0.75 ? '#ff2e2e' : '#ff9f43';
  roundRect(ctx, 760, 92, 220 * closeness, 10, 5);
  ctx.fill();
  text(ctx, 'FARMER', 988, 101, 12, '#ffb3b3');
  // Spotted warning.
  if (farmer.spotted) {
    const flash = Math.floor(state.time * 8) % 2 === 0;
    text(ctx, '⚠ SPOTTED! RUN!', VIEW.width / 2, 150, 34, flash ? '#ff2e2e' : '#ffffff', 'center');
  }
  if (farmer.mood === 'corner') {
    text(ctx, 'BRAM IS CUTTING YOU OFF!', VIEW.width / 2, 150, 30, '#ff2e2e', 'center');
  }
  // Combo toast, outlined so it reads over bright clouds.
  if (turkey.combo >= 3) {
    ctx.save();
    ctx.font = 'bold 22px Trebuchet MS, Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(20,12,6,0.85)';
    ctx.strokeText(`COMBO x${turkey.combo}!`, VIEW.width / 2, 190);
    ctx.fillStyle = '#ffe27a';
    ctx.fillText(`COMBO x${turkey.combo}!`, VIEW.width / 2, 190);
    ctx.restore();
  }
}

// --- screens ---

export function drawTitle(ctx, state) {
  const { time } = state;
  ctx.fillStyle = 'rgba(20,12,6,0.45)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Title card.
  ctx.fillStyle = 'rgba(30,16,6,0.82)';
  roundRect(ctx, 190, 90, 900, 300, 24);
  ctx.fill();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 3;
  roundRect(ctx, 190, 90, 900, 300, 24);
  ctx.stroke();
  text(ctx, '🦃  TURKEY RUN', 640, 180, 64, '#ffd94d', 'center');
  text(ctx, 'The Great Thanksgiving Escape', 640, 228, 30, '#ffffff', 'center');
  text(ctx, 'Tom the turkey is on the menu tonight — unless he makes the woods.', 640, 272, 19, '#f5e6c8', 'center');
  text(ctx, 'Outrun Farmer Bram · Jump the fences · Dodge the oven and the carving knives', 640, 306, 18, '#ffb27a', 'center');
  text(ctx, 'Hide in the haystacks when he gets close — he searches, then gives up.', 640, 338, 18, '#ffb27a', 'center');
  // The four stages.
  ctx.fillStyle = 'rgba(255,217,77,0.16)';
  roundRect(ctx, 250, 408, 780, 44, 12);
  ctx.fill();
  text(ctx, 'FARMYARD  →  CORNFIELD  →  KITCHEN GARDEN  →  THE WOODS', 640, 438, 20, '#ffe27a', 'center');
  // Start button, gently pulsing.
  const pulse = 1 + Math.sin(time * 3) * 0.04;
  ctx.save();
  ctx.translate(640, 520);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#e67e22';
  roundRect(ctx, -150, -34, 300, 68, 16);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  roundRect(ctx, -150, -34, 300, 68, 16);
  ctx.stroke();
  text(ctx, '▶  START THE RUN', 0, 12, 26, '#ffffff', 'center');
  ctx.restore();
  text(ctx, '↑ / SPACE jump · ↓ duck & hide · ← → steer · SHIFT sprint · P pause · M mute', 640, 590, 17, '#ffffff', 'center');
  if (state.best > 0) text(ctx, `BEST ESCAPE: ${Math.floor(state.best).toLocaleString('en-US')} points`, 640, 626, 17, '#ffd94d', 'center');
  text(ctx, '20 best escapes share $250 · a complete game, played offline', 640, 660, 14, '#d8c9a8', 'center');
}

export function drawEnd(ctx, state, escaped) {
  const { turkey, distance, score } = state;
  ctx.fillStyle = escaped ? 'rgba(10,30,14,0.55)' : 'rgba(30,8,4,0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = escaped ? 'rgba(16,48,24,0.88)' : 'rgba(48,16,8,0.88)';
  roundRect(ctx, 290, 110, 700, 420, 24);
  ctx.fill();
  ctx.strokeStyle = escaped ? '#7ddb6a' : '#ff6b6b';
  ctx.lineWidth = 3;
  roundRect(ctx, 290, 110, 700, 420, 24);
  ctx.stroke();
  if (escaped) {
    text(ctx, '🎉  ESCAPED!', 640, 190, 56, '#7ddb6a', 'center');
    text(ctx, 'Tom made the woods. Thanksgiving is cancelled', 640, 236, 22, '#ffffff', 'center');
    text(ctx, '— for this turkey, at least.', 640, 266, 22, '#ffffff', 'center');
  } else {
    text(ctx, 'CAUGHT!', 640, 190, 56, '#ff6b6b', 'center');
    text(ctx, 'Farmer Bram has Tom by the drumstick.', 640, 236, 22, '#ffffff', 'center');
    text(ctx, 'Thanksgiving dinner is served… unless you run again.', 640, 266, 22, '#ffffff', 'center');
  }
  text(ctx, `SCORE  ${Math.floor(score).toLocaleString('en-US')}`, 640, 330, 30, '#ffd94d', 'center');
  text(ctx, `DISTANCE  ${Math.floor(distance)} m of 1000 m`, 640, 372, 20, '#ffffff', 'center');
  text(ctx, `CORN  ${turkey.corn}   ·   BEST COMBO  x${turkey.bestCombo}   ·   LIVES LEFT  ${Math.max(0, turkey.lives)}`, 640, 406, 18, '#f5e6c8', 'center');
  if (state.best > 0) text(ctx, `BEST  ${Math.floor(state.best).toLocaleString('en-US')}`, 640, 440, 18, '#ffd94d', 'center');
  // Restart button.
  ctx.fillStyle = '#e67e22';
  roundRect(ctx, 490, 462, 300, 56, 14);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  roundRect(ctx, 490, 462, 300, 56, 14);
  ctx.stroke();
  text(ctx, '↻  RUN AGAIN  (R)', 640, 498, 22, '#ffffff', 'center');
  text(ctx, 'Press R or click the button to run again', 640, 560, 15, '#d8c9a8', 'center');
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(10,10,10,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'PAUSED', 640, 330, 56, '#ffffff', 'center');
  text(ctx, 'Press P to carry on running', 640, 380, 20, '#f5e6c8', 'center');
}

// --- frame ---

export function drawFrame(ctx, state) {
  const zone = zoneAt(state.distance);
  drawSky(ctx, zone, state.time);
  drawGround(ctx, zone, state.scroll);
  for (const it of state.world.items) drawItem(ctx, it, state.time);
  if (state.screen === 'title') {
    // Title: Tom stands proudly on the farmyard, Bram lurking behind.
    drawTurkey(ctx, state.turkey, state.time);
    drawFarmer(ctx, { ...state.farmer, x: 90, y: GROUND_Y - 108, mood: 'chase' }, state.time);
    drawTitle(ctx, state);
    return;
  }
  drawFarmer(ctx, state.farmer, state.time);
  drawTurkey(ctx, state.turkey, state.time);
  drawHUD(ctx, state);
  if (state.screen === 'caught' || state.screen === 'escaped') {
    drawEnd(ctx, state, state.screen === 'escaped');
  }
  if (state.screen === 'paused') drawPaused(ctx);
}

export { ZONES };
