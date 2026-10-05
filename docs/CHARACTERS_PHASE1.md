# 第一期字表

> 研究日期：2026-10-05。筆畫數、粵拼、例詞全部來自真實資料，沒有自行編造。

## 1. 建議規模
- **第一期：30 字 = 10 日 × 每日 3 字**。足夠驗證流程（描紅、讀音、小狗解鎖），人手驗收筆順及音檔工作量可控。
- 下一步：擴至約 100 字（約 5 星期），之後按教育局第一學習階段字表（2,169 字）逐批加。

## 2. 選字準則
1. 屬教育局《香港小學學習字詞表》**第一學習階段**（單字詞條標示 ks1）。
2. 筆畫少（1–5 畫）、生活常用、字形是常見部件（日、月、木、水、火、口…）。
3. 大致按筆畫數由少到多排。
4. 開源筆畫資料（hanzi-writer-data）與教育局筆順對照通過；唯一例外「出」需要重排筆畫（見 [STROKE_ORDER.md](./STROKE_ORDER.md) §3）。
5. 避開對照有問題的「母」「又」；「九」在字詞表沒有詞語可作例詞，以「刀」代替。

## 3. 首 30 字

| 日 | 字 | 筆畫 | 粵拼 | 例詞（粵拼） | 筆順對照 |
|----|----|------|------|-------------|----------|
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
| 10 | 出 | 5 | ceot1 | 出去 ceot1 heoi3 | **要重排**（自動對照結果 ORDER 31245，人手確認） |

注意：
- 「上」例詞改為「上面 soeng6 min6」（Janson 已確認），單字同例詞同讀 soeng6。「上面」不在教育局字詞表；粵拼以字詞表單字讀音（上 soeng6）及 rime-cantonese 字表（上 soeng6、面 min6 主讀音）核對，字詞表亦有「四方八面 sei3 fong1 baat3 min6」。
- 「二胡」「八達通」已換（Janson 已確認）：八 →「八爪魚 baat3 zaau2 jyu4」（字詞表 ks1 詞，粵拼照錄）；二 →「十二 sap6 ji6」。字詞表內「二」的 ks1 詞只有「二胡」「獨一無二」，都唔夠淺，所以揀「十二」；「十二」本身不在字詞表詞語，粵拼按字詞表單字讀音（十 sap6、二 ji6）及 rime 字表核對。如要嚴格只用字詞表詞，可改「獨一無二 duk6 jat1 mou4 ji6」。

### 資料來源
- 筆畫數、粵音、例詞及其粵拼、ks1 標示：教育局《香港小學學習字詞表》網上版 https://www.edbchinese.hk/lexlist_ch/ （2026-10-05 查詢，工作機 `/workspace/research/edb/data.json`）。
- 粵拼交叉核對：rime-cantonese `jyut6ping3.chars.dict.yaml`（CC BY 4.0），30 字主讀音與教育局一致。
- 筆順對照：`/workspace/research/compare_result.json`（方法見 STROKE_ORDER.md §3）；hanzi-writer-data 與教育局筆畫數 30 字全部相同。

## 4. 擴展方法
1. 由教育局字詞表取第一學習階段字（逐字查詢，取筆畫數、粵音、ks1 詞語），存成內部 JSON（不入 repo，只把我們整理的欄位入 repo，版權見 STROKE_ORDER.md §1）。
2. 排序：先筆畫少、部件已學過（如學了「木」再學「林」「本」），再按常用度。
3. 每字跑 STROKE_ORDER.md §4 流程（含人手驗收），以及 CANTONESE.md 的讀音／例詞規則及音檔驗收。
4. 艹、馬、魚等部件的字對照問題多（約 3–4 成要修），排在後期並預留人手時間。
5. 字表檔：`data/characters.json`，欄位：`day, char, strokes, jyutping, exampleWord, exampleJyutping, strokeSource, verifiedAgainstEdb`。
