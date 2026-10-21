"""Comic print look: flat posterized color, inked edges, halftone dots in the shadows."""

from __future__ import annotations

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps


def halftone(img: Image.Image, cell: int = 9, darkest: float = 0.55, strength: float = 0.35) -> Image.Image:
    """Overlay black dots whose size follows how dark each cell is. Only shadows get dots."""
    gray = img.convert("L")
    small = gray.resize((max(1, img.width // cell), max(1, img.height // cell)), Image.BILINEAR)
    dots = Image.new("L", img.size, 255)
    d = ImageDraw.Draw(dots)
    for gy in range(small.height):
        for gx in range(small.width):
            darkness = 1 - small.getpixel((gx, gy)) / 255
            if darkness < 1 - darkest:
                continue
            r = cell * 0.5 * min(1.0, darkness) * 1.1
            cx = gx * cell + cell / 2 + (cell / 2 if gy % 2 else 0)
            cy = gy * cell + cell / 2
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=0)
    dots_rgb = Image.merge("RGB", [dots] * 3)
    return Image.blend(img, ImageChops.multiply(img, dots_rgb), strength)


def ink_lines(img: Image.Image, threshold: int = 40) -> Image.Image:
    """Find edges and darken them like inked outlines."""
    edges = img.convert("L").filter(ImageFilter.SMOOTH_MORE).filter(ImageFilter.FIND_EDGES)
    mask = edges.point(lambda v: 255 if v > threshold else 0).filter(ImageFilter.MaxFilter(3))
    return Image.composite(Image.new("RGB", img.size, (15, 15, 20)), img, mask)


def comicify(img: Image.Image, fx: str = "full") -> Image.Image:
    """fx: 'none', 'light' (halftone only, for art that is already flat and outlined) or 'full'."""
    if fx == "none":
        return img
    img = img.convert("RGB")
    if fx == "full":
        img = ImageOps.posterize(img.filter(ImageFilter.MedianFilter(5)), 3)
        img = ImageOps.autocontrast(img, cutoff=1)
        img = ink_lines(img)
    return halftone(img)
