import { characters, charactersS2, dayChars, DAY_TOTAL, S2_DAY_TOTAL, findChar, weekOfDay, dayTotalForSeason } from "./chars.js";
import { dogBySlug, dogs } from "./dogs.js";
import {
  albumProgress,
  albumPoseTotal,
  blankAlbumEntry,
  canAwardBall,
  canBuyPose,
  grantBone,
  migrateEconomy,
  paidPosesReady,
  POSE_COSTS,
  remainingBoneCap,
  todayKey,
  yesterdayKey,
} from "./economy.js";
import { dayHintTotal, unlockedDogCount } from "./strokeOrder.js";
import chaptersPack from "../data/chapters-s2.json";

export const STORAGE_KEY = "wangwang.zhongwen.v3";
export const LEGACY_KEYS = ["wangwang.zhongwen.v2", "wangwang.zhongwen.v1"];

const LESSON_STAGES = ["listen", "watch", "guided", "light", "free", "cheer"];
const REVIEW_STAGES = ["watch", "light", "free", "cheer"];
const SCREENS = ["home", "map", "cards", "dogs", "album", "about", "practice", "reward"];
const STREAK_MILESTONES = [3, 7, 14, 30];
const STAGE_MILESTONE_DAYS = [12, 24, 36, 48];

export function blankHints() {
  return { guided: 0, light: 0, free: 0 };
}

function blankS2() {
  return {
    completedDays: [],
    cursorDay: 1,
    started: false,
    unlockedChapters: [],
    streak: 0,
    lastLessonDate: null,
    stickers: [],
    finalePlayed: false,
  };
}

export function defaultState() {
  const album = {};
  for (const dog of dogs) album[dog.slug] = blankAlbumEntry();
  album[dogs[0].slug].sit = true;
  return {
    version: 4,
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
    season: "s1",
    s2: blankS2(),
    stickers: [],
  };
}

function ensureAlbumSits(state) {
  const unlocked = unlockedCount(state);
  dogs.slice(0, unlocked).forEach((dog) => {
    if (!state.album[dog.slug]) state.album[dog.slug] = blankAlbumEntry();
    state.album[dog.slug].sit = true;
  });
}

