// Direction B: Bold data-terminal / atlas layout
// Stronger contrast, dense bento grid, novel "delta-bar" chart that emphasizes
// month-by-month co-movement rather than absolute values.

const terminalStyles = {
  root: {
    background: "var(--surface, #FFF5E6)",
    color: "var(--text, #111827)",
    fontFamily: "Inter, system-ui, sans-serif",
    minHeight: "100%",
    width: "100%",
    boxSizing: "border-box",
  },
};

function TerminalLayout({ correlations, themeColors }) {
  // Read initial active id from URL: ?c=<id> (shareable, survives link scrapers)
  // or #<id> (legacy/in-app), falling back to the default card.
  const initialId = (() => {
    if (typeof window !== "undefined") {
      const fromQuery = new URLSearchParams(window.location.search).get("c") || "";
      if (correlations.find((c) => c.id === fromQuery)) return fromQuery;
    }
    const fromHash = typeof window !== "undefined" ? decodeURIComponent((window.location.hash || "").slice(1)) : "";
    if (correlations.find((c) => c.id === fromHash)) return fromHash;
    // Default landing card when there's no hash.
    const preferred = correlations.find((c) => c.id === "friends-screens");
    return preferred ? preferred.id : correlations[0].id;
  })();
  const [activeId, setActiveId] = React.useState(initialId);
  const active = correlations.find((c) => c.id === activeId) || correlations[0];
  const detailRef = React.useRef(null);

  // Keep URL hash + document title + OG meta tags in sync with the active correlation.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    // Hash (preserve scroll — replaceState avoids History entries piling up on every click)
    const desiredHash = `#${active.id}`;
    if (window.location.hash !== desiredHash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${desiredHash}`);
    }
    // Title
    document.title = `${active.title} — Curious Correlations`;
    // OG / Twitter / canonical meta — set or update
    const setMeta = (selector, attr, value) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const [, key, val] = selector.match(/\[(\w+)="([^"]+)"\]/) || [];
        if (key && val) el.setAttribute(key, val);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };
    const url = `${window.location.origin}${window.location.pathname}#${active.id}`;
    const description = active.soWhat || active.why?.serious || active.title;
    setMeta('meta[property="og:title"]', "content", active.title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:type"]', "content", "article");
    setMeta('meta[property="og:site_name"]', "content", "Curious Correlations");
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", active.title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="description"]', "content", description);
    // Canonical
    let canon = document.head.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement("link");
      canon.setAttribute("rel", "canonical");
      document.head.appendChild(canon);
    }
    canon.setAttribute("href", url);
  }, [active]);

  // Listen for back/forward navigation that changes the hash.
  React.useEffect(() => {
    const onHash = () => {
      const id = decodeURIComponent((window.location.hash || "").slice(1));
      if (correlations.find((c) => c.id === id) && id !== activeId) setActiveId(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [activeId, correlations]);

  const handleSelect = (id) => {
    setActiveId(id);
    // smooth-scroll the detail block into view so the animation is visible
    requestAnimationFrame(() => {
      const el = detailRef.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  };

  return (
    <div style={terminalStyles.root}>
      <TerminalNav themeColors={themeColors} />
      <TerminalMaster
        correlations={correlations}
        activeId={activeId}
        onSelect={handleSelect}
        themeColors={themeColors}
      />
      <div ref={detailRef}>
        <TerminalDetail correlation={active} themeColors={themeColors} />
      </div>
      <TerminalGallery
        id="explore"
        correlations={correlations}
        activeId={activeId}
        onSelect={handleSelect}
        themeColors={themeColors}
      />
      <TerminalSubmit id="submit" themeColors={themeColors} />
    </div>
  );
}

function TerminalNav({ themeColors }) {
  return (
    <header
      style={{
        padding: "24px 64px",
        background: themeColors.text,
        color: themeColors.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 13,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}
          style={{ opacity: 0.85, color: "inherit", textDecoration: "none", cursor: "pointer" }}
        >
          curious-correlations.com
        </a>
        <span aria-hidden="true" style={{ opacity: 0.25, fontSize: 14, padding: "0 4px" }}>|</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: themeColors.surface,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: themeColors.primary,
              boxShadow: `0 0 0 3px ${themeColors.primary}33`,
            }}
          />
          real data
        </span>
      </div>
      <div style={{ display: "flex", gap: 32, opacity: 0.85 }}>
        <a
          href="#explore"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("explore");
            if (!el) return;
            // land with the carousel section header at the top of the viewport
            window.scrollTo({
              top: el.getBoundingClientRect().top + window.scrollY - 16,
              behavior: "smooth",
            });
            pulseTarget(el);
          }}
          style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}
        >
          explore correlations
        </a>
        <a
          href="#submit"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("submit");
            if (!el) return;
            // land so the dark submit block fully fills the viewport
            // (bottom of section aligned to bottom of viewport)
            const rect = el.getBoundingClientRect();
            const top = rect.bottom + window.scrollY - window.innerHeight;
            window.scrollTo({ top, behavior: "smooth" });
            pulseTarget(el);
          }}
          style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}
        >
          submit ↗
        </a>
      </div>
    </header>
  );
}

function TerminalMaster({ correlations, activeId, onSelect, themeColors }) {
  return (
    <section style={{ padding: "56px 64px 32px", borderBottom: `1px solid ${themeColors.text}15` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 48 }}>
        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 80px)",
            fontWeight: 900,
            letterSpacing: -2,
            margin: 0,
            lineHeight: 0.95,
          }}
        >
          The atlas of<br />
          <span style={{ background: themeColors.primary, padding: "0 12px" }}>curious</span>{" "}
          correlations
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.5,
            maxWidth: 320,
            margin: 0,
            color: themeColors.text + "cc",
            textWrap: "pretty",
          }}
        >
          A curated, evolving exploration of how the world connects in unexpected ways.
        </p>
      </div>
    </section>
  );
}

function TerminalDetail({ correlation, themeColors }) {
  const [highlightedAnnotation, setHighlightedAnnotation] = React.useState(null);
  // CO₂ scenario state: ppm value of the active "Common rooms" scenario.
  // Only meaningful when chartType === "co2-slider", but lifted here so the
  // chart card and the scenarios card can share/sync it. null = no highlight,
  // letting the entrance animation play unobstructed on initial load.
  const [highlightedPpm, setHighlightedPpm] = React.useState(null);

  // Reset state when the correlation itself changes.
  React.useEffect(() => {
    setHighlightedAnnotation(null);
    setHighlightedPpm(null);
  }, [correlation.id]);

  return (
    <section style={{ padding: "40px 64px 64px", display: "grid", gap: 24, gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "minmax(0, auto)" }}>
      {/* Big hero card with delta chart */}
      <div style={{ gridColumn: "span 8" }}>
        <DeltaChartCard
          correlation={correlation}
          themeColors={themeColors}
          highlightedAnnotation={highlightedAnnotation}
          highlightedPpm={highlightedPpm}
        />
      </div>
      {/* R coefficient panel */}
      <div style={{ gridColumn: "span 4" }}>
        <RPanel correlation={correlation} themeColors={themeColors} />
      </div>
      {/* Why card */}
      <div style={{ gridColumn: "span 5" }}>
        <WhyCard correlation={correlation} themeColors={themeColors} />
      </div>
      {/* So what card */}
      <div style={{ gridColumn: "span 4" }}>
        <SoWhatCard correlation={correlation} themeColors={themeColors} />
      </div>
      {/* Annotations card — or anchor scenarios for interactive scrub charts */}
      <div style={{ gridColumn: "span 3" }}>
        {correlation.anchorScenarios ? (
          <AnchorScenariosCard
            correlation={correlation}
            themeColors={themeColors}
            highlightedPpm={highlightedPpm}
            onHighlight={setHighlightedPpm}
          />
        ) : (
          <AnnotationsCard
            correlation={correlation}
            themeColors={themeColors}
            highlightedAnnotation={highlightedAnnotation}
            onHighlight={setHighlightedAnnotation}
          />
        )}
      </div>
      {/* Take it with you removed — share lives in the chart card header */}
    </section>
  );
}

