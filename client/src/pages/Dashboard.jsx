import React, { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Brain, Trophy, AlertTriangle, BookOpen,
  FlaskConical, TrendingUp, ChevronRight, Star,
  Zap, Target, Sparkles, ArrowUpRight, CheckCircle,
  Clock, Layers, BarChart2, Award, Compass,
} from "lucide-react";

/* ─────────────────────────────────────────────
   KEYFRAMES
────────────────────────────────────────────── */
const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');

@keyframes fadeUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes fadeIn {
  from { opacity:0; } to { opacity:1; }
}
@keyframes scaleIn {
  from { opacity:0; transform:scale(0.9); }
  to   { opacity:1; transform:scale(1); }
}
@keyframes slideLeft {
  from { opacity:0; transform:translateX(-16px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes slideRight {
  from { opacity:0; transform:translateX(16px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes ringFill {
  from { stroke-dasharray: 0 364; }
}
@keyframes barGrow {
  from { width:0; }
}
@keyframes shimmer {
  0%   { background-position:-600px 0; }
  100% { background-position:600px 0; }
}
@keyframes pulseDot {
  0%,100% { transform:scale(1); opacity:1; }
  50%      { transform:scale(0.5); opacity:0.4; }
}
@keyframes float {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-5px); }
}
@keyframes spin {
  to { transform:rotate(360deg); }
}
@keyframes countUp {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes borderPulse {
  0%,100% { border-color: rgba(99,102,241,0.15); }
  50%      { border-color: rgba(99,102,241,0.4); }
}
`;

function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById("db-kf")) return;
    const tag = document.createElement("style");
    tag.id = "db-kf";
    tag.textContent = KEYFRAMES;
    document.head.appendChild(tag);
  }, []);
}

/* ─────────────────────────────────────────────
   ANIMATED NUMBER
────────────────────────────────────────────── */
function AnimatedNumber({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let v = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const id = setInterval(() => {
      v += step;
      if (v >= target) { setVal(target); clearInterval(id); }
      else setVal(v);
    }, 35);
    return () => clearInterval(id);
  }, [target]);
  return <>{val}{suffix}</>;
}

/* ─────────────────────────────────────────────
   SCORE RING
────────────────────────────────────────────── */
function ScoreRing({ score, label, color }) {
  const [filled, setFilled] = useState(false);
  useEffect(() => { setTimeout(() => setFilled(true), 300); }, []);
  const R = 62, C = 2 * Math.PI * R;
  const dash = filled ? (score / 100) * C : 0;

  return (
    <div style={{ position: "relative", width: 168, height: 168, flexShrink: 0 }}>
      <svg width={168} height={168} viewBox="0 0 168 168">
        <circle cx={84} cy={84} r={R} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth={12} />
        <circle cx={84} cy={84} r={R} fill="none"
          stroke={`url(#rg-${score})`} strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          transform="rotate(-90 84 84)"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.34,1.4,0.64,1)" }}
        />
        <defs>
          <linearGradient id={`rg-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 30, fontWeight: 800, color: "#0f0c29", lineHeight: 1 }}>
          {score}<span style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Outfit',sans-serif" }}>%</span>
        </span>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>{label}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADER
────────────────────────────────────────────── */
function SectionHeader({ icon: Icon, iconColor, iconBg, label, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
      <div style={{ width: 42, height: 42, borderRadius: 13, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px rgba(0,0,0,0.08)` }}>
        <Icon size={19} color={iconColor} strokeWidth={2} />
      </div>
      <div>
        <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 17, fontWeight: 700, color: "#0f0c29", margin: 0, letterSpacing: "-0.1px" }}>{label}</h3>
        {subtitle && <p style={{ fontSize: 12.5, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500, letterSpacing: "0.01em" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
────────────────────────────────────────────── */
export default function Dashboard() {
  useInjectStyles();
  const location = useLocation();
  const data = location.state;
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  if (!data) return <Navigate to="/home" />;

  const ai  = data.aiAnalysis  || {};
  const rag = data.ragAnalysis || {};
  const score = ai.career_readiness_score || rag.readinessScore || 0;

  const scoreConfig =
    score >= 80 ? { label: "Excellent",  color: "#10b981", bg: "#d1fae5", icon: "🏆" } :
    score >= 60 ? { label: "Good",       color: "#6366f1", bg: "#eef2ff", icon: "🚀" } :
    score >= 40 ? { label: "Developing", color: "#f59e0b", bg: "#fef3c7", icon: "📈" } :
                  { label: "Beginner",   color: "#ef4444", bg: "#fee2e2", icon: "🌱" };

  const STATS = [
    { label: "Role Match",     value: score,                               suffix: "%", icon: Target,   grad: "linear-gradient(135deg,#6366f1,#8b5cf6)", light: "#eef2ff", text: "#4338ca" },
    { label: "Strengths",      value: ai.strengths?.length || 0,           suffix: "",  icon: Trophy,   grad: "linear-gradient(135deg,#f59e0b,#f97316)", light: "#fef3c7", text: "#b45309" },
    { label: "Skills to Learn",value: ai.skills_to_learn?.length || 0,     suffix: "",  icon: BookOpen, grad: "linear-gradient(135deg,#3b82f6,#06b6d4)", light: "#dbeafe", text: "#1d4ed8" },
    { label: "Roadmap Phases", value: ai.personalized_roadmap?.length || 0,suffix: "",  icon: Layers,   grad: "linear-gradient(135deg,#10b981,#14b8a6)", light: "#d1fae5", text: "#047857" },
  ];

  return (
    <div style={s.wrapper}>
      <Sidebar />

      <div style={{ ...s.main, opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ ...s.pageHeader, animation: "fadeUp 0.4s ease both" }}>
          <div>
            <div style={s.breadcrumb}>
              <Compass size={11} color="#6366f1" />
              <span>Career Analysis</span>
              <ChevronRight size={11} color="#cbd5e1" />
              <span style={{ color: "#0f0c29", fontWeight: 600 }}>Dashboard</span>
            </div>
            <h1 style={s.pageTitle}>Your Career Profile</h1>
          </div>
          <div style={s.headerRight}>
            <div style={s.aiBadge}>
              <Sparkles size={12} color="#6366f1" style={{ animation: "spin 4s linear infinite" }} />
              <span>AI Analysis Ready</span>
            </div>
            {ai.detected_role && (
              <div style={s.roleBadge}>
                <span style={s.roleDot} />
                {ai.detected_role}
              </div>
            )}
          </div>
        </div>

        {/* ── HERO BANNER ── */}
        <div style={{ ...s.hero, animation: "fadeUp 0.45s 0.05s ease both" }}>

          {/* left: score info */}
          <div style={s.heroContent}>
            <div style={s.heroTopLine}>
              <span style={{ ...s.statusPill, background: scoreConfig.bg, color: scoreConfig.color, border: `1px solid ${scoreConfig.color}30` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: scoreConfig.color, animation: "pulseDot 2s infinite", display: "inline-block" }} />
                {scoreConfig.icon} {scoreConfig.label}
              </span>
              <span style={s.updatedText}>
                <Clock size={11} color="#cbd5e1" style={{ marginRight: 4 }} />
                Just now
              </span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px 0" }}>Readiness Score</p>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 64, fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" }}>{score}<span style={{ fontSize: 32, letterSpacing: 0 }}>%</span></div>
            </div>

            <p style={s.heroSub}>
              {ai.career_summary
                ? ai.career_summary.slice(0, 160) + (ai.career_summary.length > 160 ? "…" : "")
                : "AI-powered career analysis based on your skills and experience."}
            </p>

            <div style={s.heroPillRow}>
              {ai.domain && <span style={s.heroPill}><BarChart2 size={11} /> {ai.domain}</span>}
              {ai.seniority_level && <span style={s.heroPill}><Award size={11} /> {ai.seniority_level}</span>}
              {ai.core_coverage != null && <span style={s.heroPill}><CheckCircle size={11} /> {ai.core_coverage}% Core Coverage</span>}
            </div>
          </div>

          {/* right: ring + decoration */}
          <div style={s.heroRing}>
            <div style={s.ringGlow} />
            <ScoreRing score={score} label="readiness" color="#6366f1" />
          </div>

          {/* decorative shapes */}
          <div style={s.heroDeco1} />
          <div style={s.heroDeco2} />
        </div>

        {/* ── STAT CARDS ── */}
        <div style={s.statGrid}>
          {STATS.map(({ label, value, suffix, icon: Icon, grad, light, text }, i) => (
            <StatCard key={i} label={label} value={value} suffix={suffix} Icon={Icon} grad={grad} light={light} text={text} delay={i * 0.07} />
          ))}
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div style={s.contentGrid}>

          {/* ── LEFT COLUMN ── */}
          <div style={s.leftCol}>

            {/* AI Summary */}
            <div style={{ ...s.card, animation: "fadeUp 0.5s 0.15s ease both" }} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(0,0,0,0.11), 0 28px 60px rgba(99,102,241,0.20)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(99,102,241,0.12)";e.currentTarget.style.transform="none"}}>
              <SectionHeader icon={Brain} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)" label="AI Summary" subtitle="Personalized career overview" />
              <p style={s.summaryText}>{ai.career_summary || "No summary available."}</p>
              {ai.final_advice && (
                <div style={s.adviceBox}>
                  <Zap size={13} color="#6366f1" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={s.adviceText}>{ai.final_advice}</p>
                </div>
              )}
            </div>

            {/* Strengths */}
            <div style={{ ...s.card, animation: "fadeUp 0.5s 0.2s ease both" }} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(0,0,0,0.11), 0 28px 60px rgba(245,158,11,0.18)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(99,102,241,0.12)";e.currentTarget.style.transform="none"}}>
              <SectionHeader icon={Trophy} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)" label="Strengths" subtitle={`${ai.strengths?.length || 0} identified`} />
              <div style={s.strengthGrid}>
                {(ai.strengths || []).map((item, i) => (
                  <StrengthTag key={i} item={item} delay={i} />
                ))}
                {!ai.strengths?.length && <EmptyState text="No strengths detected" />}
              </div>
            </div>

            {/* Skill Gaps */}
            {ai.skill_gaps?.length > 0 && (
              <div style={{ ...s.card, animation: "fadeUp 0.5s 0.25s ease both" }} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(0,0,0,0.11), 0 28px 60px rgba(139,92,246,0.20)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(99,102,241,0.12)";e.currentTarget.style.transform="none"}}>
                <SectionHeader icon={Target} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)" label="Skill Gap Analysis" subtitle="Priority-ordered learning targets" />
                <div style={s.gapList}>
                  {ai.skill_gaps.map((gap, i) => (
                    <GapItem key={i} gap={gap} delay={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Weaknesses */}
            <div style={{ ...s.card, animation: "fadeUp 0.5s 0.3s ease both" }} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(0,0,0,0.11), 0 28px 60px rgba(239,68,68,0.16)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(99,102,241,0.12)";e.currentTarget.style.transform="none"}}>
              <SectionHeader icon={AlertTriangle} iconColor="#ef4444" iconBg="rgba(239,68,68,0.1)" label="Areas to Improve" subtitle="Focus areas for growth" />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(ai.weaknesses || []).map((item, i) => (
                  <WeaknessRow key={i} item={item} delay={i} />
                ))}
                {!ai.weaknesses?.length && <EmptyState text="No weaknesses detected" />}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={s.rightCol}>

            {/* Skills to Learn */}
            <div style={{ ...s.card, animation: "slideRight 0.5s 0.15s ease both" }} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(0,0,0,0.11), 0 28px 60px rgba(59,130,246,0.18)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(99,102,241,0.12)";e.currentTarget.style.transform="none"}}>
              <SectionHeader icon={BookOpen} iconColor="#3b82f6" iconBg="rgba(59,130,246,0.12)" label="Skills to Learn" subtitle="Sorted by impact" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(ai.skills_to_learn || []).map((sk, i) => {
                  const name = typeof sk === "string" ? sk : sk.skill || sk.name || "";
                  const pri  = typeof sk === "string" ? null : sk.priority;
                  return <SkillRow key={i} name={name} priority={pri} index={i} />;
                })}
                {!ai.skills_to_learn?.length && <EmptyState text="No skills data" />}
              </div>
            </div>

            {/* Projects to Build */}
            <div style={{ ...s.card, animation: "slideRight 0.5s 0.22s ease both" }} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(0,0,0,0.11), 0 28px 60px rgba(16,185,129,0.18)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(99,102,241,0.12)";e.currentTarget.style.transform="none"}}>
              <SectionHeader icon={FlaskConical} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)" label="Projects to Build" subtitle="Portfolio-ready ideas" />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(ai.projects_to_build || []).map((p, i) => (
                  <ProjectCard key={i} project={p} index={i} />
                ))}
                {!ai.projects_to_build?.length && <EmptyState text="No projects suggested" />}
              </div>
            </div>

            {/* Alternative Roles */}
            {ai.alternative_roles?.length > 0 && (
              <div style={{ ...s.card, animation: "slideRight 0.5s 0.3s ease both" }} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(0,0,0,0.11), 0 28px 60px rgba(168,85,247,0.20)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(99,102,241,0.12)";e.currentTarget.style.transform="none"}}>
                <SectionHeader icon={Compass} iconColor="#a855f7" iconBg="rgba(168,85,247,0.12)" label="Alternative Roles" subtitle="Based on your skill profile" />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {ai.alternative_roles.slice(0, 4).map((role, i) => (
                    <AltRoleRow key={i} role={role} delay={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Market Insights */}
            {ai.market_insights && (
              <div style={{ ...s.card, ...s.marketCard, animation: "slideRight 0.5s 0.37s ease both" }} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(0,0,0,0.11), 0 28px 60px rgba(99,102,241,0.20)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 0 rgba(255,255,255,1) inset, 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(99,102,241,0.12)";e.currentTarget.style.transform="none"}}>
                <SectionHeader icon={TrendingUp} iconColor="#6366f1" iconBg="rgba(99,102,241,0.15)" label="Market Insights" subtitle="Current industry snapshot" />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <InsightRow label="Demand" value={ai.market_insights.demand} icon="📊" />
                  <InsightRow label="Salary Range" value={ai.market_insights.salary_range} icon="💰" />
                  {ai.market_insights.top_companies?.length > 0 && (
                    <InsightRow label="Top Employers" value={ai.market_insights.top_companies.join(", ")} icon="🏢" />
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── LEARNING ROADMAP ── */}
        {ai.personalized_roadmap?.length > 0 && (
          <div style={{ ...s.roadmapSection, animation: "fadeUp 0.6s 0.35s ease both" }}>
            <div style={s.roadmapHeader}>
              <div>
                <div style={s.roadmapEyebrow}>
                  <Star size={11} color="#6366f1" />
                  Personalized Learning Path
                </div>
                <h2 style={s.roadmapTitle}>Your Roadmap</h2>
              </div>
              <span style={s.roadmapCount}>{ai.personalized_roadmap.length} phases</span>
            </div>

            <div style={s.roadmapGrid}>
              {ai.personalized_roadmap.map((phase, i) => (
                <RoadmapCard key={i} phase={phase} index={i} total={ai.personalized_roadmap.length} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
────────────────────────────────────────────── */

function StatCard({ label, value, suffix, Icon, grad, light, text, delay }) {
  const [on, setOn] = useState(false);
  return (
    <div
      onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      style={{
        background: "white", borderRadius: 20, padding: "32px 26px",
        boxShadow: on ? "0 2px 0 rgba(255,255,255,1) inset, 0 12px 32px rgba(0,0,0,0.12), 0 24px 56px rgba(99,102,241,0.2)" : "0 2px 0 rgba(255,255,255,1) inset, 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(99,102,241,0.10)",
        border: "none",
        transition: "all 0.25s ease",
        transform: on ? "translateY(-4px)" : "none",
        animation: `fadeUp 0.5s ${0.1 + delay}s ease both`,
        cursor: "default", overflow: "hidden", position: "relative",
      }}
    >
      {/* top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: grad, opacity: on ? 1 : 0.5, transition: "opacity 0.25s" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: light, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={text} strokeWidth={2} />
        </div>
        <ArrowUpRight size={13} color={on ? text : "#cbd5e1"} style={{ transition: "color 0.2s, transform 0.2s", transform: on ? "translate(2px,-2px)" : "none" }} />
      </div>

      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 42, fontWeight: 800, color: "#0f0c29", lineHeight: 1, marginBottom: 8 }}>
        <AnimatedNumber target={value} suffix={suffix} />
      </div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13.5, color: "#6b7280", fontWeight: 600, letterSpacing: "0.01em" }}>{label}</div>
    </div>
  );
}

function StrengthTag({ item, delay }) {
  const [on, setOn] = useState(false);
  return (
    <span
      onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      style={{
        background: on ? "linear-gradient(135deg,#6366f1,#a855f7)" : "rgba(99,102,241,0.07)",
        color: on ? "white" : "#4338ca",
        border: `1px solid ${on ? "transparent" : "rgba(99,102,241,0.15)"}`,
        borderRadius: 10, padding: "10px 16px", fontSize: 14.5, fontWeight: 500, fontFamily: "'Plus Jakarta Sans',sans-serif",
        cursor: "default", transition: "all 0.22s ease",
        animation: `scaleIn 0.35s ${delay * 0.06}s ease both`,
        display: "inline-flex", alignItems: "center", gap: 6,
        boxShadow: on ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
      }}
    >
      <CheckCircle size={12} color={on ? "rgba(255,255,255,0.8)" : "#6366f1"} />
      {item}
    </span>
  );
}

function WeaknessRow({ item, delay }) {
  const [on, setOn] = useState(false);
  return (
    <div
      onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "18px 20px", borderRadius: 14,
        background: on ? "#fff1f2" : "#fafafa",
        border: `1px solid ${on ? "rgba(239,68,68,0.2)" : "#f1f5f9"}`,
        transition: "all 0.22s ease", cursor: "default",
        animation: `slideLeft 0.4s ${delay * 0.07}s ease both`,
      }}
    >
      <div style={{ width: 28, height: 28, borderRadius: 8, background: on ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
        <AlertTriangle size={13} color="#ef4444" />
      </div>
      <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: on ? "#dc2626" : "#475569", fontWeight: 500, lineHeight: 1.85, transition: "color 0.2s" }}>{item}</span>
    </div>
  );
}

function GapItem({ gap, delay }) {
  const [on, setOn] = useState(false);
  const priColor = gap.priority?.includes("Critical") ? "#ef4444"
                 : gap.priority?.includes("Important") ? "#f59e0b"
                 : "#10b981";
  const priBg    = gap.priority?.includes("Critical") ? "rgba(239,68,68,0.1)"
                 : gap.priority?.includes("Important") ? "rgba(245,158,11,0.1)"
                 : "rgba(16,185,129,0.1)";
  return (
    <div
      onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      style={{
        padding: "18px 20px", borderRadius: 14,
        background: on ? `${priBg}` : "#fafafa",
        border: `1px solid ${on ? priColor + "30" : "#f1f5f9"}`,
        transition: "all 0.22s ease", cursor: "default",
        animation: `fadeUp 0.4s ${delay * 0.08}s ease both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: gap.why ? 6 : 0 }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15.5, fontWeight: 700, color: "#0f0c29" }}>{gap.skill}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {gap.learnIn && <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}><Clock size={10} style={{ marginRight: 3 }} />{gap.learnIn}</span>}
          <span style={{ fontSize: 11, fontWeight: 700, color: priColor, background: priBg, borderRadius: 20, padding: "2px 9px" }}>
            {gap.priority?.replace(/[🔴🟡🟢]\s*/g, "") || "Medium"}
          </span>
        </div>
      </div>
      {gap.why && <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: "#64748b", margin: "7px 0 0 0", lineHeight: 1.85 }}>{gap.why}</p>}
    </div>
  );
}

function SkillRow({ name, priority, index }) {
  const [on, setOn] = useState(false);
  const priColor = priority?.includes("Critical") ? "#ef4444"
                 : priority?.includes("Important") ? "#f59e0b"
                 : "#6366f1";
  return (
    <div
      onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderRadius: 13,
        background: on ? "rgba(99,102,241,0.06)" : "#fafafa",
        border: `1px solid ${on ? "rgba(99,102,241,0.18)" : "#f1f5f9"}`,
        transition: "all 0.2s ease", cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#6366f1", fontFamily: "'Outfit',sans-serif" }}>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: "#1e293b", fontWeight: 500, letterSpacing: "0.01em" }}>{name}</span>
      </div>
      {priority && (
        <span style={{ fontSize: 10.5, fontWeight: 600, color: priColor, background: priColor + "15", borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap" }}>
          {priority.replace(/[🔴🟡🟢]\s*/g, "")}
        </span>
      )}
    </div>
  );
}

function ProjectCard({ project, index }) {
  const [on, setOn] = useState(false);
  const title = typeof project === "string" ? project : project.title;
  const desc  = typeof project === "object" ? project.description : null;
  const stack = typeof project === "object" && Array.isArray(project.stack) ? project.stack : [];
  const diff  = typeof project === "object" ? project.difficulty : null;
  const diffColor = diff === "Advanced" ? "#ef4444" : diff === "Intermediate" ? "#f59e0b" : "#10b981";

  return (
    <div
      onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      style={{
        padding: "18px", borderRadius: 16,
        background: on ? "linear-gradient(135deg,rgba(16,185,129,0.05),rgba(99,102,241,0.04))" : "#fafafa",
        border: `1px solid ${on ? "rgba(16,185,129,0.25)" : "#f1f5f9"}`,
        transition: "all 0.25s ease", cursor: "default",
        transform: on ? "translateX(4px)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: desc ? 8 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: on ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 800, color: "#10b981" }}>{String(index + 1).padStart(2, "0")}</span>
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: "#0f0c29" }}>{title}</span>
        </div>
        {diff && <span style={{ fontSize: 10.5, fontWeight: 700, color: diffColor, background: diffColor + "15", borderRadius: 20, padding: "2px 9px", whiteSpace: "nowrap" }}>{diff}</span>}
      </div>
      {desc && <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: "#64748b", margin: "10px 0 12px 40px", lineHeight: 1.85 }}>{desc}</p>}
      {stack.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 40 }}>
          {stack.slice(0, 4).map((s, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 500, color: "#6366f1", background: "rgba(99,102,241,0.08)", borderRadius: 6, padding: "2px 8px" }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function AltRoleRow({ role, delay }) {
  const [on, setOn] = useState(false);
  const name  = typeof role === "string" ? role : role.role;
  const score = typeof role === "object" ? role.readinessScore : null;
  const reason= typeof role === "object" ? role.reason : null;

  return (
    <div
      onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      style={{
        padding: "18px 20px", borderRadius: 14,
        background: on ? "rgba(168,85,247,0.06)" : "#fafafa",
        border: `1px solid ${on ? "rgba(168,85,247,0.2)" : "#f1f5f9"}`,
        transition: "all 0.22s ease", cursor: "default",
        animation: `fadeUp 0.4s ${delay * 0.08}s ease both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: reason ? 4 : 0 }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: "#0f0c29" }}>{name}</span>
        {score != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 44, height: 5, borderRadius: 10, background: "#f1f5f9", overflow: "hidden" }}>
              <div style={{ width: `${score}%`, height: "100%", background: "linear-gradient(90deg,#6366f1,#a855f7)", animation: "barGrow 1s ease both", borderRadius: 10 }} />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#6366f1" }}>{score}%</span>
          </div>
        )}
      </div>
      {reason && <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13.5, color: "#94a3b8", margin: "6px 0 0 0", lineHeight: 1.8 }}>{reason}</p>}
    </div>
  );
}

function InsightRow({ label, value, icon }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(99,102,241,0.06)" }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: "#374151", fontWeight: 500, lineHeight: 1.8, marginTop: 3 }}>{value}</div>
      </div>
    </div>
  );
}

function RoadmapCard({ phase, index, total }) {
  const [on, setOn] = useState(false);
  const colors = [
    { g: "linear-gradient(135deg,#6366f1,#8b5cf6)", l: "rgba(99,102,241,0.1)", t: "#4338ca" },
    { g: "linear-gradient(135deg,#3b82f6,#06b6d4)", l: "rgba(59,130,246,0.1)",  t: "#1d4ed8" },
    { g: "linear-gradient(135deg,#10b981,#14b8a6)", l: "rgba(16,185,129,0.1)",  t: "#047857" },
    { g: "linear-gradient(135deg,#f59e0b,#f97316)", l: "rgba(245,158,11,0.1)",  t: "#b45309" },
    { g: "linear-gradient(135deg,#a855f7,#ec4899)", l: "rgba(168,85,247,0.1)",  t: "#7e22ce" },
    { g: "linear-gradient(135deg,#ef4444,#f97316)", l: "rgba(239,68,68,0.1)",   t: "#b91c1c" },
  ];
  const c = colors[index % colors.length];

  return (
    <div
      onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      style={{
        background: "white", borderRadius: 20, overflow: "hidden",
        boxShadow: on ? "0 2px 0 rgba(255,255,255,1) inset, 0 12px 32px rgba(0,0,0,0.12), 0 24px 56px rgba(99,102,241,0.2)" : "0 2px 0 rgba(255,255,255,1) inset, 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(99,102,241,0.10)",
        border: "1px solid rgba(255,255,255,0.85)",
        transition: "all 0.28s ease",
        transform: on ? "translateY(-4px)" : "none",
        animation: `fadeUp 0.5s ${0.1 + index * 0.1}s ease both`,
        cursor: "default",
      }}
    >
      {/* color top band */}
      <div style={{ height: 4, background: c.g }} />

      <div style={{ padding: "26px 28px" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: c.l, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "transform 0.2s", transform: on ? "scale(1.08)" : "none" }}>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 800, color: c.t }}>
                {String(index + 1).padStart(2, "0")}
              </span> 
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.t, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Phase {index + 1}</div>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 16, fontWeight: 700, color: "#0f0c29", margin: 0, letterSpacing: "-0.1px" }}>{phase.phase}</h4>
            </div>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 600, color: c.t, background: c.l,
            borderRadius: 20, padding: "4px 11px", whiteSpace: "nowrap",
            border: `1px solid ${c.t}20`,
            transition: "background 0.25s",
            ...(on ? { background: c.g, color: "white" } : {}),
          }}>
            {phase.duration}
          </span>
        </div>

        {/* steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(phase.steps || phase.topics || []).map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <ChevronRight size={13} color={c.t} style={{ flexShrink: 0, marginTop: 2, transition: "transform 0.2s", transform: on ? "translateX(2px)" : "none" }} />
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14.5, color: "#475569", lineHeight: 1.9 }}>{step}</span>
            </div>
          ))}
        </div>

        {/* resources */}
        {phase.resources?.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {phase.resources.map((r, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 500, color: c.t, background: c.l, borderRadius: 6, padding: "3px 9px" }}>{r}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ padding: "20px 0", textAlign: "center", color: "#cbd5e1", fontSize: 13, fontStyle: "italic" }}>
      {text}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
────────────────────────────────────────────── */
const s = {
  wrapper: {
    display: "flex", minHeight: "100vh",
    background: "linear-gradient(160deg,#e8e6f8 0%,#e4dffc 40%,#ede8ff 70%,#f0e6ff 100%)",
    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
  },

  main: {
    marginLeft: 260, padding: "40px 48px 90px", flex: 1,
    minWidth: 0, boxSizing: "border-box",
  },

  /* Header */
  pageHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    marginBottom: 32,
  },
  breadcrumb: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "'Plus Jakarta Sans',sans-serif",
    letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8,
  },
  pageTitle: {
    fontFamily: "'Outfit',sans-serif", fontSize: 32, fontWeight: 800,
    color: "#0f0c29", margin: 0, letterSpacing: "-0.3px",
  },
  headerRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  aiBadge: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)",
    borderRadius: 20, padding: "5px 13px",
    fontSize: 11.5, fontWeight: 600, color: "#6366f1", letterSpacing: "0.04em",
  },
  roleBadge: {
    display: "flex", alignItems: "center", gap: 6,
    background: "white", border: "1px solid rgba(99,102,241,0.12)",
    borderRadius: 20, padding: "5px 13px",
    fontSize: 12, fontWeight: 600, color: "#374151",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  roleDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "inline-block",
    animation: "pulseDot 2s infinite",
  },

  /* Hero */
  hero: {
    background: "white",
    borderRadius: 24, padding: "48px 52px",
    marginBottom: 24,
    boxShadow: "0 2px 0 rgba(255,255,255,1) inset, 0 1px 3px rgba(0,0,0,0.07), 0 10px 32px rgba(0,0,0,0.09), 0 24px 64px rgba(99,102,241,0.15), 0 0 0 1px rgba(255,255,255,0.9)",
    display: "flex", alignItems: "center", gap: 48,
    position: "relative", overflow: "hidden",
    minHeight: 220,
  },
  heroContent: { flex: 1, minWidth: 0, zIndex: 1, position: "relative" },
  heroTopLine: { display: "flex", alignItems: "center", gap: 12, marginBottom: 24 },
  statusPill: {
    display: "inline-flex", alignItems: "center", gap: 7,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontSize: 13, fontWeight: 700, borderRadius: 20, padding: "7px 15px",
    letterSpacing: "0.01em",
  },
  updatedText: {
    display: "flex", alignItems: "center",
    fontSize: 11.5, color: "#cbd5e1", fontWeight: 500,
  },
  heroTitle: {
    fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800,
    color: "#0f0c29", margin: "0 0 6px 0", lineHeight: 1.35,
  },
  heroScoreText: {
    background: "linear-gradient(135deg,#6366f1,#a855f7)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    fontSize: 48, lineHeight: 1.1, display: "block", marginBottom: 16,
  },
  heroSub: {
    fontSize: 15.5, color: "#64748b", lineHeight: 1.9,
    margin: "0 0 26px 0", maxWidth: "none",
  },
  heroPillRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  heroPill: {
    display: "inline-flex", alignItems: "center", gap: 7,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontSize: 13, fontWeight: 600, color: "#6366f1",
    background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 20, padding: "7px 16px",
  },
  heroRing: { position: "relative", zIndex: 1, flexShrink: 0 },
  ringGlow: {
    position: "absolute", inset: -20,
    background: "radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)",
    pointerEvents: "none",
  },
  heroDeco1: {
    position: "absolute", top: -60, right: -40, width: 260, height: 260,
    borderRadius: "50%",
    background: "radial-gradient(circle,rgba(168,85,247,0.06),transparent 70%)",
    pointerEvents: "none",
  },
  heroDeco2: {
    position: "absolute", bottom: -40, left: "30%", width: 200, height: 200,
    borderRadius: "50%",
    background: "radial-gradient(circle,rgba(99,102,241,0.05),transparent 70%)",
    pointerEvents: "none",
  },

  /* Stats */
  statGrid: {
    display: "grid", gridTemplateColumns: "repeat(4,1fr)",
    gap: 20, marginBottom: 32,
  },

  /* Content */
  contentGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 28, marginBottom: 40,
  },
  leftCol:  { display: "flex", flexDirection: "column", gap: 24 },
  rightCol: { display: "flex", flexDirection: "column", gap: 24 },

  /* Card */
  card: {
    background: "white", borderRadius: 22, padding: "38px 36px",
    boxShadow: "0 2px 0 rgba(255,255,255,1) inset, 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 48px rgba(99,102,241,0.12)",
    border: "1px solid rgba(255,255,255,0.85)",
    transition: "box-shadow 0.3s ease, transform 0.3s ease",
  },

  /* Summary */
  summaryText: { fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15.5, color: "#475569", lineHeight: 1.9, margin: "0 0 28px 0", letterSpacing: "0.01em" },
  adviceBox: {
    display: "flex", gap: 10, alignItems: "flex-start",
    background: "linear-gradient(135deg,rgba(99,102,241,0.06),rgba(168,85,247,0.04))",
    border: "1px solid rgba(99,102,241,0.12)",
    borderRadius: 14, padding: "14px 16px",
  },
  adviceText: { fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: "#4338ca", lineHeight: 1.9, margin: 0, fontWeight: 500 },

  /* Strength grid */
  strengthGrid: { display: "flex", flexWrap: "wrap", gap: 10 },

  /* Gap list */
  gapList: { display: "flex", flexDirection: "column", gap: 14 },

  /* Market card */
  marketCard: { background: "linear-gradient(135deg,rgba(99,102,241,0.04),rgba(168,85,247,0.02))" },

  /* Roadmap */
  roadmapSection: { },
  roadmapHeader: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    marginBottom: 32,
  },
  roadmapEyebrow: {
    display: "flex", alignItems: "center", gap: 6,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontSize: 11, fontWeight: 700, color: "#6366f1",
    letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6,
  },
  roadmapTitle: {
    fontFamily: "'Outfit',sans-serif", fontSize: 24, fontWeight: 800,
    color: "#0f0c29", margin: 0, letterSpacing: "-0.2px",
  },
  roadmapCount: {
    fontSize: 12, fontWeight: 600, color: "#94a3b8",
    background: "white", border: "1px solid rgba(99,102,241,0.1)",
    borderRadius: 20, padding: "5px 14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  roadmapGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
    gap: 22,
  },
};