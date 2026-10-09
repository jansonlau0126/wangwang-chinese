/**
 * Season 2 share cards — canvas layouts aligned to
 * docs/season2/images/share-card-templates/ (style reference only).
 */
import { dayChars, findChar } from "./chars.js";
import { dogBySlug, poseSrc } from "./dogs.js";
import chaptersPack from "../data/chapters-s2.json";

const W = 720;
const H = 1280;

const FONT_KAI = '"Free HK Kai", "PingFang HK", "Noto Sans HK", serif';
const FONT_UI = 'system-ui, "PingFang HK", "Noto Sans HK", sans-serif';

let fontReady = null;

function ensureFonts() {
  if (fontReady) return fontReady;
  fontReady = (async () => {
    try {
      if (typeof FontFace !== "undefined" && document?.fonts) {
        const face = new FontFace("Free HK Kai", "url(/fonts/FreeHKKai-subset.woff2)");
        await face.load();
        document.fonts.add(face);
        await document.fonts.ready;
      }
    } catch {
      /* system fallback */
    }
  })();
  return fontReady;
}

function fillRoundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.fill();
}

function strokeRoundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.stroke();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image ${src}`));
    img.src = src;
  });
}

async function loadPose(dog, poses) {
  for (const pose of poses) {
    if (!pose) continue;
    try {
      return { img: await loadImage(poseSrc(dog, pose)), pose };
    } catch {
      /* try next */
    }
  }
  return { img: null, pose: null };
}

function chapterForDay(day) {
  return chaptersPack.chapters.find((c) => day >= c.dayStart && day <= c.dayEnd) || chaptersPack.chapters[0];
}

function charEntries(chars, season) {
  if (!Array.isArray(chars) || !chars.length) return [];
  return chars.map((ch) => {
    if (ch && typeof ch === "object") {
      return { char: ch.char, jyutping: ch.jyutping || "" };
    }
    const entry = findChar(ch, season === "s2" ? "s2" : "s1") || findChar(ch);
    return { char: ch, jyutping: entry?.jyutping || "" };
  }).filter((e) => e.char);
}

function drawCloud(ctx, x, y, s = 1) {
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.ellipse(x, y, 36 * s, 22 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 28 * s, y + 4 * s, 28 * s, 18 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 26 * s, y + 6 * s, 24 * s, 16 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPaw(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.42, size * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [dx, dy] of [[-0.45, -0.35], [-0.12, -0.55], [0.22, -0.55], [0.48, -0.32]]) {
    ctx.beginPath();
    ctx.ellipse(x + dx * size, y + dy * size, size * 0.16, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSkyGrass(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#9FD8F5");
  g.addColorStop(0.38, "#C8EBFA");
  g.addColorStop(0.55, "#E8F6E0");
  g.addColorStop(0.72, "#B8E08A");
  g.addColorStop(1, "#7CB342");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  drawCloud(ctx, 120, 90, 1.1);
  drawCloud(ctx, 560, 70, 0.9);
  drawCloud(ctx, 400, 140, 0.7);
  // soft flowers
  for (const [x, y, c] of [[80, 980, "#fff"], [160, 1040, "#FFE082"], [620, 1000, "#fff"], [540, 1100, "#FFE082"], [100, 1120, "#fff"]]) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  // border
  ctx.strokeStyle = "rgba(120, 180, 220, 0.55)";
  ctx.lineWidth = 10;
  strokeRoundRect(ctx, 10, 10, W - 20, H - 20, 36);
}

function drawBlueDiaryBg(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#EAF5FF");
  g.addColorStop(0.5, "#F5FBFF");
  g.addColorStop(1, "#DCEEFF");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(100, 160, 210, 0.5)";
  ctx.lineWidth = 10;
  strokeRoundRect(ctx, 10, 10, W - 20, H - 20, 36);
  drawPaw(ctx, 70, 160, 22, "rgba(120, 180, 230, 0.35)");
  drawPaw(ctx, 650, 200, 18, "rgba(120, 180, 230, 0.3)");
  drawPaw(ctx, 80, 1180, 20, "rgba(120, 180, 230, 0.28)");
  drawPaw(ctx, 640, 1160, 18, "rgba(255, 180, 120, 0.35)");
}

function drawFinaleBg(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#FFF6E8");
  g.addColorStop(0.35, "#FFE8C8");
  g.addColorStop(0.55, "#E8F5C8");
  g.addColorStop(1, "#8FBF4A");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // confetti dots
  for (const [x, y, c] of [
    [80, 80, "#F48FB1"], [140, 120, "#FFD54F"], [200, 70, "#CE93D8"],
    [520, 90, "#81D4FA"], [600, 130, "#F48FB1"], [660, 70, "#FFD54F"],
    [100, 200, "#A5D6A7"], [640, 210, "#FFAB91"],
  ]) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(200, 160, 100, 0.55)";
  ctx.lineWidth = 10;
  strokeRoundRect(ctx, 10, 10, W - 20, H - 20, 36);
}

/**
 * Draw dog photo with a solid contrasting mat so light studio dogs stay visible.
 * Never use pure white as the photo mat.
 */
function drawDogInFrame(ctx, img, box, matColors, opts = {}) {
  const [c0, c1] = matColors;
  const pad = opts.pad ?? 20; // coloured mat always visible around studio photos
  const mat = ctx.createLinearGradient(box.x, box.y, box.x, box.y + box.h);
  mat.addColorStop(0, c0);
  mat.addColorStop(1, c1);
  ctx.fillStyle = mat;
  fillRoundRect(ctx, box.x, box.y, box.w, box.h, 22);

  // inner meadow disc so light fur still separates from mat edge
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.ellipse(box.x + box.w / 2, box.y + box.h * 0.62, box.w * 0.38, box.h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!img) return;

  const inner = {
    x: box.x + pad,
    y: box.y + pad,
    w: box.w - pad * 2,
    h: box.h - pad * 2,
  };
  ctx.save();
  fillRoundRect(ctx, inner.x, inner.y, inner.w, inner.h, 16);
  ctx.clip();

  // cover-fit inside inset: photo fills window; coloured pad frame stays outside
  const scale = Math.max(inner.w / img.width, inner.h / img.height);
  const iw = img.width * scale;
  const ih = img.height * scale;
  const dx = inner.x + (inner.w - iw) / 2;
  const dy = inner.y + (inner.h - ih) / 2;
  ctx.drawImage(img, dx, dy, iw, ih);
  ctx.restore();

  ctx.strokeStyle = "rgba(40, 60, 40, 0.35)";
  ctx.lineWidth = 5;
  strokeRoundRect(ctx, box.x + 2, box.y + 2, box.w - 4, box.h - 4, 20);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 3;
  strokeRoundRect(ctx, box.x, box.y, box.w, box.h, 22);
}

async function drawCollage(ctx, box) {
  const slugs = [
    "02-bobo-shiba",
    "01-maomao-toy-poodle",
    "05-baibai-bichon",
    "03-duoduo-corgi",
  ];
  const gap = 10;
  const cellW = (box.w - gap) / 2;
  const cellH = (box.h - gap) / 2;
  const mats = [
    ["#A8D8F0", "#7CB342"],
    ["#B3E5FC", "#9CCC65"],
    ["#81D4FA", "#AED581"],
    ["#90CAF9", "#8BC34A"],
  ];
  for (let i = 0; i < 4; i += 1) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const dog = dogBySlug(slugs[i]);
    const { img } = await loadPose(dog, ["sit", "happy"]);
    const cell = {
      x: box.x + col * (cellW + gap),
      y: box.y + row * (cellH + gap),
      w: cellW,
      h: cellH,
    };
    drawDogInFrame(ctx, img, cell, mats[i], { pad: 10 });
  }
}

function drawCharCells(ctx, entries, y, opts = {}) {
  const n = Math.min(3, Math.max(entries.length, 0));
  if (!n) return y;
  const gap = 18;
  const cellW = opts.boxed ? 170 : 180;
  const cellH = opts.boxed ? 170 : 150;
  const total = n * cellW + (n - 1) * gap;
  let x = (W - total) / 2;
  for (let i = 0; i < n; i += 1) {
    const e = entries[i];
    if (opts.boxed) {
      ctx.fillStyle = "#FFFFFF";
      fillRoundRect(ctx, x, y, cellW, cellH, 16);
      ctx.strokeStyle = opts.boxStroke || "#5BA3D9";
      ctx.lineWidth = 4;
      strokeRoundRect(ctx, x, y, cellW, cellH, 16);
    }
    ctx.fillStyle = opts.charColor || "#1A1A1A";
    ctx.font = `bold 72px ${FONT_KAI}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(e.char, x + cellW / 2, y + (opts.boxed ? 68 : 58));
    if (e.jyutping) {
      ctx.fillStyle = opts.jyutColor || "#4CAF50";
      ctx.font = `600 22px ${FONT_UI}`;
      ctx.fillText(e.jyutping, x + cellW / 2, y + (opts.boxed ? 130 : 118));
    }
    x += cellW + gap;
  }
  return y + cellH;
}

