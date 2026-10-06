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
| 吉祥物 | 15 隻狗 × 7 相（每完成 4 日解鎖一隻；骨頭換相） |
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
- 粵語讀音（裝置 TTS + 粵拼）：[`docs/CANTONESE.md`](./docs/CANTONESE.md)
- 第二季規劃（汪汪探險隊）：[`docs/season2/`](./docs/season2/README.md)
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

粵語讀音：裝置 `speechSynthesis`（粵語／zh-HK）；永遠顯示粵拼；無粵語聲就唔播、唔改用普通話。詳見 [`docs/CANTONESE.md`](./docs/CANTONESE.md)。

## Cloudflare Pages

靜態站，hash 路由。`public/404.html` 令缺檔回 404（唔好當 SPA fallback 食咗音檔探測）。

| 項目 | 值 |
|------|-----|
| 建置指令 | `npm run build` |
| 輸出目錄 | `dist` |
| Node | 20+ |


## 相簿與骨頭

- 15 狗 × 7 相 = 105。狗按課堂進度每 4 日解鎖一隻。
- 骨頭：新課堂日 +1、溫習 +1、零提示 +1；**每日最多 2**。
- 換相價錢：開心 4、瞓覺 4、伸懶腰 5、得意 A 5、得意 B 6（每狗 24；共 360）。
- 波波相：同伴狗換齊 5 張付費相後，零提示寫完一日免費解鎖。
- 模擬（5 日／週、一半日子溫習、30% 零提示）：約 **53 週**集齊；爆肝最少 **180 日**先換齊付費相。詳見 `docs/DESIGN.md`、`scripts/sim-unlock.mjs`。