function DeltaChartCard({ correlation, themeColors, highlightedAnnotation, highlightedPpm }) {
  const { dataA, dataB } = correlation;
  const n = dataA.length;
  const w = 920;
  // co2-slider chart no longer needs extra footer space; same height as the
  // other chart variants.
  const h = 360;
  const pad = { l: 40, r: 40, t: 32, b: 40 };

  // Live-fill animation: 0..1 progress, restarts whenever correlation.id changes.
  const progress = useChartProgress(correlation.id, 1900);

  const chartType = correlation.chartType || "delta-bar";
  const cadenceLabel = chartType === "yearly-bars"
    ? `Annual · ${correlation.dataA.length} years · hrs per day`
    : chartType === "co2-slider"
    ? `Dose-response · ${correlation.dataA.length} pts · 400–2500 ppm`
    : correlation.weekLabels
    ? `Co-movement · ${correlation.weekLabels.length} pts · normalized`
    : "Co-movement · normalized deviation from mean";

  return (
    <div
      style={{
        background: themeColors.text,
        color: themeColors.surface,
        borderRadius: 24,
        padding: 32,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        <span>{cadenceLabel}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>
          {correlation.titleNode || correlation.title}
        </div>
        <ShareButton correlation={correlation} themeColors={themeColors} />
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {chartType === "dual-line" ? (
          <DualLineChartBody
            correlation={correlation}
            themeColors={themeColors}
            progress={progress}
            highlightedAnnotation={highlightedAnnotation}
            w={w} h={h} pad={pad}
          />
        ) : chartType === "yearly-bars" ? (
          <YearlyBarsChartBody
            correlation={correlation}
            themeColors={themeColors}
            progress={progress}
            highlightedAnnotation={highlightedAnnotation}
            w={w} h={h} pad={pad}
          />
        ) : chartType === "co2-slider" ? (
          <CO2SliderChartBody
            correlation={correlation}
            themeColors={themeColors}
            progress={progress}
            highlightedPpm={highlightedPpm}
            w={w} h={h} pad={pad}
          />
        ) : (
          <DeltaBarChartBody
            correlation={correlation}
            themeColors={themeColors}
            progress={progress}
            highlightedAnnotation={highlightedAnnotation}
            w={w} h={h} pad={pad}
          />
        )}
      </svg>
      {chartType === "co2-slider" ? (
        <div style={{ display: "flex", gap: 24, marginTop: 12, fontSize: 12, fontFamily: "JetBrains Mono, monospace" }}>
          <Legend dotColor={themeColors.primary} label="CO₂ concentration (ppm)" themeColors={themeColors} />
          <Legend dotColor={themeColors.secondary} label="Cognitive deficit (vs 600 ppm baseline)" themeColors={themeColors} />
        </div>
      ) : (
        <div style={{ display: "flex", gap: 24, marginTop: 12, fontSize: 12, fontFamily: "JetBrains Mono, monospace" }}>
          <Legend dotColor={themeColors.primary} label={correlation.seriesA.label} themeColors={themeColors} />
          <Legend dotColor={themeColors.secondary} label={correlation.seriesB.label} themeColors={themeColors} />
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Chart body: DUAL-LINE
// Two normalized series rendered as lines with soft area fills underneath.
// Best for parallel/co-rising stories (e.g. GLP-1 use × "food noise" lexicon).
// -----------------------------------------------------------------------------
function DualLineChartBody({ correlation, themeColors, progress, highlightedAnnotation, w, h, pad }) {
  const { dataA, dataB, annotations } = correlation;
  const normA = normalize(dataA);
  const normB = normalize(dataB);
  const n = dataA.length;
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const cx = (i) => pad.l + (i / (n - 1)) * innerW;
  const cy = (v) => pad.t + (1 - v) * innerH;
  const baseY = pad.t + innerH;
  const scanX = pad.l + progress * innerW;

  const linePath = (norm) => norm.map((v, i) => `${i === 0 ? "M" : "L"}${cx(i).toFixed(2)},${cy(v).toFixed(2)}`).join(" ");
  const areaPath = (norm) => `${linePath(norm)} L${cx(n - 1).toFixed(2)},${baseY} L${cx(0).toFixed(2)},${baseY} Z`;
  const pathA = linePath(normA);
  const pathB = linePath(normB);
  const areaA = areaPath(normA);
  const areaB = areaPath(normB);

  const clipId = `chart-clip-${correlation.id}`;
  const gradAId = `gradA-${correlation.id}`;
  const gradBId = `gradB-${correlation.id}`;
  const clipW = Math.max(0, progress * innerW);

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect x={pad.l} y={0} width={clipW} height={h} />
        </clipPath>
        <linearGradient id={gradAId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={themeColors.primary} stopOpacity={0.35} />
          <stop offset="100%" stopColor={themeColors.primary} stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id={gradBId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={themeColors.secondary} stopOpacity={0.32} />
          <stop offset="100%" stopColor={themeColors.secondary} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {/* baseline */}
      <line x1={pad.l} x2={w - pad.r} y1={baseY} y2={baseY} stroke={themeColors.surface + "30"} strokeWidth={1} />
      {/* clipped wave layer */}
      <g clipPath={`url(#${clipId})`}>
        <path d={areaA} fill={`url(#${gradAId})`} />
        <path d={areaB} fill={`url(#${gradBId})`} />
        <path d={pathA} fill="none" stroke={themeColors.primary} strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathB} fill="none" stroke={themeColors.secondary} strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* scan line — visible while drawing */}
      {progress < 1 && progress > 0.01 && (
        <line
          x1={scanX}
          x2={scanX}
          y1={pad.t}
          y2={h - pad.b}
          stroke={themeColors.surface}
          strokeWidth={1.5}
          opacity={0.7}
        />
      )}
      <ChartAnnotationsLayer
        annotations={annotations}
        progress={progress}
        highlightedAnnotation={highlightedAnnotation}
        themeColors={themeColors}
        n={n} cx={cx} pad={pad} h={h} w={w}
      />
      <ChartXTicksLayer
        correlation={correlation}
        progress={progress}
        themeColors={themeColors}
        n={n} cx={cx} pad={pad} h={h}
      />
    </>
  );
}

// -----------------------------------------------------------------------------
// Chart body: DELTA-BAR
// Two-sided bars deviating from a center line. Best for inverse correlations
// where the bars naturally point opposite directions (e.g. temp × whisky).
// -----------------------------------------------------------------------------
function DeltaBarChartBody({ correlation, themeColors, progress, highlightedAnnotation, w, h, pad }) {
  const { dataA, dataB, annotations } = correlation;
  const normA = normalize(dataA);
  const normB = normalize(dataB);
  const n = dataA.length;
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const cx = (i) => pad.l + (i / (n - 1)) * innerW;
  const mid = pad.t + innerH / 2;
  const halfH = innerH / 2;
  const barW = (innerW / n) * 0.42;
  const scanX = pad.l + progress * innerW;

  return (
    <>
      {/* center line */}
      <line x1={pad.l} x2={w - pad.r} y1={mid} y2={mid} stroke={themeColors.surface + "40"} strokeWidth={1} />
      {/* bars */}
      {normA.map((v, i) => {
        const dA = v - 0.5;
        const dB = normB[i] - 0.5;
        const yA = mid - dA * 2 * halfH;
        const yB = mid - dB * 2 * halfH;
        const x = cx(i);
        const barFrac = i / (n - 1);
        const fadeWindow = 1 / n;
        const localT = Math.max(0, Math.min(1, (progress - barFrac) / fadeWindow));
        if (localT <= 0) return null;
        return (
          <g key={i} opacity={localT}>
            <rect
              x={x - barW - 1}
              y={Math.min(mid, yA)}
              width={barW}
              height={Math.abs(yA - mid) * localT}
              fill={themeColors.primary}
              rx={2}
            />
            <rect
              x={x + 1}
              y={Math.min(mid, yB)}
              width={barW}
              height={Math.abs(yB - mid) * localT}
              fill={themeColors.secondary}
              rx={2}
            />
          </g>
        );
      })}
      {/* scan line — visible while drawing */}
      {progress < 1 && progress > 0.01 && (
        <g>
          <line
            x1={scanX}
            x2={scanX}
            y1={pad.t}
            y2={h - pad.b}
            stroke={themeColors.surface}
            strokeWidth={1.5}
            opacity={0.7}
          />
          <circle cx={scanX} cy={mid} r={3} fill={themeColors.surface} />
        </g>
      )}
      <ChartAnnotationsLayer
        annotations={annotations}
        progress={progress}
        highlightedAnnotation={highlightedAnnotation}
        themeColors={themeColors}
        n={n} cx={cx} pad={pad} h={h} w={w}
      />
      <ChartXTicksLayer
        correlation={correlation}
        progress={progress}
        themeColors={themeColors}
        n={n} cx={cx} pad={pad} h={h}
      />
    </>
  );
}

// -----------------------------------------------------------------------------
// Chart body: YEARLY-BARS
// Paired vertical bars per year, with explicit "no data" treatment for gaps
// (e.g. 2020 ATUS pause). Best for annual cadence stories where each year
// is a discrete event rather than a point on a continuous trend.
// -----------------------------------------------------------------------------
function YearlyBarsChartBody({ correlation, themeColors, progress, highlightedAnnotation, w, h, pad }) {
  const { dataA, dataB, weekLabels, annotations } = correlation;
  const n = dataA.length;
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  // Use the actual maxes (with a small headroom) — keeps absolute hours legible.
  const validA = dataA.filter((v) => v != null);
  const validB = dataB.filter((v) => v != null);
  const maxVal = Math.max(...validA, ...validB) * 1.1;

  const slotW = innerW / n;
  const barW = Math.min(22, slotW * 0.32);
  const gap = 4;
  const cx = (i) => pad.l + slotW * (i + 0.5);
  const baseY = pad.t + innerH;
  const barH = (v) => (v / maxVal) * innerH;
  const scanX = pad.l + progress * innerW;

  return (
    <>
      {/* baseline */}
      <line x1={pad.l} x2={w - pad.r} y1={baseY} y2={baseY} stroke={themeColors.surface + "40"} strokeWidth={1} />

      {/* horizontal gridlines (every 0.2 hrs ≈ 12 min) */}
      {[0.2, 0.4, 0.6, 0.8].map((tick) => {
        if (tick > maxVal) return null;
        const y = baseY - (tick / maxVal) * innerH;
        return (
          <g key={tick}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke={themeColors.surface + "12"} strokeWidth={1} strokeDasharray="2 4" />
            <text x={pad.l - 8} y={y + 3} textAnchor="end" fontSize={9} fontFamily="JetBrains Mono, monospace" fill={themeColors.surface + "60"}>
              {tick.toFixed(1)}h
            </text>
          </g>
        );
      })}

      {/* paired bars per year */}
      {dataA.map((vA, i) => {
        const vB = dataB[i];
        const x = cx(i);
        // Stagger so each bar starts shortly after the previous, and the LAST
        // bar's window finishes exactly at progress=1. Map i∈[0,n-1] → [0, 1-fadeWindow].
        const fadeWindow = 0.22;
        const barFrac = (i / Math.max(1, n - 1)) * (1 - fadeWindow);
        const localT = Math.max(0, Math.min(1, (progress - barFrac) / fadeWindow));
        if (localT <= 0) return null;

        // 2020-style gap: render a dashed empty slot with a "no data" label
        if (vA == null || vB == null) {
          return (
            <g key={i} opacity={localT}>
              <rect
                x={x - barW - gap / 2}
                y={pad.t + innerH * 0.35}
                width={barW * 2 + gap}
                height={innerH * 0.5}
                fill="none"
                stroke={themeColors.surface + "30"}
                strokeWidth={1}
                strokeDasharray="3 3"
                rx={3}
              />
              <text
                x={x}
                y={pad.t + innerH * 0.55}
                textAnchor="middle"
                fontSize={8}
                fontFamily="JetBrains Mono, monospace"
                fill={themeColors.surface + "70"}
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                transform={`rotate(-90, ${x}, ${pad.t + innerH * 0.55})`}
              >
                NO DATA · COVID
              </text>
            </g>
          );
        }

        const hA = barH(vA) * localT;
        const hB = barH(vB) * localT;
        return (
          <g key={i} opacity={localT}>
            <rect
              x={x - barW - gap / 2}
              y={baseY - hA}
              width={barW}
              height={hA}
              fill={themeColors.primary}
              rx={2}
            />
            <rect
              x={x + gap / 2}
              y={baseY - hB}
              width={barW}
              height={hB}
              fill={themeColors.secondary}
              rx={2}
            />
            {/* Value labels on top of each bar — only once fully drawn */}
            {localT > 0.85 && (
              <>
                <text
                  x={x - barW / 2 - gap / 2}
                  y={baseY - hA - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="JetBrains Mono, monospace"
                  fill={themeColors.surface + "90"}
                  fontWeight={600}
                >
                  {vA.toFixed(2)}
                </text>
                <text
                  x={x + barW / 2 + gap / 2}
                  y={baseY - hB - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="JetBrains Mono, monospace"
                  fill={themeColors.surface + "90"}
                  fontWeight={600}
                >
                  {vB.toFixed(2)}
                </text>
              </>
            )}
            {/* Year label below */}
            <text
              x={x}
              y={baseY + 18}
              textAnchor="middle"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              fill={themeColors.surface + "90"}
              fontWeight={600}
            >
              {weekLabels ? weekLabels[i] : i}
            </text>
          </g>
        );
      })}

      {/* scan line — visible while drawing */}
      {progress < 1 && progress > 0.01 && (
        <line
          x1={scanX}
          x2={scanX}
          y1={pad.t}
          y2={h - pad.b}
          stroke={themeColors.surface}
          strokeWidth={1.5}
          opacity={0.7}
        />
      )}

      <ChartAnnotationsLayer
        annotations={annotations}
        progress={progress}
        highlightedAnnotation={highlightedAnnotation}
        themeColors={themeColors}
        n={n} cx={cx} pad={pad} h={h} w={w}
      />
    </>
  );
}

// -----------------------------------------------------------------------------
// Shared overlay: annotations (vertical guide + circle + callout)
// -----------------------------------------------------------------------------
function ChartAnnotationsLayer({ annotations, progress, highlightedAnnotation, themeColors, n, cx, pad, h, w }) {
  return (
    <>
      {annotations.map((a, i) => {
        const annFrac = a.idx / (n - 1);
        const visible = progress >= annFrac;
        if (!visible) return null;
        const fadeT = progress >= 1 ? 1 : Math.min(1, (progress - annFrac) * 6);
        const isHighlighted = highlightedAnnotation === i;
        return (
          <g key={i} opacity={fadeT}>
            <line
              x1={cx(a.idx)}
              x2={cx(a.idx)}
              y1={pad.t}
              y2={h - pad.b}
              stroke={isHighlighted ? themeColors.primary : themeColors.surface + "60"}
              strokeWidth={isHighlighted ? 1.5 : 1}
              strokeDasharray={isHighlighted ? "0" : "3 3"}
              style={{ transition: "stroke 200ms ease, stroke-width 200ms ease" }}
            />
            <g transform={`translate(${cx(a.idx)}, ${pad.t - 8})`}>
              {isHighlighted && (
                <circle r={11} fill={themeColors.primary} opacity={0.25}>
                  <animate attributeName="r" values="9;14;9" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0.05;0.35" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              {isHighlighted && (
                <circle r={9} fill={themeColors.surface} />
              )}
              <circle
                r={isHighlighted ? 7 : 5}
                fill={themeColors.primary}
                stroke={isHighlighted ? themeColors.surface : "none"}
                strokeWidth={isHighlighted ? 2 : 0}
                style={{ transition: "r 200ms ease" }}
              />
            </g>
            {isHighlighted && (
              <g transform={`translate(${cx(a.idx)}, ${pad.t - 26})`}>
                <AnnotationCallout label={a.label} themeColors={themeColors} chartWidth={w} cxValue={cx(a.idx)} />
              </g>
            )}
          </g>
        );
      })}
    </>
  );
}

// -----------------------------------------------------------------------------
// Shared overlay: x-axis ticks (auto-stepped by series length)
// -----------------------------------------------------------------------------
function ChartXTicksLayer({ correlation, progress, themeColors, n, cx, pad, h }) {
  const labels = correlation.weekLabels;
  const step = labels && labels.length > 60 ? 12 : labels && labels.length > 30 ? 8 : 4;
  return (
    <>
      {correlation.dataA.map((_, i) => {
        if (i % step !== 0) return null;
        const tickFrac = i / (n - 1);
        if (progress < tickFrac) return null;
        const fadeT = Math.min(1, (progress - tickFrac) * 6);
        const lbl = labels ? labels[i] : monthLabel(i);
        return (
          <text
            key={i}
            x={cx(i)}
            y={h - pad.b + 20}
            textAnchor="middle"
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
            fill={themeColors.surface + "80"}
            opacity={fadeT}
          >
            {lbl}
          </text>
        );
      })}
    </>
  );
}

function Legend({ dotColor, label, themeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: dotColor }} />
      <span style={{ opacity: 0.85 }}>{label}</span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Chart body: CO2-SLIDER (mirrored-bars dose-response)
// X-axis is CO₂ ppm (controlled, not time). The chart is split by a centered
// baseline:
//   ABOVE  → orange bars rising as ppm climbs (the room filling with CO₂)
//   BELOW  → blue bars dropping as composite cognitive score falls
// Together the two halves form a widening "scissor" that visualizes the core
// story at a glance: as one goes up, the other goes down. The slider drives a
// glow column + paired floating readouts; the bars themselves are static across
// scrubs so the user can see where they are on the full curve.
// -----------------------------------------------------------------------------
function CO2SliderChartBody({ correlation, themeColors, progress, highlightedPpm, w, h, pad }) {
  const scenarios = correlation.anchorScenarios || [];  const { dataA: ppmAxis, dataB: scores } = correlation;
  const minPpm = ppmAxis[0];
  const maxPpm = ppmAxis[ppmAxis.length - 1];

  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  // We split the inner area in two — top half for CO₂, bottom half for score.
  // Leave a small gutter around the centerline so the two halves don't kiss.
  const gutter = 6;
  const halfH = (innerH - gutter * 2) / 2;
  const cy = pad.t + innerH / 2; // visual centerline
  const topBaseline = cy - gutter; // where orange bars start (growing up)
  const botBaseline = cy + gutter; // where blue bars start (growing down)

  const xForPpm = (p) => pad.l + ((p - minPpm) / (maxPpm - minPpm)) * innerW;

  // Same interpolation as before — drives the live readouts.
  const scoreAtPpm = (p) => {
    if (p <= ppmAxis[0]) return scores[0];
    if (p >= ppmAxis[ppmAxis.length - 1]) return scores[scores.length - 1];
    for (let i = 0; i < ppmAxis.length - 1; i++) {
      const a = ppmAxis[i];
      const b = ppmAxis[i + 1];
      if (p >= a && p <= b) {
        const t = (p - a) / (b - a);
        return scores[i] + t * (scores[i + 1] - scores[i]);
      }
    }
    return scores[scores.length - 1];
  };

  // Bar geometry: 22 ppm steps (400→2500 by 100). Width = full step minus a
  // small gap so bars feel like a column, not a continuous wash.
  const stepW = innerW / (ppmAxis.length - 1);
  const barW = Math.max(6, stepW * 0.62);

  // Normalize CO₂: 400 ppm = 0, 2500 ppm = 1. (Use the dataset bounds so the
  // top bar at 2500 reaches all the way up.)
  const co2Norm = (p) => (p - minPpm) / (maxPpm - minPpm);
  // Cognitive deficit: 0 at score 100 (or above), grows as score falls toward
  // 40. We clamp at the same normalized scale as CO₂ so the "scissor" is
  // visually proportional. Max deficit = 100 - 40 = 60 score points.
  const deficitNorm = (score) => Math.max(0, Math.min(1, (100 - score) / 60));

  // Reveal animation: bars unfurl left→right with the same progress curve as
  // the other charts (1.9s default). Each bar fades in as `progress` crosses
  // its x position.
  const revealAt = (i) => {
    const t = i / (ppmAxis.length - 1);
    return Math.max(0, Math.min(1, (progress - t * 0.9) * 8));
  };

  // Highlight state — null means no scenario is selected, so we just show the
  // bars without the floating readout column.
  const hasHighlight = highlightedPpm != null;
  const currentScore = hasHighlight ? scoreAtPpm(highlightedPpm) : 0;
  const currentX = hasHighlight ? xForPpm(highlightedPpm) : 0;
  const dropPct = hasHighlight ? Math.round(100 - currentScore) : 0;

  // X-axis ticks anchored at meaningful CO₂ landmarks
  const xTicks = [
    { ppm: 420, label: "420\noutdoor" },
    { ppm: 1000, label: "1000\nASHRAE" },
    { ppm: 1500, label: "1500" },
    { ppm: 2000, label: "2000" },
    { ppm: 2500, label: "2500" },
  ];

  return (
    <>
      {/* axis labels for each half */}
      <text
        x={4}
        y={pad.t + 12}
        textAnchor="start"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        fill={themeColors.primary}
        fontWeight={700}
        letterSpacing={1}
      >
        CO₂ ↑
      </text>
      <text
        x={4}
        y={pad.t + innerH - 4}
        textAnchor="start"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        fill={themeColors.secondary}
        fontWeight={700}
        letterSpacing={1}
      >
        SCORE ↓
      </text>

      {/* centerline + ppm tick labels straddling it */}
      <line
        x1={pad.l}
        x2={w - pad.r}
        y1={cy}
        y2={cy}
        stroke={themeColors.surface + "30"}
        strokeWidth={1}
      />
      {xTicks.map((t) => (
        <g key={t.ppm}>
          {t.label.split("\n").map((line, li) => (
            <text
              key={li}
              x={xForPpm(t.ppm)}
              y={cy + 4 + li * 11}
              textAnchor="middle"
              fontSize={li === 0 ? 9 : 8}
              fontFamily="JetBrains Mono, monospace"
              fill={themeColors.surface + (li === 0 ? "70" : "50")}
              fontWeight={li === 0 ? 600 : 400}
              letterSpacing={li === 0 ? 0.3 : 0.5}
              dominantBaseline="hanging"
            >
              {line}
            </text>
          ))}
        </g>
      ))}

      {/* gradients */}
      <defs>
        <linearGradient id="co2-up-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={themeColors.primary} stopOpacity="0.35" />
          <stop offset="100%" stopColor={themeColors.primary} stopOpacity="1" />
        </linearGradient>
        <linearGradient id="co2-down-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={themeColors.secondary} stopOpacity="0.35" />
          <stop offset="100%" stopColor={themeColors.secondary} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* mirrored bars */}
      {ppmAxis.map((p, i) => {
        const x = xForPpm(p) - barW / 2;
        const upH = co2Norm(p) * halfH;
        const downH = deficitNorm(scores[i]) * halfH;
        const fade = revealAt(i);
        // Highlight the bar nearest the active scenario, if any.
        const isCurrent = hasHighlight && Math.abs(xForPpm(p) - currentX) < stepW / 2;
        return (
          <g key={p} opacity={fade}>
            {/* CO₂ bar (up) */}
            <rect
              x={x}
              y={topBaseline - upH}
              width={barW}
              height={Math.max(0.5, upH)}
              rx={2}
              fill="url(#co2-up-grad)"
              opacity={isCurrent ? 1 : 0.85}
            />
            {/* score bar (down) */}
            <rect
              x={x}
              y={botBaseline}
              width={barW}
              height={Math.max(0.5, downH)}
              rx={2}
              fill="url(#co2-down-grad)"
              opacity={isCurrent ? 1 : 0.85}
            />
          </g>
        );
      })}

      {/* slider position glow column — only when a scenario is highlighted AND the entrance animation has cleared the local bars */}      {hasHighlight && progress * 0.9 + 0.05 >= co2Norm(highlightedPpm) * 0.9 && (
        <g>
          <rect
            x={currentX - barW / 2 - 4}
            y={pad.t}
            width={barW + 8}
            height={innerH}
            rx={4}
            fill={themeColors.surface}
            fillOpacity={0.05}
          />
          <line
            x1={currentX}
            x2={currentX}
            y1={pad.t}
            y2={pad.t + innerH}
            stroke={themeColors.surface + "70"}
            strokeWidth={1}
            strokeDasharray="2,3"
          />

          {/* CO₂ readout at top */}
          <g transform={`translate(${Math.max(pad.l + 60, Math.min(w - pad.r - 60, currentX))}, ${pad.t + 22})`}>
            <rect x={-58} y={-16} width={116} height={26} rx={6} fill={themeColors.primary} />
            <text
              x={0}
              y={2}
              textAnchor="middle"
              fontSize={12}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
              fill={themeColors.text}
            >
              {Math.round(highlightedPpm).toLocaleString()}
              <tspan fontSize={10} fontWeight={400} opacity={0.7}>{` ppm`}</tspan>
            </text>
          </g>
          {/* score readout at bottom */}
          <g transform={`translate(${Math.max(pad.l + 60, Math.min(w - pad.r - 60, currentX))}, ${pad.t + innerH - 12})`}>
            <rect x={-58} y={-12} width={116} height={26} rx={6} fill={themeColors.secondary} />
            <text
              x={0}
              y={6}
              textAnchor="middle"
              fontSize={12}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
              fill={themeColors.surface}
            >
              −{dropPct}%
              <tspan fontSize={10} fontWeight={400} opacity={0.85}>{`  cognition`}</tspan>
            </text>
          </g>
        </g>
      )}

      {/* Scenario markers — small dots on the centerline at each anchor ppm.
          Hint that the chart is interactive without obscuring the bars. They
          fade in only after the entrance animation has reached their x. */}
      {scenarios.map((s, i) => {
        const sx = xForPpm(s.ppm);
        const reveal = Math.max(0, Math.min(1, (progress - co2Norm(s.ppm) * 0.9) * 6));
        const isActive = highlightedPpm != null && Math.abs(highlightedPpm - s.ppm) < 50;
        return (
          <g key={`scn-${i}`} opacity={reveal}>
            {isActive && (
              <circle cx={sx} cy={cy} r={9} fill={themeColors.surface} opacity={0.18}>
                <animate attributeName="r" values="7;12;7" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.28;0.05;0.28" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={sx}
              cy={cy}
              r={isActive ? 5 : 3.5}
              fill={themeColors.surface}
              stroke={themeColors.text}
              strokeWidth={1}
              style={{ transition: "r 200ms ease" }}
            />
          </g>
        );
      })}
    </>
  );
}

// Slider + live readout that lives below the SVG. Drives the same `ppm` state
// the chart body reads from, so motion is fully linked.
// (Unused — the CO₂ chart now uses the same progress-driven entrance animation
// as the other charts. Kept here previously, removed in favor of scenario-tap
// highlighting via the AnchorScenariosCard.)

function RPanel({ correlation, themeColors }) {
  const r = correlation.r;
  const strength = Math.abs(r);
  const label =
    strength >= 0.9 ? "very strong" :
    strength >= 0.7 ? "strong" :
    strength >= 0.5 ? "substantial" :
    strength >= 0.3 ? "moderate" :
    "weak";
  const sigDots = Math.min(5, Math.round(strength * 5));
  // Number counts up in lockstep with the chart fill (same duration, no delay).
  const numberProgress = useChartProgress(`r:${correlation.id}`, 1900);
  const animatedR = r * numberProgress;
  // Meter fills band-by-band in lockstep with the chart and number.
  const meterProgress = useChartProgress(`meter:${correlation.id}`, 1900);
  const filledBands = Math.floor(meterProgress * sigDots + 0.0001);
  // Which band the moving notch is currently over (0..sigDots-1)
  const notchIndex = meterProgress >= 1
    ? sigDots - 1
    : Math.min(sigDots - 1, Math.floor(meterProgress * sigDots));
  // Only show the active label after the meter settles, so words don't flash mid-fill
  const showLabel = meterProgress >= 1;

  // Subtle audio cue: a short rising "tick" each time the meter fills another band.
  // Synthesized with Web Audio (no asset). Gated behind a one-time user gesture
  // because browsers block autoplay audio until the user interacts with the page.
  const audioCtxRef = React.useRef(null);
  const prevStepRef = React.useRef(0);
  React.useEffect(() => {
    const arm = () => {
      if (!audioCtxRef.current) {
        try {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { /* unsupported */ }
      }
    };
    window.addEventListener("pointerdown", arm, { once: true });
    window.addEventListener("keydown", arm, { once: true });
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, []);
  // Reset the note tracker whenever the correlation (and its animation) restarts.
  React.useEffect(() => { prevStepRef.current = 0; }, [correlation.id]);
  React.useEffect(() => {
    const ctx = audioCtxRef.current;
    // Always play the full ascending do-re-mi-fa-so as the meter animates,
    // independent of how many strength bands a given correlation fills — so
    // every card plays the same complete five-note run.
    const step = Math.min(5, Math.floor(meterProgress * 5 + 0.0001));
    if (!ctx) { prevStepRef.current = step; return; }
    if (step > prevStepRef.current && step > 0) {
      const scale = [261.63, 293.66, 329.63, 349.23, 392.0]; // do re mi fa so (C4 D4 E4 F4 G4)
      const freq = scale[Math.min(scale.length - 1, step - 1)];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.08, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    }
    prevStepRef.current = step;
  }, [meterProgress]);

  return (
    <div
      style={{
        background: themeColors.primary,
        color: themeColors.text,
        borderRadius: 24,
        padding: 32,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            opacity: 0.65,
          }}
        >
          Pearson correlation
        </div>
        <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, fontFeatureSettings: "'tnum'", letterSpacing: -3 }}>
          {animatedR > 0 ? "+" : animatedR < 0 ? "" : ""}
          {animatedR.toFixed(2)}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 12,
            padding: "4px 10px",
            borderRadius: 999,
            background: themeColors.text,
            color: themeColors.primary,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontWeight: 700,
            opacity: showLabel ? 1 : 0,
            transform: showLabel ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 280ms ease-out, transform 280ms ease-out",
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: themeColors.primary }} />
          {label}
        </div>
      </div>
      <div>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            opacity: 0.6,
            marginBottom: 10,
          }}
        >
          strength meter
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 6,
            marginBottom: 10,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => {
            // For the active band, fill partial width based on the actual
            // correlation strength within that band's 0.2-wide window.
            // e.g. r=0.97 → "very strong" band fills 85% (since 0.97 sits
            // 85% of the way from 0.8 → 1.0).
            const bandLow = i * 0.2;
            const isActiveBand = i === sigDots - 1 && meterProgress >= 1;
            const intraBandFill = Math.max(0, Math.min(1, (strength - bandLow) / 0.2));
            const isFullyFilled = i < filledBands && !isActiveBand;
            return (
            <div
              key={i}
              style={{
                height: 10,
                borderRadius: 3,
                background: isFullyFilled ? themeColors.text : themeColors.text + "1a",
                position: "relative",
                overflow: "hidden",
                transition: "background 180ms ease-out",
              }}
            >
              {isActiveBand && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${intraBandFill * 100}%`,
                    background: themeColors.text,
                    borderRadius: 3,
                    transition: "width 280ms ease-out",
                  }}
                />
              )}
              {meterProgress > 0 && i === notchIndex && (
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 4,
                    height: 18,
                    background: themeColors.text,
                    borderRadius: 2,
                  }}
                />
              )}
            </div>
            );
          })}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 6,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {["weak", "moderate", "substantial", "strong", "very strong"].map((bandLabel, i) => {
            const isActive = i === sigDots - 1;
            return (
              <div
                key={bandLabel}
                style={{
                  textAlign: "center",
                  opacity: isActive && showLabel ? 1 : 0,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  // keep the label centered under its segment, but allow it to
                  // overflow into adjacent columns when the word is long
                  position: "relative",
                  pointerEvents: "none",
                  transition: "opacity 240ms ease-out",
                }}
              >
                {bandLabel}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WhyCard({ correlation, themeColors }) {
  const text = typeof correlation.why === "string" ? correlation.why : (correlation.why.serious || correlation.why.playful || "");
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${themeColors.text}15`,
        borderRadius: 24,
        padding: 32,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 13,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: themeColors.text,
          fontWeight: 700,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ width: 6, height: 6, background: themeColors.primary, borderRadius: 2 }} />
        The takeaway
      </div>
      <p style={{ fontSize: 19, lineHeight: 1.55, margin: 0, fontWeight: 400, color: themeColors.text + "e0", textWrap: "pretty" }}>{text}</p>
    </div>
  );
}

function SoWhatCard({ correlation, themeColors }) {
  return (
    <div
      style={{
        background: themeColors.secondary,
        color: "#fff",
        borderRadius: 24,
        padding: 32,
        height: "100%",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 13,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          fontWeight: 700,
          opacity: 1,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ width: 6, height: 6, background: themeColors.primary, borderRadius: 2 }} />
        For brands
      </div>
      <p style={{ fontSize: 19, lineHeight: 1.55, margin: 0, fontWeight: 400, color: "#ffffffe0", textWrap: "pretty" }}>{correlation.soWhat}</p>
    </div>
  );
}

function AnnotationCallout({ label, themeColors, chartWidth, cxValue }) {
  // Estimate width to keep the pill inside the chart area; flip anchor if near edges.
  const charW = 6.2;
  const padX = 10;
  const textW = Math.min(label.length * charW, 220);
  const pillW = textW + padX * 2;
  // Default centered, but clamp so the pill stays inside the SVG viewBox.
  let anchorX = -pillW / 2;
  const leftEdge = cxValue + anchorX;
  const rightEdge = leftEdge + pillW;
  if (leftEdge < 8) anchorX = 8 - cxValue;
  else if (rightEdge > chartWidth - 8) anchorX = (chartWidth - 8) - cxValue - pillW;
  return (
    <g>
      <rect
        x={anchorX}
        y={-22}
        width={pillW}
        height={22}
        rx={11}
        ry={11}
        fill={themeColors.text}
      />
      <text
        x={anchorX + pillW / 2}
        y={-7}
        textAnchor="middle"
        fontSize={11}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={600}
        fill={themeColors.surface}
        style={{ letterSpacing: 0.3 }}
      >
        {label.length > 36 ? label.slice(0, 35) + "…" : label}
      </text>
    </g>
  );
}

// Distinct one-shot tone for event clicks — a soft fixed-pitch bell, the same
// every time (intentionally different from the meter's ascending scale). The
// click itself is the user gesture, so we can lazily spin up a shared context.
let _eventAudioCtx = null;
function playEventTone() {
  try {
    if (!_eventAudioCtx) _eventAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) { return; }
  const ctx = _eventAudioCtx;
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const t = ctx.currentTime;
  // Clean, bright "ping": a single high sine with a fast attack and a long,
  // shimmering exponential tail.
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1318.5, t); // E6
  const gn = gain.gain;
  gn.setValueAtTime(0.0001, t);
  gn.exponentialRampToValueAtTime(0.14, t + 0.004);
  gn.exponentialRampToValueAtTime(0.0001, t + 0.6);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.62);
}

function AnnotationsCard({ correlation, themeColors, highlightedAnnotation, onHighlight }) {
  const scrollRef = React.useRef(null);
  const rowRefs = React.useRef([]);
  const annotations = correlation.annotations;

  const handleClick = (i) => {
    playEventTone();
    onHighlight(highlightedAnnotation === i ? null : i);
    // Hint that there's more below: when a row is clicked, scroll the next row
    // into view if it's currently hidden under the fold. Uses the container's
    // own scrollTop — never scrollIntoView.
    const container = scrollRef.current;
    const nextRow = rowRefs.current[i + 1];
    if (container && nextRow && i >= 1 && i < annotations.length - 1) {
      const targetTop = nextRow.offsetTop - container.clientHeight + nextRow.offsetHeight + 8;
      if (targetTop > container.scrollTop) {
        container.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${themeColors.text}15`,
        borderRadius: 24,
        padding: 32,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 13,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: themeColors.text,
          fontWeight: 700,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ width: 6, height: 6, background: themeColors.primary, borderRadius: 2 }} />
        Events
      </div>
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 12,
          color: themeColors.text + "90",
          lineHeight: 1.5,
          marginBottom: 16,
          marginTop: -8,
        }}
      >
        Tap an event to highlight it on the chart.
      </div>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          maxHeight: 240,
          overflowY: "auto",
          marginRight: -8,
          paddingRight: 4,
          scrollbarWidth: "thin",
          scrollbarColor: `${themeColors.text}30 transparent`,
        }}
        className="events-scroll"
      >
        {annotations.map((a, i) => (
          <AnnotationRow
            key={i}
            ref={(el) => (rowRefs.current[i] = el)}
            annotation={a}
            isLast={i === annotations.length - 1}
            isActive={highlightedAnnotation === i}
            onClick={() => handleClick(i)}
            themeColors={themeColors}
            weekLabels={correlation.weekLabels}
          />
        ))}
      </div>
      <style>{`
        .events-scroll::-webkit-scrollbar { width: 6px; }
        .events-scroll::-webkit-scrollbar-track { background: transparent; }
        .events-scroll::-webkit-scrollbar-thumb { background: ${themeColors.text}25; border-radius: 999px; }
        .events-scroll::-webkit-scrollbar-thumb:hover { background: ${themeColors.text}45; }
      `}</style>
    </div>
  );
}

// -----------------------------------------------------------------------------
// AnchorScenariosCard
// Replaces AnnotationsCard for interactive scrub charts (currently CO₂). Each
// scenario is a real-world ppm value with a plain-language label; clicking it
// snaps the chart's slider there. Selected state derives from `ppm` proximity
// rather than a click index — so dragging the slider also reflects in the
// card without needing a second source of truth.
// -----------------------------------------------------------------------------
function AnchorScenariosCard({ correlation, themeColors, highlightedPpm, onHighlight }) {
  const ppm = highlightedPpm;
  const scrollRef = React.useRef(null);
  const rowRefs = React.useRef([]);
  // Same interpolation as the chart body — keep them in lockstep.
  const ppmAxis = correlation.dataA;
  const scores = correlation.dataB;
  const scoreAtPpm = (p) => {
    if (p <= ppmAxis[0]) return scores[0];
    if (p >= ppmAxis[ppmAxis.length - 1]) return scores[scores.length - 1];
    for (let i = 0; i < ppmAxis.length - 1; i++) {
      const a = ppmAxis[i];
      const b = ppmAxis[i + 1];
      if (p >= a && p <= b) {
        const t = (p - a) / (b - a);
        return scores[i] + t * (scores[i + 1] - scores[i]);
      }
    }
    return scores[scores.length - 1];
  };

  // Find the scenario closest to the current highlighted ppm. If nothing is
  // highlighted (null), no scenario is active.
  const scenarios = correlation.anchorScenarios;
  let activeIdx = -1;
  if (ppm != null) {
    let bestDist = Infinity;
    scenarios.forEach((s, i) => {
      const d = Math.abs(s.ppm - ppm);
      if (d < bestDist) {
        bestDist = d;
        activeIdx = i;
      }
    });
    // Only consider it "active" if we're reasonably close (within 75 ppm).
    if (bestDist > 75) activeIdx = -1;
  }

  const handleClick = (i, ppmVal) => {
    playEventTone();
    onHighlight(ppmVal);
    // If user clicks a row past the first couple, scroll the *next* row into
    // view so they get a hint there's more below. Uses the container's own
    // scrollTop — never scrollIntoView.
    const container = scrollRef.current;
    const nextRow = rowRefs.current[i + 1];
    if (container && nextRow && i >= 2 && i < scenarios.length - 1) {
      const targetTop = nextRow.offsetTop - container.clientHeight + nextRow.offsetHeight + 8;
      if (targetTop > container.scrollTop) {
        container.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${themeColors.text}15`,
        borderRadius: 24,
        padding: 32,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 13,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: themeColors.text,
          fontWeight: 700,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ width: 6, height: 6, background: themeColors.primary, borderRadius: 2 }} />
        <span style={{ whiteSpace: "nowrap" }}>Common CO₂ levels</span>
      </div>
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 12,
          color: themeColors.text + "90",
          lineHeight: 1.5,
          marginBottom: 16,
          marginTop: -8,
        }}
      >
        Tap a location to highlight it on the chart.
      </div>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          maxHeight: 165,
          overflowY: "auto",
          marginRight: -8,
          paddingRight: 4,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          scrollbarWidth: "thin",
          scrollbarColor: `${themeColors.text}30 transparent`,
        }}
        className="events-scroll"
      >
        {scenarios.map((s, i) => (
          <ScenarioRow
            key={i}
            ref={(el) => (rowRefs.current[i] = el)}
            scenario={s}
            score={scoreAtPpm(s.ppm)}
            isActive={i === activeIdx}
            onClick={() => handleClick(i, s.ppm)}
            themeColors={themeColors}
          />
        ))}
      </div>
      <style>{`
        .events-scroll::-webkit-scrollbar { width: 6px; }
        .events-scroll::-webkit-scrollbar-track { background: transparent; }
        .events-scroll::-webkit-scrollbar-thumb { background: ${themeColors.text}25; border-radius: 999px; }
        .events-scroll::-webkit-scrollbar-thumb:hover { background: ${themeColors.text}45; }
      `}</style>
    </div>
  );
}

