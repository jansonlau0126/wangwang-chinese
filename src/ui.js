import { dayChars, DAY_TOTAL, WEEK_TOTAL, characters, weekChars, weekOfDay } from "./chars.js";
import { dailyPose, dogBySlug, dogs, heroSrc, poseSrc } from "./dogs.js";
import { companionName, isCharUnlocked, isDayDone, recordList, tileStatus, unlockedCount } from "./state.js";

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
function iconMap() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5 9 4.5l6 2 5-2v13l-5 2-6-2-5 2V6.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 4.5v13M15 6.5v13" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
}
function iconCards() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="12" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 5h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
}
function iconPaw() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="8" r="2" fill="currentColor"/><circle cx="12" cy="6.2" r="2" fill="currentColor"/><circle cx="17" cy="8" r="2" fill="currentColor"/><ellipse cx="12" cy="15.5" rx="4.2" ry="3.3" fill="currentColor"/></svg>';
}
function iconMe() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="3.2" fill="currentColor"/><path d="M5.5 19.5c1.6-3.2 4-4.8 6.5-4.8s4.9 1.6 6.5 4.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
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
  if (allDone && done) {
    primary = '<button type="button" class="btn" data-act="tab" data-tab="dogs">去睇狗狗</button>';
  } else if (done) {
    primary = '<button type="button" class="btn" data-act="advance">下一日 3 個字</button>';
  } else if (state.active && state.active.day === day && !state.active.review) {
    primary = '<button type="button" class="btn" data-act="start">繼續寫</button>';
  } else {
    primary = '<button type="button" class="btn" data-act="start">開始寫</button>';
  }
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
  const title = allDone && done ? "第一季寫完喇！好叻呀！" : `第 ${day} 日 · 第 ${week} 週`;
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
        <span class="pill${done ? " mint" : ""}">${done ? "寫好喇" : "未寫完"}</span>
      </div>
      <p class="muted">今日${esc(name)}陪你。寫錯唔緊要，再嚟一次！</p>
      <div class="tiles">${tiles}</div>
      <div class="actions">${primary}${rewardLink}</div>
    </section>
    <p class="progress-line">已寫 ${state.completedDays.length} / ${DAY_TOTAL} 日 · 識咗 ${unlockedCount(state)} / ${dogs.length} 隻狗</p>
  </div>`;
}

export function renderMap(state) {
  const weeks = [];
  for (let week = 1; week <= WEEK_TOTAL; week += 1) {
    const start = (week - 1) * 5 + 1;
    const cells = [];
    for (let day = start; day <= start + 4; day += 1) {
      const done = isDayDone(state, day);
      const current = day === state.cursorDay;
      const locked = day > state.cursorDay && !done;
      const cls = done ? "done" : current ? "now" : locked ? "locked" : "todo";
      cells.push(`<button type="button" class="map-day ${cls}" data-act="goto-day" data-day="${day}" ${locked ? "disabled" : ""}>
        <span class="n">${day}</span>
        <span class="kai">${dayChars(day).map((e) => e.char).join("")}</span>
      </button>`);
    }
    weeks.push(`<section class="card map-week"><h2>第 ${week} 週</h2><div class="map-row">${cells.join("")}</div></section>`);
  }
  return `<div class="page" data-screen="map">
    <header class="top"><div class="brand">進度地圖</div></header>
    <p class="lead">每寫完 4 日就識多一隻狗狗。而家完成咗 ${state.completedDays.length} 日。</p>
    ${weeks.join("")}
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
    listen: "去睇汪汪寫",
    watch: "跟腳印描",
    guided: "少啲腳印",
    light: "我自己寫",
    free: "寫好喇！",
    cheer: state.active.review ? "返生字卡" : (index >= total ? "攞骨頭" : "下一個字"),
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
  return `<div class="practice" data-screen="practice" data-stage="${stage}">
    <header class="top">
      <button type="button" class="btn ghost tiny" data-act="back">返回</button>
      <div class="step">${state.active.review ? "再寫一次" : `第 ${index} / ${total} 個字`}</div>
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
      <p class="kicker">今日寫完喇！好叻呀！</p>
      <h1>${newbie ? `識到新朋友：${esc(newbie.name)}` : `${esc(companion.name)}好開心`}</h1>
      <p class="muted">第 ${reward.day} 日 3 個字都寫好咗，攞骨頭啦！</p>
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
    <p class="lead">已識 ${unlocked} / ${dogs.length} 隻。每寫完 4 日，就識多一隻朋友。起始係毛毛。</p>
    <div class="dog-grid">${cards}</div>
    <section class="card">
      <h2>狗狗相簿</h2>
      ${balls ? `<div class="album">${balls}</div>` : "<p class=\"muted\">未有隱藏波波。同一個狗狗陪滿 3 日，或者今日 3 個字都冇提示，就會見到（固定規則，唔係隨機）。</p>"}
    </section>
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
      <div class="brand">生字卡</div>
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

export function renderAbout(state) {
  const rows = recordList(state);
  const body = rows.length
    ? `<table><caption>練習記錄（畀家長睇，唔係分數）</caption><thead><tr><th>字</th><th>提示次數</th></tr></thead><tbody>${rows.map((row) => `<tr><td class="kai">${esc(row.char)}</td><td>${row.hints}</td></tr>`).join("")}</tbody></table>`
    : '<p class="muted">未有記錄。寫完一個字就會記低。</p>';
  return `<div class="page about" data-screen="about">
    <header class="top"><div class="brand">關於我</div></header>
    <section class="card prose">
      <h1>汪汪中文</h1>
      <p>香港小學生用嘅筆順描紅練習。每日 3 個字，同小狗一齊寫。寫錯可以再試，冇愛心，冇扣分。</p>
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
  if (state.screen === "dogs") return renderDogs(state);
  if (state.screen === "about") return renderAbout(state);
  if (state.screen === "map") return renderMap(state);
  if (state.screen === "cards") return renderCards(state);
  return renderHome(state);
}
