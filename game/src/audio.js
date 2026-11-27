// audio.js — every sound is synthesized with WebAudio: no audio files.
// One job: gobbles, chimes, thuds and fanfares, and a mute switch.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      ctx = null;
    }
    return ctx;
  }

  // Call from a real user gesture (start button, first key) — browsers
  // refuse audio before one. Safe to call any time; it no-ops when blocked.
  function unlock() {
    const c = ensure();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
      gain.gain.setValueAtTime(vol || 0.12, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      osc.connect(gain).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + dur + 0.02);
    } catch {
      // Headless or blocked audio: the game plays on silently.
    }
  }

  function gobble() {
    // Tom's signature: three quick descending wobbles.
    [520, 430, 350].forEach((f, i) => {
      setTimeout(() => tone(f, 0.09, 'sawtooth', 0.07, f * 0.7), i * 90);
    });
  }

  return {
    unlock,
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    jump() {
      tone(300, 0.14, 'sine', 0.1, 620);
    },
    corn() {
      tone(880, 0.09, 'triangle', 0.1);
      setTimeout(() => tone(1320, 0.12, 'triangle', 0.1), 70);
    },
    feather() {
      [660, 880, 1100, 1320].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'triangle', 0.09), i * 60));
    },
    hit() {
      tone(160, 0.25, 'square', 0.12, 70);
    },
    spotted() {
      tone(220, 0.12, 'square', 0.1, 330);
      setTimeout(() => tone(220, 0.12, 'square', 0.1, 330), 140);
    },
    gobble,
    caught() {
      [400, 350, 300, 220].forEach((f, i) => setTimeout(() => tone(f, 0.28, 'sawtooth', 0.09), i * 220));
    },
    escaped() {
      [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.1), i * 130));
    },
    click() {
      tone(700, 0.06, 'sine', 0.08);
    },
  };
}