const ScenarioRow = React.forwardRef(function ScenarioRow({ scenario, score, isActive, onClick, themeColors }, ref) {
  const [hover, setHover] = React.useState(false);
  const drop = Math.round(100 - score);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-pressed={isActive}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        background: isActive ? themeColors.primary + "22" : hover ? themeColors.text + "06" : "transparent",
        border: `1px solid ${isActive ? themeColors.primary + "55" : themeColors.text + "12"}`,
        font: "inherit",
        cursor: "pointer",
        padding: "8px 12px",
        borderRadius: 10,
        position: "relative",
        transition: "background 160ms ease, border-color 160ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          marginBottom: 2,
        }}
      >
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 13,
            fontWeight: 700,
            color: themeColors.text,
            letterSpacing: -0.2,
          }}
        >
          <span
            style={{
              padding: "2px 7px",
              borderRadius: 6,
              background: isActive ? themeColors.text : themeColors.primary,
              color: isActive ? themeColors.surface : themeColors.text,
              transition: "background 160ms ease, color 160ms ease",
              marginRight: 6,
            }}
          >
            {scenario.ppm.toLocaleString()}
          </span>
          <span style={{ opacity: 0.6, fontWeight: 500 }}>ppm</span>
        </span>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            fontWeight: 700,
            color: drop >= 8 ? themeColors.primary : themeColors.text + "70",
          }}
        >
          {drop >= 1 ? `−${drop}%` : "baseline"}
        </span>
      </div>
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 12,
          color: themeColors.text + "B0",
          lineHeight: 1.35,
        }}
      >
        {scenario.label}
      </div>
    </button>
  );
});

