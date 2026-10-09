# Season 2 待決定同待做

> 對齊 Season 1 上線版。  
> **用戶拍板（2026-10-06）**：D1–D3、D5–D9 全部跟建議方案 A；**D4 家庭／家長模式＝不做**；讀音**唔用人手錄音**，改用其他方法（見 Part 2 研究／`09-sound-and-final.md`）。

---

## 已決定

### D1. Season 2 解鎖咩？ → **已決定 A（2026-10-06）**
S2 **唔加新狗**；每約 4 日解鎖「探險章節／故事」，可另解鎖現有狗嘅探險相／表情。15 狗沿用 S1 名單。

### D2. 骨頭經濟 → **已決定 A（2026-10-06）**
**維持每日 cap 2**；S2 新行為優先獎貼紙／徽章／動畫，唔靠大額骨頭。改 cap 或新貨幣要重跑 `sim-unlock.mjs`。

### D3. 換裝 → **已決定 A（2026-10-06）**
**暫緩配件換裝**；改解鎖「探險表情／姿勢相」（寫實風、同一隻狗）。

### D4. 家庭／家長模式 → **已決定：不做（2026-10-06）**
唔做邀請碼、雙裝置、家長帳號、本機家長檢視、親子卡。相關文案檔標為不做；待做清單已刪除。

### D5. 連寫 → **已決定 A（2026-10-06）**
**只獎唔罰**（貼紙／動畫）；斷簽唔扣骨、唔鎖內容。

### D6. 生字表 → **已決定 A（2026-10-06）**
全新 180 字（唔重複 S1）、P2–P3、逐字 EDB 核對後先入資料。

### D7. 分享卡美術 → **已決定 A（2026-10-06）**
現有狗相 + 公園風底板 + 程式內建出圖（DOM／canvas）做 MVP。

### D8. 聲音 → **已決定（2026-10-06）**
- **讀音：裝置 `speechSynthesis` 粵語聲 + 永遠顯示粵拼**；唔錄音、唔寄送 mp3、唔用雲 TTS。  
- **SFX：** 可用合成短音，可關。  
- 詳見 `09-sound-and-final.md`、`docs/CANTONESE.md`。

### D9. S1→S2 銜接 → **已決定 A（2026-10-06）**
S1 完成後首頁先出現「開始第二季探險」；未完成可鎖住或只預覽。

### D10. 未完成 S1 可否睇 S2 → **已決定（2026-10-06）**
可預覽故事，但要完成 S1 先可以開始寫 S2。

### D11. 探險相數量 → **已決定（2026-10-06）**
每狗加 2 張，共 30 張；相簿由 105 變 135 張。骨頭價要重跑 `sim-unlock.mjs`，目標兩季合共約兩年集齊。

### D12. 探險相來源 → **已決定（2026-10-06）**
同 S1 一樣先用 AI 草稿，標明草稿。

### D13. `images/momo-expressions` → **已決定（2026-10-06）**
併入探險相，唔另做表情。**唔另入 `assets/`**（已取消待做）。

> **狀態（2026-10-09）：B 程式批次已喺本機完成**（未 push／未 deploy）。  
> 方針：非程式 A 已齊；B.1–B.8 本機改完並通過 `npm run check`／build／煙霧 e2e。  
> 字表 `data/characters-s2.json`、64 overrides、狀態機、相簿探險相、分享卡 MVP、連寫、完季動效、SFX 已納入。

---

## A. 非程式（內容／資產）— 做晒先

### 已做 ✅

