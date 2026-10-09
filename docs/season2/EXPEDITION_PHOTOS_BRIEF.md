# 第二季探險相需求表（Brief）

> **狀態：`drafts-in-assets`（2026-10-08）**  
> 用戶已批 30 張草稿；已轉 **800×450 WebP** 放入 `assets/expedition/`（`{slug}-expedition-a/b.webp`）。**未改 `manifest.json`、未改 `src/`**（程式暫緩）。原始 JPG 草稿仍喺 `docs/season2/images/expedition-drafts/`。

對齊決定：D3（探險姿勢相，唔換裝）、D11（每狗 2 張＝30 張；相簿 105→135）、D12（AI 草稿＋標明草稿）、D13（`momo-expressions` 併入探險相）。

故事章節：`02-stories.md`。狗名單：`01-dog-profiles.md`／`assets/manifest.json`。

---

## 1. 總則

| 項目 | 規格 |
|------|------|
| 數量 | 15 狗 × 2 張＝**30**；唔加新狗 |
| 風格 | **寫實風**，同 S1 sit／poses 一致；品種、毛色、體型可辨認 |
| 尺寸 | **800×450** WebP（跟 `manifest.json` → `format`） |
| 草稿 | AI 出圖後標 `draft: true`、`source: "AI-generated draft"` |
| 換裝 | **唔畫**卡通衫、探險帽、背包、領巾、彩帶等配件；可有輕微場景氛圍（草地光、店面色塊、窗光），但狗本身保持「公園日常」外觀 |
| 姿勢 | 唔好純重複 S1 已有名：`sit`／`happy`／`sleep`／`stretch`／`act-a`／`act-b`／`ball`；要有**場景感**同章節動作 |
| 命名 | `assets/expedition/{slug}-expedition-a.webp`、`…-expedition-b.webp` |
| Pose id | `expedition-a`、`expedition-b`（將來入 `manifest` 時用） |
| 參考相 | 每張必須對照該狗 S1 sit：`assets/dogs/{slug}.webp` |
| 解鎖 | **待程式**：相簿格＋骨頭價重跑 `sim-unlock.mjs`；本 brief 唔定價 |
| 語言 | 出圖 prompt 要點用英文短句（方便之後 GenerateImage）；產品內文用中文名「毛毛」等，**唔叫 Momo** |

### 禁止事項（全表通用）

- 卡通立繪、白底表情包、擬人雙手豎拇指／舉雙手慶祝姿勢（舊 `momo-expressions` 卡通稿只當情緒參考）
- 文字浮水印、英文招牌搶眼字、可辨識真人臉
- 血腥、驚嚇、過度擬人服裝
- 改品種／改毛色（例如金毛變白、貴賓變黑）
- 第 16 隻狗或合照當單張解鎖相（完季合照另議，唔入呢 30 格）

---

## 2. 完整 30 張表

圖例：**場景**＝城市／自然／家庭／學校／公園／回家。  
**章節**＝該狗主出場故事段（見 `02-stories.md`）。

### 2.1 毛毛 · `01-maomao-toy-poodle`（杏色玩具貴賓）

章節：1–4 出發準備；57–60 回家（第二張）。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 併入情緒 |
|---|---------|------------|------|----------|------------------|----------|----------|
| 1 | expedition-a | 出發集合 | 公園 | 站喺草地小路前端，望向鏡頭左側遠方，耳朵警覺、嘴角放鬆微笑，準備帶隊出發（無帽無背囊） | apricot toy poodle standing on park grass path, looking ahead ready to lead, soft morning light, photorealistic, match reference coat | `assets/dogs/01-maomao-toy-poodle.webp` | ready + encourage |
| 2 | expedition-b | 收隊回家 | 回家／公園夕陽 | 坐／半坐喺回家小路，身側向鏡頭，溫柔望住「隊友方向」，背景黃昏暖光，完季安心感 | apricot toy poodle on path at golden hour, calm proud expression, homeward mood, park soft bokeh, photorealistic | 同上 | celebrate（寫實版：安心自豪，唔係舉雙手） |

### 2.2 波波 · `02-bobo-shiba`（柴犬）

