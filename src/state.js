import { characters, dayChars, DAY_TOTAL, findChar, weekOfDay } from "./chars.js";
import { dogBySlug, dogs } from "./dogs.js";
import {
  albumProgress,
  blankAlbumEntry,
  canAwardBall,
  canBuyPose,
  grantBone,
  migrateEconomy,
  paidPosesReady,
  POSE_COSTS,
  remainingBoneCap,
  todayKey,
} from "./economy.js";
import { dayHintTotal, unlockedDogCount } from "./strokeOrder.js";

export const STORAGE_KEY = "wangwang.zhongwen.v3";
export const LEGACY_KEYS = ["wangwang.zhongwen.v2", "wangwang.zhongwen.v1"];

const LESSON_STAGES = ["listen", "watch", "guided", "light", "free", "cheer"];
const REVIEW_STAGES = ["watch", "light", "free", "cheer"];
const SCREENS = ["home", "map", "cards", "dogs", "album", "about", "practice", "reward"];

export function blankHints() {
  return { guided: 0, light: 0, free: 0 };
}

export function defaultState() {
  const album = {};
  for (const dog of dogs) album[dog.slug] = blankAlbumEntry();
  album[dogs[0].slug].sit = true;
  return {
    version: 3,
    completedDays: [],
    cursorDay: 1,
    active: null,
    savedActive: null,
    records: {},
    companion: dogs[0].slug,
    companionDays: {},
    pendingReward: null,
    pendingPose: null,
    seenDogs: [dogs[0].slug],
    screen: "home",
    cardWeek: 1,
    cardDetail: null,
    reviewReturn: "home",
    albumDog: null,
    bones: 0,
    boneLedger: [],
    album,
  };
}

function ensureAlbumSits(state) {
  const unlocked = unlockedCount(state);
  dogs.slice(0, unlocked).forEach((dog) => {
    if (!state.album[dog.slug]) state.album[dog.slug] = blankAlbumEntry();
    state.album[dog.slug].sit = true;
  });
}

function normalize(raw) {
  const base = defaultState();
  const merged = { ...base, ...(raw || {}) };
  merged.completedDays = [...new Set((merged.completedDays || []).filter((day) => day >= 1 && day <= DAY_TOTAL))];
  if (!merged.cursorDay || merged.cursorDay < 1 || merged.cursorDay > DAY_TOTAL) merged.cursorDay = 1;
  if (!dogs.some((dog) => dog.slug === merged.companion)) merged.companion = dogs[0].slug;
  const unlocked = unlockedDogCount(merged.completedDays.length, dogs.length);
  if (dogs.findIndex((dog) => dog.slug === merged.companion) >= unlocked) merged.companion = dogs[0].slug;
  merged.records = merged.records || {};
  merged.companionDays = merged.companionDays || {};
  merged.seenDogs = merged.seenDogs || [dogs[0].slug];

  const eco = migrateEconomy(merged, dogs, unlocked);
  merged.bones = eco.bones;
  merged.boneLedger = eco.boneLedger;
  merged.album = eco.album;
  ensureAlbumSits(merged);

  if (!SCREENS.includes(merged.screen)) merged.screen = "home";
  if (merged.screen === "practice" && !merged.active) merged.screen = "home";
  if (merged.screen === "reward" && !merged.pendingReward) merged.screen = "home";
  if (merged.screen === "album" && !merged.albumDog) merged.screen = "dogs";
  const maxWeek = Math.ceil(DAY_TOTAL / 5);
  if (!merged.cardWeek || merged.cardWeek < 1 || merged.cardWeek > maxWeek) {
    merged.cardWeek = weekOfDay(merged.cursorDay) || 1;
  }
  if (merged.cardDetail && !findChar(merged.cardDetail)) merged.cardDetail = null;
  if (!["home", "cards"].includes(merged.reviewReturn)) merged.reviewReturn = "home";
  merged.version = 3;
  delete merged.balls;
  return merged;
}

export function loadState() {
  try {
    let raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        const legacy = JSON.parse(localStorage.getItem(key) || "null");
        if (legacy) {
          raw = legacy;
          break;
        }
      }
    }
    const state = normalize(raw);
    saveState(state);
    return state;
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode */
  }
}

export function unlockedCount(state) {
  return unlockedDogCount(state.completedDays.length, dogs.length);
}

export function isDayDone(state, day = state.cursorDay) {
  return state.completedDays.includes(day);
}

export function seasonComplete(state) {
  return state.completedDays.length >= DAY_TOTAL;
}

export function isCharUnlocked(state, entry) {
  if (!entry) return false;
  if (state.completedDays.includes(entry.day)) return true;
  if (entry.day < state.cursorDay) return true;
  if (entry.day === state.cursorDay) return true;
  return false;
}

export function currentEntry(state) {
  if (!state.active) return dayChars(state.cursorDay)[0];
  if (state.active.reviewSession) {
    const ch = state.active.queue[state.active.index];
    return findChar(ch) || dayChars(1)[0];
  }
  if (state.active.review) return findChar(state.active.reviewChar) || dayChars(state.cursorDay)[0];
  return dayChars(state.active.day)[state.active.index] || dayChars(state.active.day)[0];
}