| 項目 | 備註 |
|------|------|
| 180 字草稿 v4 + EDB 全核 | OK 116／ORDER override 64／換字 20／unverifiable 0；見 `CHARACTERS_PHASE2_DRAFT.md`、`CHARACTERS_PHASE2_EDB_VERIFICATION.md` |
| 15 段故事、分享卡文案、地圖路標、狀態機設計 | `02-stories.md`、`03-share-cards.md`、`04-map-and-stages.md`、`05-state-machine.md` 等 |
| 分享卡三款視覺樣板 | `images/share-card-templates/`（每日／章節日記／完季） |
| 探險相需求表 | `EXPEDITION_PHOTOS_BRIEF.md`（`drafts-in-assets`） |
| 探險相出圖入 assets | 30×800×450 WebP → `assets/expedition/{slug}-expedition-a/b.webp`；草稿 JPG 喺 `docs/season2/images/expedition-drafts/` |
| 裝置 TTS + 粵拼 | 已上線 S1（D8） |
| 合成短 SFX 資產 | `assets/sfx/`：`complete`／`bone`／`unlock`／`streak` |
| 短音效接線（例外提早） | `src/sfx.js` 同「我」頁開關**已喺本機接好**；資產 ✅；接線已本機有，**等一次過 commit／上線** |
| `images/momo-expressions` | **唔另入 assets**（D13）；情緒併入探險相 brief → ✅／取消待做 |
| 文案跟 v4 換字同步 | `02-stories`／分享卡／地圖／brief 章節名已對齊 20 個換字 |

### 待做 ⬜（非程式）

1. ~~用戶批探險相需求表~~ → **✅ 已批**（`EXPEDITION_PHOTOS_BRIEF.md`）
2. ~~按 brief 出 30 張 AI 草稿 → WebP → `assets/expedition/`~~ → **✅ 已做**（相簿 UI／manifest 留 B 程式批次）
3. ~~故事／分享卡／地圖文案跟 v4 換字同步~~ → **✅ 已做**（`02-stories.md`／`03-share-cards.md`／`04-map-and-stages.md`／`EXPEDITION_PHOTOS_BRIEF.md` 章節名對齊；狗名「雪雪」同口頭禪「得闲又得」「呢邊」保留）
4. ~~（可選）完季短動效規格~~ → **✅ 已做**（`09-sound-and-final.md` §3：觸發／文案／視覺／分享卡／貼紙骨頭／聲／優先／資源；實作留 B.6）
5. ~~momo-expressions 入 assets~~ → **已取消**（見上 ✅）

---

## B. 程式一次過 — **本機已完成（2026-10-09）**；未 push／未 deploy

| # | 項目 | 狀態 |
|---|------|------|
| B.1 | 定稿字表 → `data/characters-s2.json` + 64 overrides（`stroke-overrides.json`）+ `verifiedAgainstEdb` | ✅ |
| B.2 | S2 狀態機（D9／D10）+ 章節解鎖（D1）；`data/chapters-s2.json` | ✅ |
| B.3 | 相簿探險相格 + manifest expedition-a/b + `sim-unlock.mjs`（135 相；約 95 週） | ✅ |
| B.4 | 分享卡 canvas MVP（`src/shareCard.js`；每日／章節／連寫／完季） | ✅ |
| B.5 | 連寫只獎唔罰（貼紙）+ streak SFX | ✅ |
| B.6 | 完季短動效（獎勵頁 CSS；毛毛 expedition-b；分享掣） | ✅ |
| B.7 | SFX（`src/sfx.js`＋「我」頁開關）納入本批 | ✅ |
| B.8 | 本機 `npm run check`／build／煙霧 e2e | ✅（未 deploy） |

**上線仍待用戶批准**：`git push`、手動 `npx wrangler@3 pages deploy dist --project-name wangwang-chinese`。

---

## 建議開工順序（2026-10-08：非程式先 → 程式一次過）

### 而家做（A · 非程式）

1. ~~用戶批／改探險相需求表~~ ✅  
2. ~~出 30 張探險相 → `assets/expedition/`~~ ✅  
3. ~~文案跟 v4 換字同步~~ ✅  
4. ~~（可選）完季動效規格~~ ✅（`09-sound-and-final.md` §3）  

### B 程式（2026-10-09 本機完成）

5. ~~字表入 `data/` + overrides~~ ✅  
6. ~~狀態機＋章節解鎖＋相簿＋分享卡＋連寫＋完季動效＋SFX~~ ✅  
7. ~~本機檢查~~ ✅ → **仍待**：用戶批准後 push／deploy  

~~舊順序（策字／EDB／需求表／SFX 資產）~~ → 見上表 A 已做 ✅。
