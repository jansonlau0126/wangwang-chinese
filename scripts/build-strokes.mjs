import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyStrokeOverride } from "../src/strokeOrder.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const characters = JSON.parse(readFileSync(path.join(root, "data/characters.json"), "utf8"));
const overrides = JSON.parse(readFileSync(path.join(root, "data/stroke-overrides.json"), "utf8"));
const outDir = path.join(root, "data/strokes");
mkdirSync(outDir, { recursive: true });

const verified = "2026-10-06";

for (const entry of characters) {
  const raw = JSON.parse(
    readFileSync(path.join(root, "node_modules/hanzi-writer-data", `${entry.char}.json`), "utf8"),
  );
  const override = overrides[entry.char] || null;
  const applied = applyStrokeOverride(raw, override);
  const code = entry.char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
  const doc = {
    char: entry.char,
    unicode: `U+${code}`,
    source: "hwd",
    hwdVersion: "2.0.1",
    modified: override
      ? `2026-10-06: reordered strokes and medians from hanzi-writer-data 2.0.1. Original 1-based indices in Hong Kong EDB order: ${override.order.join(",")}. ${override.note || ""}`.trim()
      : null,
    verifiedAgainstEdb: entry.verifiedAgainstEdb || verified,
    strokes: applied.strokes,
    medians: applied.medians,
  };
  if (applied.radStrokes) doc.radStrokes = applied.radStrokes;
  writeFileSync(path.join(outDir, `U+${code}.json`), JSON.stringify(doc));
  console.log(`${entry.char} U+${code} ${override ? "reordered" : "copied"} ${applied.strokes.length} strokes`);
}

copyFileSync(
  path.join(root, "node_modules/hanzi-writer-data/ARPHICPL.TXT"),
  path.join(root, "data/ARPHICPL.TXT"),
);
console.log("wrote data/ARPHICPL.TXT");