章節：17–20 城市帶路。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 備註 |
|---|---------|------------|------|----------|------------------|----------|------|
| 3 | expedition-a | 路口守望 | 城市 | 坐喺行人路近路口，頭微側觀察「車流」方向，穩陣定心 | red shiba inu sitting near urban crosswalk curb, alert calm watchful, soft city bokeh, photorealistic | `assets/dogs/02-bobo-shiba.webp` | 章節登場 |
| 4 | expedition-b | 市集慢行 | 城市 | 喺安靜巷口／小市場邊站立慢行姿，身體放低、步伐謹慎 | red shiba walking slowly beside quiet market alley, cautious steady gait, daylight, photorealistic | 同上 | complementary |

### 2.3 多多 · `03-duoduo-corgi`（柯基）

章節：1–4 出發準備（活力隊友）。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 備註 |
|---|---------|------------|------|----------|------------------|----------|------|
| 5 | expedition-a | 草地衝刺 | 公園 | 短腿快跑姿，耳朵飛起、屁股扭動感，開心出發 | pembroke corgi mid-trot on green lawn, joyful energy, park morning, photorealistic | `assets/dogs/03-duoduo-corgi.webp` | 章節登場 |
| 6 | expedition-b | 集合搖尾 | 公園 | 站喺草地球門／小路旁望住「隊長方向」，尾巴高翹等待出發 | corgi standing on grass looking up eagerly, tail high, expedition meetup vibe, photorealistic | 同上 | complementary |

### 2.4 豆豆 · `04-doudou-dachshund`（朱古力臘腸）

章節：13–16 城市開始。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 併入情緒 |
|---|---------|------------|------|----------|------------------|----------|----------|
| 7 | expedition-a | 街角探頭 | 城市 | 長身探出街角／店門口，鼻尖向前好奇嗅聞 | chocolate dachshund peeking around city street corner, curious nose forward, shopfront soft colors, photorealistic | `assets/dogs/04-doudou-dachshund.webp` | thinking／好奇 |
| 8 | expedition-b | 巴士站張望 | 城市 | 喺巴士站牌附近坐低，頭抬望「巴士」方向 | chocolate dachshund sitting near bus stop pole, looking up the street, urban daylight, photorealistic | 同上 | 章節場景 |

### 2.5 白白 · `05-baibai-bichon`（比熊）

章節：41–44 照顧。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 併入情緒 |
|---|---------|------------|------|----------|------------------|----------|----------|
| 9 | expedition-a | 溫柔陪伴 | 家庭 | 坐喺室內軟墊／地毯，頭微傾、眼神柔和安慰 | white bichon frise sitting on soft home rug, gentle comforting gaze, warm indoor light, photorealistic | `assets/dogs/05-baibai-bichon.webp` | comfort |
| 10 | expedition-b | 洗後甩毛 | 家庭 | 浴室門邊／地墊上，微濕蓬鬆毛、輕鬆甩頭後靜止瞬間（唔血腥、唔搞笑失真） | fluffy bichon near bathroom mat after gentle wash, soft damp curls, cozy home, photorealistic | 同上 | 照顧場景 |

### 2.6 金金 · `06-jinjin-golden-retriever`（金毛）

章節：21–24 顏色同商店／公園球場。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 備註 |
|---|---------|------------|------|----------|------------------|----------|------|
| 11 | expedition-a | 公園幫手 | 公園／城市綠地 | 站喺公園草地，嘴輕輕叼住無害軟玩具袋／小物（可選無物：前爪輕踏示意幫忙） | golden retriever standing in city park, helpful eager posture, soft daylight, photorealistic | `assets/dogs/06-jinjin-golden-retriever.webp` | 章節登場 |
| 12 | expedition-b | 橋邊眺望 | 城市 | 喺行人橋／河邊欄杆內側坐下望河景 | golden retriever sitting by riverside promenade railing, looking at water, urban park, photorealistic | 同上 | complementary |

### 2.7 黑糖 · `07-heitang-labrador`（朱古力拉布）

章節：33–36 水同虹。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 備註 |
|---|---------|------------|------|----------|------------------|----------|------|
| 13 | expedition-a | 水邊守護 | 自然 | 站喺淺水岸／湖邊，身體穩、望住水面 | chocolate labrador standing at calm lakeshore, steady protective stance, misty soft light, photorealistic | `assets/dogs/07-heitang-labrador.webp` | 章節登場 |
| 14 | expedition-b | 霜煙同行 | 自然 | 喺有淡煙／輕霜草地行走，可靠陪伴感（唔使極端天氣） | chocolate labrador walking through light morning mist on grass, reliable companion mood, photorealistic | 同上 | complementary |

