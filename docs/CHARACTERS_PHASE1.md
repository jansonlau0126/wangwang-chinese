# 第一季字表（Season 1）

> 研究／整理日期：2026-10-06。180 字 = 12 週 × 5 日 × 每日 3 字。首 30 字（第 1–10 日）沿用第一期。

## 1. 規模
- **第一季：180 字 = 60 日 × 每日 3 字**（約 12 星期）。
- 解鎖：起始毛毛；**每完成 4 日**解鎖一隻新狗；第 56 個完成日解鎖齊 15 隻。
- 字表檔：`data/characters.json`。

## 2. 選字準則
1. 香港小一至小二常用字，大致按筆畫由少到多、生活常用。
2. 避開 hanzi-writer-data 與教育局筆畫**數量／方向**明顯唔同、又無法可靠重排嘅字（又、花、草、雨、風、雲、馬、魚、學、貓）。
3. 筆順次序唔同時，若可以可靠重排 strokes／medians，就寫入 `data/stroke-overrides.json`（出、母、的、來、飛）。
4. `verifiedAgainstEdb` 只喺實際對過教育局資料（或可靠重排）先填日期；其餘為 `false`。
5. 粵拼以教育局字詞表為準（有就用）；否則用 rime-cantonese，再人手改成學校常用讀音。

## 3. 筆順重排（overrides）
| 字 | 原 hwd 次序 → 香港次序 | 說明 |
|----|------------------------|------|
| 出 | 31245 | 長豎先寫（見 STROKE_ORDER.md） |
| 母 | 12354 | 第 4、5 筆對調 |
| 的 | 12435678 | 對照 compare_result |
| 來 | 16234578 | 對照 compare_result |
| 飛 | 132456789 | 對照 compare_result |

## 4. 全表（按週）

### 第 1 週（第 1–5 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 1 | 一 | 1 | jat1 | 一半 jat1 bun3 | OK |
| 1 | 二 | 2 | ji6 | 十二 sap6 ji6 | OK |
| 1 | 十 | 2 | sap6 | 十分 sap6 fan1 | OK |
| 2 | 人 | 2 | jan4 | 大人 daai6 jan4 | OK |
| 2 | 入 | 2 | jap6 | 入口 jap6 hau2 | OK |
| 2 | 八 | 2 | baat3 | 八爪魚 baat3 zaau2 jyu4 | OK |
| 3 | 七 | 2 | cat1 | 七彩 cat1 coi2 | OK |
| 3 | 力 | 2 | lik6 | 大力 daai6 lik6 | OK |
| 3 | 刀 | 2 | dou1 | 剪刀 zin2 dou1 | OK |
| 4 | 三 | 3 | saam1 | 三文治 saam1 man4 zi6 | OK |
| 4 | 大 | 3 | daai6 | 大小 daai6 siu2 | OK |
| 4 | 小 | 3 | siu2 | 小心 siu2 sam1 | OK |
| 5 | 山 | 3 | saan1 | 山羊 saan1 joeng4 | OK |
| 5 | 口 | 3 | hau2 | 口水 hau2 seoi2 | OK |
| 5 | 土 | 3 | tou2 | 泥土 nai4 tou2 | OK |

### 第 2 週（第 6–10 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 6 | 上 | 3 | soeng6 | 上面 soeng6 min6 | OK |
| 6 | 下 | 3 | haa6 | 下巴 haa6 baa1 | OK |
| 6 | 女 | 3 | neoi5 | 女孩 neoi5 haai4 | OK |
| 7 | 日 | 4 | jat6 | 生日 sang1 jat6 | OK |
| 7 | 月 | 4 | jyut6 | 月亮 jyut6 loeng6 | OK |
| 7 | 木 | 4 | muk6 | 木瓜 muk6 gwaa1 | OK |
| 8 | 水 | 4 | seoi2 | 水牛 seoi2 ngau4 | OK |
| 8 | 火 | 4 | fo2 | 火車 fo2 ce1 | OK |
| 8 | 天 | 4 | tin1 | 天空 tin1 hung1 | OK |
| 9 | 手 | 4 | sau2 | 手指 sau2 zi2 | OK |
| 9 | 中 | 4 | zung1 | 中文 zung1 man4 | OK |
| 9 | 牛 | 4 | ngau4 | 牛奶 ngau4 naai5 | OK |
| 10 | 生 | 5 | sang1 | 生日 sang1 jat6 | OK |
| 10 | 白 | 5 | baak6 | 白色 baak6 sik1 | OK |
| 10 | 出 | 5 | ceot1 | 出去 ceot1 heoi3 | 重排 |

