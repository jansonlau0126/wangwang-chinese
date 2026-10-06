import { dayChars, DAY_TOTAL, WEEK_TOTAL, characters, weekChars, weekOfDay } from "./chars.js";
import { dailyPose, dogBySlug, dogs, heroSrc, poseSrc } from "./dogs.js";
import {
  companionName,
  dogAlbumProgress,
  isCharUnlocked,
  isDayDone,
  recordList,
  seasonComplete,
  tileStatus,
  unlockedCount,
} from "./state.js";
import { unlockedDogCount } from "./strokeOrder.js";
import { ALBUM_POSES, POSE_COSTS, POSE_LABEL, remainingBoneCap } from "./economy.js";

export const STAGES = [
  { id: "listen", label: "汪汪讀" },
  { id: "watch", label: "睇汪汪寫" },
  { id: "guided", label: "跟腳印描" },
  { id: "light", label: "少啲腳印" },
  { id: "free", label: "我自己寫" },
  { id: "cheer", label: "攞骨頭" },
];

/** Soft day colours on the notebook palette (5 days per week). */
export const DAY_COLORS = [
  "#E8F3EC",
  "#E8F0F8",
  "#F3F0E8",
  "#EDEAF6",
  "#E8F4F4",
];


function boneBadge(state) {
  const left = remainingBoneCap(state.boneLedger);
  return `<div class="bone-badge" title="今日仲可以攞 ${left} 嚿骨頭"><span class="bone-ico" aria-hidden="true">🦴</span><b>${state.bones || 0}</b></div>`;
}

function brandHtml(label = "汪汪中文") {
  return `<div class="brand"><img class="brand-logo" src="/icons/logo-head-96.png" alt="" width="32" height="32"><span>${label}</span></div>`;
}

export function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function iconHome() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.2 12 5.2l8 7V20a1.2 1.2 0 0 1-1.2 1.2H14v-5.2h-4v5.2H5.2A1.2 1.2 0 0 1 4 20v-7.8Z" fill="currentColor"/><circle cx="12" cy="3.6" r="1.4" fill="currentColor"/></svg>';
}
function iconMap() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8c2 0 3-2 5-2s3 2 5 2 3-2 5-2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4 13c2 0 3-2 5-2s3 2 5 2 3-2 5-2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4 18c2 0 3-2 5-2s3 2 5 2 3-2 5-2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="9" cy="11" r="1.6" fill="currentColor"/></svg>';
}
function iconCards() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="11" height="15" rx="3" fill="currentColor" opacity="0.35"/><rect x="8" y="5.5" width="11" height="15" rx="3" fill="currentColor"/></svg>';
}
function iconPaw() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="16" rx="5" ry="3.8" fill="currentColor"/><circle cx="6.2" cy="9.2" r="2.3" fill="currentColor"/><circle cx="12" cy="7" r="2.3" fill="currentColor"/><circle cx="17.8" cy="9.2" r="2.3" fill="currentColor"/></svg>';
}
function iconMe() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.6" fill="currentColor"/><path d="M5 19.5c1.5-3.4 3.9-5 7-5s5.5 1.6 7 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
}
function iconSilhouette() {
  return '<svg class="sil" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="16" rx="5" ry="3.8" fill="currentColor"/><circle cx="6.2" cy="9.2" r="2.3" fill="currentColor"/><circle cx="12" cy="7" r="2.3" fill="currentColor"/><circle cx="17.8" cy="9.2" r="2.3" fill="currentColor"/></svg>';
}

function statusLabel(status) {
  if (status === "done") return "寫好喇";
  if (status === "now") return "寫緊";
  return "未寫";
}

export function renderTabs(state) {
  const tabs = [
    ["home", "首頁", iconHome()],
    ["map", "進度", iconMap()],
    ["cards", "生字卡", iconCards()],
    ["dogs", "狗狗", iconPaw()],
    ["about", "我", iconMe()],
  ];
  return tabs.map(([id, label, icon]) => {
    const on = state.screen === id || (id === "cards" && state.screen === "cards");
    return `<button type="button" class="tab${on ? " on" : ""}" data-act="tab" data-tab="${id}" aria-current="${on ? "page" : "false"}">${icon}<span>${label}</span></button>`;
  }).join("");
}

function dogFace(state, pose) {
  const dog = dogBySlug(state.companion);
  const src = poseSrc(dog, pose);
  return `<img class="face" src="${esc(src)}" alt="${esc(dog.name)}">`;
}

