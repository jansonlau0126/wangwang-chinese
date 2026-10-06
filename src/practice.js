import HanziWriter from "hanzi-writer";
import { DRAWING_WIDTH, WRITER_PAD_RATIO, medianToPixel } from "./geometry.js";
import { mediansFor, strokeData } from "./strokes.js";

const INK = "#1B2533";
const HINT = "#E8A23A";
const SUCCESS = "#2E7D52";
const MODEL = "#CBD5DF";
const SVG_NS = "http://www.w3.org/2000/svg";

const STAGE_QUIZ = {
  guided: { showOutline: true, outlineColor: MODEL, leniency: 1.3, showHintAfterMisses: 1, markStrokeCorrectAfterMisses: false, guides: "arrow" },
  light: { showOutline: true, outlineColor: "rgba(203, 213, 223, 0.4)", leniency: 1, showHintAfterMisses: 2, markStrokeCorrectAfterMisses: false, guides: "none" },
  free: { showOutline: false, outlineColor: MODEL, leniency: 1, showHintAfterMisses: 3, markStrokeCorrectAfterMisses: 3, guides: "none" },
};

let writer = null;
let resizeObserver = null;
let animToken = 0;
let coachTimer = 0;
let size = 0;
let padding = 0;
let strokeIndex = 0;
let hinting = false;

function $(id) {
  return document.getElementById(id);
}

function setHint(text, kind) {
  const hint = $("hint");
  if (!hint) return;
  hint.textContent = text;
  hint.classList.toggle("is-warn", kind === "warn");
  hint.classList.toggle("is-ok", kind === "ok");
}

function setStrokeLabel(index, total) {
  const label = $("stroke-label");
  if (label) label.textContent = `第 ${index + 1} 筆，共 ${total} 筆`;
}

function enableNext() {
  const button = $("next");
  if (!button) return;
  button.disabled = false;
  button.dataset.ready = "1";
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function guideSvg() {
  return $("guides");
}

function clearGuides() {
  const svg = guideSvg();
  if (svg) svg.replaceChildren();
}

function drawGuides(medians, index, withArrow) {
  const svg = guideSvg();
  if (!svg || !size) return;
  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  const median = medians[index];
  if (!median || median.length < 1) return;
  const points = median.map((point) => medianToPixel(point, size, padding));
  const start = points[0];
  const radius = Math.max(11, size * 0.034);
  const dot = document.createElementNS(SVG_NS, "circle");
  dot.setAttribute("cx", start.x);
  dot.setAttribute("cy", start.y);
  dot.setAttribute("r", radius);
  dot.setAttribute("fill", HINT);
  dot.setAttribute("stroke", "#FFFFFF");
  dot.setAttribute("stroke-width", "3");
  if (hinting) dot.setAttribute("class", "pulse");
  svg.appendChild(dot);
  if (!withArrow || points.length < 2) return;

  let walked = 0;
  const reach = Math.max(36, size * 0.14);
  let tip = points[1];
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const len = Math.hypot(dx, dy) || 1;
    if (walked + len >= reach) {
      const t = (reach - walked) / len;
      tip = { x: points[i - 1].x + dx * t, y: points[i - 1].y + dy * t };
      break;
    }
    walked += len;
    tip = points[i];
  }
  const line = document.createElementNS(SVG_NS, "line");
  line.setAttribute("x1", start.x);
  line.setAttribute("y1", start.y);
  line.setAttribute("x2", tip.x);
  line.setAttribute("y2", tip.y);
  line.setAttribute("stroke", HINT);
  line.setAttribute("stroke-width", Math.max(4, size * 0.012));
  line.setAttribute("stroke-linecap", "round");
  svg.appendChild(line);
  const angle = Math.atan2(tip.y - start.y, tip.x - start.x);
  const head = Math.max(12, size * 0.035);
  const wing = 2.4;
  const polygon = document.createElementNS(SVG_NS, "polygon");
  const p1 = [tip.x, tip.y];
  const p2 = [tip.x + Math.cos(angle + wing) * head, tip.y + Math.sin(angle + wing) * head];
  const p3 = [tip.x + Math.cos(angle - wing) * head, tip.y + Math.sin(angle - wing) * head];
  polygon.setAttribute("points", `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`);
  polygon.setAttribute("fill", HINT);
  svg.appendChild(polygon);
}

function flashMedian(median) {
  const svg = guideSvg();
  if (!svg || !median || !size) return;
  const points = median.map((point) => medianToPixel(point, size, padding));
  const path = document.createElementNS(SVG_NS, "polyline");
  path.setAttribute("points", points.map((point) => `${point.x},${point.y}`).join(" "));
  path.setAttribute("class", "flash-stroke");
  path.setAttribute("stroke-width", Math.max(18, size * 0.06));
  svg.appendChild(path);
  window.setTimeout(() => path.remove(), 600);
}

function coaching(stage, index, total) {
  const place = `第 ${index + 1} 筆，共 ${total} 筆`;
  if (stage === "guided") return `${place}。跟住圓點同箭嘴。`;
  if (stage === "light") return `${place}。慢慢自己寫。`;
  return `${place}。`;
}

