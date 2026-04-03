#!/usr/bin/env python3
"""
extract_mermaid.py — Extract and validate Mermaid diagrams from .md files.

Usage:
  python extract_mermaid.py <file.md>              # extract all diagrams
  python extract_mermaid.py <file.md> --validate   # extract + check common errors
  python extract_mermaid.py <file.md> --list       # list diagram titles only
  python extract_mermaid.py <dir/>   --validate    # scan all .md in directory

Output:
  Prints each diagram with index, title (from first %% comment), and content.
  With --validate: reports warnings for common Mermaid mistakes.
"""

import re
import sys
import os
from pathlib import Path
from dataclasses import dataclass, field


# ─── Data ────────────────────────────────────────────────────────────────────

@dataclass
class Diagram:
    index: int
    title: str
    diagram_type: str
    content: str
    source_file: str
    line_number: int
    warnings: list[str] = field(default_factory=list)


# ─── Extract ─────────────────────────────────────────────────────────────────

MERMAID_BLOCK = re.compile(r'```mermaid\n(.*?)```', re.DOTALL)
TITLE_COMMENT  = re.compile(r'%%\s*[─-]+\s*(.+?)\s*[─-]*\s*%%?$', re.MULTILINE)
TYPE_DETECT    = re.compile(r'^\s*(flowchart|sequenceDiagram|classDiagram|stateDiagram-v2|erDiagram|gantt|gitGraph|mindmap|timeline)', re.MULTILINE)


def extract_diagrams(md_path: str) -> list[Diagram]:
    text = Path(md_path).read_text(encoding='utf-8')
    diagrams = []

    for i, match in enumerate(MERMAID_BLOCK.finditer(text), start=1):
        content = match.group(1)
        line_no = text[:match.start()].count('\n') + 1

        # Detect type
        type_match = TYPE_DETECT.search(content)
        diagram_type = type_match.group(1) if type_match else 'unknown'

        # Detect title from first %% section comment
        title_match = TITLE_COMMENT.search(content)
        title = title_match.group(1).strip() if title_match else f'Diagram {i}'

        diagrams.append(Diagram(
            index=i,
            title=title,
            diagram_type=diagram_type,
            content=content.strip(),
            source_file=md_path,
            line_number=line_no,
        ))

    return diagrams


# ─── Validate ────────────────────────────────────────────────────────────────

RESERVED_WORDS = {'end', 'style', 'graph', 'subgraph', 'flowchart', 'classDef',
                  'direction', 'click', 'callback', 'class'}

def validate_diagram(d: Diagram) -> list[str]:
    warnings = []
    lines = d.content.splitlines()

    for line_i, line in enumerate(lines, start=1):
        # \n in label
        if r'\n' in line and not line.strip().startswith('%%'):
            warnings.append(f'  Line {line_i}: \\n in label — use <br> instead: {line.strip()[:60]}')

        # <br> without backtick wrap
        if '<br>' in line and '`' not in line:
            warnings.append(f'  Line {line_i}: <br> without backtick wrap — add backticks: {line.strip()[:60]}')

        # style/classDef missing color:
        stripped = line.strip()
        if (stripped.startswith('style ') or stripped.startswith('classDef ')) and 'color:' not in line:
            warnings.append(f'  Line {line_i}: missing color: in style/classDef — {stripped[:60]}')

        # Reserved word as node ID (simple heuristic for flowchart)
        if d.diagram_type.startswith('flowchart'):
            for word in RESERVED_WORDS:
                # Matches: "end[" or "end{" or "end(" at start of statement
                if re.match(rf'^\s*{word}[\[{{\(]', line, re.IGNORECASE):
                    warnings.append(f'  Line {line_i}: reserved word "{word}" used as node ID — rename to {word.upper()}')

    # Missing %%{init} theme block
    if '%%{init' not in d.content:
        warnings.append('  Missing %%{init} theme block — add canonical theme from SKILL.md')

    # Missing section comments
    section_comments = [l for l in lines if re.match(r'\s*%%\s*[─\-]{3,}', l)]
    if len(section_comments) < 2 and len(lines) > 10:
        warnings.append('  Few/no section %% ─── comments — add section separators for readability')

    return warnings


# ─── Output ──────────────────────────────────────────────────────────────────

def print_diagram(d: Diagram, show_content: bool = True):
    print(f'\n{"="*60}')
    print(f'[{d.index}] {d.title}')
    print(f'    Type: {d.diagram_type}  |  File: {d.source_file}:{d.line_number}')
    if d.warnings:
        print(f'    ⚠️  {len(d.warnings)} warning(s):')
        for w in d.warnings:
            print(f'    {w}')
    if show_content:
        print(f'{"─"*60}')
        print(d.content)


# ─── Main ────────────────────────────────────────────────────────────────────

def collect_md_files(path: str) -> list[str]:
    p = Path(path)
    if p.is_file():
        return [str(p)]
    elif p.is_dir():
        return [str(f) for f in sorted(p.rglob('*.md'))]
    return []


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(0)

    path       = args[0]
    do_validate = '--validate' in args
    list_only   = '--list' in args

    files = collect_md_files(path)
    if not files:
        print(f'No .md files found at: {path}')
        sys.exit(1)

    total_diagrams = 0
    total_warnings = 0

    for md_file in files:
        diagrams = extract_diagrams(md_file)
        if not diagrams:
            continue

        if len(files) > 1:
            print(f'\n{"#"*60}')
            print(f'# {md_file}  ({len(diagrams)} diagram(s))')

        for d in diagrams:
            if do_validate:
                d.warnings = validate_diagram(d)
                total_warnings += len(d.warnings)
            print_diagram(d, show_content=not list_only)
            total_diagrams += 1

    print(f'\n{"="*60}')
    print(f'Total: {total_diagrams} diagram(s) across {len(files)} file(s)')
    if do_validate:
        status = '✅ No issues' if total_warnings == 0 else f'⚠️  {total_warnings} warning(s) found'
        print(f'Validation: {status}')


if __name__ == '__main__':
    main()
