#!/usr/bin/env python3
"""
Resize a source PNG to all icon sizes found in a target directory.

Usage:
    python resize_icons.py <source.png> <target_dir>

Example:
    python resize_icons.py "D:/PROJECT/CCN2/ART/Icon_CCN2_pt.png" \
        "D:/PROJECT/CCN2/clientccn2/build/live/vn/ios/icons"

Rules:
- Target files must be named {size}.png (e.g. 1024.png, 120.png)
- Resizes recursively through all subdirectories
- Strips alpha channel (iOS requires RGB, no transparency)
- Uses LANCZOS for best downscale quality
"""

import sys
from pathlib import Path
from PIL import Image


def main():
    if len(sys.argv) != 3:
        print("Usage: python resize_icons.py <source.png> <target_dir>")
        sys.exit(1)

    src_path = Path(sys.argv[1])
    target_dir = Path(sys.argv[2])

    if not src_path.exists():
        print(f"Error: source file not found: {src_path}")
        sys.exit(1)

    if not target_dir.exists():
        print(f"Error: target directory not found: {target_dir}")
        sys.exit(1)

    src = Image.open(src_path)
    print(f"Source: {src_path.name}  {src.size}  {src.mode}")

    targets = sorted(
        [p for p in target_dir.rglob("*.png") if p.stem.isdigit()],
        key=lambda p: int(p.stem)
    )

    if not targets:
        print("No numeric-named PNG files found in target directory.")
        sys.exit(1)

    for tgt in targets:
        size = int(tgt.stem)
        resized = src.resize((size, size), Image.LANCZOS)
        # Strip alpha: composite onto white background
        # iOS clips rounded corners so white corners are never visible in app
        if resized.mode == "RGBA":
            bg = Image.new("RGB", resized.size, (255, 255, 255))
            bg.paste(resized, mask=resized.split()[3])
            resized = bg
        resized.save(str(tgt), "PNG")
        print(f"  {tgt.relative_to(target_dir)}  ({size}px)  {resized.mode}")

    print(f"\nDone. {len(targets)} icons updated.")


if __name__ == "__main__":
    main()
