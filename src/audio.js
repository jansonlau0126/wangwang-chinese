/**
 * Device speechSynthesis only — no shipped mp3, no cloud TTS.
 *
 * Single-char tone strategy (documented):
 * Most browser engines ignore Jyutping and often misread isolated characters.
 * Most reliable approach without phoneme SSML: speak the **example word first**
 * (context forces the intended reading), pause, then speak the **character**
 * for isolation practice. Jyutping is always shown in the UI as ground truth.
 */

let token = 0;
let voicesReady = false;
let voicesWaiters = [];
const NOTICE_KEY = "ww-yue-voice-notice-v1";

const YUE_LANG = /^(yue)([-_]|$)|zh[-_](hant[-_])?hk\b|zh[-_]yue\b/i;
const YUE_NAME = /cantonese|粵語|粤语|廣東話|广东话|sin[\s-]?ji|hiu\s?gaai|hiu\s?maan|wan\s?lung|yun[\s-]?jyun|gaai/i;
const MANDARIN_LANG = /^(zh[-_](cn|sg|tw|hans)|cmn)/i;

function allVoices() {
  if (typeof speechSynthesis === "undefined") return [];
  try {
    return speechSynthesis.getVoices() || [];
  } catch {
    return [];
  }
}

function isYueVoice(voice) {
  if (!voice) return false;
  const lang = String(voice.lang || "");
  const name = String(voice.name || "");
  if (MANDARIN_LANG.test(lang) && !YUE_LANG.test(lang) && !YUE_NAME.test(name)) return false;
  if (YUE_LANG.test(lang)) return true;
  if (YUE_NAME.test(`${name} ${lang}`)) return true;
  return false;
}

/** Prefer zh-HK / yue voices; never return a Mandarin voice. */
export function pickCantoneseVoice(voices = allVoices()) {
  const yue = voices.filter(isYueVoice);
  if (!yue.length) return null;
  const score = (v) => {
    const lang = String(v.lang || "").toLowerCase();
    const name = String(v.name || "").toLowerCase();
    let s = 0;
    if (/zh[-_]hk/.test(lang) || /yue[-_]hk/.test(lang)) s += 50;
    else if (/^yue/.test(lang) || /zh[-_]yue/.test(lang)) s += 40;
    else if (/zh[-_]hant[-_]hk/.test(lang)) s += 45;
    if (/sin[\s-]?ji|hiu\s?gaai|粵語（香港）|粤语（香港）|hong\s*kong/.test(name)) s += 20;
    if (/hiu\s?maan|wan\s?lung/.test(name)) s += 15;
    if (v.localService) s += 5;
    return s;
  };
  return yue.slice().sort((a, b) => score(b) - score(a))[0];
}

export function hasCantoneseVoice() {
  return Boolean(pickCantoneseVoice());
}

function flushVoicesWaiters() {
  voicesReady = true;
  const list = voicesWaiters.splice(0, voicesWaiters.length);
  list.forEach((fn) => fn());
}

export function warmVoices() {
  if (typeof speechSynthesis === "undefined") {
    flushVoicesWaiters();
    return;
  }
  const bump = () => {
    allVoices();
    if (allVoices().length || voicesReady) flushVoicesWaiters();
  };
  bump();
  speechSynthesis.addEventListener("voiceschanged", () => {
    bump();
  });
  // Some engines never fire voiceschanged; time out so UI can settle.
  setTimeout(() => flushVoicesWaiters(), 1500);
}

/** Resolves when voices are loaded or after timeout. */
export function whenVoicesReady() {
  if (voicesReady || (typeof speechSynthesis !== "undefined" && allVoices().length)) {
    voicesReady = true;
    return Promise.resolve(hasCantoneseVoice());
  }
  return new Promise((resolve) => {
    voicesWaiters.push(() => resolve(hasCantoneseVoice()));
    setTimeout(() => {
      flushVoicesWaiters();
      resolve(hasCantoneseVoice());
    }, 1600);
  });
}

export function stopAudio() {
  token += 1;
  if (typeof speechSynthesis !== "undefined") {
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

function speakOnce(text, myToken, { slow = false } = {}) {
  return new Promise((resolve) => {
    if (typeof speechSynthesis === "undefined" || myToken !== token) {
      resolve(false);
      return;
    }
    const voice = pickCantoneseVoice();
    if (!voice) {
      resolve(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice.lang || "zh-HK";
    utterance.voice = voice;
    utterance.rate = slow ? 0.55 : 0.85;
    utterance.onend = () => resolve(myToken === token);
    utterance.onerror = () => resolve(false);
    try {
      speechSynthesis.speak(utterance);
    } catch {
      resolve(false);
    }
  });
}

function pause(ms, myToken) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(myToken === token), ms);
  });
}

/**
 * Play reading for a character entry. Call from a user-gesture handler on iOS.
 * Returns { ok, voice, mode }.
 */
export async function playReading(entry, { slow = false } = {}) {
  const myToken = ++token;
  if (typeof speechSynthesis !== "undefined") {
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
  await whenVoicesReady();
  if (myToken !== token) return { ok: false, voice: false, mode: "stopped" };
  const voice = hasCantoneseVoice();
  if (!voice) return { ok: false, voice: false, mode: "none" };

  // Word first (contextual reading), then isolated character.
  const word = entry.exampleWord || entry.char;
  const wordOk = await speakOnce(word, myToken, { slow });
  if (myToken !== token) return { ok: false, voice: true, mode: "stopped" };
  if (!wordOk) return { ok: false, voice: true, mode: "none" };
  const gap = await pause(slow ? 380 : 260, myToken);
  if (!gap) return { ok: true, voice: true, mode: "word-only" };
  const charOk = await speakOnce(entry.char, myToken, { slow });
  if (myToken !== token) return { ok: true, voice: true, mode: "stopped" };
  return { ok: Boolean(charOk || wordOk), voice: true, mode: charOk ? "word+char" : "word-only" };
}

/** @deprecated kept for tests — same as playReading without word */
export async function playText(text, { slow = false } = {}) {
  const myToken = ++token;
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  await whenVoicesReady();
  if (myToken !== token) return "stopped";
  const ok = await speakOnce(text, myToken, { slow });
  return ok ? "tts" : "none";
}

export function shouldShowNoVoiceNotice() {
  try {
    return localStorage.getItem(NOTICE_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markNoVoiceNoticeSeen() {
  try {
    localStorage.setItem(NOTICE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function unicodeName(char) {
  return `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
}
