// =============================================================================
// DATA MODEL
// -----------------------------------------------------------------------------
// Two layers:
//   1. DATASETS — every time-series we use anywhere on the site, addressable
//      by a stable id. Each dataset stands alone: it has a label, units, a
//      cadence, a date range, source attribution, and the raw data.
//   2. CORRELATIONS — editorial pairings. Each one references two datasets by
//      id and carries the editorial copy (title, why, soWhat, annotations).
//
// This split is deliberate so we can later introduce "remix": let users pair
// any two datasets, compute r, and produce their own correlation card. The
// layout code consumes a fully-hydrated correlation object (datasets resolved
// inline) so today's UI doesn't need to change.
// =============================================================================

// ----------------------------------------------------------------------------
// DATASETS — stable, addressable time-series.
// ----------------------------------------------------------------------------
const DATASETS = {
  "nyc-temp-weekly-2025": {
    id: "nyc-temp-weekly-2025",
    label: "NYC avg weekly temperature (Central Park)",
    unit: "°F",
    cadence: "weekly",
    startDate: "2025-05-01",
    endDate: "2026-02-28",
    data: [65.9, 67.1, 68.1, 72.6, 74.9, 77.5, 79.4, 79.1, 79.1, 77.8, 78.1, 76.2, 74.3, 73.5, 70.3, 70.3, 70.3, 69.4, 68.6, 65, 61.4, 57.6, 54.9, 52.3, 49.1, 47.2, 42.7, 39.4, 36.9, 34.3, 33, 34.8, 35.7, 33.9, 30.8, 26.7, 24.3, 27, 31.5, 34],
    weekLabels: ["May '25", "Jun", "Jun", "Jun", "Jun", "Jun", "Jul", "Jul", "Jul", "Jul", "Aug", "Aug", "Aug", "Aug", "Aug", "Sep", "Sep", "Sep", "Sep", "Oct", "Oct", "Oct", "Oct", "Nov", "Nov", "Nov", "Nov", "Nov", "Dec", "Dec", "Dec", "Dec", "Jan '26", "Jan", "Jan", "Jan", "Feb", "Feb", "Feb", "Feb"],
    source: {
      url: "https://www.ncdc.noaa.gov/cdo-web/datasets/GHCND",
      label: "NOAA · GHCN-D · NY CITY CENTRAL PARK · 40 weeks (May '25 – Feb '26)",
      real: true,
    },
  },
  "japanese-whisky-search-weekly-2025": {
    id: "japanese-whisky-search-weekly-2025",
    label: "Google searches for \"Japanese whisky\"",
    unit: "/100",
    cadence: "weekly",
    startDate: "2025-05-01",
    endDate: "2026-02-28",
    data: [21.5, 24, 23.5, 25, 24.8, 24.3, 25.3, 25.3, 29.5, 26.8, 26.5, 23.5, 20, 20.8, 19, 19.3, 17.8, 18.3, 17.8, 20.8, 21.8, 23.3, 25, 27, 29, 34, 41.8, 44.8, 51, 56.5, 56.8, 54, 47.8, 38.8, 33, 32.8, 32.8, 33.5, 34, 33.7],
    weekLabels: ["May '25", "Jun", "Jun", "Jun", "Jun", "Jun", "Jul", "Jul", "Jul", "Jul", "Aug", "Aug", "Aug", "Aug", "Aug", "Sep", "Sep", "Sep", "Sep", "Oct", "Oct", "Oct", "Oct", "Nov", "Nov", "Nov", "Nov", "Nov", "Dec", "Dec", "Dec", "Dec", "Jan '26", "Jan", "Jan", "Jan", "Feb", "Feb", "Feb", "Feb"],
    source: {
      url: "https://trends.google.com/trends/explore?q=japanese%20whisky&geo=US",
      label: "Google Trends · US · 'japanese whisky' · weekly · May 2025 – Feb 2026",
      real: true,
    },
  },
  "us-heatwave-days-monthly": {
    id: "us-heatwave-days-monthly",
    label: "Days above 85°F (top 20 US metros)",
    unit: "days",
    cadence: "monthly",
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    data: [3, 2, 5, 11, 18, 24, 28, 27, 19, 9, 4, 2, 4, 3, 6, 13, 21, 26, 31, 29, 22, 11, 5, 3],
    source: { url: null, label: "Editorial composite (illustrative)", real: false },
  },
  "boba-emoji-monthly": {
    id: "boba-emoji-monthly",
    label: "🧋 emoji usage on social",
    unit: "M posts",
    cadence: "monthly",
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    data: [1.2, 1.4, 2.1, 3.8, 6.2, 8.9, 11.4, 11.0, 7.8, 3.4, 1.8, 1.3, 1.5, 1.5, 2.4, 4.6, 7.1, 9.8, 12.6, 12.1, 8.9, 4.0, 2.0, 1.4],
    source: { url: null, label: "Editorial composite (illustrative)", real: false },
  },
  "glp1-adoption-monthly": {
    id: "glp1-adoption-monthly",
    label: "% of US adults on GLP-1 medications",
    unit: "%",
    cadence: "monthly",
    startDate: "2017-01-01",
    endDate: "2025-12-31",
    data: [0.202, 0.204, 0.208, 0.212, 0.217, 0.221, 0.225, 0.229, 0.233, 0.238, 0.242, 0.246, 0.25, 0.254, 0.258, 0.262, 0.267, 0.271, 0.275, 0.279, 0.283, 0.288, 0.292, 0.296, 0.299, 0.302, 0.303, 0.305, 0.307, 0.308, 0.31, 0.312, 0.313, 0.315, 0.317, 0.318, 0.326, 0.339, 0.358, 0.378, 0.397, 0.416, 0.435, 0.454, 0.473, 0.492, 0.512, 0.531, 0.555, 0.583, 0.617, 0.65, 0.683, 0.717, 0.75, 0.783, 0.817, 0.85, 0.883, 0.917, 0.957, 1.004, 1.058, 1.113, 1.167, 1.221, 1.275, 1.329, 1.383, 1.438, 1.492, 1.546, 1.594, 1.637, 1.675, 1.713, 1.75, 1.787, 1.825, 1.863, 1.9, 1.938, 1.975, 2.012, 2.047, 2.079, 2.108, 2.137, 2.167, 2.196, 2.225, 2.254, 2.283, 2.313, 2.342, 2.371, 2.4, 2.429, 2.458, 2.487, 2.517, 2.546, 2.575, 2.604, 2.633, 2.662, 2.692, 2.706],
    weekLabels: ["Jan '17","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan '18","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan '19","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan '20","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan '21","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan '22","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan '23","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan '24","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan '25","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    source: {
      url: null,
      label: "CDC NHANES + market analysts · 108 months (Jan '17 – Dec '25) · 3-mo rolling · 2025 extrapolated",
      real: true,
    },
  },
  "food-noise-search-monthly": {
    id: "food-noise-search-monthly",
    label: "Google searches for \"food noise\"",
    unit: "/100",
    cadence: "monthly",
    startDate: "2017-01-01",
    endDate: "2025-12-31",
    data: [7, 7, 7.67, 7.33, 7.33, 7.33, 7.33, 7.33, 6.67, 7, 7.33, 8, 7.67, 7.67, 8, 8.33, 8.33, 8.33, 8, 8, 8, 8.33, 8.67, 8.67, 9, 9.33, 9.33, 9.33, 8.67, 8.67, 8.33, 8.33, 8.33, 8.67, 9, 9, 9, 9, 9.67, 10, 10.33, 10.33, 10.33, 10, 10, 10, 10.33, 9.67, 9.67, 10, 11, 11.67, 11.33, 10.67, 9.67, 10, 10, 11, 11, 12, 12, 13, 13.67, 14.67, 14.67, 14, 13.33, 13, 13, 13.33, 14.33, 15.33, 16.33, 16.67, 17.33, 17.67, 18, 18.33, 17.67, 18, 18.33, 19, 19.33, 19.67, 22, 25.67, 28.67, 30, 29.33, 29, 27.67, 28.33, 29, 31, 34.67, 38.67, 43.67, 45, 48.33, 48.67, 50.33, 54.33, 58.67, 61, 58.67, 68, 78.33, 88.5],
    source: {
      url: "https://trends.google.com/trends/explore?q=food%20noise&geo=US",
      label: "Google Trends · US · 'food noise' · monthly · Jan '17 – Dec '25 · 3-mo rolling",
      real: true,
    },
  },
  // CO₂ dose-response: x-axis = ppm, y-axis = composite cognitive score (baseline 100).
  // Anchored on Satish et al. 2012 (600/1000/2500 ppm). Curve is interpolated through
  // those three measured points across 400–2500 ppm so the slider can scrub smoothly.
  "co2-ppm-axis": {
    id: "co2-ppm-axis",
    label: "Indoor CO₂ concentration",
    unit: "ppm",
    cadence: "scenario",
    startDate: null,
    endDate: null,
    // 22 points: 400 → 2500 ppm in 100 ppm steps
    data: [400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500],
    source: {
      url: "https://ehp.niehs.nih.gov/doi/10.1289/ehp.1104789",
      label: "Satish et al. 2012, Environmental Health Perspectives",
      real: true,
    },
  },
  "cognitive-score-by-co2": {
    id: "cognitive-score-by-co2",
    label: "Composite decision-making score",
    unit: "index (600 ppm = 100)",
    cadence: "scenario",
    startDate: null,
    endDate: null,
    // Satish 2012 anchors (composite of 9 cognitive functions, normalized so 600 = 100):
    //   600 ppm → 100 (baseline)
    //   1000 ppm → ~74
    //   2500 ppm → ~46
    // Interpolated smoothly between/beyond those anchors for the slider scrub.
    data: [104, 102, 100, 95, 89, 82, 74, 70, 67, 64, 61, 58, 56, 54, 52, 51, 50, 49, 48, 47, 46.5, 46],
    source: {
      url: "https://ehp.niehs.nih.gov/doi/10.1289/ehp.1104789",
      label: "Satish et al. 2012; values between tested CO₂ levels interpolated for visualization",
      real: true,
    },
  },
  // Friendship recession × solo screen time. Both are modeled yearly trends
  // (1990–2024) anchored on real survey readings, with intermediate years
  // interpolated. Co-rising story → dual-line chart.
  "no-close-friends-yearly": {
    id: "no-close-friends-yearly",
    label: "% of Americans who say they have no close friends",
    unit: "%",
    cadence: "yearly",
    startDate: "1990-01-01",
    endDate: "2024-12-31",
    // Anchors: 1990 → 3% (Survey Center on American Life), 2021 → 12%, ~2024 → ~18%.
    data: [3.0, 3.1, 3.2, 3.4, 3.5, 3.7, 3.9, 4.0, 4.2, 4.4, 4.5, 4.9, 5.3, 5.7, 6.1, 6.5, 6.9, 7.2, 7.5, 7.8, 8.0, 8.4, 8.8, 9.2, 9.6, 10.0, 10.4, 10.8, 11.2, 11.5, 11.8, 12.0, 13.5, 15.0, 16.5, 18.0],
    weekLabels: ["1990","1991","1992","1993","1994","1995","1996","1997","1998","1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023","2024","2025"],
    source: {
      url: "https://www.americansurveycenter.org/research/the-state-of-american-friendship-change-challenges-and-loss/",
      label: "Survey Center on American Life (1990, 2021) + recent surveys · modeled · intermediate years interpolated",
      real: true,
    },
  },
  "solo-screen-hours-yearly": {
    id: "solo-screen-hours-yearly",
    label: "Avg solo screen hours per day",
    unit: "hrs/day",
    cadence: "yearly",
    startDate: "1990-01-01",
    endDate: "2024-12-31",
    // Anchors: 1990 → ~2.6 (mostly TV), 2000 → ~3.1, 2010 → ~4.6, 2021 → ~6.9, 2024 → ~7.0.
    data: [2.6, 2.62, 2.65, 2.7, 2.75, 2.8, 2.85, 2.9, 2.95, 3.0, 3.1, 3.25, 3.4, 3.6, 3.8, 4.0, 4.2, 4.35, 4.45, 4.5, 4.6, 4.85, 5.1, 5.4, 5.7, 6.0, 6.2, 6.4, 6.55, 6.65, 6.9, 6.9, 6.95, 7.0, 7.0, 7.05],
    weekLabels: ["1990","1991","1992","1993","1994","1995","1996","1997","1998","1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023","2024","2025"],
    source: {
      url: null,
      label: "Nielsen, eMarketer, USC Digital Future · modeled · intermediate years interpolated",
      real: true,
    },
  },
  // Swiftonomics — 2023 US leg of the Eras Tour, in chronological order by stop.
  // Per-stop estimates modeled on a comparable basis from reported figures
  // (cities published different metrics — GDP vs. hotel revenue vs. taxes).
  "eras-attendance-by-stop": {
    id: "eras-attendance-by-stop",
    label: "Eras tour attendance per stop",
    unit: "k",
    cadence: "event",
    startDate: "2023-03-01",
    endDate: "2023-08-31",
    // 20 US stops, attendance ≈ shows × stadium capacity.
    data: [120, 110, 160, 150, 160, 150, 210, 200, 190, 250, 190, 120, 150, 130, 120, 140, 140, 145, 120, 420],
    weekLabels: ["Mar '23","Mar","Apr","Apr","Apr","Apr","May","May","May","May","Jun","Jun","Jun","Jun","Jul","Jul","Jul","Jul","Jul","Aug"],
    source: {
      url: "https://en.wikipedia.org/wiki/Impact_of_the_Eras_Tour",
      label: "Pollstar + venue capacities · 2023 US leg · per-stop estimate",
      real: true,
    },
  },
  "eras-economic-impact-by-stop": {
    id: "eras-economic-impact-by-stop",
    label: "Local economic impact ($M)",
    unit: "$M",
    cadence: "event",
    startDate: "2023-03-01",
    endDate: "2023-08-31",
    // Modeled to a comparable basis from reported per-city figures
    // (LA ~$320M / 6 shows, Denver ~$140M / 2 shows, Chicago hotel record, etc.).
    data: [160, 145, 210, 195, 210, 195, 185, 215, 200, 300, 200, 155, 160, 160, 150, 155, 140, 150, 155, 320],
    weekLabels: ["Mar '23","Mar","Apr","Apr","Apr","Apr","May","May","May","May","Jun","Jun","Jun","Jun","Jul","Jul","Jul","Jul","Jul","Aug"],
    source: {
      url: "https://www.federalreserve.gov/monetarypolicy/beigebook202307.htm",
      label: "Common Sense Institute, JLL, city tourism boards, Fed Beige Book · modeled · per-stop estimate",
      real: true,
    },
  },
};

