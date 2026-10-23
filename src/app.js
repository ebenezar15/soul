(function () {
  "use strict";
  const D = window.SOUL;
  const S = D.sessions;
  const byN = new Map(S.map((s) => [s.n, s]));
  const app = document.getElementById("app");

  /* ---------------- utilities ---------------- */
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem("gsh:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("gsh:" + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  const yt = (id) => "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
  const bible = (ref) => "https://www.biblegateway.com/passage/?search=" + encodeURIComponent(ref) + "&version=NIV";
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const volOf = (id) => D.volumes.find((v) => v.id === id);
  const sLink = (n, text) => `<a href="#s${n}" class="chip">${esc(text || "Session " + n)}</a>`;

  const ICON = {
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    idea: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="4" cy="5" r="2"/><circle cx="20" cy="5" r="2"/><circle cx="4" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="M6 6.5 9.6 10M18 6.5 14.4 10M6 17.5l3.6-3.5M18 17.5l-3.6-3.5"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h10M7 14h6"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-6 7-10 16-10 0 9-4 16-10 16"/><path d="M4 21c4-4 7-7 11-10"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    quote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5H3v8h4M14 21c3 0 7-1 7-8V5h-7v8h4"/></svg>',
  };

  /* ---------------- preferences ---------------- */
  const PALETTES = [
    { id: "dawn", name: "Dawn", h: 245, h2: 75, c: 0.14 },
    { id: "olive", name: "Olive Grove", h: 140, h2: 70, c: 0.1 },
    { id: "vine", name: "Vine", h: 345, h2: 80, c: 0.13 },
    { id: "river", name: "River", h: 205, h2: 30, c: 0.11 },
    { id: "ember", name: "Ember", h: 40, h2: 230, c: 0.13 },
    { id: "iris", name: "Iris", h: 290, h2: 160, c: 0.13 },
    { id: "stone", name: "Stone", h: 70, h2: 30, c: 0.045 },
  ];
  const prefs = Object.assign({ palette: "dawn", theme: "system", size: "m" }, store.get("prefs", {}));
  function applyPrefs() {
    const r = document.documentElement;
    r.setAttribute("data-palette", prefs.palette);
    if (prefs.theme === "system") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", prefs.theme);
    r.setAttribute("data-size", prefs.size);
    store.set("prefs", prefs);
  }
  applyPrefs();

  /* ---------------- progress ---------------- */
  const done = new Set(store.get("done", []));
  const saveDone = () => store.set("done", [...done]);
  const journal = store.get("journal", {});

  /* ---------------- shell ---------------- */
  const ROUTES = [
    ["home", "Home"], ["map", "Course map"], ["sessions", "Sessions"], ["cases", "Case studies"],
    ["toolkit", "Toolkit"], ["glossary", "Glossary"], ["quiz", "Quiz"],
  ];
  function shell() {
    document.getElementById("topnav").innerHTML = ROUTES.map(([id, label]) => `<a href="#${id}" data-r="${id}">${label}</a>`).join("");
    const btn = document.getElementById("settingsBtn");
    btn.innerHTML = ICON.gear;
    const panel = document.getElementById("settings");
    btn.addEventListener("click", () => { panel.hidden = !panel.hidden; btn.setAttribute("aria-expanded", String(!panel.hidden)); if (!panel.hidden) renderSettings(); });
    panel.addEventListener("click", (e) => e.stopPropagation()); // the panel re-renders on each choice, detaching the target
    document.addEventListener("click", (e) => { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) { panel.hidden = true; btn.setAttribute("aria-expanded", "false"); } });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") panel.hidden = true; });
  }
  function renderSettings() {
    const panel = document.getElementById("settings");
    panel.innerHTML = `
      <div class="stack" style="gap:10px"><h3>Colour scheme</h3>
        <div class="swatches">${PALETTES.map((p) => `
          <button class="swatch" data-pal="${p.id}" aria-pressed="${prefs.palette === p.id}">
            <span class="swatch-dots"><i style="background:oklch(52% ${p.c} ${p.h})"></i><i style="background:oklch(70% ${p.c} ${p.h2})"></i><i style="background:oklch(58% ${p.c * 0.9} ${p.h + 140})"></i></span>${p.name}
          </button>`).join("")}</div></div>
      <div class="stack" style="gap:10px"><h3>Appearance</h3>
        <div class="seg" role="group" aria-label="Light or dark">${[["system", "Auto"], ["light", "Light"], ["dark", "Dark"]].map(([k, l]) => `<button data-theme-set="${k}" aria-pressed="${prefs.theme === k}">${l}</button>`).join("")}</div></div>
      <div class="stack" style="gap:10px"><h3>Text size</h3>
        <div class="seg" role="group" aria-label="Text size">${[["s", "Small"], ["m", "Medium"], ["l", "Large"]].map(([k, l]) => `<button data-size-set="${k}" aria-pressed="${prefs.size === k}">${l}</button>`).join("")}</div></div>
      <p class="muted" style="font-size:var(--fs-xs)">Set in Avenir Next. Devices without it use Nunito Sans, a close match.</p>`;
    panel.querySelectorAll("[data-pal]").forEach((b) => b.addEventListener("click", () => { prefs.palette = b.dataset.pal; applyPrefs(); renderSettings(); }));
    panel.querySelectorAll("[data-theme-set]").forEach((b) => b.addEventListener("click", () => { prefs.theme = b.dataset.themeSet; applyPrefs(); renderSettings(); }));
    panel.querySelectorAll("[data-size-set]").forEach((b) => b.addEventListener("click", () => { prefs.size = b.dataset.sizeSet; applyPrefs(); renderSettings(); }));
  }

  /* ================= DIAGRAM ENGINE ================= */
  // Renders a {type,title,nodes,edges,note} spec into an interactive SVG + legend.
  function wrapText(label, max) {
    const words = String(label).split(/\s+/); const lines = []; let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim();
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 4);
  }
  function textBlock(x, y, label, max, size, extra) {
    const lines = wrapText(label, max); const lh = size * 1.22; const y0 = y - ((lines.length - 1) * lh) / 2;
    return `<text x="${x}" y="${y0}" text-anchor="middle" dominant-baseline="central" font-size="${size}" ${extra || ""}>${lines.map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(l)}</tspan>`).join("")}</text>`;
  }
  function clipToBox(cx, cy, tx, ty, hw, hh) {
    const dx = tx - cx, dy = ty - cy; if (!dx && !dy) return [cx, cy];
    const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
    return [cx + dx * t, cy + dy * t];
  }
  let uid = 0;
  function renderDiagram(d, narrow) {
    if (!d || !d.nodes || !d.nodes.length) return "";
    const id = "dg" + (++uid);
    const nodes = d.nodes.map((n, i) => Object.assign({ i }, n));
    const idx = new Map(nodes.map((n) => [n.id, n]));
    let edges = (d.edges || []).filter((e) => idx.has(e.from) && idx.has(e.to));
    let type = ["flow", "cycle", "contrast", "hierarchy", "layers"].includes(d.type) ? d.type : "flow";
    if (type === "cycle" && narrow && nodes.length > 5) {
      // A large ring can't fit a phone screen; unroll it into a flow that loops back.
      type = "flow";
      if (!edges.length) { edges = nodes.slice(1).map((n, i) => ({ from: nodes[i].id, to: n.id })); edges.push({ from: nodes[nodes.length - 1].id, to: nodes[0].id, label: "again" }); }
    }
    if (!edges.length && (type === "flow" || type === "cycle")) {
      edges = nodes.slice(1).map((n, i) => ({ from: nodes[i].id, to: n.id }));
      if (type === "cycle") edges.push({ from: nodes[nodes.length - 1].id, to: nodes[0].id });
    }
    const W = narrow ? 360 : 780; const fs = narrow ? 12.5 : 14;
    let H = 0; let body = ""; let edgeSvg = "";
    const kind = (n, i) => "k" + ((n.side === "right" ? 2 : n.side === "left" ? 1 : (i % 3) + 1));
    const arrow = `url(#${id}-arr)`;
    const label = (x, y, t) => {
      if (!t) return ""; const w = Math.min(t.length * 6.4 + 12, 150);
      return `<rect class="d-edge-label-bg" x="${x - w / 2}" y="${y - 9}" width="${w}" height="18" rx="9"/><text class="d-edge-label" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${esc(t.length > 24 ? t.slice(0, 23) + "…" : t)}</text>`;
    };
    const box = (n, x, y, w, h, numbered) => {
      n.x = x; n.y = y; n.w = w; n.h = h;
      const chars = Math.max(8, Math.floor((w - 16) / (fs * 0.55)));
      return `<g class="d-node ${kind(n, n.i)}" data-i="${n.i}" tabindex="0" role="button" aria-label="${esc(n.label)}">
        <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="12"/>
        ${numbered ? `<text class="num" x="${x - w / 2 + 14}" y="${y - h / 2 + 14}" font-size="11" text-anchor="middle" dominant-baseline="central">${n.i + 1}</text>` : ""}
        ${textBlock(x, y, n.label, chars, fs)}</g>`;
    };
    const straight = (a, b, lab, bend) => {
      const [x1, y1] = clipToBox(a.x, a.y, b.x, b.y, a.w / 2 + 2, a.h / 2 + 2);
      const [x2, y2] = clipToBox(b.x, b.y, a.x, a.y, b.w / 2 + 6, b.h / 2 + 6);
      if (bend) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; const dx = x2 - x1, dy = y2 - y1; const L = Math.hypot(dx, dy) || 1;
        const cx = mx - (dy / L) * bend, cy = my + (dx / L) * bend;
        return `<path class="d-edge" d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" marker-end="${arrow}"/>` + label((x1 + 2 * cx + x2) / 4, (y1 + 2 * cy + y2) / 4, lab);
      }
      return `<path class="d-edge" d="M${x1},${y1} L${x2},${y2}" marker-end="${arrow}"/>` + label((x1 + x2) / 2, (y1 + y2) / 2, lab);
    };

    if (type === "flow") {
      const n = nodes.length; const cols = narrow ? (n > 4 ? 2 : 1) : n <= 3 ? n : n === 4 ? 2 : 3;
      const gapX = narrow ? 40 : 70, gapY = narrow ? 46 : 58, pad = 14;
      const bw = (W - pad * 2 - gapX * (cols - 1)) / cols; const bh = narrow ? 64 : 70;
      nodes.forEach((nd, i) => {
        const r = Math.floor(i / cols); let c = i % cols; if (r % 2 === 1) c = cols - 1 - c;
        body += box(nd, pad + bw / 2 + c * (bw + gapX), 30 + bh / 2 + r * (bh + gapY), bw, bh, true);
      });
      H = 30 + Math.ceil(n / cols) * (bh + gapY) - gapY + 30;
      edges.forEach((e) => {
        const a = idx.get(e.from), b = idx.get(e.to);
        const adjacent = Math.abs(a.i - b.i) === 1 && (Math.abs(a.x - b.x) < 1 || Math.abs(a.y - b.y) < 1);
        edgeSvg += straight(a, b, e.label, adjacent ? 0 : (b.i > a.i ? 40 : -40));
      });
    } else if (type === "cycle") {
      const n = nodes.length; const R = narrow ? 118 : n >= 7 ? 205 : 178; const bw = narrow ? 112 : 160, bh = narrow ? 56 : 62;
      const cx = W / 2, cy = R + bh / 2 + 24;
      nodes.forEach((nd, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; body += box(nd, cx + R * Math.cos(a) * (narrow ? 0.98 : 1.25), cy + R * Math.sin(a), bw, bh, true); });
      H = cy + R + bh / 2 + 24;
      const center = `<circle class="d-center" cx="${cx}" cy="${cy}" r="${narrow ? 48 : 64}"/>` + textBlock(cx, cy, d.centre || d.title || "", narrow ? 11 : 14, narrow ? 10 : 11.5, 'class="d-center-text"');
      edges.forEach((e) => {
        const a = idx.get(e.from), b = idx.get(e.to);
        const nextInRing = (b.i - a.i + n) % n === 1;
        edgeSvg += straight(a, b, e.label, nextInRing ? -(narrow ? 16 : 26) : 0);
      });
      edgeSvg = center + edgeSvg;
    } else if (type === "contrast") {
      const left = nodes.filter((x) => x.side !== "right"); const right = nodes.filter((x) => x.side === "right");
      const pad = 14, gap = narrow ? 24 : 90; const bw = (W - pad * 2 - gap) / 2; const bh = narrow ? 60 : 62; const gy = 16;
      const top = d.leftTitle || d.rightTitle ? 44 : 20;
      left.forEach((nd, i) => { body += box(nd, pad + bw / 2, top + bh / 2 + i * (bh + gy), bw, bh); });
      right.forEach((nd, i) => { body += box(nd, W - pad - bw / 2, top + bh / 2 + i * (bh + gy), bw, bh); });
      H = top + Math.max(left.length, right.length) * (bh + gy) + 10;
      edgeSvg += `<line class="d-divider" x1="${W / 2}" y1="8" x2="${W / 2}" y2="${H - 8}"/>`;
      if (d.leftTitle) edgeSvg += `<text class="d-col-title" x="${pad + bw / 2}" y="20" text-anchor="middle">${esc(d.leftTitle)}</text>`;
      if (d.rightTitle) edgeSvg += `<text class="d-col-title" x="${W - pad - bw / 2}" y="20" text-anchor="middle">${esc(d.rightTitle)}</text>`;
      edges.forEach((e) => { const a = idx.get(e.from), b = idx.get(e.to); if (a.side !== b.side) edgeSvg += straight(a, b, narrow ? "" : e.label, 0); else edgeSvg += straight(a, b, "", 0); });
    } else if (type === "hierarchy") {
      const incoming = new Map(nodes.map((x) => [x.id, 0])); edges.forEach((e) => incoming.set(e.to, incoming.get(e.to) + 1));
      const depth = new Map(); const roots = nodes.filter((x) => !incoming.get(x.id)); (roots.length ? roots : [nodes[0]]).forEach((r) => depth.set(r.id, 0));
      for (let k = 0; k < nodes.length; k++) edges.forEach((e) => { if (depth.has(e.from) && (!depth.has(e.to) || depth.get(e.to) < depth.get(e.from) + 1) && depth.get(e.from) < nodes.length) depth.set(e.to, depth.get(e.from) + 1); });
      nodes.forEach((x, i) => { if (!depth.has(x.id)) depth.set(x.id, i ? 1 : 0); });
      const levels = []; nodes.forEach((x) => { const dd = depth.get(x.id); (levels[dd] = levels[dd] || []).push(x); });
      const maxCols = narrow ? 2 : 4; const bh = narrow ? 58 : 60; const gy = narrow ? 40 : 50; let y = 20 + bh / 2; const pad = 14;
      levels.filter(Boolean).forEach((lvl) => {
        for (let s = 0; s < lvl.length; s += maxCols) {
          const row = lvl.slice(s, s + maxCols); const gx = 20; const bw = Math.min(narrow ? 160 : 200, (W - pad * 2 - gx * (row.length - 1)) / row.length);
          const total = row.length * bw + (row.length - 1) * gx; let x = (W - total) / 2 + bw / 2;
          row.forEach((nd) => { body += box(nd, x, y, bw, bh); x += bw + gx; });
          y += bh + gy;
        }
      });
      H = y - gy - bh / 2 + 20;
      edges.forEach((e) => {
        const a = idx.get(e.from), b = idx.get(e.to);
        if (b.y > a.y) { const y1 = a.y + a.h / 2, y2 = b.y - b.h / 2 - 5, my = (y1 + y2) / 2; edgeSvg += `<path class="d-edge" d="M${a.x},${y1} C${a.x},${my} ${b.x},${my} ${b.x},${y2}" marker-end="${arrow}"/>` + (narrow ? "" : label((a.x + b.x) / 2, my, e.label)); }
        else edgeSvg += straight(a, b, e.label, 30);
      });
    } else if (type === "layers") {
      const n = nodes.length; const bh = narrow ? 54 : 58; const gy = 8; const pad = 10; const step = narrow ? 10 : 26;
      nodes.forEach((nd, i) => {
        const w = W - pad * 2 - (n - 1 - i) * step * 2; const y = 14 + bh / 2 + i * (bh + gy);
        nd.x = W / 2; nd.y = y; nd.w = w; nd.h = bh;
        body += `<g class="d-node k${(i % 3) + 1}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(nd.label)}"><rect x="${W / 2 - w / 2}" y="${y - bh / 2}" width="${w}" height="${bh}" rx="10"/>${textBlock(W / 2, y, nd.label, Math.floor(w / (fs * 0.55)), fs)}</g>`;
      });
      H = 14 + n * (bh + gy) + 8;
    }

    const svg = `<svg viewBox="0 0 ${W} ${Math.ceil(H)}" role="img" aria-label="${esc(d.title || "Diagram")}">
      <defs><marker id="${id}-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="d-arrow" d="M0,0 L10,5 L0,10 z"/></marker></defs>
      <g>${edgeSvg}</g><g>${body}</g></svg>`;
    const legend = `<ul class="d-legend">${nodes.map((n) => `<li data-i="${n.i}"><span class="n">${type === "flow" || type === "cycle" ? n.i + 1 : "•"}</span><span><b>${esc(n.label)}</b>${esc(n.detail || "")}</span></li>`).join("")}</ul>`;
    return `<div class="diagram" data-dg="${id}">
      <div class="diagram-svg">${svg}</div>${d.note ? `<p class="d-note">${esc(d.note)}</p>` : ""}${legend}</div>`;
  }
  // Each diagram placeholder holds its spec; we render at the width that fits and re-render on resize.
  const diagramSpecs = new Map(); let dgSeq = 0;
  function diagramSlot(spec) { const k = "slot" + (++dgSeq); diagramSpecs.set(k, spec); return `<div class="dslot" data-slot="${k}"></div>`; }
  function mountDiagrams(root) {
    (root || app).querySelectorAll(".dslot").forEach((el) => {
      const narrow = el.clientWidth < 560; if (el.dataset.narrow === String(narrow) && el.innerHTML) return;
      el.dataset.narrow = String(narrow); el.innerHTML = renderDiagram(diagramSpecs.get(el.dataset.slot), narrow);
      const legendItems = el.querySelectorAll(".d-legend li"); const gs = el.querySelectorAll(".d-node");
      const activate = (i) => { gs.forEach((g) => g.classList.toggle("active", g.dataset.i === i)); legendItems.forEach((l) => l.classList.toggle("active", l.dataset.i === i)); };
      gs.forEach((g) => { g.addEventListener("click", () => activate(g.dataset.i)); g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(g.dataset.i); } }); });
      legendItems.forEach((l) => l.addEventListener("click", () => activate(l.dataset.i)));
    });
  }
  let rT; window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => mountDiagrams(), 150); });

  /* ================= QUIZ ================= */
  function quizHTML(qs, showSource) {
    return `<div class="quiz">${qs.map((q, qi) => `
      <div class="q" data-q="${qi}">
        <div class="q-title">${qi + 1}. ${esc(q.q)}</div>
        <div class="q-opts">${q.options.map((o, oi) => `<button class="q-opt" data-o="${oi}"><span class="k">${"ABCD"[oi]}</span><span>${esc(o)}</span></button>`).join("")}</div>
        <div class="q-explain" hidden></div>
        ${showSource && q.n ? `<div class="q-src muted">From <a href="#s${q.n}">Session ${q.n}: ${esc(byN.get(q.n).topic)}</a></div>` : ""}
      </div>`).join("")}<div class="score" hidden></div></div>`;
  }
  function wireQuiz(root, qs, onFinish) {
    let answered = 0, right = 0;
    root.querySelectorAll(".q").forEach((qEl) => {
      const q = qs[+qEl.dataset.q];
      qEl.querySelectorAll(".q-opt").forEach((b) => b.addEventListener("click", () => {
        const o = +b.dataset.o; const ok = o === q.answer;
        qEl.querySelectorAll(".q-opt").forEach((x) => { x.disabled = true; if (+x.dataset.o === q.answer) x.classList.add("right"); });
        if (!ok) b.classList.add("wrong");
        const ex = qEl.querySelector(".q-explain"); ex.hidden = false; ex.innerHTML = `<b>${ok ? "Correct." : "Not quite."}</b> ${esc(q.explain || "")}`;
        answered++; if (ok) right++;
        if (answered === qs.length) {
          const sc = root.querySelector(".score"); sc.hidden = false;
          const pct = Math.round((right / qs.length) * 100);
          sc.innerHTML = `<span class="score-num">${right}/${qs.length}</span><span>${pct >= 80 ? "Excellent. You have a firm grasp of this." : pct >= 50 ? "Good progress. Review the explanations above." : "Worth another look at the key ideas and diagram."}</span>`;
          onFinish && onFinish(right, qs.length);
        }
      }));
    });
  }

  /* ================= VIEWS ================= */
  function journeyStrip() {
    return `<div class="journey"><div class="journey-track">${S.map((s) => `<button class="jdot ${s.vol} ${done.has(s.n) ? "done" : ""}" title="Session ${s.n}: ${esc(s.topic)}" aria-label="Session ${s.n}: ${esc(s.topic)}" data-go="${s.n}"></button>`).join("")}</div></div>
      <div class="journey-legend">${D.volumes.map((v) => `<span><i style="background:var(--${v.color})"></i>${esc(v.short)}</span>`).join("")}<span class="tab-nums">${done.size} of ${S.length} sessions complete</span></div>`;
  }
  function viewHome() {
    const next = S.find((s) => !done.has(s.n)) || S[0];
    const X = D.extras;
    return `<div class="stack-lg fade-in">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Dr Bruce Wauchope · ${S.length} sessions · Perichoresis Australia</span>
          <h1>The Gospel and <em>Soul Health</em></h1>
          <p class="lead">${esc(X.thesis)}</p>
          <p class="hero-verse">“${esc(X.verse.text)}” <b>${esc(X.verse.ref)}</b></p>
          <div class="btn-row">
            <a class="btn" href="#s${next.n}">${done.size ? "Continue" : "Start"} with Session ${next.n}</a>
            <a class="btn ghost" href="#map">Explore the course map</a>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat"><b>${D.volumes.length}</b><span>volumes</span></div>
          <div class="stat"><b>${S.length}</b><span>sessions</span></div>
          <div class="stat"><b class="tab-nums">${Math.round(S.reduce((a, s) => a + (s.minutes || 0), 0) / 60)}h</b><span>of teaching</span></div>
          <div class="stat"><b>${X.cases.length + S.length}</b><span>case studies</span></div>
          <div class="stat"><b>${X.situations.length}</b><span>toolkit guides</span></div>
          <div class="stat"><b>${S.reduce((a, s) => a + s.quiz.length, 0)}</b><span>quiz questions</span></div>
        </div>
      </section>

      <section class="stack">
        <div class="section-head"><div><span class="eyebrow">The framework</span><h2>${esc(X.framework.title)}: the whole series in seven movements</h2></div></div>
        <figure class="hero-figure" style="margin:0">${diagramSlot(X.framework)}</figure>
      </section>

      <section class="stack">
        <div class="section-head"><div><span class="eyebrow">Your journey</span><h2>${S.length} sessions, three movements</h2></div><span class="muted" style="font-size:var(--fs-sm)">Tap a bar to open that session</span></div>
        ${journeyStrip()}
      </section>

      <section class="stack">
        <div class="section-head"><div><span class="eyebrow">Structure</span><h2>The volumes</h2></div></div>
        <div class="vol-grid">${D.volumes.map((v) => {
          const ns = v.chapters.flatMap((c) => c.sessions); const pct = Math.round((ns.filter((n) => done.has(n)).length / ns.length) * 100);
          return `<article class="card vol-card"><span class="tag ${v.id}">${esc(v.short)}</span><h3>${esc(v.name)}</h3><p class="muted" style="font-size:var(--fs-sm)">${esc(v.desc)}</p>
            <div class="progress" title="${pct}% complete"><i style="width:${pct}%;background:var(--${v.color})"></i></div>
            <ol>${v.chapters.map((c) => `<li><a href="#s${c.sessions[0]}"><span>${esc(c.name)}</span><span class="muted tab-nums">${c.sessions.length > 1 ? c.sessions[0] + "–" + c.sessions[c.sessions.length - 1] : c.sessions[0]}</span></a></li>`).join("")}</ol></article>`;
        }).join("")}</div>
      </section>

      <section class="stack">
        <div class="section-head"><div><span class="eyebrow">Big ideas</span><h2>Threads that run through the whole series</h2></div></div>
        <div class="ideas">${X.bigIdeas.map((b) => `<div class="idea"><b>${esc(b.title)}</b><p>${esc(b.text)}</p>${b.ref ? `<span class="ref">${esc(b.ref)}</span>` : ""}<div class="chips">${(b.sessions || []).map((n) => sLink(n, "S" + n)).join("")}</div></div>`).join("")}</div>
      </section>

      <section class="stack">
        <div class="section-head"><div><span class="eyebrow">The healing pathway</span><h2>${esc(X.pathway.title)}</h2></div></div>
        <div class="card">${diagramSlot(X.pathway)}</div>
      </section>
    </div>`;
  }

  /* ---- radial mind map ---- */
  let mapZoom = 1;
  function viewMap() {
    return `<div class="stack fade-in">
      <div class="section-head"><div><span class="eyebrow">Course map</span><h2>Every session at a glance</h2></div>
      <p class="muted" style="font-size:var(--fs-sm);max-width:52ch">Volumes sit at the centre, chapters in the middle ring and sessions on the outside. Tap any session to open it. Completed sessions are ringed.</p></div>
      <div class="map-wrap" id="mapWrap"><div class="map-tools"><button class="icon-btn" id="zIn" aria-label="Zoom in">+</button><button class="icon-btn" id="zOut" aria-label="Zoom out">−</button><button class="icon-btn" id="zFit" aria-label="Fit to screen" style="font-size:11px;font-weight:700">FIT</button></div><div id="mapSvg"></div></div>
      <div class="chips">${D.volumes.map((v) => `<span class="tag ${v.id}">${esc(v.short)}: ${esc(v.name)}</span>`).join("")}</div>
    </div>`;
  }
  function drawMap() {
    const host = document.getElementById("mapSvg"); if (!host) return;
    const W = 1500, C = W / 2, r1 = 150, r2 = 330, r3 = 470;
    const leaves = []; D.volumes.forEach((v) => v.chapters.forEach((c) => c.sessions.forEach((n) => leaves.push({ n, v, c }))));
    const gapCount = D.volumes.length; const total = leaves.length + gapCount * 1.5;
    let pos = 0.75; const ang = new Map();
    D.volumes.forEach((v) => { v.chapters.forEach((c) => c.sessions.forEach((n) => { ang.set(n, (pos / total) * Math.PI * 2 - Math.PI / 2); pos += 1; })); pos += 1.5; });
    const P = (r, a) => [C + r * Math.cos(a), C + r * Math.sin(a)];
    const curve = (r0, a0, r1_, a1) => { const [x0, y0] = P(r0, a0); const [x1, y1] = P(r1_, a1); const rm = (r0 + r1_) / 2; const [cx0, cy0] = P(rm, a0); const [cx1, cy1] = P(rm, a1); return `M${x0},${y0} C${cx0},${cy0} ${cx1},${cy1} ${x1},${y1}`; };
    let links = "", nodes = "";
    D.volumes.forEach((v) => {
      const vAngles = v.chapters.flatMap((c) => c.sessions.map((n) => ang.get(n)));
      const va = (Math.min(...vAngles) + Math.max(...vAngles)) / 2; const col = `var(--${v.color})`;
      links += `<path class="m-link" stroke="${col}" d="${curve(46, va, r1, va)}"/>`;
      v.chapters.forEach((c) => {
        const cAngles = c.sessions.map((n) => ang.get(n)); const ca = (Math.min(...cAngles) + Math.max(...cAngles)) / 2;
        links += `<path class="m-link" stroke="${col}" d="${curve(r1, va, r2, ca)}"/>`;
        c.sessions.forEach((n) => { links += `<path class="m-link" stroke="${col}" d="${curve(r2, ca, r3, ang.get(n))}"/>`; });
        const [cx, cy] = P(r2, ca); const deg = (ca * 180) / Math.PI; const flip = deg > 90 && deg < 270;
        nodes += `<g class="m-node" data-go="${c.sessions[0]}" data-tip="${esc(c.name)}"><circle cx="${cx}" cy="${cy}" r="9" fill="${col}"/>
          <text transform="translate(${cx},${cy}) rotate(${flip ? deg - 180 : deg})" x="${flip ? -14 : 14}" text-anchor="${flip ? "end" : "start"}" dominant-baseline="central" font-size="13" font-weight="700">${esc(c.short || c.name).slice(0, 26)}</text></g>`;
      });
      const [vx, vy] = P(r1, va);
      nodes += `<g class="m-node" data-go="${v.chapters[0].sessions[0]}" data-tip="${esc(v.name)}"><circle cx="${vx}" cy="${vy}" r="30" fill="${col}"/>${textBlock(vx, vy + 46, v.short, 14, 15, 'font-weight="800"')}</g>`;
    });
    leaves.forEach(({ n, v }) => {
      const s = byN.get(n); const a = ang.get(n); const [x, y] = P(r3, a); const deg = (a * 180) / Math.PI; const flip = deg > 90 && deg < 270;
      const t = `${n} · ${s.topic}`; const lab = t.length > 44 ? t.slice(0, 43) + "…" : t;
      nodes += `<g class="m-node ${done.has(n) ? "done" : ""}" data-go="${n}" data-tip="Session ${n}: ${esc(s.topic)}"><circle cx="${x}" cy="${y}" r="7" fill="var(--${v.color})"/>
        <text transform="translate(${x},${y}) rotate(${flip ? deg - 180 : deg})" x="${flip ? -13 : 13}" text-anchor="${flip ? "end" : "start"}" dominant-baseline="central" font-size="12.5">${esc(lab)}</text></g>`;
    });
    const root = `<circle class="m-root" cx="${C}" cy="${C}" r="62"/>${textBlock(C, C, "Gospel & Soul Health", 10, 15, 'class="m-root-text"')}`;
    host.innerHTML = `<svg id="mindmap" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}" role="img" aria-label="Radial map of all sessions">${links}${root}${nodes}</svg>`;
    const wrap = document.getElementById("mapWrap"); const svg = document.getElementById("mindmap");
    const fit = () => { mapZoom = Math.max(0.25, Math.min(1, (wrap.clientWidth - 4) / W, (wrap.clientHeight - 60) / W)); apply(); wrap.scrollLeft = (W * mapZoom - wrap.clientWidth) / 2; wrap.scrollTop = 0; };
    const apply = () => { svg.setAttribute("width", W * mapZoom); svg.setAttribute("height", W * mapZoom); };
    document.getElementById("zIn").onclick = () => { mapZoom = Math.min(2.2, mapZoom * 1.25); apply(); };
    document.getElementById("zOut").onclick = () => { mapZoom = Math.max(0.3, mapZoom / 1.25); apply(); };
    document.getElementById("zFit").onclick = fit; fit();
    const tip = document.createElement("div"); tip.className = "map-tip"; tip.hidden = true; document.body.appendChild(tip);
    svg.querySelectorAll(".m-node").forEach((g) => {
      g.addEventListener("mousemove", (e) => { tip.hidden = false; tip.textContent = g.dataset.tip; tip.style.left = e.clientX + 14 + "px"; tip.style.top = e.clientY + 14 + "px"; });
      g.addEventListener("mouseleave", () => { tip.hidden = true; });
      g.addEventListener("click", () => { tip.remove(); location.hash = "s" + g.dataset.go; });
    });
  }

  /* ---- session ---- */
  function sessionIndex(cur) {
    return `<aside class="sess-index" id="sessIndex" data-collapsed="true">
      <div style="display:flex;gap:8px;align-items:center"><input class="search" id="sessFilter" placeholder="Search sessions" aria-label="Search sessions"><button class="btn ghost small index-toggle" id="idxToggle">List</button></div>
      <div class="index-body">${D.volumes.map((v) => `<details ${v.chapters.some((c) => c.sessions.includes(cur)) ? "open" : ""}><summary><span>${esc(v.short)} · ${esc(v.name)}</span></summary>
        ${v.chapters.map((c) => `<div class="ch">${esc(c.name)}</div>${c.sessions.map((n) => `<a href="#s${n}" data-txt="${esc((n + " " + byN.get(n).topic + " " + byN.get(n).summary).toLowerCase())}" ${n === cur ? 'aria-current="page"' : ""}><span class="n">${n}</span><span>${esc(byN.get(n).topic)}</span><span class="ok">${done.has(n) ? "✓" : ""}</span></a>`).join("")}`).join("")}
      </details>`).join("")}</div></aside>`;
  }
  function viewSession(n) {
    const s = byN.get(n); if (!s) return viewSession(1);
    store.set("last", n);
    const v = volOf(s.vol); const prev = byN.get(n - 1), next = byN.get(n + 1);
    const jr = journal[n] || {};
    const glyph = (k) => `<span class="glyph" aria-hidden="true">${ICON[k]}</span>`;
    return `<div class="sess-layout fade-in">${sessionIndex(n)}
      <article class="sess">
        <header class="sess-head">
          <div class="sess-meta"><span class="tag ${s.vol}">${esc(v.short)}</span><span>${esc(s.chapterName)}</span><span class="tab-nums">Session ${n} of ${S.length}</span>${s.minutes ? `<span class="tab-nums">${s.minutes} min</span>` : ""}</div>
          <h1>${esc(s.topic)}</h1>
          <div class="btn-row"><a class="btn" href="${yt(s.videoId)}" target="_blank" rel="noopener">${ICON.play} Watch on YouTube</a>
            <button class="btn ghost done-btn" id="doneBtn" aria-pressed="${done.has(n)}">${done.has(n) ? "Completed ✓" : "Mark as complete"}</button></div>
        </header>
        <nav class="jump" aria-label="Jump to section">${[["ov", "Overview"], ["dg", "Diagram"], ["kp", "Key ideas"], ["tm", "Concepts"], ["cs", "Case study"], ["pr", "Practice"], ["rf", "Reflect"], ["qz", "Quiz"]].map(([k, l]) => `<button class="chip" data-jump="${k}">${l}</button>`).join("")}</nav>

        <section class="block" id="b-ov"><p class="summary">${esc(s.summary)}</p>
          ${s.quotes && s.quotes.length ? `<div class="quotes">${s.quotes.map((q) => `<blockquote class="quote"><p>${esc(q)}</p></blockquote>`).join("")}</div>` : ""}
          ${s.scriptures && s.scriptures.length ? `<div class="stack" style="gap:8px"><span class="eyebrow">Scriptures in this session</span><div class="scripture">${s.scriptures.map((r) => `<a class="chip" href="${bible(r)}" target="_blank" rel="noopener">${esc(r)}</a>`).join("")}</div></div>` : ""}
        </section>

        <section class="block" id="b-dg"><h2>${glyph("map")}${esc(s.diagram.title || "Visual map")}</h2><div class="card">${diagramSlot(s.diagram)}</div></section>

        <section class="block" id="b-kp"><h2>${glyph("idea")}Key ideas, in the order taught</h2><ol class="points">${s.keyPoints.map((p) => `<li><p>${esc(p)}</p></li>`).join("")}</ol></section>

        <section class="block" id="b-tm"><h2>${glyph("card")}Concept cards</h2><p class="muted" style="font-size:var(--fs-sm)">Tap a card to flip it and see the definition.</p>
          <div class="flash">${s.keyTerms.map((t) => `<button class="fcard"><div class="fcard-inner"><div class="fface"><b>${esc(t.term)}</b><small>Tap to reveal</small></div><div class="fface back">${esc(t.definition)}</div></div></button>`).join("")}</div></section>

        <section class="block" id="b-cs"><h2>${glyph("user")}Case study: ${esc(s.caseStudy.title)}</h2>
          <div class="case"><div class="case-scn"><span class="eyebrow">The situation</span><p>${esc(s.caseStudy.scenario)}</p></div>
          <div class="case-grid"><div class="stack" style="gap:8px"><span class="eyebrow">Through the lens of this session</span><p>${esc(s.caseStudy.analysis)}</p></div>
          <div class="stack" style="gap:10px"><span class="eyebrow">A pathway forward</span><ol class="steps">${s.caseStudy.pathway.map((p) => `<li><span>${esc(p)}</span></li>`).join("")}</ol></div></div></div></section>

        <section class="block" id="b-pr"><h2>${glyph("leaf")}Practices</h2><div class="practices">${s.practices.map((p) => `<div class="practice"><b>${esc(p.name)}</b><p>${esc(p.how)}</p></div>`).join("")}</div></section>

        <section class="block" id="b-rf"><h2>${glyph("pen")}Reflect</h2><p class="muted" style="font-size:var(--fs-sm)">Your answers stay in this browser only.</p>
          <div class="reflect">${s.reflection.map((r, i) => `<div><label for="rf-${n}-${i}">${esc(r)}</label><textarea id="rf-${n}-${i}" data-ri="${i}">${esc(jr[i] || "")}</textarea></div>`).join("")}<span class="saved" id="savedNote" hidden>Saved</span></div></section>

        <section class="block" id="b-qz"><h2>${glyph("check")}Check your understanding</h2><div id="sessQuiz">${quizHTML(s.quiz)}</div></section>

        <footer class="sess-foot">
          ${prev ? `<a class="btn ghost" href="#s${prev.n}">← ${prev.n}. ${esc(prev.topic)}</a>` : "<span></span>"}
          ${next ? `<a class="btn" href="#s${next.n}">${next.n}. ${esc(next.topic)} →</a>` : `<a class="btn" href="#quiz">Take the final review quiz →</a>`}
        </footer>
      </article></div>`;
  }
  function wireSession(n) {
    const s = byN.get(n);
    document.getElementById("doneBtn").addEventListener("click", (e) => {
      if (done.has(n)) done.delete(n); else done.add(n); saveDone();
      e.currentTarget.setAttribute("aria-pressed", String(done.has(n))); e.currentTarget.textContent = done.has(n) ? "Completed ✓" : "Mark as complete";
      const a = document.querySelector(`.sess-index a[href="#s${n}"] .ok`); if (a) a.textContent = done.has(n) ? "✓" : "";
    });
    app.querySelectorAll("[data-jump]").forEach((b) => b.addEventListener("click", () => document.getElementById("b-" + b.dataset.jump).scrollIntoView({ behavior: "smooth", block: "start" })));
    app.querySelectorAll(".fcard").forEach((c) => c.addEventListener("click", () => c.classList.toggle("flipped")));
    let t; app.querySelectorAll(".reflect textarea").forEach((ta) => ta.addEventListener("input", () => {
      journal[n] = journal[n] || {}; journal[n][ta.dataset.ri] = ta.value; clearTimeout(t);
      t = setTimeout(() => { store.set("journal", journal); const sn = document.getElementById("savedNote"); sn.hidden = false; setTimeout(() => { sn.hidden = true; }, 1200); }, 400);
    }));
    wireQuiz(document.getElementById("sessQuiz"), s.quiz, (r, tot) => { if (r / tot >= 0.67 && !done.has(n)) { done.add(n); saveDone(); const b = document.getElementById("doneBtn"); b.setAttribute("aria-pressed", "true"); b.textContent = "Completed ✓"; } });
    const f = document.getElementById("sessFilter");
    f.addEventListener("input", () => { const q = f.value.trim().toLowerCase(); app.querySelectorAll(".sess-index details").forEach((d) => { if (q) d.open = true; }); app.querySelectorAll(".sess-index a").forEach((a) => { a.hidden = q && !a.dataset.txt.includes(q); }); document.getElementById("sessIndex").dataset.collapsed = q ? "false" : document.getElementById("sessIndex").dataset.collapsed; });
    document.getElementById("idxToggle").addEventListener("click", () => { const el = document.getElementById("sessIndex"); el.dataset.collapsed = el.dataset.collapsed === "true" ? "false" : "true"; });
  }

  /* ---- case studies ---- */
  let caseFilter = "all";
  function viewCases() {
    const X = D.extras;
    const list = S.filter((s) => caseFilter === "all" || s.vol === caseFilter);
    return `<div class="stack-lg fade-in">
      <div class="section-head"><div><span class="eyebrow">Case studies</span><h2>The teaching applied to real lives</h2></div>
        <p class="muted" style="font-size:var(--fs-sm);max-width:56ch">Extended journeys that draw on several sessions, followed by a case study for every session. All people are composites; none are real clients.</p></div>
      <section class="feature-cases">${X.cases.map((c) => `
        <article class="feature">
          <div class="feature-head"><div class="persona"><span class="avatar">${esc(c.initials)}</span><div><h3>${esc(c.title)}</h3><span class="muted" style="font-size:var(--fs-sm)">${esc(c.who)}</span></div></div>
            <div class="chips">${c.sessions.map((n) => sLink(n, "S" + n)).join("")}</div></div>
          <div class="case-scn"><span class="eyebrow">Presenting story</span><p>${esc(c.story)}</p></div>
          <div class="cols-2">
            <div class="stack" style="gap:10px"><span class="eyebrow">What is going on underneath</span>${c.lenses.map((l) => `<p style="font-size:var(--fs-sm)"><b>${esc(l.lens)}.</b> ${esc(l.insight)}</p>`).join("")}</div>
            <div class="stack" style="gap:10px"><span class="eyebrow">Practical plan</span><ol class="steps">${c.plan.map((p) => `<li><span>${esc(p)}</span></li>`).join("")}</ol></div>
          </div>
          <div class="stack" style="gap:8px"><span class="eyebrow">The journey, mapped</span>${diagramSlot(c.journey)}</div>
          ${c.caution ? `<p class="muted" style="font-size:var(--fs-xs)"><b>Care note:</b> ${esc(c.caution)}</p>` : ""}
        </article>`).join("")}</section>
      <section class="stack">
        <div class="section-head"><h2>Session case studies</h2>
          <div class="chips" role="group" aria-label="Filter by volume"><button class="chip" data-cf="all" aria-pressed="${caseFilter === "all"}">All</button>${D.volumes.map((v) => `<button class="chip" data-cf="${v.id}" aria-pressed="${caseFilter === v.id}">${esc(v.short)}</button>`).join("")}</div></div>
        <div class="acc">${list.map((s) => `<details><summary><span><span class="tag ${s.vol}" style="margin-right:8px">S${s.n}</span>${esc(s.caseStudy.title)}</span></summary>
          <div class="body"><p>${esc(s.caseStudy.scenario)}</p><p class="muted" style="font-size:var(--fs-sm)">${esc(s.caseStudy.analysis)}</p><ol class="steps">${s.caseStudy.pathway.map((p) => `<li><span>${esc(p)}</span></li>`).join("")}</ol><div><a class="btn ghost small" href="#s${s.n}">Open Session ${s.n}: ${esc(s.topic)}</a></div></div></details>`).join("")}</div>
      </section></div>`;
  }

  /* ---- toolkit ---- */
  let sitSel = null;
  function viewToolkit() {
    const X = D.extras; const sit = X.situations.find((x) => x.id === sitSel) || X.situations[0]; sitSel = sit.id;
    return `<div class="stack-lg fade-in">
      <div class="section-head"><div><span class="eyebrow">Practical toolkit</span><h2>What are you facing?</h2></div>
        <p class="muted" style="font-size:var(--fs-sm);max-width:56ch">Choose a struggle to see how the series understands it, a step-by-step path, practices to try and the sessions to revisit.</p></div>
      <div class="situations" role="group" aria-label="Situations">${X.situations.map((x) => `<button class="sit" data-sit="${x.id}" aria-pressed="${x.id === sit.id}"><b>${esc(x.name)}</b><span>${esc(x.hint)}</span></button>`).join("")}</div>
      <section class="sit-panel" id="sitPanel">
        <div class="stack" style="gap:8px"><span class="eyebrow">Understanding it</span><h3>${esc(sit.name)}</h3><p style="max-width:var(--read)">${esc(sit.understanding)}</p></div>
        <div class="stack" style="gap:8px"><span class="eyebrow">The pattern and the way through</span>${diagramSlot(sit.flow)}</div>
        <div class="cols-2">
          <div class="stack" style="gap:10px"><span class="eyebrow">Steps to take</span><ol class="steps">${sit.steps.map((p) => `<li><span>${esc(p)}</span></li>`).join("")}</ol></div>
          <div class="stack" style="gap:10px"><span class="eyebrow">Practices</span>${sit.practices.map((p) => `<div class="practice"><b>${esc(p.name)}</b><p>${esc(p.how)}</p></div>`).join("")}</div>
        </div>
        <div class="stack" style="gap:8px"><span class="eyebrow">Sessions to revisit</span><div class="chips">${sit.sessions.map((n) => sLink(n, n + ". " + byN.get(n).topic)).join("")}</div></div>
        ${sit.scripture && sit.scripture.length ? `<div class="stack" style="gap:8px"><span class="eyebrow">Scriptures to sit with</span><div class="chips">${sit.scripture.map((r) => `<a class="chip" href="${bible(r)}" target="_blank" rel="noopener">${esc(r)}</a>`).join("")}</div></div>` : ""}
        <p class="muted" style="font-size:var(--fs-xs)"><b>Care note:</b> ${esc(sit.caution || X.careNote)}</p>
      </section>
      <section class="stack">
        <div class="section-head"><h2>Every practice in the series</h2><input class="search" id="prFilter" placeholder="Search practices" aria-label="Search practices" style="max-width:320px"></div>
        <div class="practices" id="allPractices">${S.flatMap((s) => s.practices.map((p) => `<div class="practice" data-txt="${esc((p.name + " " + p.how).toLowerCase())}"><b>${esc(p.name)}</b><p>${esc(p.how)}</p><a class="from" href="#s${s.n}">Session ${s.n}</a></div>`)).join("")}</div>
      </section></div>`;
  }

  /* ---- glossary ---- */
  function viewGlossary() {
    const map = new Map();
    S.forEach((s) => s.keyTerms.forEach((t) => { const k = t.term.trim(); const key = k.toLowerCase(); if (!map.has(key)) map.set(key, { term: k, def: t.definition, ns: [s.n] }); else if (!map.get(key).ns.includes(s.n)) map.get(key).ns.push(s.n); }));
    const items = [...map.values()].sort((a, b) => a.term.replace(/^[^a-z0-9]+/i, "").localeCompare(b.term.replace(/^[^a-z0-9]+/i, ""), undefined, { sensitivity: "base" }));
    const groups = {}; items.forEach((it) => { const L = (it.term.replace(/^[^a-z0-9]+/i, "")[0] || "#").toUpperCase(); (groups[L] = groups[L] || []).push(it); });
    return `<div class="stack fade-in">
      <div class="section-head"><div><span class="eyebrow">Glossary</span><h2>${items.length} terms from the series</h2></div><input class="search" id="glFilter" placeholder="Search terms" aria-label="Search terms" style="max-width:320px"></div>
      <div class="glossary" id="glossary">${Object.keys(groups).sort().map((L) => `<div class="gl-letter"><h3>${L}</h3>${groups[L].map((it) => `<div class="gl-item" data-txt="${esc((it.term + " " + it.def).toLowerCase())}"><b>${esc(it.term)}</b><p>${esc(it.def)}</p>${it.ns.map((n) => `<a href="#s${n}">Session ${n}</a>`).join("")}</div>`).join("")}</div>`).join("")}</div></div>`;
  }

  /* ---- quiz ---- */
  let quizScope = "all";
  function viewQuiz() {
    const pool = S.filter((s) => quizScope === "all" || s.vol === quizScope).flatMap((s) => s.quiz.map((q) => Object.assign({ n: s.n }, q)));
    const qs = shuffle(pool).slice(0, 10);
    viewQuiz.current = qs;
    const best = store.get("best", {});
    return `<div class="stack fade-in" style="max-width:820px">
      <div class="section-head"><div><span class="eyebrow">Review quiz</span><h2>Ten questions drawn from ${quizScope === "all" ? "the whole series" : esc(volOf(quizScope).name)}</h2></div></div>
      <div class="chips" role="group" aria-label="Quiz scope"><button class="chip" data-qs="all" aria-pressed="${quizScope === "all"}">Whole series</button>${D.volumes.map((v) => `<button class="chip" data-qs="${v.id}" aria-pressed="${quizScope === v.id}">${esc(v.short)}</button>`).join("")}<button class="chip" id="newQuiz">New questions ↻</button></div>
      ${best[quizScope] != null ? `<p class="muted tab-nums" style="font-size:var(--fs-sm)">Your best score here: ${best[quizScope]}/10</p>` : ""}
      <div id="bigQuiz">${quizHTML(qs, true)}</div></div>`;
  }

  /* ================= ROUTER ================= */
  function route() {
    const h = (location.hash || "#home").slice(1);
    let r = h; let n = null;
    const m = /^s(\d+)$/.exec(h); if (m) { r = "sessions"; n = +m[1]; }
    if (h === "sessions") { n = store.get("last", 1); r = "sessions"; }
    document.querySelectorAll("#topnav a").forEach((a) => a.setAttribute("aria-current", a.dataset.r === r ? "page" : "false"));
    diagramSpecs.clear();
    let html;
    switch (r) {
      case "map": html = viewMap(); break;
      case "sessions": html = viewSession(byN.has(n) ? n : 1); break;
      case "cases": html = viewCases(); break;
      case "toolkit": html = viewToolkit(); break;
      case "glossary": html = viewGlossary(); break;
      case "quiz": html = viewQuiz(); break;
      default: html = viewHome(); r = "home";
    }
    app.innerHTML = html;
    window.scrollTo(0, 0);
    mountDiagrams();
    app.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => { location.hash = "s" + b.dataset.go; }));
    if (r === "map") drawMap();
    if (r === "sessions") wireSession(byN.has(n) ? n : 1);
    if (r === "cases") app.querySelectorAll("[data-cf]").forEach((b) => b.addEventListener("click", () => { caseFilter = b.dataset.cf; route(); }));
    if (r === "toolkit") {
      app.querySelectorAll("[data-sit]").forEach((b) => b.addEventListener("click", () => { sitSel = b.dataset.sit; const y = window.scrollY; route(); window.scrollTo(0, y); document.getElementById("sitPanel").scrollIntoView({ behavior: "smooth", block: "start" }); }));
      const f = document.getElementById("prFilter"); f.addEventListener("input", () => { const q = f.value.trim().toLowerCase(); document.querySelectorAll("#allPractices .practice").forEach((p) => { p.hidden = q && !p.dataset.txt.includes(q); }); });
    }
    if (r === "glossary") { const f = document.getElementById("glFilter"); f.addEventListener("input", () => { const q = f.value.trim().toLowerCase(); document.querySelectorAll(".gl-item").forEach((p) => { p.hidden = q && !p.dataset.txt.includes(q); }); document.querySelectorAll(".gl-letter").forEach((g) => { g.hidden = ![...g.querySelectorAll(".gl-item")].some((i) => !i.hidden); }); }); }
    if (r === "quiz") {
      app.querySelectorAll("[data-qs]").forEach((b) => b.addEventListener("click", () => { quizScope = b.dataset.qs; route(); }));
      document.getElementById("newQuiz").addEventListener("click", () => route());
      wireQuiz(document.getElementById("bigQuiz"), viewQuiz.current, (right) => { const best = store.get("best", {}); if (best[quizScope] == null || right > best[quizScope]) { best[quizScope] = right; store.set("best", best); } });
    }
  }
  shell();
  window.addEventListener("hashchange", route);
  route();
})();
