import { characters, dayChars, DAY_TOTAL, findChar, weekOfDay } from "./chars.js";
import { dogBySlug, dogs } from "./dogs.js";
import { dayHintTotal, shouldAwardBall, unlockedDogCount } from "./strokeOrder.js";

export const STORAGE_KEY = "wangwang.zhongwen.v2";

const STAGES = ["listen", "watch", "guided", "light", "free", "cheer"];
const SCREENS = ["home", "map", "cards", "dogs", "about", "practice", "reward"];

export function blankHints() {
  return { guided: 0, light: 0, free: 0 };
}

export function defaultState() {
  return {
    version: 2,
    completedDays: [],
    cursorDay: 1,
    active: null,
    savedActive: null,
    records: {},
    companion: dogs[0].slug,
    balls: [],
    companionDays: {},
    pendingReward: null,
    seenDogs: [dogs[0].slug],
    screen: "home",
    cardWeek: 1,
    cardDetail: null,
    reviewReturn: "home",
  };
}

function normalize(raw) {
  const state = { ...defaultState(), ...(raw || {}) };
  state.completedDays = [...new Set((state.completedDays || []).filter((day) => day >= 1 && day <= DAY_TOTAL))];
  if (!state.cursorDay || state.cursorDay < 1 || state.cursorDay > DAY_TOTAL) state.cursorDay = 1;
  if (!dogs.some((dog) => dog.slug === state.companion)) state.companion = dogs[0].slug;
  const unlocked = unlockedDogCount(state.completedDays.length, dogs.length);
  if (dogs.findIndex((dog) => dog.slug === state.companion) >= unlocked) state.companion = dogs[0].slug;
  state.balls = (state.balls || []).filter((slug) => dogs.some((dog) => dog.slug === slug));
  state.records = state.records || {};
  state.companionDays = state.companionDays || {};
  state.seenDogs = state.seenDogs || [dogs[0].slug];
  if (!SCREENS.includes(state.screen)) state.screen = "home";
  if (state.screen === "practice" && !state.active) state.screen = "home";
  if (state.screen === "reward" && !state.pendingReward) state.screen = "home";
  const maxWeek = Math.ceil(DAY_TOTAL / 5);
  if (!state.cardWeek || state.cardWeek < 1 || state.cardWeek > maxWeek) {
    state.cardWeek = weekOfDay(state.cursorDay) || 1;
  }
  if (state.cardDetail && !findChar(state.cardDetail)) state.cardDetail = null;
  if (!["home", "cards"].includes(state.reviewReturn)) state.reviewReturn = "home";
  return state;
}

export function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!raw) {
      // migrate v1 if present
      const legacy = JSON.parse(localStorage.getItem("wangwang.zhongwen.v1") || "null");
      if (legacy) {
        const migrated = normalize({ ...legacy, version: 2 });
        saveState(migrated);
        return migrated;
      }
    }
    return normalize(raw);
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode or a full disk: the session still works */
  }
}

export function unlockedCount(state) {
  return unlockedDogCount(state.completedDays.length, dogs.length);
}

export function isDayDone(state, day = state.cursorDay) {
  return state.completedDays.includes(day);
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
  if (state.active.review) return findChar(state.active.reviewChar) || dayChars(state.cursorDay)[0];
  return dayChars(state.active.day)[state.active.index] || dayChars(state.active.day)[0];
}

export function tileStatus(state, day, index) {
  if (isDayDone(state, day)) return "done";
  if (day !== state.cursorDay) return "todo";
  if (!state.active || state.active.day !== day || state.active.review) {
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

export function startPractice(state) {
  if (isDayDone(state)) return false;
  if (!state.active || state.active.day !== state.cursorDay || state.active.review) {
    state.active = {
      day: state.cursorDay,
      index: 0,
      stage: "listen",
      hints: {},
      slow: false,
      review: false,
    };
  }
  state.screen = "practice";
  return true;
}

export function beginReview(state, char, returnTo = "cards") {
  const entry = findChar(char);
  if (!entry) return;
  if (state.active && !state.active.review) state.savedActive = state.active;
  state.reviewReturn = returnTo;
  state.active = {
    day: entry.day,
    index: 0,
    stage: "listen",
    hints: {},
    slow: false,
    review: true,
    reviewChar: char,
  };
  state.cardDetail = null;
  state.screen = "practice";
}

export function leavePractice(state) {
  const ret = state.active?.review ? (state.reviewReturn || "home") : "home";
  if (state.active?.review) {
    state.active = state.savedActive || null;
    state.savedActive = null;
  }
  state.screen = ret;
}

/**
 * Retry restarts the current stage animation/quiz but does NOT reset the day's
 * hint counts (those feed the fixed ball-photo rule).
 */
export function retryStage(state) {
  if (!state.active) return;
  const stage = state.active.stage;
  if (stage === "cheer") {
    state.active.stage = "guided";
    return;
  }
  state.active.retry = (state.active.retry || 0) + 1;
}

export function goNextStage(state) {
  if (!state.active) return;
  const index = STAGES.indexOf(state.active.stage);
  const next = STAGES[index + 1];
  if (next) {
    state.active.stage = next;
    return;
  }
  finishCharacter(state);
}

function rememberRecord(state, entry) {
  if (state.active?.review) return;
  const hints = state.active?.hints?.[entry.char] || blankHints();
  state.records[entry.char] = {
    hints: (hints.guided || 0) + (hints.light || 0) + (hints.free || 0),
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
  if (state.active.review) {
    const ret = state.reviewReturn || "home";
    state.active = state.savedActive || null;
    state.savedActive = null;
    state.screen = ret;
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

function completeDay(state) {
  const day = state.active.day;
  const firstTime = !state.completedDays.includes(day);
  const companion = state.companion;
  let newDog = null;
  let ball = null;
  if (firstTime) {
    const before = unlockedDogCount(state.completedDays.length, dogs.length);
    state.completedDays.push(day);
    state.companionDays[companion] = (state.companionDays[companion] || 0) + 1;
    const after = unlockedDogCount(state.completedDays.length, dogs.length);
    if (after > before) newDog = dogs[after - 1].slug;
    const zeroHints = dayHintTotal(state.active.hints) === 0;
    if (shouldAwardBall({
      zeroHints,
      daysWithCompanion: state.companionDays[companion],
      alreadyHas: state.balls.includes(companion),
    })) {
      state.balls.push(companion);
      ball = companion;
    }
  }
  state.pendingReward = { day, companion, newDog, ball };
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
