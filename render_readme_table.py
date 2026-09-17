"""
Regenerate the "currently listed plugins" table in both READMEs from plugins.json.

The table used to be maintained by hand and drifted: the only listed plugin was
described as 扬州大学 / "Yangzhou University" in both files when it is actually
长江大学 / Yangtze University. plugins.json already carries the authoritative
school names in "schools", so the table is generated from it and can no longer
disagree with what the app searches.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REGISTRY = Path("plugins.json")

# (file, heading marker, header row, separator row, "no schools declared" text)
TARGETS = [
    ("README.md", "## 📋 当前收录的插件", "| 插件仓库 | 覆盖学校 |", "|---------|---------|", "—"),
    ("README_EN.md", "## 📋 Currently Listed Plugins", "| Plugin Repository | Schools Covered |", "|------------------|-----------------|", "—"),
]


def load_entries() -> list[tuple[str, list[str]]]:
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    entries: list[tuple[str, list[str]]] = []
    for item in data:
        if isinstance(item, str):
            repo, schools = item.strip(), []
        elif isinstance(item, dict):
            repo = str(item.get("repo", "")).strip()
            schools = [str(s).strip() for s in item.get("schools", []) if str(s).strip()]
        else:
            continue
        if repo:
            entries.append((repo, schools))
    return entries


def build_table(entries, header: str, separator: str, empty_text: str) -> str:
    rows = [header, separator]
    for repo, schools in entries:
        link = f"[{repo}](https://github.com/{repo})"
        covered = " / ".join(schools) if schools else empty_text
        rows.append(f"| {link} | {covered} |")
    return "\n".join(rows)


def replace_table(text: str, heading: str, table: str) -> str:
    # 从标题后的第一张表吃到表格结束，其余内容原样保留
    pattern = re.compile(
        re.escape(heading) + r"\n\n(?:\|.*\n)+",
        re.MULTILINE,
    )
    if not pattern.search(text):
        raise SystemExit(f"找不到 {heading} 下的表格，README 结构变了？")
    return pattern.sub(f"{heading}\n\n{table}\n", text, count=1)


def main() -> int:
    entries = load_entries()
    changed = False
    for filename, heading, header, separator, empty_text in TARGETS:
        path = Path(filename)
        original = path.read_text(encoding="utf-8")
        updated = replace_table(original, heading, build_table(entries, header, separator, empty_text))
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            print(f"updated {filename}")
            changed = True
        else:
            print(f"{filename} already up to date")
    print("changed" if changed else "no changes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