function drawTitle(ctx, text, y, color, size = 48) {
  ctx.fillStyle = color;
  ctx.font = `800 ${size}px ${FONT_UI}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // slight outline for readability on busy bg
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.strokeText(text, W / 2, y);
  ctx.fillText(text, W / 2, y);
}

function drawRibbon(ctx, text, y) {
  const rw = Math.min(560, Math.max(320, text.length * 36 + 80));
  const rh = 56;
  const x = (W - rw) / 2;
  ctx.fillStyle = "#7EC8F0";
  fillRoundRect(ctx, x, y, rw, rh, 10);
  // ribbon tails
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x - 28, y + rh / 2);
  ctx.lineTo(x, y + rh - 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + rw, y + 8);
  ctx.lineTo(x + rw + 28, y + rh / 2);
  ctx.lineTo(x + rw, y + rh - 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 26px ${FONT_UI}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`★ ${text} ★`, W / 2, y + rh / 2);
}

function drawHashtags(ctx, tags, y, color = "#2f8fd5") {
  ctx.fillStyle = color;
  ctx.font = `600 22px ${FONT_UI}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const text = Array.isArray(tags) ? tags.join("  ·  ") : tags;
  ctx.fillText(text, W / 2, y);
}

function drawProgress(ctx, text, y, style = "daily") {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (style === "chapter") {
    const tw = Math.min(480, ctx.measureText ? 400 : 400);
    ctx.strokeStyle = "#5BA3D9";
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 3;
    strokeRoundRect(ctx, (W - tw) / 2 - 20, y - 28, tw + 40, 56, 16);
    ctx.setLineDash([]);
    ctx.fillStyle = "#2E5A7A";
    ctx.font = `700 24px ${FONT_UI}`;
    ctx.fillText(text, W / 2, y);
  } else if (style === "finale") {
    ctx.fillStyle = "rgba(255,248,230,0.92)";
    fillRoundRect(ctx, 100, y - 30, W - 200, 60, 14);
    ctx.strokeStyle = "#C4A574";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    strokeRoundRect(ctx, 100, y - 30, W - 200, 60, 14);
    ctx.setLineDash([]);
    ctx.fillStyle = "#5D4037";
    ctx.font = `700 24px ${FONT_UI}`;
    ctx.fillText(text, W / 2, y);
  } else {
    // daily divider + text
    ctx.strokeStyle = "#66BB6A";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, y - 28);
    ctx.lineTo(W / 2 - 40, y - 28);
    ctx.moveTo(W / 2 + 40, y - 28);
    ctx.lineTo(W - 120, y - 28);
    ctx.stroke();
    drawPaw(ctx, W / 2, y - 28, 14, "#66BB6A");
    ctx.fillStyle = "#2E5A2E";
    ctx.font = `700 24px ${FONT_UI}`;
    ctx.fillText(text, W / 2, y);
  }
}

