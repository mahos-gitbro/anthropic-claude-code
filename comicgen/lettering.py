"""Step 3: letter each panel with captions, speech/thought/shout balloons and sound effects."""

from __future__ import annotations

import math
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .script import Line, Panel

FONTS = Path(__file__).parent / "fonts"
INK = (15, 15, 20)
CAPTION_FILL = (255, 228, 120)
MARGIN = 24


@lru_cache
def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def dialogue_font(size: int = 34) -> ImageFont.FreeTypeFont:
    return font("ComicNeue-Bold.ttf", size)


def display_font(size: int) -> ImageFont.FreeTypeFont:
    return font("Bangers-Regular.ttf", size)


def wrap(text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    for word in text.split():
        if lines and fnt.getlength(f"{lines[-1]} {word}") <= max_width:
            lines[-1] += f" {word}"
        else:
            lines.append(word)
    return lines or [""]


def text_block(text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> tuple[list[str], int, int, int]:
    lines = wrap(text, fnt, max_width)
    line_h = int(fnt.size * 1.15)
    width = int(max(fnt.getlength(line) for line in lines))
    return lines, width, line_h * len(lines), line_h


def draw_lines(d: ImageDraw.ImageDraw, lines: list[str], fnt, cx: float, top: float, line_h: int) -> None:
    for i, line in enumerate(lines):
        d.text((cx, top + i * line_h), line, font=fnt, fill=INK, anchor="ma")


def overlaps(box, placed, pad: int = 10) -> bool:
    x0, y0, x1, y1 = box
    return any(not (x1 + pad < a0 or x0 - pad > a1 or y1 + pad < b0 or y0 - pad > b1) for a0, b0, a1, b1 in placed)


def place(w: int, h: int, target_x: float, img_w: int, img_h: int, placed: list, start_y: int = MARGIN):
    """Find a free spot near the top, centered over the speaker if possible."""
    for y in range(start_y, img_h - h - MARGIN, 12):
        for shift in (0, -1, 1, -2, 2, -3, 3):
            x = int(target_x - w / 2 + shift * w * 0.35)
            x = max(MARGIN, min(img_w - w - MARGIN, x))
            box = (x, y, x + w, y + h)
            if not overlaps(box, placed):
                return box
    x = max(MARGIN, min(img_w - w - MARGIN, int(target_x - w / 2)))
    return (x, start_y, x + w, start_y + h)


def draw_caption(img: Image.Image, text: str, placed: list) -> None:
    d = ImageDraw.Draw(img)
    fnt = display_font(36)
    lines, tw, th, lh = text_block(text.upper(), fnt, int(img.width * 0.5))
    pad = 14
    box = (MARGIN - 8, MARGIN - 8, MARGIN - 8 + tw + 2 * pad, MARGIN - 8 + th + 2 * pad)
    d.rectangle(box, fill=CAPTION_FILL, outline=INK, width=4)
    draw_lines(d, lines, fnt, (box[0] + box[2]) / 2, box[1] + pad, lh)
    placed.append(box)


def balloon_shape(box, kind: str) -> list[tuple[float, float]]:
    """Points around a balloon. Shouts get a jagged burst, others a smooth oval."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    rx, ry = (x1 - x0) / 2, (y1 - y0) / 2
    n = 28 if kind == "shout" else 72
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        k = 1.18 if kind == "shout" and i % 2 == 0 else 1.0
        pts.append((cx + rx * k * math.cos(a), cy + ry * k * math.sin(a)))
    return pts


def draw_balloon(img: Image.Image, line: Line, placed: list, start_y: int) -> None:
    d = ImageDraw.Draw(img)
    fnt = dialogue_font(40 if line.kind == "shout" else 34)
    text = line.text.upper()
    lines, tw, th, lh = text_block(text, fnt, int(img.width * 0.34))
    # An oval needs extra room around the text to contain it.
    w, h = int(tw * 1.42 + 40), int(th * 1.42 + 34)
    target_x = img.width * {"left": 0.22, "center": 0.5, "right": 0.78}[line.position]
    box = place(w, h, target_x, img.width, img.height, placed, start_y)
    placed.append(box)
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2

    # Tail toward the speaker, who stands below the balloon.
    tip = (target_x, min(img.height - MARGIN, y1 + 90))
    base_l, base_r = (cx - w * 0.12, cy + h * 0.42), (cx + w * 0.12, cy + h * 0.42)
    if line.kind == "thought":
        for i, r in enumerate((14, 10, 7)):
            t = 0.35 + 0.25 * i
            px, py = cx + (tip[0] - cx) * t, y1 + (tip[1] - y1) * t
            d.ellipse([px - r, py - r, px + r, py + r], fill="white", outline=INK, width=4)
    else:
        d.polygon([base_l, base_r, tip], fill="white", outline=INK, width=4)

    shape = balloon_shape(box, line.kind)
    d.polygon(shape, fill="white", outline=INK, width=5)
    if line.kind != "thought":
        # Repaint the tail's join so the outline does not cut across it.
        d.polygon([(base_l[0] + 5, base_l[1]), (base_r[0] - 5, base_r[1]), (tip[0], tip[1] - 12)], fill="white")
    else:
        # Scallops make it read as a thought cloud.
        for px, py in shape[::6]:
            d.ellipse([px - 16, py - 16, px + 16, py + 16], fill="white", outline=INK, width=4)
        d.polygon(balloon_shape((x0 + 6, y0 + 6, x1 - 6, y1 - 6), "speech"), fill="white")
    draw_lines(d, lines, fnt, cx, cy - th / 2, lh)


def draw_sfx(img: Image.Image, text: str, placed: list) -> None:
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    fnt = display_font(120)
    x, y = img.width * 0.68, img.height * 0.62
    d.text((x, y), text.upper(), font=fnt, fill=(255, 210, 40), stroke_width=7, stroke_fill=INK, anchor="mm")
    layer = layer.rotate(-12, center=(x, y), resample=Image.BICUBIC)
    img.paste(layer, (0, 0), layer)


def letter_panel(img: Image.Image, panel: Panel) -> Image.Image:
    img = img.copy()
    placed: list = []
    if panel.sfx:
        draw_sfx(img, panel.sfx, placed)
    if panel.caption:
        draw_caption(img, panel.caption, placed)
    for line in panel.dialogue:
        draw_balloon(img, line, placed, MARGIN)
    return img
