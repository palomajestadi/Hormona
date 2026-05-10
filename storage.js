/* =========================================================
   storage.js — localStorage helpers (offline persistence)
   ========================================================= */
const STORE = {
  ENTRIES: "hormona_entries",  // array of daily logs
  SETTINGS:"hormona_settings", // theme, name, cycle length
  STREAK:  "hormona_streak",
};

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORE.ENTRIES)) || []; }
  catch { return []; }
}
function saveEntries(list) {
  localStorage.setItem(STORE.ENTRIES, JSON.stringify(list));
}
function addEntry(entry) {
  const list = loadEntries();
  // De-duplicate by date — overwrite same-day entry
  const idx = list.findIndex(e => e.date === entry.date);
  if (idx >= 0) list[idx] = entry; else list.push(entry);
  list.sort((a,b)=> a.date < b.date ? 1 : -1);
  saveEntries(list);
  bumpStreak();
}
function removeEntry(date) {
  saveEntries(loadEntries().filter(e => e.date !== date));
}

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(STORE.SETTINGS)) || {}; }
  catch { return {}; }
}
function saveSettings(s) {
  const merged = { ...loadSettings(), ...s };
  localStorage.setItem(STORE.SETTINGS, JSON.stringify(merged));
  return merged;
}

function bumpStreak() {
  const entries = loadEntries();
  if (!entries.length) return;
  const days = new Set(entries.map(e => e.date));
  let streak = 0;
  let d = new Date();
  while (days.has(d.toISOString().slice(0,10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  localStorage.setItem(STORE.STREAK, String(streak));
  return streak;
}
function getStreak() { return Number(localStorage.getItem(STORE.STREAK) || 0); }

// Today's date helper
function today() { return new Date().toISOString().slice(0,10); }

// Seed demo data if none exists (so first-time users see a populated app)
function ensureDemoData() {
  const list = loadEntries();
  if (list.length) return;
  const seed = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    seed.push({
      date: d.toISOString().slice(0,10),
      period: i % 28 < 4,
      flow: i % 28 < 4 ? ["light","medium","heavy"][i%3] : "none",
      cycleRegular: Math.random() > 0.4,
      pms: i % 28 > 22 ? ["mild","moderate"][i%2] : "none",
      cramps: Math.round(Math.random()*5),
      acne: Math.round(2 + Math.random()*5),
      hairfall: Math.round(1 + Math.random()*4),
      bloating: Math.round(Math.random()*6),
      cravings: Math.round(2 + Math.random()*6),
      weight: 60 + Math.round(Math.random()*3*10)/10,
      skin: ["clear","oily","dry","mixed"][i%4],
      mood: Math.round(3 + Math.random()*5),
      anxiety: Math.round(Math.random()*7),
      stress: Math.round(2 + Math.random()*6),
      motivation: Math.round(3 + Math.random()*5),
      sensitivity: Math.round(2 + Math.random()*5),
      sleep: 5 + Math.round(Math.random()*4*10)/10,
      water: 1 + Math.round(Math.random()*2*10)/10,
      exercise: Math.round(Math.random()*60),
      screen: 3 + Math.round(Math.random()*7),
      energy: Math.round(2 + Math.random()*6),
    });
  }
  saveEntries(seed);
  bumpStreak();
}