### 第 3 週（第 11–15 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 11 | 九 | 2 | gau2 | 九月 gau2 jyut6 | OK |
| 11 | 了 | 2 | liu5 | 為了 wai6 liu5 | OK |
| 11 | 也 | 3 | jaa5 | 也好 jaa5 hou2 | OK |
| 12 | 子 | 3 | zi2 | 子女 zi2 neoi5 | OK |
| 12 | 寸 | 3 | cyun3 | 尺寸 cek3 cyun3 | OK |
| 12 | 工 | 3 | gung1 | 工人 gung1 jan4 | OK |
| 13 | 巾 | 3 | gan1 | 毛巾 mou4 gan1 | OK |
| 13 | 弓 | 3 | gung1 | 彈弓 daan6 gung1 | OK |
| 13 | 千 | 3 | cin1 | 一千 jat1 cin1 | OK |
| 14 | 不 | 4 | bat1 | 不是 bat1 si6 | OK |
| 14 | 五 | 4 | ng5 | 五官 ng5 gun1 | OK |
| 14 | 六 | 4 | luk6 | 六月 luk6 jyut6 | OK |
| 15 | 心 | 4 | sam1 | 小心 siu2 sam1 | OK |
| 15 | 文 | 4 | man4 | 中文 zung1 man4 | OK |
| 15 | 方 | 4 | fong1 | 方向 fong1 hoeng3 | OK |

### 第 4 週（第 16–20 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 16 | 毛 | 4 | mou4 | 毛巾 mou4 gan1 | OK |
| 16 | 父 | 4 | fu6 | 父親 fu6 can1 | OK |
| 16 | 牙 | 4 | ngaa4 | 牙齒 ngaa4 ci2 | OK |
| 17 | 王 | 4 | wong4 | 王子 wong4 zi2 | OK |
| 17 | 他 | 5 | taa1 | 他們 taa1 mun4 | OK |
| 17 | 去 | 5 | heoi3 | 出去 ceot1 heoi3 | OK |
| 18 | 四 | 5 | sei3 | 四季 sei3 gwai3 | OK |
| 18 | 左 | 5 | zo2 | 左手 zo2 sau2 | OK |
| 18 | 右 | 5 | jau6 | 右手 jau6 sau2 | OK |
| 19 | 本 | 5 | bun2 | 書本 syu1 bun2 | OK |
| 19 | 正 | 5 | zing3 | 正直 zing3 zik6 | OK |
| 19 | 瓜 | 5 | gwaa1 | 西瓜 sai1 gwaa1 | OK |
| 20 | 田 | 5 | tin4 | 田地 tin4 dei6 | OK |
| 20 | 皮 | 5 | pei4 | 樹皮 syu6 pei4 | OK |
| 20 | 目 | 5 | muk6 | 目光 muk6 gwong1 | OK |

