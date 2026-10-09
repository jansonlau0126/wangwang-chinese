/**
 * Short UI sound effects — separate from speechSynthesis reading (audio.js).
 * Default on; mute via localStorage. Never autoplays on load.
 */

const SFX_KEY = "ww-sfx-on";
const BASE = "/assets/sfx";

/** @type {Record<string, string>} */
const FILES = {
  complete: `${BASE}/complete.mp3`,
  bone: `${BASE}/bone.mp3`,
  unlock: `${BASE}/unlock.mp3`,
  streak: `${BASE}/streak.mp3`,
};

/** @type {Map<string, HTMLAudioElement>} */
const cache = new Map();

export function isSfxEnabled() {
  try {
    const v = localStorage.getItem(SFX_KEY);
    if (v === null) return true;
    return v !== "0" && v !== "false";
  } catch {
    return true;
  }
}

export function setSfxEnabled(on) {
  try {
    localStorage.setItem(SFX_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function getAudio(name) {
  const src = FILES[name];
  if (!src) return null;
  let el = cache.get(name);
  if (!el) {
    el = new Audio(src);
    el.preload = "auto";
    el.volume = 0.55;
    cache.set(name, el);
  }
  return el;
}

/**
 * Play a named SFX if enabled. Safe no-op when muted / missing / blocked.
 * @param {"complete"|"bone"|"unlock"|"streak"} name
 */
export function playSfx(name) {
  if (!isSfxEnabled()) return;
  if (typeof Audio === "undefined") return;
  const el = getAudio(name);
  if (!el) return;
  try {
    el.currentTime = 0;
    const p = el.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {
    /* ignore autoplay / decode errors */
  }
}

/**
 * Play reward cues in a light sequence without stacking noise.
 * Prefers unlock > bone > complete when choosing a single cue would be needed;
 * here we stagger brief plays for the applicable events.
 */
export function playRewardSfx({ bonesEarned = [], newDog = null, ball = null } = {}) {
  if (!isSfxEnabled()) return;
  playSfx("complete");
  const hasBone = Array.isArray(bonesEarned) && bonesEarned.length > 0;
  const hasUnlock = Boolean(newDog || ball);
  if (hasBone) {
    setTimeout(() => playSfx("bone"), 180);
  }
  if (hasUnlock) {
    setTimeout(() => playSfx("unlock"), hasBone ? 360 : 200);
  }
}
