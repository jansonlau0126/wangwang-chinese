# 汪汪中文

香港小學中文 **筆順描紅** App。狗狗陪讀，每日 3 個字。

> 同小狗一齊寫好每個字；寫完可以再描，唔催命。

## 定位

| 項目 | 內容 |
|------|------|
| 對象 | 香港小學生（優先小一至小三） |
| 主課 | 繁體字形、筆順、**描紅** |
| 每日 | **3 個中文字** |
| 吉祥物 | 狗（數量、版面排序對齊英文 app **lazycat-english**） |
| 視覺 | 背景與風格**刻意不同**於懶貓英文 |
| 壓力 | 無愛心／無扣命；描錯可再試 |
| 評分文案 | 待定 |

## 相關

- 英文版（結構參考）：[lazycat-english](https://github.com/jansonlau0126/lazycat-english)
- 產品決策詳見 [`PRODUCT.md`](./PRODUCT.md)
- 設計：[`docs/DESIGN.md`](./docs/DESIGN.md)
- 第一期字表：[`docs/CHARACTERS_PHASE1.md`](./docs/CHARACTERS_PHASE1.md)
- 筆順：[`docs/STROKE_ORDER.md`](./docs/STROKE_ORDER.md)
- 粵語讀音及音檔：[`docs/CANTONESE.md`](./docs/CANTONESE.md)
- 素材：`assets/`（106 張 WebP + `manifest.json`）為 **AI 生成草稿**，待換真實相片

## 狀態

**v0.2 MVP** — 可以在瀏覽器完成一日 3 字（聽、看、描紅、少提示、自己寫）、獎賞同狗狗圖鑑。進度在 `localStorage`。評分文案仍待定，小朋友畫面不顯示分數。

筆順核對見 [`docs/STROKE_VERIFICATION.md`](./docs/STROKE_VERIFICATION.md)。第一期只有「出」要按香港次序重排。

## 本地運行

```bash
npm install
npm run dev
```

瀏覽器打開終端顯示的本地網址。其他指令：

| 指令 | 作用 |
|------|------|
| `npm run build` | 檢查筆順資料，再輸出靜態站到 `dist/` |
| `npm run preview` | 預覽 `dist/` |
| `npm run check` | 只檢查字表、筆畫數、「出」的重排、狗狗解鎖 |
| `npm run strokes` | 由 hanzi-writer-data 同 `data/stroke-overrides.json` 重寫 `data/strokes/` |

粵語聲音：有 `assets/audio/{字}.mp3`（或同名 Unicode 檔、例詞檔）就播檔案；否則用瀏覽器的 `zh-HK` 語音。沒有粵語語音就只顯示粵拼。

## Cloudflare Pages

靜態站，用 hash 路由（`#/write`），不用伺服器重寫。

| 項目 | 值 |
|------|-----|
| 建置指令 | `npm run build` |
| 輸出目錄 | `dist` |
| Node | 22 |