function normalizeS2(raw) {
  const base = blankS2();
  const s2 = { ...base, ...(raw?.s2 || {}) };
  s2.completedDays = [...new Set((s2.completedDays || []).filter((day) => day >= 1 && day <= S2_DAY_TOTAL))];
  if (!s2.cursorDay || s2.cursorDay < 1 || s2.cursorDay > S2_DAY_TOTAL) s2.cursorDay = 1;
  s2.started = Boolean(s2.started);
  s2.unlockedChapters = Array.isArray(s2.unlockedChapters) ? [...s2.unlockedChapters] : [];
  s2.streak = Math.max(0, s2.streak | 0);
  s2.lastLessonDate = s2.lastLessonDate || null;
  s2.stickers = Array.isArray(s2.stickers) ? [...s2.stickers] : [];
  s2.finalePlayed = Boolean(s2.finalePlayed);
  return s2;
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

  merged.season = merged.season === "s2" ? "s2" : "s1";
  merged.s2 = normalizeS2(merged);
  merged.stickers = Array.isArray(merged.stickers) ? merged.stickers : [];

  if (!SCREENS.includes(merged.screen)) merged.screen = "home";
  if (merged.screen === "practice" && !merged.active) merged.screen = "home";
  if (merged.screen === "reward" && !merged.pendingReward) merged.screen = "home";
  if (merged.screen === "album" && !merged.albumDog) merged.screen = "dogs";
  const maxWeek = Math.ceil(dayTotalForSeason(merged.season) / 5);
  if (!merged.cardWeek || merged.cardWeek < 1 || merged.cardWeek > maxWeek) {
    merged.cardWeek = weekOfDay(activeCursor(merged)) || 1;
  }
  if (merged.cardDetail && !findChar(merged.cardDetail)) merged.cardDetail = null;
  if (!["home", "cards"].includes(merged.reviewReturn)) merged.reviewReturn = "home";
  merged.version = 4;
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

export function s1Complete(state) {
  return state.completedDays.length >= DAY_TOTAL;
}

export function s2Complete(state) {
  return (state.s2?.completedDays?.length || 0) >= S2_DAY_TOTAL;
}

export function seasonComplete(state) {
  // Legacy name: S1 complete (kept for callers / home that mean "first season done")
  return s1Complete(state);
}

export function activeSeason(state) {
  return state.season === "s2" ? "s2" : "s1";
}

export function activeCompleted(state) {
  return activeSeason(state) === "s2" ? state.s2.completedDays : state.completedDays;
}

export function activeCursor(state) {
  return activeSeason(state) === "s2" ? state.s2.cursorDay : state.cursorDay;
}

export function chaptersUnlockedByProgress(completedCount) {
  // At start (0 done) unlock ch01; every +4 completed days unlocks one more.
  const count = Math.min(15, 1 + Math.floor(Math.max(0, completedCount) / 4));
  return Array.from({ length: count }, (_, i) => `ch${String(i + 1).padStart(2, "0")}`);
}

export function chapterIdForDay(day) {
  const n = Math.ceil(day / 4);
  return `ch${String(n).padStart(2, "0")}`;
}

export function stageForDay(day) {
  return chaptersPack.stages.find((s) => day >= s.dayStart && day <= s.dayEnd) || null;
}

export function isDayDone(state, day = activeCursor(state), season = activeSeason(state)) {
  const list = season === "s2" ? state.s2.completedDays : state.completedDays;
  return list.includes(day);
}

export function isCharUnlocked(state, entry, season = null) {
  if (!entry) return false;
  const useS2 = entry.season === 2 || season === "s2" || (season == null && activeSeason(state) === "s2");
  if (useS2) {
    if (!state.s2?.started) return false;
    if (state.s2.completedDays.includes(entry.day)) return true;
    if (entry.day < state.s2.cursorDay) return true;
    if (entry.day === state.s2.cursorDay) return true;
    return false;
  }
  if (state.completedDays.includes(entry.day)) return true;
  if (entry.day < state.cursorDay) return true;
  if (entry.day === state.cursorDay) return true;
  return false;
}

export function canStartS2(state) {
  return s1Complete(state) && !state.s2.started;
}

export function canWriteS2(state) {
  return s1Complete(state) && state.s2.started;
}

export function startSeason2(state) {
  if (!canStartS2(state)) return false;
  state.s2.started = true;
  state.s2.cursorDay = 1;
  state.s2.unlockedChapters = ["ch01"];
  state.season = "s2";
  state.cardWeek = 1;
  state.screen = "home";
  return true;
}

export function switchSeason(state, season) {
  if (season === "s2") {
    if (!canWriteS2(state) && !state.s2.started) return false;
    if (!s1Complete(state)) return false;
    state.season = "s2";
  } else {
    state.season = "s1";
  }
  state.cardWeek = weekOfDay(activeCursor(state)) || 1;
  return true;
}

export function currentEntry(state) {
  const season = state.active?.season || activeSeason(state);
  if (!state.active) return dayChars(activeCursor(state), season)[0];
  if (state.active.reviewSession) {
    const ch = state.active.queue[state.active.index];
    return findChar(ch) || dayChars(1, "s1")[0];
  }
  if (state.active.review) return findChar(state.active.reviewChar) || dayChars(state.active.day, season)[0];
  return dayChars(state.active.day, season)[state.active.index] || dayChars(state.active.day, season)[0];
}

export function activeStages(state) {
  return state.active?.reviewSession ? REVIEW_STAGES : LESSON_STAGES;
}

export function tileStatus(state, day, index) {
  const season = activeSeason(state);
  if (isDayDone(state, day, season)) return "done";
  if (day !== activeCursor(state)) return "todo";
  if (!state.active || state.active.day !== day || state.active.review || state.active.reviewSession || (state.active.season || "s1") !== season) {
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
  const season = activeSeason(state);
  if (season === "s2") {
    if (!canWriteS2(state)) return false;
    if (s2Complete(state) || isDayDone(state, state.s2.cursorDay, "s2")) return false;
    if (!state.active || state.active.day !== state.s2.cursorDay || state.active.review || state.active.reviewSession || state.active.season !== "s2") {
      state.active = {
        season: "s2",
        day: state.s2.cursorDay,
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
  if (s1Complete(state) || isDayDone(state, state.cursorDay, "s1")) return false;
  if (!state.active || state.active.day !== state.cursorDay || state.active.review || state.active.reviewSession || state.active.season === "s2") {
    state.active = {
      season: "s1",
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
  const season = entry.season === 2 ? "s2" : "s1";
  state.active = {
    season,
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
    season: activeSeason(state),
    day: activeCursor(state),
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
  const season = activeSeason(state);
  const pool = season === "s2" ? charactersS2 : characters;
  const done = season === "s2" ? state.s2.completedDays : state.completedDays;
  const learned = pool.filter((entry) => done.includes(entry.day));
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

  const season = state.active.season || "s1";
  const list = dayChars(state.active.day, season);
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
    season: state.active?.season || activeSeason(state),
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

function updateS2Streak(state) {
  const today = todayKey();
  const last = state.s2.lastLessonDate;
  if (last === today) return null;
  if (last === yesterdayKey()) state.s2.streak += 1;
  else state.s2.streak = 1;
  state.s2.lastLessonDate = today;
  if (STREAK_MILESTONES.includes(state.s2.streak)) {
    const id = `streak-${state.s2.streak}`;
    if (!state.s2.stickers.includes(id)) state.s2.stickers.push(id);
    return state.s2.streak;
  }
  return null;
}

function completeDay(state) {
  const season = state.active.season || "s1";
  const day = state.active.day;
  const companion = state.companion;
  let newDog = null;
  let ball = null;
  const earned = [];
  const zeroHints = dayHintTotal(state.active.hints) === 0;
  const chars = dayChars(day, season).map((e) => e.char);

  if (season === "s2") {
    const firstTime = !state.s2.completedDays.includes(day);
    let newChapter = null;
    let stageComplete = null;
    let streakMilestone = null;
    let finale = false;

    if (firstTime) {
      const beforeChapters = new Set(state.s2.unlockedChapters);
      state.s2.completedDays.push(day);
      state.companionDays[companion] = (state.companionDays[companion] || 0) + 1;
      state.s2.unlockedChapters = chaptersUnlockedByProgress(state.s2.completedDays.length);
      for (const id of state.s2.unlockedChapters) {
        if (!beforeChapters.has(id) && id !== "ch01") newChapter = id;
      }
      if (STAGE_MILESTONE_DAYS.includes(day)) {
        const stage = stageForDay(day);
        if (stage) {
          stageComplete = stage.id;
          const sid = `stage-${stage.id}`;
          if (!state.s2.stickers.includes(sid)) state.s2.stickers.push(sid);
        }
      }
      if (applyGrant(state, "lesson").granted) earned.push("lesson");
      if (zeroHints && applyGrant(state, "zero").granted) earned.push("zero");
      streakMilestone = updateS2Streak(state);
      if (state.s2.completedDays.length >= S2_DAY_TOTAL) {
        finale = true;
        if (!state.s2.stickers.includes("finale")) state.s2.stickers.push("finale");
      }
    }

    const albumEntry = state.album[companion];
    if (canAwardBall(albumEntry, { zeroHints, isCompanion: true })) {
      albumEntry.ball = true;
      ball = companion;
    }

    state.pendingReward = {
      kind: "lesson",
      season: "s2",
      day,
      chars,
      companion,
      newDog: null,
      ball,
      bonesEarned: earned,
      bonesToday: bonesToday(state),
      firstTime,
      newChapter,
      stageComplete,
      streakMilestone,
      s2Complete: finale,
      shareKind: finale ? "finale" : newChapter ? "chapter" : streakMilestone ? "streak" : stageComplete ? "stage" : "daily",
      playFinale: finale && !state.s2.finalePlayed,
    };
    if (finale) state.s2.finalePlayed = true;
    state.active = null;
    state.savedActive = null;
    state.screen = "reward";
    return;
  }

  // S1
  const firstTime = !state.completedDays.includes(day);
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
    season: "s1",
    day,
    chars,
    companion,
    newDog,
    ball,
    bonesEarned: earned,
    bonesToday: bonesToday(state),
    firstTime,
    shareKind: "daily",
  };
  state.active = null;
  state.savedActive = null;
  state.screen = "reward";
}

export function advanceDay(state) {
  const season = activeSeason(state);
  if (season === "s2") {
    if (!isDayDone(state, state.s2.cursorDay, "s2") || state.s2.cursorDay >= S2_DAY_TOTAL) return false;
    state.s2.cursorDay += 1;
    state.pendingReward = null;
    state.active = null;
    return true;
  }
  if (!isDayDone(state, state.cursorDay, "s1") || state.cursorDay >= DAY_TOTAL) return false;
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
  const pool = activeSeason(state) === "s2" ? charactersS2 : characters;
  return pool
    .filter((entry) => state.records[entry.char])
    .map((entry) => ({ ...entry, hints: state.records[entry.char].hints }));
}

export function companionName(state) {
  return dogBySlug(state.companion).name;
}

export function setCardWeek(state, week) {
  const maxWeek = Math.ceil(dayTotalForSeason(activeSeason(state)) / 5);
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

export function getChaptersPack() {
  return chaptersPack;
}

export { paidPosesReady, POSE_COSTS, albumPoseTotal, S2_DAY_TOTAL, DAY_TOTAL };
