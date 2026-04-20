import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, BrainCircuit, Sparkles, Eye, EyeOff } from "lucide-react";

/* ── inject fonts + keyframes ── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@700;800;900&display=swap');

@keyframes floatOrb {
  0%,100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-28px) scale(1.06); }
}
@keyframes fadeUp {
  from { opacity:0; transform:translateY(18px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes pulseDot {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.4; transform:scale(0.55); }
}
@keyframes spin {
  to { transform:rotate(360deg); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
@keyframes gridFade {
  from { opacity:0; }
  to   { opacity:1; }
}

/* input placeholder */
.ca-input::placeholder { color: #c4b5fd; }
.ca-input:focus { outline:none; }
`;

function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById("login-styles")) return;
    const el = document.createElement("style");
    el.id = "login-styles";
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);
}

export default function Login() {
  useInjectStyles();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [btnHover, setBtnHover] = useState(false);
  const [gHover, setGHover]     = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/home");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={s.wrapper}>

      {/* ── dot grid ── */}
      <div style={s.grid} />

      {/* ── ambient orbs ── */}
      <div style={{ ...s.orb, ...s.orb1 }} />
      <div style={{ ...s.orb, ...s.orb2 }} />
      <div style={{ ...s.orb, ...s.orb3 }} />

      {/* ── two-column layout ── */}
      <div style={{ ...s.layout, opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}>

        {/* ── LEFT PANEL ── */}
        <div style={s.leftPanel}>

          {/* logo */}
          <div style={{ ...s.logo, animation: "fadeUp 0.4s ease both" }}>
            <div style={s.logoIcon}>
              <BrainCircuit size={22} color="white" strokeWidth={1.6} />
              <div style={s.logoIconGlow} />
            </div>
            <div>
              <div style={s.logoName}>Career AI</div>
              <div style={s.logoPowered}>
                <span style={s.logoPoweredDot} />
                Powered by AI
              </div>
            </div>
          </div>

          {/* hero text */}
          <div style={{ animation: "fadeUp 0.45s 0.08s ease both" }}>
            <h1 style={s.heroTitle}>
              Unlock your<br />
              <span style={s.heroAccent}>career potential</span>
            </h1>
            <p style={s.heroSub}>
              Get a personalized AI-powered career analysis,
              skill gap breakdown, and step-by-step roadmap
              tailored to you.
            </p>
          </div>

          {/* feature pills */}
          <div style={{ ...s.featurePills, animation: "fadeUp 0.5s 0.16s ease both" }}>
            {[
              { icon: "🧠", text: "AI Resume Analysis" },
              { icon: "🎯", text: "Skill Gap Detection" },
              { icon: "🗺️", text: "Personalized Roadmap" },
              { icon: "🔒", text: "Private & Secure" },
            ].map(({ icon, text }, i) => (
              <div key={i} style={s.featurePill}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span style={s.featurePillText}>{text}</span>
              </div>
            ))}
          </div>

          {/* stats */}
          <div style={{ ...s.statsRow, animation: "fadeUp 0.5s 0.22s ease both" }}>
            {[
              { value: "12K+", label: "Students" },
              { value: "94%",  label: "Success Rate" },
              { value: "4.9★", label: "Rating" },
            ].map(({ value, label }, i) => (
              <div key={i} style={s.stat}>
                <div style={s.statValue}>{value}</div>
                <div style={s.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL — CARD ── */}
        <div style={{ animation: "fadeUp 0.5s 0.1s ease both" }}>
          <div style={s.card}>

            {/* card header */}
            <div style={s.cardHeader}>
              <div style={s.cardEyebrow}>
                <Sparkles size={11} color="#6366f1" style={{ animation: "spin 4s linear infinite" }} />
                Welcome back
              </div>
              <h2 style={s.cardTitle}>Sign in to your account</h2>
              <p style={s.cardSub}>Enter your credentials to continue</p>
            </div>

            {/* Google button */}
            <button
              onClick={handleGoogleLogin}
              onMouseEnter={() => setGHover(true)}
              onMouseLeave={() => setGHover(false)}
              style={{
                ...s.googleBtn,
                background: gHover ? "#f5f3ff" : "white",
                borderColor: gHover ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.15)",
                boxShadow: gHover ? "0 4px 16px rgba(99,102,241,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
                transform: gHover ? "translateY(-1px)" : "none",
              }}
            >
              {/* Google SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* divider */}
            <div style={s.divider}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>or sign in with email</span>
              <div style={s.dividerLine} />
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* email */}
              <div style={s.fieldWrap}>
                <label style={s.label}>Email address</label>
                <div style={{
                  ...s.inputWrap,
                  borderColor: focusedField === "email" ? "#6366f1" : "rgba(99,102,241,0.2)",
                  boxShadow: focusedField === "email" ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
                  background: focusedField === "email" ? "white" : "#fafaff",
                }}>
                  <Mail size={15} color={focusedField === "email" ? "#6366f1" : "#a78bfa"} style={{ flexShrink: 0, transition: "color 0.2s" }} />
                  <input
                    className="ca-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={s.input}
                  />
                </div>
              </div>

              {/* password */}
              <div style={s.fieldWrap}>
                <label style={s.label}>Password</label>
                <div style={{
                  ...s.inputWrap,
                  borderColor: focusedField === "password" ? "#6366f1" : "rgba(99,102,241,0.2)",
                  boxShadow: focusedField === "password" ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
                  background: focusedField === "password" ? "white" : "#fafaff",
                }}>
                  <Lock size={15} color={focusedField === "password" ? "#6366f1" : "#a78bfa"} style={{ flexShrink: 0, transition: "color 0.2s" }} />
                  <input
                    className="ca-input"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={s.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#a78bfa", display: "flex", alignItems: "center" }}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* forgot password */}
              <div style={{ textAlign: "right", marginTop: -8 }}>
                <span style={{ fontSize: 12.5, color: "#6366f1", fontWeight: 600, cursor: "pointer" }}>
                  Forgot password?
                </span>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                style={{
                  ...s.submitBtn,
                  ...(btnHover && !loading ? s.submitBtnHover : {}),
                  ...(loading ? { opacity: 0.7, cursor: "not-allowed", transform: "none" } : {}),
                }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    Signing in…
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    Sign in
                    <ArrowRight size={16} style={{ transition: "transform 0.2s", transform: btnHover ? "translateX(4px)" : "none" }} />
                  </span>
                )}
              </button>
            </form>

            {/* footer */}
            <p style={s.footer}>
              Don't have an account?{" "}
              <Link to="/register" style={s.footerLink}>Create one free →</Link>
            </p>

            {/* security note */}
            <div style={s.securityNote}>
              <span style={{ fontSize: 14 }}>🔒</span>
              <span>Your data is encrypted and never shared</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── styles ── */
const s = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #e8e6f8 0%, #e4dffc 40%, #ede8ff 70%, #f0e6ff 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    position: "relative", overflow: "hidden",
    padding: "40px 24px",
    boxSizing: "border-box",
  },

  grid: {
    position: "fixed", inset: 0, pointerEvents: "none",
    backgroundImage: "radial-gradient(rgba(99,102,241,0.1) 1px, transparent 1px)",
    backgroundSize: "30px 30px",
    zIndex: 0,
  },

  orb: {
    position: "fixed", borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },
  orb1: {
    width: 480, height: 480, top: -120, left: -80,
    background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
    animation: "floatOrb 9s ease-in-out infinite",
  },
  orb2: {
    width: 380, height: 380, bottom: -80, right: -60,
    background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
    animation: "floatOrb 11s 2s ease-in-out infinite",
  },
  orb3: {
    width: 260, height: 260, top: "40%", right: "20%",
    background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
    animation: "floatOrb 13s 4s ease-in-out infinite",
  },

  /* ── LAYOUT ── */
  layout: {
    position: "relative", zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 80,
    width: "100%",
    maxWidth: 1040,
    alignItems: "center",
  },

  /* ── LEFT PANEL ── */
  leftPanel: {
    display: "flex", flexDirection: "column", gap: 32,
  },

  logo: {
    display: "flex", alignItems: "center", gap: 14,
  },
  logoIcon: {
    width: 48, height: 48, borderRadius: 15,
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", flexShrink: 0,
    boxShadow: "0 6px 20px rgba(99,102,241,0.45)",
  },
  logoIconGlow: {
    position: "absolute", inset: 0, borderRadius: 15,
    background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
  },
  logoName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20, fontWeight: 800, color: "#0f0c29", letterSpacing: "-0.3px",
  },
  logoPowered: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 11.5, color: "#a78bfa", fontWeight: 600, marginTop: 2,
    letterSpacing: "0.03em",
  },
  logoPoweredDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    display: "inline-block", animation: "pulseDot 2s infinite",
  },

  heroTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 44, fontWeight: 900, color: "#0f0c29",
    lineHeight: 1.1, letterSpacing: "-1.5px", margin: "0 0 18px 0",
  },
  heroAccent: {
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: 16, color: "#64748b", lineHeight: 1.85,
    margin: 0, maxWidth: 400,
  },

  featurePills: {
    display: "flex", flexDirection: "column", gap: 10,
  },
  featurePill: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(99,102,241,0.14)",
    borderRadius: 12, padding: "10px 16px",
    backdropFilter: "blur(8px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  featurePillText: {
    fontSize: 14, fontWeight: 600, color: "#374151",
  },

  statsRow: {
    display: "flex", gap: 28,
  },
  stat: {
    display: "flex", flexDirection: "column", gap: 2,
  },
  statValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 800, color: "#0f0c29", lineHeight: 1,
  },
  statLabel: {
    fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.02em",
  },

  /* ── CARD ── */
  card: {
    background: "white",
    borderRadius: 28, padding: "44px 40px",
    boxShadow: "0 2px 0 rgba(255,255,255,0.9) inset, 0 1px 2px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.1), 0 32px 80px rgba(99,102,241,0.16)",
    border: "1px solid rgba(255,255,255,0.85)",
  },

  cardHeader: { marginBottom: 28 },
  cardEyebrow: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 11, fontWeight: 700, color: "#6366f1",
    letterSpacing: "0.1em", textTransform: "uppercase",
    background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)",
    borderRadius: 20, padding: "4px 12px", marginBottom: 14,
  },
  cardTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 26, fontWeight: 800, color: "#0f0c29",
    margin: "0 0 8px 0", letterSpacing: "-0.4px",
  },
  cardSub: {
    fontSize: 14.5, color: "#94a3b8", margin: 0, fontWeight: 500,
  },

  /* Google btn */
  googleBtn: {
    width: "100%", padding: "13px 20px",
    borderRadius: 14, border: "1.5px solid rgba(99,102,241,0.15)",
    background: "white", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    fontSize: 14.5, fontWeight: 700, color: "#374151",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "all 0.22s ease",
    boxSizing: "border-box",
  },

  /* divider */
  divider: {
    display: "flex", alignItems: "center", gap: 12,
    margin: "22px 0",
  },
  dividerLine: {
    flex: 1, height: 1, background: "rgba(99,102,241,0.12)",
  },
  dividerText: {
    fontSize: 12, color: "#94a3b8", fontWeight: 600,
    whiteSpace: "nowrap", letterSpacing: "0.03em",
  },

  /* fields */
  fieldWrap: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    fontSize: 12.5, fontWeight: 700, color: "#374151",
    letterSpacing: "0.04em", textTransform: "uppercase",
  },
  inputWrap: {
    display: "flex", alignItems: "center", gap: 10,
    border: "1.5px solid rgba(99,102,241,0.2)",
    borderRadius: 12, padding: "0 14px",
    height: 50, transition: "all 0.22s ease",
    background: "#fafaff", boxSizing: "border-box",
  },
  input: {
    flex: 1, border: "none", background: "transparent",
    fontSize: 14.5, color: "#0f0c29", fontWeight: 500,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    height: "100%", outline: "none",
  },

  /* submit */
  submitBtn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
    color: "white", border: "none", borderRadius: 14,
    fontSize: 15, fontWeight: 700, cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "all 0.25s ease",
    boxShadow: "0 4px 20px rgba(99,102,241,0.45)",
    boxSizing: "border-box",
    marginTop: 4,
  },
  submitBtnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 32px rgba(99,102,241,0.55)",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)",
  },

  /* footer */
  footer: {
    textAlign: "center", marginTop: 24,
    fontSize: 14, color: "#94a3b8", fontWeight: 500,
  },
  footerLink: {
    color: "#6366f1", fontWeight: 700, textDecoration: "none",
  },

  securityNote: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 16, fontSize: 12, color: "#c4b5fd", fontWeight: 500,
  },
};