function homePose(state) {
  if (isDayDone(state)) return "sleep";
  return dailyPose(state.companion);
}

export function renderHome(state) {
  const day = state.cursorDay;
  const list = dayChars(day);
  const done = isDayDone(state, day);
  const allDone = state.completedDays.length >= DAY_TOTAL;
  const name = companionName(state);
  let primary = "";
  const seasonDone = seasonComplete(state);
  if (seasonDone) {
    primary = '<button type="button" class="btn" data-act="warmup">今日溫習 🦴</button>';
  } else if (done) {
    primary = '<button type="button" class="btn" data-act="advance">下一日 3 個字</button>';
  } else if (state.active && state.active.day === day && !state.active.review && !state.active.reviewSession) {
    primary = '<button type="button" class="btn" data-act="start">繼續寫</button>';
  } else {
    primary = '<button type="button" class="btn" data-act="start">開始寫</button>';
  }
  const warmupExtra = (!seasonDone && state.completedDays.length > 0)
    ? '<button type="button" class="btn ghost" data-act="warmup">溫習 3 個字</button>'
    : "";
  const rewardLink = state.pendingReward
    ? '<button type="button" class="btn ghost" data-act="reward">睇返今日骨頭</button>'
    : "";
  const tiles = list.map((entry, index) => {
    const status = tileStatus(state, day, index);
    return `<button type="button" class="tile ${status}" data-act="tile" data-char="${esc(entry.char)}" data-status="${status}">
      <span class="glyph kai">${esc(entry.char)}</span>
      <span class="jyut">${esc(entry.jyutping)}</span>
      <span class="status">${statusLabel(status)}</span>
    </button>`;
  }).join("");
  const week = weekOfDay(day);
  const title = seasonDone ? "第一季寫完喇！繼續溫習攞骨頭" : `第 ${day} 日 · 第 ${week} 週`;
  return `<div class="page" data-screen="home">
    <header class="top">
      ${brandHtml()}
      ${boneBadge(state)}
      <button type="button" class="who" data-act="tab" data-tab="dogs">${dogFace(state, homePose(state))}<span>${esc(name)}</span></button>
    </header>
    <figure class="hero">
      <img src="${esc(heroSrc)}" alt="毛毛伏喺空白田字格簿上面">
      <figcaption>
        <b>嚟狗狗公園寫好每個字</b>
        <span>寫完可以再描，唔催命。</span>
      </figcaption>
    </figure>
    <section class="card today">
      <div class="row">
        <h1>${title}</h1>
        <span class="pill${done ? " mint" : ""}">${done ? "寫好喇" : "未寫完"}</span>
      </div>
      <p class="muted">今日${esc(name)}陪你。寫錯唔緊要，再嚟一次！</p>
      <div class="tiles">${tiles}</div>
      <div class="actions">${primary}${warmupExtra}${rewardLink}</div>
    </section>
    <p class="progress-line">已寫 ${state.completedDays.length} / ${DAY_TOTAL} 日 · 識咗 ${unlockedCount(state)} / ${dogs.length} 隻狗</p>
  </div>`;
}

