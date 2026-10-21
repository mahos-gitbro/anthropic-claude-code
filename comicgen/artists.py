"""Step 2: draw the art for each panel. No lettering here; that comes later.

Backends:
- claude:      Claude draws each panel as SVG. Needs only an Anthropic key.
- openai:      An image model paints each panel. Richer art, needs OPENAI_API_KEY.
- placeholder: Offline stand-in art for testing the layout with no API calls.
"""

from __future__ import annotations

import base64
import io
import random
import re
from concurrent.futures import ThreadPoolExecutor

import anthropic
import resvg_py
from PIL import Image, ImageDraw

from .script import FALLBACK_BETA, MODEL, ComicScript, Panel, RefusedError

PANEL_W, PANEL_H = 1024, 768


def character_sheet(script: ComicScript) -> str:
    return "\n".join(f"- {c.name}: {c.look}" for c in script.characters)


class ClaudeSVGArtist:
    name = "claude"
    default_fx = "light"

    SYSTEM = f"""You are a comic book illustrator who draws in SVG.

Output one complete SVG and nothing else, inside a ```svg code block.
- Root element: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {PANEL_W} {PANEL_H}" width="{PANEL_W}" height="{PANEL_H}">.
- Fill the whole canvas: background, midground, foreground. No empty white areas.
- Comic style: bold black outlines (stroke-width 4 to 8), flat colors, one shadow tone per color, dramatic composition.
- Draw people with real anatomy: head, torso, arms, legs, hands, readable facial expressions.
- Leave the top 20% of the canvas visually calm (sky, wall, shadow) so speech bubbles can sit there.
- Never draw text, letters, speech bubbles or captions.
- No <image>, <foreignObject>, scripts or external references."""

    def __init__(self, client: anthropic.Anthropic | None = None, effort: str = "medium"):
        self.client = client or anthropic.Anthropic()
        self.effort = effort

    def _brief(self, script: ComicScript) -> str:
        return (
            f"Comic: {script.title}\nArt direction: {script.style}\n\n"
            f"Character sheet (draw them exactly like this every time):\n{character_sheet(script)}"
        )

    def _draw(self, script: ComicScript, panel: Panel, reference_svg: str | None) -> tuple[Image.Image, str]:
        content = [{"type": "text", "text": self._brief(script)}]
        if reference_svg:
            content.append({
                "type": "text",
                "text": "Panel 1 of this comic, for reference. Match its character designs, palette and line weight:\n"
                        f"```svg\n{reference_svg}\n```",
            })
        content.append({
            "type": "text",
            "text": f"Draw this panel.\nShot: {panel.shot}\nScene: {panel.scene}",
        })
        with self.client.beta.messages.stream(
            model=MODEL,
            max_tokens=64000,
            system=self.SYSTEM,
            output_config={"effort": self.effort},
            betas=[FALLBACK_BETA],
            fallbacks="default",
            cache_control={"type": "ephemeral"},
            messages=[{"role": "user", "content": content}],
        ) as stream:
            message = stream.get_final_message()
        if message.stop_reason == "refusal":
            raise RefusedError("Claude declined to draw a panel.")
        text = "".join(b.text for b in message.content if b.type == "text")
        svg = extract_svg(text)
        return svg_to_image(svg), svg

    def draw_all(self, script: ComicScript, workers: int = 4) -> list[Image.Image]:
        # Panel 1 first so the rest can copy its character designs.
        first, reference = self._draw(script, script.panels[0], None)
        with ThreadPoolExecutor(max_workers=workers) as pool:
            rest = list(pool.map(lambda p: self._draw(script, p, reference)[0], script.panels[1:]))
        return [first, *rest]


def extract_svg(text: str) -> str:
    match = re.search(r"<svg\b.*?</svg>", text, re.DOTALL)
    if not match:
        raise ValueError("No SVG found in Claude's reply.")
    svg = match.group(0)
    # Strip anything that could reach outside the file.
    svg = re.sub(r"<(script|foreignObject|image)\b.*?(</\1>|/>)", "", svg, flags=re.DOTALL | re.IGNORECASE)
    return svg


