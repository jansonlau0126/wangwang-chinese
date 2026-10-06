import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const base = process.env.WW_BASE || "http://127.0.0.1:4174";
const out = "/workspace/wangwang-shots-v4";
mkdirSync(out, { recursive: true });

async function shot(page, name) {
  const file = path.join(out, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("shot", file);
}

const browser = await chromium.launch();
const phone = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: "zh-HK",
});
const page = await phone.newPage();
await page.goto(base + "/#/", { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__WW);
await page.evaluate(() => { localStorage.clear(); location.reload(); });
await page.waitForFunction(() => window.__WW);

// Seed: 8 days done, some bones, mixed album on 毛毛
await page.evaluate(() => {
  window.__WW.completeDays(8);
  window.__WW.grantBones(20);
  const s = window.__WW.getState();
  const slug = "01-maomao-toy-poodle";
  s.album[slug].happy = true;
  s.album[slug].sleep = true;
  s.bones = 12;
  s.pendingPose = null;
  // season-complete home with warmup: also prepare a mid state for map
  window.__WW.save();
  window.__WW.render();
});

// dogs page
await page.evaluate(() => window.__WW.show("dogs"));
await page.waitForSelector('[data-screen="dogs"]');
await shot(page, "phone-dogs.png");

// album mixed
await page.evaluate(() => window.__WW.openAlbum("01-maomao-toy-poodle"));
await page.waitForSelector('[data-screen="album"]');
await shot(page, "phone-album.png");

// unlock modal
await page.evaluate(() => {
  const s = window.__WW.getState();
  s.pendingPose = { slug: "01-maomao-toy-poodle", pose: "stretch" };
  s.album["01-maomao-toy-poodle"].stretch = true;
  window.__WW.save();
  window.__WW.render();
});
await page.waitForSelector(".pose-sheet");
await shot(page, "phone-unlock-modal.png");
await page.evaluate(() => window.__WW.dismissPoseUnlock());

// reward with bones
await page.evaluate(() => {
  const s = window.__WW.getState();
  s.pendingReward = {
    kind: "lesson",
    day: 8,
    companion: "01-maomao-toy-poodle",
    newDog: "03-duoduo-corgi",
    ball: null,
    bonesEarned: ["lesson", "zero"],
    bonesToday: 2,
    firstTime: true,
  };
  s.screen = "reward";
  window.__WW.save();
  window.__WW.render();
});
await page.waitForSelector('[data-screen="reward"]');
await shot(page, "phone-reward.png");

// home with 溫習 after season complete
await page.evaluate(() => {
  window.__WW.completeDays(60);
  const s = window.__WW.getState();
  s.pendingReward = null;
  s.cursorDay = 60;
  window.__WW.save();
  window.__WW.show("home");
});
await page.waitForSelector('[data-screen="home"]');
await shot(page, "phone-home-review.png");

// map top (partial progress)
await page.evaluate(() => {
  // reset to 13 days for map look
  const s = window.__WW.getState();
  s.completedDays = Array.from({ length: 13 }, (_, i) => i + 1);
  s.cursorDay = 14;
  const u = 1 + Math.floor(13 / 4);
  // album sits
  window.__WW.save();
  window.__WW.show("map");
});
await page.waitForSelector('[data-screen="map"]');
await page.waitForTimeout(400);
await shot(page, "phone-map.png");

await phone.close();

const tablet = await browser.newContext({
  viewport: { width: 1024, height: 1366 },
  deviceScaleFactor: 1,
  locale: "zh-HK",
});
const tp = await tablet.newPage();
await tp.goto(base + "/#/", { waitUntil: "networkidle" });
await tp.waitForFunction(() => window.__WW);
await tp.evaluate(() => {
  localStorage.clear();
  location.reload();
});
await tp.waitForFunction(() => window.__WW);
await tp.evaluate(() => {
  window.__WW.completeDays(8);
  window.__WW.grantBones(16);
  const s = window.__WW.getState();
  s.album["01-maomao-toy-poodle"].happy = true;
  s.album["01-maomao-toy-poodle"].sleep = true;
  window.__WW.save();
  window.__WW.show("dogs");
});
await tp.waitForSelector('[data-screen="dogs"]');
await shot(tp, "tablet-dogs.png");
await tp.evaluate(() => window.__WW.openAlbum("01-maomao-toy-poodle"));
await tp.waitForSelector('[data-screen="album"]');
await shot(tp, "tablet-album.png");

await browser.close();
console.log("v4 shots done");
