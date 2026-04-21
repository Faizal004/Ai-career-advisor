import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Upload, FileText, Sparkles, CheckCircle2,
  Brain, Target, TrendingUp, ArrowRight, X,
  Shield, Zap, BarChart3, Users, Award,
} from "lucide-react";

const KEYFRAMES = `
@keyframes fadeUp {
  from { opacity:0; transform:translateY(22px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes floatOrb {
  0%,100% { transform:translateY(0) scale(1); }
  50%      { transform:translateY(-22px) scale(1.05); }
}
@keyframes pulse-dot {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.3; transform:scale(0.55); }
}
@keyframes tab-slide {
  from { opacity:0; transform:translateY(5px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes file-pop {
  0%   { opacity:0; transform:scale(0.92) translateY(6px); }
  80%  { transform:scale(1.01); }
  100% { opacity:1; transform:scale(1); }
}
@keyframes loader-spin {
  to { transform:rotate(360deg); }
}
`;

function useInjectKF() {
  useEffect(() => {
    if (document.getElementById("home-kf")) return;
    const el = document.createElement("style");
    el.id = "home-kf";
    el.textContent = KEYFRAMES;
    document.head.appendChild(el);
  }, []);
}

const STATS = [
  { icon: Users,     value: "12K+", label: "Students Helped" },
  { icon: BarChart3, value: "94%",  label: "Success Rate"    },
  { icon: Award,     value: "4.9★", label: "Avg. Rating"     },
];

const BULLETS = [
  { icon: Brain,      text: "AI-powered resume analysis"    },
  { icon: Target,     text: "Personalized learning roadmap" },
  { icon: TrendingUp, text: "Real-time skill gap detection" },
  { icon: Shield,     text: "Secure & private processing"   },
];

