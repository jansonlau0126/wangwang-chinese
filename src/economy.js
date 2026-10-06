/** Bones currency + album pose unlocks (pure helpers). */

export const POSE_COSTS = {
  happy: 4,
  sleep: 4,
  stretch: 5,
  "act-a": 5,
  "act-b": 6,
};

export const PAID_POSES = ["happy", "sleep", "stretch", "act-a", "act-b"];
export const ALBUM_POSES = ["sit", ...PAID_POSES, "ball"];
export const DAILY_BONE_CAP = 2;

export const POSE_LABEL = {
  sit: "坐低",
  happy: "開心",
  sleep: "瞓覺",
  stretch: "伸懶腰",
  "act-a": "得意 A",
  "act-b": "得意 B",
  ball: "波波相",
};

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function bonesEarnedOnDate(ledger, dateKey) {
  return (ledger || [])
    .filter((entry) => entry.date === dateKey)
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);
}

export function remainingBoneCap(ledger, dateKey = todayKey()) {
  return Math.max(0, DAILY_BONE_CAP - bonesEarnedOnDate(ledger, dateKey));
}

/** Returns { granted, amount, ledger, bones } — does not mutate. */
export function grantBone(stateLike, reason, dateKey = todayKey()) {
  const left = remainingBoneCap(stateLike.boneLedger, dateKey);
  if (left <= 0) {
    return {
      granted: false,
      amount: 0,
      bones: stateLike.bones || 0,
      ledger: stateLike.boneLedger || [],
      reason: "cap",
    };
  }
  const ledger = [...(stateLike.boneLedger || []), { date: dateKey, amount: 1, reason }];
  return {
    granted: true,
    amount: 1,
    bones: (stateLike.bones || 0) + 1,
    ledger,
    reason,
  };
}

export function blankAlbumEntry() {
  return { sit: false, happy: false, sleep: false, stretch: false, "act-a": false, "act-b": false, ball: false };
}

export function albumProgress(entry) {
  if (!entry) return 0;
  return ALBUM_POSES.reduce((n, pose) => n + (entry[pose] ? 1 : 0), 0);
}

export function paidPosesReady(entry) {
  return PAID_POSES.every((pose) => entry?.[pose]);
}

export function canBuyPose(entry, pose, bones) {
  if (!entry?.sit) return false;
  if (pose === "sit" || pose === "ball") return false;
  if (entry[pose]) return false;
  const cost = POSE_COSTS[pose];
  return Boolean(cost) && bones >= cost;
}

export function canAwardBall(entry, { zeroHints, isCompanion }) {
  if (!zeroHints || !isCompanion) return false;
  if (!entry?.sit || entry.ball) return false;
  return paidPosesReady(entry);
}

/** Migrate v1/v2 saves into bones + album. */
export function migrateEconomy(raw, dogs, unlockedCount) {
  const album = {};
  for (const dog of dogs) {
    album[dog.slug] = blankAlbumEntry();
  }
  const unlocked = dogs.slice(0, unlockedCount);
  for (const dog of unlocked) {
    album[dog.slug].sit = true;
  }
  for (const slug of raw.balls || []) {
    if (album[slug]) album[slug].ball = true;
  }
  // Keep any already-migrated album
  if (raw.album && typeof raw.album === "object") {
    for (const [slug, entry] of Object.entries(raw.album)) {
      if (!album[slug]) continue;
      for (const pose of ALBUM_POSES) {
        if (entry?.[pose]) album[slug][pose] = true;
      }
      album[slug].sit = album[slug].sit || unlocked.some((d) => d.slug === slug);
    }
  }

  let bones = typeof raw.bones === "number" ? raw.bones : 0;
  let ledger = Array.isArray(raw.boneLedger) ? [...raw.boneLedger] : [];

  if (!raw.boneLedger && !raw.bones && Array.isArray(raw.completedDays) && raw.completedDays.length) {
    // Retroactive: 1 bone per completed lesson day (cap naturally 1/day).
    const today = todayKey();
    const base = new Date(`${today}T12:00:00`);
    raw.completedDays.forEach((day, index) => {
      const when = new Date(base);
      when.setDate(base.getDate() - (raw.completedDays.length - index));
      ledger.push({ date: todayKey(when), amount: 1, reason: "lesson-migrate", day });
      bones += 1;
    });
  }

  return { bones, boneLedger: ledger, album };
}
