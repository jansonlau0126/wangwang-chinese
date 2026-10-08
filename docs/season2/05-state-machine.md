# Season 2 進度狀態機設計

> 狀態：**設計稿**（2026-10-08）  
> 對齊：`src/state.js` v3、D1／D5／D9／D10、`04-map-and-stages.md`。

目標：在**盡量少改 S1 行為**前提下，加入第二季進度、章節解鎖、分享卡觸發。

---

## 1. 核心原則

| 原則 | 說明 |
|------|------|
| S1 不動 | 現有 `completedDays`／`cursorDay`／解鎖狗／骨頭邏輯繼續只服務 S1 |
| 平行進度 | S2 用獨立欄位，唔覆寫 S1 |
| 閘門 | 完成 S1 先可以**寫** S2；未完成可**預覽**故事（D10） |
| 唔加新狗 | 解鎖＝章節／故事／探險相，唔係第 16 隻狗（D1） |
| 骨頭不變 | 每日 cap 2 維持；S2 課堂同 S1 一樣可攞 lesson／zero（D2） |

---

## 2. 狀態欄位（建議）

喺現有 `defaultState()` 加（version bump → **4**）：

```js
{
  // —— 現有 S1（保留）——
  version: 4,
  completedDays: [],      // S1 1–60
  cursorDay: 1,           // S1
  // ... album, bones, companion 等不變

  // —— S2 新增 ——
  season: "s1",           // "s1" | "s2"  目前操作緊邊季
  s2: {
    completedDays: [],    // S2 1–60
    cursorDay: 1,
    started: false,       // 用戶有冇按過「開始第二季」
    unlockedChapters: [], // e.g. ["ch01"] 已解鎖章節 ID
    streak: 0,            // 連寫日數（只獎唔罰）
    lastLessonDate: null, // YYYY-MM-DD，計連寫用
  },
}
```

**遷移（normalize）**
- `version < 4` → 補 `season: "s1"`、`s2: { completedDays:[], cursorDay:1, started:false, unlockedChapters:[], streak:0, lastLessonDate:null }`
- 唔刪 S1 資料

---

## 3. 派生狀態（純函數）

```text
s1Complete(state)     = state.completedDays.length >= 60
s2Unlocked(state)     = s1Complete(state)          // 可開始寫
s2PreviewOk(state)    = true                       // 永遠可預覽故事文案
canStartS2(state)     = s1Complete && !state.s2.started
s2InProgress(state)   = state.s2.started && state.s2.completedDays.length < 60
s2Complete(state)     = state.s2.completedDays.length >= 60

// 當前操作季嘅「今日」
activeCompleted(state) = state.season === "s2" ? state.s2.completedDays : state.completedDays
activeCursor(state)    = state.season === "s2" ? state.s2.cursorDay : state.cursorDay
activeDayTotal         = 60
```

**章節解鎖**（對齊 `04-map-and-stages.md`）

| 完成 S2 日數 ≥ | 解鎖章節 |
|----------------|----------|
| 0（開始 S2） | ch01 |
| 4 | ch02 |
| 8 | ch03 |
| 12 | ch04 |
| … 每 +4 | … |
| 56 | ch15 |

```js
function chapterIdForDay(day) {
  // day 1–4 → ch01, 5–8 → ch02, …
  const n = Math.ceil(day / 4);
  return `ch${String(n).padStart(2, "0")}`;
}

function chaptersUnlockedByProgress(completedCount) {
  // 開始時至少 ch01；每完成 4 日多一章
  const n = Math.min(15, 1 + Math.floor(completedCount / 4));
  return Array.from({ length: n }, (_, i) =>
    `ch${String(i + 1).padStart(2, "0")}`
  );
}
```

大階段完成：S2 完成日數達 12／24／36／48／60 時觸發階段卡。

---

## 4. 狀態轉移

### 4.1 首頁閘門

```text
[S1 未完成]
  home → 「繼續第一季」
  可入地圖預覽 S2 故事（唯讀）
  「開始第二季」按鈕 disabled 或顯示「完成第一季先」

[S1 完成、S2 未開始]
  home 主 CTA：「開始第二季探險」
  → startSeason2(state)

[S2 進行中]
  home 主 CTA：「繼續探險 · 第 {cursor} 日」
  可切回 S1 溫習（season = "s1" 只讀／溫習，唔改 S1 cursor 除非未完）

[S2 完成]
  home：「第二季完成 · 溫習生字／換相」
```

### 4.2 `startSeason2(state)`

```text
pre:  s1Complete && !s2.started
post: s2.started = true
      season = "s2"
      s2.cursorDay = 1
      s2.unlockedChapters = ["ch01"]
      screen = "home" 或 "map"
```

### 4.3 課堂（S2）

複用現有 practice pipeline，但讀寫 S2 字表同 `s2.*`：

