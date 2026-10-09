import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { applyStrokeOverride, unlockedDogCount } from "../src/strokeOrder.js";
import { canAwardBall, grantBone, POSE_COSTS, remainingBoneCap, ALBUM_POSES } from "../src/economy.js";
import { runAssertions as runUnlockSim } from "./sim-unlock.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const characters = JSON.parse(readFileSync(path.join(root, "data/characters.json"), "utf8"));
const charactersS2 = JSON.parse(readFileSync(path.join(root, "data/characters-s2.json"), "utf8"));
const overrides = JSON.parse(readFileSync(path.join(root, "data/stroke-overrides.json"), "utf8"));
const manifest = JSON.parse(readFileSync(path.join(root, "assets/manifest.json"), "utf8"));
const chapters = JSON.parse(readFileSync(path.join(root, "data/chapters-s2.json"), "utf8"));

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function checkCharList(list, label) {
  assert(list.length === 180, `${label} should have 180 characters, got ${list.length}`);
  const days = new Set(list.map((c) => c.day));
  assert(days.size === 60, `${label} should cover 60 days, got ${days.size}`);
  for (let day = 1; day <= 60; day += 1) {
    assert(list.filter((c) => c.day === day).length === 3, `${label} day ${day} should have 3 characters`);
  }
  const seen = new Set();
  for (const entry of list) {
    assert(!seen.has(entry.char), `${label} duplicate character ${entry.char}`);
    seen.add(entry.char);
    assert(entry.jyutping && entry.exampleWord && entry.exampleJyutping, `${label} ${entry.char} missing reading fields`);
    assert(entry.verifiedAgainstEdb, `${label} ${entry.char} missing verifiedAgainstEdb`);
  }
  return seen;
}

const s1 = checkCharList(characters, "Season 1");
const s2 = checkCharList(charactersS2, "Season 2");
for (const ch of s2) {
  assert(!s1.has(ch), `S2 duplicates S1 character ${ch}`);
}

