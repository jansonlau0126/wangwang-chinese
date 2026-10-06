import manifest from "../data/audio-manifest.json";

let token = 0;
let current = null;
const fileSet = new Set(manifest.files || []);

function hex(char) {
  return char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
}

export function unicodeName(char) {
  return `U+${hex(char)}`;
}

export function stopAudio() {
  token += 1;
  if (current) {
    current.pause();
    current = null;
  }
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

function hkVoice() {
  if (typeof speechSynthesis === "undefined") return null;
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((voice) => /^(zh|yue)[-_](hant[-_])?hk|yue/i.test(voice.lang)) ||
    voices.find((voice) => /cantonese|粵語|粤语/i.test(`${voice.name} ${voice.lang}`)) ||
    null
  );
}

function playFile(url, myToken) {
  return new Promise((resolve) => {
    const audio = new Audio();
    current = audio;
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      if (current === audio) current = null;
      resolve(ok && myToken === token);
    };
    audio.addEventListener("error", () => finish(false));
    audio.addEventListener("ended", () => finish(true));
    audio.src = url;
    const pending = audio.play();
    if (pending && typeof pending.catch === "function") pending.catch(() => finish(false));
  });
}

function speak(text, myToken, { slow = false } = {}) {
  return new Promise((resolve) => {
    if (typeof speechSynthesis === "undefined" || myToken !== token) {
      resolve(false);
      return;
    }
    const voice = hkVoice();
    if (!voice) {
      resolve(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-HK";
    utterance.voice = voice;
    utterance.rate = slow ? 0.55 : 0.82;
    utterance.onend = () => resolve(myToken === token);
    utterance.onerror = () => resolve(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  });
}

function manifestUrl(name) {
  if (!fileSet.has(name)) return null;
  return `/assets/audio/${name}`;
}

export function audioFileForChar(char) {
  return manifestUrl(`${unicodeName(char)}.mp3`);
}

export function audioFileForWord(char) {
  return manifestUrl(`${unicodeName(char)}_word.mp3`);
}

async function playOne(url, text, myToken, opts) {
  if (url) {
    const ok = await playFile(url, myToken);
    if (myToken !== token) return "stopped";
    if (ok) return "file";
  }
  const spoken = await speak(text, myToken, opts);
  if (myToken !== token) return "stopped";
  return spoken ? "tts" : "none";
}

/**
 * Plays assets/audio/U+XXXX.mp3 and U+XXXX_word.mp3 when listed in the
 * audio manifest; otherwise falls back to speechSynthesis (zh-HK / yue).
 * Call directly from a tap handler so the first utterance unlocks iOS audio.
 */
export async function playReading(entry, { slow = false } = {}) {
  const myToken = ++token;
  if (current) {
    current.pause();
    current = null;
  }
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  const charResult = await playOne(audioFileForChar(entry.char), entry.char, myToken, { slow });
  if (myToken !== token || charResult === "stopped") {
    return { char: charResult, word: "stopped", voice: Boolean(hkVoice()) };
  }
  const wordResult = await playOne(audioFileForWord(entry.char), entry.exampleWord, myToken, { slow });
  return { char: charResult, word: wordResult, voice: Boolean(hkVoice()) };
}

/** Speak only the character (or word). Safe to call from a tap handler. */
export async function playText(text, { slow = false, kind = "char", char } = {}) {
  const myToken = ++token;
  if (current) {
    current.pause();
    current = null;
  }
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  const url = kind === "word" && char ? audioFileForWord(char) : char ? audioFileForChar(char) : null;
  return playOne(url, text, myToken, { slow });
}

export function warmVoices() {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener("voiceschanged", () => {
    speechSynthesis.getVoices();
  });
}