export function destroyPractice() {
  animToken += 1;
  window.clearTimeout(coachTimer);
  resizeObserver?.disconnect();
  resizeObserver = null;
  try {
    writer?.cancelQuiz();
  } catch {
    /* writer may already be gone */
  }
  writer = null;
  const host = $("writer");
  if (host) host.replaceChildren();
  clearGuides();
}

function writerOptions(stage, slow, box) {
  const quiz = STAGE_QUIZ[stage];
  const showOutline = Boolean(quiz?.showOutline);
  return {
    width: box,
    height: box,
    padding: Math.round(box * WRITER_PAD_RATIO),
    showOutline,
    showCharacter: false,
    strokeColor: INK,
    radicalColor: null,
    outlineColor: quiz?.outlineColor || MODEL,
    drawingColor: INK,
    highlightColor: HINT,
    highlightCompleteColor: SUCCESS,
    strokeAnimationSpeed: slow ? 0.4 : 0.85,
    delayBetweenStrokes: slow ? 800 : 280,
    strokeHighlightSpeed: 0.65,
    strokeFadeDuration: 180,
    drawingWidth: DRAWING_WIDTH,
    drawingFadeDuration: 220,
    charDataLoader(char, onLoad, onError) {
      try {
        onLoad(strokeData(char));
      } catch (error) {
        if (onError) onError(error);
      }
    },
  };
}

export function mountPractice({ entry, stage, slow, onMiss, onDone }, attempt = 0) {
  destroyPractice();
  const host = $("writer");
  if (!host || !entry) return;
  const box = host.clientWidth;
  if (!box) {
    if (attempt < 40) {
      requestAnimationFrame(() => mountPractice({ entry, stage, slow, onMiss, onDone }, attempt + 1));
    }
    return;
  }
  size = box;
  padding = Math.round(box * WRITER_PAD_RATIO);
  strokeIndex = 0;
  hinting = false;
  const medians = mediansFor(entry.char);
  writer = HanziWriter.create(host, entry.char, writerOptions(stage, slow, box));
  resizeObserver = new ResizeObserver(() => {
    const next = host.clientWidth;
    if (!writer || !next || next === size) return;
    size = next;
    padding = Math.round(next * WRITER_PAD_RATIO);
    writer.updateDimensions({ width: next, height: next, padding });
    if (stage !== "watch") {
      const quiz = STAGE_QUIZ[stage];
      drawGuides(medians, strokeIndex, quiz?.guides === "arrow" || hinting);
    }
  });
  resizeObserver.observe(host);

  if (stage === "watch") {
    runWatch(writer, medians.length, onDone);
    return;
  }

  const quiz = STAGE_QUIZ[stage];
  if (!quiz) return;
  setStrokeLabel(0, medians.length);
  setHint(coaching(stage, 0, medians.length), "");
  if (quiz.guides === "arrow") drawGuides(medians, 0, true);
  writer.quiz({
    leniency: quiz.leniency,
    showHintAfterMisses: quiz.showHintAfterMisses,
    acceptBackwardsStrokes: false,
    markStrokeCorrectAfterMisses: quiz.markStrokeCorrectAfterMisses,
    highlightOnComplete: true,
    onMistake(data) {
      hinting = true;
      const backwards = Boolean(data.isBackwards);
      setHint(backwards ? "呢一筆方向反咗，由圓點開始。" : "先寫呢一筆。", "warn");
      drawGuides(medians, data.strokeNum, true);
      onMiss?.({ stage, backwards, strokeNum: data.strokeNum });
    },
    onCorrectStroke(data) {
      window.clearTimeout(coachTimer);
      hinting = false;
      flashMedian(medians[data.strokeNum]);
      strokeIndex = data.strokeNum + 1;
      if (strokeIndex < medians.length) {
        setHint("呢一筆寫好喇。", "ok");
        setStrokeLabel(strokeIndex, medians.length);
        drawGuides(medians, strokeIndex, quiz.guides === "arrow");
        coachTimer = window.setTimeout(() => {
          if (strokeIndex < medians.length) setHint(coaching(stage, strokeIndex, medians.length), "");
        }, 520);
      }
    },
    onComplete() {
      window.clearTimeout(coachTimer);
      hinting = false;
      clearGuides();
      setHint("寫好喇。", "ok");
      enableNext();
      onDone?.();
    },
  });
}

async function runWatch(active, total, onDone) {
  const token = ++animToken;
  if (reducedMotion()) {
    await active.showCharacter();
    if (token !== animToken) return;
    setStrokeLabel(total - 1, total);
    setHint("筆順睇完喇，可以開始描。", "ok");
    enableNext();
    return;
  }
  for (let i = 0; i < total; i += 1) {
    if (token !== animToken) return;
    setStrokeLabel(i, total);
    setHint(`睇第 ${i + 1} 筆，共 ${total} 筆。`, "");
    try {
      await active.animateStroke(i);
    } catch {
      return;
    }
  }
  if (token !== animToken) return;
  setHint("筆順睇完喇，可以開始描。", "ok");
  enableNext();
  onDone?.();
}
