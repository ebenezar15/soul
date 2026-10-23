#!/usr/bin/env python3
"""Bundle session notes, extras and source files into one self-contained page.

Outputs:
  index.html            full HTML document (open directly, or serve via GitHub Pages)
  dist/artifact.html    the same page without the document skeleton (for Claude Artifacts)
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).parent
SESSIONS_DIR = ROOT / "data" / "sessions"

# Volume / chapter structure, normalised from the YouTube descriptions.
VOLUMES = [
    {
        "id": "v1", "short": "Volume 1", "name": "The Gospel of Union", "color": "accent",
        "desc": "John 14:20 unpacked: who the Trinity is, how we came to be in the flesh, how Jesus entered and healed it, and what it means that he is in us.",
        "chapters": [
            {"id": "c0", "name": "Introduction", "short": "Introduction", "sessions": [1]},
            {"id": "c1", "name": "Ch 1 · Jesus is in the Father", "short": "Jesus in the Father", "sessions": list(range(2, 10))},
            {"id": "c2", "name": "Ch 2 · We are in Jesus: the flesh", "short": "We are in Jesus", "sessions": list(range(10, 14))},
            {"id": "c3", "name": "Ch 3 · Jesus in our flesh: cross and rising", "short": "Jesus in our flesh", "sessions": list(range(14, 22))},
            {"id": "c4", "name": "Ch 4 · In that day you will know", "short": "In that day", "sessions": list(range(22, 27))},
        ],
    },
    {
        "id": "v2", "short": "Volume 2", "name": "Christian Fish in Greek Soup", "color": "warm",
        "desc": "How Greek dualism shaped the Western gospel of separation, and how to read propitiation, wrath and judgment within the love story.",
        "chapters": [
            {"id": "c5", "name": "Greek thought and the Western gospel", "short": "Greek soup", "sessions": list(range(27, 31))},
        ],
    },
    {
        "id": "v3", "short": "Volume 3", "name": "Soul Health", "color": "third",
        "desc": "Models of the human person and healing: the conscience, the spin, grief, injustice, attachment, the black hole, trauma and darkness.",
        "chapters": [
            {"id": "c6", "name": "Ch 1 · Outline of soul healing", "short": "Outline of healing", "sessions": list(range(31, 37))},
            {"id": "c7", "name": "Ch 2 · The conscience", "short": "The conscience", "sessions": list(range(37, 46))},
            {"id": "c8", "name": "Ch 3 · Other internal structures", "short": "Internal structures", "sessions": list(range(46, 54))},
            {"id": "c9", "name": "Ch 4 · The amygdala, trauma and darkness", "short": "Amygdala and trauma", "sessions": list(range(54, 60))},
        ],
    },
]

# Video lengths in seconds, from the channel listing.
SECONDS = {1: 1699, 2: 1934, 3: 1143, 4: 1690, 5: 2145, 6: 1562, 7: 1140, 8: 1388, 9: 1355, 10: 1325,
           11: 1623, 12: 2285, 13: 1268, 14: 1998, 15: 1389, 16: 1648, 17: 1456, 18: 1530, 19: 1296, 20: 1826,
           21: 2451, 22: 1319, 23: 1423, 24: 1498, 25: 1621, 26: 500, 27: 1759, 28: 1826, 29: 1929, 30: 1579,
           31: 1747, 32: 1565, 33: 1602, 34: 1242, 35: 1350, 36: 1217, 37: 1836, 38: 1101, 39: 1425, 40: 1816,
           41: 1253, 42: 1023, 43: 2290, 44: 2399, 45: 1797, 46: 1506, 47: 2159, 48: 934, 49: 1354, 50: 1288,
           51: 1425, 52: 1389, 53: 736, 54: 1736, 55: 950, 56: 1416, 57: 644, 58: 2041, 59: 1711}

# Sessions 20 and 28 teach propitiation twice; keep their titles distinct.
TOPIC_OVERRIDES = {28: "Propitiation revisited: no payment to God"}


def load_sessions():
    where = {}
    for v in VOLUMES:
        for c in v["chapters"]:
            for n in c["sessions"]:
                where[n] = (v, c)
    out = []
    for n in range(1, 60):
        f = SESSIONS_DIR / f"session-{n:02d}.json"
        d = json.loads(f.read_text())
        assert d["session"] == n, f
        v, c = where[n]
        q = d["quiz"]
        for item in q:
            assert len(item["options"]) == 4 and 0 <= item["answer"] < 4, (n, item["q"])
        ids = {x["id"] for x in d["diagram"]["nodes"]}
        d["diagram"]["edges"] = [e for e in d["diagram"].get("edges", []) if e["from"] in ids and e["to"] in ids]
        out.append({
            "n": n,
            "videoId": d["videoId"],
            "topic": TOPIC_OVERRIDES.get(n, d["topic"]),
            "vol": v["id"],
            "chapter": c["id"],
            "chapterName": c["name"],
            "minutes": round(SECONDS.get(n, 0) / 60),
            "summary": d["summary"],
            "keyPoints": d["keyPoints"],
            "keyTerms": d["keyTerms"],
            "scriptures": d.get("scriptures", []),
            "quotes": d.get("quotes", []),
            "diagram": d["diagram"],
            "caseStudy": d["caseStudy"],
            "practices": d["practices"],
            "reflection": d["reflection"],
            "quiz": q,
        })
    return out


def main():
    data = {
        "sessions": load_sessions(),
        "volumes": VOLUMES,
        "extras": json.loads((ROOT / "data" / "extras.json").read_text()),
    }
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    tpl = (ROOT / "src" / "template.html").read_text()
    page = (tpl.replace("/*STYLES*/", (ROOT / "src" / "styles.css").read_text())
               .replace("/*DATA*/", blob)
               .replace("/*APP*/", (ROOT / "src" / "app.js").read_text()))
    (ROOT / "dist").mkdir(exist_ok=True)
    (ROOT / "dist" / "artifact.html").write_text(page)
    full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            + page.replace("<header", "</head>\n<body>\n<header", 1) + "\n</body>\n</html>\n")
    (ROOT / "index.html").write_text(full)
    print(f"Built index.html ({len(full) // 1024} KB) with {len(data['sessions'])} sessions", file=sys.stderr)


if __name__ == "__main__":
    main()
