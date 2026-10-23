# Gospel & Soul Health: interactive study companion

An interactive learning app for Dr Bruce Wauchope's 59-session YouTube series
[The Gospel and Soul Health](https://www.youtube.com/playlist?list=PLlnEa82K_VxRy2zCSJf9dTm-mfIArp4rX)
(Perichoresis Australia / Trinityinyou).

Open `index.html` in any browser. It is a single self-contained file that works offline,
apart from the web font.

## What's inside

| View | What it does |
| --- | --- |
| **Home** | The overarching "love story" framework as an interactive cycle diagram, a 59-session progress strip, the volume and chapter structure, nine big ideas and the soul-healing pathway |
| **Course map** | A zoomable radial mind map: volumes, then chapters, then sessions |
| **Sessions** | For each of the 59 sessions: summary, quotes, linked Scriptures, a visual diagram (flowchart, cycle, contrast, hierarchy or layers), key ideas as a timeline, flip-card concepts, a case study, practices, private reflection journal and a quiz |
| **Case studies** | Six extended multi-session case journeys, each with its own diagram, plus 59 session case studies |
| **Toolkit** | "What are you facing?" Twelve practical guides (anxiety, the inner critic, grief, unforgiveness, overthinking, addictive comforts, burnout, loneliness, conflict, trauma, religious fear, feeling far from God) with flow diagrams, steps, practices and sessions to revisit, plus every practice in the series in one searchable list |
| **Glossary** | Every key term, A to Z, searchable and linked to its sessions |
| **Quiz** | Ten random questions from the whole series or from one volume, with your best score saved |

**Settings** (gear icon): seven colour schemes (Dawn, Olive Grove, Vine, River, Ember, Iris, Stone),
auto/light/dark appearance and three text sizes. Progress, reflections and preferences are kept in
your browser's local storage.

**Typeface:** Avenir Next. Devices that don't have it installed (most non-Apple devices) fall back
to Nunito Sans, a close free match loaded from Google Fonts, because Avenir Next is a licensed
font that can't be freely embedded.

## Project layout

```
data/sessions/session-NN.json   structured notes per session (summary, key points, terms,
                                diagram spec, case study, practices, reflection, quiz)
data/extras.json                framework, big ideas, pathway, extended case studies, toolkit
src/styles.css                  design tokens + palettes (all colours derive from two hues)
src/app.js                      router, views, diagram engine, radial mind map, quiz
src/template.html               page shell
build.py                        bundles everything into index.html
```

Rebuild after editing any data or source file:

```sh
python3 build.py
```

### Diagram spec

Every diagram, whether in a session, a case study or the toolkit, uses the same small spec,
rendered as responsive SVG:

```json
{ "type": "flow | cycle | contrast | hierarchy | layers",
  "title": "...", "centre": "optional label for cycles",
  "leftTitle": "contrast only", "rightTitle": "contrast only",
  "nodes": [{ "id": "a", "label": "short", "detail": "one sentence", "side": "left|right" }],
  "edges": [{ "from": "a", "to": "b", "label": "optional" }] }
```

## About the content

The session notes were distilled from the auto-generated YouTube transcripts. They summarise
the speaker's teaching in his own framework, and quotes are lightly cleaned of caption errors.
Case studies and practices apply that teaching. All people in them are composites. This is a
study aid, not therapy or medical advice.
