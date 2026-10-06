# 汪汪中文

香港小學中文 **筆順描紅** App。狗狗陪讀，每日 3 個字。

> 同小狗一齊寫好每個字；寫完可以再描，唔催命。

## 定位

| 項目 | 內容 |
|------|------|
| 對象 | 香港小學生（優先小一至小三） |
| 主課 | 繁體字形、筆順、**描紅** |
| 每日 | **3 個中文字** |
| 第一季 | **180 字／60 日**（12 週） |
| 吉祥物 | 15 隻狗（每完成 4 日解鎖一隻） |
| 視覺 | 練習簿紙色（冷調白紙），唔用米黄 |
| 壓力 | 無愛心／無扣命；描錯可再試 |

## 每字六步

汪汪讀 → 睇汪汪寫 → 跟腳印描 → 少啲腳印 → 我自己寫 → 攞骨頭

## 相關

- 英文版（結構參考）：[lazycat-english](https://github.com/jansonlau0126/lazycat-english)
- 產品決策詳見 [`PRODUCT.md`](./PRODUCT.md)
- 設計：[`docs/DESIGN.md`](./docs/DESIGN.md)
- 第一季字表：[`docs/CHARACTERS_PHASE1.md`](./docs/CHARACTERS_PHASE1.md)
- 筆順：[`docs/STROKE_ORDER.md`](./docs/STROKE_ORDER.md)
- 粵語讀音及音檔：[`docs/CANTONESE.md`](./docs/CANTONESE.md)
- 素材：`assets/`（狗狗相片為 **AI 生成草稿**）

## 狀態

**v0.3 Season 1** — 180 字、生字卡、底部導航、音檔 scaffold。進度在 `localStorage`（`wangwang.zhongwen.v2`）。

筆順核對見 [`docs/STROKE_VERIFICATION.md`](./docs/STROKE_VERIFICATION.md)。重排字：出、母、的、來、飛。

## 本地運行

```bash
npm install
npm run dev
```

| 指令 | 作用 |
|------|------|
| `npm run build` | 檢查字表／筆順，再輸出 `dist/` |
| `npm run check` | 180 字／60 日、筆畫檔、解鎖規則 |
| `npm run strokes` | 由 hanzi-writer-data 同 overrides 重寫 `data/strokes/` |
| `npm run audio:dry` | 預覽 Azure 音檔生成（唔打 API） |
| `npm run audio` | 用 Azure Speech 生成 360 個 mp3（要 `AZURE_SPEECH_KEY`／`REGION`） |

粵語聲音：`assets/audio/U+XXXX.mp3` 同 `U+XXXX_word.mp3`（見 `data/audio-manifest.json`）；未有檔案就用瀏覽器 `zh-HK`／`yue` 語音。

## Cloudflare Pages

靜態站，hash 路由。`public/404.html` 令缺檔回 404（唔好當 SPA fallback 食咗音檔探測）。

| 項目 | 值 |
|------|-----|
| 建置指令 | `npm run build` |
| 輸出目錄 | `dist` |
| Node | 20+ |
