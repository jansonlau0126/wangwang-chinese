#!/usr/bin/env node
/**
 * Synthesize Season 1 character + example-word clips with Azure Speech
 * (zh-HK-HiuGaaiNeural), trim silence with ffmpeg, write assets/audio/ and
 * data/audio-manifest.json.
 *
 * Env: AZURE_SPEECH_KEY, AZURE_SPEECH_REGION
 * Usage:
 *   node scripts/gen-audio-azure.mjs --dry-run
 *   node scripts/gen-audio-azure.mjs
 *   node scripts/gen-audio-azure.mjs --limit 3
 *
 * Filenames are stable so human recordings can replace TTS later:
 *   assets/audio/U+4E00.mp3
 *   assets/audio/U+4E00_word.mp3
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const characters = JSON.parse(readFileSync(path.join(root, "data/characters.json"), "utf8"));
const outDir = path.join(root, "assets/audio");
const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : (process.argv.includes("--limit") ? Number(process.argv[process.argv.indexOf("--limit") + 1]) : Infinity);

const key = process.env.AZURE_SPEECH_KEY || "";
const region = process.env.AZURE_SPEECH_REGION || "";
const voice = "zh-HK-HiuGaaiNeural";
const rate = "-15%";

function unicodeName(char) {
  return `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
}

function ssml(text) {
  const safe = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<speak version="1.0" xml:lang="zh-HK"><voice name="${voice}"><prosody rate="${rate}">${safe}</prosody></voice></speak>`;
}

async function synthesize(text, destMp3) {
  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      "User-Agent": "wangwang-chinese-gen-audio",
    },
    body: ssml(text),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Azure TTS ${res.status}: ${body.slice(0, 200)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const rawPath = `${destMp3}.raw.mp3`;
  writeFileSync(rawPath, buf);
  const ff = spawnSync("ffmpeg", [
    "-y", "-i", rawPath,
    "-af", "silenceremove=start_periods=1:start_silence=0.05:start_threshold=-50dB:stop_periods=1:stop_silence=0.08:stop_threshold=-50dB",
    "-codec:a", "libmp3lame", "-b:a", "128k",
    destMp3,
  ], { encoding: "utf8" });
  if (ff.status !== 0) {
    // Fall back to untrimmed if ffmpeg missing
    writeFileSync(destMp3, buf);
    console.warn(`ffmpeg trim skipped for ${destMp3}: ${(ff.stderr || "").slice(0, 120)}`);
  }
  try {
    const { unlinkSync } = await import("node:fs");
    unlinkSync(rawPath);
  } catch { /* ignore */ }
}

const jobs = [];
for (const entry of characters) {
  const base = unicodeName(entry.char);
  jobs.push({ name: `${base}.mp3`, text: entry.char, kind: "char", char: entry.char });
  jobs.push({ name: `${base}_word.mp3`, text: entry.exampleWord, kind: "word", char: entry.char });
}

const selected = jobs.slice(0, Math.min(jobs.length, limit === Infinity ? jobs.length : limit));

console.log(`Audio jobs: ${jobs.length} total, running ${selected.length}${dryRun ? " (dry-run)" : ""}`);
if (dryRun) {
  for (const job of selected.slice(0, 6)) {
    console.log(`  would write assets/audio/${job.name}  ←  「${job.text}」  voice=${voice} rate=${rate}`);
  }
  if (selected.length > 6) console.log(`  … and ${selected.length - 6} more`);
  console.log("dry-run ok (no network, no files written)");
  process.exit(0);
}

if (!key || !region) {
  console.error("Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const files = [];
for (const job of selected) {
  const dest = path.join(outDir, job.name);
  process.stdout.write(`TTS ${job.name} … `);
  await synthesize(job.text, dest);
  files.push(job.name);
  console.log("ok");
}

 // Merge with any existing manifest entries not regenerated
let existing = [];
const manifestPath = path.join(root, "data/audio-manifest.json");
if (existsSync(manifestPath)) {
  try {
    existing = JSON.parse(readFileSync(manifestPath, "utf8")).files || [];
  } catch { /* ignore */ }
}
const merged = [...new Set([...existing, ...files])].sort();
writeFileSync(manifestPath, JSON.stringify({
  version: 1,
  naming: { char: "U+XXXX.mp3", word: "U+XXXX_word.mp3" },
  voice,
  rate,
  generatedAt: new Date().toISOString(),
  files: merged,
}, null, 2));
console.log(`wrote ${files.length} clips; manifest has ${merged.length} files`);
