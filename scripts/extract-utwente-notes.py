"""TL;DR: Extract per-theory RAW SOURCE NOTES from the UTwente comm-theories PDF.

Internal authoring input only. NOT published, NOT verbatim site content.
Output dir (scripts/_source-notes/) is gitignored.

Parses the TOC (PDF pages 2-4 / index 1-3), maps the 9 known categories to their
theory lists + printed page numbers, dedupes theories by normalized name, slices
each unique theory's body text by printed-page offset, and writes one .md note
per unique theory with YAML frontmatter aggregating every category it appears under.

Page offset (verified): printed page P == reader.pages[P] (0-based index),
i.e. printed "4" is the 5th PDF page. Cover is index 0, TOC is index 1-3, body
starts at index 4.

Run with the life-os venv:
    C:\\life-os\\venv\\Scripts\\python.exe scripts/extract-utwente-notes.py
"""

import os
import re
import sys

try:
    from pypdf import PdfReader
except ImportError:
    sys.exit("pypdf not installed. Run with C:\\life-os\\venv\\Scripts\\python.exe")

PDF_PATH = r"E:\Projects\AURA-Lab-SIUE\theories\utwente-comm-theories-2026-decrypted.pdf"
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_source-notes")

# TOC lives on PDF pages with 0-based index 1, 2, 3 (printed "Contents" pages).
TOC_PAGE_INDICES = [1, 2, 3]

# Printed-page-to-reader-index offset. Printed page P -> reader.pages[P].
# (Verified: printed "4" text appears at reader.pages[4].)
PAGE_OFFSET = 0  # reader_index = printed_page + PAGE_OFFSET

# Ground-truth 9 top-level categories, normalized for matching. The TOC renders
# both categories and theories as "N. Title ... <page>"; categories are exactly
# these 9 strings (the outer 1..9 sequence), everything else is a theory entry.
CATEGORY_NAMES = [
    "Communication and Information Technology",
    "Communication Processes",
    "Health Communication",
    "Interpersonal Communication and Relations",
    "Language Theories and Linguistics",
    "Mass Media",
    "Media, Culture and Society",
    "Public Relations/ Advertising, Marketing and Consumer Behavior",
]
# Note: "Organizational Communication" is the 8th category in the PDF; the task's
# canonical list also includes it. Add it explicitly so matching is robust.
CATEGORY_NAMES.insert(7, "Organizational Communication")