### 第 5 週（第 21–25 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 21 | 石 | 5 | sek6 | 石頭 sek6 tau4 | OK |
| 21 | 立 | 5 | lap6 | 立刻 lap6 hak1 | OK |
| 21 | 禾 | 5 | wo4 | 禾苗 wo4 miu4 | OK |
| 22 | 好 | 6 | hou2 | 好友 hou2 jau5 | OK |
| 22 | 早 | 6 | zou2 | 早上 zou2 soeng6 | OK |
| 22 | 有 | 6 | jau5 | 有趣 jau5 ceoi3 | OK |
| 23 | 竹 | 6 | zuk1 | 竹子 zuk1 zi2 | OK |
| 23 | 米 | 6 | mai5 | 白米 baak6 mai5 | OK |
| 23 | 羊 | 6 | joeng4 | 山羊 saan1 joeng4 | OK |
| 24 | 耳 | 6 | ji5 | 耳朵 ji5 do2 | OK |
| 24 | 衣 | 6 | ji1 | 衣服 ji1 fuk6 | OK |
| 24 | 西 | 6 | sai1 | 東西 dung1 sai1 | OK |
| 25 | 你 | 7 | nei5 | 你們 nei5 mun4 | OK |
| 25 | 走 | 7 | zau2 | 走路 zau2 lou6 | OK |
| 25 | 車 | 7 | ce1 | 火車 fo2 ce1 | OK |

### 第 6 週（第 26–30 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 26 | 和 | 8 | wo4 | 和氣 wo4 hei3 | OK |
| 26 | 東 | 8 | dung1 | 東方 dung1 fong1 | OK |
| 26 | 爸 | 8 | baa1 | 爸爸 baa1 baa1 | OK |
| 27 | 狗 | 8 | gau2 | 小狗 siu2 gau2 | OK |
| 27 | 門 | 8 | mun4 | 大門 daai6 mun4 | OK |
| 27 | 是 | 9 | si6 | 是的 si6 dik1 | OK |
| 28 | 看 | 9 | hon3 | 看書 hon3 syu1 | OK |
| 28 | 們 | 10 | mun4 | 我們 ngo5 mun4 | OK |
| 28 | 家 | 10 | gaa1 | 家人 gaa1 jan4 | OK |
| 29 | 書 | 10 | syu1 | 書包 syu1 baau1 | OK |
| 29 | 鳥 | 11 | niu5 | 小鳥 siu2 niu5 | OK |
| 29 | 我 | 7 | ngo5 | 我們 ngo5 mun4 | 未對照 |
| 30 | 哥 | 10 | go1 | 哥哥 go1 go1 | 未對照 |
| 30 | 弟 | 7 | dai6 | 弟弟 dai6 dai2 | 未對照 |
| 30 | 姊 | 7 | zi2 | 姊妹 zi2 mui6 | 未對照 |

### 第 7 週（第 31–35 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 31 | 妹 | 8 | mui1 | 妹妹 mui6 mui2 | 未對照 |
| 31 | 兒 | 8 | ji4 | 兒童 ji4 tung4 | 未對照 |
| 31 | 兄 | 5 | fong3 | 兄弟 hing1 dai6 | 未對照 |
| 32 | 友 | 4 | jau2 | 朋友 pang4 jau5 | 未對照 |
| 32 | 名 | 6 | meng2 | 名字 ming4 zi6 | 未對照 |
| 32 | 先 | 6 | sin1 | 先生 sin1 saang1 | 未對照 |
| 33 | 公 | 4 | gung1 | 公園 gung1 jyun2 | 未對照 |
| 33 | 母 | 5 | mou5 | 母親 mou5 can1 | 重排 |
| 33 | 的 | 8 | dik1 | 我的 ngo5 dik1 | 重排 |
| 34 | 來 | 8 | loi4 | 回來 wui4 loi4 | 重排 |
| 34 | 到 | 8 | dou2 | 去到 heoi3 dou3 | 未對照 |
| 34 | 說 | 14 | jyut6 | 說話 syut3 waa6 | 未對照 |
| 35 | 聽 | 22 | teng1 | 聽見 ting1 gin3 | 未對照 |
| 35 | 想 | 13 | soeng2 | 思想 si1 soeng2 | 未對照 |
| 35 | 愛 | 13 | oi3 | 可愛 ho2 oi3 | 未對照 |

