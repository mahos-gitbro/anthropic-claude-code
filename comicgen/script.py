"""Step 1: turn a prose story into a panel-by-panel comic script with Claude."""

from __future__ import annotations

from typing import Literal

import anthropic
from pydantic import BaseModel, Field

MODEL = "claude-opus-5-5"
FALLBACK_BETA = "server-side-fallback-2026-07-01"


class Character(BaseModel):
    name: str
    look: str = Field(description="Fixed visual description: age, build, hair, face, outfit, colors. Reused in every panel.")


class Line(BaseModel):
    speaker: str
    text: str = Field(description="Short. Comic dialogue, 15 words or fewer.")
    kind: Literal["speech", "thought", "shout"] = "speech"
    position: Literal["left", "center", "right"] = Field(description="Where the speaker stands in the panel.")


class Panel(BaseModel):
    scene: str = Field(description="What the artist draws: setting, who is where (left/center/right), action, expressions, lighting.")
    shot: Literal["wide", "medium", "close-up", "low-angle", "high-angle"]
    caption: str | None = Field(default=None, description="Narration box text, or null.")
    dialogue: list[Line] = Field(default_factory=list, description="At most 3 lines.")
    sfx: str | None = Field(default=None, description="Sound effect like 'KRAK!' or null.")


class ComicScript(BaseModel):
    title: str
    style: str = Field(description="One art direction for the whole comic: era, palette, mood.")
    characters: list[Character]
    panels: list[Panel]


SYSTEM = """You are a comic book writer and storyboard artist.
Adapt the user's story into a single comic page.

Rules:
- Pick the moments that carry the story. Show, do not narrate what the art already shows.
- Every character gets one fixed look so the artist draws them the same in every panel.
- In each panel's scene, say where each speaking character stands (left, center, right) and match it in the dialogue position.
- Keep dialogue short and punchy. Captions only where needed for time or place.
- Vary shots: open wide to set the scene, go close for emotion.
- Do not put any lettering inside the scene description; text is added later."""


class RefusedError(RuntimeError):
    pass


def write_script(story: str, panels: int = 6, client: anthropic.Anthropic | None = None) -> ComicScript:
    client = client or anthropic.Anthropic()
    response = client.beta.messages.parse(
        model=MODEL,
        max_tokens=16000,
        system=SYSTEM,
        output_config={"effort": "medium"},
        output_format=ComicScript,
        betas=[FALLBACK_BETA],
        fallbacks="default",
        messages=[{
            "role": "user",
            "content": f"Make exactly {panels} panels from this story.\n\n<story>\n{story}\n</story>",
        }],
    )
    if response.stop_reason == "refusal":
        raise RefusedError("Claude declined to adapt this story.")
    if response.stop_reason == "max_tokens":
        raise RuntimeError("Script was cut off. Try fewer panels or a shorter story.")
    return response.parsed_output