def svg_to_image(svg: str) -> Image.Image:
    png = resvg_py.svg_to_bytes(svg_string=svg, width=PANEL_W, height=PANEL_H, background="#ffffff")
    return Image.open(io.BytesIO(bytes(png))).convert("RGB")


class OpenAIArtist:
    name = "openai"
    default_fx = "full"

    def __init__(self, model: str = "gpt-image-1"):
        try:
            from openai import OpenAI
        except ImportError as e:
            raise SystemExit("The openai backend needs: pip install openai") from e
        self.client = OpenAI()
        self.model = model

    def _draw(self, script: ComicScript, panel: Panel) -> Image.Image:
        prompt = (
            f"Comic book panel illustration. {script.style}. Bold ink outlines, flat cel shading.\n"
            f"Characters (keep consistent):\n{character_sheet(script)}\n\n"
            f"Shot: {panel.shot}. Scene: {panel.scene}\n"
            "Keep the top fifth of the image simple for speech bubbles. No text, no letters, no speech bubbles."
        )
        result = self.client.images.generate(model=self.model, prompt=prompt, size="1536x1024")
        img = Image.open(io.BytesIO(base64.b64decode(result.data[0].b64_json))).convert("RGB")
        return img.resize((PANEL_W, PANEL_H), Image.LANCZOS)

    def draw_all(self, script: ComicScript, workers: int = 4) -> list[Image.Image]:
        with ThreadPoolExecutor(max_workers=workers) as pool:
            return list(pool.map(lambda p: self._draw(script, p), script.panels))


class PlaceholderArtist:
    """Simple shapes so you can check pacing and lettering without spending on API calls."""

    name = "placeholder"
    default_fx = "light"

    def draw_all(self, script: ComicScript, workers: int = 1) -> list[Image.Image]:
        return [self._draw(script, p, i) for i, p in enumerate(script.panels)]

    def _draw(self, script: ComicScript, panel: Panel, index: int) -> Image.Image:
        rnd = random.Random(index)
        img = Image.new("RGB", (PANEL_W, PANEL_H))
        d = ImageDraw.Draw(img)
        top, bottom = rnd.choice([((70, 110, 190), (240, 170, 90)), ((30, 30, 70), (120, 60, 120)), ((120, 190, 230), (230, 240, 250))])
        for y in range(PANEL_H):
            t = y / PANEL_H
            d.line([(0, y), (PANEL_W, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bottom)))
        horizon = int(PANEL_H * 0.72)
        d.rectangle([0, horizon, PANEL_W, PANEL_H], fill=(70, 60, 50), outline="black", width=6)
        for _ in range(4):
            x = rnd.randint(0, PANEL_W - 160)
            h = rnd.randint(120, 300)
            d.rectangle([x, horizon - h, x + 140, horizon], fill=(50, 50, 60), outline="black", width=5)
        scale = {"close-up": 2.2, "medium": 1.4}.get(panel.shot, 1.0)
        speakers = {line.speaker: line.position for line in panel.dialogue}
        names = [c.name for c in script.characters if c.name in speakers] or [c.name for c in script.characters[:1]]
        xs = {"left": 0.22, "center": 0.5, "right": 0.78}
        for n, name in enumerate(names):
            cx = int(PANEL_W * xs[speakers.get(name, ["left", "right", "center"][n % 3])])
            color = [(200, 40, 40), (40, 90, 200), (60, 160, 70), (220, 180, 30)][sum(map(ord, name)) % 4]
            r = int(40 * scale)
            body_top = horizon - int(170 * scale)
            d.ellipse([cx - r, body_top - 2 * r, cx + r, body_top], fill=(240, 200, 160), outline="black", width=6)
            d.rounded_rectangle([cx - int(55 * scale), body_top, cx + int(55 * scale), horizon], radius=20, fill=color, outline="black", width=6)
        return img


def get_artist(name: str) -> ClaudeSVGArtist | OpenAIArtist | PlaceholderArtist:
    return {"claude": ClaudeSVGArtist, "openai": OpenAIArtist, "placeholder": PlaceholderArtist}[name]()