export function sharePayloadFromReward(reward, state) {
  if (!reward) return null;
  const companion = dogBySlug(reward.companion);
  const season = reward.season || "s1";
  const day = reward.day;
  const rawChars = reward.chars
    || (day ? dayChars(day, season === "s2" ? "s2" : "s1").map((e) => e.char) : []);
  const chars = charEntries(rawChars, season);
  const X = season === "s2"
    ? (state.s2?.completedDays?.length || 0)
    : (state.completedDays?.length || 0);
  const bonesToday = reward.bonesToday ?? 0;
  const chapter = day ? chapterForDay(day) : null;
  const seasonLabel = season === "s2" ? "第二季" : "第一季";
  const progress = `${seasonLabel} ${X}/60 日`;

  if (reward.shareKind === "finale" || (season === "s2" && reward.s2Complete)) {
    return {
      kind: "finale",
      title: "汪汪探險隊 (第二季) 完成！",
      subtitle: "60 日探險完滿結束",
      body: `多謝你陪${companion.name}同大家行完呢段路`,
      sub: "第二季 60/60 日 · 全隊集合",
      tags: ["#汪汪中文", "#汪汪探險隊", "#完季"],
      dogSlug: "01-maomao-toy-poodle",
      dogName: "毛毛",
      pose: "expedition-b",
      fallbackPose: "happy",
      collage: false,
      chars,
      season,
    };
  }
  if (reward.streakMilestone) {
    return {
      kind: "streak",
      title: `連續 ${reward.streakMilestone} 日都有寫！`,
      body: `${companion.name}同全隊為你高興～`,
      sub: `${progress} · 今日骨頭 ${bonesToday}/2`,
      tags: ["#汪汪中文", "#連寫"],
      dogSlug: companion.slug,
      dogName: companion.name,
      pose: "happy",
      fallbackPose: "sit",
      chars,
      season,
      bonesToday,
      progress,
    };
  }
  if (reward.newChapter) {
    const ch = chaptersPack.chapters.find((c) => c.id === reward.newChapter) || chapter;
    const dog = ch?.dogSlugs?.[0] ? dogBySlug(ch.dogSlugs[0]) : companion;
    return {
      kind: "chapter",
      title: "探險日記更新喇！",
      ribbon: `${ch?.name || "新章節"} 開放！`,
      quote: `${dog.name}：「${ch?.blurb || "繼續加油"}」`,
      body: "",
      sub: progress,
      tags: ["#汪汪中文", "#探險日記"],
      dogSlug: dog.slug,
      dogName: dog.name,
      pose: "expedition-a",
      fallbackPose: "happy",
      chars,
      season,
      progress,
    };
  }
  if (reward.stageComplete) {
    const stage = chaptersPack.stages.find((s) => s.id === reward.stageComplete);
    return {
      kind: "chapter",
      title: stage ? `${stage.name.replace(/站$/, "")}完成！` : "大階段完成！",
      ribbon: stage?.name || "里程碑",
      quote: stage?.done || "繼續攞骨頭、換狗狗相啦～",
      body: "",
      sub: progress,
      tags: ["#汪汪中文", "#里程碑"],
      dogSlug: companion.slug,
      dogName: companion.name,
      pose: "happy",
      fallbackPose: "sit",
      chars,
      season,
      progress,
    };
  }
  // daily
  return {
    kind: "daily",
    title: season === "s2" ? "今日探險成功！" : "今日寫好喇！",
    body: "",
    sub: `${progress} · 今日骨頭 ${bonesToday}/2`,
    tags: season === "s2"
      ? ["#汪汪中文", "#汪汪探險隊"]
      : ["#汪汪中文", "#每日練習"],
    dogSlug: companion.slug,
    dogName: companion.name,
    pose: "happy",
    fallbackPose: "sit",
    chars,
    season,
    bonesToday,
    progress,
  };
}