const rawDir = path.join(root, "node_modules/hanzi-writer-data");
function checkStrokes(list, label) {
  for (const entry of list) {
    const code = entry.char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
    const file = path.join(root, "data/strokes", `U+${code}.json`);
    assert(existsSync(file), `${label} missing stroke file for ${entry.char}`);
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
}
checkStrokes(characters, "S1");
checkStrokes(charactersS2, "S2");

const s2Overrides = charactersS2.filter((e) => e.strokeSource === "hwd-reorder" || e.strokeOrderOverride);
assert(s2Overrides.length === 64, `S2 should have 64 strokeOrderOverride chars, got ${s2Overrides.length}`);
for (const entry of s2Overrides) {
  assert(overrides[entry.char]?.order?.length === entry.strokes, `S2 override missing/length for ${entry.char}`);
}

const chuRaw = JSON.parse(readFileSync(path.join(rawDir, "出.json"), "utf8"));
const chu = JSON.parse(readFileSync(path.join(root, "data/strokes/U+51FA.json"), "utf8"));
assert(chu.strokes[0] === chuRaw.strokes[2], "出 stroke 1 should be original stroke 3");
assert(chu.strokes[1] === chuRaw.strokes[0], "出 stroke 2 should be original stroke 1");
assert(chu.strokes[2] === chuRaw.strokes[1], "出 stroke 3 should be original stroke 2");
assert(chu.modified && chu.modified.includes("3,1,2,4,5"), "出 should record the reorder");

for (const ch of ["母", "的", "來", "飛"]) {
  assert(overrides[ch]?.order?.length, `${ch} should have an override`);
}

assert(unlockedDogCount(0) === 1, "start with 毛毛");
assert(unlockedDogCount(3) === 1, "three days still one dog");
assert(unlockedDogCount(4) === 2, "four days unlock the second dog");
assert(unlockedDogCount(56) === 15, "56 days unlocks all 15");
assert(unlockedDogCount(60) === 15, "unlocks cap at 15");
const readyAlbum = { sit: true, happy: true, sleep: true, stretch: true, "act-a": true, "act-b": true, "expedition-a": false, "expedition-b": false, ball: false };
assert(canAwardBall(readyAlbum, { zeroHints: true, isCompanion: true }) === true, "ball when poses ready + zero + companion (expedition not required)");
assert(canAwardBall(readyAlbum, { zeroHints: true, isCompanion: false }) === false, "ball needs companion");
assert(canAwardBall({ ...readyAlbum, ball: true }, { zeroHints: true, isCompanion: true }) === false, "ball once");
assert(canAwardBall({ ...readyAlbum, happy: false }, { zeroHints: true, isCompanion: true }) === false, "ball needs all paid poses");
assert(POSE_COSTS.happy === 4 && POSE_COSTS["act-b"] === 6, "pose costs");
assert(POSE_COSTS["expedition-a"] === 8 && POSE_COSTS["expedition-b"] === 10, "expedition pose costs");
assert(ALBUM_POSES.length === 9, "album has 9 slots per dog");
{
  let eco = { bones: 0, boneLedger: [] };
  const a = grantBone(eco, "lesson");
  eco = { bones: a.bones, boneLedger: a.ledger };
  const b = grantBone(eco, "review");
  eco = { bones: b.bones, boneLedger: b.ledger };
  const c = grantBone(eco, "zero");
  assert(a.granted && b.granted && !c.granted, "daily bone cap is 2");
  assert(remainingBoneCap(eco.boneLedger) === 0, "cap exhausted");
}
{
  const sim = runUnlockSim();
  assert(sim.errors.length === 0, `unlock sim: ${sim.errors.join("; ")}`);
  assert(sim.ALBUM_TOTAL === 135, "album total 135");
  console.log(`unlock sim: ${sim.realistic.weeks} weeks, binge ≥ ${sim.binge.minDaysForPaidPoses} days, ${sim.TOTAL_PAID_BONES} bones, ${sim.ALBUM_TOTAL} photos`);
}

// Manifest expedition poses
assert(manifest.dogs.length === 15, "15 dogs");
assert(manifest.poses.includes("expedition-a") && manifest.poses.includes("expedition-b"), "manifest lists expedition poses");
for (const dog of manifest.dogs) {
  for (const pose of ["expedition-a", "expedition-b"]) {
    const rel = dog.poses[pose];
    assert(rel, `${dog.slug} missing ${pose}`);
    assert(existsSync(path.join(root, rel)), `missing file ${rel}`);
  }
}

assert(chapters.chapters.length === 15, "15 S2 chapters");
assert(chapters.stages.length === 5, "5 S2 stages");

// No family-mode leftovers in source
for (const file of readdirSync(path.join(root, "src")).filter((f) => f.endsWith(".js"))) {
  const text = readFileSync(path.join(root, "src", file), "utf8");
  assert(!/家長模式|邀請碼|親子卡|家庭邀請/.test(text), `family-mode remnant in src/${file}`);
}

// Font subset must cover every character + exampleWord glyph (and UI CJK that FreeHKKai has).
const fontPath = path.join(root, "public/fonts/FreeHKKai-subset.woff2");
assert(existsSync(fontPath), "missing FreeHKKai subset woff2");
const huninnPath = path.join(root, "public/fonts/jf-openhuninn-subset.woff2");
assert(existsSync(huninnPath), "missing jf-openhuninn subset woff2");
assert(existsSync(path.join(root, "public/fonts/jf-openhuninn-OFL.txt")), "missing jf-openhuninn OFL text");
const uiFiles = [
  ...readdirSync(path.join(root, "src")).filter((f) => f.endsWith(".js")).map((f) => path.join(root, "src", f)),
  path.join(root, "index.html"),
  path.join(root, "public/404.html"),
];
const needed = new Set();
for (const entry of [...characters, ...charactersS2]) {
  for (const ch of entry.char) needed.add(ch);
  for (const ch of entry.exampleWord) needed.add(ch);
}
for (const file of uiFiles) {
  if (!existsSync(file)) continue;
  for (const ch of readFileSync(file, "utf8")) {
    if (ch >= "\u4e00" && ch <= "\u9fff") needed.add(ch);
  }
}
const checkPy = `
from fontTools.ttLib import TTFont
import json, sys
font = TTFont(sys.argv[1])
cmap = {}
for table in font["cmap"].tables:
    cmap.update(table.cmap)
needed = json.loads(sys.argv[2])
src_path = sys.argv[3] if len(sys.argv) > 3 else ""
src_cmap = None
if src_path:
    try:
        src = TTFont(src_path)
        src_cmap = {}
        for table in src["cmap"].tables:
            src_cmap.update(table.cmap)
    except Exception:
        src_cmap = None
missing = []
for ch in needed:
    cp = ord(ch)
    if src_cmap is not None and cp not in src_cmap:
        continue
    if cp not in cmap:
        missing.append(ch)
if missing:
    print("MISSING:" + "".join(missing))
    sys.exit(1)
print("font ok", len(needed), "checked")
`;
const srcFont = [
  "/tmp/freehkfont/Free-HK-Kai_4700-v1.02.ttf",
  path.join(root, "vendor/Free-HK-Kai_4700-v1.02.ttf"),
].find((p) => existsSync(p)) || "";
const pyBins = ["/tmp/fontvenv/bin/python", "python3"];
let fontCheck = null;
for (const bin of pyBins) {
  fontCheck = spawnSync(bin, ["-c", checkPy, fontPath, JSON.stringify([...needed]), srcFont], {
    encoding: "utf8",
  });
  if (fontCheck.error && fontCheck.error.code === "ENOENT") continue;
  break;
}
assert(fontCheck && fontCheck.status === 0, `font subset missing glyphs: ${(fontCheck?.stdout || "") + (fontCheck?.stderr || "")}`);

console.log("check ok: S1+S2 180/180, strokes, 64 S2 overrides, no S1 overlap, dogs/expedition, unlock sim 135, font subsets");