export function renderMap(state) {
  const completed = new Set(state.completedDays);
  const unlockedDogs = unlockedDogCount(state.completedDays.length, dogs.length);
  const companion = dogBySlug(state.companion);
  const cols = 3;
  const rows = Math.ceil(DAY_TOTAL / cols);
  const W = 360;
  const rowH = 132;
  const topPad = 64;
  const bottomPad = 48;
  const height = topPad + rows * rowH + bottomPad;

  function stonePos(day) {
    const index = day - 1;
    const row = Math.floor(index / cols);
    const colInRow = index % cols;
    const ltr = row % 2 === 0;
    const col = ltr ? colInRow : cols - 1 - colInRow;
    const x = 60 + col * 120;
    const y = topPad + row * rowH + 44;
    return { x, y, row, ltr, col };
  }

  // Path through stone centres, with soft curves between rows
  const pts = [];
  for (let day = 1; day <= DAY_TOTAL; day += 1) {
    const { x, y } = stonePos(day);
    pts.push([x, y]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i += 1) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if (Math.abs(y1 - y0) > 10) {
      // vertical snake turn between rows
      const midY = (y0 + y1) / 2;
      d += ` C ${x0} ${midY}, ${x1} ${midY}, ${x1} ${y1}`;
    } else {
      d += ` L ${x1} ${y1}`;
    }
  }

  function decor(x, y, kind, i) {
    if (kind === "tree") {
      return `<g transform="translate(${x} ${y})" opacity="0.9">
        <rect x="-3" y="10" width="6" height="12" rx="1" fill="#8B5A2B"/>
        <circle cx="0" cy="4" r="12" fill="#4FAD55"/>
        <circle cx="-7" cy="8" r="8" fill="#6FCB6A"/>
        <circle cx="7" cy="8" r="8" fill="#6FCB6A"/>
      </g>`;
    }
    if (kind === "bush") {
      return `<g transform="translate(${x} ${y})" opacity="0.85">
        <ellipse cx="0" cy="6" rx="14" ry="9" fill="#5FBE62"/>
        <ellipse cx="-8" cy="8" rx="9" ry="7" fill="#7AD47A"/>
        <ellipse cx="8" cy="9" rx="8" ry="6" fill="#6FCB6A"/>
      </g>`;
    }
    if (kind === "flower") {
      const colors = ["#F5D76E", "#F0A04B", "#FF8FB8", "#7EC8FF"];
      const c = colors[i % colors.length];
      return `<g transform="translate(${x} ${y})">
        <circle cx="0" cy="0" r="3.2" fill="${c}"/>
        <circle cx="5" cy="0" r="3.2" fill="${c}"/>
        <circle cx="-5" cy="0" r="3.2" fill="${c}"/>
        <circle cx="0" cy="5" r="3.2" fill="${c}"/>
        <circle cx="0" cy="-5" r="3.2" fill="${c}"/>
        <circle cx="0" cy="0" r="2.2" fill="#fff6c8"/>
      </g>`;
    }
    // bone
    return `<g transform="translate(${x} ${y}) rotate(${(i * 37) % 40 - 20})" opacity="0.85">
      <rect x="-7" y="-2" width="14" height="4" rx="2" fill="#FBF6E9"/>
      <circle cx="-7" cy="-3" r="3" fill="#FBF6E9"/><circle cx="-7" cy="3" r="3" fill="#FBF6E9"/>
      <circle cx="7" cy="-3" r="3" fill="#FBF6E9"/><circle cx="7" cy="3" r="3" fill="#FBF6E9"/>
    </g>`;
  }

  const decorations = [];
  for (let row = 0; row < rows; row += 1) {
    const y = topPad + row * rowH + 44;
    const side = row % 2 === 0 ? 18 : W - 18;
    decorations.push(decor(side, y - 28, row % 3 === 0 ? "tree" : "bush", row));
    if (row % 2 === 1) decorations.push(decor(W / 2, y + 40, "flower", row));
    if (row % 4 === 2) decorations.push(decor(side === 18 ? W - 28 : 28, y + 18, "bone", row));
  }

  // Week signposts: in the vertical gap above the week-start row, on the path-turn outer side
  const signs = [];
  for (let week = 1; week <= WEEK_TOTAL; week += 1) {
    const day = (week - 1) * 5 + 1;
    const { row, ltr } = stonePos(day);
    // Midway between previous row and this row (clear of stone centres)
    const sy = row === 0
      ? 22
      : topPad + row * rowH + 44 - Math.floor(rowH / 2);
    // Outer turn side: LTR rows enter from left, RTL from right
    const sx = ltr ? 34 : W - 34;
    signs.push(`<g class="week-sign" transform="translate(${sx} ${sy})">
      <rect x="-2" y="16" width="4" height="18" rx="2" fill="#8B5A2B"/>
      <rect x="-24" y="0" width="48" height="20" rx="5" fill="#C4A574" stroke="#8B5A2B" stroke-width="1.5"/>
      <text x="0" y="14" text-anchor="middle" font-size="10" font-weight="700" fill="#3B2A14">第${week}週</text>
    </g>`);
  }

  const stones = [];
  for (let day = 1; day <= DAY_TOTAL; day += 1) {
    const { x, y } = stonePos(day);
    const done = completed.has(day);
    const current = day === state.cursorDay;
    const locked = day > state.cursorDay && !done;
    const cls = done ? "done" : current ? "now" : locked ? "locked" : "todo";
    const chars = dayChars(day).map((e) => e.char).join("");
    const marker = current
      ? `<span class="you-are-here"><img src="${esc(poseSrc(companion, "sit"))}" alt="${esc(companion.name)}"></span>`
      : "";
    const paw = done ? '<span class="stone-paw" aria-hidden="true"></span>' : "";
    stones.push(`<button type="button" class="stone ${cls}" style="left:${x}px;top:${y}px" data-act="goto-day" data-day="${day}" data-stone="${day}" ${locked ? "disabled" : ""}>
      ${paw}
      <span class="stone-n">${day}</span>
      <span class="stone-chars kai">${esc(chars)}</span>
      ${marker}
    </button>`);

    if (day % 4 === 0) {
      const dogIndex = day / 4;
      if (dogIndex < dogs.length) {
        const dog = dogs[dogIndex];
        const open = dogIndex < unlockedDogs;
        const pos = stonePos(day);
        // Place clearing outward from path
        const clearX = pos.ltr && pos.col === 2 ? x - 70 : pos.ltr ? x + 70 : (pos.col === 0 ? x + 70 : x - 70);
        // Prefer side with space
        let cx = pos.col === 1 ? (pos.ltr ? x + 78 : x - 78) : (pos.col === 0 ? x - 58 : x + 58);
        cx = Math.max(42, Math.min(W - 42, cx));
        const cy = y + 56;
        const need = Math.max(0, dogIndex * 4 - state.completedDays.length);
        if (open) {
          stones.push(`<button type="button" class="clearing open" style="left:${cx}px;top:${cy}px" data-act="tab" data-tab="dogs" title="${esc(dog.name)}">
            <img src="${esc(poseSrc(dog, "sit"))}" alt="${esc(dog.name)}">
            <span class="clear-name">${esc(dog.name)}</span>
          </button>`);
        } else {
          stones.push(`<button type="button" class="clearing locked" style="left:${cx}px;top:${cy}px" data-act="locked-dog" title="未解鎖">
            ${iconSilhouette()}
            <span class="clear-name">再行 ${need || "多幾"} 日</span>
          </button>`);
        }
      }
    }
  }

  return `<div class="page map-page" data-screen="map">
    <header class="top">${brandHtml("進度地圖")}</header>
    <p class="lead">沿著狗狗公園小路行！每寫完 4 日就會遇到新朋友。而家完成咗 ${state.completedDays.length} 日。</p>
    <div class="trail-scene" id="trail-scene">
      <svg class="trail-svg" viewBox="0 0 ${W} ${height}" width="100%" aria-hidden="true">
        <defs>
          <linearGradient id="dirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#D2B48C"/>
            <stop offset="100%" stop-color="#C4A574"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${W}" height="${height}" fill="#E8F6E0" rx="24"/>
        ${decorations.join("")}
        <path d="${d}" fill="none" stroke="#E8D4A8" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${d}" fill="none" stroke="url(#dirt)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${d}" fill="none" stroke="#F5E6C8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 10" opacity="0.7"/>
        ${signs.join("")}
      </svg>
      <div class="trail-stones" style="height:${height}px">${stones.join("")}</div>
    </div>
  </div>`;
}

