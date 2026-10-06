import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const base = process.env.WW_BASE || "http://127.0.0.1:4173";
const out = "/workspace/wangwang-shots-v5";
mkdirSync(out, { recursive: true });

function mockSpeech(voices) {
  return `
(() => {
  const list = ${JSON.stringify(voices)};
  const Utterance = function (text) {
    this.text = text;
    this.lang = "";
    this.voice = null;
    this.rate = 1;
    this.onend = null;
    this.onerror = null;
  };
  const spoken = [];
  const synth = {
    speaking: false,
    pending: false,
    getVoices() { return list.map((v) => ({ ...v })); },
    speak(u) {
      spoken.push({ text: u.text, lang: u.lang, voice: u.voice && u.voice.name });
      synth.speaking = true;
      setTimeout(() => {
        synth.speaking = false;
        if (typeof u.onend === "function") u.onend();
      }, 30);
    },
    cancel() { synth.speaking = false; },
    addEventListener(type, fn) {
      if (type === "voiceschanged") setTimeout(fn, 0);
    },
  };
  Object.defineProperty(window, "speechSynthesis", { configurable: true, get: () => synth });
  window.SpeechSynthesisUtterance = Utterance;
  window.__WW_SPOKEN = spoken;
})();`;
}

const yueVoices = [
  { name: "Google 粵語（香港）", lang: "zh-HK", localService: true, default: true },
];
const mandarinOnly = [
  { name: "Google 普通话", lang: "zh-CN", localService: true, default: true },
];

async function shot(page, name) {
  const file = path.join(out, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("shot", file);
}

async function boot(page) {
  await page.goto(base + "/?e2e=1#/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__WW);
  await page.evaluate(() => { localStorage.clear(); location.reload(); });
  await page.waitForFunction(() => window.__WW);
  await page.waitForSelector('[data-screen="home"]');
}

async function withVoices(browser, voices, label) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    locale: "zh-HK",
  });
  const page = await ctx.newPage();
  await page.addInitScript(mockSpeech(voices));
  await boot(page);
  const has = await page.evaluate(async () => {
    await window.__WW.whenVoicesReady();
    return window.__WW.hasCantoneseVoice();
  });
  const expectYue = voices.some((v) => /hk|yue|粵/i.test(String(v.lang) + String(v.name)));
  console.log(label, "hasCantoneseVoice", has, "expectYue", expectYue);
  if (expectYue && !has) throw new Error("expected Cantonese voice");
  if (!expectYue && has) throw new Error("must not treat non-Yue as Cantonese");

  if (expectYue) {
    await page.click('[data-act="start"]');
    await page.waitForSelector('[data-screen="practice"]');
    await page.waitForFunction(() => window.__WW_SPOKEN.length >= 1);
    await page.waitForTimeout(80);
    const spoken = await page.evaluate(() => window.__WW_SPOKEN.slice());
    console.log("spoken", spoken);
    if (!spoken.length) throw new Error("expected TTS utterances on start");
    // Prefer word-first; char may follow asynchronously
    const jyut = await page.locator(".practice .jyut").first().textContent();
    if (!/[a-z]+[1-6]/.test(jyut || "")) throw new Error("missing jyutping on practice: " + jyut);
    await shot(page, "phone-practice-jyutping.png");

    await page.evaluate(() => {
      window.__WW.completeDays(1);
      window.__WW.openCards();
    });
    await page.waitForSelector('[data-screen="cards"]');
    await page.click('.vc-cell[data-act="open-card"]');
    await page.waitForSelector("#card-sheet");
    await shot(page, "phone-card-detail.png");
    const muted = await page.locator('[data-act="speak-card"]').first().evaluate((el) => el.classList.contains("speak-muted"));
    if (muted) throw new Error("speak should not be muted with Yue voice");
  } else {
    await page.click('[data-act="start"]');
    await page.waitForSelector('[data-screen="practice"]');
    await page.waitForTimeout(120);
    const spoken = await page.evaluate(() => window.__WW_SPOKEN.slice());
    if (spoken.length) throw new Error("must not speak without Yue voice: " + JSON.stringify(spoken));
    await page.waitForSelector(".voice-notice, .hint.is-warn");
    if (label === "mandarin-only") await shot(page, "phone-no-yue-notice.png");
    await page.evaluate(() => {
      const st = window.__WW.getState();
      if (st.screen === "practice") {
        st.active = null;
        st.screen = "about";
        window.__WW.save();
        window.__WW.render();
      } else {
        window.__WW.show("about");
      }
    });
    // show() may not be exposed for about via tab when focus mode — force hash
    await page.evaluate(() => {
      window.__WW.getState().screen = "about";
      window.__WW.getState().active = null;
      window.__WW.save();
      window.__WW.render();
    });
    await page.waitForSelector(".voice-help");
    if (label === "mandarin-only") await shot(page, "phone-about-voice-help.png");
    await page.evaluate(() => {
      window.__WW.completeDays(1);
      window.__WW.openCards();
    });
    await page.waitForSelector('[data-screen="cards"]');
    await page.click('.vc-cell[data-act="open-card"]');
    await page.waitForSelector("#card-sheet");
    const muted = await page.locator('[data-act="speak-card"]').first().evaluate((el) => el.classList.contains("speak-muted"));
    if (!muted) throw new Error("speak should be muted without Yue voice");
  }
  await ctx.close();
}

const browser = await chromium.launch();
await withVoices(browser, yueVoices, "with-yue");
await withVoices(browser, mandarinOnly, "mandarin-only");
await withVoices(browser, [], "no-voices");

{
  const ctx = await browser.newContext({
    viewport: { width: 820, height: 1180 },
    deviceScaleFactor: 2,
    locale: "zh-HK",
  });
  const page = await ctx.newPage();
  await page.addInitScript(mockSpeech(yueVoices));
  await boot(page);
  await page.click('[data-act="start"]');
  await page.waitForSelector('[data-screen="practice"]');
  await shot(page, "tablet-practice-jyutping.png");
  await ctx.close();
}

await browser.close();
console.log("e2e-tts ok");
