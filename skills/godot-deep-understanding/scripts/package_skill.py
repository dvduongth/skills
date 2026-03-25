#!/usr/bin/env python3
"""
Package skill into .skill file for distribution
"""

import io
import os
import sys
import tarfile
import json
from pathlib import Path

def package_skill(skill_dir: str) -> str:
    """
    Package a skill directory into a .skill file.

    Skill directory structure:
    skill-name/
      SKILL.md (required)
      src/ (optional)
      tests/ (optional)
      references/ (optional)
      scripts/ (optional)
      assets/ (optional)

    Output: skill-name.skill (tarball with metadata)
    """
    skill_path = Path(skill_dir).resolve()
    if not skill_path.exists():
        raise FileNotFoundError(f"Skill directory not found: {skill_dir}")

    skill_name = skill_path.name

    # Read SKILL.md for metadata
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        raise FileNotFoundError(f"SKILL.md required in {skill_dir}")

    # Parse YAML frontmatter (simple version)
    metadata = {
        "name": skill_name,
        "version": "1.0.0",
        "description": "",
    }

    with open(skill_md, "r", encoding="utf-8") as f:
        content = f.read()
        if content.startswith("---"):
            # Simple frontmatter parsing
            parts = content.split("---", 2)
            if len(parts) >= 3:
                frontmatter = parts[1]
                for line in frontmatter.strip().split("\n"):
                    if ":" in line:
                        key, val = line.split(":", 1)
                        metadata[key.strip()] = val.strip().strip('"').strip("'")
                # Rest is body
        else:
            # No frontmatter, first line might be name: description
            first_line = content.split("\n", 1)[0]
            if " - " in first_line:
                name, desc = first_line.split(" - ", 1)
                metadata["name"] = name.strip()
                metadata["description"] = desc.strip()

    # Create .skill file (tar.gz)
    output_path = skill_path.parent / f"{skill_name}.skill"
    print(f"Packaging {skill_name} → {output_path}")

    with tarfile.open(output_path, "w:gz") as tar:
        # Add all files in skill directory
        for file_path in skill_path.rglob("*"):
            if file_path.is_file():
                # Arcname: relative to skill directory
                arcname = file_path.relative_to(skill_path)
                tar.add(file_path, arcname=arcname)

        # Add metadata.json at root of tarball
        metadata_json = json.dumps(metadata, indent=2).encode("utf-8")
        tarinfo = tarfile.TarInfo("metadata.json")
        tarinfo.size = len(metadata_json)
        tar.addfile(tarinfo, fileobj=io.BytesIO(metadata_json))

    print(f"✅ Packaged successfully: {output_path}")
    print(f"   Size: {output_path.stat().st_size / 1024:.1f} KB")

    return str(output_path)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: package_skill.py <skill-directory>")
        sys.exit(1)

    skill_dir = sys.argv[1]
    try:
        output = package_skill(skill_dir)
        print(output)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)