const AnnotationRow = React.forwardRef(function AnnotationRow({ annotation, isLast, isActive, onClick, themeColors, weekLabels }, ref) {
  const [hover, setHover] = React.useState(false);
  const dateLabel = resolveDateLabel(weekLabels, annotation.idx);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-pressed={isActive}
      aria-label={`Highlight event: ${annotation.label}`}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        background: isActive ? themeColors.primary + "22" : hover ? themeColors.text + "06" : "transparent",
        border: "none",
        font: "inherit",
        cursor: "pointer",
        padding: "10px 12px",
        marginBottom: 8,
        marginLeft: -12,
        marginRight: -12,
        marginTop: -2,
        borderRadius: 10,
        position: "relative",
        transition: "background 160ms ease",
      }}
    >
      {isActive && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 10,
            bottom: 10,
            width: 3,
            background: themeColors.primary,
            borderRadius: 2,
          }}
        />
      )}
      <div
        style={{
          display: "inline-block",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          color: themeColors.text,
          fontWeight: 700,
          letterSpacing: 0.5,
          marginBottom: 8,
          padding: "3px 8px",
          borderRadius: 6,
          background: isActive ? themeColors.text : themeColors.primary,
          color: isActive ? themeColors.surface : themeColors.text,
          transition: "background 160ms ease, color 160ms ease",
        }}
      >
        {dateLabel}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35, color: themeColors.text }}>
        {annotation.label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 10,
          fontFamily: "JetBrains Mono, monospace",
          letterSpacing: 1,
          textTransform: "uppercase",
          color: themeColors.text,
          opacity: isActive ? 0.7 : hover ? 0.45 : 0,
          transition: "opacity 160ms ease",
        }}
      >
        {isActive ? "highlighted on chart ↑" : "click to highlight ↑"}
      </div>
      <div
        style={{
          borderBottom: !isLast ? `1px dashed ${themeColors.text}20` : "none",
          marginTop: 12,
          marginLeft: 12,
          marginRight: 12,
        }}
      />
    </button>
  );
});

