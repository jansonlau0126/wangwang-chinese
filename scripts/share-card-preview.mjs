/**
 * Render daily / chapter / finale share-card PNGs via Playwright (?e2e).
 * Usage: WW_BASE=http://127.0.0.1:4173 node scripts/share-card-preview.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const base = process.env.WW_BASE || "http://127.0.0.1:4173";
const out = "/workspace/wangwang-share-preview";
mkdirSync(out, { recursive: true });

function dataUrlToFile(dataUrl, file) {
  const b64 = dataUrl.split(",")[1];
  writeFileSync(file, Buffer.from(b64, "base64"));
  console.log("wrote", file);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: "zh-HK",
});
const page = await ctx.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("console error", msg.text());
});

await page.goto(`${base}/?e2e#/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__WW);
await page.evaluate(() => {
  localStorage.clear();
  location.reload();
});
await page.waitForFunction(() => window.__WW);

// Seed S2 state so companions / progress look real
await page.evaluate(() => {
  window.__WW.completeDays(60);
  window.__WW.startSeason2();
  window.__WW.completeS2Days(15);
});

const cards = await page.evaluate(async () => {
  const st = window.__WW.getState();
  const companion = st.companion || "01-maomao-toy-poodle";

  const dailyReward = {
    season: "s2",
    day: 1,
    companion,
    bonesToday: 2,
    chars: ["哭", "幫", "快"],
    shareKind: "daily",
  };
  const chapterReward = {
    season: "s2",
    day: 16,
    companion: "04-doudou-dachshund",
    bonesToday: 2,
    chars: ["街", "路", "巴"],
    newChapter: "ch04",
  };
  const finaleReward = {
    season: "s2",
    day: 60,
    companion,
    bonesToday: 2,
    chars: ["夢", "想", "家"],
    s2Complete: true,
    shareKind: "finale",
  };

  // fix completed count for progress lines
  st.s2.completedDays = Array.from({ length: 1 }, (_, i) => i + 1);
  const daily = window.__WW.sharePayloadFromReward(dailyReward);
  st.s2.completedDays = Array.from({ length: 16 }, (_, i) => i + 1);
  const chapter = window.__WW.sharePayloadFromReward(chapterReward);
  st.s2.completedDays = Array.from({ length: 60 }, (_, i) => i + 1);
  const finale = window.__WW.sharePayloadFromReward(finaleReward);

  // Chapter sample chars may not match day 16 table — force display chars
  daily.chars = [
    { char: "哭", jyutping: "huk1" },
    { char: "幫", jyutping: "bong1" },
    { char: "快", jyutping: "faai3" },
  ];
  chapter.chars = [
    { char: "街", jyutping: "gaai1" },
    { char: "路", jyutping: "lou6" },
    { char: "巴", jyutping: "baa1" },
  ];

  async function toData(payload) {
    const canvas = await window.__WW.renderShareCardCanvas(payload);
    return canvas.toDataURL("image/png");
  }

  return {
    daily: await toData(daily),
    chapter: await toData(chapter),
    finale: await toData(finale),
    payloads: { daily, chapter, finale },
  };
});

console.log("kinds", {
  daily: cards.payloads.daily.kind,
  chapter: cards.payloads.chapter.kind,
  finale: cards.payloads.finale.kind,
});

dataUrlToFile(cards.daily, path.join(out, "01-daily.png"));
dataUrlToFile(cards.chapter, path.join(out, "02-chapter.png"));
dataUrlToFile(cards.finale, path.join(out, "03-finale.png"));

// Also screenshot reward page with prominent share button
await page.evaluate(() => {
  const st = window.__WW.getState();
  st.pendingReward = {
    season: "s2",
    day: 1,
    companion: st.companion || "01-maomao-toy-poodle",
    bonesToday: 2,
    earned: [{ reason: "day" }, { reason: "bonus" }],
    chars: ["哭", "幫", "快"],
  };
  st.screen = "reward";
  window.__WW.save();
  window.__WW.render();
});
await page.waitForSelector('[data-screen="reward"]');
await page.waitForSelector('[data-act="share-card"]');
await page.screenshot({ path: path.join(out, "04-reward-share-cta.png"), fullPage: false });
console.log("wrote", path.join(out, "04-reward-share-cta.png"));

// about page — ensure no AI draft line
await page.evaluate(() => window.__WW.show("about"));
await page.waitForSelector('[data-screen="about"]');
const aboutText = await page.locator('[data-screen="about"]').innerText();
if (/AI 草稿|之後會換真實/.test(aboutText)) {
  console.error("FAIL: draft copy still visible on about");
  process.exitCode = 1;
} else {
  console.log("about: draft copy cleared OK");
}
await page.screenshot({ path: path.join(out, "05-about.png"), fullPage: true });

await browser.close();
console.log("done", out);
