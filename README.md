# comicgen

Prototype: give it a story, get back comic book still images. One PNG per panel plus a finished comic page.

## How it works

1. **Script.** Claude reads the story and writes a comic script: title, art direction, a fixed look for each character, and N panels (scene, camera shot, caption, dialogue, sound effect).
2. **Art.** Each panel gets drawn with no text in it. Pick the artist:
   - `claude` (default): Claude draws each panel as SVG. Only needs an Anthropic key. Panel 1 is drawn first and passed to the others as a reference so characters stay consistent.
   - `openai`: an image model paints each panel. Richer art. Needs `OPENAI_API_KEY` and `pip install '.[openai]'`.
   - `placeholder`: simple shapes, no API calls. For testing pacing and lettering for free.
3. **Comic look.** Halftone dots in the shadows; with `--fx full`, also posterized color and inked edges (best for painted art).
4. **Lettering.** Caption boxes, speech balloons with tails pointing at the speaker, thought clouds, jagged shout bursts, and big sound effects. Done in code, so the text is always spelled right.
5. **Page.** Panels go into a two-column page with a title. An odd panel count makes panel 1 a full-width splash.

## Setup

```bash
pip install -e .
export ANTHROPIC_API_KEY=...        # or `ant auth login`
```

## Use

```bash
# Story file to comic
comicgen examples/lighthouse.txt -n 6 -o out/

# Paste a story
echo "A cat steals the moon..." | comicgen - -n 4

# Edit out/script.json by hand, then redraw without rewriting the script
comicgen --script out/script.json -o out2/

# Free dry run with stand-in art
comicgen --script examples/lighthouse_script.json --art placeholder
```

Output folder: `script.json`, `panel_01.png ... panel_NN.png`, `page.png`.

## Costs and limits

- Claude SVG art reads as clean flat cartoon, not painted illustration. For a painted look use `--art openai`.
- Character consistency is decent, not perfect. The fixed character sheet and the panel 1 reference do most of the work.
- Balloon placement is automatic and simple (top of the panel, over the speaker's left/center/right spot). Edit `script.json` positions to adjust.
- Claude calls use `claude-opus-5-5` with server-side refusal fallback turned on.

## Tests

```bash
pip install -e '.[dev]'
pytest
```

Tests run offline. The Claude steps are covered with a fake client.

Fonts: Bangers and Comic Neue, both SIL Open Font License (see `comicgen/fonts/`).