### 2.8 球球 · `08-qiuqiu-old-english-sheepdog`（古代牧羊）

章節：29–32 草地。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 備註 |
|---|---------|------------|------|----------|------------------|----------|------|
| 15 | expedition-a | 護隊巡視 | 自然 | 蓬鬆毛影喺草地站立，頭轉向「隊」方向巡視 | old english sheepdog standing in meadow, watchful herding glance aside, soft daylight, photorealistic | `assets/dogs/08-qiuqiu-old-english-sheepdog.webp` | 章節登場 |
| 16 | expedition-b | 石邊小心行 | 自然 | 喺有圓石／草地邊界慢行，腳步謹慎 | shaggy sheepdog carefully stepping near rounded stones on grass path, protective calm, photorealistic | 同上 | complementary |

### 2.9 灰灰 · `09-huihui-husky`（哈士奇）

章節：25–28 自然奇遇。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 併入情緒 |
|---|---------|------------|------|----------|------------------|----------|----------|
| 17 | expedition-a | 晴朗前行 | 自然 | 站喺陽光山徑／開闊草地，胸膛微挺、望向前方 | siberian husky standing on sunlit trail, brave forward gaze, nature bokeh, photorealistic | `assets/dogs/09-huihui-husky.webp` | 章節登場 |
| 18 | expedition-b | 霞光駐足 | 自然 | 晚霞天色下側坐／站，望住彩色天空（驚嘆但寫實） | husky silhouetted softly at sunset glow, awe calm expression, outdoor, photorealistic | 同上 | surprised（寫實：望天驚嘆） |

### 2.10 圓圓 · `10-yuanyuan-pug`（八哥）

章節：9–12 開心打氣。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 備註 |
|---|---------|------------|------|----------|------------------|----------|------|
| 19 | expedition-a | 草地笑臉 | 公園 | 坐喺草地，舌頭微露、眯眼開心打氣感 | fawn pug sitting on grass, happy squint smile, playful park light, photorealistic | `assets/dogs/10-yuanyuan-pug.webp` | 章節登場 |
| 20 | expedition-b | 休息打氣 | 公園 | 側躺／趴喺樹蔭，抬頭望鏡頭，鼓勵「攰就休息」 | pug lounging in tree shade looking at camera cheerfully, rest-break mood, photorealistic | 同上 | complementary |

### 2.11 雪雪 · `11-xuexue-samoyed`（薩摩耶）

章節：45–48 休息。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 備註 |
|---|---------|------------|------|----------|------------------|----------|------|
| 21 | expedition-a | 夢想小憩 | 家庭／安靜角 | 趴喺窗邊軟墊，眼睛半閉、溫柔夢幻 | white samoyed resting by window cushion, dreamy half-closed eyes, soft indoor light, photorealistic | `assets/dogs/11-xuexue-samoyed.webp` | 章節登場 |
| 22 | expedition-b | 梳後溫暖 | 家庭 | 坐姿毛髮整齊蓬鬆，溫暖室內，休息後再出發感 | fluffy samoyed sitting indoors after grooming, warm cozy light, calm smile, photorealistic | 同上 | complementary |

### 2.12 蹦蹦 · `12-bengbeng-border-collie`（邊牧）

章節：5–8 帶路。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 備註 |
|---|---------|------------|------|----------|------------------|----------|------|
| 23 | expedition-a | 認路回頭 | 公園／小路 | 走喺小路前端，回頭望「跟隊」方向，眼神醒目 | border collie on path looking back over shoulder guiding, alert intelligent eyes, park, photorealistic | `assets/dogs/12-bengbeng-border-collie.webp` | 章節登場 |
| 24 | expedition-b | 示意前路 | 公園 | 身體前傾、鼻／視線示意分叉路其中一側（無手指） | border collie leaning forward indicating a fork in the trail, focused, daylight, photorealistic | 同上 | complementary |

### 2.13 皮皮 · `13-pipi-french-bulldog`（法鬥）

章節：49–52 學校。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 備註 |
|---|---------|------------|------|----------|------------------|----------|------|
| 25 | expedition-a | 課室門外護住 | 學校 | 坐喺安靜走廊／課室門邊，忠心守護姿 | french bulldog sitting by school hallway door, loyal guard calm, soft indoor light, photorealistic | `assets/dogs/13-pipi-french-bulldog.webp` | 章節登場 |
| 26 | expedition-b | 認真旁聽 | 學校 | 坐喺矮書架／書本旁（唔咬書），望住「功課」方向 | french bulldog sitting beside low stack of books, focused attentive, classroom soft bokeh, photorealistic | 同上 | complementary |

