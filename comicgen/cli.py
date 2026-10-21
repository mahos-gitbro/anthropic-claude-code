"""Command line entry point: story in, comic panels and a comic page out."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .artists import get_artist
from .effects import comicify
from .layout import compose_page
from .lettering import letter_panel
from .script import ComicScript, write_script


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="comicgen", description="Turn a story into comic book images.")
    p.add_argument("story", nargs="?", help="Path to a story text file, or '-' for stdin.")
    p.add_argument("-o", "--out", default="comic_out", help="Output folder (default: comic_out)")
    p.add_argument("-n", "--panels", type=int, default=6, help="Number of panels (default: 6)")
    p.add_argument("--art", choices=["claude", "openai", "placeholder"], default="claude",
                   help="Who draws the panels (default: claude)")
    p.add_argument("--fx", choices=["none", "light", "full"], help="Comic print effect strength")
    p.add_argument("--script", help="Reuse a saved script.json and skip the writing step")
    args = p.parse_args(argv)

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    if args.script:
        script = ComicScript.model_validate_json(Path(args.script).read_text())
    elif args.story:
        story = sys.stdin.read() if args.story == "-" else Path(args.story).read_text()
        print(f"Writing a {args.panels}-panel script...", file=sys.stderr)
        script = write_script(story, args.panels)
        (out / "script.json").write_text(script.model_dump_json(indent=2))
    else:
        p.error("give a story file or --script")

    print(f"'{script.title}': {len(script.panels)} panels. Drawing with {args.art}...", file=sys.stderr)
    artist = get_artist(args.art)
    art = artist.draw_all(script)
    fx = args.fx or artist.default_fx

    finished = []
    for i, (img, panel) in enumerate(zip(art, script.panels), start=1):
        final = letter_panel(comicify(img, fx), panel)
        final.save(out / f"panel_{i:02d}.png")
        finished.append(final)

    compose_page(script.title, finished).save(out / "page.png")
    print(json.dumps({"page": str(out / "page.png"), "panels": len(finished)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