```text
startPracticeS2
  pre:  season==="s2" && s2.started && !s2 day done && !s2Complete
  → active = { season:"s2", day: s2.cursorDay, index:0, stage:"listen", ... }

completeDayS2（三字寫完）
  → push s2.completedDays
  → grantBone lesson / zero（同 S1 cap）
  → 更新 unlockedChapters = chaptersUnlockedByProgress(...)
  → 更新 streak（見下）
  → pendingReward = { kind:"lesson", season:"s2", day, chars, chapter?, stage?, streak? }
  → screen = "reward"

advanceDayS2
  → s2.cursorDay += 1（上限 60）
```

**唔解鎖新狗**；`newDog` 喺 S2 reward 永遠 `null`。可選：解鎖該章節狗嘅探險相 flag（D3／D11，後做）。

### 4.4 連寫（D5）

```text
on completeDayS2 (firstTime):
  today = todayKey()
  if lastLessonDate === yesterday → streak += 1
  else if lastLessonDate === today → 唔變
  else streak = 1
  lastLessonDate = today

  if streak ∈ {3, 7, 14, 30}:
    pendingReward.streakMilestone = streak
    // 只顯示貼紙／文案，唔扣骨、唔鎖內容
斷簽：唔重置已解鎖章節；streak 歸 0 即可
```

### 4.5 分享卡觸發點

| 事件 | 卡類型 |
|------|--------|
| completeDayS2 | 每日完成卡 |
| 完成日數 % 5 === 0 | 每週卡（可選，同 reward 一齊或之後） |
| 新章節剛進 unlockedChapters | 章節卡 |
| 完成日數 ∈ {12,24,36,48} | 大階段卡 |
| streak milestone | 連寫卡 |
| s2Complete | 完季卡 |

Reward 畫面可「分享」→ 用 `03-share-cards.md` 模板填變數 → DOM／canvas 出圖（D7）。

---

## 5. 同現有 API 對照

| 現有（S1） | S2 對應 |
|------------|--------|
| `completedDays` / `cursorDay` | `s2.completedDays` / `s2.cursorDay` |
| `seasonComplete()` | `s2Complete()` + 保留 `seasonComplete()` 指 S1 |
| `isDayDone(state, day)` | `isDayDone(state, day, season?)` |
| `startPractice` | 按 `state.season` 分支或 `startPracticeS2` |
| `completeDay` → `newDog` | S2 唔發 `newDog` |
| `unlockedCount`（狗） | **唔變**（只睇 S1 completedDays） |
| `advanceDay` | `advanceDayS2` |

**字表**
- S1：`data/characters.json`（現有）
- S2：建議 `data/characters-s2.json`（結構同 S1：day, char, jyutping, exampleWord, strokes…）
- `chars.js` 加 `season` 參數或 `s2Characters` 模組

---

## 6. UI 畫面影響

| 畫面 | 改動 |
|------|------|
| home | S1 完成後 CTA；進行中顯示 S2 日數；可切「溫習第一季」 |
| map | S2 五大站 + 15 路標；狀態文案見 `04-map-and-stages.md` |
| practice | 字來源按 season；流程同 S1 |
| reward | 文案用 S2 模板；分享按鈕；無「新狗」 |
| cards | 可分 S1／S2 tab 或完成後先顯示當前 season |
| dogs／album | 狗解鎖仍只跟 S1；探險相格後加 |

---

## 7. 實作步驟建議

1. **資料**  
   - `characters-s2.json`（由草稿表轉；EDB 核完先標 `verifiedAgainstEdb`）  
   - `data/chapters-s2.json`（15 章：id、name、dayStart、dayEnd、dogSlug、blurb）

2. **state.js**  
   - version 4 遷移  
   - `startSeason2`／`s1Complete`／`s2Complete`／章節派生  
   - `completeDay` 分支或抽 `completeDayForSeason`

3. **ui.js**  
   - home 閘門 + map 路標  
   - reward 分享入口（可先 share text，後 canvas）

4. **測試**  
   - `scripts/check.mjs`：S2 180 字、60 日×3、唔同 S1 重複  
   - 手動：S1 未完唔可寫 S2；完成後可開始；每 4 日解鎖章節；60 日完季

---

## 8. 非目標（本階段不做）

- 家庭／家長模式  
- 新狗、改骨頭 cap  
- 探險相經濟重算（可另開 task 跑 `sim-unlock.mjs`）  
- 雲端同步

---

## 9. 待你拍板（細項）

| # | 問題 | 建議預設 |
|---|------|----------|
| S1 | S2 進行中可唔可以改 S1 `cursorDay`？ | 唔可以；S1 只溫習 |
| S2 | `season` 切換入口放邊？ | home 次要按鈕「溫習第一季／返第二季」 |
| S3 | 章節係完成第 4／8／… 日當刻解鎖，定進入該日就解鎖？ | **完成** 第 4 日後解鎖 ch02（開始時已有 ch01） |

確認設計後，下一步可落 `characters-s2.json` 骨架 + state 遷移 patch。
