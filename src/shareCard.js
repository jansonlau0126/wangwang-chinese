/**
 * Season 2 share-card MVP — DOM/canvas park-style card from dog photo + copy.
 */
import { dayChars } from "./chars.js";
import { dogBySlug, poseSrc } from "./dogs.js";
import chaptersPack from "../data/chapters-s2.json";

const W = 720;
const H = 960;

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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image ${src}`));
    img.src = src;
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = [...text];
  let line = "";
  let cy = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = ch;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy;
}

function chapterForDay(day) {
  return chaptersPack.chapters.find((c) => day >= c.dayStart && day <= c.dayEnd) || chaptersPack.chapters[0];
}

export function sharePayloadFromReward(reward, state) {
  if (!reward) return null;
  const companion = dogBySlug(reward.companion);
  const season = reward.season || "s1";
  const day = reward.day;
  const chars = reward.chars
    || (day ? dayChars(day, season === "s2" ? "s2" : "s1").map((e) => e.char) : []);
  const X = season === "s2"
    ? (state.s2?.completedDays?.length || 0)
    : (state.completedDays?.length || 0);
  const bonesToday = reward.bonesToday ?? 0;
  const chapter = day ? chapterForDay(day) : null;

  if (reward.shareKind === "finale" || (season === "s2" && reward.s2Complete)) {
    return {
      kind: "finale",
      title: "第二季完成！",
      body: `多謝你陪${companion.name}同大家\n行完呢段探險路\n全隊集合，收隊返屋企！`,
      sub: "60/60 日 · 汪汪探險隊",
      tags: "#汪汪中文 #完季",
      dogSlug: "01-maomao-toy-poodle",
      pose: "expedition-b",
      fallbackPose: "happy",
    };
  }
  if (reward.streakMilestone) {
    return {
      kind: "streak",
      title: `連續 ${reward.streakMilestone} 日都有寫！`,
      body: `好叻呀！堅持就係超能力\n${companion.name}同全隊為你高興～\n（斷咗唔緊要，返嚟再計就得）`,
      sub: season === "s2" ? `第二季 ${X}/60 日` : `第一季 ${X}/60 日`,
      tags: "#汪汪中文 #連寫",
      dogSlug: companion.slug,
      pose: "happy",
      fallbackPose: "sit",
    };
  }
  if (reward.newChapter) {
    const ch = chaptersPack.chapters.find((c) => c.id === reward.newChapter) || chapter;
    const dog = ch?.dogSlugs?.[0] ? dogBySlug(ch.dogSlugs[0]) : companion;
    return {
      kind: "chapter",
      title: "探險日記更新喇！",
      body: `「${ch?.name || "新章節"}」開放！\n${dog.name}：「${ch?.blurb || "繼續加油"}」\n快啲去進度地圖睇啦～`,
      sub: `第二季 ${X}/60 日`,
      tags: "#汪汪中文 #探險日記",
      dogSlug: dog.slug,
      pose: "happy",
      fallbackPose: "sit",
    };
  }
  if (reward.stageComplete) {
    const stage = chaptersPack.stages.find((s) => s.id === reward.stageComplete);
    return {
      kind: "stage",
      title: stage ? `${stage.name.replace(/站$/, "")}完成！` : "大階段完成！",
      body: stage?.done || "繼續攞骨頭、換狗狗相啦～",
      sub: `第二季 ${X}/60 日`,
      tags: "#汪汪中文 #里程碑",
      dogSlug: companion.slug,
      pose: "happy",
      fallbackPose: "sit",
    };
  }
  // daily
  const charLine = chars.length ? `「${chars.join("、")}」` : "";
  return {
    kind: "daily",
    title: season === "s2" ? "今日探險成功！" : "今日寫好喇！",
    body: season === "s2"
      ? `今日同${companion.name}一齊學會咗\n${charLine}\n汪汪探險隊又進步喇～`
      : `今日同${companion.name}一齊寫好\n${charLine}`,
    sub: season === "s2"
      ? `第二季 ${X}/60 日 · 今日骨頭 ${bonesToday}/2`
      : `第一季 ${X}/60 日 · 今日骨頭 ${bonesToday}/2`,
    tags: "#汪汪中文 #汪汪探險隊",
    dogSlug: companion.slug,
    pose: "happy",
    fallbackPose: "sit",
  };
}

export async function renderShareCardCanvas(payload) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // park gradient background
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#E8F6E0");
  g.addColorStop(0.55, "#F7F1E3");
  g.addColorStop(1, "#DCEFCF");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // soft card panel
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  fillRoundRect(ctx, 36, 48, W - 72, H - 96, 28);

  // decorative path stripe
  ctx.strokeStyle = "#C4A574";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(80, H - 140);
  ctx.quadraticCurveTo(W / 2, H - 200, W - 80, H - 120);
  ctx.stroke();

  let dog = dogBySlug(payload.dogSlug);
  let img = null;
  for (const pose of [payload.pose, payload.fallbackPose, "sit"]) {
    try {
      img = await loadImage(poseSrc(dog, pose));
      break;
    } catch {
      /* try next */
    }
  }

  if (img) {
    const box = { x: 120, y: 120, w: W - 240, h: 360 };
    ctx.save();
    fillRoundRect(ctx, box.x, box.y, box.w, box.h, 20);
    ctx.clip();
    const scale = Math.max(box.w / img.width, box.h / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    ctx.drawImage(img, box.x + (box.w - iw) / 2, box.y + (box.h - ih) / 2, iw, ih);
    ctx.restore();
    ctx.strokeStyle = "#8B5A2B";
    ctx.lineWidth = 3;
    fillRoundRect(ctx, box.x, box.y, box.w, box.h, 20);
    ctx.stroke();
  }

  ctx.fillStyle = "#3B2A14";
  ctx.font = "bold 42px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(payload.title, W / 2, 540);

  ctx.font = "28px system-ui, sans-serif";
  ctx.fillStyle = "#4A3B28";
  const lines = (payload.body || "").split("\n");
  let y = 600;
  for (const line of lines) {
    wrapText(ctx, line, W / 2, y, W - 140, 40);
    y += 44;
  }

  ctx.font = "22px system-ui, sans-serif";
  ctx.fillStyle = "#6B5A45";
  ctx.fillText(payload.sub || "", W / 2, y + 24);

  ctx.font = "20px system-ui, sans-serif";
  ctx.fillStyle = "#2f8fd5";
  ctx.fillText(payload.tags || "", W / 2, H - 90);

  ctx.font = "18px system-ui, sans-serif";
  ctx.fillStyle = "#8A7A66";
  ctx.fillText("汪汪中文", W / 2, H - 58);

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
