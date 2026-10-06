import { chromium } from "playwright";

const base = process.env.WW_BASE || "http://127.0.0.1:4173";
const out = "/workspace/wangwang-shots-v3";

async function boot(page) {
  await page.goto(base + "/#/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__WW);
  await page.evaluate(() => { localStorage.clear(); location.reload(); });
  await page.waitForFunction(() => window.__WW);
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
}

const browser = await chromium.launch();
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "zh-HK" });
const page = await phone.newPage();
await boot(page);
await page.evaluate(() => {
  window.__WW.completeDays(13);
  window.__WW.show("map");
});
await page.waitForSelector("#trail-scene");
await page.waitForTimeout(700);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(250);
await page.screenshot({ path: `${out}/phone-map.png`, fullPage: false });
console.log("phone-map.png");

await page.evaluate(() => {
  const el = document.querySelector('[data-stone="21"]');
  if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
});
await page.waitForTimeout(350);
await page.screenshot({ path: `${out}/phone-map-2.png`, fullPage: false });
console.log("phone-map-2.png");

const overflow = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
  stones: document.querySelectorAll(".stone").length,
  clearings: document.querySelectorAll(".clearing").length,
  trailW: document.getElementById("trail-scene")?.getBoundingClientRect().width,
}));
console.log("layout", overflow);
if (overflow.scrollW > overflow.clientW + 2) {
  throw new Error(`horizontal overflow ${overflow.scrollW} > ${overflow.clientW}`);
}
await phone.close();

const tablet = await browser.newContext({ viewport: { width: 1024, height: 1366 }, deviceScaleFactor: 1, locale: "zh-HK" });
const t = await tablet.newPage();
await boot(t);
await t.evaluate(() => {
  window.__WW.completeDays(13);
  window.__WW.show("map");
});
await t.waitForSelector("#trail-scene");
await t.waitForTimeout(500);
await t.evaluate(() => window.scrollTo(0, 0));
await t.waitForTimeout(200);
await t.screenshot({ path: `${out}/tablet-map.png`, fullPage: false });
console.log("tablet-map.png");
await browser.close();
console.log("map shots ok");