def normalize(s):
    """Lowercase, trim, collapse whitespace; strip trailing dot-leaders/punct.

    Also treat hyphens as spaces so "Agenda Setting Theory" and
    "Agenda-Setting Theory" dedupe to the same theory (they differ only by a
    hyphen and otherwise share a slug, which would silently overwrite a file).
    """
    s = s.replace("’", "'").replace("‘", "'")
    s = s.replace("-", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s.lower().rstrip(". ").strip()


CATEGORY_SET = {normalize(c) for c in CATEGORY_NAMES}
# Map normalized category -> canonical display form.
CATEGORY_CANON = {normalize(c): c for c in CATEGORY_NAMES}


def slugify(name):
    s = name.replace("’", "'").replace("‘", "'")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


# A TOC line: "<num>. <title> <dot leaders> <page>"
# The title may wrap, but in this PDF each entry is on one extracted line.
LINE_RE = re.compile(r"^\s*(\d+)\.\s+(.*?)[\s.]*?(\d+)\s*$")


def parse_toc(reader):
    """Return list of categories, each a dict with name + ordered theory entries.

    Each theory entry: {"name", "page" (printed int), "raw_title"}.
    """
    raw_lines = []
    for idx in TOC_PAGE_INDICES:
        text = reader.pages[idx].extract_text() or ""
        for ln in text.splitlines():
            ln = ln.strip()
            if ln:
                raw_lines.append(ln)

    categories = []
    current = None

    for ln in raw_lines:
        m = LINE_RE.match(ln)
        if not m:
            continue
        title = re.sub(r"\s+", " ", m.group(2)).strip().rstrip(".").strip()
        page = int(m.group(3))
        if not title:
            continue
        norm = normalize(title)
        if norm in CATEGORY_SET:
            # New category heading.
            current = {
                "name": CATEGORY_CANON[norm],
                "page": page,
                "theories": [],
            }
            categories.append(current)
        else:
            if current is None:
                # Theory before any category seen; skip defensively.
                continue
            current["theories"].append({
                "name": title,
                "page": page,
                "category": current["name"],
            })

    return categories


def build_unique_theories(categories):
    """Dedupe theories by normalized name. Returns ordered dict-like list.

    Each unique: {"name", "norm", "categories": [..], "occurrences": [(page,cat)..],
                  "first_page"}.
    """
    unique = {}  # norm -> record
    order = []
    for cat in categories:
        for th in cat["theories"]:
            norm = normalize(th["name"])
            if norm not in unique:
                unique[norm] = {
                    "name": th["name"],  # first-seen display name
                    "norm": norm,
                    "categories": [],
                    "occurrences": [],
                }
                order.append(norm)
            rec = unique[norm]
            if cat["name"] not in rec["categories"]:
                rec["categories"].append(cat["name"])
            rec["occurrences"].append((th["page"], cat["name"]))

    for norm in order:
        rec = unique[norm]
        rec["first_page"] = min(p for p, _ in rec["occurrences"])
    return [unique[n] for n in order]


def build_page_boundaries(categories):
    """Sorted list of all start-pages (printed) across the whole doc, so we can
    find where any theory's body ends (= next entry's start page).
    Includes category heading pages too (they begin a new section)."""
    pages = set()
    for cat in categories:
        pages.add(cat["page"])
        for th in cat["theories"]:
            pages.add(th["page"])
    return sorted(pages)


def next_start_after(start_page, boundaries):
    for p in boundaries:
        if p > start_page:
            return p
    return None


def extract_body(reader, start_printed, end_printed):
    """Slice text from printed start page up to (not including) end page.
    end_printed None => go a few pages then stop (best effort)."""
    start_idx = start_printed + PAGE_OFFSET
    if end_printed is None:
        end_idx = min(start_idx + 4, len(reader.pages))
    else:
        end_idx = end_printed + PAGE_OFFSET
    # Guard bounds.
    start_idx = max(0, min(start_idx, len(reader.pages) - 1))
    end_idx = max(start_idx + 1, min(end_idx, len(reader.pages)))
    chunks = []
    for i in range(start_idx, end_idx):
        chunks.append(reader.pages[i].extract_text() or "")
    return "\n".join(chunks), start_idx, end_idx


def has_references(text):
    """Best-effort detection that the slice captured reference/citation material.

    The PDF does not always render a literal "References" heading on the sliced
    pages (it can fall on a boundary page, or the heading glyphs extract oddly).
    The actual citations always appear as a bullet/dash list with a year, e.g.
    "... Information Systems Research 7 (1996) 63-92." So accept either a
    References-like heading OR >=2 year-bearing citation lines.
    """
    if re.search(r"References", text, re.IGNORECASE):
        return True
    # Count lines that look like a citation (contain a 4-digit year 19xx/20xx).
    year_lines = re.findall(r"\b(?:19|20)\d{2}\b", text)
    return len(year_lines) >= 2


def main():
    reader = PdfReader(PDF_PATH)
    os.makedirs(OUT_DIR, exist_ok=True)

    categories = parse_toc(reader)
    total_entries = sum(len(c["theories"]) for c in categories)
    boundaries = build_page_boundaries(categories)
    uniques = build_unique_theories(categories)

    flagged = []
    written = 0

    for rec in uniques:
        start = rec["first_page"]
        end = next_start_after(start, boundaries)
        body, si, ei = extract_body(reader, start, end)

        end_printed_display = (end - 1) if end is not None else None
        if end_printed_display is not None and end_printed_display < start:
            end_printed_display = start
        page_range = (
            f"{start}-{end_printed_display}" if end_printed_display else f"{start}+"
        )

        # Flag problems: empty/tiny body, no References captured, or bad slice.
        problem = None
        if len(body.strip()) < 200:
            problem = "body too short / empty slice"
        elif not has_references(body):
            problem = "no reference/citation material detected in slice"
        if problem:
            flagged.append((rec["name"], page_range, problem))

        slug = slugify(rec["name"])
        cats_yaml = ", ".join(f'"{c}"' for c in rec["categories"])
        frontmatter = (
            "---\n"
            f"name: {rec['name']}\n"
            f"slug: {slug}\n"
            f"categories: [{cats_yaml}]\n"
            f"utwente_pages: {page_range}\n"
            "---\n\n"
            "RAW SOURCE NOTES — do not publish verbatim.\n"
            "Internal authoring input extracted from the UTwente Communication "
            "Theories reference (UTwente / TCW). Use only to identify primary "
            "sources and paraphrase; never copy this text onto the site.\n\n"
            f"<!-- categories aggregated: {len(rec['categories'])} | "
            f"occurrences: {rec['occurrences']} -->\n\n"
            "----- BEGIN RAW EXTRACT -----\n\n"
        )
        out_path = os.path.join(OUT_DIR, f"{slug}.md")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(frontmatter)
            f.write(body.strip())
            f.write("\n\n----- END RAW EXTRACT -----\n")
        written += 1

    # Summary
    print("=" * 60)
    print("UTwente source-notes extraction summary")
    print("=" * 60)
    print(f"Categories parsed:        {len(categories)}")
    print(f"Total TOC theory entries: {total_entries}")
    print(f"Unique theories (dedup):  {len(uniques)}")
    print(f"Note files written:       {written}")
    print(f"Output dir:               {OUT_DIR}")
    print()
    if flagged:
        print(f"FLAGGED ({len(flagged)}) — review these manually, NOT crashes:")
        for name, pr, why in flagged:
            print(f"  - {name} [pages {pr}]: {why}")
    else:
        print("No theories flagged. All slices look clean.")


if __name__ == "__main__":
    main()
