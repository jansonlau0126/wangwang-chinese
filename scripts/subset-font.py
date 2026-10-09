#!/usr/bin/env python3
"""Rebuild public/fonts/FreeHKKai-subset.woff2 from Free HK Kai source."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC_CANDIDATES = [
    Path("/tmp/freehkfont/Free-HK-Kai_4700-v1.02.ttf"),
    ROOT / "vendor/Free-HK-Kai_4700-v1.02.ttf",
]
OUT = ROOT / "public/fonts/FreeHKKai-subset.woff2"
PYFTSUBSET = Path("/tmp/fontvenv/bin/pyftsubset")


def collect_needed() -> set[str]:
    needed: set[str] = set()
    for name in ("characters.json", "characters-s2.json"):
        path = ROOT / "data" / name
        if not path.exists():
            continue
        chars = json.loads(path.read_text(encoding="utf-8"))
        for entry in chars:
            needed.update(entry["char"])
            needed.update(entry["exampleWord"])
    for path in list((ROOT / "src").glob("*.js")) + [
        ROOT / "index.html",
        ROOT / "public/404.html",
        ROOT / "README.md",
        ROOT / "docs/DESIGN.md",
    ]:
        if not path.exists():
            continue
        for ch in path.read_text(encoding="utf-8", errors="ignore"):
            if "\u4e00" <= ch <= "\u9fff" or ch in "，。！？、：；（）「」『』…—·〔〕":
                needed.add(ch)
    # Common UI Cantonese / labels that may be built dynamically
    needed.update(
        "汪汪中文首頁進度生字卡狗狗關於我第日週寫完好叻呀再嚟一次跟腳印描"
        "少啲腳印我自己寫攞骨頭睇汪汪寫未解鎖寫好喇寫緊未寫已完成今日骨頭"
        "隱藏波波練習記錄提示次數鳴謝授權條款可以返生字卡慢啲正常速度"
        "開始寫繼續寫下一日識咗隻朋友陪緊你揀佢陪我起始係毛毛好開心"
        "撳個字睇大啲上一週下一週聽讀音再寫一次未有粵語聲音"
    )
    return needed


def main() -> int:
    src = next((p for p in SRC_CANDIDATES if p.exists()), None)
    if not src:
        print("Free HK Kai source TTF not found", file=sys.stderr)
        return 1
    needed = collect_needed()
    text_file = Path("/tmp/ww-subset-glyphs.txt")
    text_file.write_text("".join(sorted(needed)), encoding="utf-8")
    pyft = str(PYFTSUBSET if PYFTSUBSET.exists() else "pyftsubset")
    cmd = [
        pyft,
        str(src),
        f"--text-file={text_file}",
        "--flavor=woff2",
        f"--output-file={OUT}",
        "--layout-features=*",
        "--no-hinting",
        "--desubroutinize",
    ]
    print("subsetting", len(needed), "codepoints →", OUT)
    subprocess.check_call(cmd)
    print("wrote", OUT, "size", OUT.stat().st_size)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
