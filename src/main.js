import {
  hasCantoneseVoice,
  markNoVoiceNoticeSeen,
  playReading,
  shouldShowNoVoiceNotice,
  stopAudio,
  warmVoices,
  whenVoicesReady,
} from "./audio.js";
import { playRewardSfx, playSfx, setSfxEnabled } from "./sfx.js";
import { downloadShareCard, sharePayloadFromReward } from "./shareCard.js";
import { destroyPractice, mountPractice } from "./practice.js";
import "./styles.css";
import {
  advanceDay,
  beginReview,
  buyPose,
  closeAlbum,
  closeCardDetail,
  currentEntry,
  dismissPoseUnlock,
  dismissReward,
  ensureHints,
  leavePractice,
  loadState,
  markDogsSeen,
  noteFreeFinished,
  openAlbum,
  openCardDetail,
  pickCompanion,
  retryStage,
  saveState,
  setCardWeek,
  startPractice,
  startSeason2,
  startWarmup,
  switchSeason,
  goNextStage,
  S2_DAY_TOTAL,
} from "./state.js";
import { findChar } from "./chars.js";
import { dogBySlug, dogs } from "./dogs.js";
import { unlockedDogCount } from "./strokeOrder.js";
import { renderMain, renderTabs } from "./ui.js";

const state = loadState();
let toastTimer = 0;
let renderLock = 0;
let lastSpeak = { key: "", t: 0 };
let swipeStart = null;

const HASH = {
  home: "#/",
  map: "#/map",
  cards: "#/cards",
  dogs: "#/dogs",
  album: "#/dogs",
  about: "#/about",
  practice: "#/write",
  reward: "#/reward",
};

function screenFromHash() {
  const hash = location.hash || "#/";
  if (hash.startsWith("#/dogs")) return "dogs";
  if (hash.startsWith("#/about")) return "about";
  if (hash.startsWith("#/map")) return "map";
  if (hash.startsWith("#/cards")) return "cards";
  if (hash.startsWith("#/write")) return "practice";
  if (hash.startsWith("#/reward")) return "reward";
  return "home";
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove("show"), 2400);
}

function applyStoredScreenFromHash() {
  if (!location.hash) return;
  const wanted = screenFromHash();
  if (wanted === "practice" && state.active) state.screen = "practice";
  else if (wanted === "reward" && state.pendingReward) state.screen = "reward";
  else if (["dogs", "about", "home", "map", "cards"].includes(wanted)) state.screen = wanted;
}

function titleFor(screen) {
  if (screen === "dogs" || screen === "album") return "狗狗圖鑑 · 汪汪中文";
  if (screen === "about") return "關於 · 汪汪中文";
  if (screen === "cards") return "生字卡 · 汪汪中文";
  if (screen === "map") return "進度 · 汪汪中文";
  return "汪汪中文";
}


/** Call only from a user gesture after completing a day / warmup. */
function cueRewardSfx() {
  const reward = state.pendingReward;
  if (!reward) return;
  playRewardSfx({
    bonesEarned: reward.bonesEarned || [],
    newDog: reward.newDog,
    ball: reward.ball,
  });
  if (reward.streakMilestone) {
    setTimeout(() => playSfx("streak"), 420);
  }
  if (reward.playFinale) {
    setTimeout(() => playSfx("unlock"), 500);
  }
}

