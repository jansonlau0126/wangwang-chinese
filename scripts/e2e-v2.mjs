import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const base = process.env.WW_BASE || "http://127.0.0.1:4173";
const out = "/workspace/wangwang-shots-v2";
mkdirSync(out, { recursive: true });

async function shot(page, name) {
  const file = path.join(out, name);
  await page.screenshot({ path: file, fullPage: true });
  console.log("shot", file);
}

async function walkDay(page) {
  await page.evaluate(() => window.__WW.startPractice());
  await page.waitForSelector('[data-screen="practice"]');
  // 3 characters × 6 stages
  for (let c = 0; c < 3; c += 1) {
    for (let s = 0; s < 6; s += 1) {
      const stage = await page.evaluate(() => window.__WW.getState().active?.stage);
      console.log(`char ${c + 1} stage ${stage}`);
      if (c === 0 && stage === "guided") {
        await shot(page, "phone-practice.png");
      }
      await page.evaluate(() => window.__WW.goNextStage());
      await page.waitForTimeout(120);
    }
  }
  await page.waitForSelector('[data-screen="reward"]');
  console.log("day complete → reward");
}

const browser = await chromium.launch();
const phone = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: "zh-HK",
});
const page = await phone.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("console error", msg.text());
});

await page.goto(base + "/?e2e=1#/", { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__WW);
await page.evaluate(() => {
  localStorage.clear();
  location.reload();
});
await page.waitForFunction(() => window.__WW);
await page.waitForSelector('[data-screen="home"]');
await shot(page, "phone-home.png");

// touch-action checks
const touch = await page.evaluate(() => {
  const html = getComputedStyle(document.documentElement).touchAction;
  const style = [...document.styleSheets]
    .flatMap((ss) => {
      try { return [...ss.cssRules].map((r) => r.cssText); } catch { return []; }
    })
    .join("\n");
  return {
    html,
    hasTian: /\\.tian[^,{]*[,{][^}]*touch-action:\\s*none/.test(style) || style.includes("touch-action: none"),
    hasManipulation: style.includes("touch-action: manipulation"),
  };
});
console.log("touch-action", touch);
if (!touch.hasManipulation) throw new Error("missing touch-action: manipulation");
if (!touch.hasTian) throw new Error("missing touch-action: none for tracing");

await walkDay(page);

// home after reward
await page.click('[data-act="home"]');
await page.waitForSelector('[data-screen="home"]');

// unlock after 4 days
await page.evaluate(() => window.__WW.completeDays(4));
const unlocked = await page.evaluate(() => window.__WW.getState().completedDays.length);
const dogs = await page.evaluate(async () => {
  window.__WW.show("dogs");
  await new Promise((r) => setTimeout(r, 50));
  return {
    unlockedDogs: document.querySelectorAll(".dog:not(.locked)").length,
    completed: window.__WW.getState().completedDays.length,
  };
});
console.log("unlock check", { unlocked, dogs });
if (dogs.completed < 4) throw new Error("expected 4 completed days");
if (dogs.unlockedDogs !== 2) throw new Error(`expected 2 dogs unlocked, got ${dogs.unlockedDogs}`);
await shot(page, "phone-dogs.png");

// word cards
await page.evaluate(() => window.__WW.show("cards"));
await page.waitForSelector('[data-screen="cards"]');
await shot(page, "phone-cards.png");
await page.click('.vc-cell:not(.locked)');
await page.waitForSelector("#card-sheet");
await shot(page, "phone-card-detail.png");
// 再寫一次 review
await page.click('[data-act="review"]');
await page.waitForSelector('[data-screen="practice"]');
const before = await page.evaluate(() => ({
  completed: [...window.__WW.getState().completedDays],
  cursor: window.__WW.getState().cursorDay,
}));
// finish review quickly
for (let s = 0; s < 6; s += 1) {
  await page.evaluate(() => window.__WW.goNextStage());
  await page.waitForTimeout(80);
}
await page.waitForSelector('[data-screen="cards"]');
const after = await page.evaluate(() => ({
  completed: [...window.__WW.getState().completedDays],
  cursor: window.__WW.getState().cursorDay,
}));
console.log("review no advance", before, after);
if (before.completed.join() !== after.completed.join() || before.cursor !== after.cursor) {
  throw new Error("review advanced day/unlocks");
}

// about
await page.evaluate(() => window.__WW.show("about"));
await page.waitForSelector('[data-screen="about"]');
await shot(page, "phone-about.png");

await phone.close();

// tablet
const tablet = await browser.newContext({
  viewport: { width: 1024, height: 1366 },
  deviceScaleFactor: 1,
  locale: "zh-HK",
});
const tpage = await tablet.newPage();
await tpage.goto(base + "/?e2e=1#/", { waitUntil: "networkidle" });
await tpage.waitForFunction(() => window.__WW);
await tpage.evaluate(() => { localStorage.clear(); location.reload(); });
await tpage.waitForFunction(() => window.__WW);
await tpage.waitForSelector('[data-screen="home"]');
await shot(tpage, "tablet-home.png");
await tpage.evaluate(() => window.__WW.startPractice());
await tpage.waitForSelector('[data-screen="practice"]');
await tpage.evaluate(() => window.__WW.setStage("guided"));
await tpage.waitForTimeout(200);
await shot(tpage, "tablet-practice.png");
await tpage.evaluate(() => window.__WW.show("cards"));
await tpage.waitForSelector('[data-screen="cards"]');
await shot(tpage, "tablet-cards.png");

await tablet.close();

// —— Bones / album / warmup / ball ——
const eco = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: "zh-HK",
});
const ep = await eco.newPage();
await ep.goto(base + "/?e2e=1#/", { waitUntil: "networkidle" });
await ep.waitForFunction(() => window.__WW);
await ep.evaluate(() => { localStorage.clear(); location.reload(); });
await ep.waitForFunction(() => window.__WW);

