/* =========================================================
   calendar.js — render menstrual cycle calendar
   ========================================================= */

function renderCalendar(rootEl, entries, opts = {}) {
  const view = opts.viewDate ? new Date(opts.viewDate) : new Date();
  const year = view.getFullYear(), month = view.getMonth();
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const periodDates = new Set(entries.filter(e=>e.period).map(e=>e.date));
  const prediction = predictCycle(entries);

  const monthName = first.toLocaleString(undefined, { month:"long", year:"numeric" });

  let html = `
    <div class="cal-head">
      <button class="btn btn-ghost btn-sm" id="calPrev">‹</button>
      <h3 style="margin:0;font-family:var(--font-display);">${monthName}</h3>
      <button class="btn btn-ghost btn-sm" id="calNext">›</button>
    </div>
    <div class="cal-grid">`;
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d => html += `<div class="dow">${d}</div>`);

  // leading blanks
  for (let i=0;i<startDow;i++) html += `<div class="cal-day muted"></div>`;

  const todayStr = new Date().toISOString().slice(0,10);
  for (let d=1; d<=daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const ds = dateObj.toISOString().slice(0,10);
    const cls = ["cal-day"];
    if (ds === todayStr) cls.push("today");
    if (periodDates.has(ds)) cls.push("period");
    if (prediction) {
      // future predicted period
      const pNext = new Date(prediction.next);
      for (let k=0;k<prediction.periodLen;k++){
        const t=new Date(pNext); t.setDate(t.getDate()+k);
        if (t.toISOString().slice(0,10) === ds && !periodDates.has(ds)) cls.push("period");
      }
      if (ds === prediction.ovulation) cls.push("ovulation");
      if (ds >= prediction.fertileStart && ds <= prediction.fertileEnd && ds !== prediction.ovulation) cls.push("fertile");
      const pmsEnd = new Date(prediction.next); pmsEnd.setDate(pmsEnd.getDate()-1);
      if (ds >= prediction.pmsStart && ds <= pmsEnd.toISOString().slice(0,10)) cls.push("pms");
    }
    html += `<div class="${cls.join(' ')}" title="${ds}">${d}</div>`;
  }
  html += `</div>
    <div class="legend">
      <span class="lg"><span class="sw" style="background:linear-gradient(135deg,#ffb8d8,#ff8fc1)"></span>Period</span>
      <span class="lg"><span class="sw" style="background:linear-gradient(135deg,#a8edea,#fed6e3)"></span>Ovulation</span>
      <span class="lg"><span class="sw" style="background:#d6f5e1"></span>Fertile</span>
      <span class="lg"><span class="sw" style="background:#fff0c9"></span>PMS</span>
    </div>`;
  rootEl.innerHTML = html;

  // wire prev/next
  rootEl.querySelector("#calPrev").onclick = () => {
    const d = new Date(year, month-1, 1);
    renderCalendar(rootEl, entries, { viewDate: d });
  };
  rootEl.querySelector("#calNext").onclick = () => {
    const d = new Date(year, month+1, 1);
    renderCalendar(rootEl, entries, { viewDate: d });
  };
}
