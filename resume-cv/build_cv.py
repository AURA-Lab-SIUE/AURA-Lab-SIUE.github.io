"""Render the CV in both variants from the single CV.md source.

    python build_cv.py            # both
    python build_cv.py external   # just the public one

Two audiences, one source of truth:

  external  ->  Leith_CV.pdf           the public CV, shipped to apleith.com
  internal  ->  Leith_CV_internal.pdf  for SIUE submission (annual review, dossier)

The only difference is that the external render drops every block between
<!-- INTERNAL-ONLY-START --> and <!-- INTERNAL-ONLY-END -->. Today that is the
declined-grant section: internal reviewers want the full submission record,
while the public CV should not lead with proposals that were not funded.

Keeping one source and stripping at build time is deliberate — two parallel
markdown files would drift, and the drift would be invisible until someone read
both side by side.

The internal PDF is NOT committed here: this repo is public, so publishing it
would defeat the split. Build it on demand and file it with the other employment
documents on M4 (80-service-hr/employment/CV/).
"""
import re
import subprocess
import sys

MARKED = re.compile(
    r"[ \t]*<!--\s*INTERNAL-ONLY-START\s*-->.*?<!--\s*INTERNAL-ONLY-END\s*-->[ \t]*\n?",
    re.DOTALL,
)

PANDOC = [
    "pandoc", "-o", None, "--pdf-engine=xelatex",
    "--include-in-header=cv-header.tex",
    "-V", "geometry:margin=0.75in",
    "-V", "fontsize=10.5pt",
    "-V", "lang=en-US",
]


def render(src_md, out_pdf):
    cmd = list(PANDOC)
    cmd[cmd.index(None)] = out_pdf
    cmd.insert(1, src_md)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit("pandoc failed for %s:\n%s" % (out_pdf, r.stderr[-2000:]))
    print("wrote %s" % out_pdf)


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "both"
    source = open("CV.md", encoding="utf-8").read()

    if MARKED.search(source) is None:
        print("note: no INTERNAL-ONLY blocks found — both variants will be identical")

    if which in ("both", "internal"):
        render("CV.md", "Leith_CV_internal.pdf")

    if which in ("both", "external"):
        stripped = MARKED.sub("", source)
        # Collapse the blank-line pileup a removed section leaves behind.
        stripped = re.sub(r"\n{3,}", "\n\n", stripped)
        tmp = "_CV_external.md"
        open(tmp, "w", encoding="utf-8", newline="\n").write(stripped)
        try:
            render(tmp, "Leith_CV.pdf")
        finally:
            import os
            os.remove(tmp)


if __name__ == "__main__":
    main()
