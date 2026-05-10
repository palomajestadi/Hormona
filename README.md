# Hormona — Early Hormonal Disorder Detection System

> An AI-assisted, offline-first wellness web app that helps women track daily health signals and surface **early indicators** of common hormonal conditions like **PCOS, hypothyroidism, PMDD, and insulin resistance** — long before they become formal diagnoses.

Hormona is a polished, single-user, **100% static** web application (HTML + CSS + vanilla JavaScript). No backend, no accounts, no servers. All your data lives in your browser's `localStorage`, so it works completely offline and is fully private.

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [How to Run It](#how-to-run-it)
6. [How It Works (Under the Hood)](#how-it-works-under-the-hood)
7. [Page-by-Page Walkthrough](#page-by-page-walkthrough)
8. [Data Model](#data-model)
9. [The "AI" Engine Explained](#the-ai-engine-explained)
10. [Design System](#design-system)
11. [Privacy](#privacy)
12. [Disclaimer](#disclaimer)

---

## What It Does

Most women only learn about hormonal imbalances **after** symptoms have escalated into a full diagnosis. Hormona flips that: it lets you log small daily signals (mood, sleep, cycle, skin, energy, cravings, stress, weight, etc.) and uses pattern-recognition logic to:

- Compute a **Hormonal Balance Score** (0–100)
- Estimate a **risk level** (low / moderate / high)
- Surface **likely conditions to watch** (e.g. _possible PCOS pattern_, _thyroid signal_, _PMDD-like cycle_, _insulin-resistance markers_)
- Predict your **next cycle and current phase**
- Give **personalized lifestyle recommendations**
- Show **trends, charts and weekly behavioral insights**
- Export a clean **PDF report** to share with a doctor

It is positioned as an **early-warning companion**, not a diagnostic tool.

---

## Key Features

| Feature | Description |
|---|---|
| **Daily Tracker** | One-screen form to log cycle, symptoms, mood, sleep, lifestyle. |
| **Dashboard** | Hormonal balance ring, streak, current cycle phase, mood/sleep trends. |
| **AI Results** | Risk score + condition likelihoods + recommendations. |
| **Insights** | Weekly behavioral report and pattern observations. |
| **Calendar** | Predictive cycle calendar with phase coloring. |
| **History** | Full chronological log with edit/delete. |
| **PDF Export** | One-click downloadable health report. |
| **Dark / Light theme** | Persistent across sessions. |
| **Offline-first** | Works with no internet after first load. |
| **Demo data** | Auto-seeds 14 days of sample entries on first visit. |

---

## Tech Stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom design system with glassmorphism, gradients, blob backgrounds
- **Vanilla JavaScript (ES6)** — no frameworks, no build step
- **Chart.js** (CDN) — line and bar charts
- **html2canvas + jsPDF** (CDN) — PDF report export
- **Google Fonts** — `Fraunces` (display) + `Plus Jakarta Sans` (body)
- **localStorage** — persistent client-side storage

No bundler. No npm. No backend. Just open the HTML files.

---

## Project Structure

```
public/hormona/
├── index.html          # Landing page
├── dashboard.html      # Main dashboard
├── tracker.html        # Daily symptom logger
├── results.html        # AI risk analysis + PDF export
├── insights.html       # Weekly behavioral insights
├── calendar.html       # Cycle calendar & predictions
├── history.html        # Past entries (view/edit/delete)
└── assets/
    ├── css/
    │   └── style.css       # Design system + all styling
    └── js/
        ├── app.js          # Global UI: theme, nav, animations, toasts, PDF
        ├── storage.js      # localStorage helpers + demo seeding
        ├── ai.js           # Health analysis engine + cycle prediction
        ├── charts.js       # Chart.js wrappers (line/bar)
        ├── calendar.js     # Calendar rendering
        └── insights.js     # Insights page logic
```

---

## How to Run It

Hormona is fully static. You only need a local web server (because browsers block module/font loading from `file://`).

### Option A — Node (recommended)
```bash
cd public/hormona
npx serve .
```
Open the printed URL (e.g. `http://localhost:3000`).

### Option B — Python
```bash
cd public/hormona
python -m http.server 8000
# or on Windows:
py -m http.server 8000
```
Open `http://localhost:8000`.

### Option C — VS Code "Live Server" extension
Right-click `index.html` → **Open with Live Server**.

### Option D — Deploy to Netlify / Vercel / GitHub Pages
Drag the **contents** of `public/hormona/` into Netlify Drop. The deploy root must contain `index.html` and the `assets/` folder side-by-side.

> Do **not** double-click `index.html` directly — `file://` URLs break Chart.js, fonts and JS imports.

---

## How It Works (Under the Hood)

### 1. Data flow
```
User logs symptoms (tracker.html)
        │
        ▼
storage.js  ──►  localStorage["hormona_entries"]
        │
        ▼
ai.js  ──►  analyzeHealth(entries)
        │
        ├──► Hormonal Score (0–100)
        ├──► Risk level (low/moderate/high)
        ├──► Condition likelihoods (PCOS, Thyroid, PMDD, Insulin)
        ├──► Pattern detection (sleep ↔ mood, stress ↔ acne, etc.)
        └──► Cycle prediction (next period, phase, ovulation window)
        │
        ▼
charts.js / pages render results, charts, calendar, PDF
```

### 2. Storage
All data persists in `localStorage` under three keys:
- `hormona_entries` — array of daily logs
- `hormona_settings` — theme, name, cycle length
- `hormona_streak` — consecutive logging days

Same-day entries are de-duplicated (latest overwrites).

### 3. First-visit experience
If no entries exist, `ensureDemoData()` seeds 14 days of realistic randomized entries so a first-time user immediately sees a populated dashboard.

---

## Page-by-Page Walkthrough

### `index.html` — Landing
Hero with the tagline _"Understand your hormones before they become a problem."_ Stats (`14d`, `4`, `100%`), feature cards, live mini-dashboard preview, CTA buttons.

### `dashboard.html` — Daily overview
- Time-aware greeting (`Good morning/afternoon/evening`)
- **Hormonal Balance ring** (animated SVG-style ring with score)
- **Streak counter** (consecutive days logged)
- **Current cycle phase** (Menstrual / Follicular / Ovulation / Luteal / Pre-menstrual)
- 7-day average **sleep** and **mood**
- Active **patterns** detected
- 14-day **mood + energy line chart**, **sleep chart**, **symptom-load bar chart**

### `tracker.html` — Daily logger
A single comprehensive form: cycle status, flow, PMS, cramps, acne, hairfall, bloating, cravings, weight, skin, mood, anxiety, stress, motivation, sensitivity, sleep, water, exercise, screen time, energy. Submitting saves and bumps the streak.

### `results.html` — AI risk report
- Overall hormonal score + risk badge
- Per-condition likelihood bars (PCOS, Hypothyroidism, PMDD, Insulin Resistance)
- Personalized recommendations
- **Download PDF report** button (uses `html2canvas` + `jsPDF`)

### `insights.html` — Weekly behavioral analysis
- Weekly summary (avg mood/sleep/energy, entries logged)
- Behavioral observations ("Sleep quality appears to impact your emotional balance")
- Weight trend, stress trend, hormonal balance trend charts

### `calendar.html` — Cycle predictions
Month grid with phase coloring (period, fertile window, ovulation, luteal). Predicted next period date.

### `history.html` — Log archive
Chronological list of every entry. Edit or delete individual days.

---

## Data Model

A single entry (one per date) looks like:
```js
{
  date: "2026-05-10",
  period: false,
  flow: "none",            // light | medium | heavy | none
  cycleRegular: true,
  pms: "mild",             // none | mild | moderate | severe
  cramps: 3,               // 0–10
  acne: 4, hairfall: 2, bloating: 3, cravings: 5,
  weight: 61.2,
  skin: "oily",            // clear | oily | dry | mixed
  mood: 7,                 // 1–10
  anxiety: 3, stress: 5, motivation: 6, sensitivity: 4,
  sleep: 7.5,              // hours
  water: 2.1,              // litres
  exercise: 30,            // minutes
  screen: 6,               // hours
  energy: 6                // 1–10
}
```

---

## The "AI" Engine Explained

Hormona's intelligence is **rule-based pattern recognition**, not a neural network. It runs entirely in the browser with zero external API calls. The logic in `ai.js`:

1. **Aggregates** the last 14–30 entries.
2. **Computes weighted indicators** for each condition. For example:
   - **PCOS likelihood** rises with: irregular cycles, persistent acne, hair fall, weight gain, cravings, oily skin.
   - **Hypothyroidism likelihood** rises with: low energy, weight gain, low mood, hair fall, cold sensitivity.
   - **PMDD likelihood** rises with: severe pre-period mood drops, anxiety spikes, sensitivity, cyclical patterns.
   - **Insulin resistance** rises with: cravings, weight changes, low energy after meals, poor sleep.
3. **Detects cross-signal patterns** — e.g. "low sleep correlates with low mood", "stress days cluster with acne flare-ups".
4. **Predicts cycle** by looking at last period start dates and median cycle length, then computing current phase from days-since-start.
5. **Generates recommendations** based on the dominant signals (sleep hygiene, magnesium, strength training, stress reduction, etc.).
6. **Outputs a Hormonal Balance Score** = 100 minus weighted symptom load, clamped to 0–100.

Why rule-based? Because:
- It works **offline** with no API keys.
- It is **transparent and auditable** — every score can be traced to its inputs.
- It is **fast** and **private** — no data ever leaves the device.

---

## Design System

Defined in `assets/css/style.css`:
- **Palette** — soft pinks, lavenders, deep purples on a warm off-white
- **Typography** — `Fraunces` for display headings, `Plus Jakarta Sans` for body
- **Glassmorphism** — frosted `.glass` cards with subtle borders
- **Animated background blobs** (`.b1 .b2 .b3`) for organic depth
- **Reveal-on-scroll** animations via IntersectionObserver
- **Counter animations** for numeric stats
- **Dark mode** toggle persisted via settings
- **Toast notifications** for confirmations
- **Animated progress rings** for scores

---

## Privacy

- **No accounts. No login. No tracking. No analytics.**
- All data stays in your browser's `localStorage`.
- Clearing browser data wipes everything.
- The only network requests are to public CDNs (Google Fonts, Chart.js, jsPDF).

---

## Disclaimer

Hormona is a **wellness and educational tool**, not a medical device. It does not diagnose, treat, cure, or prevent any condition. The risk scores and condition likelihoods are heuristic estimates from self-reported data and should never replace consultation with a qualified healthcare professional. Always seek the advice of your physician for any medical concerns.

---

Built with care for early awareness, not late diagnoses.