function ShareButton({ correlation, themeColors }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const wrapperRef = React.useRef(null);
  const permalink = (() => {
    if (typeof window === "undefined") return `https://curious-correlations.com/?c=${correlation.id}`;
    return `${window.location.origin}${window.location.pathname}?c=${correlation.id}`;
  })();
  const shareText = `${correlation.title} — curious-correlations.com`;

  // Close popover on outside click or Escape.
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Hover-open with a small close delay so moving from button → popover doesn't flicker it shut.
  const closeTimer = React.useRef(null);
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };
  React.useEffect(() => () => cancelClose(), []);

  const handleClick = () => {
    // Click still toggles — useful for touch / keyboard users.
    setOpen((v) => !v);
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(permalink);
    } catch (e) {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(permalink)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Useful correlation: ${correlation.title}`)}&body=${encodeURIComponent(`${shareText}\n\n${permalink}`)}`;

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
      style={{ position: "relative", flexShrink: 0 }}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Share this correlation"
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: themeColors.primary,
          color: themeColors.text,
          border: "none",
          borderRadius: 999,
          padding: "8px 16px",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          transition: "transform 160ms ease, box-shadow 160ms ease",
          transform: hover || open ? "translateY(-1px)" : "translateY(0)",
          boxShadow: hover || open ? "0 6px 18px rgba(0,0,0,0.18)" : "0 0 0 rgba(0,0,0,0)",
          whiteSpace: "nowrap",
        }}
      >
        <ShareGlyph color={themeColors.text} />
        Share
      </button>

      {open && (
        <SharePopover
          themeColors={themeColors}
          linkedInUrl={linkedInUrl}
          mailtoUrl={mailtoUrl}
          permalink={permalink}
          copied={copied}
          onCopy={handleCopy}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function SharePopover({ themeColors, linkedInUrl, mailtoUrl, permalink, copied, onCopy, onClose }) {
  return (
    <div
      role="menu"
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        right: 0,
        zIndex: 30,
        minWidth: 220,
        background: "#fff",
        color: themeColors.text,
        borderRadius: 16,
        boxShadow: "0 16px 40px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.06)",
        padding: 8,
        border: `1px solid ${themeColors.text}10`,
        animation: "scShareIn 160ms ease-out",
      }}
    >
      <style>{`@keyframes scShareIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <ShareOption
        themeColors={themeColors}
        onClick={(e) => {
          if (e) e.preventDefault();
          try {
            (window.top || window).open(linkedInUrl, "_blank", "noopener,noreferrer");
          } catch (_) {
            window.open(linkedInUrl, "_blank", "noopener,noreferrer");
          }
          onClose && onClose();
        }}
        icon={<LinkedInGlyph />}
        label="Share on LinkedIn"
      />
      <ShareOption
        themeColors={themeColors}
        onClick={onCopy}
        icon={copied ? <CheckGlyph color={themeColors.text} /> : <LinkGlyph />}
        label={copied ? "Link copied" : "Copy link"}
        meta={copied ? "✓" : null}
        emphasis={copied}
      />
    </div>
  );
}

function ShareOption({ themeColors, href, external, onClick, icon, label, meta, emphasis }) {
  const [hover, setHover] = React.useState(false);
  const baseStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 10,
    background: hover ? themeColors.text + "08" : "transparent",
    transition: "background 120ms ease",
    cursor: "pointer",
    color: themeColors.text,
    textDecoration: "none",
    fontFamily: "Inter, system-ui, sans-serif",
  };
  const inner = (
    <>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, background: themeColors.text + "08", color: themeColors.text, flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, fontWeight: 500, letterSpacing: 0.2, color: themeColors.secondary, flex: 1, textTransform: "lowercase" }}>
        {label}
      </span>
      {meta && (
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: themeColors.text, fontWeight: 700 }}>
          {meta}
        </span>
      )}
    </>
  );
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  };
  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={onClick}
        style={baseStyle}
        {...handlers}
      >
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} type="button" style={{ ...baseStyle, width: "100%", boxSizing: "border-box", border: "none", font: "inherit", textAlign: "left" }} {...handlers}>
      {inner}
    </button>
  );
}

function LinkedInGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.5 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V22h-4.55v-6.18c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.36 1.6-2.36 3.25V22H7.72V8z" />
    </svg>
  );
}

function EmailGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function LinkGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 1 0-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66l1-1" />
    </svg>
  );
}

function CheckGlyph({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="5 12 10 17 19 7" />
    </svg>
  );
}

function ShareGlyph({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
      <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
    </svg>
  );
}


function TerminalGallery({ id, correlations, activeId, onSelect, themeColors }) {
  const all = correlations.filter((c) => c.id !== activeId);
  const scrollerRef = React.useRef(null);
  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section id={id} style={{ padding: "72px 0", borderTop: `1px solid ${themeColors.text}15` }}>
      <div style={{ padding: "0 64px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, gap: 24, flexWrap: "wrap" }}>
        <div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              opacity: 0.55,
              marginBottom: 12,
            }}
          >
            the atlas is always growing
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 900,
              letterSpacing: -1.5,
              margin: 0,
              lineHeight: 0.98,
              textWrap: "balance",
            }}
          >
            More from the atlas
          </h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <CarouselBtn onClick={() => scrollBy(-1)} themeColors={themeColors} label="‹" />
          <CarouselBtn onClick={() => scrollBy(1)} themeColors={themeColors} label="›" />
        </div>
      </div>
      <div
        ref={scrollerRef}
        style={{
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "360px",
          gap: 24,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 12,
          paddingInline: 64,
          scrollbarWidth: "thin",
        }}
      >
        {all.map((c) => (
          <div key={c.id} style={{ scrollSnapAlign: "start", display: "flex" }}>
            <GalleryCard correlation={c} themeColors={themeColors} onSelect={onSelect} fillHeight />
          </div>
        ))}
      </div>
    </section>
  );
}

function CarouselBtn({ onClick, themeColors, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        border: `1px solid ${themeColors.text}25`,
        background: "transparent",
        color: themeColors.text,
        cursor: "pointer",
        fontSize: 22,
        lineHeight: 1,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = themeColors.text;
        e.currentTarget.style.color = themeColors.surface;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = themeColors.text;
      }}
    >
      {label}
    </button>
  );
}

function GalleryCard({ correlation, themeColors, onSelect, active, fillHeight }) {
  const { r } = correlation;
  const dir = r > 0 ? "+" : "−";
  return (
    <button
      onClick={() => onSelect(correlation.id)}
      style={{
        textAlign: "left",
        background: "#fff",
        border: active ? `2px solid ${themeColors.text}` : `1px solid ${themeColors.text}15`,
        borderRadius: 24,
        padding: active ? 27 : 28,
        cursor: "pointer",
        fontFamily: "inherit",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        minHeight: 280,
        height: fillHeight ? "100%" : undefined,
        width: "100%",
        transition: "transform .15s ease, border-color .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        if (!active) e.currentTarget.style.borderColor = themeColors.text + "40";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        if (!active) e.currentTarget.style.borderColor = themeColors.text + "15";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            opacity: 0.55,
          }}
        >
          {correlation.category}
        </span>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            fontWeight: 700,
            background: themeColors.primary,
            color: themeColors.text,
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          r = {dir}
          {Math.abs(r).toFixed(2)}
        </span>
      </div>
      <h3
        style={{
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: -0.5,
          margin: 0,
          lineHeight: 1.1,
          textWrap: "balance",
        }}
      >
        {correlation.title}
      </h3>
      <MiniSpark seriesA={correlation.dataA} seriesB={correlation.dataB} themeColors={themeColors} />
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, opacity: 0.7 }}>
          {correlation.seriesA.label.split(" (")[0]} <span style={{ opacity: 0.4 }}>×</span>{" "}
          {correlation.seriesB.label.split(" (")[0]}
        </span>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
            fontWeight: 600,
            color: themeColors.secondary,
          }}
        >
          open →
        </span>
      </div>
    </button>
  );
}

function MiniSpark({ seriesA, seriesB, themeColors }) {
  const w = 280;
  const h = 64;
  const a = normalize(seriesA);
  const b = normalize(seriesB);
  const n = a.length;
  const xAt = (i) => (i / (n - 1)) * w;
  const pathA = a.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${h - v * h}`).join(" ");
  const pathB = b.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${h - v * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }}>
      <path d={pathA} fill="none" stroke={themeColors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={pathB} fill="none" stroke={themeColors.secondary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TerminalSubmit({ id, themeColors }) {
  const [copied, setCopied] = React.useState(false);
  const email = "hello@curious-correlations.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch (e) {
      // Fallback for older browsers / non-HTTPS contexts
      const ta = document.createElement("textarea");
      ta.value = email;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id={id}
      style={{
        padding: "72px 64px",
        background: themeColors.text,
        color: themeColors.surface,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 32,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.6,
            marginBottom: 8,
          }}
        >
          Submit your own
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 800, margin: 0, letterSpacing: -1, textWrap: "balance" }}>
          Spotted a curious correlation?
        </h2>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.5,
            margin: "16px 0 0",
            maxWidth: 520,
            opacity: 0.75,
            textWrap: "pretty",
          }}
        >
          Send us two datasets as .csv files and we’ll plot them for you.
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Email address copied to clipboard" : `Copy email address ${email}`}
          style={{
            background: copied ? themeColors.surface : themeColors.primary,
            color: themeColors.text,
            padding: "16px 28px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            border: "none",
            font: "inherit",
            transition: "background 180ms ease",
          }}
        >
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Email copied to clipboard
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {email}
            </>
          )}
        </button>
      </div>
    </section>
  );
}

