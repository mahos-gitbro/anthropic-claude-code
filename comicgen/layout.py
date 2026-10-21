"""Step 4: assemble lettered panels into one comic page."""

from __future__ import annotations

from PIL import Image, ImageDraw

from .lettering import INK, display_font

PAGE_W = 2100
GUTTER = 36
BORDER = 7
TITLE_H = 170
PAPER = (250, 246, 236)


def framed(img: Image.Image, w: int, h: int) -> Image.Image:
    img = img.resize((w, h), Image.LANCZOS)
    ImageDraw.Draw(img).rectangle([0, 0, w - 1, h - 1], outline=INK, width=BORDER)
    return img


def compose_page(title: str, panels: list[Image.Image]) -> Image.Image:
    """Two-column grid. With an odd count, the first panel runs full width as a splash."""
    col_w = (PAGE_W - 3 * GUTTER) // 2
    full_w = PAGE_W - 2 * GUTTER
    rows: list[list[Image.Image]] = []
    rest = panels
    if len(panels) % 2 == 1:
        rows.append([panels[0]])
        rest = panels[1:]
    rows += [rest[i:i + 2] for i in range(0, len(rest), 2)]

    def row_h(row):
        return int(col_w * 0.75) if len(row) == 2 else int(full_w * 0.5)

    page_h = TITLE_H + sum(row_h(r) + GUTTER for r in rows) + GUTTER
    page = Image.new("RGB", (PAGE_W, page_h), PAPER)
    d = ImageDraw.Draw(page)
    d.text((PAGE_W / 2, TITLE_H / 2 + 10), title.upper(), font=display_font(110), fill=(220, 40, 40),
           stroke_width=6, stroke_fill=INK, anchor="mm")

    y = TITLE_H
    for row in rows:
        h = row_h(row)
        if len(row) == 1:
            # Splash panel: crop to a wide strip instead of squashing.
            src = row[0]
            crop_h = int(src.width * h / full_w)
            top = max(0, (src.height - crop_h) // 3)
            page.paste(framed(src.crop((0, top, src.width, top + crop_h)), full_w, h), (GUTTER, y))
        else:
            for i, img in enumerate(row):
                page.paste(framed(img, col_w, h), (GUTTER + i * (col_w + GUTTER), y))
        y += h + GUTTER
    return page
