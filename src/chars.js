import characters from "../data/characters.json";

export { characters };

export const DAY_TOTAL = Math.max(0, ...characters.map((entry) => entry.day));

export const WEEK_TOTAL = Math.ceil(DAY_TOTAL / 5);

export function dayChars(day) {
  return characters.filter((entry) => entry.day === day);
}

export function weekChars(week) {
  const start = (week - 1) * 5 + 1;
  const end = start + 4;
  return characters.filter((entry) => entry.day >= start && entry.day <= end);
}

export function findChar(char) {
  return characters.find((entry) => entry.char === char) || null;
}

export function weekOfDay(day) {
  return Math.ceil(day / 5);
}
