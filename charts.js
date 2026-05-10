/* =========================================================
   charts.js — Chart.js renderers (gradient styled)
   ========================================================= */

// Common gradient
function pinkGrad(ctx, h=200) {
  const g = ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0, "rgba(255,143,193,0.6)");
  g.addColorStop(1, "rgba(180,140,240,0.05)");
  return g;
}
function purpleGrad(ctx, h=200) {
  const g = ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0, "rgba(155,107,234,0.55)");
  g.addColorStop(1, "rgba(155,107,234,0.05)");
  return g;
}

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: "easeOutQuart" },
  plugins: {
    legend: { labels: { color: "#6b5b85", font: { family: "Plus Jakarta Sans, system-ui", size: 12 } } },
    tooltip: { backgroundColor: "rgba(42,31,61,0.92)", padding: 10, cornerRadius: 10, titleColor:"#fff", bodyColor:"#fff" },
  },
  scales: {
    x: { grid: { color: "rgba(155,107,234,0.08)" }, ticks: { color: "#9b8eb3", font: { size: 11 } } },
    y: { grid: { color: "rgba(155,107,234,0.08)" }, ticks: { color: "#9b8eb3", font: { size: 11 } } },
  },
};

function lineChart(canvasId, labels, data, label, color="#ff6fae") {
  const el = document.getElementById(canvasId); if (!el) return;
  const ctx = el.getContext("2d");
  return new Chart(el, {
    type: "line",
    data: { labels, datasets: [{
      label, data, borderColor: color, backgroundColor: pinkGrad(ctx, el.height || 200),
      borderWidth: 3, tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: color, pointHoverRadius: 6,
    }]},
    options: baseOpts,
  });
}
function barChart(canvasId, labels, data, label, color="#9b6bea") {
  const el = document.getElementById(canvasId); if (!el) return;
  const ctx = el.getContext("2d");
  return new Chart(el, {
    type: "bar",
    data: { labels, datasets: [{
      label, data, backgroundColor: purpleGrad(ctx, el.height || 200), borderColor: color, borderWidth:2, borderRadius: 8,
    }]},
    options: baseOpts,
  });
}
function doughnut(canvasId, labels, data, colors) {
  const el = document.getElementById(canvasId); if (!el) return;
  return new Chart(el, {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 12 }]},
    options: { ...baseOpts, cutout: "65%", scales: {} },
  });
}

// Build datasets from entries (oldest -> newest for charts)
function chartLabels(entries, days=14) {
  return entries.slice(0, days).reverse().map(e => e.date.slice(5));
}
function chartSeries(entries, key, days=14) {
  return entries.slice(0, days).reverse().map(e => Number(e[key]) || 0);
}