function stageChips(current, stages = STAGES) {
  return stages.map((stage) => {
    const on = stage.id === current;
    const passed = stages.findIndex((item) => item.id === stage.id) < stages.findIndex((item) => item.id === current);
    return `<span class="chip${on ? " on" : ""}${passed ? " done" : ""}">${stage.label}</span>`;
  }).join("");
}

const REVIEW_STAGE_META = [
  { id: "watch", label: "睇汪汪寫" },
  { id: "light", label: "少啲腳印" },
  { id: "free", label: "我自己寫" },
  { id: "cheer", label: "攞骨頭" },
];

function reading(entry) {
  return `<div class="reading-block">
      <p class="reading"><span class="kai name">${esc(entry.char)}</span> <span class="jyut">${esc(entry.jyutping)}</span></p>
      <div class="example">
        <span class="ex-label">例詞</span>
        <span class="kai ex-word">${esc(entry.exampleWord)}</span>
        <span class="jyut ex-jyut">${esc(entry.exampleJyutping)}</span>
      </div>
    </div>`;
}

export function renderPractice(state) {
  const isWarmup = Boolean(state.active?.reviewSession);
  const isSingleReview = Boolean(state.active?.review) && !isWarmup;
  const entry = isWarmup
    ? characters.find((item) => item.char === state.active.queue[state.active.index])
    : isSingleReview
      ? characters.find((item) => item.char === state.active.reviewChar)
      : dayChars(state.active.day)[state.active.index];
  const stage = state.active.stage;
  const index = isSingleReview ? 1 : (isWarmup ? state.active.index + 1 : state.active.index + 1);
  const total = isSingleReview ? 1 : (isWarmup ? state.active.queue.length : 3);
  const dog = dogBySlug(state.companion);
  const listenGrid = stage === "listen"
    ? `<div class="model-char kai" aria-hidden="true">${esc(entry.char)}</div>`
    : "";
  const cheer = stage === "cheer";
  const grid = cheer
    ? `<div class="cheer-photo"><img src="${esc(poseSrc(dog, "happy"))}" alt="${esc(dog.name)}好開心"></div>`
    : `<div class="tian" id="tian">
        <div class="lines" aria-hidden="true"><i></i><b></b></div>
        <div id="writer" class="writer-host">${listenGrid}</div>
        <svg id="guides" class="guides" aria-hidden="true"></svg>
      </div>`;
  const cheerForward = isSingleReview
    ? "返去"
    : (index >= total ? "攞骨頭" : "下一個字");
  const forward = {
    listen: "去睇汪汪寫",
    watch: isWarmup ? "少啲腳印" : "跟腳印描",
    guided: "少啲腳印",
    light: "我自己寫",
    free: "寫好喇！",
    cheer: cheerForward,
  }[stage];
  const retry = {
    listen: "再聽一次",
    watch: "再睇一次",
    guided: "再嚟一次",
    light: "再嚟一次",
    free: "再寫一次",
    cheer: "再寫一次",
  }[stage];
  const locked = stage === "watch" || stage === "guided" || stage === "light" || stage === "free";
  const slow = stage === "watch"
    ? `<button type="button" class="btn ghost" data-act="slow">${state.active.slow ? "正常速度" : "慢啲 🐢"}</button>`
    : "";
  const hint = {
    listen: "撳下面再聽，跟住讀出嚟啦！",
    watch: "睇清楚每一筆點寫。",
    guided: "跟住腳印同箭嘴慢慢描。",
    light: "腳印少咗，試下自己搵起筆。",
    free: "成個格空晒，你自己寫！",
    cheer: `好叻呀！${dog.name}送骨頭畀你，「${entry.char}」寫好喇！`,
  }[stage];
  const stepLabel = isWarmup
    ? `溫習 ${index} / ${total}`
    : isSingleReview
      ? "再寫一次"
      : `第 ${index} / ${total} 個字`;
  const chips = stageChips(stage, isWarmup ? REVIEW_STAGE_META : STAGES);
  return `<div class="practice" data-screen="practice" data-stage="${stage}">
    <header class="top">
      <button type="button" class="btn ghost tiny" data-act="back">返回</button>
      <div class="step">${stepLabel}</div>
      ${dogFace(state, dailyPose(state.companion))}
    </header>
    <div class="chips" aria-label="步驟">${chips}</div>
    ${reading(entry)}
    <div class="tian-slot">${grid}</div>
    <p id="stroke-label" class="stroke-label">${stage === "listen" || stage === "cheer" ? "" : "第 1 筆"}</p>
    <p id="hint" class="hint${stage === "cheer" ? " is-ok" : ""}" aria-live="polite">${esc(hint)}</p>
    <div class="actions">
      <button type="button" class="btn ghost" data-act="retry">${retry}</button>
      ${slow}
      <button type="button" class="btn" id="next" data-act="next"${locked ? " disabled" : ""}>${forward}</button>
    </div>
  </div>`;
}

