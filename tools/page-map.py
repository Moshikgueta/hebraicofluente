#!/usr/bin/env python3
"""page-map.py - reads a printed book and reports the real first page of each
section, so the table of contents can carry true page numbers.

    python3 tools/page-map.py pdf/hebraico-moderno-workbook.pdf > data/page-map.json

build.js drops an invisible marker (.secmark) at the top of every section. It
is transparent and 1px, so it never shows on paper, but Chromium still writes
the glyphs into the PDF's text layer, which makes the mapping exact instead of
guessing from headings that repeat.

Called by `npm run pdf`. If Python or PyMuPDF is missing the PDF still builds;
the contents page just shows a dash instead of a number.
"""
import json
import re
import sys

try:
    import pymupdf
except ImportError:
    sys.stderr.write('PyMuPDF ausente: pip install pymupdf\n')
    sys.exit(2)

MARK = re.compile(r'§sec:([a-z0-9._-]+)§')

def main():
    doc = pymupdf.open(sys.argv[1])
    found = {}
    for i, page in enumerate(doc, start=1):
        for m in MARK.finditer(page.get_text()):
            found.setdefault(m.group(1), i)
    json.dump({'pages': doc.page_count, 'sections': found},
              sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write('\n')

if __name__ == '__main__':
    main()
