#!/usr/bin/env python3
"""Inline web/ + data/prep.json into one offline file: dist/millersville-storm-prep.html."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def rd(rel):
    with open(os.path.join(HERE, rel), encoding="utf-8") as f:
        return f.read()


def main():
    prep_path = os.path.join(HERE, "data", "prep.json")
    with open(prep_path, encoding="utf-8") as f:
        prep = json.load(f)
    prep_js = json.dumps(prep, ensure_ascii=False)
    n_items = sum(len(c.get("items", [])) for c in prep.get("categories", []))
    n_tl = len(prep.get("timeline", []))
    html = rd("web/index.html")
    html = html.replace("/*__CSS__*/", rd("web/app.css"))
    html = html.replace("/*__PREP__*/ null /*__/PREP__*/", prep_js)
    app = rd("web/app.js").replace("</script", "<\\/script")
    html = html.replace("/*__APP__*/", app)
    os.makedirs(os.path.join(HERE, "dist"), exist_ok=True)
    out = os.path.join(HERE, "dist", "millersville-storm-prep.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print(
        f"built {out} ({os.path.getsize(out):,} bytes) · "
        f"items={n_items} timeline={n_tl}"
    )


if __name__ == "__main__":
    main()