function boneEarnLine(reward) {
  const earned = reward.bonesEarned || [];
  if (!earned.length) {
    return `<p class="bone-earn muted">今日骨頭已滿（最多 2 嚿）。聽日再嚟啦！</p>`;
  }
  const labels = { lesson: "新一日", review: "溫習", zero: "零提示獎勵" };
  const bits = earned.map((r) => labels[r] || r).join(" · ");
  return `<p class="bone-earn">今日攞到 <b>+${earned.length}</b> 骨頭（${bits}）· 今日 ${reward.bonesToday || earned.length}/2</p>`;
}

export function renderReward(state) {
  const reward = state.pendingReward;
  if (!reward) return renderHome(state);
  const companion = dogBySlug(reward.companion);
  const newbie = reward.newDog ? dogBySlug(reward.newDog) : null;
  const star = newbie || companion;
  const isWarmup = reward.kind === "warmup";
  const more = !isWarmup && reward.day && reward.day < DAY_TOTAL;
  const ball = reward.ball ? dogBySlug(reward.ball) : null;
  const kicker = isWarmup ? "溫習寫完喇！好叻呀！" : "今日寫完喇！好叻呀！";
  const subtitle = isWarmup
    ? "溫習 3 個字寫好咗，攞骨頭啦！"
    : `第 ${reward.day} 日 3 個字都寫好咗，攞骨頭啦！`;
  return `<div class="page reward" data-screen="reward">
    <header class="top">${brandHtml()}${boneBadge(state)}</header>
    <section class="card celebrate">
      <p class="kicker">${kicker}</p>
      <h1>${newbie ? `識到新朋友：${esc(newbie.name)}` : `${esc(companion.name)}好開心`}</h1>
      <p class="muted">${subtitle}</p>
      ${boneEarnLine(reward)}
      <img class="reward-photo" src="${esc(poseSrc(star, "happy"))}" alt="${esc(star.name)}">
      <p class="breed">${esc(star.breed.zh)}</p>
      ${ball ? `<div class="ball"><img src="${esc(poseSrc(ball, "ball"))}" alt="${esc(ball.name)}同綠色網球"><p>${esc(ball.name)}搵到隱藏波波！</p></div>` : ""}
      <div class="actions">
        <button type="button" class="btn" data-act="home">返首頁</button>
        ${more ? '<button type="button" class="btn ghost" data-act="advance-start">下一日 3 個字</button>' : '<button type="button" class="btn ghost" data-act="tab" data-tab="dogs">去睇狗狗</button>'}
      </div>
    </section>
  </div>`;
}

