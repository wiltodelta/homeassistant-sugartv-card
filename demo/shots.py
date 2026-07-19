#!/usr/bin/env python3
"""Regenerate the README figures.

Every image in the README comes from here, so a change to the card is
re-shot rather than re-cropped. Run `node demo/server.js` first, then:

    python3 demo/shots.py            # all figures
    python3 demo/shots.py age-tiers  # one, by name

The labels are why this is a script rather than a shell one-liner: they
carry markup and spaces, they must survive URL encoding, and a literal
comma in one would split the spec it belongs to.
"""

import subprocess
import sys
from urllib.parse import quote

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE = "http://localhost:3000/demo/shot.html"

TRENDS = [
    "rising_quickly",
    "rising",
    "rising_slightly",
    "steady",
    "falling_slightly",
    "falling",
    "falling_quickly",
]

LANGUAGES = [
    ("ru-RU", "Русский"),
    ("de-DE", "Deutsch"),
    ("ja-JP", "日本語"),
    ("fr-FR", "Français"),
]


def spec(shape, value, trend, **options):
    """One card. Options are encoded here so callers can pass plain text."""
    if "," in str(options.get("label", "")):
        raise ValueError("a label may not contain a comma: it splits the spec")
    tail = ";".join(f"{k}={quote(str(v), safe='')}" for k, v in options.items())
    return f"{shape}:{value}:{trend}" + (f":{tail}" if tail else "")


# Window sizes are the stage plus its 48px padding, and a captioned figure
# needs roughly 36px more height per row than the card itself.
FIGURES = {
    "layouts": (
        "964,396",
        "sugartv-card-layouts.png",
        [spec("560x200", 145, "rising"), spec("260x300", 145, "rising")],
    ),
    "zones": (
        "1152,216",
        "sugartv-card-zones.png",
        [
            spec("320x120", 52, "falling_quickly"),
            spec("320x120", 120, "rising_slightly"),
            spec("320x120", 210, "rising"),
        ],
    ),
    "age-tiers": (
        "1212,290",
        "sugartv-card-age-tiers.png",
        [
            spec(
                "340x130",
                145,
                "rising",
                age=2,
                dim=1,
                pred=0,
                label="<b>Current</b><br>the time steps back",
            ),
            spec(
                "340x130",
                145,
                "rising",
                age=8,
                dim=1,
                pred=0,
                label="<b>A poll missed</b><br>the time comes up",
            ),
            spec(
                "340x130",
                145,
                "rising",
                age=20,
                dim=1,
                pred=0,
                label="<b>Three missed</b><br>the whole card fades",
            ),
        ],
    ),
    "relative-time": (
        "824,290",
        "sugartv-card-relative-time.png",
        [
            spec(
                "340x130",
                145,
                "rising",
                age=7,
                pred=0,
                label="<b>Default</b><br>the clock",
            ),
            spec(
                "340x130",
                145,
                "rising",
                age=7,
                rel=1,
                pred=0,
                label="<b>relative_time</b><br>the reading's age",
            ),
        ],
    ),
    "trends": (
        "1120,420",
        "sugartv-card-trends.png",
        [
            spec("220x104", 145, trend, pred=0, label=f"<b>{trend}</b>")
            for trend in TRENDS
        ],
    ),
    "languages": (
        "1280,260",
        "sugartv-card-languages.png",
        [
            spec(
                "260x110",
                145,
                "rising",
                age=7,
                rel=1,
                pred=0,
                loc=code,
                label=f"<b>{name}</b>",
            )
            for code, name in LANGUAGES
        ],
    ),
}


def shoot(name):
    window, out, specs = FIGURES[name]
    url = f"{BASE}?specs=" + ",".join(specs)
    subprocess.run(
        [
            CHROME,
            "--headless",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-device-scale-factor=2",
            "--virtual-time-budget=8000",
            f"--window-size={window}",
            f"--screenshot={out}",
            url,
        ],
        check=True,
        capture_output=True,
    )
    print(f"{out}  ({window})")


if __name__ == "__main__":
    wanted = sys.argv[1:] or list(FIGURES)
    unknown = [name for name in wanted if name not in FIGURES]
    if unknown:
        sys.exit(f"unknown figure(s): {', '.join(unknown)}")
    for name in wanted:
        shoot(name)