### 第 8 週（第 36–40 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 36 | 吃 | 6 | gat1 | 吃飯 hek3 faan6 | 未對照 |
| 36 | 喝 | 12 | hot3 | 喝水 hot3 seoi2 | 未對照 |
| 36 | 玩 | 8 | waan2 | 好玩 hou2 waan2 | 未對照 |
| 37 | 跑 | 12 | paau2 | 跑步 paau2 bou6 | 未對照 |
| 37 | 跳 | 13 | tiu3 | 跳舞 tiu3 mou5 | 未對照 |
| 37 | 坐 | 7 | co5 | 坐下 co5 haa6 | 未對照 |
| 38 | 站 | 10 | zaam6 | 站立 zaam6 lap6 | 未對照 |
| 38 | 睡 | 13 | seoi6 | 睡覺 seoi6 gaau3 | 未對照 |
| 38 | 笑 | 10 | siu3 | 歡笑 fun1 siu3 | 未對照 |
| 39 | 高 | 10 | gou1 | 高興 gou1 hing3 | 未對照 |
| 39 | 低 | 7 | dai1 | 低頭 dai1 tau4 | 未對照 |
| 39 | 長 | 8 | coeng4 | 長短 coeng4 dyun2 | 未對照 |
| 40 | 短 | 12 | dyun2 | 短褲 dyun2 fu3 | 未對照 |
| 40 | 多 | 6 | do1 | 多少 do1 siu2 | 未對照 |
| 40 | 少 | 4 | siu2 | 很少 han2 siu2 | 未對照 |

### 第 9 週（第 41–45 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 41 | 新 | 13 | san1 | 新年 san1 nin4 | 未對照 |
| 41 | 舊 | 18 | gau6 | 舊書 gau6 syu1 | 未對照 |
| 41 | 遠 | 13 | jyun5 | 遠方 jyun5 fong1 | 未對照 |
| 42 | 近 | 7 | gan6 | 走近 zau2 gan6 | 未對照 |
| 42 | 今 | 4 | gam1 | 今天 gam1 tin1 | 未對照 |
| 42 | 明 | 8 | ming4 | 明天 ming4 tin1 | 未對照 |
| 43 | 昨 | 9 | zok3 | 昨天 zok3 tin1 | 未對照 |
| 43 | 午 | 4 | ng5 | 中午 zung1 ng5 | 未對照 |
| 43 | 星 | 9 | seng1 | 星星 sing1 sing1 | 未對照 |
| 44 | 光 | 6 | gwong1 | 陽光 joeng4 gwong1 | 未對照 |
| 44 | 電 | 13 | din6 | 電話 din6 waa6 | 未對照 |
| 44 | 氣 | 10 | hei3 | 空氣 hung1 hei3 | 未對照 |
| 45 | 樹 | 16 | syu6 | 大樹 daai6 syu6 | 未對照 |
| 45 | 葉 | 13 | jip6 | 樹葉 syu6 jip6 | 未對照 |
| 45 | 果 | 8 | gu2 | 水果 seoi2 gwo2 | 未對照 |

### 第 10 週（第 46–50 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 46 | 菜 | 11 | coi3 | 青菜 cing1 coi3 | 未對照 |
| 46 | 飯 | 12 | faan5 | 米飯 mai5 faan6 | 未對照 |
| 46 | 肉 | 6 | juk6 | 牛肉 ngau4 juk6 | 未對照 |
| 47 | 蛋 | 11 | daan2 | 雞蛋 gai1 daan6 | 未對照 |
| 47 | 糖 | 16 | tong2 | 糖果 tong4 gwo2 | 未對照 |
| 47 | 頭 | 16 | tau4 | 開頭 hoi1 tau4 | 未對照 |
| 48 | 眼 | 11 | ngaan5 | 眼睛 ngaan5 zing1 | 未對照 |
| 48 | 鼻 | 14 | bat6 | 鼻子 bei6 zi2 | 未對照 |
| 48 | 身 | 7 | gyun1 | 身體 san1 tai2 | 未對照 |
| 49 | 校 | 10 | gaau3 | 學校 hok6 haau6 | 未對照 |
| 49 | 老 | 6 | lou5 | 老師 lou5 si1 | 未對照 |
| 49 | 師 | 10 | si1 | 老師 lou5 si1 | 未對照 |
| 50 | 同 | 6 | tung4 | 同學 tung4 hok6 | 未對照 |
| 50 | 讀 | 22 | duk6 | 讀書 duk6 syu1 | 未對照 |
| 50 | 寫 | 15 | se2 | 寫字 se2 zi6 | 未對照 |

