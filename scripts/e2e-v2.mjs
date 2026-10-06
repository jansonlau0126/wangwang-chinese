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

await page.goto(base + "/#/", { waitUntil: "networkidle" });
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
await tpage.goto(base + "/#/", { waitUntil: "networkidle" });
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

await browser.close();
console.log("e2e ok");
