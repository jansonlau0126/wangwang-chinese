import { dayChars, DAY_TOTAL, characters } from "./chars.js";
import { dailyPose, dogBySlug, dogs, heroSrc, poseSrc } from "./dogs.js";
import { companionName, isDayDone, recordList, tileStatus, unlockedCount } from "./state.js";

const STAGES = [
  { id: "listen", label: "聽" },
  { id: "watch", label: "看" },
  { id: "guided", label: "描紅" },
  { id: "light", label: "少提示" },
  { id: "free", label: "自己寫" },
  { id: "cheer", label: "獎賞" },
];

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
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" fill="currentColor"/></svg>';
}
function iconPaw() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="8" r="2" fill="currentColor"/><circle cx="12" cy="6.2" r="2" fill="currentColor"/><circle cx="17" cy="8" r="2" fill="currentColor"/><ellipse cx="12" cy="15.5" rx="4.2" ry="3.3" fill="currentColor"/></svg>';
}
function iconAbout() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="8.2" r="1.2" fill="currentColor"/><path d="M11 11h2v6h-2z" fill="currentColor"/></svg>';
}

function statusLabel(status) {
  if (status === "done") return "已完成";
  if (status === "now") return "寫緊";
  return "未寫";
}

export function renderTabs(state) {
  const tabs = [
    ["home", "首頁", iconHome()],
    ["dogs", "圖鑑", iconPaw()],
    ["about", "關於", iconAbout()],
  ];
  return tabs.map(([id, label, icon]) => {
    const on = state.screen === id;
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
  if (allDone && done) {
    primary = '<button type="button" class="btn" data-act="tab" data-tab="dogs">去睇狗狗圖鑑</button>';
  } else if (done) {
    primary = '<button type="button" class="btn" data-act="advance">下一日 3 個字</button>';
  } else if (state.active && state.active.day === day && !state.active.review) {
    primary = '<button type="button" class="btn" data-act="start">繼續寫</button>';
  } else {
    primary = '<button type="button" class="btn" data-act="start">開始寫</button>';
  }
  const rewardLink = state.pendingReward
    ? '<button type="button" class="btn ghost" data-act="reward">睇返今日獎賞</button>'
    : "";
  const tiles = list.map((entry, index) => {
    const status = tileStatus(state, day, index);
    return `<button type="button" class="tile ${status}" data-act="tile" data-char="${esc(entry.char)}" data-status="${status}">
      <span class="glyph kai">${esc(entry.char)}</span>
      <span class="jyut">${esc(entry.jyutping)}</span>
      <span class="status">${statusLabel(status)}</span>
    </button>`;
  }).join("");
  const earlier = characters.filter((entry) => state.completedDays.includes(entry.day) && entry.day !== day);
  const earlierHtml = earlier.length
    ? `<section class="card"><h2>之前寫過</h2><p class="muted">撳個字可以再描。</p><div class="mini-chars">${earlier.map((entry) => `<button type="button" class="mini kai" data-act="review" data-char="${esc(entry.char)}">${esc(entry.char)}</button>`).join("")}</div></section>`
    : "";
  const title = allDone && done ? "第一期寫完喇" : `第 ${day} 日 · 今日 3 個字`;
  return `<div class="page" data-screen="home">
    <header class="top">
      <div class="brand">汪汪中文</div>
      <button type="button" class="who" data-act="tab" data-tab="dogs">${dogFace(state, homePose(state))}<span>${esc(name)}</span></button>
    </header>
    <figure class="hero">
      <img src="${esc(heroSrc)}" alt="毛毛伏喺空白田字格簿上面">
      <figcaption>
        <b>同小狗一齊寫好每個字</b>
        <span>寫完可以再描，唔催命。</span>
      </figcaption>
    </figure>
    <section class="card today">
      <div class="row">
        <h1>${title}</h1>
        <span class="pill${done ? " mint" : ""}">${done ? "已完成" : "未完成"}</span>
      </div>
      <p class="muted">今日${esc(name)}陪你。寫錯可以再試。</p>
      <div class="tiles">${tiles}</div>
      <div class="actions">${primary}${rewardLink}</div>
    </section>
    <p class="progress-line">已完成 ${state.completedDays.length} / ${DAY_TOTAL} 日 · 已識 ${unlockedCount(state)} / ${dogs.length} 隻狗</p>
    ${earlierHtml}
  </div>`;
}

function stageChips(current) {
  return STAGES.map((stage) => {
    const on = stage.id === current;
    const passed = STAGES.findIndex((item) => item.id === stage.id) < STAGES.findIndex((item) => item.id === current);
    return `<span class="chip${on ? " on" : ""}${passed ? " done" : ""}">${stage.label}</span>`;
  }).join("");
}

function reading(entry) {
  return `<p class="reading"><span class="kai name">${esc(entry.char)}</span> <span class="jyut">${esc(entry.jyutping)}</span></p>
    <p class="example">例詞 <span class="kai">${esc(entry.exampleWord)}</span> <span class="jyut">${esc(entry.exampleJyutping)}</span></p>`;
}

export function renderPractice(state) {
  const entry = state.active?.review
    ? characters.find((item) => item.char === state.active.reviewChar)
    : dayChars(state.active.day)[state.active.index];
  const stage = state.active.stage;
  const index = state.active.review ? 1 : state.active.index + 1;
  const total = state.active.review ? 1 : 3;
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
  const forward = {
    listen: "去睇筆順",
    watch: "開始描",
    guided: "少提示描",
    light: "自己寫",
    free: "寫好喇",
    cheer: state.active.review ? "返回" : (index >= total ? "睇今日獎賞" : "下一個字"),
  }[stage];
  const retry = {
    listen: "再聽一次",
    watch: "再看一次",
    guided: "再描一次",
    light: "再描一次",
    free: "再寫一次",
    cheer: "再寫一次",
  }[stage];
  const locked = stage === "watch" || stage === "guided" || stage === "light" || stage === "free";
  const slow = stage === "watch"
    ? `<button type="button" class="btn ghost" data-act="slow">${state.active.slow ? "正常速度" : "慢啲"}</button>`
    : "";
  const hint = {
    listen: "聽清楚，再跟住讀。",
    watch: "睇住每一筆點寫。",
    guided: "跟住淡字、圓點同箭嘴寫。",
    light: "淡字仲喺度，自己搵起筆。",
    free: "格仔空咗，試下自己寫。",
    cheer: `${dog.name}好開心，你寫好「${entry.char}」喇。`,
  }[stage];
  return `<div class="practice" data-screen="practice" data-stage="${stage}">
    <header class="top">
      <button type="button" class="btn ghost tiny" data-act="back">返回</button>
      <div class="step">第 ${index} / ${total} 個字</div>
      ${dogFace(state, dailyPose(state.companion))}
    </header>
    <div class="chips" aria-label="步驟">${stageChips(stage)}</div>
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

export function renderReward(state) {
  const reward = state.pendingReward;
  if (!reward) return renderHome(state);
  const companion = dogBySlug(reward.companion);
  const newbie = reward.newDog ? dogBySlug(reward.newDog) : null;
  const star = newbie || companion;
  const more = reward.day < DAY_TOTAL;
  const ball = reward.ball ? dogBySlug(reward.ball) : null;
  return `<div class="page reward" data-screen="reward">
    <header class="top"><div class="brand">汪汪中文</div></header>
    <section class="card celebrate">
      <p class="kicker">今日寫完喇</p>
      <h1>${newbie ? `識到新朋友：${esc(newbie.name)}` : `${esc(companion.name)}好開心`}</h1>
      <p class="muted">第 ${reward.day} 日 3 個字都自己寫好咗。</p>
      <img class="reward-photo" src="${esc(poseSrc(star, "happy"))}" alt="${esc(star.name)}">
      <p class="breed">${esc(star.breed.zh)}</p>
      ${ball ? `<div class="ball"><img src="${esc(poseSrc(ball, "ball"))}" alt="${esc(ball.name)}同綠色網球"><p>${esc(ball.name)}搵到隱藏波波！</p></div>` : ""}
      <div class="actions">
        <button type="button" class="btn" data-act="home">返首頁</button>
        ${more ? '<button type="button" class="btn ghost" data-act="advance-start">下一日 3 個字</button>' : '<button type="button" class="btn ghost" data-act="tab" data-tab="dogs">去圖鑑</button>'}
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
      return `<button type="button" class="dog locked" data-act="locked-dog">
        <span class="paw" aria-hidden="true">${iconPaw()}</span>
        <span class="dog-name">未解鎖</span>
        <span class="muted">再寫多幾日</span>
      </button>`;
    }
    return `<button type="button" class="dog${selected ? " on" : ""}" data-act="pick-dog" data-slug="${esc(dog.slug)}">
      <img src="${esc(poseSrc(dog, "sit"))}" alt="${esc(dog.name)}">
      <span class="dog-name">${esc(dog.name)}${fresh ? '<i class="pill">新</i>' : ""}</span>
      <span class="muted">${esc(dog.breed.zh)}</span>
      ${selected ? '<span class="pill mint">陪緊你</span>' : '<span class="pick">揀佢陪我</span>'}
    </button>`;
  }).join("");
  const balls = state.balls.map((slug) => {
    const dog = dogBySlug(slug);
    return `<figure class="ball-shot"><img src="${esc(poseSrc(dog, "ball"))}" alt="${esc(dog.name)}同綠色網球"><figcaption>${esc(dog.name)}的波波</figcaption></figure>`;
  }).join("");
  return `<div class="page" data-screen="dogs">
    <header class="top"><div class="brand">狗狗圖鑑</div></header>
    <p class="lead">已識 ${unlocked} / ${dogs.length} 隻。每寫完 2 日，就識多一隻朋友。起始係毛毛。</p>
    <div class="dog-grid">${cards}</div>
    <section class="card">
      <h2>狗狗相簿</h2>
      ${balls ? `<div class="album">${balls}</div>` : "<p class=\"muted\">未有隱藏波波。同一個狗狗陪滿 3 日，或者今日 3 個字都冇提示，就會見到。</p>"}
    </section>
  </div>`;
}

