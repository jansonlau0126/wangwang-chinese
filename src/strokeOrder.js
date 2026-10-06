/**
 * Reorder hanzi-writer stroke JSON to Hong Kong EDB order.
 * `order` is 1-based indices of the original strokes. `reverse` is 1-based
 * indices after that reorder whose median point lists should run the other way.
 * Reversing medians does not reverse the outline path; Season 1 does not use it.
 */
export function applyStrokeOverride(raw, override) {
  const n = raw.strokes.length;
  const order = override?.order?.length
    ? override.order
    : Array.from({ length: n }, (_, i) => i + 1);
  if (order.length !== n) {
    throw new Error(`Stroke override length ${order.length} does not match ${n} strokes`);
  }
  const seen = new Set(order);
  if (seen.size !== n || order.some((i) => !Number.isInteger(i) || i < 1 || i > n)) {
    throw new Error(`Stroke override is not a permutation of 1..${n}`);
  }
  const strokes = order.map((i) => raw.strokes[i - 1]);
  const medians = order.map((i) => raw.medians[i - 1].map((point) => point.slice()));
  let radStrokes = raw.radStrokes;
  if (Array.isArray(radStrokes)) {
    const place = new Map(order.map((orig, index) => [orig - 1, index]));
    radStrokes = radStrokes.map((oldIndex) => {
      const next = place.get(oldIndex);
      if (next === undefined) throw new Error(`Radical stroke ${oldIndex} is not in the override`);
      return next;
    });
  }
  if (override?.reverse?.length) {
    for (const index of override.reverse) {
      if (!Number.isInteger(index) || index < 1 || index > n) {
        throw new Error(`Bad reverse index ${index}`);
      }
      medians[index - 1].reverse();
    }
  }
  return { strokes, medians, radStrokes };
}

/** Starter dog plus one new dog every four completed days, capped at the pack size. All 15 by day 56. */
export function unlockedDogCount(completedDays, totalDogs = 15) {
  const days = Math.max(0, completedDays | 0);
  return Math.min(totalDogs, 1 + Math.floor(days / 4));
}

export function hintTotal(stages) {
  if (!stages) return 0;
  return (stages.guided || 0) + (stages.light || 0) + (stages.free || 0);
}

export function dayHintTotal(hintMap) {
  return Object.values(hintMap || {}).reduce((sum, stages) => sum + hintTotal(stages), 0);
}

/**
 * Hidden ball photo uses a fixed rule (not random):
 * first time a companion finishes a zero-hint day, or every 3rd completed day
 * with that same dog. Already collected means no repeat.
 */
/** @deprecated Ball photos now use economy.canAwardBall (poses ready + companion + zero hints). */
export function shouldAwardBall({ zeroHints, daysWithCompanion, alreadyHas }) {
  if (alreadyHas) return false;
  if (zeroHints) return true;
  return false;
}
