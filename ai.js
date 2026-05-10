/* =========================================================
   ai.js — Rule-based hormonal-health analysis engine
   No external API. Weighted scoring + trend detection.
   ========================================================= */

// Each rule: which entry fields contribute, and how much.
// Score 0–100. Confidence based on data volume + signal strength.
const CONDITION_RULES = {
  PCOS: {
    name: "PCOS (Polycystic Ovary Syndrome)",
    factors: [
      { key:"cycleIrregular", weight: 25, test: e => e.cycleRegular === false },
      { key:"acne",           weight: 20, test: e => e.acne >= 6 },
      { key:"hairfall",       weight: 15, test: e => e.hairfall >= 4 },
      { key:"weightGain",     weight: 15, test: (e,_,trend) => trend.weightUp },
      { key:"cravings",       weight: 10, test: e => e.cravings >= 6 },
      { key:"bloating",       weight: 8,  test: e => e.bloating >= 5 },
      { key:"cramps",         weight: 7,  test: e => e.cramps >= 4 },
    ],
    explain: "Recurring irregular cycles together with acne, hair fall, and weight changes are commonly associated with PCOS.",
    tips: [
      "Reduce refined sugar and processed carbs",
      "Aim for 25–30g protein per meal",
      "30 min of moderate exercise, 5x/week",
      "Track cycles for at least 3 months",
      "Consider an endocrinologist consultation",
    ],
  },
  Hypothyroidism: {
    name: "Hypothyroidism",
    factors: [
      { key:"lowEnergy",   weight: 25, test: e => e.energy <= 3 },
      { key:"highSleep",   weight: 20, test: e => e.sleep >= 9 },
      { key:"weightGain",  weight: 20, test: (e,_,trend) => trend.weightUp },
      { key:"lowMotivation", weight: 15, test: e => e.motivation <= 3 },
      { key:"hairfall",    weight: 10, test: e => e.hairfall >= 4 },
      { key:"drySkin",     weight: 10, test: e => e.skin === "dry" },
    ],
    explain: "Persistent fatigue, oversleeping, low motivation and weight changes can suggest underactive thyroid function.",
    tips: [
      "Maintain consistent sleep schedule",
      "Request a TSH / Free T4 blood panel",
      "Iodine-rich foods in moderation",
      "Reduce raw goitrogens (excess raw cruciferous)",
      "Strength training to support metabolism",
    ],
  },
  PMDD: {
    name: "PMDD (Premenstrual Dysphoric Disorder)",
    factors: [
      { key:"prePeriodMood", weight: 30, test: (e,_,trend) => trend.prePeriodMoodDrop },
      { key:"highAnxiety",   weight: 20, test: e => e.anxiety >= 6 },
      { key:"highSensitivity", weight: 15, test: e => e.sensitivity >= 6 },
      { key:"highStress",    weight: 15, test: e => e.stress >= 6 },
      { key:"pmsSymptoms",   weight: 20, test: e => e.pms && e.pms !== "none" },
    ],
    explain: "Sharp mood and anxiety shifts in the days before menstruation, beyond typical PMS, are characteristic of PMDD.",
    tips: [
      "Daily mood journaling (already tracking — keep going)",
      "Reduce caffeine, especially in luteal phase",
      "Consistent sleep + 20 min daily walking",
      "Magnesium & B6 rich foods",
      "Speak to a healthcare provider about PMDD",
    ],
  },
  InsulinResistance: {
    name: "Insulin Resistance",
    factors: [
      { key:"highCravings", weight: 25, test: e => e.cravings >= 6 },
      { key:"postMealFatigue", weight: 20, test: e => e.energy <= 3 },
      { key:"weightSwings", weight: 20, test: (e,_,trend) => trend.weightVolatile },
      { key:"bloating",    weight: 15, test: e => e.bloating >= 5 },
      { key:"lowExercise", weight: 10, test: e => e.exercise <= 10 },
      { key:"highScreen",  weight: 10, test: e => e.screen >= 8 },
    ],
    explain: "Strong sugar cravings, low post-meal energy, and weight fluctuations may signal early insulin resistance.",
    tips: [
      "Walk 10 min after each meal",
      "Pair carbs with protein + fat",
      "Reduce sugary drinks; hydrate with water",
      "8h sleep — supports glucose regulation",
      "Ask doctor about HbA1c / fasting insulin",
    ],
  },
};

// Compute simple trends from history
function computeTrends(entries) {
  const last7 = entries.slice(0,7);
  const last14 = entries.slice(0,14);
  const weights = last14.map(e=>e.weight).filter(Number);
  const moods = last14.map(e=>e.mood).filter(Number);
  const sleeps = last14.map(e=>e.sleep).filter(Number);

  const weightDelta = weights.length >= 5 ? (weights[0] - weights[weights.length-1]) : 0;
  const weightStd = std(weights);
  const sleepAvg = avg(sleeps);
  const moodAvg = avg(moods);

  // Detect mood drop in pre-period (last 3 days before next period proxy)
  // Simplified: if recent 3 entries' mood < older 7 avg by 1.5 → flag
  const recentMood = avg(moods.slice(0,3));
  const olderMood  = avg(moods.slice(3,10));
  const prePeriodMoodDrop = (olderMood - recentMood) >= 1.5;

  return {
    weightUp: weightDelta >= 1.0,
    weightVolatile: weightStd > 1.2,
    sleepAvg, moodAvg,
    prePeriodMoodDrop,
    sampleSize: entries.length,
  };
}