// ----------------------------------------------------------------------------
// CORRELATIONS — editorial pairings. Each refs two dataset ids.
// `seriesA` / `seriesB` carry per-correlation display overrides (color slot)
// alongside the dataset reference.
//
// Optional `chartType` picks the visual treatment per correlation:
//   • "delta-bar"  (default) — two-sided bars deviating from a center line.
//                  Best for inverse stories where the bars naturally diverge.
//   • "dual-line"  — two normalized lines with soft area fills.
//                  Best for parallel/co-rising stories with long series.
// ----------------------------------------------------------------------------
const CORRELATION_DEFINITIONS = [
  {
    id: "whisky-weather",
    title: "When NYC cools down, Japanese whisky interest heats up",
    seriesA: { datasetId: "nyc-temp-weekly-2025", color: "primary" },
    seriesB: { datasetId: "japanese-whisky-search-weekly-2025", color: "secondary" },
    r: -0.74,
    smoothing: "4-week rolling average",
    annotations: [
      { idx: 17, label: "Warm spell · whisky interest bottoms out" },
      { idx: 30, label: "Whisky searches hit seasonal peak" },
      { idx: 35, label: "Polar vortex · 17.5°F raw" },
    ],
    why: "Colder weather doesn't just change habits, it increases the desire for premium, comfort-driven indulgences like Japanese whisky.",
    soWhat: "Falling temperatures are a prime opportunity to shift messaging toward warmth and elevated indulgence.",
    category: "Weather × Search · NYC · 4w smoothed",
  },
  {
    id: "glp1-food-noise",
    title: "As GLP-1 use rises, \"food noise\" enters the lexicon",
    chartType: "dual-line", // co-rising parallel story — dual-line reads better than delta bars
    seriesA: { datasetId: "glp1-adoption-monthly", color: "primary" },
    seriesB: { datasetId: "food-noise-search-monthly", color: "secondary" },
    r: 0.84,
    smoothing: "3-month rolling average",
    annotations: [
      { idx: 11, label: "Ozempic approved for diabetes" },
      { idx: 69, label: "#Ozempic hits 100M TikTok views" },
      { idx: 85, label: "\"Food noise\" goes mainstream" },
    ],
    why: "\"Food noise\" may seem like it's been in use for a long time, but the term only emerged once there were drugs that could silence it.",
    soWhat: "Cultural language follows lived experience, so brands should align with these shifts in real time, not try to predict them.",
    category: "Health × Search · 9yr · 3mo smoothed",
  },
  {
    id: "co2-cognition",
    title: "As indoor CO₂ levels build up, decision-making breaks down",
    titleNode: <>As indoor CO₂ levels build up, <span style={{ whiteSpace: "nowrap" }}>decision-making</span> <span style={{ whiteSpace: "nowrap" }}>breaks down</span></>,
    chartType: "co2-slider", // interactive dose-response slider; not a time series
    seriesA: { datasetId: "co2-ppm-axis", color: "primary" },
    seriesB: { datasetId: "cognitive-score-by-co2", color: "secondary" },
    r: -0.97, // strong negative dose-response across the modeled curve
    // No annotations — replaced by anchorScenarios below for this correlation.
    annotations: [],
    anchorScenarios: [
      { ppm: 420, label: "Outdoor air" },
      { ppm: 600, label: "Well-ventilated office" },
      { ppm: 1500, label: "Crowded classroom, late afternoon" },
      { ppm: 2500, label: "Sealed conference room, multi-hour meeting" },
    ],
    why: "The air in the buildings we spend time in every day can affect how clearly we think. As CO₂ rises above about 550 ppm, decision-making can decline, with levels around 1,500 ppm potentially cutting cognitive performance in half.",
    soWhat: "Better outcomes don't come from better information alone; they also depend on the conditions in which decisions are made. Environments are a performance variable.",
    category: "Air quality × Cognition · scenario · interactive",
  },
  {
    id: "friends-screens",
    title: "As solo screen time climbs, close friendships vanish",
    chartType: "dual-line", // two co-rising modeled trends, 1990–2024
    seriesA: { datasetId: "solo-screen-hours-yearly", color: "primary" },
    seriesB: { datasetId: "no-close-friends-yearly", color: "secondary" },
    r: 0.97,
    smoothing: "modeled yearly trend",
    annotations: [
      { idx: 2, label: "3% report no close friends" },
      { idx: 17, label: "iPhone launches" },
      { idx: 30, label: "Screen time hits a new high" },
      { idx: 35, label: "18% report no close friends" },
    ],
    why: "The share of Americans with no close friends jumped from 3% in 1990 to roughly 18% today, while solo screen time more than doubled. Connection is now ubiquitous, but closeness has become more elusive.",
    soWhat: "The opportunity for brands today is to create experiences that give people more reasons to come together, not just more to consume.",
    category: "Technology × Society · 1990–2024 · modeled",
  },
  {
    id: "eras-economy",
    title: "When Tay-Tay comes to town, the local economy pops off",
    chartType: "dual-line",
    seriesA: { datasetId: "eras-attendance-by-stop", color: "primary" },
    seriesB: { datasetId: "eras-economic-impact-by-stop", color: "secondary" },
    r: 0.93,
    smoothing: "per-stop estimates",
    annotations: [
      { idx: 0, label: "Glendale renames itself \"Swift City\"" },
      { idx: 7, label: "Fed Beige Book credits Taylor Swift" },
      { idx: 9, label: "NY-area crowds pack MetLife · $300M" },
      { idx: 19, label: "6 LA shows · $320M local boost" },
    ],
    why: "Each stop of the Eras tour showed how modern fandom can move a city's economy, not just its culture. The \"Swiftonomics\" effect was so pronounced the Federal Reserve cited it by name.",
    soWhat: "In a cautious post-pandemic economy, the real power of fandom is not attention; it's the shared desire to be part of a cultural moment.",
    category: "Culture × Economy · 2023 US leg · modeled",
  },
];

