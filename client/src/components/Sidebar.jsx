import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  House,
  LayoutDashboard,
  LogOut,
  BrainCircuit,
  ChevronRight,
  Cpu,
} from "lucide-react";

const KEYFRAMES = `
@keyframes sidebar-in {
  from { opacity: 0; transform: translateX(-18px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes avatar-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.35); }
  50%       { box-shadow: 0 0 0 6px rgba(139,92,246,0); }
}
@keyframes glow-orb {
  0%, 100% { transform: scale(1) translateY(0); opacity: 0.5; }
  50%       { transform: scale(1.12) translateY(-8px); opacity: 0.75; }
}
@keyframes logo-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
`;

function useInjectKF() {
  useEffect(() => {
    if (document.getElementById("sidebar-kf")) return;
    const el = document.createElement("style");
    el.id = "sidebar-kf";
    el.textContent = KEYFRAMES;
    document.head.appendChild(el);
  }, []);
}

const NAV = [
  {
    id: "home",
    path: "/home",
    icon: House,
    label: "Home",
    sub: "Overview",
  },
  {
    id: "dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    sub: "Your analysis",
  },
];

export default function Sidebar() {
  useInjectKF();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(null);
  const [logoutHover, setLogoutHover] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 40); }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";
  const emailDisplay = user?.email ?? "";

  return (
    <div style={{
      ...s.sidebar,
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.4s ease",
    }}>

      {/* ── decorative orbs ── */}
      <div style={s.orb1} />
      <div style={s.orb2} />

      {/* ── TOP ── */}
      <div style={s.top}>

        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIconWrap}>
            <BrainCircuit size={22} color="#fff" strokeWidth={1.6} />
            <div style={s.logoIconGlow} />
          </div>
          <div>
            <h2 style={s.logoText}>Career AI</h2>
            <p style={s.logoSub}>
              <Cpu size={9} style={{ verticalAlign: "middle", marginRight: 3, opacity: 0.7 }} />
              Powered by AI
            </p>
          </div>
        </div>

        {/* Section label */}
        <p style={s.sectionLabel}>Navigation</p>

        {/* Nav items */}
        <nav style={s.nav}>
          {NAV.map(({ id, path, icon: Icon, label, sub }, i) => {
            const active = location.pathname === path;
            const isHov = hovered === id;
            return (
              <div
                key={id}
                onClick={() => navigate(path)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  ...s.navItem,
                  ...(active ? s.navActive : {}),
                  ...(isHov && !active ? s.navHover : {}),
                  animation: mounted ? `sidebar-in 0.4s ${0.05 + i * 0.07}s ease both` : "none",
                }}
              >
                {/* active indicator bar */}
                <div style={{
                  ...s.activeBar,
                  opacity: active ? 1 : 0,
                  transform: active ? "scaleY(1)" : "scaleY(0)",
                }} />

                {/* icon */}
                <div style={{
                  ...s.navIconWrap,
                  background: active
                    ? "rgba(255,255,255,0.22)"
                    : isHov
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.08)",
                }}>
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} color="white" />
                </div>

                {/* labels */}
                <div style={s.navLabels}>
                  <span style={{ ...s.navLabel, fontWeight: active ? "650" : "500" }}>{label}</span>
                  <span style={s.navSub}>{sub}</span>
                </div>

                {/* chevron */}
                <ChevronRight
                  size={14}
                  color="rgba(255,255,255,0.5)"
                  style={{
                    marginLeft: "auto",
                    transition: "transform 0.2s, opacity 0.2s",
                    transform: (active || isHov) ? "translateX(2px)" : "none",
                    opacity: (active || isHov) ? 1 : 0,
                  }}
                />
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── DIVIDER ── */}
      <div style={s.divider} />

      {/* ── BOTTOM ── */}
      <div style={s.bottom}>

        {/* User card */}
        <div style={s.userCard}>
          <div style={s.avatarWrap}>
            <div style={s.avatar}>{initial}</div>
            <div style={s.onlineDot} />
          </div>
          <div style={s.userInfo}>
            <p style={s.userName}>{initial}·· Account</p>
            <p style={s.userEmail} title={emailDisplay}>{emailDisplay}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          style={{
            ...s.logoutBtn,
            ...(logoutHover ? s.logoutBtnHover : {}),
          }}
        >
          <LogOut size={14} strokeWidth={2} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