export function renderDogs(state) {
  const unlocked = unlockedCount(state);
  const cards = dogs.map((dog, index) => {
    const open = index < unlocked;
    const selected = dog.slug === state.companion;
    const fresh = open && !(state.seenDogs || []).includes(dog.slug);
    if (!open) {
      const need = Math.max(0, index * 4 - state.completedDays.length);
      return `<button type="button" class="dog locked" data-act="locked-dog">
        <span class="paw" aria-hidden="true">${iconPaw()}</span>
        <span class="dog-name">未解鎖</span>
        <span class="muted">再寫 ${need || "多幾"} 日</span>
      </button>`;
    }
    const prog = dogAlbumProgress(state, dog.slug);
    return `<button type="button" class="dog${selected ? " on" : ""}" data-act="open-album" data-slug="${esc(dog.slug)}">
      <img src="${esc(poseSrc(dog, "sit"))}" alt="${esc(dog.name)}">
      <span class="dog-name">${esc(dog.name)}${fresh ? '<i class="pill">新</i>' : ""}</span>
      <span class="muted">${esc(dog.breed.zh)}</span>
      <span class="album-prog">${prog}/7 相</span>
      ${selected ? '<span class="pill mint">陪緊你</span>' : ""}
    </button>`;
  }).join("");
  return `<div class="page" data-screen="dogs">
    <header class="top">${brandHtml("狗狗圖鑑")}${boneBadge(state)}</header>
    <p class="lead">已識 ${unlocked} / ${dogs.length} 隻。撳隻狗睇相簿，用骨頭換相。每寫完 4 日多一隻朋友。</p>
    <div class="dog-grid">${cards}</div>
  </div>`;
}

function poseModal(state) {
  if (!state.pendingPose) return "";
  const dog = dogBySlug(state.pendingPose.slug);
  const pose = state.pendingPose.pose;
  return `<div class="sheet pose-sheet" role="dialog" aria-modal="true" aria-label="解鎖新相">
    <div class="sheet-card celebrate">
      <p class="kicker">換到新相喇！</p>
      <h2>${esc(dog.name)} · ${POSE_LABEL[pose] || pose}</h2>
      <img class="reward-photo" src="${esc(poseSrc(dog, pose))}" alt="${esc(dog.name)}">
      <button type="button" class="btn" data-act="dismiss-pose">太好喇！</button>
    </div>
  </div>`;
}