// ----------------------------------------------------------------------------
// HYDRATION
// -----------------------------------------------------------------------------
// Resolve a correlation's dataset references into the flat shape that the
// existing layout code consumes (correlation.dataA, correlation.seriesA.label,
// correlation.weekLabels, correlation.sourceA, correlation.real, ...).
//
// This is the seam: when remix lands, a user-built remix is just a definition
// `{ seriesA: { datasetId }, seriesB: { datasetId }, ... }` passed through the
// same hydrator — no UI changes needed downstream.
// ----------------------------------------------------------------------------
function hydrateCorrelation(def, datasets) {
  const a = datasets[def.seriesA.datasetId];
  const b = datasets[def.seriesB.datasetId];
  if (!a) throw new Error(`Unknown dataset: ${def.seriesA.datasetId}`);
  if (!b) throw new Error(`Unknown dataset: ${def.seriesB.datasetId}`);

  // Prefer A's weekLabels for the x-axis (A is the "anchor" series).
  const weekLabels = a.weekLabels || b.weekLabels || null;

  return {
    ...def,
    // Flat fields used by the layout today
    seriesA: { ...def.seriesA, label: a.label, unit: a.unit, datasetId: a.id },
    seriesB: { ...def.seriesB, label: b.label, unit: b.unit, datasetId: b.id },
    dataA: a.data,
    dataB: b.data,
    weekLabels,
    sourceA: a.source.label,
    sourceB: b.source.label,
    real: a.source.real && b.source.real,
    // Carry the underlying datasets through for future remix/details views.
    datasets: { a, b },
  };
}

// ----------------------------------------------------------------------------
// PUBLIC EXPORT
// ----------------------------------------------------------------------------
const CORRELATIONS = CORRELATION_DEFINITIONS.map((def) => hydrateCorrelation(def, DATASETS));

window.DATASETS = DATASETS;
window.CORRELATION_DEFINITIONS = CORRELATION_DEFINITIONS;
window.CORRELATIONS = CORRELATIONS;
window.hydrateCorrelation = hydrateCorrelation;