/* ── styles ── */
const s = {
  sidebar: {
    width: "260px",
    height: "100vh",
    position: "fixed",
    left: 0, top: 0,
    display: "flex",
    flexDirection: "column",
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    overflow: "hidden",
    zIndex: 100,

    /* deep navy-indigo base */
    background: "linear-gradient(160deg, #0f0c29 0%, #1a1060 40%, #24186e 100%)",
    borderRight: "1px solid rgba(255,255,255,0.07)",
    boxShadow: "4px 0 32px rgba(0,0,0,0.28)",
  },

  /* decorative orbs */
  orb1: {
    position: "absolute", top: "-60px", right: "-60px",
    width: "200px", height: "200px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)",
    pointerEvents: "none",
    animation: "glow-orb 7s ease-in-out infinite",
  },
  orb2: {
    position: "absolute", bottom: "60px", left: "-80px",
    width: "220px", height: "220px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
    animation: "glow-orb 9s 2s ease-in-out infinite",
  },

  /* TOP */
  top: {
    flex: 1, overflowY: "auto",
    padding: "24px 16px 16px",
    position: "relative", zIndex: 1,
  },

  /* logo */
  logoWrap: {
    display: "flex", alignItems: "center", gap: "13px",
    marginBottom: "32px",
    padding: "4px 4px",
  },
  logoIconWrap: {
    width: "44px", height: "44px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", flexShrink: 0,
    boxShadow: "0 4px 16px rgba(99,102,241,0.45)",
  },
  logoIconGlow: {
    position: "absolute", inset: 0, borderRadius: "14px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)",
  },
  logoText: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "17px", fontWeight: "700",
    color: "white", margin: 0, letterSpacing: "-0.3px",
    background: "linear-gradient(90deg, #fff 0%, #c4b5fd 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  logoSub: {
    fontSize: "10.5px", color: "rgba(196,181,253,0.75)",
    margin: "2px 0 0", fontWeight: "500", letterSpacing: "0.02em",
  },

  /* section label */
  sectionLabel: {
    fontSize: "9.5px", fontWeight: "700",
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.3)",
    margin: "0 0 10px 8px",
  },

  /* nav */
  nav: { display: "flex", flexDirection: "column", gap: "4px" },

  navItem: {
    display: "flex", alignItems: "center", gap: "11px",
    padding: "11px 10px 11px 10px",
    borderRadius: "13px",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.2s, transform 0.2s",
    overflow: "hidden",
  },
  navActive: {
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(8px)",
  },
  navHover: {
    background: "rgba(255,255,255,0.07)",
    transform: "translateX(3px)",
  },

  activeBar: {
    position: "absolute", left: 0, top: "20%",
    width: "3px", height: "60%", borderRadius: "0 3px 3px 0",
    background: "linear-gradient(180deg, #a78bfa, #6366f1)",
    transition: "opacity 0.25s, transform 0.25s",
    transformOrigin: "center",
  },

  navIconWrap: {
    width: "34px", height: "34px", borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "background 0.2s",
  },

  navLabels: { display: "flex", flexDirection: "column", gap: "1px" },
  navLabel: {
    fontSize: "13.5px", color: "rgba(255,255,255,0.92)",
    lineHeight: 1, letterSpacing: "-0.1px",
  },
  navSub: {
    fontSize: "10.5px", color: "rgba(255,255,255,0.38)",
    fontWeight: "400",
  },

  /* divider */
  divider: {
    height: "1px", margin: "0 16px",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent)",
    position: "relative", zIndex: 1,
  },

  /* bottom */
  bottom: {
    padding: "16px",
    display: "flex", flexDirection: "column", gap: "10px",
    position: "relative", zIndex: 1,
  },

  userCard: {
    display: "flex", alignItems: "center", gap: "11px",
    padding: "10px 12px",
    borderRadius: "13px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "14px", fontWeight: "700", color: "white",
    animation: "avatar-pulse 3s ease-in-out infinite",
  },
  onlineDot: {
    position: "absolute", bottom: "1px", right: "1px",
    width: "9px", height: "9px", borderRadius: "50%",
    background: "#22c55e",
    border: "2px solid #1a1060",
  },

  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.9)",
    margin: 0, letterSpacing: "0.01em",
  },
  userEmail: {
    fontSize: "10.5px", color: "rgba(255,255,255,0.38)",
    margin: "2px 0 0", overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap",
  },

  /* logout */
  logoutBtn: {
    width: "100%", padding: "10px 14px",
    borderRadius: "11px", border: "1px solid rgba(239,68,68,0.3)",
    background: "rgba(239,68,68,0.1)",
    color: "rgba(252,165,165,0.9)",
    cursor: "pointer", fontSize: "13px", fontWeight: "600",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
    transition: "all 0.2s ease",
    letterSpacing: "0.01em",
  },
  logoutBtnHover: {
    background: "rgba(239,68,68,0.22)",
    borderColor: "rgba(239,68,68,0.55)",
    color: "#fca5a5",
    transform: "translateY(-1px)",
  },
};