function avg(a){ return a.length ? a.reduce((s,x)=>s+x,0)/a.length : 0; }
function std(a){ if (a.length<2) return 0; const m=avg(a); return Math.sqrt(avg(a.map(x=>(x-m)**2))); }

// Run AI analysis across all entries -> return ranked condition results
function analyzeHealth(entries) {
  if (!entries || !entries.length) return { results: [], hormonalScore: 50, riskLevel: "low", patterns: [] };
  const trends = computeTrends(entries);
  const window = entries.slice(0, 14); // last 14 days

  const results = Object.entries(CONDITION_RULES).map(([id, rule]) => {
    let totalScore = 0;
    const triggered = [];
    for (const f of rule.factors) {
      // count days within window where factor is true
      let hits = 0;
      for (const e of window) if (f.test(e, entries, trends)) hits++;
      const ratio = hits / Math.max(window.length, 1);
      const contribution = f.weight * ratio;
      totalScore += contribution;
      if (ratio >= 0.3) triggered.push({ key: f.key, hits, ratio: Math.round(ratio*100) });
    }
    const risk = Math.min(100, Math.round(totalScore));
    const confidence = Math.min(100, Math.round(50 + window.length * 3));
    let level = "low";
    if (risk >= 60) level = "high"; else if (risk >= 35) level = "moderate";
    return { id, name: rule.name, risk, confidence, level, triggered, explain: rule.explain, tips: rule.tips };
  }).sort((a,b)=>b.risk - a.risk);

  // Overall hormonal balance: 100 minus highest condition risk
  const hormonalScore = Math.max(0, 100 - results[0].risk);
  const riskLevel = results[0].level;

  // Pattern detection notifications
  const patterns = [];
  if (trends.weightUp) patterns.push({ icon:"⚖️", text:`Gradual weight increase detected over the last 14 days.` });
  if (trends.weightVolatile) patterns.push({ icon:"📉", text:`Notable weight fluctuations — consider tracking meals.` });
  if (trends.prePeriodMoodDrop) patterns.push({ icon:"🌙", text:`Mood drop detected in the days approaching your period.` });
  if (trends.sleepAvg && trends.sleepAvg < 6) patterns.push({ icon:"😴", text:`Average sleep is ${trends.sleepAvg.toFixed(1)}h — consistent sleep loss observed.` });
  const recentStress = avg(window.slice(0,7).map(e=>e.stress).filter(Number));
  if (recentStress >= 6) patterns.push({ icon:"⚡", text:`Elevated stress observed across the last 7 days.` });
  const recentFatigue = window.slice(0,7).filter(e=>e.energy <= 3).length;
  if (recentFatigue >= 4) patterns.push({ icon:"🔋", text:`Consistent fatigue — energy was low on ${recentFatigue} of last 7 days.` });
  const recentAcne = window.slice(0,10).filter(e=>e.acne >= 6).length;
  if (recentAcne >= 4) patterns.push({ icon:"✨", text:`Recurring skin breakouts noticed — possible hormonal link.` });

  return { results, hormonalScore, riskLevel, trends, patterns };
}

// Build a friendly insight sentence
function topInsight(analysis) {
  if (!analysis.results.length) return "Start tracking daily to unlock personalized insights.";
  const top = analysis.results[0];
  if (top.risk < 25) return "Your recent signals look balanced. Keep up your current habits.";
  return `Over the last 14 days, recurring signals indicate a ${top.level} pattern associated with ${top.name}.`;
}

// Cycle prediction (simple 28-day model + last period)
function predictCycle(entries, cycleLen = 28, periodLen = 5) {
  const periodDays = entries.filter(e => e.period).map(e=>e.date).sort();
  if (!periodDays.length) return null;
  const lastStart = periodDays[periodDays.length-1];
  const last = new Date(lastStart);
  const next = new Date(last); next.setDate(next.getDate() + cycleLen);
  const ovulation = new Date(last); ovulation.setDate(ovulation.getDate() + Math.round(cycleLen/2) - 1);
  const fertileStart = new Date(ovulation); fertileStart.setDate(fertileStart.getDate() - 4);
  const fertileEnd   = new Date(ovulation); fertileEnd.setDate(fertileEnd.getDate() + 1);
  const pmsStart = new Date(next); pmsStart.setDate(pmsStart.getDate() - 5);
  return { lastStart, next: next.toISOString().slice(0,10), ovulation: ovulation.toISOString().slice(0,10),
           fertileStart: fertileStart.toISOString().slice(0,10), fertileEnd: fertileEnd.toISOString().slice(0,10),
           pmsStart: pmsStart.toISOString().slice(0,10), cycleLen, periodLen };
}
