#!/usr/bin/env python3
"""
patch_engine.py — atomically insert validated new rules into engine.js and index.html.

Safety:
- Always backs up both files first.
- Inserts each new rule into the appropriate category block in each file.
- If either file fails sanity check, restores both from backup.
- Idempotent: if a rule's exact line is already present, skip it.

Usage:
    python3 patch_engine.py \
        --rules _workspace/04_validated_rules.js \
        --engine engine.js \
        --index index.html \
        --backup-dir _workspace/backup \
        --diff-out _workspace/05_integration_diff.md \
        --report-out _workspace/05_integration_report.md
"""
import argparse
import datetime as _dt
import re
import shutil
import sys
from pathlib import Path

# Maps category -> start marker comment. Both engine.js and index.html use
# the same category header comment text, just with different surrounding
# divider conventions. We use the header itself as the anchor and the NEXT
# header as the boundary of the current section.
CATEGORY_HEADERS = {
    "spelling": "// 1. 맞춤법/표기 (spelling)",
    "expression": "// 2. 표현/문체 (expression)",
    "ethics": "// 3. 정확성/윤리 (ethics)",
    # structure rules typically not pattern-based; skipped here
}

# Ordered category -> next category header (or None if last)
NEXT_CATEGORY = {
    "spelling": "// 2. 표현/문체 (expression)",
    "expression": "// 3. 정확성/윤리 (ethics)",
    "ethics": None,
}


def parse_rules_block(text: str) -> list[str]:
    """Extract individual `{ ... },` rule lines from a JS file containing
    `const newRules = [ ... ];` or `const rules = [ ... ];`. Returns the
    raw rule lines (trimmed, without trailing comma adjustments)."""
    m = re.search(r"const\s+(?:newRules|rules)\s*=\s*\[(.*?)\];", text, re.S)
    if not m:
        return []
    body = m.group(1)
    lines = []
    buf = ""
    depth = 0
    for ch in body:
        buf += ch
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                # Strip everything before the first '{' (e.g. comments like
                # `// === spelling ===` that precede the first rule in a block).
                line = buf.strip()
                idx = line.find("{")
                if idx > 0:
                    line = line[idx:]
                if line.startswith(","):
                    line = line[1:].strip()
                lines.append(line)
                buf = ""
    # each line is `{ ... }` without comma; we will add comma on insert
    return [l for l in lines if l.startswith("{")]


def categorize_rule(rule_line: str) -> str:
    m = re.search(r"category:\s*'([^']+)'", rule_line)
    if m:
        return m.group(1)
    m = re.search(r'category:\s*"([^"]+)"', rule_line)
    if m:
        return m.group(1)
    return "spelling"


def find_insertion_point(src: str, category: str) -> int:
    """Find the line-start index right before the next category header
    (or `];` if this is the last category). The current category header
    itself is used only to verify it exists.
    """
    header = CATEGORY_HEADERS[category]
    hdr_idx = src.find(header)
    if hdr_idx < 0:
        return -1
    next_header = NEXT_CATEGORY[category]
    if next_header:
        search_from = hdr_idx + len(header)
        next_idx = src.find(next_header, search_from)
        if next_idx < 0:
            return -1
        # Back up from next_idx to the start of its line.
        line_start = src.rfind("\n", 0, next_idx) + 1
        # Also back up over any immediately preceding `// =====` divider
        # line (engine.js wraps headers with dividers; index.html does not).
        # Divider line looks like `  // =========...`
        prev_nl = src.rfind("\n", 0, line_start - 1)
        prev_line = src[prev_nl + 1 : line_start - 1] if prev_nl >= 0 else ""
        if prev_line.strip().startswith("// ==="):
            line_start = prev_nl + 1
        # And one more blank line above that, if present
        prev_nl2 = src.rfind("\n", 0, line_start - 1)
        if prev_nl2 >= 0 and src[prev_nl2 + 1 : line_start - 1].strip() == "":
            line_start = prev_nl2 + 1
        return line_start
    else:
        # last category — find the closing `];` of the rules array after
        # the header and insert right at the start of that line.
        arr_end = src.find("];", hdr_idx)
        if arr_end < 0:
            return -1
        line_start = src.rfind("\n", 0, arr_end) + 1
        return line_start


def render_rule_line(rule_body: str, source_tag: str = "") -> str:
    suffix = f" // {source_tag}" if source_tag else ""
    return f"  {rule_body},{suffix}\n"


def patch_file(path: Path, rule_lines_by_cat: dict[str, list[str]], file_label: str) -> tuple[int, list[str]]:
    src = path.read_text(encoding="utf-8")
    added: list[str] = []
    total = 0
    # insert in reverse category order to avoid shifting offsets
    for cat in reversed(list(CATEGORY_HEADERS.keys())):
        rules = rule_lines_by_cat.get(cat, [])
        if not rules:
            continue
        insert_idx = find_insertion_point(src, cat)
        if insert_idx < 0:
            print(f"WARN: {file_label}: header not found for category {cat}", file=sys.stderr)
            continue
        block_lines = []
        for r in rules:
            # idempotency: skip if already present verbatim
            if r in src:
                continue
            block_lines.append(render_rule_line(r, source_tag="[harness]"))
            added.append(f"{cat}: {r[:80]}...")
            total += 1
        if block_lines:
            block = "".join(block_lines)
            src = src[:insert_idx] + block + src[insert_idx:]
    path.write_text(src, encoding="utf-8")
    return total, added