async function renderDaily(ctx, payload, img) {
  drawSkyGrass(ctx);
  drawTitle(ctx, payload.title, 100, "#E65100", 52);
  drawPaw(ctx, W / 2, 155, 18, "#42A5F5");

  const box = { x: 90, y: 190, w: W - 180, h: 360 };
  // sky→grass mat so light dogs stay clear
  drawDogInFrame(ctx, img, box, ["#7EC8F0", "#8BC34A"], { pad: 22 });

  let y = drawCharCells(ctx, payload.chars, 590, {
    boxed: false,
    jyutColor: "#43A047",
    charColor: "#111",
  });
  y = Math.max(y, 800);
  drawProgress(ctx, payload.sub, y + 50, "daily");
  drawHashtags(ctx, payload.tags, H - 70, "#1565C0");
}

async function renderChapter(ctx, payload, img) {
  drawBlueDiaryBg(ctx);
  drawTitle(ctx, payload.title, 95, "#1565C0", 46);
  if (payload.ribbon) drawRibbon(ctx, payload.ribbon, 150);
  if (payload.quote) {
    ctx.fillStyle = "#6D4C41";
    ctx.font = `600 26px ${FONT_UI}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(payload.quote, W / 2, 240);
  }

  const box = { x: 100, y: 270, w: W - 200, h: 340 };
  drawDogInFrame(ctx, img, box, ["#90CAF9", "#A5D6A7"], { pad: 18 });

  let y = drawCharCells(ctx, payload.chars, 700, {
    boxed: true,
    boxStroke: "#5BA3D9",
    jyutColor: "#2E7D32",
  });
  y = Math.max(y, 900);
  drawProgress(ctx, payload.sub, y + 50, "chapter");
  drawHashtags(ctx, payload.tags, H - 70, "#1565C0");
}

async function renderFinale(ctx, payload, img) {
  drawFinaleBg(ctx);
  drawPaw(ctx, W / 2, 70, 20, "#8D6E63");
  drawTitle(ctx, payload.title, 130, "#4E342E", 40);
  if (payload.subtitle) {
    ctx.fillStyle = "#F9A825";
    ctx.font = `800 28px ${FONT_UI}`;
    ctx.textAlign = "center";
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 5;
    ctx.strokeText(payload.subtitle, W / 2, 185);
    ctx.fillText(payload.subtitle, W / 2, 185);
  }
  if (payload.body) {
    ctx.fillStyle = "#5D4037";
    ctx.font = `600 24px ${FONT_UI}`;
    ctx.fillText(payload.body, W / 2, 235);
  }

  const box = { x: 90, y: 270, w: W - 180, h: 400 };
  // Prefer expedition-b (scene background) for contrast; collage kept as fallback only
  if (payload.collage && !img) {
    await drawCollage(ctx, box);
  } else {
    drawDogInFrame(ctx, img, box, ["#81D4FA", "#7CB342"], { pad: 18 });
  }

  drawProgress(ctx, payload.sub, 880, "finale");
  drawHashtags(ctx, payload.tags, H - 70, "#6D4C41");
}

async function renderStreak(ctx, payload, img) {
  // reuse daily sky/grass with streak title
  await renderDaily(ctx, payload, img);
}

export async function renderShareCardCanvas(payload) {
  await ensureFonts();
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const dog = dogBySlug(payload.dogSlug);
  const poseOrder = payload.kind === "chapter"
    ? [payload.pose, "expedition-a", "expedition-b", payload.fallbackPose, "sit"]
    : payload.kind === "finale"
      ? [payload.pose, "expedition-b", "happy", "sit"]
      : [payload.pose, payload.fallbackPose, "sit"];
  const { img } = await loadPose(dog, poseOrder);

  if (payload.kind === "finale") await renderFinale(ctx, payload, img);
  else if (payload.kind === "chapter") await renderChapter(ctx, payload, img);
  else if (payload.kind === "streak") await renderStreak(ctx, payload, img);
  else await renderDaily(ctx, payload, img);

  // brand footer
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.font = `500 16px ${FONT_UI}`;
  ctx.textAlign = "center";
  ctx.fillText("汪汪中文", W / 2, H - 28);

  return canvas;
}

export async function downloadShareCard(payload, filename = "wangwang-share.png") {
  const canvas = await renderShareCardCanvas(payload);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve(true);
    }, "image/png");
  });
}
