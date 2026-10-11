(() => {
  const DATA = window.__PREP__;
  const STORE = "millersville-storm-prep-v1";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE) || "{}");
    } catch {
      return {};
    }
  }
  function save(state) {
    localStorage.setItem(STORE, JSON.stringify(state));
  }

  let state = Object.assign({ checked: {}, timelineDone: {} }, load());

  function allItems() {
    return (DATA.categories || []).flatMap((c) => c.items || []);
  }

  function progress() {
    const items = allItems();
    const done = items.filter((i) => state.checked[i.id]).length;
    return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
  }

  function updatePills() {
    const p = progress();
    const pill = $("#progressPill");
    if (pill) pill.textContent = `${p.pct}% ready · ${p.done}/${p.total}`;
    const foot = $("#footPts");
    if (foot) foot.textContent = `${p.done} of ${p.total} prep items`;
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderPrep() {
    const root = $("#view-prep");
    const p = progress();
    const h = DATA.home;
    const people = (DATA.household || [])
      .map((x) => {
        const kid = x.role === "Kid" ? " kid" : "";
        const age = x.age ? ` · ${x.age}` : "";
        return `<span class="person${kid}">${esc(x.name)}${age}</span>`;
      })
      .join("");
    root.innerHTML = `
      <div class="hero-grid">
        <div class="panel">
          <h2 class="view-title">Storm &amp; outage board</h2>
          <p class="lede">BGE-minded prep for the Boyd home. Checklist saves locally. Not a substitute for official alerts.</p>
          <p class="addr">${esc(h.address)}, ${esc(h.city)} ${esc(h.state)} ${esc(h.zip)} · ${esc(h.utility)}</p>
          <div class="people">${people}</div>
          <div class="stat-row">
            <div class="stat"><b>${p.pct}%</b><span>ready</span></div>
            <div class="stat"><b>${p.done}</b><span>done</span></div>
            <div class="stat"><b>${p.total - p.done}</b><span>left</span></div>
          </div>
        </div>
        <div class="panel soft-panel">
          <h3 style="margin:0 0 .4rem">Char &amp; Vic</h3>
          <p class="hint" style="margin:0">Ages ~13 / ~11. Go-bag clothes, charged devices, comfort item, calm talk-through before winds. Kids only: Charlotte and Victor.</p>
        </div>
      </div>
      <div class="cat-grid" id="catGrid"></div>`;
    const grid = $("#catGrid", root);
    DATA.categories.forEach((cat) => {
      const items = cat.items || [];
      const cDone = items.filter((i) => state.checked[i.id]).length;
      const el = document.createElement("div");
      el.className = "cat";
      el.innerHTML = `
        <div class="cat-head">
          <h3>${esc(cat.emoji || "")} ${esc(cat.label)}</h3>
          <span class="cat-pct">${cDone}/${items.length}</span>
        </div>
        <ul class="check-list"></ul>`;
      const ul = $("ul", el);
      items.forEach((it) => {
        const li = document.createElement("li");
        const on = !!state.checked[it.id];
        li.className = "check-item" + (on ? " done" : "");
        li.innerHTML = `<input type="checkbox" ${on ? "checked" : ""} aria-label="${esc(it.label)}"><span class="label">${esc(it.label)}</span>`;
        li.addEventListener("click", (e) => {
          if (e.target.tagName === "INPUT") return;
          const inp = $("input", li);
          inp.checked = !inp.checked;
          inp.dispatchEvent(new Event("change"));
        });
        $("input", li).addEventListener("change", (e) => {
          state.checked[it.id] = e.target.checked;
          save(state);
          li.classList.toggle("done", e.target.checked);
          const pct = $("span.cat-pct", el);
          pct.textContent = `${items.filter((i) => state.checked[i.id]).length}/${items.length}`;
          updatePills();
          renderPrint();
        });
        ul.appendChild(li);
      });
      grid.appendChild(el);
    });
  }

  function renderTimeline() {
    const root = $("#view-timeline");
    root.innerHTML = `
      <div class="panel" style="margin-bottom:1rem">
        <h2 class="view-title">Outage timeline <span class="example-badge">EXAMPLE</span></h2>
        <p class="lede">Template only — align to real NWS timings. Toggle steps as you complete them.</p>
      </div>
      <div class="timeline" id="tl"></div>`;
    const tl = $("#tl", root);
    (DATA.timeline || []).forEach((t) => {
      const card = document.createElement("div");
      card.className = "t-card";
      const tasks = (t.tasks || [])
        .map((task, idx) => {
          const id = `${t.id}-${idx}`;
          const on = !!state.timelineDone[id];
          return `<li><label style="cursor:pointer"><input type="checkbox" data-tid="${esc(id)}" ${on ? "checked" : ""}> ${esc(task)}</label></li>`;
        })
        .join("");
      card.innerHTML = `
        <div class="t-hours">${esc(t.hours)}</div>
        <h3>${esc(t.label)} ${t.example ? '<span class="example-badge">EXAMPLE</span>' : ""}</h3>
        <ul>${tasks}</ul>`;
      $$("input[data-tid]", card).forEach((inp) => {
        inp.addEventListener("change", (e) => {
          state.timelineDone[e.target.dataset.tid] = e.target.checked;
          save(state);
        });
      });
      tl.appendChild(card);
    });
  }

  function renderRules() {
    const root = $("#view-rules");
    const rules = (DATA.freezerRules || []).map((r) => `<li>${esc(r)}</li>`).join("");
    root.innerHTML = `
      <div class="panel">
        <h2 class="view-title">🧊 Freezer &amp; fridge rules</h2>
        <p class="lede">Rule-of-thumb reminders during a BGE outage. When unsafe, discard food.</p>
        <ul class="rules-list">${rules}</ul>
      </div>
      <div class="panel soft-panel" style="margin-top:1rem">
        <h3 style="margin:0 0 .4rem">Generator notes</h3>
        <p class="hint" style="margin:0">If you use a generator: outdoors only, never in garage/basement, dry cords, carbon monoxide alarms on. Fuel stored safely. These are UI reminders — follow manufacturer + fire-dept guidance.</p>
      </div>`;
  }

  function renderLinks() {
    const root = $("#view-links");
    const cards = (DATA.links || [])
      .map(
        (l) => `
      <a class="link-card" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
        <h3>${esc(l.label)}</h3>
        <div class="url">${esc(l.url)}</div>
        <p>${esc(l.note || "")}</p>
      </a>`
      )
      .join("");
    root.innerHTML = `
      <div class="panel" style="margin-bottom:1rem">
        <h2 class="view-title">Public resources</h2>
        <p class="lede">Known public URLs only. Omit rather than invent.</p>
      </div>
      <div class="links-grid">${cards}</div>`;
  }

  function renderPrint() {
    const root = $("#printSheets");
    if (!root) return;
    const p = progress();
    const h = DATA.home;
    let cats = "";
    DATA.categories.forEach((cat) => {
      const lis = (cat.items || [])
        .map((it) => {
          const on = state.checked[it.id] ? " on" : "";
          return `<li><span class="box${on}"></span>${esc(it.label)}</li>`;
        })
        .join("");
      cats += `<div class="cat-print"><h3>${esc(cat.emoji || "")} ${esc(cat.label)}</h3><ul>${lis}</ul></div>`;
    });
    root.innerHTML = `
      <div class="print-sheet">
        <h2>Storm Prep · ${esc(h.address)}, ${esc(h.city)}</h2>
        <p class="sub">${p.done}/${p.total} ready · Char &amp; Vic · BGE outage mindset · EXAMPLE timeline separate</p>
        ${cats}
      </div>`;
  }

  function show(view) {
    $$(".view").forEach((v) => v.classList.remove("active"));
    $$(".tab").forEach((t) => {
      const on = t.dataset.view === view;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    const panel = $(`#view-${view}`);
    if (panel) panel.classList.add("active");
    if (location.hash.replace("#", "") !== view) {
      history.replaceState(null, "", "#" + view);
    }
    if (view === "print") renderPrint();
  }

  function bind() {
    $$(".tab").forEach((t) =>
      t.addEventListener("click", () => show(t.dataset.view))
    );
    $("#btnPrint")?.addEventListener("click", () => {
      show("print");
      setTimeout(() => window.print(), 80);
    });
    $("#btnDoPrint")?.addEventListener("click", () => window.print());
    $("#btnExport")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "millersville-storm-prep-save.json";
      a.click();
      $("#aboutHint").textContent = "Exported save JSON.";
    });
    $("#btnReset")?.addEventListener("click", () => {
      if (!confirm("Reset prep checklist?")) return;
      state.checked = {};
      save(state);
      renderPrep();
      renderPrint();
      updatePills();
      $("#aboutHint").textContent = "Checklist reset.";
    });
    $("#btnResetAll")?.addEventListener("click", () => {
      if (!confirm("Reset ALL local data?")) return;
      state = { checked: {}, timelineDone: {} };
      save(state);
      renderPrep();
      renderTimeline();
      renderPrint();
      updatePills();
      $("#aboutHint").textContent = "All local data cleared.";
    });
    window.addEventListener("hashchange", () => {
      const h = location.hash.replace("#", "") || "prep";
      show(h);
    });
  }

  if (!DATA) {
    document.body.innerHTML = "<p style='padding:2rem;font-family:sans-serif'>Missing prep data.</p>";
    return;
  }
  bind();
  renderPrep();
  renderTimeline();
  renderRules();
  renderLinks();
  renderPrint();
  updatePills();
  const start = location.hash.replace("#", "") || "prep";
  show(["prep", "timeline", "rules", "links", "print", "about"].includes(start) ? start : "prep");
})();
