import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyStrokeOverride, shouldAwardBall, unlockedDogCount } from "../src/strokeOrder.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const characters = JSON.parse(readFileSync(path.join(root, "data/characters.json"), "utf8"));
const overrides = JSON.parse(readFileSync(path.join(root, "data/stroke-overrides.json"), "utf8"));

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

assert(characters.length === 30, "phase 1 should have 30 characters");
const days = new Set(characters.map((c) => c.day));
assert(days.size === 10, "phase 1 should cover 10 days");
for (let day = 1; day <= 10; day += 1) {
  assert(characters.filter((c) => c.day === day).length === 3, `day ${day} should have 3 characters`);
}

const rawDir = path.join(root, "node_modules/hanzi-writer-data");
for (const entry of characters) {
  const code = entry.char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
  const file = path.join(root, "data/strokes", `U+${code}.json`);
  assert(existsSync(file), `missing stroke file for ${entry.char}`);
  const stored = JSON.parse(readFileSync(file, "utf8"));
  assert(stored.char === entry.char, `${entry.char} file char mismatch`);
  assert(stored.strokes.length === entry.strokes, `${entry.char} stroke count ${stored.strokes.length} != ${entry.strokes}`);
  assert(stored.medians.length === entry.strokes, `${entry.char} median count mismatch`);
  const rawPath = path.join(rawDir, `${entry.char}.json`);
  if (existsSync(rawPath)) {
    const raw = JSON.parse(readFileSync(rawPath, "utf8"));
    const applied = applyStrokeOverride(raw, overrides[entry.char] || null);
    assert(JSON.stringify(stored.strokes) === JSON.stringify(applied.strokes), `${entry.char} strokes drifted from override`);
    assert(JSON.stringify(stored.medians) === JSON.stringify(applied.medians), `${entry.char} medians drifted from override`);
  }
}

const chuRaw = JSON.parse(readFileSync(path.join(rawDir, "出.json"), "utf8"));
const chu = JSON.parse(readFileSync(path.join(root, "data/strokes/U+51FA.json"), "utf8"));
assert(chu.strokes[0] === chuRaw.strokes[2], "出 stroke 1 should be original stroke 3");
assert(chu.strokes[1] === chuRaw.strokes[0], "出 stroke 2 should be original stroke 1");
assert(chu.strokes[2] === chuRaw.strokes[1], "出 stroke 3 should be original stroke 2");
assert(chu.modified && chu.modified.includes("3,1,2,4,5"), "出 should record the reorder");

assert(unlockedDogCount(0) === 1, "start with 毛毛");
assert(unlockedDogCount(1) === 1, "one day still one dog");
assert(unlockedDogCount(2) === 2, "two days unlock the second dog");
assert(unlockedDogCount(28) === 15, "28 days unlocks all 15");
assert(unlockedDogCount(40) === 15, "unlocks cap at 15");
assert(shouldAwardBall({ zeroHints: true, daysWithCompanion: 1, alreadyHas: false }) === true, "zero hints awards the ball");
assert(shouldAwardBall({ zeroHints: false, daysWithCompanion: 3, alreadyHas: false }) === true, "third day with the same dog awards the ball");
assert(shouldAwardBall({ zeroHints: true, daysWithCompanion: 1, alreadyHas: true }) === false, "ball is collected once");
assert(shouldAwardBall({ zeroHints: false, daysWithCompanion: 1, alreadyHas: false }) === false, "no bonus without a trigger");

console.log("check ok: 30 characters, stroke counts, 出 order, dog unlock, ball rule");
