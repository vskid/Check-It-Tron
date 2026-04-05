import { useState, useEffect, useRef } from "react";

// ── data ──────────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Scraping GitHub...", pct: 20 },
  { label: "Scraping Devpost...", pct: 42 },
  { label: "Scraping Devfolio...", pct: 62 },
  { label: "Searching Google...", pct: 80 },
  { label: "Generating report...", pct: 95 },
];

const MOCK = {
  score: 73,
  confidence: 61,
  verdict: "Moderately original",
  summary:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  categories: ["AI", "DevTools", "Productivity", "Open Source"],
  projects: [
    { source: "GitHub", name: "lorem-ipsum-checker", sim: 82 },
    { source: "Devpost", name: "IdeaScan Pro", sim: 67 },
    { source: "Devfolio", name: "originality.io", sim: 61 },
    { source: "Google", name: "conceptdiff.dev", sim: 54 },
    { source: "GitHub", name: "hacklens", sim: 48 },
    { source: "Devpost", name: "BuildRadar", sim: 40 },
  ],
  remixes: [
    {
      title: "Domain-specific version",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    },
    {
      title: "Add real-time collaboration",
      desc: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
    },
    {
      title: "Invert the concept",
      desc: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.",
    },
  ],
  diff_tips: [
    {
      title: "Target an underserved niche",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nisi ut aliquip ex ea commodo consequat.",
    },
    {
      title: "Combine with adjacent domain",
      desc: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.",
    },
    {
      title: "Flip the user relationship",
      desc: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.",
    },
  ],
};

const TRENDING = [
  {
    title: "AI-powered code review bots",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.",
    tags: ["AI", "DevTools"],
    heat: "★★★",
  },
  {
    title: "Offline-first mobile data sync",
    desc: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
    tags: ["Mobile", "Infra"],
    heat: "★★★",
  },
  {
    title: "LLM prompt marketplaces",
    desc: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
    tags: ["AI", "Marketplace"],
    heat: "★★",
  },
  {
    title: "Open-source Notion alternatives",
    desc: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
    tags: ["Productivity", "OSS"],
    heat: "★★",
  },
  {
    title: "Voice-first dev environments",
    desc: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
    tags: ["AI", "DX"],
    heat: "★",
  },
  {
    title: "Real-time multiplayer for solo tools",
    desc: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    tags: ["Collab", "UX"],
    heat: "★",
  },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function scoreClass(s) {
  return s < 40 ? "low" : s < 70 ? "mid" : "high";
}

// ── sub-components ────────────────────────────────────────────────────────────

function OrangeCard({ children }) {
  return (
    <div style={styles.orangeCard}>
      <div style={styles.orangeCardShine} />
      <div style={styles.orangeCardInner}>{children}</div>
    </div>
  );
}

function CreamCard({ children }) {
  return (
    <div style={styles.creamCard}>
      <div style={styles.creamCardShine} />
      <div style={styles.creamCardInner}>{children}</div>
    </div>
  );
}

function Label({ children, muted }) {
  return (
    <div style={{ ...styles.label, color: muted ? "#4a3f30" : "rgba(255,255,255,0.65)" }}>
      {children}
    </div>
  );
}

function SourceTag({ children }) {
  return <span style={styles.sourceTag}>{children}</span>;
}

// ── views ─────────────────────────────────────────────────────────────────────

function InputView({ onScan }) {
  const [desc, setDesc] = useState("");
  const [context, setContext] = useState("");

  return (
    <OrangeCard>
      <Label>
        Hackathon context{" "}
        <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: "none", fontSize: 10, opacity: 0.5 }}>
          (optional)
        </span>
      </Label>
      <input
        style={styles.contextInput}
        type="text"
        placeholder="e.g. ETHGlobal — theme: public goods"
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />
      <Label>Project description</Label>
      <textarea
        style={styles.textarea}
        placeholder="Describe your idea..."
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <button
        style={styles.btnScan}
        onClick={() => desc.trim() && onScan(desc, context)}
        onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
        onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "none")}
      >
        <span style={styles.btnScanShine} />
        Scan idea
      </button>
    </OrangeCard>
  );
}

