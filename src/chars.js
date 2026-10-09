import characters from "../data/characters.json";
import charactersS2 from "../data/characters-s2.json";

export { characters, charactersS2 };

export const DAY_TOTAL = Math.max(0, ...characters.map((entry) => entry.day));
export const S2_DAY_TOTAL = Math.max(0, ...charactersS2.map((entry) => entry.day));

export const WEEK_TOTAL = Math.ceil(DAY_TOTAL / 5);
export const S2_WEEK_TOTAL = Math.ceil(S2_DAY_TOTAL / 5);

export function charsForSeason(season = "s1") {
  return season === "s2" ? charactersS2 : characters;
}

export function dayTotalForSeason(season = "s1") {
  return season === "s2" ? S2_DAY_TOTAL : DAY_TOTAL;
}

export function dayChars(day, season = "s1") {
  return charsForSeason(season).filter((entry) => entry.day === day);
}

export function weekChars(week, season = "s1") {
  const start = (week - 1) * 5 + 1;
  const end = start + 4;
  return charsForSeason(season).filter((entry) => entry.day >= start && entry.day <= end);
}

export function findChar(char, season = null) {
  if (season === "s2") return charactersS2.find((entry) => entry.char === char) || null;
  if (season === "s1") return characters.find((entry) => entry.char === char) || null;
  return (
    characters.find((entry) => entry.char === char) ||
    charactersS2.find((entry) => entry.char === char) ||
    null
  );
}

export function weekOfDay(day) {
  return Math.ceil(day / 5);
}