export function renderAlbum(state) {
  const slug = state.albumDog;
  const dog = dogBySlug(slug);
  if (!dog) return renderDogs(state);
  const entry = state.album[slug] || {};
  const slots = ALBUM_POSES.map((pose) => {
    const unlocked = Boolean(entry[pose]);
    if (unlocked) {
      return `<figure class="pose-slot open">
        <img src="${esc(poseSrc(dog, pose))}" alt="${esc(dog.name)} ${POSE_LABEL[pose]}">
        <figcaption>${POSE_LABEL[pose]}</figcaption>
      </figure>`;
    }
    if (pose === "ball") {
      return `<figure class="pose-slot locked ball-slot">
        <div class="pose-mystery">?</div>
        <figcaption>波波相</figcaption>
        <p class="pose-hint">同佢一齊零提示寫完一日</p>
      </figure>`;
    }
    if (pose === "sit") {
      return `<figure class="pose-slot locked"><div class="pose-mystery">${iconSilhouette()}</div><figcaption>坐低</figcaption></figure>`;
    }
    const cost = POSE_COSTS[pose];
    const can = (state.bones || 0) >= cost;
    return `<figure class="pose-slot locked">
      <div class="pose-mystery">${iconSilhouette()}</div>
      <figcaption>${POSE_LABEL[pose]}</figcaption>
      <button type="button" class="btn tiny ${can ? "" : "ghost"}" data-act="buy-pose" data-slug="${esc(slug)}" data-pose="${pose}" ${can ? "" : "disabled"}>
        用骨頭換相 · ${cost}🦴
      </button>
    </figure>`;
  }).join("");
  const selected = state.companion === slug;
  return `<div class="page album-page" data-screen="album">
    <header class="top">
      <button type="button" class="btn ghost tiny" data-act="close-album">‹ 返回</button>
      <div class="brand">${esc(dog.name)}相簿</div>
      ${boneBadge(state)}
    </header>
    <section class="card album-hero">
      <img src="${esc(poseSrc(dog, "sit"))}" alt="${esc(dog.name)}">
      <div>
        <h1>${esc(dog.name)}</h1>
        <p class="muted">${esc(dog.breed.zh)} · ${dogAlbumProgress(state, slug)}/7 相</p>
        ${selected
          ? '<span class="pill mint">陪緊你</span>'
          : `<button type="button" class="btn ghost tiny" data-act="pick-dog" data-slug="${esc(slug)}">揀佢陪我</button>`}
      </div>
    </section>
    <div class="pose-grid">${slots}</div>
    ${poseModal(state)}
  </div>`;
}

export function renderCards(state) {
  const week = state.cardWeek || 1;
  const list = weekChars(week);
  const dots = Array.from({ length: WEEK_TOTAL }, (_, i) => {
    const n = i + 1;
    return `<i class="${n === week ? "on" : ""}" data-act="card-week" data-week="${n}"></i>`;
  }).join("");
  const cells = list.map((entry) => {
    const unlocked = isCharUnlocked(state, entry);
    const dayIndex = (entry.day - 1) % 5;
    const bg = DAY_COLORS[dayIndex];
    if (!unlocked) {
      return `<div class="vc-cell locked" style="background:#E8EEF3"><span class="kai ghost-char">？</span><small>第 ${entry.day} 日</small></div>`;
    }
    const done = isDayDone(state, entry.day);
    return `<button type="button" class="vc-cell${done ? " done" : ""}" style="background:${bg}" data-act="open-card" data-char="${esc(entry.char)}">
      <span class="kai">${esc(entry.char)}</span>
      <small>${esc(entry.jyutping)}</small>
      <span class="ex">${esc(entry.exampleWord)}</span>
    </button>`;
  }).join("");
  const learned = list.filter((entry) => isDayDone(state, entry.day)).length;
  return `<div class="page cards" data-screen="cards">
    <header class="top">
      ${brandHtml("生字卡")}
      ${boneBadge(state)}
      <div class="dots" aria-label="週次">${dots}</div>
    </header>
    <p class="lead">第 ${week} 週 · 15 個字 · 已寫 ${learned} / 15 · 左右掃睇其他週</p>
    <div class="swipe" data-swipe="cards">
      <div class="vc" id="vcard">
        <div class="vc-head">
          ${dogFace(state, dailyPose(state.companion))}
          <div class="vc-title">
            <div class="vc-kicker">第一季 · 第 ${week} 週</div>
            <div class="vc-name">生字卡</div>
          </div>
          <div class="vc-count"><b>15</b>字</div>
        </div>
        <div class="vc-grid">${cells}</div>
        <div class="vc-foot"><span>撳個字睇大啲</span><span class="vc-logo">汪汪中文</span></div>
      </div>
    </div>
    <div class="cardtools">
      <button type="button" class="btn ghost" data-act="card-week" data-week="${week - 1}" ${week <= 1 ? "disabled" : ""}>‹ 上一週</button>
      <button type="button" class="btn ghost" data-act="card-week" data-week="${week + 1}" ${week >= WEEK_TOTAL ? "disabled" : ""}>下一週 ›</button>
    </div>
    ${cardDetailHtml(state)}
  </div>`;
}

