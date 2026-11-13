"""
Logo officiel CertiSen → tracés SVG (lib/logo-paths.ts).

Sources (fournies par Lucas le 13/11/2026), dans assets/brand :
  - certisen-logo-blanc-sur-bleu.png : symbole + mot, blancs sur bleu #102d6e, coche verte ;
  - certisen-logo-bleu-sur-blanc.png : symbole + mot, bleus sur blanc, coche verte.
Les deux symboles sont deux dessins différents (cadran creux en blanc, cadran plein en bleu) :
on vectorise donc les deux. Méthode : masque « doux » (anticrénelage conservé) agrandi ×4,
seuil à 50 %, contours OpenCV avec leurs trous, simplification à ≈ 0,45 px.

À relancer si les logos changent (depuis apps/web) :  python scripts/logo-trace.py
Nécessite opencv-python, numpy et Pillow.
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "brand"
OUT = ROOT / "lib" / "logo-paths.ts"
UP = 4  # agrandissement avant seuillage (précision ≈ 1/4 de pixel)
EPS = 0.45  # tolérance de simplification, en pixels de l'image d'origine


def rgb(name):
    a = np.array(Image.open(SRC / name).convert("RGBA")).astype(np.float32)
    alpha = a[..., 3:4] / 255
    return a[..., :3] * alpha + 255 * (1 - alpha)  # transparence → blanc


def path(soft, origin, scale, outline=False):
    """Masque doux (0..1) → tracé SVG (contours et trous, règle evenodd), repère normalisé.
    `outline` : contours extérieurs seulement (silhouette pleine, trous bouchés)."""
    big = cv2.resize(soft, None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
    mode = cv2.RETR_EXTERNAL if outline else cv2.RETR_CCOMP
    contours, _ = cv2.findContours((big >= 0.5).astype(np.uint8), mode, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in contours:
        if cv2.contourArea(c) < (UP * 1.5) ** 2:
            continue  # poussières
        pts = (cv2.approxPolyDP(c, EPS * UP, True).reshape(-1, 2) + 0.5) / UP
        pts = (pts - origin) * scale
        out.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z")
    return "".join(out).replace(".0 ", " ").replace(".0L", "L").replace(".0Z", "Z")


def green_of(a):
    g = np.clip(((a[..., 1] - a[..., 2]) - 20) / ((225 - 93) - 20), 0, 1)
    return g


def under_check(layer, green):
    """Le calque s'étend sous la coche là où il la touche : pas de liseré au bord de la coche."""
    near = cv2.dilate((layer > 0.5).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    under = cv2.dilate((green > 0.5).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    return np.maximum(layer, (near & under & (green > 0.05)).astype(np.float32))


def bbox(mask):
    ys, xs = np.where(mask)
    return np.array([xs.min(), ys.min()]), np.array([xs.max(), ys.max()])


def split_row(mask):
    """Rangée vide entre le symbole (en haut) et le mot (en bas)."""
    rows = mask.any(axis=1)
    ys = np.where(rows)[0]
    return next(y for y in range(ys.min() + 50, ys.max()) if not rows[y])


# ------------------------------------------------------------------ blanc sur bleu
a = rgb("certisen-logo-blanc-sur-bleu.png")
green = green_of(a)
white = np.clip((a[..., 2] - 110) / (248 - 110), 0, 1)  # canal bleu : fond 110, blanc 248, vert 93
white = under_check(white, green)
cut = split_row((white > 0.5) | (green > 0.5))
sym_w, sym_g = white.copy(), green.copy()
sym_w[cut:] = 0
sym_g[cut:] = 0
p0, p1 = bbox((sym_w > 0.5) | (sym_g > 0.5))
s = 100 / (p1[1] - p0[1] + 1)
SYMBOL = {
    "w": round((p1[0] - p0[0] + 1) * s, 2),
    "body": path(sym_w, p0, s),
    "check": path(sym_g, p0, s),
    "outline": path(np.maximum(sym_w, sym_g), p0, s, outline=True),
}
word = white.copy()
word[:cut] = 0
w0, w1 = bbox(word > 0.5)
ws = 100 / (w1[1] - w0[1] + 1)
WORDMARK = {"w": round((w1[0] - w0[0] + 1) * ws, 2), "d": path(word, w0, ws)}

# ------------------------------------------------------------------ bleu sur blanc
b = rgb("certisen-logo-bleu-sur-blanc.png")
green2 = green_of(b)
navy = np.clip((248 - b[..., 0]) / (248 - 16), 0, 1)  # canal rouge : blanc 248, bleu 16
navy = np.where(green2 > 0.2, 0, navy)  # (vert : R = 105)
navy = np.where(navy < 0.3, 0, navy)  # liseré clair du cadre de l'image, ignoré
navy = under_check(navy, green2)
cut2 = split_row((navy > 0.5) | (green2 > 0.5))
navy[cut2:] = 0
green2[cut2:] = 0
q0, q1 = bbox((navy > 0.5) | (green2 > 0.5))
s2 = 100 / (q1[1] - q0[1] + 1)
SYMBOL_BLUE = {"w": round((q1[0] - q0[0] + 1) * s2, 2), "body": path(navy, q0, s2), "check": path(green2, q0, s2)}

OUT.write_text(
    f'''/**
 * Logo officiel CertiSen (fourni par Lucas le 13/11/2026), vectorisé depuis assets/brand par
 * scripts/logo-trace.py — NE PAS MODIFIER À LA MAIN, relancer le script.
 * Repères : symboles de 100 unités de haut, mot de 100 unités de haut (règle de remplissage
 * « evenodd »). Module sans « use client » : utilisable côté serveur (image de partage) comme
 * côté client (logos, scènes 3D).
 */

/** Couleurs officielles : bleu CertiSen et vert de la coche. */
export const BRAND = {{ blue: "#102d6e", green: "#69e15d" }} as const;

/**
 * Symbole pour fond sombre : dessin blanc (bouclier, chronomètre) + coche verte.
 * `outline` : silhouette pleine (cadran bouché), fond de l'emblème 3D.
 */
export const SYMBOL = {{
  w: {SYMBOL["w"]},
  h: 100,
  body: "{SYMBOL["body"]}",
  check: "{SYMBOL["check"]}",
  outline: "{SYMBOL["outline"]}",
}} as const;

/** Symbole pour fond clair : dessin bleu (cadran plein) + coche verte. */
export const SYMBOL_BLUE = {{
  w: {SYMBOL_BLUE["w"]},
  h: 100,
  body: "{SYMBOL_BLUE["body"]}",
  check: "{SYMBOL_BLUE["check"]}",
}} as const;

/** Mot « CertiSen » (police du logo officiel). */
export const WORDMARK = {{
  w: {WORDMARK["w"]},
  h: 100,
  d: "{WORDMARK["d"]}",
}} as const;
''',
    encoding="utf-8",
)
print(f"{OUT.relative_to(ROOT)} : symbole {SYMBOL['w']}×100, symbole bleu {SYMBOL_BLUE['w']}×100, mot {WORDMARK['w']}×100")
