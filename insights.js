/* =========================================================
   insights.js — render AI insights, results & history
   ========================================================= */

function renderResults(rootEl) {
  const entries = loadEntries();
  const a = analyzeHealth(entries);
  if (!a.results.length) { rootEl.innerHTML = "<p>No data yet. Start tracking to view your results.</p>"; return; }
  const top = a.results[0];

  rootEl.innerHTML = `
    <div class="grid" style="grid-template-columns: 1fr 1fr; gap:1.25rem;">
      <div class="glass">
        <div class="card-title"><span class="dot"></span> Hormonal Balance</div>
        <div style="display:flex;align-items:center;gap:1.5rem;margin-top:1rem;">
          <div class="ring" style="--p:${a.hormonalScore}"><span class="v">0</span></div>
          <div>
            <div class="muted">Overall score</div>
            <h2 style="margin:.2rem 0 .4rem;">${a.hormonalScore}/100</h2>
            <span class="badge ${top.level === 'high' ? 'high' : top.level === 'moderate' ? 'mod' : 'low'}">${top.level.toUpperCase()} RISK</span>
          </div>
        </div>
      </div>
      <div class="glass">
        <div class="card-title"><span class="dot"></span> Top Indication</div>
        <h3 style="font-family:var(--font-display);font-size:1.4rem;color:var(--purple-700);">${top.name}</h3>
        <div class="muted" style="margin-bottom:.6rem;">Confidence ${top.confidence}% · Risk ${top.risk}%</div>
        <p>${top.explain}</p>
      </div>
    </div>

    <div class="glass" style="margin-top:1.25rem;">
      <div class="card-title"><span class="dot"></span> All Conditions</div>
      <div class="grid" style="grid-template-columns: repeat(2,1fr); margin-top:.75rem;">
        ${a.results.map(r => `
          <div style="padding:1rem;background:var(--surface-2);border-radius:14px;border:1px solid var(--border);">
            <div class="row between">
              <strong>${r.name}</strong>
              <span class="badge ${r.level === 'high' ? 'high' : r.level === 'moderate' ? 'mod' : 'low'}">${r.risk}%</span>
            </div>
            <div style="height:8px;background:rgba(155,107,234,.12);border-radius:999px;margin-top:.6rem;overflow:hidden;">
              <div style="height:100%;width:${r.risk}%;background:var(--grad-primary);"></div>
            </div>
            <div class="muted" style="margin-top:.4rem;">Confidence ${r.confidence}%</div>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="grid" style="grid-template-columns: 1.2fr 1fr; gap:1.25rem; margin-top:1.25rem;">
      <div class="glass">
        <div class="card-title"><span class="dot"></span> Personalized Recommendations</div>
        <ul style="padding-left:1.1rem;color:var(--text-soft);line-height:1.8;">
          ${top.tips.map(t => `<li>${t}</li>`).join("")}
        </ul>
      </div>
      <div class="glass">
        <div class="card-title"><span class="dot"></span> Detected Patterns</div>
        ${a.patterns.length ? a.patterns.map(p => `
          <div style="display:flex;gap:.7rem;align-items:flex-start;padding:.6rem 0;border-bottom:1px dashed var(--border);">
            <span style="font-size:1.3rem;">${p.icon}</span>
            <span style="font-size:.92rem;color:var(--text-soft);">${p.text}</span>
          </div>
        `).join("") : '<p class="muted">No notable patterns yet — keep tracking daily.</p>'}
      </div>
    </div>
  `;

  // animate ring after insertion
  const ring = rootEl.querySelector(".ring");
  setRing(ring, a.hormonalScore);
}

function renderTimeline(rootEl, query="") {
  const entries = loadEntries();
  const filtered = entries.filter(e => {
    if (!query) return true;
    return JSON.stringify(e).toLowerCase().includes(query.toLowerCase());
  });
  if (!filtered.length) { rootEl.innerHTML = '<p class="muted">No entries match.</p>'; return; }
  rootEl.innerHTML = `<div class="timeline">${filtered.map(e => `
    <div class="entry">
      <div class="row between">
        <strong>${new Date(e.date).toLocaleDateString(undefined,{ weekday:"short", month:"short", day:"numeric" })}</strong>
        <div class="row" style="gap:.4rem;">
          ${e.period ? '<span class="badge high">Period</span>' : ''}
          <span class="badge ${e.mood >= 6 ? 'low' : e.mood >= 4 ? 'mod' : 'high'}">Mood ${e.mood}/10</span>
        </div>
      </div>
      <div class="muted" style="margin-top:.4rem;font-size:.88rem;">
        Sleep ${e.sleep}h · Energy ${e.energy}/10 · Stress ${e.stress}/10 · Acne ${e.acne}/10 · Cravings ${e.cravings}/10
        ${e.pms && e.pms !== 'none' ? ` · PMS ${e.pms}` : ''}
      </div>
    </div>
  `).join("")}</div>`;
}
