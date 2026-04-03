#!/usr/bin/env python3
"""
mermaid_to_image.py — Convert Mermaid diagrams in .md files to PNG/SVG.

Requires: @mermaid-js/mermaid-cli  (npm install -g @mermaid-js/mermaid-cli)
          → provides `mmdc` CLI command

Usage:
  python mermaid_to_image.py <file.md>                   # convert all diagrams → PNG
  python mermaid_to_image.py <file.md> --format svg      # convert to SVG
  python mermaid_to_image.py <file.md> --out ./output/   # custom output dir
  python mermaid_to_image.py <dir/>                      # convert all .md in dir
  python mermaid_to_image.py <file.md> --dry-run         # show what would be generated

Output naming: <out_dir>/<md_stem>_<index>_<type>_<title_slug>.png

Examples:
  python mermaid_to_image.py doc/assets/003_combo-flow.md
  → doc/assets/diagrams/003_combo-flow_1_flowchart_element-queue.png

  python mermaid_to_image.py doc/ --format svg --out exports/
  → exports/<file>_<n>_<type>_<title>.svg
"""

import re
import sys
import os
import subprocess
import shutil
import tempfile
from pathlib import Path
from dataclasses import dataclass


# ─── Config ──────────────────────────────────────────────────────────────────

DEFAULT_FORMAT  = 'png'
DEFAULT_SUBDIR  = 'diagrams'
MMDC_THEME_ARGS = ['--backgroundColor', 'transparent']

# mmdc config for custom theme (matches skill theme block)
MMDC_CONFIG = {
    "theme": "base",
    "themeVariables": {
        "primaryColor":       "#1e3a5f",
        "primaryTextColor":   "#ffffff",
        "primaryBorderColor": "#0d2137",
        "lineColor":          "#4a90d9",
        "secondaryColor":     "#2e5f8a",
        "tertiaryColor":      "#0a1f33",
        "background":         "#0a1f33",
        "nodeBorder":         "#4a90d9",
        "clusterBkg":         "#0d2b44",
        "titleColor":         "#e8f4fd",
        "edgeLabelBackground":"#0d2b44",
        "fontFamily":         "Segoe UI, Arial, sans-serif",
        "fontSize":           "14px"
    }
}


# ─── Data ────────────────────────────────────────────────────────────────────

@dataclass
class DiagramJob:
    index: int
    title: str
    diagram_type: str
    content: str
    source_file: str
    out_path: str      # final output file path


# ─── Extract ─────────────────────────────────────────────────────────────────

MERMAID_BLOCK  = re.compile(r'```mermaid\n(.*?)```', re.DOTALL)
TITLE_COMMENT  = re.compile(r'%%\s*[─-]+\s*(.+?)\s*[─-]*\s*%%?$', re.MULTILINE)
TYPE_DETECT    = re.compile(r'^\s*(flowchart|sequenceDiagram|classDiagram|stateDiagram-v2|erDiagram|gantt)', re.MULTILINE)
SLUG_RE        = re.compile(r'[^a-z0-9]+')


def slugify(text: str) -> str:
    return SLUG_RE.sub('-', text.lower().strip()).strip('-')[:40]


def extract_jobs(md_path: str, out_dir: str, fmt: str) -> list[DiagramJob]:
    text    = Path(md_path).read_text(encoding='utf-8')
    md_stem = Path(md_path).stem
    jobs    = []

    for i, match in enumerate(MERMAID_BLOCK.finditer(text), start=1):
        content = match.group(1)

        type_match    = TYPE_DETECT.search(content)
        diagram_type  = type_match.group(1) if type_match else 'diagram'

        title_match = TITLE_COMMENT.search(content)
        title       = title_match.group(1).strip() if title_match else f'diagram-{i}'
        title_slug  = slugify(title)

        filename = f'{md_stem}_{i}_{diagram_type}_{title_slug}.{fmt}'
        out_path = str(Path(out_dir) / filename)

        jobs.append(DiagramJob(
            index=i,
            title=title,
            diagram_type=diagram_type,
            content=content.strip(),
            source_file=md_path,
            out_path=out_path,
        ))

    return jobs


# ─── Convert ─────────────────────────────────────────────────────────────────

def check_mmdc() -> bool:
    return shutil.which('mmdc') is not None


def write_mmdc_config(tmp_dir: str) -> str:
    import json
    cfg_path = os.path.join(tmp_dir, 'mmdc-config.json')
    with open(cfg_path, 'w') as f:
        json.dump(MMDC_CONFIG, f)
    return cfg_path


def convert_job(job: DiagramJob, cfg_path: str, fmt: str) -> tuple[bool, str]:
    """Convert a single diagram. Returns (success, message)."""
    Path(job.out_path).parent.mkdir(parents=True, exist_ok=True)

    # Write diagram to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md',
                                     delete=False, encoding='utf-8') as tmp:
        tmp.write(f'```mermaid\n{job.content}\n```\n')
        tmp_path = tmp.name

    try:
        cmd = [
            'mmdc',
            '-i', tmp_path,
            '-o', job.out_path,
            '-f', fmt,
            '--configFile', cfg_path,
            *MMDC_THEME_ARGS,
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            err = result.stderr.strip() or result.stdout.strip()
            return False, f'mmdc error: {err[:200]}'

        return True, job.out_path

    except subprocess.TimeoutExpired:
        return False, 'mmdc timed out (>30s)'
    except FileNotFoundError:
        return False, 'mmdc not found — run: npm install -g @mermaid-js/mermaid-cli'
    finally:
        os.unlink(tmp_path)


# ─── Main ────────────────────────────────────────────────────────────────────

def collect_md_files(path: str) -> list[str]:
    p = Path(path)
    if p.is_file():
        return [str(p)]
    elif p.is_dir():
        return [str(f) for f in sorted(p.rglob('*.md'))]
    return []


def resolve_out_dir(md_path: str, out_override: str | None) -> str:
    if out_override:
        return out_override
    return str(Path(md_path).parent / DEFAULT_SUBDIR)


def main():
    args     = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(0)

    path       = args[0]
    fmt        = 'svg' if '--format' in args and args[args.index('--format') + 1] == 'svg' else DEFAULT_FORMAT
    out_dir    = args[args.index('--out') + 1] if '--out' in args else None
    dry_run    = '--dry-run' in args

    if not dry_run and not check_mmdc():
        print('ERROR: mmdc not found.')
        print('Install: npm install -g @mermaid-js/mermaid-cli')
        sys.exit(1)

    files = collect_md_files(path)
    if not files:
        print(f'No .md files found at: {path}')
        sys.exit(1)

    total_ok  = 0
    total_err = 0

    with tempfile.TemporaryDirectory() as tmp_dir:
        cfg_path = write_mmdc_config(tmp_dir) if not dry_run else ''

        for md_file in files:
            effective_out = resolve_out_dir(md_file, out_dir)
            jobs = extract_jobs(md_file, effective_out, fmt)

            if not jobs:
                continue

            print(f'\n{md_file}  ({len(jobs)} diagram(s))')

            for job in jobs:
                label = f'  [{job.index}] {job.title} ({job.diagram_type})'

                if dry_run:
                    print(f'{label}')
                    print(f'       → {job.out_path}')
                    continue

                ok, msg = convert_job(job, cfg_path, fmt)
                if ok:
                    print(f'{label}  ✅  {msg}')
                    total_ok += 1
                else:
                    print(f'{label}  ❌  {msg}')
                    total_err += 1

    if not dry_run:
        print(f'\nDone: {total_ok} converted, {total_err} failed')


if __name__ == '__main__':
    main()