export function activeStages(state) {
  return state.active?.reviewSession ? REVIEW_STAGES : LESSON_STAGES;
}

export function tileStatus(state, day, index) {
  if (isDayDone(state, day)) return "done";
  if (day !== state.cursorDay) return "todo";
  if (!state.active || state.active.day !== day || state.active.review || state.active.reviewSession) {
    return index === 0 ? "next" : "todo";
  }
  if (index < state.active.index) return "done";
  if (index === state.active.index) return "now";
  return "todo";
}

export function ensureHints(state, char) {
  if (!state.active.hints[char]) state.active.hints[char] = blankHints();
  return state.active.hints[char];
}

function applyGrant(state, reason) {
  const result = grantBone(state, reason);
  if (result.granted) {
    state.bones = result.bones;
    state.boneLedger = result.ledger;
  }
  return result;
}

export function bonesToday(state) {
  return remainingBoneCap(state.boneLedger) === 0
    ? 2
    : 2 - remainingBoneCap(state.boneLedger);
}

export function startPractice(state) {
  if (seasonComplete(state) || isDayDone(state)) return false;
  if (!state.active || state.active.day !== state.cursorDay || state.active.review || state.active.reviewSession) {
    state.active = {
      day: state.cursorDay,
      index: 0,
      stage: "listen",
      hints: {},
      slow: false,
      review: false,
      reviewSession: false,
    };
  }
  state.screen = "practice";
  return true;
}

/** Single-character review from 生字卡 (no bones). */
export function beginReview(state, char, returnTo = "cards") {
  const entry = findChar(char);
  if (!entry) return;
  if (state.active && !state.active.review && !state.active.reviewSession) state.savedActive = state.active;
  state.reviewReturn = returnTo;
  state.active = {
    day: entry.day,
    index: 0,
    stage: "listen",
    hints: {},
    slow: false,
    review: true,
    reviewSession: false,
    reviewChar: char,
  };
  state.cardDetail = null;
  state.screen = "practice";
}

/** Daily 溫習: 3 weakest learned chars. Earns bones when finished. */
export function startWarmup(state) {
  const queue = pickWarmupChars(state, 3);
  if (!queue.length) return false;
  if (state.active && !state.active.review && !state.active.reviewSession) state.savedActive = state.active;
  state.reviewReturn = "home";
  state.active = {
    day: state.cursorDay,
    index: 0,
    stage: "watch",
    hints: {},
    slow: false,
    review: false,
    reviewSession: true,
    queue,
  };
  state.screen = "practice";
  return true;
}

export function pickWarmupChars(state, n = 3) {
  const learned = characters.filter((entry) => state.completedDays.includes(entry.day));
  if (!learned.length) return [];
  const ranked = learned
    .map((entry) => {
      const rec = state.records[entry.char];
      return {
        char: entry.char,
        hints: rec?.hints ?? 99,
        at: rec?.at ? Date.parse(rec.at) : 0,
      };
    })
    .sort((a, b) => b.hints - a.hints || a.at - b.at);
  const picked = [];
  for (const row of ranked) {
    if (picked.includes(row.char)) continue;
    picked.push(row.char);
    if (picked.length >= n) break;
  }
  // fill if needed
  while (picked.length < Math.min(n, learned.length)) {
    const extra = learned.find((e) => !picked.includes(e.char));
    if (!extra) break;
    picked.push(extra.char);
  }
  return picked;
}

export function leavePractice(state) {
  const ret = state.active?.review || state.active?.reviewSession ? (state.reviewReturn || "home") : "home";
  if (state.active?.review || state.active?.reviewSession) {
    state.active = state.savedActive || null;
    state.savedActive = null;
  }
  state.screen = ret;
}

export function retryStage(state) {
  if (!state.active) return;
  const stage = state.active.stage;
  if (stage === "cheer") {
    state.active.stage = state.active.reviewSession ? "watch" : "guided";
    return;
  }
  state.active.retry = (state.active.retry || 0) + 1;
}

export function goNextStage(state) {
  if (!state.active) return;
  const stages = activeStages(state);
  const index = stages.indexOf(state.active.stage);
  const next = stages[index + 1];
  if (next) {
    state.active.stage = next;
    return;
  }
  finishCharacter(state);
}

function rememberRecord(state, entry) {
  if (state.active?.review && !state.active?.reviewSession) return;
  const hints = state.active?.hints?.[entry.char] || blankHints();
  const total = (hints.guided || 0) + (hints.light || 0) + (hints.free || 0);
  state.records[entry.char] = {
    hints: total,
    at: new Date().toISOString(),
  };
}

export function noteFreeFinished(state) {
  const entry = currentEntry(state);
  if (entry) rememberRecord(state, entry);
}