def sanity_check_engine(path: Path, expected_min_total: int) -> bool:
    """Very simple sanity: parse how many `pattern:` occurrences exist.
    Should be >= expected_min_total. A real JS parse is out of scope here."""
    src = path.read_text(encoding="utf-8")
    count = src.count("pattern:")
    return count >= expected_min_total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rules", required=True)
    ap.add_argument("--engine", required=True)
    ap.add_argument("--index", required=True)
    ap.add_argument("--backup-dir", required=True)
    ap.add_argument("--diff-out", required=True)
    ap.add_argument("--report-out", required=True)
    args = ap.parse_args()

    rules_path = Path(args.rules)
    engine_path = Path(args.engine)
    index_path = Path(args.index)
    backup_root = Path(args.backup_dir)

    if not rules_path.exists():
        print(f"ERROR: rules file not found: {rules_path}", file=sys.stderr)
        sys.exit(1)
    if not engine_path.exists() or not index_path.exists():
        print("ERROR: engine.js or index.html not found", file=sys.stderr)
        sys.exit(1)

    # 1. backup — include microseconds to avoid collision on rapid reruns
    ts = _dt.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    bdir = backup_root / ts
    # never silently overwrite an existing backup dir
    if bdir.exists():
        print(f"ERROR: backup dir already exists: {bdir}", file=sys.stderr)
        sys.exit(1)
    bdir.mkdir(parents=True, exist_ok=False)
    shutil.copy2(engine_path, bdir / engine_path.name)
    shutil.copy2(index_path, bdir / index_path.name)

    # 2. parse new rules
    new_src = rules_path.read_text(encoding="utf-8")
    rule_lines = parse_rules_block(new_src)
    if not rule_lines:
        print("WARN: no rules found in input; nothing to do", file=sys.stderr)
        sys.exit(0)

    by_cat: dict[str, list[str]] = {}
    for r in rule_lines:
        cat = categorize_rule(r)
        by_cat.setdefault(cat, []).append(r)

    # baseline pattern count
    baseline_engine = engine_path.read_text(encoding="utf-8").count("pattern:")
    baseline_index = index_path.read_text(encoding="utf-8").count("pattern:")

    # 3. patch both
    try:
        eng_added, eng_log = patch_file(engine_path, by_cat, "engine.js")
        idx_added, idx_log = patch_file(index_path, by_cat, "index.html")
    except Exception as e:
        # restore and exit
        shutil.copy2(bdir / engine_path.name, engine_path)
        shutil.copy2(bdir / index_path.name, index_path)
        print(f"ERROR: patch failed, restored backup: {e}", file=sys.stderr)
        sys.exit(1)

    # 4. sanity
    ok_engine = sanity_check_engine(engine_path, baseline_engine + eng_added)
    ok_index = sanity_check_engine(index_path, baseline_index + idx_added)
    if not (ok_engine and ok_index):
        shutil.copy2(bdir / engine_path.name, engine_path)
        shutil.copy2(bdir / index_path.name, index_path)
        print(
            f"ERROR: sanity check failed (engine ok={ok_engine}, index ok={ok_index}), restored backup",
            file=sys.stderr,
        )
        sys.exit(1)

    # 5. write diff and report
    diff_lines = ["# 통합 Diff", ""]
    diff_lines.append(f"백업: {bdir}")
    diff_lines.append("")
    diff_lines.append("## engine.js")
    diff_lines.append(f"- 이전 pattern 개수: {baseline_engine}")
    diff_lines.append(f"- 추가: +{eng_added}")
    diff_lines.append(f"- 이후: {baseline_engine + eng_added}")
    diff_lines.append("")
    diff_lines.append("## index.html")
    diff_lines.append(f"- 이전 pattern 개수: {baseline_index}")
    diff_lines.append(f"- 추가: +{idx_added}")
    diff_lines.append(f"- 이후: {baseline_index + idx_added}")
    diff_lines.append("")
    diff_lines.append("## 추가된 규칙 (engine.js 기준)")
    for line in eng_log:
        diff_lines.append(f"- {line}")
    Path(args.diff_out).write_text("\n".join(diff_lines) + "\n", encoding="utf-8")

    report_lines = [
        "# 통합 보고서",
        "",
        f"- 백업 위치: `{bdir}`",
        f"- 신규 규칙: {eng_added}개 (engine.js), {idx_added}개 (index.html)",
        "",
        "## 롤백 명령",
        f"```bash",
        f"cp {bdir}/{engine_path.name} {engine_path}",
        f"cp {bdir}/{index_path.name} {index_path}",
        "```",
        "",
        "## 다음 단계",
        "- 브라우저에서 index.html을 열어 수동 검증",
        "- 실제 기사 초안을 넣어 신규 규칙이 의도대로 작동하는지 확인",
        "- 필요 시 추가 오탐 문장을 assets/clean_sentences.txt에 반영",
    ]
    Path(args.report_out).write_text("\n".join(report_lines) + "\n", encoding="utf-8")

    print(f"OK engine=+{eng_added} index=+{idx_added}")


if __name__ == "__main__":
    main()