export default function Home() {
  useInjectKF();
  const { user, getToken } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]             = useState("upload");
  const [file, setFile]             = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [focusField, setFocusField] = useState(null);
  const [btnHover, setBtnHover]     = useState(false);
  const fileRef = useRef();

  const [formData, setFormData] = useState({ skills: "", education: "", goal: "" });

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
  };

  const handleSubmit = async () => {
    try {
      if (!user) return alert("Login required");
      if (mode === "upload" && !file) return alert("Please upload a resume");
      if (mode === "manual" && (!formData.skills || !formData.education || !formData.goal))
        return alert("Please fill all fields");
      setLoading(true);
      const token = await getToken();
      let res;
      if (mode === "upload") {
        const fd = new FormData();
        fd.append("resume", file);
        res = await axios.post("https://ai-career-advisor-a0f5.onrender.com/api/upload-resume", fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post("https://ai-career-advisor-a0f5.onrender.com/api/manual-input", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate("/dashboard", { state: res.data });
    } catch (err) {
      console.error(err); alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrapper}>
      <Sidebar />

      {/* subtle dot grid */}
      <div style={s.gridPattern} />

      {/* soft orbs */}
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />

      <div style={{ ...s.main, opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}>

        {/* ══ HEADER ══ */}
        <div style={{ ...s.header, animation: mounted ? "fadeUp 0.5s ease both" : "none" }}>

          <div style={s.eyebrow}>
            <span style={s.eyebrowDot} />
            AI Career Advisor
          </div>

          <h1 style={s.title}>
            Unlock Your{" "}
            <span style={s.titleAccent}>Career Potential</span>
          </h1>

          <p style={s.subtitle}>
            Get hyper-personalized career guidance, skill gap analysis,
            and a step-by-step learning roadmap — powered by AI.
          </p>

          <div style={s.statsRow}>
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <StatChip key={i} icon={<Icon size={13} color="#6366f1" />} value={value} label={label} delay={i * 0.08} />
            ))}
          </div>
        </div>

        {/* ══ CARD ══ */}
        <div style={{ ...s.cardWrap, animation: mounted ? "fadeUp 0.55s 0.1s ease both" : "none" }}>

          <div style={s.cardLabel}>
            <Zap size={12} color="#6366f1" />
            Start your analysis
          </div>

          <div style={s.card}>

            {/* tabs */}
            <div style={s.tabRow}>
              {[
                { id: "upload", icon: <Upload size={13} />,   label: "Upload Resume" },
                { id: "manual", icon: <FileText size={13} />, label: "Enter Details" },
              ].map(({ id, icon, label }) => (
                <TabBtn key={id} active={mode === id} icon={icon} label={label} onClick={() => setMode(id)} />
              ))}
            </div>

            {/* upload */}
            {mode === "upload" && (
              <div key="upload" style={{ animation: "tab-slide 0.28s ease both" }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                {!file ? (
                  <div style={{ ...s.dropzone, ...(dragging ? s.dropzoneActive : {}) }}
                    onClick={() => fileRef.current.click()}
                  >
                    <div style={s.dropIconWrap}>
                      <Upload size={26} color="#6366f1" strokeWidth={1.5} />
                    </div>
                    <p style={s.dropTitle}>Drop your resume here</p>
                    <p style={s.dropSub}>or <span style={s.dropLink}>browse files</span> · PDF only</p>
                    <input ref={fileRef} type="file" accept=".pdf"
                      onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
                  </div>
                ) : (
                  <div style={{ animation: "file-pop 0.32s ease both" }}>
                    <div style={s.filePreview}>
                      <div style={s.fileIconWrap}>
                        <CheckCircle2 size={19} color="#10b981" />
                      </div>
                      <div style={s.fileInfo}>
                        <p style={s.fileName}>{file.name}</p>
                        <p style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB · Ready to analyze</p>
                      </div>
                      <button style={s.removeBtn} onClick={() => setFile(null)}>
                        <X size={13} color="#94a3b8" />
                      </button>
                    </div>
                    <p style={s.changeFile} onClick={() => fileRef.current.click()}>Change file</p>
                    <input ref={fileRef} type="file" accept=".pdf"
                      onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
                  </div>
                )}
              </div>
            )}

            {/* manual */}
            {mode === "manual" && (
              <div key="manual" style={{ animation: "tab-slide 0.28s ease both" }}>
                {[
                  { name: "skills",    label: "Your Skills",  placeholder: "e.g. React, Node.js, Python, SQL",     tag: "input"    },
                  { name: "education", label: "Education",    placeholder: "e.g. B.Tech Computer Science 2025",     tag: "input"    },
                  { name: "goal",      label: "Career Goal",  placeholder: "e.g. Become a Full Stack Developer...", tag: "textarea" },
                ].map(({ name, label, placeholder, tag: Tag }) => (
                  <div key={name} style={s.fieldWrap}>
                    <label style={s.fieldLabel}>{label}</label>
                    <Tag name={name} placeholder={placeholder} onChange={handleChange}
                      onFocus={() => setFocusField(name)} onBlur={() => setFocusField(null)}
                      rows={Tag === "textarea" ? 3 : undefined}
                      style={{ ...s.input, ...(Tag === "textarea" ? s.textarea : {}), ...(focusField === name ? s.inputFocus : {}) }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* submit */}
            <button onClick={handleSubmit} disabled={loading}
              onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}
              style={{ ...s.btn, ...(btnHover && !loading ? s.btnHover : {}), ...(loading ? s.btnDisabled : {}) }}
            >
              {loading ? (
                <span style={s.loaderRow}><span style={s.loaderRing} />Analyzing your profile…</span>
              ) : (
                <span style={s.btnInner}>
                  <Sparkles size={15} />
                  Get Career Analysis
                  <ArrowRight size={14} style={{ transition: "transform 0.2s", transform: btnHover ? "translateX(4px)" : "none" }} />
                </span>
              )}
            </button>

            <p style={s.disclaimer}>
              <Shield size={10} style={{ verticalAlign: "middle", marginRight: 4 }} />
              Secure &amp; private · Data never stored permanently
            </p>
          </div>
        </div>

        {/* ══ WHAT YOU'LL GET ══ */}
        <div style={{ ...s.featuresSection, animation: mounted ? "fadeUp 0.6s 0.2s ease both" : "none" }}>
          <p style={s.featuresHeading}>What you'll get</p>
          <div style={s.featuresRow}>
            {BULLETS.map(({ icon: Icon, text }, i) => (
              <FeatureChip key={i} icon={<Icon size={13} color="#6366f1" />} text={text} delay={i * 0.06} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatChip({ icon, value, label, delay }) {
  const [on, setOn] = useState(false);
  return (
    <div onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: on ? "rgba(99,102,241,0.07)" : "white",
        border: `1px solid ${on ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.15)"}`,
        borderRadius: "30px", padding: "8px 16px",
        transition: "all 0.2s ease", cursor: "default",
        boxShadow: on ? "0 4px 16px rgba(99,102,241,0.14)" : "0 1px 4px rgba(99,102,241,0.06)",
        animation: `fadeUp 0.45s ${0.25 + delay}s ease both`,
      }}
    >
      {icon}
      <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "14px", fontWeight: "700", color: "#1e1b4b" }}>{value}</span>
      <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>{label}</span>
    </div>
  );
}

function FeatureChip({ icon, text, delay }) {
  const [on, setOn] = useState(false);
  return (
    <div onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: on ? "rgba(99,102,241,0.07)" : "white",
        border: `1px solid ${on ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.15)"}`,
        borderRadius: "30px", padding: "8px 16px",
        transition: "all 0.2s ease", cursor: "default",
        boxShadow: on ? "0 4px 14px rgba(99,102,241,0.12)" : "0 1px 4px rgba(99,102,241,0.06)",
        animation: `fadeUp 0.45s ${0.3 + delay}s ease both`,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: 7,
        background: on ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "background 0.2s",
      }}>
        {icon}
      </div>
      <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{text}</span>
    </div>
  );
}

function TabBtn({ active, icon, label, onClick }) {
  const [on, setOn] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      style={{ ...s.tab, ...(active ? s.tabActive : on ? s.tabHover : {}) }}
    >
      {icon}{label}
    </button>
  );
}

/* ── Styles ── */
const s = {
  wrapper: {
    display: "flex", minHeight: "100vh",
    /* pure white base with very faint violet tint at edges */
    background: "linear-gradient(135deg, #ffffff 0%, #f5f3ff 40%, #ede9fe 70%, #f0f9ff 100%)",
    fontFamily: "'DM Sans','Inter',sans-serif",
    position: "relative", overflow: "hidden",
  },

  /* subtle dot grid — barely visible on white */
  gridPattern: {
    position: "fixed", inset: 0, pointerEvents: "none",
    backgroundImage: "radial-gradient(rgba(99,102,241,0.08) 1px, transparent 1px)",
    backgroundSize: "30px 30px",
    zIndex: 0,
  },

  /* very soft orbs — same hue as sidebar, very low opacity */
  orb1: {
    position: "fixed", top: "-120px", right: "6%",
    width: "520px", height: "520px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)",
    pointerEvents: "none", zIndex: 0,
    animation: "floatOrb 9s ease-in-out infinite",
  },
  orb2: {
    position: "fixed", bottom: "-80px", left: "28%",
    width: "420px", height: "420px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 65%)",
    pointerEvents: "none", zIndex: 0,
    animation: "floatOrb 11s 1.5s ease-in-out infinite",
  },
  orb3: {
    position: "fixed", top: "30%", right: "12%",
    width: "300px", height: "300px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 65%)",
    pointerEvents: "none", zIndex: 0,
    animation: "floatOrb 13s 3s ease-in-out infinite",
  },

  main: {
    marginLeft: "260px", flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "48px", boxSizing: "border-box", minHeight: "100vh",
    gap: "28px", position: "relative", zIndex: 1,
  },

  /* HEADER */
  header: {
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", maxWidth: "640px", width: "100%",
  },

  eyebrow: {
    display: "inline-flex", alignItems: "center", gap: "7px",
    fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.12em",
    textTransform: "uppercase", color: "#6366f1",
    /* matches sidebar's logoIcon gradient tint */
    background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.08))",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "20px", padding: "5px 14px",
    marginBottom: "18px", width: "fit-content",
  },
  eyebrowDot: {
    width: "6px", height: "6px", borderRadius: "50%",
    /* sidebar accent gradient as dot */
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    display: "inline-block",
    animation: "pulse-dot 1.8s ease infinite",
  },

  title: {
    fontFamily: "'Poppins',sans-serif",
    fontSize: "44px", fontWeight: "700",
    /* sidebar's deep navy — same as logoText */
    color: "#0f0c29",
    lineHeight: 1.15, letterSpacing: "-1px", margin: "0 0 14px 0",
  },
  titleAccent: {
    /* exact gradient from sidebar logo */
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },

  subtitle: {
    fontSize: "15px", color: "#64748b",
    lineHeight: 1.75, margin: "0 0 24px 0", maxWidth: "480px",
  },

  statsRow: {
    display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center",
  },

  /* CARD WRAP */
  cardWrap: {
    display: "flex", flexDirection: "column", alignItems: "flex-start",
    gap: "8px", width: "100%", maxWidth: "580px",
  },
  cardLabel: {
    display: "flex", alignItems: "center", gap: "6px",
    fontSize: "10.5px", fontWeight: "700", color: "#6366f1",
    letterSpacing: "0.1em", textTransform: "uppercase", paddingLeft: "4px",
  },

  /* card — white with sidebar-tinted shadow */
  card: {
    width: "100%", background: "white",
    borderRadius: "24px", padding: "28px 30px",
    /* shadow uses the sidebar's indigo hue */
    boxShadow: "0 4px 40px rgba(99,102,241,0.12), 0 0 0 1px rgba(99,102,241,0.07)",
    boxSizing: "border-box",
  },

  /* tabs */
  tabRow: {
    display: "flex", gap: "4px",
    background: "#f1f5f9", borderRadius: "12px",
    padding: "4px", marginBottom: "22px",
    width: "fit-content",
  },
  tab: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "6px", padding: "8px 18px",
    border: "none", borderRadius: "9px",
    fontSize: "13px", fontWeight: "500", color: "#64748b",
    cursor: "pointer", background: "transparent", transition: "all 0.2s ease",
    fontFamily: "'DM Sans','Inter',sans-serif",
  },
  /* active tab uses sidebar gradient */
  tabActive: {
    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
    color: "white", fontWeight: "600",
    boxShadow: "0 2px 10px rgba(99,102,241,0.35)",
  },
  tabHover: { background: "rgba(99,102,241,0.08)", color: "#4f46e5" },

  /* dropzone */
  dropzone: {
    border: "1.5px dashed rgba(99,102,241,0.3)", borderRadius: "16px",
    padding: "44px 24px", textAlign: "center",
    cursor: "pointer",
    background: "linear-gradient(135deg, rgba(99,102,241,0.03), rgba(168,85,247,0.02))",
    transition: "all 0.22s ease", marginBottom: "20px",
    minHeight: "160px", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
  dropzoneActive: {
    borderColor: "#6366f1",
    background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))",
    transform: "scale(1.01)", boxShadow: "0 0 0 4px rgba(99,102,241,0.1)",
  },
  dropIconWrap: {
    width: "56px", height: "56px", borderRadius: "16px",
    /* sidebar logoIcon gradient */
    background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.1))",
    border: "1px solid rgba(99,102,241,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px",
  },
  dropTitle: { fontSize: "15px", fontWeight: "600", color: "#1e1b4b", margin: "0 0 6px" },
  dropSub:   { fontSize: "13px", color: "#94a3b8", margin: 0 },
  dropLink:  { color: "#6366f1", fontWeight: "600", textDecoration: "underline", cursor: "pointer" },

  /* file preview */
  filePreview: {
    display: "flex", alignItems: "center", gap: "12px",
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: "12px", padding: "13px 15px", marginBottom: "10px",
  },
  fileIconWrap: {
    width: "36px", height: "36px", borderRadius: "10px", background: "#dcfce7",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  fileInfo:  { flex: 1, minWidth: 0 },
  fileName:  { fontSize: "13px", fontWeight: "600", color: "#14532d", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  fileSize:  { fontSize: "11px", color: "#22c55e", margin: "2px 0 0" },
  removeBtn: { background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center" },
  changeFile:{ fontSize: "12px", color: "#6366f1", fontWeight: "600", textAlign: "center", cursor: "pointer", marginBottom: 0, textDecoration: "underline" },

  /* manual inputs */
  fieldWrap:  { marginBottom: "14px" },
  fieldLabel: {
    display: "block", fontSize: "11px", fontWeight: "700",
    color: "#6366f1", marginBottom: "6px",
    letterSpacing: "0.07em", textTransform: "uppercase",
  },
  input: {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #e2e8f0", borderRadius: "10px",
    fontSize: "13.5px", color: "#1e1b4b", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    fontFamily: "'DM Sans','Inter',sans-serif",
    background: "#fafbff", boxSizing: "border-box",
  },
  textarea:   { resize: "vertical", minHeight: "78px", lineHeight: 1.6 },
  inputFocus: {
    borderColor: "#6366f1",
    boxShadow: "0 0 0 3px rgba(99,102,241,0.12)",
    background: "white",
  },

  /* button — exact sidebar gradient */
  btn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "white", border: "none", borderRadius: "12px",
    cursor: "pointer", fontSize: "14px", fontWeight: "600",
    transition: "all 0.25s ease",
    boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
    fontFamily: "'DM Sans','Inter',sans-serif",
  },
  btnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 32px rgba(99,102,241,0.5)",
    background: "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed", transform: "none" },
  btnInner:    { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  loaderRow:   { display: "flex", alignItems: "center", justifyContent: "center", gap: "9px" },
  loaderRing:  {
    width: "16px", height: "16px", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
    display: "inline-block", animation: "loader-spin 0.7s linear infinite",
  },

  disclaimer: {
    fontSize: "11px", color: "#94a3b8",
    textAlign: "center", marginTop: "12px", marginBottom: 0,
    display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
  },

  /* features */
  featuresSection: {
    width: "100%", maxWidth: "700px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
  },
  featuresHeading: {
    fontSize: "10px", fontWeight: "700", color: "#94a3b8",
    letterSpacing: "0.14em", textTransform: "uppercase", margin: 0,
  },
  featuresRow: {
    display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center",
  },
};