function LoadingView({ onDone }) {
  const [pct, setPct] = useState(0);
  const [label, setLabel] = useState("Initializing...");
  const [stepLabel, setStepLabel] = useState("");
  const stepRef = useRef(0);

  useEffect(() => {
    function next() {
      const i = stepRef.current;
      if (i >= STEPS.length) {
        setPct(100);
        setLabel("Done.");
        setStepLabel("");
        setTimeout(onDone, 500);
        return;
      }
      const s = STEPS[i];
      setPct(s.pct);
      setLabel(s.label);
      setStepLabel(`Step ${i + 1} of ${STEPS.length}`);
      stepRef.current = i + 1;
      setTimeout(next, 900);
    }
    next();
  }, []);

  return (
    <OrangeCard>
      <div style={styles.loadLabel}>{label}</div>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${pct}%`, transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)" }}>
          <div style={styles.barFillShine} />
          <span style={styles.barPct}>{pct}%</span>
        </div>
      </div>
      <div style={styles.stepLabel}>{stepLabel}</div>
    </OrangeCard>
  );
}
function ResultsView({ onReset }) {
  const sc = scoreClass(MOCK.score);
  const scoreColor = sc === "low" ? "#ffaaaa" : sc === "mid" ? "#ffe0a0" : "#b0ffb0";
  const badgeBg = sc === "low" ? "#8f0e12" : sc === "mid" ? "#c47a00" : "#1a7a1a";
  const barGradient =
    sc === "low"
      ? "linear-gradient(90deg,#8f0e12,#d93238)"
      : sc === "mid"
      ? "linear-gradient(90deg,#c47a00,#e8a020)"
      : "linear-gradient(90deg,#1a7a1a,#2db52d)";

  return (
    <div style={styles.fadeIn}>
      {/* Originality score */}
      <OrangeCard>
        <Label>Originality score</Label>
        <div style={{ ...styles.scoreBig, color: scoreColor }}>
          {MOCK.score}
          <span style={styles.scoreDenom}>/100</span>
        </div>
        <div style={styles.categoriesRow}>
          {MOCK.categories.map((c) => (
            <span key={c} style={styles.catTag}>{c}</span>
          ))}
        </div>
        <div style={{ ...styles.verdictBadge, background: badgeBg }}>{MOCK.verdict}</div>
        <div style={styles.verdictTxt}>{MOCK.summary}</div>
        <div style={styles.scoreBarTrack}>
          <div
            style={{
              ...styles.scoreBarFill,
              width: `${MOCK.score}%`,
              background: barGradient,
              animation: "sfill 1.2s cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          >
            <div style={styles.scoreBarFillShine} />
          </div>
        </div>
        <div style={styles.confidenceRow}>
          <span style={styles.confidenceLabel}>Confidence</span>
          <div style={styles.confidenceTrack}>
            <div
              style={{
                ...styles.confidenceFill,
                width: `${MOCK.confidence}%`,
                animation: "sfill 1s ease forwards",
              }}
            />
          </div>
          <span style={styles.confidenceVal}>{MOCK.confidence}%</span>
        </div>
      </OrangeCard>

      {/* Similar projects */}
      <CreamCard>
        <Label muted>
          Similar projects{" "}
          <span style={{ color: "#7a6a58", fontWeight: 400 }}>({MOCK.projects.length} found)</span>
        </Label>
        {MOCK.projects.map((p, i) => (
          <div key={i} style={{ ...styles.projRow, borderBottom: i < MOCK.projects.length - 1 ? "1.5px solid rgba(0,0,0,0.1)" : "none" }}>
            <span style={styles.projSource}>{p.source}</span>
            <span style={styles.projName}>{p.name}</span>
            <span style={styles.projPct}>{p.sim}%</span>
            <div style={styles.projBar}>
              <div style={{ ...styles.projBarFill, width: `${p.sim}%` }} />
            </div>
          </div>
        ))}
      </CreamCard>

      {/* Remix possibilities */}
      <CreamCard>
        <Label muted>Remix possibilities</Label>
        {MOCK.remixes.map((r, i) => (
          <div key={i} style={{ ...styles.remixRow, borderBottom: i < MOCK.remixes.length - 1 ? "1.5px solid rgba(0,0,0,0.08)" : "none" }}>
            <span style={styles.remixNum}>0{i + 1}</span>
            <div>
              <div style={styles.remixTitle}>{r.title}</div>
              <div style={styles.remixDesc}>{r.desc}</div>
            </div>
          </div>
        ))}
      </CreamCard>

      {/* Differentiation tips */}
      <CreamCard>
        <Label muted>Differentiation tips</Label>
        {MOCK.diff_tips.map((d, i) => (
          <div key={i} style={{ ...styles.remixRow, borderBottom: i < MOCK.diff_tips.length - 1 ? "1.5px solid rgba(0,0,0,0.08)" : "none" }}>
            <span style={styles.remixNum}>0{i + 1}</span>
            <div>
              <div style={styles.remixTitle}>{d.title}</div>
              <div style={styles.remixDesc}>{d.desc}</div>
            </div>
          </div>
        ))}
      </CreamCard>

      <button
        style={styles.btnReset}
        onClick={onReset}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#8f0e12")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#c0151a")}
      >
        <span style={styles.btnResetShine} />
        Check another idea
      </button>

      {/* Trending ideas */}
      <CreamCard>
        <Label muted>
          ★ Trending ideas{" "}
          <span style={{ color: "#7a6a58", fontWeight: 400 }}>(last 3-6 months)</span>
        </Label>
        {TRENDING.map((t, i) => (
          <div key={i} style={{ ...styles.trendRow, borderBottom: i < TRENDING.length - 1 ? "1.5px solid rgba(0,0,0,0.08)" : "none" }}>
            <span style={styles.trendRank}>{String(i + 1).padStart(2, "0")}</span>
            <div style={styles.trendBody}>
              <div style={styles.trendTitle}>{t.title}</div>
              <div style={styles.trendDesc}>{t.desc}</div>
              <div style={styles.trendTags}>
                {t.tags.map((tag) => (
                  <span key={tag} style={styles.trendTag}>{tag}</span>
                ))}
              </div>
            </div>
            <span style={styles.trendHeat}>{t.heat}</span>
          </div>
        ))}
      </CreamCard>
    </div>
  );
}

// ── main app ──────────────────────────────────────────────────────────────────

export default function CheckItTron() {
  const [view, setView] = useState("input"); // "input" | "loading" | "results"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes sfill { from { width: 0% } }
        @keyframes fadein { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
      <div style={styles.app}>
        {/* Masthead */}
        <div style={styles.masthead}>
          <div style={styles.logoEmoji}>🇨🇭🇪🇨🇰-🇮🇹-🇹🇷🇴🇳</div>
          <div style={styles.mastheadSub}>Idea originality scanner</div>
        </div>

        {/* Sources row */}
        <div style={styles.sourcesRow}>
          <span style={styles.sourcesLabel}>Sources</span>
          {["GitHub", "Devpost", "Devfolio", "Google"].map((s) => (
            <SourceTag key={s}>{s}</SourceTag>
          ))}
        </div>

        {/* Views */}
        {view === "input" && (
          <InputView onScan={() => setView("loading")} />
        )}
        {view === "loading" && (
          <LoadingView onDone={() => setView("results")} />
        )}
        {view === "results" && (
          <ResultsView onReset={() => setView("input")} />
        )}
      </div>
    </>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeBlend in='SourceGraphic' mode='multiply'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.10'/%3E%3C/svg%3E")`;

const FONT = "'Bricolage Grotesque', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'IBM Plex Mono', monospace";
const BORDER = "2px solid #111";
const RED = "#c0151a";

const styles = {
  app: {
    backgroundColor: "#f0e6d0",
    backgroundImage: NOISE_BG,
    backgroundSize: "300px 300px",
    backgroundRepeat: "repeat",
    fontFamily: FONT,
    color: "#111",
    minHeight: "100vh",
    padding: "22px 18px 32px",
  },
  masthead: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 },
  logoEmoji: { fontSize: 20, letterSpacing: 1, lineHeight: 1, marginBottom: 7 },
  mastheadSub: { fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "#6b6050" },
  sourcesRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 22, flexWrap: "wrap" },
  sourcesLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b6050", marginRight: 2 },
  sourceTag: { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", border: BORDER, padding: "4px 13px", borderRadius: 50, background: RED, color: "#fff" },

  // orange card
  orangeCard: { background: "#e8501a", border: BORDER, borderRadius: 18, overflow: "hidden", position: "relative", marginBottom: 14 },
  orangeCardShine: { position: "absolute", top: 0, left: 0, right: 0, height: "48%", background: "linear-gradient(180deg,rgba(255,255,255,0.28) 0%,rgba(255,255,255,0) 100%)", pointerEvents: "none", borderRadius: "18px 18px 0 0", zIndex: 1 },
  orangeCardInner: { padding: 22, position: "relative", zIndex: 2 },

  // cream card
  creamCard: { background: "#f5ecdb", border: BORDER, borderRadius: 18, overflow: "hidden", position: "relative", marginBottom: 14 },
  creamCardShine: { position: "absolute", top: 0, left: 0, right: 0, height: "48%", background: "linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0) 100%)", pointerEvents: "none", borderRadius: "18px 18px 0 0", zIndex: 1 },
  creamCardInner: { padding: 22, position: "relative", zIndex: 2, textAlign: "left" },

  label: { fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 },

  // inputs
  contextInput: { width: "100%", border: BORDER, borderRadius: 12, background: "rgba(255,255,255,0.2)", fontFamily: FONT, fontSize: 14, padding: "11px 16px", outline: "none", color: "#fff", marginBottom: 16 },
  textarea: { width: "100%", border: BORDER, borderRadius: 12, background: "rgba(255,255,255,0.2)", fontFamily: FONT, fontSize: 15, lineHeight: 1.6, padding: "14px 16px", resize: "vertical", minHeight: 120, outline: "none", color: "#fff" },

  // scan button
  btnScan: { marginTop: 12, width: "100%", padding: 14, background: "linear-gradient(180deg,#d93238 0%,#c0151a 50%,#8f0e12 100%)", color: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", border: BORDER, borderRadius: 50, cursor: "pointer", position: "relative", overflow: "hidden" },
  btnScanShine: { position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg,rgba(255,255,255,0.25) 0%,rgba(255,255,255,0) 100%)", borderRadius: "50px 50px 0 0", pointerEvents: "none" },

  // loading bar
  loadLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 10 },
  barTrack: { width: "100%", height: 32, border: BORDER, borderRadius: 50, background: "rgba(255,255,255,0.15)", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 50, background: RED, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 14, position: "relative", overflow: "hidden" },
  barFillShine: { position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg,rgba(255,255,255,0.25) 0%,transparent 100%)" },
  barPct: { fontFamily: MONO, fontSize: 12, fontWeight: 500, color: "#fff", position: "relative", zIndex: 1 },
  stepLabel: { fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 10, letterSpacing: "0.04em" },

  // score
  scoreBig: { fontSize: 86, fontWeight: 800, lineHeight: 0.88, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" },
  scoreDenom: { fontSize: 22, fontWeight: 400, color: "rgba(255,255,255,0.4)" },
  categoriesRow: { display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0 6px" },
  catTag: { fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "2px solid rgba(255,255,255,0.5)", padding: "3px 11px", borderRadius: 50, color: "rgba(255,255,255,0.85)" },
  verdictBadge: { display: "inline-block", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 13px", borderRadius: 50, margin: "12px 0 8px", border: "1.5px solid #111" },
  verdictTxt: { fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.55 },
  scoreBarTrack: { width: "100%", height: 10, borderRadius: 50, background: "rgba(0,0,0,0.18)", marginTop: 14, overflow: "hidden" },
  scoreBarFill: { height: "100%", borderRadius: 50, position: "relative", overflow: "hidden" },
  scoreBarFillShine: { position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg,rgba(255,255,255,0.3) 0%,transparent 100%)" },
  confidenceRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 14 },
  confidenceLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", flexShrink: 0 },
  confidenceTrack: { flex: 1, height: 5, borderRadius: 50, background: "rgba(0,0,0,0.2)", overflow: "hidden" },
  confidenceFill: { height: "100%", borderRadius: 50, background: "rgba(255,255,255,0.5)" },
  confidenceVal: { fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.5)", flexShrink: 0 },

  // projects
  projRow: { display: "flex", alignItems: "center", gap: 10, padding: "11px 0" },
  projSource: { fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: RED, color: "#fff", padding: "3px 0", borderRadius: 50, flexShrink: 0, border: "1.5px solid #111", width: 68, textAlign: "center" },
  projName: { fontSize: 13, fontWeight: 600, color: "#111", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  projPct: { fontFamily: MONO, fontSize: 12, color: "#5a4e40", flexShrink: 0 },
  projBar: { width: 44, height: 5, background: "#ccc", borderRadius: 50, overflow: "hidden", flexShrink: 0 },
  projBarFill: { height: "100%", background: RED, borderRadius: 50 },

  // remixes / diff tips
  remixRow: { display: "flex", gap: 12, padding: "11px 0" },
  remixNum: { fontFamily: MONO, fontSize: 12, fontWeight: 700, color: RED, minWidth: 22, flexShrink: 0, paddingTop: 1 },
  remixTitle: { fontSize: 14, fontWeight: 800, marginBottom: 3, letterSpacing: "-0.01em", color: "#111", textAlign: "left" },
  remixDesc: { fontSize: 12, lineHeight: 1.55, color: "#5a4e40", textAlign: "left" },

  // trending
  trendRow: { display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 0" },
  trendRank: { fontFamily: MONO, fontSize: 11, fontWeight: 700, color: RED, minWidth: 22, flexShrink: 0, paddingTop: 2 },
  trendBody: { flex: 1, minWidth: 0, textAlign: "left" },
  trendTitle: { fontSize: 13, fontWeight: 800, color: "#111", marginBottom: 2, letterSpacing: "-0.01em", textAlign: "left" },
  trendDesc: { fontSize: 11, color: "#5a4e40", lineHeight: 1.5, textAlign: "left" },
  trendTags: { display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap", justifyContent: "flex-start" },
  trendTag: { fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: "1.5px solid #111", padding: "2px 8px", borderRadius: 50, color: "#3a3020" },
  trendHeat: { fontSize: 13, flexShrink: 0, paddingTop: 1, color: "#f5c400", letterSpacing: 1 },

  // reset button
  btnReset: { background: RED, border: BORDER, borderRadius: 50, fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", padding: "10px 24px", cursor: "pointer", color: "#fff", display: "block", margin: "4px auto 14px", position: "relative", overflow: "hidden" },
  btnResetShine: { position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg,rgba(255,255,255,0.2) 0%,transparent 100%)", borderRadius: "50px 50px 0 0", pointerEvents: "none" },

  fadeIn: { animation: "fadein 0.45s ease" },
};
