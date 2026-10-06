const files = import.meta.glob("../data/strokes/*.json", { eager: true, import: "default" });

const byChar = new Map();
for (const data of Object.values(files)) {
  byChar.set(data.char, data);
}

export function strokeData(char) {
  const data = byChar.get(char);
  if (!data) throw new Error(`找不到「${char}」的筆畫資料`);
  const payload = { strokes: data.strokes, medians: data.medians };
  if (data.radStrokes) payload.radStrokes = data.radStrokes;
  return payload;
}

export function mediansFor(char) {
  return byChar.get(char)?.medians || [];
}
