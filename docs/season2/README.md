# 汪汪中文 · 第二季「汪汪探險隊」規劃（已對齊 Season 1）

> 最後更新：2026-10-08  
> 狀態：**主題保留**；已對齊 S1。D1–D13 已決定；EDB 全核完成（字表 v4）；讀音＝裝置 TTS。  
> 衝突原文對照：`CONFLICTS.md`

---

## 文件目錄

| 檔案 | 內容 |
|------|------|
| [README.md](README.md) | 總覽、結構、生字原則 |
| [CONFLICTS.md](CONFLICTS.md) | 同 S1 衝突清單同處理 |
| [DECISIONS_AND_TODO.md](DECISIONS_AND_TODO.md) | 待決定（連選項）同待做 |
| [01-dog-profiles.md](01-dog-profiles.md) | 15 隻狗（**S1 名單**）探險人設 |
| [02-stories.md](02-stories.md) | 每 4 日一組故事（用人名對齊 S1） |
| [03-share-cards.md](03-share-cards.md) | 分享卡片規格（原 03） |
| [04-progress-and-challenges.md](04-progress-and-challenges.md) | 進度／挑戰文案 |
| [05-TODO.md](05-TODO.md) | 指向 DECISIONS（舊清單已淘汰） |
| [06-reward-system.md](06-reward-system.md) | 獎勵（疊喺 S1 骨頭上） |
| [07-family-mode.md](07-family-mode.md) | 家庭模式 → **不做** |
| [08-dog-outfits.md](08-dog-outfits.md) | 換裝／表情延伸（待決定） |
| [09-sound-and-final.md](09-sound-and-final.md) | 聲音同完季動畫 |
| [images/momo-expressions/](images/momo-expressions/) | 毛毛表情草稿（資料夾名歷史遺留） |
| [CHARACTERS_PHASE2_DRAFT.md](CHARACTERS_PHASE2_DRAFT.md) | S2 180 字草稿 **v4**（EDB 全核後） |
| [CHARACTERS_PHASE2_EDB_PRECHECK.md](CHARACTERS_PHASE2_EDB_PRECHECK.md) | EDB 預核（已被全核取代） |
| [CHARACTERS_PHASE2_EDB_VERIFICATION.md](CHARACTERS_PHASE2_EDB_VERIFICATION.md) | EDB 筆順全核報告（2026-10-08） |

---

## 1. 主題（保留）

**汪汪探險隊**：毛毛帶住公園認識嘅狗狗朋友，去城市、大自然、家庭同學校探險，最後返屋企分享。

對象：完成（或接近完成）Season 1 嘅 P1–P3；步驟同介面沿用 S1。

---

## 2. 必須跟 Season 1 嘅約定

| 項目 | 約定 |
|------|------|
| 每日字數 | 3 個**唔同**字 |
| 日數 | 60 日（建議維持 12 週 × 5 日） |
| 步驟名 | 汪汪讀 → 睇汪汪寫 → 跟腳印描 → 少啲腳印 → 我自己寫 → 攞骨頭 |
| 分頁 | 首頁／進度／生字卡／狗狗／我 |
| 狗 | **只有** S1 嘅 15 隻（毛毛…大王），見 `assets/manifest.json` |
| 解鎖狗 | S1 公式：每完成 4 **課堂日**多一隻；全日 56 齊人。S2 唔好再發明第 16 隻「隊隊」 |
| 骨頭 | +1 新課堂日／+1 溫習／+1 零提示；**每日最多 2**；換相 4／4／5／5／6；波波相規則不變 |
| 溫習 | S1 60 日後已有；S2 期間仍可溫習 S1＋S2 字 |
| 筆順 | 香港 EDB 建議次序；要 `verifiedAgainstEdb` |
| 粵拼 | LSHK；例詞 2 字為主 |
| 讀音檔 | 長遠 `assets/audio/U+XXXX.mp3`、`U+XXXX_word.mp3`；而家可 TTS |
| 美術 | 狗公園風；UI **jf open 粉圓**；田字格內 **Free HK Kai**；狗相寫實風草稿 |
| 存檔 | localStorage；預設無帳號 |

---

## 3. 結構建議（敘事）

| 日（S2） | 階段名 | 敘事重點 |
|----------|--------|----------|
| 1–12 | 出發準備 | 組隊、動作同心情字（**新字**，唔重複 S1） |
| 13–24 | 城市探險 | 街道、交通、禮貌 |
| 25–36 | 自然奇遇 | 天氣、山川、動植物（避開未核對風險字） |
| 37–48 | 家庭日常 | 親人、飲食、起居 |
| 49–60 | 學校同夢想 | 學習、朋友、回家分享 |

每寫完約 4 日：放出一則**短故事**（見 `02-stories.md`），主角用當造進度相關嘅 S1 狗（唔係新狗）。

---

## 4. 生字表狀態

### 4.1 原稿表（作廢）

原 README 180 格同 S1 **重複約 81 字**，並含 EDB 問題字同表內重複格（例如「謝謝」「汪汪」）。**唔好實作嗰版。**

### 4.2 收字原則（定稿前）

1. **唔重複** `data/characters.json` 入面 180 字。  
2. **唔用** S1 因 EDB 換走嘅字：高、長、遠、近、電、菜、飯、頭、鼻、身、開、床、鞋、金、黃、黑（除非重新核對通過）。  
3. 慎用研究期有 COUNT／ORDER 風險：花、草、雨、風、雲、魚、貓、馬、學… — 要核對先用。  
4. 程度：P2–P3，筆畫同詞彙難度整體高過 S1 尾段。  
5. 每日 3 字盡量主題接近；例詞 2 字、粵拼齊。

### 4.3 EDB 全核（2026-10-08）✅

草稿 v3 180 字已用同 S1 流程全數比對 EDB 筆順動畫：

| 結果 | 數 |
|------|----|
| OK | 98 → 替換後定稿 **116** |
| ORDER（需 strokeOrderOverride） | 62 → 定稿 **64**（含新換入 酒、仍） |
| COUNT／DIR（已換字） | 20 |
| Unverifiable | 0 |

詳見 [`CHARACTERS_PHASE2_EDB_VERIFICATION.md`](CHARACTERS_PHASE2_EDB_VERIFICATION.md)；定稿表 [`CHARACTERS_PHASE2_DRAFT.md`](CHARACTERS_PHASE2_DRAFT.md) **v4**。  
**尚未**寫入 `data/characters.json`（程式暫緩）。

---

## 5. 功能範圍（摘要）

| 想法 | 對齊後 |
|------|--------|
| 故事驅動 | 保留；解鎖語意改「章節／隊友故事」 |
| 分享卡 | 保留模板；用現有狗相 + 程式出圖（待決定 D7） |
| 挑戰／連寫 | 只獎唔罰（待決定 D5）；唔亂加骨頭破 cap |
| 家庭模式 | **不做**（2026-10-06） |
| 換裝 | **已決定**：探險表情／姿勢相，唔做配件換裝 |
| 讀音 | **裝置 TTS + 粵拼**（唔寄送音檔）；SFX 可用合成短音 |
| 其他 | D1–D3、D5–D9 已跟建議 A（見 DECISIONS） |

---

## 6. 下一步

1. 讀 `DECISIONS_AND_TODO.md`（多數已拍板）  
2. ~~策 S2 180 新字 + EDB 核對~~ ✅ → 批准後写入 `data/characters.json`（含 64 override）  
3. 章節故事填字、狀態機、模板分享卡  

呢個資料夾係規劃；實作前仍要以 `characters.json`／上線 App 為準。