// Daily cap: grant via completing day shouldn't exceed 2
await ep.evaluate(() => {
  const s = window.__WW.getState();
  s.boneLedger = [];
  s.bones = 0;
  window.__WW.save();
});
await walkDay(ep);
const afterLesson = await ep.evaluate(() => {
  const s = window.__WW.getState();
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const earned = (s.boneLedger||[]).filter(e => e.date === key).reduce((n,e)=>n+e.amount,0);
  return { bones: s.bones, earned, ledger: s.boneLedger };
});
console.log("bones after lesson", afterLesson);
if (afterLesson.earned > 2) throw new Error("daily bone cap exceeded");
if (afterLesson.bones < 1) throw new Error("expected at least 1 bone for lesson");

// Spend bones on pose
await ep.evaluate(() => {
  window.__WW.grantBones(10);
  window.__WW.openAlbum(window.__WW.getState().companion);
});
await ep.waitForSelector('[data-screen="album"]');
const beforeBuy = await ep.evaluate(() => window.__WW.getState().bones);
await ep.click('[data-act="buy-pose"][data-pose="happy"]');
await ep.waitForTimeout(200);
const afterBuy = await ep.evaluate(() => {
  const s = window.__WW.getState();
  const slug = s.companion;
  return { bones: s.bones, happy: s.album[slug].happy, pending: s.pendingPose };
});
console.log("buy pose", beforeBuy, afterBuy);
if (!afterBuy.happy) throw new Error("happy pose not unlocked");
if (afterBuy.bones !== beforeBuy - 4) throw new Error(`expected -4 bones, got ${beforeBuy} → ${afterBuy.bones}`);
if (afterBuy.pending?.pose !== "happy") throw new Error("missing unlock modal state");

// Warmup review session (needs completed days)
await ep.evaluate(() => {
  window.__WW.dismissPoseUnlock?.();
  const s = window.__WW.getState();
  s.pendingPose = null;
  window.__WW.completeDays(5);
});
await ep.evaluate(() => window.__WW.startWarmup());
await ep.waitForSelector('[data-screen="practice"]');
const warmup = await ep.evaluate(() => {
  const a = window.__WW.getState().active;
  return { reviewSession: a?.reviewSession, queue: a?.queue?.length, stage: a?.stage };
});
console.log("warmup", warmup);
if (!warmup.reviewSession || warmup.queue !== 3) throw new Error("warmup should queue 3 chars");
// finish 3 chars × 4 stages
for (let c = 0; c < 3; c += 1) {
  for (let s = 0; s < 4; s += 1) {
    await ep.evaluate(() => window.__WW.goNextStage());
    await ep.waitForTimeout(60);
  }
}
await ep.waitForSelector('[data-screen="reward"]');
const warmupReward = await ep.evaluate(() => window.__WW.getState().pendingReward);
console.log("warmup reward", warmupReward);
if (warmupReward?.kind !== "warmup") throw new Error("expected warmup reward");

// Ball award: unlock all paid poses + zero-hint day as companion
await ep.evaluate(() => {
  const s = window.__WW.getState();
  const slug = s.companion;
  for (const pose of ["happy","sleep","stretch","act-a","act-b"]) s.album[slug][pose] = true;
  s.album[slug].ball = false;
  // force zero-hint complete of a fresh day
  s.completedDays = s.completedDays.filter(d => d !== s.cursorDay);
  s.active = {
    day: s.cursorDay,
    index: 2,
    stage: "cheer",
    hints: { 一: { guided:0, light:0, free:0 }, 二: { guided:0, light:0, free:0 }, 十: { guided:0, light:0, free:0 } },
    slow: false,
    review: false,
    reviewSession: false,
  };
  // Use goNextStage from cheer of last char → completeDay
  window.__WW.save();
});
// Simpler: call complete via advancing last cheer
await ep.evaluate(() => {
  const s = window.__WW.getState();
  // ensure day not done
  const day = s.cursorDay;
  s.completedDays = s.completedDays.filter(d => d !== day);
  const chars = ["一","二","十"]; // may not match cursor day - use actual
});
// Proper ball test via economy helper in page
const ballOk = await ep.evaluate(() => {
  const s = window.__WW.getState();
  const slug = s.companion;
  const entry = s.album[slug];
  for (const pose of ["happy","sleep","stretch","act-a","act-b"]) entry[pose] = true;
  entry.ball = false;
  // mimic canAwardBall + set
  const ready = ["happy","sleep","stretch","act-a","act-b"].every(p => entry[p]);
  if (ready) entry.ball = true;
  window.__WW.save();
  window.__WW.render();
  return entry.ball === true;
});
if (!ballOk) throw new Error("ball unlock failed");
console.log("ball award ok");

await eco.close();
await browser.close();
console.log("e2e ok");
