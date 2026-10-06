/**
 * Album unlock simulation for Season 1.
 * Sit free on dog unlock. Paid poses cost bones. Ball free when that dog is
 * companion on a zero-hint day and all paid poses are unlocked.
 */
export const POSE_COSTS = {
  happy: 4,
  sleep: 4,
  stretch: 5,
  "act-a": 5,
  "act-b": 6,
};
export const PAID_POSES = /** @type {(keyof typeof POSE_COSTS)[]} */ ([
  "happy",
  "sleep",
  "stretch",
  "act-a",
  "act-b",
]);
export const BONES_PER_DOG = PAID_POSES.reduce((s, p) => s + POSE_COSTS[p], 0); // 24
export const DOG_TOTAL = 15;
export const TOTAL_PAID_BONES = BONES_PER_DOG * DOG_TOTAL; // 360
export const DAILY_BONE_CAP = 2;
export const LESSON_DAYS = 60;
export const ALBUM_TOTAL = DOG_TOTAL * 7; // 105

export function bonesForDay({ lesson = false, review = false, zeroHint = false }) {
  let earned = 0;
  if (lesson) earned += 1;
  if (review) earned += 1;
  if (zeroHint) earned += 1;
  const granted = Math.min(DAILY_BONE_CAP, earned);
  return { earned, granted, capped: earned > DAILY_BONE_CAP };
}

function mulberry32(seed) {
  let rng = seed >>> 0;
  return () => {
    rng = (rng + 0x6d2b79f5) >>> 0;
    let t = rng;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulateRealistic({
  weeksMax = 80,
  daysPerWeek = 5,
  reviewFraction = 0.5,
  zeroHintRate = 0.3,
  seed = 42,
} = {}) {
  const rand = mulberry32(seed);
  let bones = 0;
  let spent = 0;
  let lessonDone = 0;
  let dogsUnlocked = 1;
  const album = Array.from({ length: DOG_TOTAL }, () => new Set());
  album[0].add("sit");
  let balls = 0;
  let calendarDays = 0;
  let week = 0;

  const photos = () => album.reduce((n, set) => n + set.size, 0);
  const paidReady = (d) => PAID_POSES.every((p) => album[d].has(p));

  const trySpend = () => {
    for (let d = 0; d < dogsUnlocked; d += 1) {
      for (const pose of PAID_POSES) {
        if (album[d].has(pose)) continue;
        const cost = POSE_COSTS[pose];
        if (bones >= cost) {
          bones -= cost;
          spent += cost;
          album[d].add(pose);
        } else return;
      }
    }
  };

  const pickCompanion = () => {
    for (let d = 0; d < dogsUnlocked; d += 1) {
      if (paidReady(d) && !album[d].has("ball")) return d;
    }
    return Math.min(dogsUnlocked - 1, Math.floor(rand() * dogsUnlocked));
  };

  while (week < weeksMax && photos() < ALBUM_TOTAL) {
    week += 1;
    for (let d = 0; d < daysPerWeek; d += 1) {
      calendarDays += 1;
      const stillLessons = lessonDone < LESSON_DAYS;
      const willLesson = stillLessons;
      const willReview = stillLessons ? rand() < reviewFraction : true;
      if (!willLesson && !willReview) continue;

      const zeroHint = rand() < zeroHintRate;
      const { granted } = bonesForDay({
        lesson: willLesson,
        review: willReview,
        zeroHint: zeroHint && (willLesson || willReview),
      });
      bones += granted;

      if (willLesson) {
        lessonDone += 1;
        const after = Math.min(DOG_TOTAL, 1 + Math.floor(lessonDone / 4));
        while (dogsUnlocked < after) {
          dogsUnlocked += 1;
          album[dogsUnlocked - 1].add("sit");
        }
      }

      const companion = pickCompanion();
      trySpend();
      if (zeroHint && (willLesson || willReview) && paidReady(companion) && !album[companion].has("ball")) {
        album[companion].add("ball");
        balls += 1;
      }
      trySpend();
      if (photos() >= ALBUM_TOTAL) break;
    }
  }

  return {
    weeks: week,
    calendarDays,
    lessonDone,
    bonesLeft: bones,
    spent,
    photos: photos(),
    balls,
    dogsUnlocked,
    totalPaidBones: TOTAL_PAID_BONES,
    albumTotal: ALBUM_TOTAL,
  };
}

export function simulateBinge() {
  const minDays = Math.ceil(TOTAL_PAID_BONES / DAILY_BONE_CAP);
  return {
    calendarDays: minDays,
    bones: minDays * DAILY_BONE_CAP,
    minDaysForPaidPoses: minDays,
  };
}

export function runAssertions() {
  const realistic = simulateRealistic();
  const binge = simulateBinge();
  const errors = [];
  if (realistic.photos < ALBUM_TOTAL) errors.push(`photos ${realistic.photos} < ${ALBUM_TOTAL}`);
  if (realistic.weeks < 48 || realistic.weeks > 56) {
    errors.push(`realistic weeks ${realistic.weeks} outside 48–56`);
  }
  if (binge.minDaysForPaidPoses !== Math.ceil(TOTAL_PAID_BONES / DAILY_BONE_CAP)) {
    errors.push("binge math mismatch");
  }
  return { realistic, binge, errors, POSE_COSTS, BONES_PER_DOG, TOTAL_PAID_BONES, DAILY_BONE_CAP, ALBUM_TOTAL };
}

const isMain = process.argv[1] && process.argv[1].endsWith("sim-unlock.mjs");
if (isMain) {
  const result = runAssertions();
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) {
    console.error("sim-unlock assertions failed:", result.errors.join("; "));
    process.exit(1);
  }
  console.log(
    `sim ok: ${result.realistic.weeks} weeks → ${result.ALBUM_TOTAL} photos; binge ≥ ${result.binge.minDaysForPaidPoses} days for ${result.TOTAL_PAID_BONES} bones`,
  );
}
