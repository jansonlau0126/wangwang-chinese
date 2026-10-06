import characters from "../data/characters.json";

export { characters };

export const DAY_TOTAL = 10;

export function dayChars(day) {
  return characters.filter((entry) => entry.day === day);
}

export function findChar(char) {
  return characters.find((entry) => entry.char === char) || null;
}
