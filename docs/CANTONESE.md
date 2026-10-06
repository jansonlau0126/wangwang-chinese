# 粵音：資料來源、多音字、讀音音效

> 研究日期：2026-10-05。「待確認」= 未能核實，需 Janson 決定或再查。

## 1. 粵拼資料來源

| 項目 | 內容 |
|------|------|
| 採用 | **rime-cantonese**（粵語計算語言學基礎建設組 CanCLID 維護）字表 `jyut6ping3.chars.dict.yaml`：https://github.com/rime/rime-cantonese |
| 授權（已核實 README） | 主體：**CC BY 4.0**；`jyut6ping3.maps`：ODbL 1.0。我哋只用字表（CC BY 4.0）→ 第一季粵拼以教育局為準（內部整理）；rime 只作交叉核對，About 頁唔再署名 rime |
| 拼音方案 | 香港語言學學會粵拼（LSHK Jyutping），同教育局《香港小學學習字詞表》預設顯示嘅粵拼一致（字詞表查詢參數 `jpC=lshk`） |
| 格式 | 每行「字 ⇥ 粵拼 ⇥ 使用比例」，例如 `行 haang4 5%`；多音字有多行，比例低者（如 `0%`、`3%`）屬少用讀音 |
| 核對標準 | 每個入選字的讀音再對照教育局字詞表網上版（https://www.edbchinese.hk/lexlist_ch/ ）所列粵音及詞語粵拼；兩者不同時以教育局為準 |

第一期 30 字已逐字對照：rime 主讀音與教育局粵音全部一致（見 [CHARACTERS_PHASE1.md](./CHARACTERS_PHASE1.md)）。

### 其他來源（只作參考）
| 來源 | 已核實事實 | 未核實 |
|------|-----------|--------|
| 教育局字詞表 | 每字有粵音（LSHK 粵拼，可切換黃錫凌／饒秉才）、詞語粵拼及錄音 | 版權只准個人／非商業內部用途（見 [STROKE_ORDER.md](./STROKE_ORDER.md) §1），**不可直接搬入 App** |
| 香港語言學學會（LSHK） | 粵拼方案制定者 | 有冇可下載字表及授權：待確認 |
| 中大《漢語多功能字庫》 | — | 收字、授權、可否下載：**全部待確認**（本次未查證） |

## 2. 多音字處理（小朋友版）

原則：**每字只教一個常用讀音 + 一個例詞**，例詞要用嗰個讀音。
1. 讀音取教育局字詞表首列粵音；同時檢查 rime 字表該讀音不是低比例讀音。
2. 例詞從教育局字詞表**第一學習階段（ks1）**詞語揀，生活化、兩字為主，並用該詞的教育局粵拼核對。
3. 其他讀音暫不顯示（資料保留欄位 `otherReadings`，供日後高年級／家長模式）。
4. 讀聲調易混（如 上 soeng5/soeng6、下 haa5/haa6）：例詞決定讀音，例如「上面 soeng6 min6」（第一期已由「上山」改為「上面」，單字同例詞同讀 soeng6）、「下巴 haa6 baa1」。資料內以「例詞粵拼」為準，避免單字讀音同例詞矛盾。

資料欄位建議：`{ char, jyutping, exampleWord, exampleJyutping, otherReadings[] }`。

## 3. 讀音音效方案

| 方案 | 優點 | 缺點 | 建議 |
|------|------|------|------|
| **A. 預先生成 TTS，存成靜態音檔**（如 Azure zh-HK 神經語音，每字＋例詞各一個 mp3/ogg，放 CDN） | 聲音一致、離線可用、可逐個人手試聽修正；用 SSML 控制讀音 | 要一次性生成及人手驗收；多音字可能讀錯要改 | **建議採用** |
| B. 瀏覽器 `speechSynthesis` | 免費、零檔案 | 每部機有冇粵語聲音唔一定（iPad／Android／Chromebook 不同）、多音字讀錯無法控制、音質不一 | 只作後備 |
| C. 真人錄音 | 最自然、最準 | 要搵人、錄音室、時間成本高；加字慢 | 長遠可考慮（例如只錄例詞） |

### 方案 A 細節
- 聲音：Azure zh-HK 預設神經語音（例如 HiuMaanNeural／WanLungNeural／HiuGaaiNeural，**現時可用名單待確認**，見 [語言支援](https://learn.microsoft.com/azure/ai-services/speech-service/language-support)）。
- 單字容易讀錯聲調 → 生成時用例詞或 SSML 控制；zh-HK 是否支援以粵拼指定讀音（`<phoneme>`）：**待確認**，否則人手聽，錯就改用例詞內截取或錄音。
- 每個檔案人手驗收（同筆順一樣記錄驗收人、日期）。
- 檔名：`assets/audio/U+XXXX.mp3`、`assets/audio/U+XXXX_word.mp3`；清單 `data/audio-manifest.json`。生成腳本：`npm run audio`（Azure zh-HK-HiuGaaiNeural）。人形錄音可之後用同檔名覆蓋。
- 合成語音再分發的條款：**待確認，阻擋音檔製作**——生成任何音檔前，必須先核對 Azure 服務條款中把合成語音放入 App 再分發（離線打包／CDN 派發）的條款。

### 成本
- Azure 官方價格頁（https://azure.microsoft.com/en-us/pricing/details/speech/ ）列明：**免費層（F0）神經語音每月 50 萬字元**（已核實）。
- 付費（S0）每百萬字元價錢：官方頁面未能顯示數字；第三方資料稱 US$16／百萬字元 → **待確認**。
- 估算：3,171 字 × (單字＋例詞約 3 字＋SSML 標記) 遠低於每月 50 萬字元（SSML 標記會計入字元數，以官方定義為準），預計**免費層已足夠**，實際成本 ≈ 0（待確認）。