export function renderAbout(state) {
  const rows = recordList(state);
  const body = rows.length
    ? `<table><caption>練習記錄（畀家長睇，唔係分數）</caption><thead><tr><th>字</th><th>提示次數</th></tr></thead><tbody>${rows.map((row) => `<tr><td class="kai">${esc(row.char)}</td><td>${row.hints}</td></tr>`).join("")}</tbody></table>`
    : '<p class="muted">未有記錄。寫完一個字就會記低。</p>';
  return `<div class="page about" data-screen="about">
    <header class="top"><div class="brand">關於</div></header>
    <section class="card prose">
      <h1>汪汪中文</h1>
      <p>香港小學生用嘅筆順描紅練習。每日 3 個字，同小狗一齊寫。寫錯可以再試，冇愛心，冇扣分。</p>
      <p>筆順跟香港教育局《香港小學學習字詞表》建議次序。筆畫外形用開源資料。第一期 30 字已對過教育局動畫；「出」的筆畫次序已重排。</p>
      <h2>鳴謝</h2>
      <ul>
        <li>字卡同例詞用「自由香港楷書」（自由香港字型，CC BY 4.0）。</li>
        <li>粵拼用香港語言學學會方案，對照 rime-cantonese / CanCLID（CC BY 4.0）同教育局字詞表。</li>
        <li>描紅用 hanzi-writer（MIT）同 hanzi-writer-data（文鼎公眾授權條款 Arphic Public License）。</li>
        <li>狗狗相係 AI 草稿，之後會換真實相片。</li>
      </ul>
      <p class="muted">粵語聲音如果有預先錄好的檔案（assets/audio/字.mp3）就播檔案；未有檔案就用裝置嘅粵語（zh-HK）聲音。冇粵語聲音就只顯示粵拼，唔會改用普通話。</p>
    </section>
    <section class="card">${body}</section>
  </div>`;
}

export function renderMain(state) {
  if (state.screen === "practice" && state.active) return renderPractice(state);
  if (state.screen === "reward") return renderReward(state);
  if (state.screen === "dogs") return renderDogs(state);
  if (state.screen === "about") return renderAbout(state);
  return renderHome(state);
}