function cardDetailHtml(state) {
  if (!state.cardDetail) return "";
  const entry = characters.find((item) => item.char === state.cardDetail);
  if (!entry) return "";
  return `<div class="sheet" id="card-sheet" role="dialog" aria-modal="true" aria-label="生字詳情">
    <div class="sheet-card">
      <button type="button" class="sheet-close" data-act="close-card" aria-label="關閉">×</button>
      <div class="tian big-tian" aria-hidden="true">
        <div class="lines"><i></i><b></b></div>
        <div class="model-char kai">${esc(entry.char)}</div>
      </div>
      <p class="reading center"><span class="jyut big-jyut">${esc(entry.jyutping)}</span></p>
      <div class="example center">
        <span class="ex-label">例詞</span>
        <span class="kai ex-word">${esc(entry.exampleWord)}</span>
        <span class="jyut ex-jyut">${esc(entry.exampleJyutping)}</span>
      </div>
      <div class="audio-row">
        <button type="button" class="btn ab" data-act="speak-card" data-char="${esc(entry.char)}" data-slow="0"><span aria-hidden="true">🔊</span>聽讀音</button>
        <button type="button" class="btn ghost ab" data-act="speak-card" data-char="${esc(entry.char)}" data-slow="1"><span aria-hidden="true">🐢</span>慢速</button>
      </div>
      <button type="button" class="btn" data-act="review" data-char="${esc(entry.char)}">再寫一次</button>
    </div>
  </div>`;
}

export function renderAbout(state) {
  const rows = recordList(state);
  const body = rows.length
    ? `<table><caption>練習記錄（畀家長睇，唔係分數）</caption><thead><tr><th>字</th><th>提示次數</th></tr></thead><tbody>${rows.map((row) => `<tr><td class="kai">${esc(row.char)}</td><td>${row.hints}</td></tr>`).join("")}</tbody></table>`
    : '<p class="muted">未有記錄。寫完一個字就會記低。</p>';
  return `<div class="page about" data-screen="about">
    <header class="top">${brandHtml("關於我")}</header>
    <section class="card prose">
      <h1>汪汪中文</h1>
      <p>香港小學生用嘅筆順描紅練習。每日 3 個字，同小狗一齊寫。寫完攞骨頭換狗狗相。寫錯可以再試，冇愛心，冇扣分。</p>
      <p>第一季 180 字（60 日）。筆順跟香港教育局《香港小學學習字詞表》建議次序；筆畫外形用開源資料。有出入嘅字已按教育局次序重排（出、母、的、來、飛）。</p>
      <h2>鳴謝</h2>
      <ul>
        <li>字卡同例詞用「自由香港楷書」（自由香港字型，CC BY 4.0）。</li>
        <li>粵拼用香港語言學學會方案，以教育局字詞表讀音為準（內部整理）。</li>
        <li>描紅用 <a href="/licenses.txt">hanzi-writer（MIT）</a> 同 hanzi-writer-data（文鼎公眾授權條款）。</li>
        <li>狗狗相係 AI 草稿，之後會換真實相片。</li>
      </ul>
      <p><a href="/licenses.txt">完整授權條款</a></p>
      <p class="muted">粵語聲音：有預先錄好嘅檔案（assets/audio/U+XXXX.mp3）就播檔案；未有就用裝置嘅粵語（zh-HK）聲音。冇粵語聲音就只顯示粵拼，唔會改用普通話。</p>
    </section>
    <section class="card">${body}</section>
  </div>`;
}

export function renderMain(state) {
  if (state.screen === "practice" && state.active) return renderPractice(state);
  if (state.screen === "reward") return renderReward(state);
  if (state.screen === "album") return renderAlbum(state);
  if (state.screen === "dogs") return renderDogs(state);
  if (state.screen === "about") return renderAbout(state);
  if (state.screen === "map") return renderMap(state);
  if (state.screen === "cards") return renderCards(state);
  return renderHome(state);
}
