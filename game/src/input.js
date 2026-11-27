// input.js — keyboard and mouse, with one-shot presses for menus.
// One job: turn raw events into a tidy state the game loop reads.

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set(); // one-shot: cleared by the game loop each tick
  let click = null; // {x, y} of the latest click, cleared the same way

  const KEYMAP = {
    ArrowUp: 'up',
    KeyW: 'up',
    Space: 'up',
    ArrowDown: 'down',
    KeyS: 'down',
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right',
    ShiftLeft: 'sprint',
    ShiftRight: 'sprint',
    KeyP: 'pause',
    KeyM: 'mute',
    KeyR: 'restart',
    Enter: 'confirm',
  };

  function onKeyDown(e) {
    const name = KEYMAP[e.code];
    if (!name) return;
    e.preventDefault();
    if (!keys.has(name)) pressed.add(name);
    keys.add(name);
  }

  function onKeyUp(e) {
    const name = KEYMAP[e.code];
    if (name) keys.delete(name);
  }

  function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    click = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousedown', onMouseDown);

  return {
    held(name) {
      return keys.has(name);
    },
    wasPressed(name) {
      return pressed.has(name);
    },
    takeClick() {
      const c = click;
      click = null;
      return c;
    },
    // Call once per tick, after the game has read the one-shots.
    endTick() {
      pressed.clear();
      click = null;
    },
  };
}
