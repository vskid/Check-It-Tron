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
              <div style={styles.trendTa
