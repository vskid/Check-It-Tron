function ResultsView({ data, onReset }) {
  const d = {
    score: data?.hype_score ?? MOCK.score,
    confidence: data?.confidence ?? MOCK.confidence,
    verdict: data?.verdict ?? MOCK.verdict,
    summary: data?.verdict_reason ?? MOCK.summary,
    categories: data?.trend_signals
      ? Object.values(data.trend_signals).filter(v => v && typeof v === "string").slice(0, 4)
      : MOCK.categories,
    projects: (data?.similar_projects ?? []).map(p => ({
      source: "Devpost",
      name: p.name,
      sim: p.similarity,
    })),
    remixes: (data?.upgrade_suggestions ?? []).map(s => ({
      title: s.title,
      desc: s.description,
    })),
    diff_tips: MOCK.diff_tips,
  };

  const sc = scoreClass(d.score);
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
      <OrangeCard>
        <Label>Originality score</Label>
        <div style={{ ...styles.scoreBig, color: scoreColor }}>
          {d.score}
          <span style={styles.scoreDenom}>/100</span>
        </div>
        <div style={styles.categoriesRow}>
          {d.categories.map((c) => (
            <span key={c} style={styles.catTag}>{c}</span>
          ))}
        </div>
        <div style={{ ...styles.verdictBadge, background: badgeBg }}>{d.verdict}</div>
        <div style={styles.verdictTxt}>{d.summary}</div>
        <div style={styles.scoreBarTrack}>
          <div style={{ ...styles.scoreBarFill, width: `${d.score}%`, background: barGradient, animation: "sfill 1.2s cubic-bezier(0.4,0,0.2,1) forwards" }}>
            <div style={styles.scoreBarFillShine} />
          </div>
        </div>
        <div style={styles.confidenceRow}>
          <span style={styles.confidenceLabel}>Confidence</span>
          <div style={styles.confidenceTrack}>
            <div style={{ ...styles.confidenceFill, width: `${d.confidence}%`, animation: "sfill 1s ease forwards" }} />
          </div>
          <span style={styles.confidenceVal}>{d.confidence}%</span>
        </div>
      </OrangeCard>

      <CreamCard>
        <Label muted>
          Similar projects{" "}
          <span style={{ color: "#7a6a58", fontWeight: 400 }}>({d.projects.length} found)</span>
        </Label>
        {d.projects.map((p, i) => (
          <div key={i} style={{ ...styles.projRow, borderBottom: i < d.projects.length - 1 ? "1.5px solid rgba(0,0,0,0.1)" : "none" }}>
            <span style={styles.projSource}>{p.source}</span>
            <span style={styles.projName}>{p.name}</span>
            <span style={styles.projPct}>{p.sim}%</span>
            <div style={styles.projBar}>
              <div style={{ ...styles.projBarFill, width: `${p.sim}%` }} />
            </div>
          </div>
        ))}
      </CreamCard>

      <CreamCard>
        <Label muted>Remix possibilities</Label>
        {d.remixes.map((r, i) => (
          <div key={i} style={{ ...styles.remixRow, borderBottom: i < d.remixes.length - 1 ? "1.5px solid rgba(0,0,0,0.08)" : "none" }}>
            <span style={styles.remixNum}>0{i + 1}</span>
            <div>
              <div style={styles.remixTitle}>{r.title}</div>
              <div style={styles.remixDesc}>{r.desc}</div>
            </div>
          </div>
        ))}
      </CreamCard>

      <CreamCard>
        <Label muted>Differentiation tips</Label>
        {d.diff_tips.map((tip, i) => (
          <div key={i} style={{ ...styles.remixRow, borderBottom: i < d.diff_tips.length - 1 ? "1.5px solid rgba(0,0,0,0.08)" : "none" }}>
            <span style={styles.remixNum}>0{i + 1}</span>
            <div>
              <div style={styles.remixTitle}>{tip.title}</div>
              <div style={styles.remixDesc}>{tip.desc}</div>
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
  const [view, setView] = useState("input");
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes sfill { from { width: 0% } }
        @keyframes fadein { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
      <div style={styles.app}>
        <div style={styles.masthead}>
          <div style={styles.logoEmoji}>🇨🇭🇪🇨🇰-🇮🇹-🇹🇷🇴🇳</div>
          <div style={styles.mastheadSub}>Idea originality scanner</div>
        </div>
        <div style={styles.sourcesRow}>
          <span style={styles.sourcesLabel}>Sources</span>
          {["GitHub", "Devpost", "Devfolio", "Google"].map((s) => (
            <SourceTag key={s}>{s}</SourceTag>
          ))}
        </div>
        {view === "input" && (
          <InputView onScan={(desc) => { setIdea(desc); setView("loading"); }} />
        )}
        {view === "loading" && (
          <LoadingView idea={idea} onDone={(data) => { setResult(data); setView("results"); }} />
        )}
        {view === "results" && (
          <ResultsView data={result} onReset={() => setView("input")} />
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
  app: { backgroundColor: "#f0e6d0", backgroundImage: NOISE_BG, backgroundSize: "300px 300px", backgroundRepeat: "repeat", fontFamily: FONT, color: "#111", minHeight: "100vh", padding: "22px 18px 32px" },
  masthead: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 },
  logoEmoji: { fontSize: 20, letterSpacing: 1, lineHeight: 1, marginBottom: 7 },
  mastheadSub: { fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "#6b6050" },
  sourcesRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 22, flexWrap: "wrap" },
  sourcesLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b6050", marginRight: 2 },
  sourceTag: { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", tex
