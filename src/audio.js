let token = 0;
let current = null;

function hex(char) {
  return char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
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
    voices.find((voice) => /zh-HK|yue-HK|zh-yue/i.test(voice.lang)) ||
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

function speak(text, myToken) {
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
    utterance.rate = 0.82;
    utterance.onend = () => resolve(myToken === token);
    utterance.onerror = () => resolve(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  });
}

async function playFirst(urls, text, myToken) {
  for (const url of urls) {
    if (myToken !== token) return "stopped";
    const ok = await playFile(url, myToken);
    if (myToken !== token) return "stopped";
    if (ok) return "file";
  }
  const spoken = await speak(text, myToken);
  return spoken ? "tts" : "none";
}

export function audioUrlsForChar(char) {
  const code = hex(char);
  return [`/assets/audio/${char}.mp3`, `/assets/audio/${code}.mp3`, `/assets/audio/U+${code}.mp3`];
}

export function audioUrlsForWord(char, word) {
  const code = hex(char);
  return [`/assets/audio/${word}.mp3`, `/assets/audio/${char}_word.mp3`, `/assets/audio/${code}_word.mp3`];
}

/** Plays a file under assets/audio when it exists, otherwise a zh-HK voice. Never falls through to Mandarin. */
export async function playReading(entry) {
  const myToken = ++token;
  if (current) {
    current.pause();
    current = null;
  }
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  const charResult = await playFirst(audioUrlsForChar(entry.char), entry.char, myToken);
  if (myToken !== token || charResult === "stopped") return { char: charResult, word: "stopped", voice: Boolean(hkVoice()) };
  const wordResult = await playFirst(audioUrlsForWord(entry.char, entry.exampleWord), entry.exampleWord, myToken);
  return { char: charResult, word: wordResult, voice: Boolean(hkVoice()) };
}

export function warmVoices() {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener("voiceschanged", () => {
    speechSynthesis.getVoices();
  });
}