### 2.14 糖糖 · `14-tangtang-maltese`（瑪爾濟斯）

章節：37–40 家庭。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 備註 |
|---|---------|------------|------|----------|------------------|----------|------|
| 27 | expedition-a | 客廳乖乖 | 家庭 | 坐喺乾淨客廳地毯，毛髮整齊、乖巧望鏡頭 | white maltese sitting on tidy living-room rug, neat coat, polite calm, warm home light, photorealistic | `assets/dogs/14-tangtang-maltese.webp` | 章節登場 |
| 28 | expedition-b | 餐桌旁守候 | 家庭 | 喺餐桌腳邊／廚房門口坐下，細心等待用膳氣氛（唔放食物搶鏡） | maltese sitting near dining table legs, attentive tidy, cozy kitchen-adjacent light, photorealistic | 同上 | complementary |

### 2.15 大王 · `15-dawang-akita`（秋田）

章節：53–56 勇氣。

| # | pose id | 中文姿勢名 | 場景 | 動作描述 | 出圖 prompt 要點 | 參考 sit | 備註 |
|---|---------|------------|------|----------|------------------|----------|------|
| 29 | expedition-a | 沉穩打氣 | 公園／開闊地 | 坐姿胸膛挺、沉穩望向前方，勇氣收隊感 | akita sitting upright on open ground, dignified encouraging presence, soft daylight, photorealistic | `assets/dogs/15-dawang-akita.webp` | 章節登場 |
| 30 | expedition-b | 再試一步 | 自然／小路 | 站起向前踏一步，回頭輕望，鼓勵「再試一次」 | akita taking a forward step on trail looking back gently, brave calm, outdoor, photorealistic | 同上 | complementary |

---

## 3. 檔名同路徑一覽（30）

全部目標路徑（**尚未建立檔案**）：

```
assets/expedition/01-maomao-toy-poodle-expedition-a.webp
assets/expedition/01-maomao-toy-poodle-expedition-b.webp
assets/expedition/02-bobo-shiba-expedition-a.webp
assets/expedition/02-bobo-shiba-expedition-b.webp
assets/expedition/03-duoduo-corgi-expedition-a.webp
assets/expedition/03-duoduo-corgi-expedition-b.webp
assets/expedition/04-doudou-dachshund-expedition-a.webp
assets/expedition/04-doudou-dachshund-expedition-b.webp
assets/expedition/05-baibai-bichon-expedition-a.webp
assets/expedition/05-baibai-bichon-expedition-b.webp
assets/expedition/06-jinjin-golden-retriever-expedition-a.webp
assets/expedition/06-jinjin-golden-retriever-expedition-b.webp
assets/expedition/07-heitang-labrador-expedition-a.webp
assets/expedition/07-heitang-labrador-expedition-b.webp
assets/expedition/08-qiuqiu-old-english-sheepdog-expedition-a.webp
assets/expedition/08-qiuqiu-old-english-sheepdog-expedition-b.webp
assets/expedition/09-huihui-husky-expedition-a.webp
assets/expedition/09-huihui-husky-expedition-b.webp
assets/expedition/10-yuanyuan-pug-expedition-a.webp
assets/expedition/10-yuanyuan-pug-expedition-b.webp
assets/expedition/11-xuexue-samoyed-expedition-a.webp
assets/expedition/11-xuexue-samoyed-expedition-b.webp
assets/expedition/12-bengbeng-border-collie-expedition-a.webp
assets/expedition/12-bengbeng-border-collie-expedition-b.webp
assets/expedition/13-pipi-french-bulldog-expedition-a.webp
assets/expedition/13-pipi-french-bulldog-expedition-b.webp
assets/expedition/14-tangtang-maltese-expedition-a.webp
assets/expedition/14-tangtang-maltese-expedition-b.webp
assets/expedition/15-dawang-akita-expedition-a.webp
assets/expedition/15-dawang-akita-expedition-b.webp
```

`manifest.json` 將來可加：

- 頂層 `"poses"` 陣列加 `"expedition-a"`、`"expedition-b"`（或獨立 `"expeditionPoses"`——實作時揀一種，唔好兩套並存）
- 每狗 `poses` 物件加對應 path

---

## 4. `momo-expressions` 點樣併入（D13）