// Helpers
function pulseTarget(el) {
  if (!el) return;
  // brief outline pulse so the destination is unmistakable on arrival
  const prev = {
    boxShadow: el.style.boxShadow,
    transition: el.style.transition,
  };
  // wait for the smooth scroll to be roughly underway before firing the pulse
  setTimeout(() => {
    el.style.transition = "box-shadow 280ms ease-out";
    el.style.boxShadow = "inset 0 0 0 3px rgba(122, 196, 138, 0.85)";
    setTimeout(() => {
      el.style.boxShadow = "inset 0 0 0 0 rgba(122, 196, 138, 0)";
      setTimeout(() => {
        el.style.boxShadow = prev.boxShadow;
        el.style.transition = prev.transition;
      }, 320);
    }, 480);
  }, 350);
}

function useChartProgress(key, duration = 1100, delay = 0) {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    if (typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setP(1);
      return;
    }
    let raf;
    let timeoutId;
    setP(0);
    timeoutId = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setP(eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timeoutId);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [key, duration, delay]);
  return p;
}

function normalize(arr) {
  const valid = arr.filter((v) => v != null && Number.isFinite(v));
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  return arr.map((v) => (v == null || !Number.isFinite(v) ? null : (v - min) / (max - min || 1)));
}

function monthLabel(i) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[i % 12]} '${i < 12 ? "24" : "25"}`;
}

// Resolve an annotation/event date label that ALWAYS includes the year.
// weekLabels typically only stamps the year on the first entry of each year
// (e.g. "Jan '25", "Feb", "Mar", ...). When an annotation lands on a bare
// month, we walk backwards to the nearest year-bearing label and stitch the
// short year onto the current month, yielding e.g. "Jun '25".
function resolveDateLabel(weekLabels, idx) {
  if (!weekLabels || weekLabels[idx] == null) return monthLabel(idx);
  const raw = String(weekLabels[idx]);
  const yearMatch = raw.match(/'(\d{2})/);
  if (yearMatch) return raw; // already has a year
  // Walk back to find the most recent label that carries a year.
  for (let j = idx - 1; j >= 0; j--) {
    const prev = String(weekLabels[j] || "");
    const m = prev.match(/'(\d{2})/);
    if (m) return `${raw} '${m[1]}`;
  }
  return raw;
}

window.TerminalLayout = TerminalLayout;
