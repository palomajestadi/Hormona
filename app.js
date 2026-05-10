/* =========================================================
   app.js — global UI behaviors (theme, nav, animations, toasts)
   ========================================================= */

// THEME --------------------------------------------------------
function applyTheme() {
  const s = loadSettings();
  if (s.theme === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}
function toggleTheme() {
  const s = loadSettings();
  saveSettings({ theme: s.theme === "dark" ? "light" : "dark" });
  applyTheme();
}

// NAV ----------------------------------------------------------
function setActiveNav() {
  const path = location.pathname.split("/").pop();
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href && href.endsWith(path)) a.classList.add("active");
  });
}
function setupNavToggle() {
  const btn = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (btn && links) btn.onclick = () => links.classList.toggle("open");
}

// SCROLL REVEAL ------------------------------------------------
function setupReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach(e => io.observe(e));
}

// COUNTERS -----------------------------------------------------
function animateCounter(el, target, duration=1200) {
  const start = performance.now();
  const from = 0;
  const fmt = (n) => target % 1 === 0 ? Math.round(n) : n.toFixed(1);
  function step(t) {
    const p = Math.min(1, (t-start)/duration);
    const ease = 1 - Math.pow(1-p, 3);
    el.textContent = fmt(from + (target - from) * ease);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function setupCounters() {
  document.querySelectorAll("[data-count]").forEach(el => {
    const v = parseFloat(el.dataset.count);
    animateCounter(el, v);
  });
}

// TOAST --------------------------------------------------------
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 2400);
}

// PROGRESS RING UPDATE -----------------------------------------
function setRing(el, percent) {
  if (!el) return;
  el.style.setProperty("--p", percent);
  const v = el.querySelector(".v");
  if (v) animateCounter(v, percent);
}

// PDF EXPORT ---------------------------------------------------
async function exportPDF(elementId, filename="hormona-report.pdf") {
  const el = document.getElementById(elementId);
  if (!el) return;
  toast("Generating PDF…");
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#fdf7fc", useCORS: true });
  const img = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const ratio = canvas.height / canvas.width;
  const w = pageW - 40; const h = w * ratio;
  pdf.addImage(img, "PNG", 20, 20, w, h);
  pdf.save(filename);
}

// INIT (global) ------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  ensureDemoData();
  applyTheme();
  setActiveNav();
  setupNavToggle();
  setupReveal();
  setupCounters();
  // Theme toggle button
  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) themeBtn.onclick = toggleTheme;
});
