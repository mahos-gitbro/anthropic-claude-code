import json
from pathlib import Path
from types import SimpleNamespace

import pytest
from PIL import Image

from comicgen import cli
from comicgen.artists import PANEL_H, PANEL_W, ClaudeSVGArtist, extract_svg
from comicgen.effects import comicify
from comicgen.layout import compose_page
from comicgen.lettering import letter_panel
from comicgen.script import ComicScript, RefusedError, write_script

EXAMPLE = Path(__file__).parent.parent / "examples" / "lighthouse_script.json"
SVG = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {PANEL_W} {PANEL_H}"><rect width="100%" height="100%" fill="#3366cc"/><circle cx="500" cy="400" r="120" fill="#ffcc00" stroke="#000" stroke-width="6"/></svg>'


def example_script() -> ComicScript:
    return ComicScript.model_validate_json(EXAMPLE.read_text())


class FakeStream:
    def __init__(self, message):
        self.message = message

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    def get_final_message(self):
        return self.message


class FakeClient:
    def __init__(self, parse_result=None, svg_reply=SVG, stop_reason="end_turn"):
        self.calls = []
        msg = SimpleNamespace(stop_reason=stop_reason,
                              content=[SimpleNamespace(type="text", text=f"Here you go:\n```svg\n{svg_reply}\n```")])

        def parse(**kw):
            self.calls.append(("parse", kw))
            return parse_result

        def stream(**kw):
            self.calls.append(("stream", kw))
            return FakeStream(msg)

        self.beta = SimpleNamespace(messages=SimpleNamespace(parse=parse, stream=stream))


def test_write_script_returns_parsed_script():
    script = example_script()
    client = FakeClient(parse_result=SimpleNamespace(stop_reason="end_turn", parsed_output=script))
    assert write_script("a story", 6, client=client) is script
    kw = client.calls[0][1]
    assert kw["output_format"] is ComicScript
    assert "exactly 6 panels" in kw["messages"][0]["content"]


def test_write_script_raises_on_refusal():
    client = FakeClient(parse_result=SimpleNamespace(stop_reason="refusal", parsed_output=None))
    with pytest.raises(RefusedError):
        write_script("a story", client=client)


def test_claude_artist_draws_every_panel_and_shares_panel_one_as_reference():
    script = example_script()
    client = FakeClient()
    images = ClaudeSVGArtist(client=client).draw_all(script)
    assert len(images) == len(script.panels)
    assert all(img.size == (PANEL_W, PANEL_H) for img in images)
    assert images[0].getpixel((10, 10)) == (0x33, 0x66, 0xCC)
    later_prompt = client.calls[1][1]["messages"][0]["content"]
    assert any("for reference" in block["text"] for block in later_prompt)


def test_extract_svg_strips_external_content():
    reply = '<svg><script>alert(1)</script><image href="http://x/y.png"/><rect/></svg>'
    svg = extract_svg(reply)
    assert "script" not in svg and "<image" not in svg and "<rect/>" in svg


def test_extract_svg_requires_svg():
    with pytest.raises(ValueError):
        extract_svg("sorry, no drawing")


@pytest.mark.parametrize("fx", ["none", "light", "full"])
def test_comicify_keeps_size(fx):
    img = Image.new("RGB", (200, 150), (90, 120, 200))
    assert comicify(img, fx).size == (200, 150)


def test_lettering_draws_on_panel():
    panel = example_script().panels[1]
    blank = Image.new("RGB", (PANEL_W, PANEL_H), (0, 0, 0))
    lettered = letter_panel(blank, panel)
    # Balloons are white, so the black canvas must now contain white pixels.
    assert (255, 255, 255) in {c for _, c in lettered.getcolors(1 << 20)}


def test_odd_panel_count_gets_splash_row():
    panels = [Image.new("RGB", (PANEL_W, PANEL_H)) for _ in range(5)]
    page = compose_page("Test", panels)
    assert page.width == 2100 and page.height > 1500


def test_cli_end_to_end_with_placeholder_art(tmp_path, capsys):
    assert cli.main(["--script", str(EXAMPLE), "--art", "placeholder", "-o", str(tmp_path)]) == 0
    result = json.loads(capsys.readouterr().out)
    assert Path(result["page"]).exists()
    assert len(list(tmp_path.glob("panel_*.png"))) == 6