### 第 11 週（第 51–55 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 51 | 筆 | 12 | bat1 | 毛筆 mou4 bat1 | 未對照 |
| 51 | 紙 | 10 | zi2 | 白紙 baak6 zi2 | 未對照 |
| 51 | 班 | 10 | baan1 | 一班 jat1 baan1 | 未對照 |
| 52 | 年 | 6 | nin4 | 新年 san1 nin4 | 未對照 |
| 52 | 歲 | 13 | seoi3 | 幾歲 gei2 seoi3 | 未對照 |
| 52 | 時 | 10 | si4 | 時間 si4 gaan3 | 未對照 |
| 53 | 分 | 4 | fan1 | 一分 jat1 fan1 | 未對照 |
| 53 | 秒 | 9 | miu5 | 一秒 jat1 miu5 | 未對照 |
| 53 | 開 | 12 | hoi1 | 開門 hoi1 mun4 | 未對照 |
| 54 | 戶 | 4 | wu6 | 窗戶 coeng1 wu6 | 未對照 |
| 54 | 房 | 8 | fong2 | 房間 fong4 gaan1 | 未對照 |
| 54 | 床 | 7 | cong4 | 起床 hei2 cong4 | 未對照 |
| 55 | 帽 | 12 | mou6 | 帽子 mou6 zi2 | 未對照 |
| 55 | 鞋 | 15 | haai4 | 鞋子 haai4 zi2 | 未對照 |
| 55 | 南 | 9 | naa1 | 南方 naam4 fong1 | 未對照 |

### 第 12 週（第 56–60 日）

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 教育局對照 |
|----|----|------|------|-------------|------------|
| 56 | 北 | 5 | bak1 | 北方 bak1 fong1 | 未對照 |
| 56 | 春 | 9 | ceon1 | 春天 ceon1 tin1 | 未對照 |
| 56 | 秋 | 9 | cau1 | 秋天 cau1 tin1 | 未對照 |
| 57 | 夏 | 10 | gaa2 | 夏天 haa6 tin1 | 未對照 |
| 57 | 冬 | 5 | dung1 | 冬天 dung1 tin1 | 未對照 |
| 57 | 金 | 8 | gam1 | 金子 gam1 zi2 | 未對照 |
| 58 | 紅 | 9 | gung1 | 紅色 hung4 sik1 | 未對照 |
| 58 | 黃 | 12 | wong4 | 黃色 wong4 sik1 | 未對照 |
| 58 | 藍 | 18 | laam4 | 藍色 laam4 sik1 | 未對照 |
| 59 | 綠 | 14 | luk6 | 綠色 luk6 sik1 | 未對照 |
| 59 | 黑 | 12 | hak1 | 黑色 hak1 sik1 | 未對照 |
| 59 | 飛 | 9 | fei1 | 飛機 fei1 gei1 | 重排 |
| 60 | 可 | 5 | ho2 | 可以 ho2 ji5 | 未對照 |
| 60 | 會 | 13 | wui6 | 學會 hok6 wui6 | 未對照 |
| 60 | 用 | 5 | jung6 | 用心 jung6 sam1 | 未對照 |

## 5. 資料來源
- 教育局《香港小學學習字詞表》網上版（內部對照，唔入 repo）。
- rime-cantonese 字表（CC BY 4.0）作粵拼交叉核對。
- 筆順對照：`/workspace/research/compare_result.json`；見 [STROKE_ORDER.md](./STROKE_ORDER.md)、[STROKE_VERIFICATION.md](./STROKE_VERIFICATION.md)。