舊資料夾 `docs/season2/images/momo-expressions/` 係**卡通立繪＋探險帽**概念，**唔直接入 `assets/`**。情緒轉成寫實探險姿如下：

| 舊概念檔（參考） | 情緒 | 併入邊張探險相 |
|------------------|------|----------------|
| 01-default-happy | 預設開心 | 毛毛整體表情基調；多多／圓圓開心姿亦吸收 |
| 02-encourage | 加油鼓勵 | **毛毛 expedition-a**（出發集合、溫柔帶隊） |
| 03-celebrate | 慶祝完成 | **毛毛 expedition-b**（收隊回家、安心自豪；**唔**舉雙手／彩帶） |
| 04-thinking | 思考好奇 | **豆豆 expedition-a**（街角探頭）為主；其他狗唔另做思考套 |
| 05-comfort | 溫柔安慰 | **白白 expedition-a**（溫柔陪伴） |
| 06-ready | 出發準備好 | **毛毛 expedition-a**（同 encourage 合併成一張場景） |
| 07-surprised | 驚訝／哇 | **灰灰 expedition-b**（霞光駐足）寫實驚嘆 |

結論：

- **唔另做**卡通表情系統、唔保留藍帽背包立繪做 production。
- 毛毛兩張已覆蓋 ready／encourage／celebrate；其餘情緒分散到劇情狗，避免 7 張全擠喺毛毛。
- `images/momo-expressions/` 可留作企劃考古；上線路徑只有 `assets/expedition/`。

---

## 5. 之後出圖／入 assets 步驟（未做）

批完本 brief 之後先做：

1. ⬜ 用戶確認／改主題（尤其毛毛兩張、有冇要換場景）
2. ⬜ 建資料夾 `assets/expedition/`（空）
3. ⬜ 按上表逐張 AI 出草稿 → 轉 **800×450 WebP**
4. ⬜ 人工對照 sit 參考：品種、毛色、臉型一致
5. ⬜ 更新 `assets/manifest.json`（paths + draft 標記；poses 名單）
6. ⬜ App：相簿格 105→135；解鎖／骨頭價；跑 `sim-unlock.mjs`（目標兩季約兩年集齊）
7. ⬜ `npm run check`／目視相簿
8. ⬜ （可選）標記 `images/momo-expressions` 為 superseded，指向本 brief

**而家唔做：** GenerateImage、改狗相檔、改 `data/characters.json`、改 App 程式、push。

---

## 6. 章節 × 狗對照（方便審 brief）

| S2 日 | 章節 | 主出場狗 | 建議主場景相 |
|-------|------|----------|--------------|
| 1–4 | 出發準備 | 毛毛、多多 | 毛毛 a、多多 a／b |
| 5–8 | 帶路 | 蹦蹦 | 蹦蹦 a／b |
| 9–12 | 開心打氣 | 圓圓 | 圓圓 a／b |
| 13–16 | 城市開始 | 豆豆 | 豆豆 a／b |
| 17–20 | 城市帶路 | 波波 | 波波 a／b |
| 21–24 | 顏色同商店 | 金金 | 金金 a／b |
| 25–28 | 自然奇遇 | 灰灰 | 灰灰 a／b |
| 29–32 | 草地 | 球球 | 球球 a／b |
| 33–36 | 水同虹 | 黑糖 | 黑糖 a／b |
| 37–40 | 家庭 | 糖糖 | 糖糖 a／b |
| 41–44 | 照顧 | 白白 | 白白 a／b |
| 45–48 | 休息 | 雪雪 | 雪雪 a／b |
| 49–52 | 學校 | 皮皮 | 皮皮 a／b |
| 53–56 | 勇氣 | 大王 | 大王 a／b |
| 57–60 | 回家 | 全隊 | **毛毛 b**（收隊回家）；其餘用現有相拼合照（唔另做第 31 張） |

---

## 7. 狀態摘要

| 項目 | 狀態 |
|------|------|
| 需求表 30 張規格 | ✅ brief-ready |
| 用戶批准出圖 | ⬜ |
| AI 草稿／WebP／manifest | ⬜ |
| 相簿解鎖程式 | ⬜ |

**毛毛兩張主題（摘要）：**

1. **expedition-a「出發集合」**——公園草地，準備帶隊（ready + encourage）。  
2. **expedition-b「收隊回家」**——黃昏回家小路，完季安心（celebrate 寫實版）。