function finishCharacter(state) {
  const entry = currentEntry(state);
  if (entry) rememberRecord(state, entry);

  if (state.active.review && !state.active.reviewSession) {
    const ret = state.reviewReturn || "home";
    state.active = state.savedActive || null;
    state.savedActive = null;
    state.screen = ret;
    return;
  }

  if (state.active.reviewSession) {
    if (state.active.index + 1 < state.active.queue.length) {
      state.active.index += 1;
      state.active.stage = "watch";
      state.active.slow = false;
      return;
    }
    completeWarmup(state);
    return;
  }

  const list = dayChars(state.active.day);
  if (state.active.index + 1 < list.length) {
    state.active.index += 1;
    state.active.stage = "listen";
    state.active.slow = false;
    return;
  }
  completeDay(state);
}

function completeWarmup(state) {
  const zeroHints = dayHintTotal(state.active.hints) === 0;
  const earned = [];
  if (applyGrant(state, "review").granted) earned.push("review");
  if (zeroHints && applyGrant(state, "zero").granted) earned.push("zero");

  let ball = null;
  const companion = state.companion;
  const entry = state.album[companion];
  if (canAwardBall(entry, { zeroHints, isCompanion: true })) {
    entry.ball = true;
    ball = companion;
  }

  state.pendingReward = {
    kind: "warmup",
    companion,
    bonesEarned: earned,
    bonesToday: bonesToday(state),
    ball,
    newDog: null,
    day: null,
    chars: state.active?.queue ? [...state.active.queue] : [],
  };
  state.active = null;
  state.savedActive = null;
  state.screen = "reward";
}

function completeDay(state) {
  const day = state.active.day;
  const firstTime = !state.completedDays.includes(day);
  const companion = state.companion;
  let newDog = null;
  let ball = null;
  const earned = [];
  const zeroHints = dayHintTotal(state.active.hints) === 0;

  if (firstTime) {
    const before = unlockedDogCount(state.completedDays.length, dogs.length);
    state.completedDays.push(day);
    state.companionDays[companion] = (state.companionDays[companion] || 0) + 1;
    const after = unlockedDogCount(state.completedDays.length, dogs.length);
    if (after > before) {
      newDog = dogs[after - 1].slug;
      state.album[newDog].sit = true;
    }
    if (applyGrant(state, "lesson").granted) earned.push("lesson");
    if (zeroHints && applyGrant(state, "zero").granted) earned.push("zero");
  }

  const albumEntry = state.album[companion];
  if (canAwardBall(albumEntry, { zeroHints, isCompanion: true })) {
    albumEntry.ball = true;
    ball = companion;
  }

  state.pendingReward = {
    kind: "lesson",
    day,
    companion,
    newDog,
    ball,
    bonesEarned: earned,
    bonesToday: bonesToday(state),
    firstTime,
  };
  state.active = null;
  state.savedActive = null;
  state.screen = "reward";
}

export function advanceDay(state) {
  if (!isDayDone(state) || state.cursorDay >= DAY_TOTAL) return false;
  state.cursorDay += 1;
  state.pendingReward = null;
  state.active = null;
  return true;
}

export function pickCompanion(state, slug) {
  const index = dogs.findIndex((dog) => dog.slug === slug);
  if (index < 0 || index >= unlockedCount(state)) return false;
  state.companion = slug;
  return true;
}

export function markDogsSeen(state) {
  const unlocked = dogs.slice(0, unlockedCount(state)).map((dog) => dog.slug);
  state.seenDogs = [...new Set([...(state.seenDogs || []), ...unlocked])];
}

export function dismissReward(state) {
  state.pendingReward = null;
  state.screen = "home";
}

export function openAlbum(state, slug) {
  const index = dogs.findIndex((dog) => dog.slug === slug);
  if (index < 0 || index >= unlockedCount(state)) return false;
  state.albumDog = slug;
  state.screen = "album";
  return true;
}

export function closeAlbum(state) {
  state.albumDog = null;
  state.screen = "dogs";
}

export function buyPose(state, slug, pose) {
  const entry = state.album[slug];
  if (!canBuyPose(entry, pose, state.bones)) return false;
  const cost = POSE_COSTS[pose];
  state.bones -= cost;
  entry[pose] = true;
  state.pendingPose = { slug, pose };
  return true;
}

export function dismissPoseUnlock(state) {
  state.pendingPose = null;
}

export function dogAlbumProgress(state, slug) {
  return albumProgress(state.album[slug]);
}

export function recordList(state) {
  return characters
    .filter((entry) => state.records[entry.char])
    .map((entry) => ({ ...entry, hints: state.records[entry.char].hints }));
}

export function companionName(state) {
  return dogBySlug(state.companion).name;
}

export function setCardWeek(state, week) {
  const maxWeek = Math.ceil(DAY_TOTAL / 5);
  state.cardWeek = Math.max(1, Math.min(maxWeek, week | 0));
}

export function openCardDetail(state, char) {
  const entry = findChar(char);
  if (!entry || !isCharUnlocked(state, entry)) return false;
  state.cardDetail = char;
  return true;
}

export function closeCardDetail(state) {
  state.cardDetail = null;
}

export { paidPosesReady, POSE_COSTS };
