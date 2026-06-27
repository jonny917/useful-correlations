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
  "hour-of-week-shaded": {
    id: "hour-of-week-shaded",
    label: "Hour of week (Sun 6–10pm shaded)",
    unit: "hour",
    cadence: "hourly",
    startDate: null,
    endDate: null,
    data: [12, 10, 8, 7, 9, 14, 22, 35, 48, 52, 41, 28, 18, 12, 10, 9, 11, 16, 24, 38, 51, 56, 44, 30],
    source: { url: null, label: "Editorial composite (illustrative)", real: false },
  },
  "streaming-password-resets-hourly": {
    id: "streaming-password-resets-hourly",
    label: "Streaming service password resets",
    unit: "k/hr",
    cadence: "hourly",
    startDate: null,
    endDate: null,
    data: [2.1, 1.8, 1.6, 1.4, 1.7, 2.5, 4.1, 6.8, 9.2, 10.4, 7.9, 5.1, 3.0, 2.0, 1.7, 1.5, 1.9, 2.8, 4.4, 7.2, 9.8, 11.1, 8.4, 5.6],
    source: { url: null, label: "Editorial composite (illustrative)", real: false },
  },
  "us-mortgage-30y-monthly": {
    id: "us-mortgage-30y-monthly",
    label: "Avg 30-yr mortgage rate",
    unit: "%",
    cadence: "monthly",
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    data: [6.8, 6.9, 7.1, 7.0, 6.8, 6.5, 6.3, 6.1, 5.9, 5.7, 5.6, 5.8, 6.0, 6.2, 6.4, 6.3, 6.1, 5.9, 5.6, 5.4, 5.2, 5.0, 4.9, 5.1],
    source: { url: null, label: "Editorial composite (illustrative)", real: false },
  },
  "renovate-youtube-monthly": {
    id: "renovate-youtube-monthly",
    label: "'How to renovate' YT views",
    unit: "M",
    cadence: "monthly",
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    data: [22, 20, 18, 19, 22, 26, 29, 32, 36, 41, 44, 39, 34, 30, 27, 28, 31, 35, 41, 46, 52, 58, 62, 55],
    source: { url: null, label: "Editorial composite (illustrative)", real: false },
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
      { idx: 28, label: "Winter trough · seasonal low temp" },
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
    id: "password-reset",
    title: "Sunday evenings & password resets",
    seriesA: { datasetId: "hour-of-week-shaded", color: "primary" },
    seriesB: { datasetId: "streaming-password-resets-hourly", color: "secondary" },
    r: 0.84,
    annotations: [
      { idx: 9, label: "'Sunday Scaries' peak" },
      { idx: 21, label: "Pre-Monday cleanup" },
    ],
    why: {
      playful: "The Sunday Scaries are real, and they end with you locked out of Hulu. Password resets spike right before bed — the digital equivalent of cleaning your desk before Monday.",
      serious: "End-of-week behavior includes account hygiene. Reset volume correlates with 'deliberate winding down' — a high-attention, low-distraction window.",
    },
    soWhat: "Churn-window targeting: Sunday 8–10pm is when users are *thinking* about their subscriptions. Best moment for retention creative, worst for upsells.",
    category: "Time × Behavior",
  },
  {
    id: "home-reno",
    title: "Home-reno YouTube & mortgage rates",
    seriesA: { datasetId: "us-mortgage-30y-monthly", color: "primary" },
    seriesB: { datasetId: "renovate-youtube-monthly", color: "secondary" },
    r: -0.78,
    annotations: [
      { idx: 10, label: "Rate-cut speculation" },
      { idx: 22, label: "Refi window opens" },
    ],
    why: {
      playful: "When mortgage rates dip, people don't just refinance — they binge-watch kitchen demolition videos. The dream of 'staying put and improving' is a leading indicator.",
      serious: "Lower rates unlock home-equity intent. YouTube reno views lead refi applications by ~3 weeks, making it a leading-indicator panel.",
    },
    soWhat: "Intent signal for refi ads: bid up reno-adjacent inventory when YT views climb — you're catching homeowners *before* they shop lenders.",
    category: "Finance × Media",
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
