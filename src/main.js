import { playReading, stopAudio, warmVoices } from "./audio.js";
import { destroyPractice, mountPractice } from "./practice.js";
import "./styles.css";
import {
  advanceDay,
  beginReview,
  currentEntry,
  dismissReward,
  ensureHints,
  leavePractice,
  loadState,
  markDogsSeen,
  noteFreeFinished,
  pickCompanion,
  retryStage,
  saveState,
  startPractice,
  goNextStage,
} from "./state.js";
import { dogBySlug } from "./dogs.js";
import { renderMain, renderTabs } from "./ui.js";

const state = loadState();
let toastTimer = 0;
let renderLock = 0;

const HASH = {
  home: "#/",
  dogs: "#/dogs",
  about: "#/about",
  practice: "#/write",
  reward: "#/reward",
};

function screenFromHash() {
  const hash = location.hash || "#/";
  if (hash.startsWith("#/dogs")) return "dogs";
  if (hash.startsWith("#/about")) return "about";
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
  else if (wanted === "dogs" || wanted === "about" || wanted === "home") state.screen = wanted;
}

function render() {
  const pass = ++renderLock;
  stopAudio();
  destroyPractice();
  document.body.dataset.mode = state.screen === "practice" || state.screen === "reward" ? "focus" : "tabs";
  document.getElementById("main").innerHTML = renderMain(state);
  document.getElementById("tabs").innerHTML = renderTabs(state);
  document.title = state.screen === "dogs" ? "狗狗圖鑑 · 汪汪中文" : state.screen === "about" ? "關於 · 汪汪中文" : "汪汪中文";
  if (state.screen === "dogs") {
    const before = (state.seenDogs || []).join(",");
    markDogsSeen(state);
    if ((state.seenDogs || []).join(",") !== before) saveState(state);
  }
  const entry = currentEntry(state);
  if (state.screen === "practice" && state.active && entry) {
    const stage = state.active.stage;
    if (stage === "listen") {
      playReading(entry).then((result) => {
        if (pass !== renderLock || state.active?.stage !== "listen") return;
        if (result.char === "none") {
          const hint = document.getElementById("hint");
          if (hint) {
            hint.textContent = "未有粵語聲音，請睇住粵拼。";
            hint.classList.add("is-warn");
          }
        }
      });
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

function onClick(event) {
  const button = event.target.closest("[data-act]");
  if (!button || button.disabled) return;
  const act = button.dataset.act;
  if (act === "tab") {
    if (state.screen === "practice") leavePractice(state);
    if (state.screen === "reward") dismissReward(state);
    show(button.dataset.tab || "home");
    return;
  }
  if (act === "start") {
    startPractice(state);
    show("practice");
    return;
  }
  if (act === "tile") {
    const status = button.dataset.status;
    if (status === "done") {
      beginReview(state, button.dataset.char);
      show("practice");
    } else if (status === "now" || status === "next") {
      startPractice(state);
      show("practice");
    } else {
      toast("先寫前面個字。");
    }
    return;
  }
  if (act === "review") {
    beginReview(state, button.dataset.char);
    show("practice");
    return;
  }
  if (act === "back") {
    leavePractice(state);
    show("home");
    return;
  }
  if (act === "next") {
    button.disabled = true;
    goNextStage(state);
    show(state.screen);
    return;
  }
  if (act === "retry") {
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
  if (act === "reward") {
    if (state.pendingReward) show("reward");
    return;
  }
  if (act === "pick-dog") {
    if (pickCompanion(state, button.dataset.slug)) {
      refresh();
      toast(`${dogBySlug(state.companion).name}會陪你寫字。`);
    }
    return;
  }
  if (act === "locked-dog") {
    toast("未解鎖。每寫完 2 日就識多一隻朋友。");
  }
}

document.body.addEventListener("click", onClick);
window.addEventListener("popstate", () => {
  const wanted = screenFromHash();
  if (state.screen === "practice" && wanted !== "practice") leavePractice(state);
  if (wanted === "practice" && state.active) state.screen = "practice";
  else if (wanted === "reward" && state.pendingReward) state.screen = "reward";
  else state.screen = wanted === "practice" || wanted === "reward" ? "home" : wanted;
  saveState(state);
  render();
});

applyStoredScreenFromHash();
if (!location.hash) history.replaceState({ screen: state.screen }, "", HASH[state.screen] || "#/");
warmVoices();
render();
