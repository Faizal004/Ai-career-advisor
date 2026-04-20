import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight,
  BrainCircuit, Sparkles, CheckCircle, XCircle,
  Briefcase, GraduationCap,
} from "lucide-react";

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
@keyframes slideDown {
  from { opacity:0; transform:translateY(-6px); max-height:0; }
  to   { opacity:1; transform:translateY(0); max-height:80px; }
}

.rg-input::placeholder { color: #c4b5fd; }
.rg-input:focus { outline: none; }

.strength-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.4s ease, background 0.4s ease;
}
`;

function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById("register-styles")) return;
    const el = document.createElement("style");
    el.id = "register-styles";
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);
}

/* ── password strength checker ── */
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "#e2e8f0" };
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;
  if (pw.length >= 12)            score++;
  const map = [
    { label: "",          color: "#e2e8f0" },
    { label: "Very Weak", color: "#ef4444" },
    { label: "Weak",      color: "#f97316" },
    { label: "Fair",      color: "#f59e0b" },
    { label: "Strong",    color: "#10b981" },
    { label: "Very Strong", color: "#6366f1" },
  ];
  return { score, ...map[score] };
}

/* ── password requirement row ── */
function PwReq({ met, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      {met
        ? <CheckCircle size={13} color="#10b981" />
        : <XCircle    size={13} color="#e2e8f0" />}
      <span style={{ fontSize: 12.5, color: met ? "#374151" : "#94a3b8", fontWeight: 500, transition: "color 0.2s" }}>
        {text}
      </span>
    </div>
  );
}

/* ── input field wrapper ── */
function Field({ label, icon: Icon, error, focused, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={s.label}>{label}</label>
      <div style={{
        ...s.inputWrap,
        borderColor: error   ? "rgba(239,68,68,0.5)"
                   : focused ? "#6366f1"
                   : "rgba(99,102,241,0.2)",
        boxShadow: error   ? "0 0 0 3px rgba(239,68,68,0.1)"
                 : focused ? "0 0 0 3px rgba(99,102,241,0.12)"
                 : "none",
        background: focused ? "white" : "#fafaff",
      }}>
        <Icon size={15}
          color={error ? "#ef4444" : focused ? "#6366f1" : "#a78bfa"}
          style={{ flexShrink: 0, transition: "color 0.2s" }}
        />
        {children}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 500, animation: "slideDown 0.2s ease" }}>
          {error}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────── */
export default function Register() {
  useInjectStyles();
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  /* form state */
  const [form, setForm] = useState({
    fullName:   "",
    email:      "",
    password:   "",
    confirmPw:  "",
    role:       "",        // career goal / current role
    level:      "",        // experience level
  });
  const [errors,       setErrors]       = useState({});
  const [showPw,       setShowPw]       = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [focused,      setFocused]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const [btnHover,     setBtnHover]     = useState(false);
  const [gHover,       setGHover]       = useState(false);
  const [showPwReqs,   setShowPwReqs]   = useState(false);
  const [agreed,       setAgreed]       = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const pwStrength = getPasswordStrength(form.password);

  const set = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  /* ── validation ── */
  function validate() {
    const e = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      e.fullName = "Please enter your full name (min 2 characters)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPw)
      e.confirmPw = "Passwords do not match";
    if (!form.role)
      e.role = "Please select your career goal";
    if (!form.level)
      e.level = "Please select your experience level";
    if (!agreed)
      e.agreed = "You must accept the terms to continue";
    return e;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(form.email, form.password, {
        displayName: form.fullName,
        careerGoal:  form.role,
        level:       form.level,
      });
      navigate("/home");
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate("/home");
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  const ROLES = [
    "Frontend Developer",  "Backend Developer",  "Full Stack Developer",
    "Data Scientist",      "ML / AI Engineer",   "DevOps / Cloud",
    "Mobile Developer",    "UI/UX Designer",      "Product Manager",
    "Cybersecurity",       "Data Analyst",        "Other",
  ];

  const LEVELS = [
    { value: "student",    label: "Student / Fresher"      },
    { value: "junior",     label: "Junior  (0–2 yrs)"      },
    { value: "mid",        label: "Mid-level  (2–5 yrs)"   },
    { value: "senior",     label: "Senior  (5+ yrs)"       },
    { value: "career-switch", label: "Career Switcher"     },
  ];

  return (
    <div style={s.wrapper}>
      {/* bg */}
      <div style={s.grid} />
      <div style={{ ...s.orb, ...s.orb1 }} />
      <div style={{ ...s.orb, ...s.orb2 }} />
      <div style={{ ...s.orb, ...s.orb3 }} />

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
              Start your<br />
              <span style={s.heroAccent}>AI career journey</span>
            </h1>
            <p style={s.heroSub}>
              Create your free account and get a personalized
              career analysis, skill gap report, and step-by-step
              roadmap in minutes.
            </p>
          </div>

          {/* steps */}
          <div style={{ ...s.stepsCol, animation: "fadeUp 0.5s 0.15s ease both" }}>
            {[
              { num: "01", title: "Create your account",    sub: "Quick & free setup" },
              { num: "02", title: "Upload your resume",     sub: "Or enter details manually" },
              { num: "03", title: "Get your AI analysis",   sub: "Personalized in seconds" },
              { num: "04", title: "Follow your roadmap",    sub: "Step-by-step career plan" },
            ].map(({ num, title, sub }) => (
              <div key={num} style={s.step}>
                <div style={s.stepNum}>{num}</div>
                <div>
                  <div style={s.stepTitle}>{title}</div>
                  <div style={s.stepSub}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* trust badges */}
          <div style={{ ...s.trustRow, animation: "fadeUp 0.5s 0.22s ease both" }}>
            {["🔒 SSL Encrypted", "🚫 No spam ever", "⚡ Free forever"].map((t, i) => (
              <span key={i} style={s.trustBadge}>{t}</span>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ animation: "fadeUp 0.5s 0.1s ease both" }}>
          <div style={s.card}>

            {/* header */}
            <div style={s.cardHeader}>
              <div style={s.cardEyebrow}>
                <Sparkles size={11} color="#6366f1" style={{ animation: "spin 4s linear infinite" }} />
                Join Career AI
              </div>
              <h2 style={s.cardTitle}>Create your account</h2>
              <p style={s.cardSub}>Free forever · No credit card needed</p>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              onMouseEnter={() => setGHover(true)}
              onMouseLeave={() => setGHover(false)}
              style={{
                ...s.googleBtn,
                background:   gHover ? "#f5f3ff" : "white",
                borderColor:  gHover ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.15)",
                boxShadow:    gHover ? "0 4px 16px rgba(99,102,241,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
                transform:    gHover ? "translateY(-1px)" : "none",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={s.divider}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>or register with email</span>
              <div style={s.dividerLine} />
            </div>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Full name */}
              <Field label="Full Name" icon={User} error={errors.fullName} focused={focused === "fullName"}>
                <input
                  className="rg-input" type="text"
                  placeholder="Your full name"
                  value={form.fullName} onChange={set("fullName")}
                  onFocus={() => setFocused("fullName")}
                  onBlur={() => setFocused(null)}
                  style={s.input}
                />
              </Field>

              {/* Email */}
              <Field label="Email Address" icon={Mail} error={errors.email} focused={focused === "email"}>
                <input
                  className="rg-input" type="email"
                  placeholder="you@example.com"
                  value={form.email} onChange={set("email")}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  style={s.input}
                />
              </Field>

              {/* Career goal + Experience — 2 col */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                {/* Career goal */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label style={s.label}>Career Goal</label>
                  <div style={{
                    ...s.inputWrap,
                    borderColor: errors.role ? "rgba(239,68,68,0.5)" : focused === "role" ? "#6366f1" : "rgba(99,102,241,0.2)",
                    boxShadow:   errors.role ? "0 0 0 3px rgba(239,68,68,0.1)" : focused === "role" ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
                    background:  focused === "role" ? "white" : "#fafaff",
                    padding: "0 12px",
                  }}>
                    <Briefcase size={14} color={errors.role ? "#ef4444" : focused === "role" ? "#6366f1" : "#a78bfa"} style={{ flexShrink: 0 }} />
                    <select
                      className="rg-input"
                      value={form.role} onChange={set("role")}
                      onFocus={() => setFocused("role")}
                      onBlur={() => setFocused(null)}
                      style={{ ...s.input, cursor: "pointer" }}
                    >
                      <option value="">Select…</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {errors.role && <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 500 }}>{errors.role}</span>}
                </div>

                {/* Experience level */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label style={s.label}>Experience</label>
                  <div style={{
                    ...s.inputWrap,
                    borderColor: errors.level ? "rgba(239,68,68,0.5)" : focused === "level" ? "#6366f1" : "rgba(99,102,241,0.2)",
                    boxShadow:   errors.level ? "0 0 0 3px rgba(239,68,68,0.1)" : focused === "level" ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
                    background:  focused === "level" ? "white" : "#fafaff",
                    padding: "0 12px",
                  }}>
                    <GraduationCap size={14} color={errors.level ? "#ef4444" : focused === "level" ? "#6366f1" : "#a78bfa"} style={{ flexShrink: 0 }} />
                    <select
                      className="rg-input"
                      value={form.level} onChange={set("level")}
                      onFocus={() => setFocused("level")}
                      onBlur={() => setFocused(null)}
                      style={{ ...s.input, cursor: "pointer" }}
                    >
                      <option value="">Select…</option>
                      {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  {errors.level && <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 500 }}>{errors.level}</span>}
                </div>
              </div>

              {/* Password */}
              <Field label="Password" icon={Lock} error={errors.password} focused={focused === "password"}>
                <input
                  className="rg-input"
                  type={showPw ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={form.password} onChange={set("password")}
                  onFocus={() => { setFocused("password"); setShowPwReqs(true); }}
                  onBlur={() => setFocused(null)}
                  style={s.input}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#a78bfa", display: "flex", alignItems: "center" }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </Field>

              {/* Password strength + requirements */}
              {form.password && (
                <div style={{ marginTop: -6 }}>
                  {/* strength bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 5, borderRadius: 10, background: "#f1f5f9", overflow: "hidden" }}>
                      <div className="strength-bar-fill" style={{
                        width: `${(pwStrength.score / 5) * 100}%`,
                        background: pwStrength.color,
                      }} />
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: pwStrength.color, minWidth: 72, textAlign: "right" }}>
                      {pwStrength.label}
                    </span>
                  </div>
                  {/* requirements */}
                  {showPwReqs && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", padding: "10px 14px", background: "#fafaff", borderRadius: 10, border: "1px solid rgba(99,102,241,0.1)" }}>
                      <PwReq met={form.password.length >= 8}            text="8+ characters" />
                      <PwReq met={/[A-Z]/.test(form.password)}          text="Uppercase letter" />
                      <PwReq met={/[0-9]/.test(form.password)}          text="Number" />
                      <PwReq met={/[^A-Za-z0-9]/.test(form.password)}  text="Special character" />
                    </div>
                  )}
                </div>
              )}

              {/* Confirm password */}
              <Field label="Confirm Password" icon={Lock} error={errors.confirmPw} focused={focused === "confirmPw"}>
                <input
                  className="rg-input"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPw} onChange={set("confirmPw")}
                  onFocus={() => setFocused("confirmPw")}
                  onBlur={() => setFocused(null)}
                  style={s.input}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#a78bfa", display: "flex", alignItems: "center" }}>
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {form.confirmPw && form.password === form.confirmPw && (
                  <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0 }} />
                )}
              </Field>

              {/* Terms */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 2 }}>
                <div
                  onClick={() => setAgreed(v => !v)}
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                    border: errors.agreed ? "2px solid #ef4444" : agreed ? "2px solid #6366f1" : "2px solid #c4b5fd",
                    background: agreed ? "linear-gradient(135deg,#6366f1,#a855f7)" : "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease", cursor: "pointer",
                  }}
                >
                  {agreed && <CheckCircle size={12} color="white" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, fontWeight: 500 }}>
                  I agree to the{" "}
                  <span style={{ color: "#6366f1", fontWeight: 700, cursor: "pointer" }}>Terms of Service</span>
                  {" "}and{" "}
                  <span style={{ color: "#6366f1", fontWeight: 700, cursor: "pointer" }}>Privacy Policy</span>
                </span>
              </label>
              {errors.agreed && (
                <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 500, marginTop: -8 }}>{errors.agreed}</span>
              )}

              {/* API error */}
              {errors.submit && (
                <div style={{ background: "#fff1f2", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: "#dc2626", fontWeight: 500 }}>
                  ⚠️ {errors.submit}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                style={{
                  ...s.submitBtn,
                  ...(btnHover && !loading ? s.submitBtnHover : {}),
                  ...(loading ? { opacity: 0.7, cursor: "not-allowed", transform: "none" } : {}),
                  marginTop: 4,
                }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    Creating account…
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    Create Free Account
                    <ArrowRight size={16} style={{ transition: "transform 0.2s", transform: btnHover ? "translateX(4px)" : "none" }} />
                  </span>
                )}
              </button>
            </form>

            {/* footer */}
            <p style={s.footer}>
              Already have an account?{" "}
              <Link to="/" style={s.footerLink}>Sign in →</Link>
            </p>

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

/* ─────────────────────────────────────────────
   STYLES
────────────────────────────────────────────── */
const s = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #e8e6f8 0%, #e4dffc 40%, #ede8ff 70%, #f0e6ff 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
    position: "relative", overflow: "hidden",
    padding: "40px 24px", boxSizing: "border-box",
  },
  grid: {
    position: "fixed", inset: 0, pointerEvents: "none",
    backgroundImage: "radial-gradient(rgba(99,102,241,0.1) 1px, transparent 1px)",
    backgroundSize: "30px 30px", zIndex: 0,
  },
  orb: { position: "fixed", borderRadius: "50%", pointerEvents: "none", zIndex: 0 },
  orb1: {
    width: 480, height: 480, top: -120, left: -80,
    background: "radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)",
    animation: "floatOrb 9s ease-in-out infinite",
  },
  orb2: {
    width: 380, height: 380, bottom: -80, right: -60,
    background: "radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 70%)",
    animation: "floatOrb 11s 2s ease-in-out infinite",
  },
  orb3: {
    width: 260, height: 260, top: "35%", right: "18%",
    background: "radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)",
    animation: "floatOrb 13s 4s ease-in-out infinite",
  },

  layout: {
    position: "relative", zIndex: 1,
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 72, width: "100%", maxWidth: 1060, alignItems: "start",
    paddingTop: 20,
  },

  /* left panel */
  leftPanel: { display: "flex", flexDirection: "column", gap: 28, paddingTop: 8 },
  logo: { display: "flex", alignItems: "center", gap: 14 },
  logoIcon: {
    width: 48, height: 48, borderRadius: 15,
    background: "linear-gradient(135deg,#6366f1,#a855f7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", flexShrink: 0,
    boxShadow: "0 6px 20px rgba(99,102,241,0.45)",
  },
  logoIconGlow: {
    position: "absolute", inset: 0, borderRadius: 15,
    background: "linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 60%)",
  },
  logoName: {
    fontFamily: "'Outfit',sans-serif",
    fontSize: 20, fontWeight: 800, color: "#0f0c29", letterSpacing: "-0.3px",
  },
  logoPowered: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 11.5, color: "#a78bfa", fontWeight: 600, marginTop: 2,
  },
  logoPoweredDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "linear-gradient(135deg,#6366f1,#a855f7)",
    display: "inline-block", animation: "pulseDot 2s infinite",
  },
  heroTitle: {
    fontFamily: "'Outfit',sans-serif",
    fontSize: 40, fontWeight: 900, color: "#0f0c29",
    lineHeight: 1.1, letterSpacing: "-1.5px", margin: "0 0 16px 0",
  },
  heroAccent: {
    background: "linear-gradient(135deg,#6366f1,#a855f7)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: 15.5, color: "#64748b", lineHeight: 1.85, margin: 0, maxWidth: 390,
  },

  stepsCol: { display: "flex", flexDirection: "column", gap: 14 },
  step: {
    display: "flex", alignItems: "flex-start", gap: 14,
    padding: "12px 16px",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(99,102,241,0.12)",
    borderRadius: 14, backdropFilter: "blur(8px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  stepNum: {
    fontFamily: "'Outfit',sans-serif",
    fontSize: 13, fontWeight: 800, color: "#6366f1",
    background: "rgba(99,102,241,0.1)", borderRadius: 8,
    padding: "4px 9px", flexShrink: 0, letterSpacing: "0.02em",
  },
  stepTitle: { fontSize: 14, fontWeight: 700, color: "#0f0c29", marginBottom: 2 },
  stepSub:   { fontSize: 12.5, color: "#94a3b8", fontWeight: 500 },

  trustRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  trustBadge: {
    fontSize: 12, fontWeight: 600, color: "#6366f1",
    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 20, padding: "5px 12px", backdropFilter: "blur(6px)",
  },

  /* card */
  card: {
    background: "white", borderRadius: 28, padding: "40px 38px",
    boxShadow: "0 2px 0 rgba(255,255,255,0.9) inset, 0 1px 2px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.10), 0 32px 80px rgba(99,102,241,0.16)",
    border: "1px solid rgba(255,255,255,0.85)",
  },
  cardHeader: { marginBottom: 24 },
  cardEyebrow: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 11, fontWeight: 700, color: "#6366f1",
    letterSpacing: "0.1em", textTransform: "uppercase",
    background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)",
    borderRadius: 20, padding: "4px 12px", marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "'Outfit',sans-serif",
    fontSize: 24, fontWeight: 800, color: "#0f0c29",
    margin: "0 0 6px 0", letterSpacing: "-0.4px",
  },
  cardSub: { fontSize: 13.5, color: "#94a3b8", margin: 0, fontWeight: 500 },

  googleBtn: {
    width: "100%", padding: "12px 20px",
    borderRadius: 14, border: "1.5px solid rgba(99,102,241,0.15)",
    background: "white", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    fontSize: 14, fontWeight: 700, color: "#374151",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    transition: "all 0.22s ease", boxSizing: "border-box",
  },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "18px 0" },
  dividerLine: { flex: 1, height: 1, background: "rgba(99,102,241,0.12)" },
  dividerText: { fontSize: 12, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", letterSpacing: "0.03em" },

  label: {
    fontSize: 12, fontWeight: 700, color: "#374151",
    letterSpacing: "0.05em", textTransform: "uppercase",
  },
  inputWrap: {
    display: "flex", alignItems: "center", gap: 10,
    border: "1.5px solid rgba(99,102,241,0.2)",
    borderRadius: 12, padding: "0 14px",
    height: 48, transition: "all 0.22s ease",
    background: "#fafaff", boxSizing: "border-box",
  },
  input: {
    flex: 1, border: "none", background: "transparent",
    fontSize: 14, color: "#0f0c29", fontWeight: 500,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    height: "100%", outline: "none",
  },

  submitBtn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)",
    color: "white", border: "none", borderRadius: 14,
    fontSize: 15, fontWeight: 700, cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    transition: "all 0.25s ease",
    boxShadow: "0 4px 20px rgba(99,102,241,0.45)",
    boxSizing: "border-box",
  },
  submitBtnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 32px rgba(99,102,241,0.55)",
    background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#9333ea 100%)",
  },
  footer: {
    textAlign: "center", marginTop: 20,
    fontSize: 13.5, color: "#94a3b8", fontWeight: 500,
  },
  footerLink: { color: "#6366f1", fontWeight: 700, textDecoration: "none" },
  securityNote: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 14, fontSize: 12, color: "#c4b5fd", fontWeight: 500,
  },
};