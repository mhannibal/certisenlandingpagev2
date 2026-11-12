"""
Police de l'image de partage chinoise (/zh/opengraph-image) : extrait de Noto Sans SC.

La police par défaut des images de partage n'a pas les caractères chinois. On garde, dans
assets/og/, un petit extrait de Noto Sans SC (Regular et Medium, licence SIL OFL 1.1, voir
assets/og/OFL.txt) qui ne contient que les caractères utiles : l'ASCII et les textes chinois
affichés sur l'image (hero.title1, hero.title2, meta.description de lib/i18n/dictionaries/zh.ts).

À relancer si ces textes chinois changent (sinon les nouveaux caractères manquent) :
  1. télécharger les polices complètes (source officielle, dépôt notofonts/noto-cjk) :
     https://github.com/notofonts/noto-cjk/raw/main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf
     https://github.com/notofonts/noto-cjk/raw/main/Sans/SubsetOTF/SC/NotoSansSC-Medium.otf
  2. depuis apps/web :  python -I scripts/og-font-subset.py <dossier des deux .otf>

Nécessite fontTools (pip install fonttools).
"""

import re
import sys
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
ZH = ROOT / "lib" / "i18n" / "dictionaries" / "zh.ts"
OUT = ROOT / "assets" / "og"


def zh_texts() -> str:
    src = ZH.read_text(encoding="utf-8")
    meta = re.search(r"meta: \{(.*?)\n  \},", src, re.S).group(1)
    hero = re.search(r"\n  hero: \{(.*?)\n  \},", src, re.S).group(1)
    texts = [
        re.search(r'description:\s*"([^"]*)"', meta).group(1),
        re.search(r'title1: "([^"]*)"', hero).group(1),
        re.search(r'title2: "([^"]*)"', hero).group(1),
    ]
    return "".join(texts)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src_dir = Path(sys.argv[1])
    text = zh_texts() + "".join(chr(c) for c in range(0x20, 0x7F)) + "·…—"
    OUT.mkdir(parents=True, exist_ok=True)
    for weight in ("Regular", "Medium"):
        options = subset.Options()
        options.layout_features = ["*"]
        options.name_IDs = ["*"]
        options.notdef_outline = True
        font = subset.load_font(str(src_dir / f"NotoSansSC-{weight}.otf"), options)
        sub = subset.Subsetter(options)
        sub.populate(text=text)
        sub.subset(font)
        dest = OUT / f"NotoSansSC-{weight}-og.otf"
        subset.save_font(font, str(dest), options)
        print(f"{dest.relative_to(ROOT)} : {dest.stat().st_size // 1024} Ko, {len(set(text))} caractères")


if __name__ == "__main__":
    main()