function render() {
  const pass = ++renderLock;
  stopAudio();
  destroyPractice();
  document.body.dataset.mode = state.screen === "practice" || state.screen === "reward" ? "focus" : "tabs";
  document.getElementById("main").innerHTML = renderMain(state);
  document.getElementById("tabs").innerHTML = renderTabs(state);
  document.title = titleFor(state.screen);
  if (state.screen === "dogs") {
    const before = (state.seenDogs || []).join(",");
    markDogsSeen(state);
    if ((state.seenDogs || []).join(",") !== before) saveState(state);
  }
  if (state.screen === "map" && state.season !== "s2") {
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-stone="${state.cursorDay}"]`);
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }
  const entry = currentEntry(state);
  if (state.screen === "practice" && state.active && entry) {
    const stage = state.active.stage;
    if (stage === "listen") {
      refreshListenUi();
    } else if (stage === "watch" || stage === "guided" || stage === "light" || stage === "free") {
      requestAnimationFrame(() => {
        if (pass !== renderLock) return;
        mountPractice({
          entry,
          stage,
          slow: Boolean(state.active?.slow),
          onMiss() {
            const hints = ensureHints(state, entry.char);
            hints[stage] = (hints[stage] || 0) + 1;
            saveState(state);
          },
          onDone() {
            if (stage === "free") {
              noteFreeFinished(state);
              saveState(state);
            }
          },
        });
      });
    }
  }
  updateSpeakButtons();
}

function refreshListenUi() {
  const hint = document.getElementById("hint");
  if (!hint || state.active?.stage !== "listen") return;
  whenVoicesReady().then((ok) => {
    if (state.active?.stage !== "listen") return;
    if (!ok) {
      hint.textContent = "呢部機未有廣東話聲，可以睇住拼音讀。";
      hint.classList.add("is-warn");
      maybeShowNoVoiceNotice();
    }
    updateSpeakButtons();
  });
}

function maybeShowNoVoiceNotice() {
  if (hasCantoneseVoice()) return;
  if (!shouldShowNoVoiceNotice()) return;
  markNoVoiceNoticeSeen();
  const host = document.getElementById("main");
  if (!host || host.querySelector(".voice-notice")) return;
  const box = document.createElement("div");
  box.className = "voice-notice";
  box.setAttribute("role", "status");
  box.innerHTML = `<p>呢部機未有廣東話聲，可以睇住拼音讀。</p>
    <p class="voice-notice-sub">去「我」頁睇點樣加粵語聲音。</p>
    <button type="button" class="btn ghost tiny" data-act="dismiss-voice-notice">知喇</button>`;
  host.prepend(box);
}

function updateSpeakButtons() {
  const ok = hasCantoneseVoice();
  document.querySelectorAll("[data-act='speak-card']").forEach((btn) => {
    btn.classList.toggle("speak-muted", !ok);
    btn.setAttribute("aria-disabled", ok ? "false" : "true");
    const icon = btn.querySelector("[data-speak-icon]");
    if (icon) icon.textContent = ok ? "🔊" : "🔇";
  });
}

/** Speak from a user gesture (iOS requires this). */
function speakListenIfNeeded(opts = {}) {
  const entry = currentEntry(state);
  if (!(state.screen === "practice" && state.active?.stage === "listen" && entry)) return;
  playReading(entry, { slow: Boolean(state.active?.slow) || Boolean(opts.slow) }).then((result) => {
    if (state.active?.stage !== "listen") return;
    const hint = document.getElementById("hint");
    if (!result.voice) {
      if (hint) {
        hint.textContent = "呢部機未有廣東話聲，可以睇住拼音讀。";
        hint.classList.add("is-warn");
      }
      maybeShowNoVoiceNotice();
    }
    updateSpeakButtons();
  });
}


function show(screen) {
  state.screen = screen;
  const hash = HASH[screen] || "#/";
  if (location.hash !== hash) history.pushState({ screen }, "", hash);
  saveState(state);
  render();
}

function refresh() {
  saveState(state);
  render();
}

function speakCard(char, wantSlow) {
  const entry = findChar(char);
  if (!entry) return;
  if (!hasCantoneseVoice()) {
    maybeShowNoVoiceNotice();
    updateSpeakButtons();
    toast("呢部機未有廣東話聲，可以睇住拼音讀。");
    return;
  }
  const key = char;
  const now = Date.now();
  const dbl = lastSpeak.key === key && now - lastSpeak.t < 300;
  lastSpeak = { key, t: now };
  const slow = wantSlow || dbl;
  playReading(entry, { slow });
}

function onClick(event) {
  const button = event.target.closest("[data-act]");
  if (!button || button.disabled) return;
  const act = button.dataset.act;
  if (act === "tab") {
    if (state.screen === "practice") leavePractice(state);
    if (state.screen === "reward") dismissReward(state);
    if (state.screen === "album") closeAlbum(state);
    closeCardDetail(state);
    show(button.dataset.tab || "home");
    return;
  }
  if (act === "dismiss-voice-notice") {
    const n = document.querySelector(".voice-notice");
    if (n) n.remove();
    return;
  }
  if (act === "start") {
    startPractice(state);
    show("practice");
    speakListenIfNeeded();
    return;
  }
  if (act === "warmup") {
    if (startWarmup(state)) {
      show("practice");
      speakListenIfNeeded();
    } else toast("未有溫習字。先寫幾日新字啦！");
    return;
  }
  if (act === "tile") {
    const status = button.dataset.status;
    if (status === "done") {
      beginReview(state, button.dataset.char, "home");
      show("practice");
      speakListenIfNeeded();
    } else if (status === "now" || status === "next") {
      startPractice(state);
      show("practice");
      speakListenIfNeeded();
    } else {
      toast("先寫前面個字啦！");
    }
    return;
  }
  if (act === "review") {
    beginReview(state, button.dataset.char, "cards");
    show("practice");
    speakListenIfNeeded();
    return;
  }
  if (act === "open-card") {
    if (openCardDetail(state, button.dataset.char)) refresh();
    else toast("呢個字未解鎖。");
    return;
  }
  if (act === "close-card") {
    closeCardDetail(state);
    refresh();
    return;
  }
  if (act === "speak-card") {
    speakCard(button.dataset.char, button.dataset.slow === "1");
    return;
  }
  if (act === "card-week") {
    setCardWeek(state, Number(button.dataset.week));
    closeCardDetail(state);
    refresh();
    return;
  }
  if (act === "goto-day") {
    const day = Number(button.dataset.day);
    if (state.season === "s2") {
      if (state.s2?.started && day >= 1 && day <= state.s2.cursorDay) {
        state.s2.cursorDay = day;
        show("home");
      } else if (!state.s2?.started) {
        toast(state.completedDays.length >= 60 ? "先去首頁開始第二季探險" : "完成第一季先可以寫第二季（而家只係預覽）");
      }
    } else if (day >= 1 && day <= state.cursorDay) {
      state.cursorDay = day;
      show("home");
    }
    return;
  }
  if (act === "back") {
    leavePractice(state);
    show(state.screen);
    return;
  }
  if (act === "next") {
    button.disabled = true;
    goNextStage(state);
    show(state.screen);
    if (state.screen === "reward") cueRewardSfx();
    else speakListenIfNeeded();
    return;
  }
  if (act === "retry") {
    if (state.active?.stage === "listen") {
      speakListenIfNeeded();
      return;
    }
    retryStage(state);
    refresh();
    return;
  }
  if (act === "slow") {
    if (state.active) state.active.slow = !state.active.slow;
    refresh();
    return;
  }
  if (act === "advance") {
    advanceDay(state);
    show("home");
    return;
  }
  if (act === "advance-start") {
    if (advanceDay(state)) startPractice(state);
    show(state.screen === "practice" ? "practice" : "home");
    return;
  }
  if (act === "home") {
    dismissReward(state);
    show("home");
    return;
  }
  if (act === "toggle-sfx") {
    // Handler is on the checkbox; label "for" synthesizes one click on the input.
    if (event.target !== button) return;
    const on = Boolean(button.checked);
    setSfxEnabled(on);
    if (on) playSfx("complete");
    return;
  }
  if (act === "reward") {
    if (state.pendingReward) show("reward");
    return;
  }
  if (act === "open-album") {
    if (openAlbum(state, button.dataset.slug)) show("album");
    return;
  }
  if (act === "close-album") {
    closeAlbum(state);
    show("dogs");
    return;
  }
  if (act === "buy-pose") {
    if (buyPose(state, button.dataset.slug, button.dataset.pose)) {
      playSfx("unlock");
      refresh();
      toast("換到新相喇！");
    } else {
      toast("骨頭唔夠呀，再寫多啲啦！");
    }
    return;
  }
  if (act === "dismiss-pose") {
    dismissPoseUnlock(state);
    refresh();
    return;
  }
  if (act === "pick-dog") {
    if (pickCompanion(state, button.dataset.slug)) {
      refresh();
      toast(`${dogBySlug(state.companion).name}會陪你寫字！`);
    }
    return;
  }
  if (act === "start-s2") {
    if (startSeason2(state)) {
      playSfx("unlock");
      show("home");
      toast("第二季探險開始！");
    } else {
      toast("完成第一季先可以開始第二季。");
    }
    return;
  }
  if (act === "switch-s1") {
    switchSeason(state, "s1");
    show("home");
    return;
  }
  if (act === "switch-s2") {
    if (switchSeason(state, "s2")) show("home");
    else toast("完成第一季先。");
    return;
  }
  if (act === "share-card") {
    const payload = sharePayloadFromReward(state.pendingReward, state);
    if (!payload) {
      toast("未有可分享內容。");
      return;
    }
    downloadShareCard(payload).then((ok) => {
      toast(ok ? "分享卡已儲存／下載" : "無法產生分享卡");
    });
    return;
  }
  if (act === "locked-dog") {
    toast("未解鎖。每寫完 4 日就識多一隻朋友。");
  }
}

function onPointerDown(event) {
  const swipe = event.target.closest("[data-swipe='cards']");
  if (!swipe || state.cardDetail) return;
  swipeStart = { x: event.clientX, y: event.clientY, t: Date.now() };
}

function onPointerUp(event) {
  if (!swipeStart || state.screen !== "cards") {
    swipeStart = null;
    return;
  }
  const dx = event.clientX - swipeStart.x;
  const dy = event.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
  setCardWeek(state, state.cardWeek + (dx < 0 ? 1 : -1));
  refresh();
}

document.body.addEventListener("click", onClick);
document.body.addEventListener("pointerdown", onPointerDown);
document.body.addEventListener("pointerup", onPointerUp);
window.addEventListener("popstate", () => {
  const wanted = screenFromHash();
  if (state.screen === "practice" && wanted !== "practice") leavePractice(state);
  if (state.screen === "album" && wanted !== "dogs") {
    closeAlbum(state);
  }
  if (wanted === "practice" && state.active) state.screen = "practice";
  else if (wanted === "reward" && state.pendingReward) state.screen = "reward";
  else state.screen = wanted === "practice" || wanted === "reward" ? "home" : wanted;
  saveState(state);
  render();
});

applyStoredScreenFromHash();
if (!location.hash) history.replaceState({ screen: state.screen }, "", HASH[state.screen] || "#/");
warmVoices();
whenVoicesReady().then(() => updateSpeakButtons());
render();

const enableTestHooks = import.meta.env.DEV || import.meta.env.VITE_E2E === "1" || new URLSearchParams(location.search).has("e2e");
if (enableTestHooks) {
  window.__WW = {
    getState: () => state,
    save: () => saveState(state),
    render,
    show,
    startPractice: () => { startPractice(state); show("practice"); },
    startWarmup: () => { startWarmup(state); show("practice"); },
    goNextStage: () => { goNextStage(state); show(state.screen); if (state.screen === "reward") cueRewardSfx(); },
    advanceDay: () => { advanceDay(state); show("home"); },
    completeDays(n) {
      for (let i = 1; i <= n; i += 1) {
        if (!state.completedDays.includes(i)) state.completedDays.push(i);
      }
      state.cursorDay = Math.min(n + 1, 60);
      const u = unlockedDogCount(state.completedDays.length, dogs.length);
      dogs.slice(0, u).forEach((d) => { state.album[d.slug].sit = true; });
      saveState(state);
      render();
    },
    startSeason2() {
      startSeason2(state);
      saveState(state);
      render();
    },
    completeS2Days(n) {
      if (!state.s2.started) startSeason2(state);
      for (let i = 1; i <= n; i += 1) {
        if (!state.s2.completedDays.includes(i)) state.s2.completedDays.push(i);
      }
      state.s2.cursorDay = Math.min(n + 1, S2_DAY_TOTAL);
      state.s2.unlockedChapters = Array.from(
        { length: Math.min(15, 1 + Math.floor(state.s2.completedDays.length / 4)) },
        (_, i) => `ch${String(i + 1).padStart(2, "0")}`,
      );
      state.season = "s2";
      saveState(state);
      render();
    },
    grantBones(n) {
      for (let i = 0; i < n; i += 1) {
        const d = new Date();
        d.setDate(d.getDate() - i - 1);
        const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        state.boneLedger.push({ date, amount: 1, reason: "test" });
        state.bones += 1;
      }
      saveState(state);
      render();
    },
    buyPose(slug, pose) {
      buyPose(state, slug, pose);
      saveState(state);
      render();
    },
    openAlbum(slug) {
      openAlbum(state, slug);
      show("album");
    },
    dismissPoseUnlock() {
      dismissPoseUnlock(state);
      saveState(state);
      render();
    },
    setStage(stage) {
      if (state.active) {
        state.active.stage = stage;
        refresh();
      }
    },
    openCards() { show("cards"); },
    hasCantoneseVoice,
    whenVoicesReady,
    playReading: (entry, opts) => playReading(entry, opts),
    playSfx: (name) => playSfx(name),
    setSfxEnabled: (on) => setSfxEnabled(on),
  };
}
