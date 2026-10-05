# 筆順資料：來源、授權、流程、描紅判斷

> 決定：**筆順以教育局《香港小學學習字詞表》網上版的筆順動畫為準**（即「香港小學學校建議筆順」）。筆畫幾何（畫面上的筆畫形狀）用開源資料，逐字對照教育局次序，有出入就人手修正。
> 研究日期：2026-10-05。標「待確認」的項目未能核實，需要 Janson 決定或再查。

## 1. 權威來源（香港）

| 項目 | 內容 |
|------|------|
| 《香港小學學習字詞表》網上版 | https://www.edbchinese.hk/lexlist_ch/ （英文對照版：https://www.edbchinese.hk/lexlist_en/ ） |
| 收字 | 3,171 字；**第一學習階段（小一至小三）2,169 字**，第二學習階段（小四至小六）1,002 字；9,706 詞語（[教育局資源便覽 PDF](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/resources/primary/lang/curriculum-materials/int_lexical%20list_TC_2026.pdf)） |
| 《常用字字形表》 | 2007 年重排本，4,762 字，楷書字形標準；作為字詞表附錄（[教育局教師參考資料](https://www.edb.gov.hk/tc/curriculum-development/kla/chi-edu/second-lang/l-t.html)） |
| 每字資料 | 部首、總筆畫數、粵音（香港語言學學會粵拼，另可切換黃錫凌／饒秉才）、普通話、同音字提示、詞語（每個詞標示第一或第二學習階段） |
| 筆順呈現 | 每字一個 **HTML5 canvas 動畫**（Adobe Animate CC 匯出、CreateJS 播放），逐筆生長，左上角顯示筆畫序號；網址形如 `/EmbziciwebRes/stkdemo_js/1001-2000/1088.html`（「山」）。不是靜態筆順表 |
| 可否下載 | **沒有官方下載／機器可讀資料集**。動畫 JS 內的筆畫向量和次序技術上可解析（本研究就是這樣做對照），但不等於獲授權使用 |
| 使用要則 | 網站寫明：「字詞表所提供的資料，如字形、筆順等，僅屬參考性質，並非唯一的、硬性的標準。」（[使用要則](https://www.edbchinese.hk/lexlist_ch/fw_principle.html)） |
| 版權 | © 香港教育局。教育局網站版權公告：只准下載作**個人用途或非商業性質的內部用途**；複製、改編、分發或提供予公眾須事先獲教育局書面授權（[重要告示](https://www.edb.gov.hk/tc/important-notices/index.html)） |

**結論：** App 內**不可直接搬教育局的動畫、筆畫圖形或錄音**。教育局資料只用作內部「對照標準」（核對次序），App 出街的筆畫圖形用開源資料。
「只作內部對照是否完全符合版權公告」屬法律判斷，**待確認**；最穩陣做法是電郵教育局課程發展處中國語文教育組（ccdoc@edb.gov.hk，見字詞表[前言](https://www.edbchinese.hk/lexlist_ch/fw_foreword.html)）說明用途、申請書面同意。Janson 決定：**現階段不發信**；**第一期公開上架前**，須電郵教育局確認以筆順動畫作內部對照的用途。

## 2. 開源筆畫幾何比較

| 來源 | 繁體覆蓋 | 字形／筆順依據 | 授權 | 評語 |
|------|----------|----------------|------|------|
| [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data)（npm 2.0.1，9,500+ 個 JSON） | 常用繁簡約 9,000 字 | 來自 Make Me a Hanzi；字形取自文鼎 AR PL KaitiM GB／UKai；**筆順跟中國內地（PRC）**（[MMAH README](https://github.com/skishore/makemeahanzi)） | Arphic Public License（APL） | 格式最方便，直接配 hanzi-writer；但部分字次序或筆畫數跟香港不同 |
| [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) | 同上 | PRC 筆順 | 圖形 APL；程式 LGPL | hanzi-writer-data 的上游 |
| [AnimCJK](https://github.com/parsimonhi/animCJK) `svgsZhHant` | **只有 1,013 字**（HSK 1–3 繁體等） | 以 MMAH 為底大量改動，繁體按台灣等字形（README 參考台灣教育部及香港教育局網站） | 漢字 SVG：APL；其餘：LGPL | 「艹」等部件較接近港台寫法，但字數太少，只宜作補丁來源 |
| 香港專用開源筆順幾何 | **找不到** | — | — | 搜尋未見公開、授權清晰的香港筆順幾何資料集（待確認：日後可再搜） |

hanzi-writer 程式本身是 MIT 授權（[README](https://github.com/chanind/hanzi-writer)），現時 npm 版本 3.7.3。

### APL 對我們的要求
- 可修改（重排筆畫、改字形、轉格式都可以）。
- 修改過的檔案要寫明**何時、點樣改**；修改後的資料要以 APL **公開提供**（本 repo 公開，放 `data/strokes/` 並附 `ARPHICPL.TXT` 即可）。
- App 程式碼與資料是分開檔案，一般理解程式不受 APL 影響（法律意見**待確認**）。

## 3. 實測：開源資料 vs 教育局次序

方法（腳本在工作機 `/workspace/research/compare.py`，**未放入 repo**）：解析 104 個字的教育局動畫，取每一筆出現的先後、起點及中心；與 hanzi-writer-data 及 AnimCJK 的筆畫中線（medians）配對（中心點最近配對），檢查：筆畫數、次序、大致方向。教育局動畫筆畫數與網頁所列總筆畫數 104 字全部一致。

| 組別 | 字數 | hanzi-writer-data 有問題 | AnimCJK 有問題 |
|------|------|--------------------------|----------------|
| 簡單字（1–8 畫，第一期候選） | 73 | **3**：母（第 4、5 筆次序對調）、出（次序不同）、又（方向疑似，可能誤報） | 1（又）；另 9 字 AnimCJK 未收 |
| 較難字（馬、魚、學、花、草、風、飛、貓等） | 31 | **12**：馬 魚 學 的 來 花 草 雨 風 雲 飛 貓 | 11 |

重點：
- **花、草**：hanzi-writer-data 分別 7、9 畫（內地「艹」3 畫），教育局 8、10 畫（香港「艹」4 畫）——是字形差異，不只是次序。所有艹部字都要處理。
- 雨、雲、風的「方向疑似」多數是短點畫的誤報，仍要人眼確認。
- 局限：配對只用中心點，**不能偵測**筆畫數相同但字形細節不同（例如部件寫法）；也可能誤報。所以結果只是「篩選」，最終要人手看。

**估計：** 第一期 30 個簡單字，自動比對約 **1–2 字**要修（實際：第一期 30 字中只有「出」需重排，見 [CHARACTERS_PHASE1.md](./CHARACTERS_PHASE1.md)）；擴展到 8 畫以上、含艹／馬／魚等部件的字，**約 3–4 成**要修。

## 4. 建議流程（pipeline）

1. **取字表**：由 `CHARACTERS_PHASE1.md` 讀入要做的字。
2. **取幾何**：hanzi-writer-data 的 `{字}.json`（strokes + medians）。若筆畫數與教育局不符而 AnimCJK `svgsZhHant` 有該字且筆畫數相符，改用 AnimCJK（格式相同，見其 `graphicsZhHant.txt`）。
3. **自動對照**：對照教育局動畫的次序（只在開發機內部執行，不把教育局檔案入 repo，不在 App 載入教育局網址）。輸出 `OK / ORDER / COUNT / DIR?`。
4. **修正**：
   - `ORDER`：重排 `strokes` 與 `medians` 陣列（簡單，可腳本化）。
   - `DIR?`：反轉該筆 medians 次序。
   - `COUNT`／字形不同：用 AnimCJK 或人手在向量工具內拆／合筆畫，再重算 medians。
5. **人手驗收（必做，每字）**：並排播放「我們的動畫」與教育局網上動畫，逐筆核對次序、方向、筆形，記錄驗收人與日期。
6. **存檔**：`data/strokes/{Unicode}.json`，加欄位 `source`（hwd / animcjk / manual）、`modified`（改動說明，符合 APL）、`verifiedAgainstEdb`（日期）。repo 附 `ARPHICPL.TXT`。
7. **回歸測試**：CI 檢查每字筆畫數 = 字表記錄的教育局筆畫數。

## 5. 描紅判斷（逐筆）

用 hanzi-writer 的 quiz 模式（已內建逐筆比對：筆畫起點／終點、方向、形狀與長度要接近中線，並且必須按次序）。建議設定（預設值見 [defaultOptions.ts](https://github.com/chanind/hanzi-writer/blob/master/src/defaultOptions.ts)）：

| 階段 | 設定 | 說明 |
|------|------|------|
| 有提示描紅 | `showOutline: true`、`leniency: 1.3`（較寬鬆）、`showHintAfterMisses: 1` | 底字淡色；錯一次就閃出該筆提示 |
| 少提示描紅 | `showOutline: true`（更淡）、`leniency: 1.0`、`showHintAfterMisses: 2` | |
| 自己寫 | `showOutline: false`、`leniency: 1.0`、`showHintAfterMisses: 3`、`markStrokeCorrectAfterMisses: 3` | 錯 3 次自動幫手補上，避免卡死 |
| 全程 | `acceptBackwardsStrokes: false` | 方向是筆順教學一部分，反方向當錯（只溫和提示） |

- **次序錯**：寫了第 3 筆的位置但應寫第 2 筆 → 不畫上去，柔和提示「先寫呢一筆」並閃出正確筆畫起點。
- **方向錯**：提示起筆點（小圓點）＋箭頭。
- 不扣分、無生命值；完成度只記錄「提示次數」，用作家長報告（文案待定）。
- 筆鋒（頓筆、鉤）**不判斷**，只判斷軌跡；小一小朋友用手指在平板寫，太嚴會挫敗。

## 6. 楷書字型

| 字型 | 字形 | 授權 | 建議 |
|------|------|------|------|
| **自由香港楷書 Free HK Kai**（4700 字版 V1.02，2017-01-13） | 根據教育局《常用字字形表（2007 年重排本）》修改，底稿為台灣全字庫正楷體 | **CC BY 4.0**（[下載頁](https://freehkfonts.opensource.hk/download/)） | **建議採用**：字卡、今日列表、詞語顯示 |
| 霞鶩文楷 TC 等其他開源楷書 | 未核實是否跟香港字形 | — | 待確認，不建議作標準字 |
| 台灣教育部標準楷書 | 台灣字形 | 授權條款待確認 | 字形非香港標準，不用 |

取捨：**描紅區的淡色底字必須由筆畫資料本身畫出**（與可描的筆畫完全重疊），不用字型；字型只用於非描紅位置。CC BY 4.0 要在 App「關於」頁署名「自由香港楷書（自由香港字型）」。只收 4,700 字已覆蓋整個小學字表。網頁用時建議按字表做子集（subset）減少檔案大小。
