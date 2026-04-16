/* eslint-disable */
import { supabase } from "./supabase";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// DataPhone v2 - Mobile Repair Shop Management System
// ============================================================

// ---- COLOR TOKENS (Light & Dark) ----
const THEME = {
  light: {
    accent: "#0EA5E9",        // Sky blue - primary accent
    accentDark: "#0284C7",
    accentGrad: "linear-gradient(135deg, #0EA5E9, #0369A1)",
    success: "#10B981",
    successGrad: "linear-gradient(135deg, #10B981, #059669)",
    danger: "#EF4444",
    dangerGrad: "linear-gradient(135deg, #EF4444, #DC2626)",
    warn: "#F59E0B",
    bg: "#F0F4F8",
    surface: "#FFFFFF",
    surfaceAlt: "#F8FAFC",
    border: "#E2E8F0",
    borderStrong: "#CBD5E1",
    text: "#0F172A",
    textMuted: "#64748B",
    textFaint: "#94A3B8",
    nav: "#FFFFFF",
    navBorder: "#E2E8F0",
    inputBg: "#F8FAFC",
    overlay: "rgba(15,23,42,0.45)",
    badge: { new: { bg: "#FEE2E2", color: "#EF4444" }, ne_proces: { bg: "#FEF3C7", color: "#D97706" }, gati: { bg: "#DBEAFE", color: "#2563EB" }, perfunduar: { bg: "#D1FAE5", color: "#059669" }, i_marre: { bg: "#EDE9FE", color: "#7C3AED" }, nuk_merret: { bg: "#F1F5F9", color: "#475569" } },
  },
  dark: {
    accent: "#38BDF8",
    accentDark: "#0EA5E9",
    accentGrad: "linear-gradient(135deg, #38BDF8, #0EA5E9)",
    success: "#34D399",
    successGrad: "linear-gradient(135deg, #34D399, #10B981)",
    danger: "#F87171",
    dangerGrad: "linear-gradient(135deg, #F87171, #EF4444)",
    warn: "#FBBF24",
    bg: "#0B1120",
    surface: "#131D2E",
    surfaceAlt: "#1A2744",
    border: "#1E3A5F",
    borderStrong: "#2563EB22",
    text: "#F1F5F9",
    textMuted: "#94A3B8",
    textFaint: "#475569",
    nav: "#131D2E",
    navBorder: "#1E3A5F",
    inputBg: "#0B1120",
    overlay: "rgba(0,0,0,0.65)",
    badge: { new: { bg: "#7f1d1d55", color: "#FCA5A5" }, ne_proces: { bg: "#78350f55", color: "#FCD34D" }, gati: { bg: "#1e3a8a55", color: "#93C5FD" }, perfunduar: { bg: "#065f4655", color: "#6EE7B7" }, i_marre: { bg: "#4c1d9555", color: "#C4B5FD" }, nuk_merret: { bg: "#1e293b", color: "#94A3B8" } },
  },
};

const STATUSES = [
  { key: "new", label: "I Pranuar në Servis", color: "#EF4444", bg: "#FEE2E2" },
  { key: "ne_proces", label: "Në Proces", color: "#D97706", bg: "#FEF3C7" },
  { key: "gati", label: "Gati", color: "#2563EB", bg: "#DBEAFE" },
  { key: "perfunduar", label: "Përfunduar", color: "#059669", bg: "#D1FAE5" },
  { key: "i_marre", label: "I Marrë nga Servisi", color: "#7C3AED", bg: "#EDE9FE" },
  { key: "nuk_merret", label: "Nuk Rregullohet", color: "#475569", bg: "#F1F5F9" },
];

const COUNTRIES = [
  { name: "Kosovë", cities: ["Prishtinë","Gjilan","Prizren","Pejë","Ferizaj","Mitrovicë","Gjakovë","Podujevë","Vushtrri","Suharekë","Rahovec","Drenas","Lipjan","Malishevë","Kamenicë","Viti","Deçan","Istog","Klinë","Skenderaj","Dragash","Fushë Kosovë","Kaçanik","Shtime","Obiliq","Novobërdë","Zubin Potok","Leposaviq","Shtërpcë","Graçanicë","Ranillug","Partesh","Kllokot","Mamushë","Junik","Hani i Elezit"] },
  { name: "Shqipëri", cities: ["Tiranë","Durrës","Vlorë","Shkodër","Elbasan","Korçë","Fier","Berat","Lushnjë","Pogradec","Kavajë","Kukës","Sarandë","Lezhë","Gjirokastër","Peshkopi","Burrel","Laç","Krujë","Librazhd"] },
  { name: "Maqedoni e Veriut", cities: ["Shkup","Tetovë","Gostivar","Kumanovë","Strumicë","Ohër","Manastir","Prilep","Veles","Shtip","Kërçovë"] },
];

let idCounter = Date.now();
const uid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback për browsera të vjetër: gjenero UUID v4 manualisht
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};
const fmtDateOnly = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
const fmtTime24 = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
};

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s} sekonda me pare`;
  if (s < 3600) return `${Math.floor(s / 60)} minuta me pare`;
  if (s < 86400) return `${Math.floor(s / 3600)} ore me pare`;
  return `${Math.floor(s / 86400)} dite me pare`;
};

const daysOld = (d) => Math.floor((Date.now() - new Date(d)) / 86400000);



// SVG Icons
const Ic = {
  home: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  menu: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  plus: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  edit: (s = 12) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: (s = 12) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  print: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  phone: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11N09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  copy: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  check: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  bolt: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  arrow: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  logout: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  down: (s = 12) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  xred: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  eye: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  msg: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  moon: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  sun: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  bell: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  download: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  money: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  warn: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

const DEFAULT_DATA = { business: null, workers: [], clients: [], jobs: [], messages: [], history: [], products: [], sales: [], warranties: [], debts: [], coupons: [], postaOrders: [] };
const NAV_BASE = [{ key: "dashboard", label: "Ballina" }, { key: "workers", label: "Puntoret" }, { key: "clients", label: "Klientat" }, { key: "business", label: "Biznesi" }];
const NAV_ARKA = { key: "arka", label: "Arka" };
const NAV_POSTA = { key: "posta", label: "📦 Posta" };
// Legacy fallback for any old references
const NAV = NAV_BASE;

// ============================================================
// ADMIN CONFIG
// ============================================================
const ADMIN_CREDENTIALS = {
  email: "urim.ffkfutsall@gmail.com",
  password: "Albitnora123456@",
  name: "Administrator",
  role: "admin",
};

const SUBSCRIPTION_PLANS = [
  { key: "1m",  label: "1 Muaj",   days: 30,  price: "9.99€" },
  { key: "3m",  label: "3 Muaj",   days: 90,  price: "24.99€" },
  { key: "6m",  label: "6 Muaj",   days: 180, price: "44.99€" },
  { key: "12m", label: "12 Muaj",  days: 365, price: "79.99€" },
];

const addSubscriptionDays = (account, days) => {
  const now = new Date();
  // If there's an existing expiry date in the future, extend from it; otherwise from now
  let base = now;
  if (account.expiryDate) {
    const existing = new Date(account.expiryDate);
    if (existing > now) base = existing;
  }
  const newExpiry = new Date(base.getTime() + days * 86400000);
  return {
    ...account,
    expiryDate: newExpiry.toISOString(),
    expiresIn: `${Math.ceil((newExpiry - now) / 86400000)} dite`,
    status: "active",
    payments: [...(account.payments || []), {
      amount: SUBSCRIPTION_PLANS.find(p => p.days === days)?.price || `${days}d`,
      date: now.toISOString(),
      validFor: SUBSCRIPTION_PLANS.find(p => p.days === days)?.label || `${days} dite`,
    }],
  };
};

const getAccountStatus = (account) => {
  if (account.status === "suspended") return "suspended";
  if (!account.expiryDate) return "trial";
  const now = new Date();
  const expiry = new Date(account.expiryDate);
  if (expiry < now) return "expired";
  const daysLeft = Math.ceil((expiry - now) / 86400000);
  if (daysLeft <= 7) return "expiring";
  return "active";
};

// ---- Shared Components ----
function Modal({ open, onClose, title, children, width = 480, t }) {
  if (!open) return null;
  const T = t || THEME.light;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: T.overlay, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s ease" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, padding: "28px 32px", width: "90%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,.25)", animation: "slideUp .25s ease", border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textFaint, width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.x(18)}</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", required, error, t, ...rest }) {
  const T = t || THEME.light;
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>{label}{required && <span style={{ color: T.danger }}> *</span>}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} {...rest}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: error ? `2px solid ${T.danger}` : `1.5px solid ${T.border}`, fontSize: 14, outline: "none", transition: "border .2s", background: T.inputBg, color: T.text, boxSizing: "border-box" }}
        onFocus={e => e.target.style.border = `1.5px solid ${T.accent}`} onBlur={e => e.target.style.border = error ? `2px solid ${T.danger}` : `1.5px solid ${T.border}`} />
      {error && <span style={{ fontSize: 12, color: T.danger, marginTop: 4 }}>{error}</span>}
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder, required, t }) {
  const T = t || THEME.light;
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>{label}{required && <span style={{ color: T.danger }}> *</span>}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, outline: "none", background: T.inputBg, color: value ? T.text : T.textFaint, cursor: "pointer", boxSizing: "border-box" }}>
        <option value="">{placeholder || "Zgjedh..."}</option>
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3, required, t }) {
  const T = t || THEME.light;
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>{label}{required && <span style={{ color: T.danger }}> *</span>}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, outline: "none", background: T.inputBg, color: T.text, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", style: s, disabled, t, ...rest }) {
  const T = t || THEME.light;
  const base = { border: "none", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, transition: "all .2s", fontFamily: "inherit", opacity: disabled ? 0.5 : 1 };
  const sizes = { sm: { padding: "6px 14px", fontSize: 12 }, md: { padding: "10px 20px", fontSize: 14 }, lg: { padding: "12px 28px", fontSize: 15 } };
  const variants = {
    primary: { background: T.accentGrad, color: "#fff" },
    success: { background: T.successGrad, color: "#fff" },
    danger: { background: T.dangerGrad, color: "#fff" },
    outline: { background: "transparent", color: T.accent, border: `1.5px solid ${T.accent}` },
    ghost: { background: "transparent", color: T.textMuted },
    dark: { background: T.text, color: T.surface },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...s }} {...rest}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.18)"; }}}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>{children}</button>;
}

function Badge({ status, t }) {
  const T = t || THEME.light;
  const s = STATUSES.find(st => st.key === status) || STATUSES[0];
  const colors = T.badge?.[status] || { bg: s.bg, color: s.color };
  return <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase", background: colors.bg, color: colors.color, letterSpacing: 0.5 }}>{s.label}</span>;
}

function Toast({ message, visible }) {
  if (!visible) return null;
  return <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#0F172A", color: "#fff", padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 2000, boxShadow: "0 8px 32px rgba(0,0,0,.3)", animation: "slideDown .3s ease", display: "flex", alignItems: "center", gap: 8 }}>{Ic.check(14)} {message}</div>;
}

// ---- Stale Jobs Alert Banner ----
function StaleAlert({ jobs, onNavigate, t }) {
  const T = t || THEME.light;
  const stale = jobs.filter(j => !["perfunduar","nuk_merret"].includes(j.status) && daysOld(j.createdAt) >= 3);
  if (stale.length === 0) return null;
  return (
    <div style={{ background: `linear-gradient(135deg, #7C3AED15, #DC262615)`, border: `1.5px solid #DC262640`, borderRadius: 12, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onNavigate("dashboard")}>
      <span style={{ color: "#DC2626", display: "flex" }}>{Ic.warn(18)}</span>
      <div>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#DC2626" }}>{stale.length} punë të vjetra (3+ ditë)</span>
        <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 8 }}>Kliket per t'i pare</span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {stale.slice(0, 3).map(j => <span key={j.id} style={{ background: "#DC262615", color: "#DC2626", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{j.phoneModel} ({daysOld(j.createdAt)}d)</span>)}
        {stale.length > 3 && <span style={{ color: "#DC2626", fontSize: 11, fontWeight: 600, padding: "2px 0" }}>+{stale.length - 3} tjera</span>}
      </div>
    </div>
  );
}

// ---- Export CSV ----
function exportJobsCSV(jobs, clients, workers) {
  const header = ["Nr", "Klienti", "Telefon Klienti", "Modeli", "IMEI", "Kodi", "Pershkrimi", "Puntori", "Status", "Cmimi", "Data Pranimit"];
  const rows = jobs.map(j => {
    const cl = clients.find(c => c.id === j.clientId);
    const wk = workers.find(w => w.id === j.workerId);
    return [
      `#${j.id.slice(-6)}`,
      cl?.name || "",
      cl?.phone || "",
      j.phoneModel,
      j.imei || "",
      j.code || "",
      `"${(j.description || "").replace(/"/g, "'")}"`,
      wk?.name || "",
      STATUSES.find(s => s.key === j.status)?.label || j.status,
      j.price || "",
      fmtDate(j.createdAt),
    ].join(",");
  });
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `DataPOS_Punet_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ============================================================
// COUPON COMPONENT
// ============================================================
function PrintCouponConfirm({ job, client, worker, business, onClose }) {
  const [confirmed, setConfirmed] = useState(false);
  if (!confirmed) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,20,30,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 36, width: "90%", maxWidth: 380, textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,.2)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🖨️</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>Dëshironi të printoni kuponin?</h3>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Puna u shtua me sukses! Mund të printoni kuponin tani.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={onClose} style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 12, padding: "12px 28px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Jo, vazhdo</button>
            <button onClick={() => setConfirmed(true)} style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Po, printo!</button>
          </div>
        </div>
      </div>
    );
  }
  return <PrintCoupon job={job} client={client} worker={worker} business={business} onClose={onClose} />;
}

function PrintCoupon({ job, client, worker, business, onClose }) {
  const qrData = (window.location.protocol === 'file:' ? 'https://telefoni.datapos.pro' : window.location.origin) + '?v=1&jid=' + encodeURIComponent(job.id);
  const printRef = useRef(null);
  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>Kupon</title><style>@page{size:80mm 210mm;margin:0}body{margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif}*{box-sizing:border-box}</style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };
  const statusObj = STATUSES.find(s => s.key === job.status) || STATUSES[0];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,20,30,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#f4f4f8", borderRadius: 16, padding: 24, maxHeight: "95vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Kuponi i Printimit</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="primary" size="sm" onClick={handlePrint}>{Ic.print(14)} Printo</Btn>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>{Ic.x(18)}</button>
          </div>
        </div>
        <div ref={printRef}>
          <div style={{ width: "302px", height: "793px", background: "#fff", fontFamily: "'Segoe UI',Arial,sans-serif", fontSize: 11, color: "#1a1a2e", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, padding: "10px 12px" }}>
              <div style={{ textAlign: "center", marginBottom: 8, paddingBottom: 8, borderBottom: "2px solid #1a1a2e" }}>
                {business?.logo && <img src={business.logo} alt="logo" style={{ maxWidth: 120, maxHeight: 40, marginBottom: 4, objectFit: "contain" }} />}
                <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.5 }}>{business?.name || "DataPOS"}</div>
                {business?.address && <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{business.address}</div>}
                {business?.phone && <div style={{ fontSize: 9, color: "#64748b" }}>Tel: {business.phone}</div>}
              </div>
              <div style={{ textAlign: "center", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Kupon Pranues</div>
              {[["Nr. Punes", `#${job.id.slice(-6)}`], ["Klienti", client?.name || "—"], ["Telefon", client?.phone || "—"], ["Modeli", job.phoneModel], ["IMEI", job.imei || "—"], ["Kodi", job.code || "—"], ["Cmimi", job.price ? `${job.price}€` : "—"], ["Data", fmtDate(job.createdAt)], ["Puntori", worker?.name || "—"]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px dashed #e2e8f0" }}>
                  <span style={{ fontWeight: 600, color: "#64748b" }}>{l}:</span>
                  <span style={{ fontWeight: 700, fontSize: 11 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 10, color: "#64748b", marginBottom: 3 }}>Pershkrimi:</div>
                <div style={{ fontSize: 10, lineHeight: 1.4, padding: "4px 6px", background: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0" }}>{job.description}</div>
              </div>
              {job.showNotesOnCoupon && job.notes && <div style={{ marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 10, color: "#64748b", marginBottom: 3 }}>Shënime shtesë:</div>
                <div style={{ fontSize: 10, lineHeight: 1.4, padding: "4px 6px", background: "#f0f9ff", borderRadius: 4, border: "1px solid #bae6fd" }}>{job.notes}</div>
              </div>}

              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <QRCodeSVG value={qrData} size={70} />
                <div style={{ fontSize: 8, color: "#94a3b8", marginTop: 4 }}>Skanoni per te pare statusin e pajisjes</div>
              </div>
              {business?.couponNotes && <div style={{ marginTop: 6, padding: "4px 6px", fontSize: 9, lineHeight: 1.4, color: "#475569", background: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0", textAlign: "center" }}>{business.couponNotes}</div>}
              <div style={{ textAlign: "center", fontSize: 8, color: "#94a3b8", marginTop: 4 }}>Powered by datapos.pro / 045 278 279</div>
            </div>
            <div style={{ borderTop: "2px dashed #94a3b8", margin: "0 8px", height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ background: "#fff", padding: "0 8px", fontSize: 7, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>-- SHKEPUT KETU -- KOPJA E SERVISIT --</span>
            </div>
            <div style={{ padding: "8px 12px", background: "#fafafa" }}>
              <div style={{ textAlign: "center", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Kopja e Servisit</div>
              {[["Nr", `#${job.id.slice(-6)}`], ["Klienti", client?.name || "—"], ["Tel", client?.phone || "—"], ["Modeli", job.phoneModel], ["Kodi", job.code || "—"], ["Cmimi", job.price ? `${job.price}€` : "—"]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: 10 }}>
                  <span style={{ fontWeight: 600, color: "#64748b" }}>{l}:</span>
                  <span style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
              <div style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}><strong>Defekti:</strong> {job.description}</div>
              {job.showNotesOnCoupon && job.notes && <div style={{ fontSize: 8, color: "#1e40af", marginTop: 2 }}><strong>Shënim:</strong> {job.notes}</div>}
              <div style={{ textAlign: "center", marginTop: 6 }}><QRCodeSVG value={qrData} size={50} /></div>
              {business?.couponNotes && <div style={{ marginTop: 4, fontSize: 8, lineHeight: 1.3, color: "#475569", textAlign: "center" }}>{business.couponNotes}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Client Status View
// ============================================================
function ClientStatusView({ job: initialJob, client: initialClient, worker: initialWorker, business: initialBusiness, onBack }) {
  const [jobData, setJobData] = useState(initialJob);
  const [clientData, setClientData] = useState(initialClient);
  const [workerData, setWorkerData] = useState(initialWorker);
  const [bizData, setBizData] = useState(initialBusiness);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const refreshFromSupabase = async () => {
    if (!jobData?.id) return;
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("public_jobs")
        .select("*")
        .eq("id", jobData.id)
        .single();
      if (!error && data) {
        setJobData(prev => ({ ...prev, status: data.status, phoneModel: data.phone_model || prev.phoneModel, description: data.description || prev.description, price: data.price || prev.price }));
        setClientData(prev => ({ ...prev, name: data.client_name || prev.name, phone: data.client_phone || prev.phone }));
        setWorkerData(prev => ({ ...prev, name: data.worker_name || prev.name }));
        setBizData(prev => ({ ...prev, name: data.business_name || prev.name, phone: data.business_phone || prev.phone }));
        setLastRefresh(new Date());
      }
    } catch(e) { console.log("Refresh error:", e); }
    setRefreshing(false);
  };

  // Auto-refresh çdo 30 sekonda
  useEffect(() => {
    refreshFromSupabase();
    const interval = setInterval(refreshFromSupabase, 30000);
    return () => clearInterval(interval);
  }, []);

  const job = jobData;
  const client = clientData;
  const worker = workerData;
  const business = bizData;

  const statusObj = STATUSES.find(s => s.key === job.status) || STATUSES[0];
  const progressStatuses = STATUSES.filter(s => s.key !== "nuk_merret");
  const currentIdx = progressStatuses.findIndex(s => s.key === job.status);
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4f8 0%, #e0f2fe 50%, #f0f9ff 100%)", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "24px 16px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src="./icon.png" alt="DataPOS" style={{ width: 60, height: 60, objectFit: "contain", marginBottom: 4 }} /><div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>POS</span></div>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Statusi i pajisjes suaj</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 12px 40px rgba(14,165,233,.12)", marginBottom: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ display: "inline-block", padding: "8px 24px", borderRadius: 30, background: statusObj.bg, color: statusObj.color, fontSize: 16, fontWeight: 800, textTransform: "uppercase" }}>{statusObj.label}</div>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
            {progressStatuses.map((s, i) => <div key={s.key} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= currentIdx ? s.color : "#e2e8f0", transition: "background .3s" }} />)}
          </div>
          {[["Nr. Punes", `#${job.id.slice(-6)}`], ["Klienti", client?.name || "—"], ["Telefoni", client?.phone || "—"], ["Modeli", job.phoneModel], ["IMEI", job.imei || "—"], ["Kodi", job.code || "—"], ["Cmimi", job.price ? job.price + "€" : "—"], ["Data pranimit", fmtDate(job.createdAt)], ["Tekniku", worker?.name || "—"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14 }}>
              <span style={{ color: "#64748b", fontWeight: 600 }}>{l}</span>
              <span style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#64748b", marginBottom: 6 }}>Pershkrimi i defektit:</div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 12, fontSize: 13, lineHeight: 1.5, border: "1px solid #e2e8f0" }}>{job.description}</div>
          </div>
        </div>
        {business && <div style={{ background: "#fff", borderRadius: 16, padding: 16, textAlign: "center" }}><div style={{ fontWeight: 700, fontSize: 14 }}>{business.name}</div>{business.phone && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Tel: {business.phone}</div>}</div>}
        <div style={{ textAlign: "center", marginTop: 16, display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={refreshFromSupabase} disabled={refreshing} style={{ background: refreshing ? "#e2e8f0" : "linear-gradient(135deg,#0EA5E9,#0369A1)", color: refreshing ? "#94a3b8" : "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: refreshing ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            {refreshing ? "Duke u rifreskuar..." : "🔄 Rifresko Statusin"}
          </button>
        </div>
        {lastRefresh && <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Rifreskuar: {fmtTime24(lastRefresh)}</div>}
      </div>
    </div>
  );
}

// ============================================================
// Auth Page
// ============================================================
function AuthPage({ onRegister, onLogin, accounts, regSuccess, onGoLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); const [country, setCountry] = useState(""); const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const T = THEME.light;
  const cities = COUNTRIES.find(c => c.name === country)?.cities || [];

  const handleRegister = () => {
    if (!name.trim() || !email.trim() || !password.trim()) { setError("Plotsoni te gjitha fushat e detyrueshme"); return; }
    if (email.trim() === ADMIN_CREDENTIALS.email) { setError("Ky email nuk mund te regjistrohet"); return; }
  if (email.trim() === ADMIN_CREDENTIALS.email) { setError("Ky email nuk mund te regjistrohet"); return; }
  if (accounts.find(a => a.email === email.trim())) { setError("Ky email eshte i regjistruar tashme"); return; }
    setError("");
    onRegister({ id: uid(), name: name.trim(), email: email.trim(), password: password.trim(), phone: phone.trim(), country, city, address: "", facebook: "", instagram: "", website: "", registeredAt: new Date().toISOString(), expiresIn: "30 dite", payments: [{ amount: "0.00E", date: new Date().toISOString(), validFor: "30 dite" }] });
  };
  const handleLogin = () => {
    if (!email.trim() || !password.trim()) { setError("Shkruani emailin dhe fjalekalimin"); return; }
    // Check admin first
    if (email.trim() === ADMIN_CREDENTIALS.email && password.trim() === ADMIN_CREDENTIALS.password) {
      setError(""); onLogin({ email: ADMIN_CREDENTIALS.email, password: ADMIN_CREDENTIALS.password, role: "admin" });
      return;
    }
    const account = accounts.find(a => a.email === email.trim() && a.password === password.trim());
    if (!account) { setError("Email ose fjalekalim i gabuar"); return; }
    if (getAccountStatus(account) === "suspended") { setError("Llogaria juaj është pezulluar. Kontaktoni administratorin."); return; }
    setError(""); onLogin(account, rememberMe);
  };

  return (
    <div onKeyDown={e => { if (e.key === "Enter") { const btn = e.currentTarget.querySelector("button[data-enter]"); if (btn) btn.click(); }}} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 50%, #f0f4f8 100%)", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "48px 40px", width: "90%", maxWidth: 440, boxShadow: "0 20px 60px rgba(14,165,233,.14)", border: "1px solid #e0f2fe" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src="./icon.png" alt="DataPOS" style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 8 }} />
                <div style={{ fontSize: 36, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>POS</span></div>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "8px 0 0" }}>{mode === "register" ? "Regjistro biznesin tend" : "Kyqu ne llogarine tende"}</p>
        </div>
        {error && <div style={{ background: "#FEE2E2", color: "#EF4444", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{error}</div>}
        {mode === "register" ? (
          <>
            <Input label="Emri Biznesit" value={name} onChange={setName} placeholder="p.sh. TechFix Mobile" required t={T} />
            <Input label="Email" value={email} onChange={setEmail} placeholder="email@biznesi.com" type="email" required t={T} />
            <Input label="Fjalekalimi" value={password} onChange={setPassword} placeholder="Shkruaj fjalekalimin" type="password" required t={T} />
            <Input label="Numri Kontaktues" value={phone} onChange={setPhone} placeholder="044 123 456" t={T} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Select label="Shteti" value={country} onChange={v => { setCountry(v); setCity(""); }} options={COUNTRIES.map(c => c.name)} placeholder="Shteti" t={T} />
              <Select label="Qyteti" value={city} onChange={setCity} options={cities} placeholder="Qyteti" t={T} />
            </div>
            {regSuccess ? (
                <div style={{ background: "#D1FAE5", border: "1.5px solid #059669", borderRadius: 12, padding: "20px 16px", textAlign: "center", marginTop: 8 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ fontWeight: 800, color: "#059669", fontSize: 16, marginBottom: 4 }}>U regjistruat me sukses!</div>
                  <div style={{ color: "#065f46", fontSize: 13, marginBottom: 16 }}>Tani mund të kyqeni me llogarinë tuaj.</div>
                  <Btn onClick={() => { onGoLogin(); setMode("login"); setError(""); }} variant="success" size="lg" style={{ width: "100%", justifyContent: "center" }} t={T}>KYQU TANI</Btn>
                </div>
              ) : (
                <Btn onClick={handleRegister} variant="primary" size="lg" disabled={!name.trim() || !email.trim() || !password.trim()} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T} data-enter="1">REGJISTRO BIZNESIN</Btn>
              )}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Jeni regjistruar? </span>
              <span onClick={() => { setMode("login"); setError(""); }} style={{ color: T.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Kyqu ketu</span>
            </div>
          </>
        ) : (
          <>
            <Input label="Email" value={email} onChange={setEmail} placeholder="email@biznesi.com" type="email" required t={T} />
            <Input label="Fjalekalimi" value={password} onChange={setPassword} placeholder="Shkruaj fjalekalimin" type="password" required t={T} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 4px" }}>
              <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#0EA5E9" }} />
              <label htmlFor="rememberMe" style={{ fontSize: 13, color: "#64748b", cursor: "pointer", userSelect: "none" }}>Më mbaj mend</label>
            </div>
            <Btn onClick={handleLogin} variant="primary" size="lg" disabled={!email.trim() || !password.trim()} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T} data-enter="1">KYQU</Btn>
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Nuk keni llogari? </span>
              <span onClick={() => { setMode("register"); setError(""); }} style={{ color: T.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Regjistrohu ketu</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// StatCard
// ============================================================
function StatCard({ label, count, color, active, onClick, T }) {
  return (
    <div onClick={onClick} style={{ background: active ? color : T.surface, color: active ? "#fff" : T.text, borderRadius: 14, padding: "16px 20px", textAlign: "center", cursor: "pointer", transition: "all .2s", minWidth: 100, border: active ? "none" : `2px solid ${color}30`, boxShadow: active ? `0 4px 20px ${color}50` : "none" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", opacity: 0.85, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{count}</div>
    </div>
  );
}

// ============================================================
// Dashboard
// ============================================================
function Dashboard({ data, setData, onNavigate, currentWorker, T }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState(""); const [dateFilter, setDateFilter] = useState(""); const [statusFilter, setStatusFilter] = useState(""); const [workerFilter, setWorkerFilter] = useState("");
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayJobs = data.jobs.filter(j => j.createdAt.slice(0, 10) === todayStr);
  const todayDone = todayJobs.filter(j => j.status === "perfunduar" || j.status === "nuk_merret");
  const statusCounts = () => STATUSES.map(s => ({ ...s, count: data.jobs.filter(j => j.status === s.key).length }));
  const filteredJobs = data.jobs.filter(j => {
    if (filter !== "all" && j.status !== filter) return false;
    if (search) { const s = search.toLowerCase(); const cl = data.clients.find(c => c.id === j.clientId); if (!(cl?.name?.toLowerCase().includes(s) || j.imei?.toLowerCase().includes(s) || j.phoneModel?.toLowerCase().includes(s))) return false; }
    if (statusFilter && j.status !== statusFilter) return false;
    if (workerFilter && j.workerId !== workerFilter) return false;
    if (dateFilter && j.createdAt.slice(0, 10) !== dateFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalRevenue = data.jobs.filter(j => j.status === "perfunduar" && j.price).reduce((sum, j) => sum + parseFloat(j.price || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>Ballina</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={() => exportJobsCSV(filteredJobs, data.clients, data.workers)} variant="outline" size="sm" t={T}>{Ic.download(13)} Eksporto CSV</Btn>
          <Btn onClick={() => onNavigate("createJob")} variant="primary" t={T}>{Ic.plus(14)} Shto pune</Btn>
        </div>
      </div>

      <StaleAlert jobs={data.jobs} onNavigate={onNavigate} t={T} />

      {currentWorker && (
        <div style={{ background: T.surface, borderRadius: 16, padding: "20px 24px", marginBottom: 16, border: `1.5px solid ${T.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{currentWorker.name}</div>
          <div style={{ display: "flex", gap: 20, marginTop: 8, fontSize: 13, color: T.textMuted }}>
            <span>Pune aktive: <strong style={{ color: T.accent }}>{data.jobs.filter(j => j.workerId === currentWorker.id && !["perfunduar","nuk_merret"].includes(j.status)).length}</strong></span>
            <span>Punuar: <strong style={{ color: T.success }}>{data.jobs.filter(j => j.workerId === currentWorker.id && j.status === "perfunduar").length}</strong></span>
          </div>
        </div>
      )}

      {/* Revenue summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Te gjitha punet", val: data.jobs.length, color: T.accent },
          { label: "Aktive", val: data.jobs.filter(j => !["perfunduar","nuk_merret"].includes(j.status)).length, color: "#D97706" },
          { label: "Perfunduara", val: data.jobs.filter(j => j.status === "perfunduar").length, color: T.success },
          { label: "Te ardhura (€)", val: `${totalRevenue.toFixed(2)}€`, color: "#8B5CF6" },
        ].map(item => (
          <div key={item.label} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: item.color, marginTop: 4 }}>{item.val}</div>
          </div>
        ))}
      </div>

      <div style={{ background: T.surface, borderRadius: 20, padding: 24, marginBottom: 16, border: `1.5px solid ${T.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: 1 }}>+{todayJobs.length} PUNE TE REJA SOT</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{todayDone.length} PUNE TE PROCESUARA / KRYERA SOT</div>
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          {statusCounts().map(s => <StatCard key={s.key} label={`${s.label} | sot`} count={s.count} color={s.color} active={filter === s.key} onClick={() => setFilter(filter === s.key ? "all" : s.key)} T={T} />)}
        </div>
      </div>

      <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}` }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textFaint, display: "flex" }}>{Ic.search(14)}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kerko me emer, numer, telefon ose imei" style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, outline: "none", background: T.inputBg, color: T.text, boxSizing: "border-box" }} />
          </div>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.inputBg, color: T.text, outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 12, background: T.inputBg, color: T.text }}><option value="">Zgjedh Statusin</option>{STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
          <select value={workerFilter} onChange={e => setWorkerFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 12, background: T.inputBg, color: T.text }}><option value="">Zgjedh puntorin</option>{data.workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <Btn variant="ghost" size="sm" onClick={() => { setFilter("all"); setSearch(""); setDateFilter(""); setStatusFilter(""); setWorkerFilter(""); }} t={T}>Largo filtrat</Btn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr 0.8fr 0.8fr 1.2fr 0.8fr", padding: "10px 16px", fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${T.border}` }}>
          <span>Klienti</span><span>Status</span><span>Telefoni</span><span>IMEI</span><span>Pershkrimi</span><span>Puntori</span><span>Çmimi</span><span>Data pranimit</span><span>Action</span>
        </div>
        {filteredJobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: T.textFaint, fontSize: 14 }}>Ska asnje rezultat!</div>
        ) : filteredJobs.map(job => {
          const cl = data.clients.find(c => c.id === job.clientId);
          const wk = data.workers.find(w => w.id === job.workerId);
          const stale = !["perfunduar","nuk_merret"].includes(job.status) && daysOld(job.createdAt) >= 3;
          return (
            <div key={job.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr 0.8fr 0.8fr 1.2fr 0.8fr", padding: "14px 16px", fontSize: 13, alignItems: "center", borderBottom: `1px solid ${T.border}`, cursor: "pointer", transition: "background .15s", background: stale ? `${T.danger}08` : "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = stale ? `${T.danger}08` : "transparent"}
              onClick={() => onNavigate("jobDetail", job.id)}>
              <span style={{ fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
                {stale && <span title={`${daysOld(job.createdAt)} dite`} style={{ color: "#DC2626", display: "flex" }}>{Ic.warn(12)}</span>}
                {cl?.name || "—"}
              </span>
              <span><Badge status={job.status} t={T} /></span>
              <span style={{ color: T.textMuted }}>{job.phoneModel}</span>
              <span style={{ color: job.imei ? T.textMuted : T.danger, display: "flex", alignItems: "center" }}>{job.imei || Ic.xred(12)}</span>
              <span style={{ color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.description}</span>
              <span style={{ color: T.textMuted }}>{wk?.name || "—"}</span>
              <span style={{ color: job.price ? T.success : T.textFaint, fontWeight: job.price ? 700 : 400 }}>{job.price ? `${job.price}€` : "—"}</span>
              <span style={{ color: T.textMuted, fontSize: 12 }}>{fmtDate(job.createdAt)}<br/><span style={{ color: T.textFaint, fontSize: 11 }}>{timeAgo(job.createdAt)}</span></span>
              <span style={{ display: "flex", gap: 4 }}>
                <button onClick={e => { e.stopPropagation(); onNavigate("jobDetail", job.id); }} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.edit(12)}</button>
                <button onClick={e => { e.stopPropagation(); if (window.confirm("Je i sigurt?")) setData(d => ({ ...d, jobs: d.jobs.filter(j => j.id !== job.id) })); }} style={{ background: T.danger, color: "#fff", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.trash(12)}</button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Workers
// ============================================================
function Workers({ data, setData, T }) {
  const [showAdd, setShowAdd] = useState(false); const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const addWorker = () => { if (!name.trim()) return; setData(d => ({ ...d, workers: [...d.workers, { id: uid(), name: name.trim(), phone: phone.trim(), createdAt: new Date().toISOString() }] })); setName(""); setPhone(""); setShowAdd(false); };
  const deleteWorker = (id) => { if (window.confirm("Je i sigurt?")) setData(d => ({ ...d, workers: d.workers.filter(w => w.id !== id) })); };
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const now = new Date();
  const last6 = Array.from({ length: 6 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1); return { month: months[d.getMonth()], key: `${d.getFullYear()}-${d.getMonth()}` }; });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>Puntoret</h2>
        <Btn onClick={() => setShowAdd(true)} variant="primary" t={T}>{Ic.plus(14)} Krijo puntor</Btn>
      </div>
      <div style={{ background: T.surface, borderRadius: 20, padding: 24, marginBottom: 20, border: `1.5px solid ${T.border}` }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: T.text }}>Performanca e puntoreve</h3>
        <p style={{ fontSize: 12, color: T.textFaint, margin: "0 0 20px" }}>Punet me te gjitha statuset. Per 6 muaj.</p>
        <div style={{ display: "flex", alignItems: "end", gap: 8, height: 120, marginBottom: 8 }}>
          {last6.map(m => { const count = data.jobs.filter(j => { const d = new Date(j.createdAt); return `${d.getFullYear()}-${d.getMonth()}` === m.key; }).length; const maxH = Math.max(...last6.map(m2 => data.jobs.filter(j => { const d = new Date(j.createdAt); return `${d.getFullYear()}-${d.getMonth()}` === m2.key; }).length), 1); return (
            <div key={m.key} style={{ flex: 1, textAlign: "center" }}><div style={{ height: Math.max((count / maxH) * 100, 4), background: T.accentGrad, borderRadius: "6px 6px 0 0", margin: "0 auto", width: "60%" }} /><div style={{ fontSize: 10, color: T.textFaint, marginTop: 6 }}>{m.month}</div></div>
          ); })}
        </div>
      </div>
      <div style={{ background: T.surface, borderRadius: 20, padding: 24, marginBottom: 20, border: `1.5px solid ${T.border}` }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: T.text }}>Tabela e statistikave</h3>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>Total: {data.jobs.length}</div>
        {data.workers.length === 0 ? <div style={{ padding: "20px 0", color: T.textFaint, fontSize: 14 }}>0 Puntore</div> : data.workers.map(w => {
          const wJobs = data.jobs.filter(j => j.workerId === w.id);
          const wRevenue = wJobs.filter(j => j.status === "perfunduar" && j.price).reduce((s, j) => s + parseFloat(j.price || 0), 0);
          return (<div key={w.id} style={{ background: T.surfaceAlt, borderRadius: 12, padding: 16, marginTop: 12, border: `1px solid ${T.border}` }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: T.text, display: "flex", justifyContent: "space-between" }}>
              <span>{w.name}</span>
              <span style={{ fontSize: 13, color: T.success, fontWeight: 600 }}>{wRevenue.toFixed(2)}€ te ardhura</span>
            </div>
            {STATUSES.map(s => <div key={s.key} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: T.textMuted }}><span>{s.label}</span><span style={{ fontWeight: 600 }}>{wJobs.filter(j => j.status === s.key).length}</span></div>)}
          </div>);
        })}
      </div>
      <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}` }}>
        <div className="workers-table-header" style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px", padding: "10px 16px", fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", borderBottom: `2px solid ${T.border}` }}><span>#</span><span>Emri</span><span>Numri</span><span>Manage</span></div>
        {data.workers.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: T.textFaint, fontSize: 14 }}>Nuk ka puntor te regjistruar!</div> : data.workers.map((w, i) => (
          <div key={w.id} className="workers-table-row" style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px", padding: "14px 16px", fontSize: 13, borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
            <span style={{ color: T.textFaint }}>{i + 1}</span><span style={{ fontWeight: 600, color: T.text }}>{w.name}</span><span style={{ color: T.textMuted }}>{w.phone}</span>
            <button onClick={() => deleteWorker(w.id)} style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Fshij</button>
          </div>
        ))}
      </div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Shto puntorin te ri" t={T}>
        <Input label="Emri" value={name} onChange={setName} placeholder="Emri i puntorit" required t={T} />
        <Input label="Numri tel." value={phone} onChange={setPhone} placeholder="044123123" t={T} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}><Btn variant="ghost" onClick={() => setShowAdd(false)} t={T}>Mbyll</Btn><Btn variant="primary" onClick={addWorker} disabled={!name.trim()} t={T}>Shto puntorin</Btn></div>
      </Modal>
    </div>
  );
}

// ============================================================
// Clients
// ============================================================
function Clients({ data, setData, onNavigate, T }) {
  const [search, setSearch] = useState("");
  const [selectedClientJobs, setSelectedClientJobs] = useState(null);
  const sorted = [...data.clients].sort((a, b) => data.jobs.filter(j => j.clientId === b.id).length - data.jobs.filter(j => j.clientId === a.id).length);
  const filtered = sorted.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const top4 = sorted.slice(0, 4);
  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: T.text }}>Klientat</h2>
      {top4.length > 0 && <div style={{ background: T.surface, borderRadius: 20, padding: 24, marginBottom: 20, border: `1.5px solid ${T.border}` }}><h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: T.textMuted }}>Top 4 klientat</h3><div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{top4.map(c => <div key={c.id} style={{ background: T.surfaceAlt, borderRadius: 12, padding: "12px 20px", border: `1px solid ${T.border}` }}><div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{c.name}</div><div style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>{data.jobs.filter(j => j.clientId === c.id).length} pune</div></div>)}</div></div>}
      <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text }}>Tabela e klientave</h3>
          <div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textFaint, display: "flex" }}>{Ic.search(13)}</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kerko me emer ose me numer" style={{ padding: "8px 12px 8px 32px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, width: 220, background: T.inputBg, color: T.text, outline: "none" }} /></div>
        </div>
        <div className="clients-table-header" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 0.8fr", padding: "10px 16px", fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", borderBottom: `2px solid ${T.border}` }}><span>Emri</span><span>Numri</span><span>Nr.Puneve</span><span>Regjistruar</span><span>Menaxho</span></div>
        {filtered.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: T.textFaint, fontSize: 14 }}>Nuk ka klienta! <span onClick={() => onNavigate("createJob")} style={{ color: T.accent, cursor: "pointer", textDecoration: "underline" }}>Shto klienta</span></div> : filtered.map(c => (
          <div key={c.id} className="clients-table-row" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 0.8fr", padding: "14px 16px", fontSize: 13, borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: T.text }}>{c.name}</span><span style={{ color: T.textMuted }}>{c.phone}</span><span style={{ fontWeight: 700, color: T.accent }}>{data.jobs.filter(j => j.clientId === c.id).length}</span><span style={{ color: T.textMuted, fontSize: 12 }}>{fmtDate(c.createdAt)}</span>
            <div style={{ display: "flex", gap: 6 }}><button onClick={() => setSelectedClientJobs(c)} style={{ background: "#DBEAFE", color: "#1E40AF", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>📋 Punët</button><button onClick={() => { if (window.confirm("Fshi?")) setData(d => ({ ...d, clients: d.clients.filter(cl => cl.id !== c.id) })); }} style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Fshij</button></div>
          </div>
        ))}
      </div>
      {selectedClientJobs && (
        <Modal open={true} onClose={() => setSelectedClientJobs(null)} title={"Punët e " + selectedClientJobs.name} width={600} t={T}>
          {data.jobs.filter(j => j.clientId === selectedClientJobs.id).length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: T.textFaint }}>Ky klient nuk ka punë të regjistruara.</div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {data.jobs.filter(j => j.clientId === selectedClientJobs.id).map(j => {
                const st = STATUSES.find(s => s.key === j.status) || STATUSES[0];
                return (
                  <div key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid " + T.border, gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{j.phoneModel}</div>
                      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{fmtDate(j.createdAt)} · #{j.id.slice(-6)}</div>
                    </div>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                    <button onClick={() => { setSelectedClientJobs(null); onNavigate("jobDetail", j.id); }} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Hap Raportin</button>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}


// ============================================================
// Detailed Report
// ============================================================
function DetailedReport({ job, client, worker, business, T, accountId }) {
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [generated, setGenerated] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Load report from Supabase when component opens
  useEffect(() => {
    if (!generated || !job?.id || !accountId) return;
    (async () => {
      setLoadingReport(true);
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('job_id', job.id)
          .maybeSingle();
        if (!error && data) {
          setReportId(data.id);
          setNotes(Array.isArray(data.notes) ? data.notes : []);
        }
      } catch (e) { console.error('load report:', e); }
      setLoadingReport(false);
    })();
  }, [generated, job?.id, accountId]);

  // Save notes to Supabase whenever they change (debounced via effect)
  useEffect(() => {
    if (!generated || !job?.id || !accountId || loadingReport) return;
    const timer = setTimeout(async () => {
      try {
        if (reportId) {
          await supabase.from('reports').update({
            notes: notes,
            updated_at: new Date().toISOString(),
          }).eq('id', reportId);
        } else if (notes.length > 0) {
          const { data, error } = await supabase.from('reports').insert({
            job_id: job.id,
            account_id: accountId,
            notes: notes,
          }).select().single();
          if (!error && data) setReportId(data.id);
        }
      } catch (e) { console.error('save report:', e); }
    }, 500);
    return () => clearTimeout(timer);
  }, [notes, generated, reportId, job?.id, accountId, loadingReport]);

  const addNote = () => {
    if (!noteInput.trim()) return;
    setNotes(n => [...n, { text: noteInput.trim(), at: new Date().toISOString() }]);
    setNoteInput("");
  };

  const getReportHTML = () => {
    const statusLabel = STATUSES.find(s => s.key === job.status)?.label || job.status;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Raport - ${job.phoneModel}</title>
<style>
  body{font-family:Arial,sans-serif;padding:32px;color:#111;font-size:13px;max-width:800px;margin:0 auto}
  h1{font-size:18px;margin-bottom:4px}
  .sub{color:#666;font-size:12px;margin-bottom:24px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
  .label{font-size:11px;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:4px}
  .val{font-size:14px;font-weight:600}
  hr{border:none;border-top:1px solid #e5e7eb;margin:16px 0}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px}
  .desc{background:#f8fafc;border-radius:8px;padding:12px 16px;line-height:1.7;font-size:13px;color:#374151;margin-top:8px}
  .note{background:#f8fafc;border-left:3px solid #3B82F6;padding:10px 14px;margin-bottom:8px;border-radius:0 6px 6px 0}
  .note-meta{font-size:11px;color:#94a3b8;margin-top:4px}
  @media print{body{padding:16px}.no-print{display:none}}
</style></head><body>
<h1>Raport i Detajuar — ${job.phoneModel}</h1>
<div class="sub">${business?.name || ""} · Gjeneruar: ${new Date().toLocaleString("sq-AL")}</div>
<div class="grid">
  <div><div class="label">Klienti</div><div class="val">${client?.name || "—"}</div><div style="color:#64748b;font-size:12px">${client?.phone || ""}</div></div>
  <div><div class="label">Pajisja</div><div class="val">${job.phoneModel}</div><div style="color:#64748b;font-size:12px">IMEI: ${job.imei || "—"}</div></div>
</div>
<hr/>
<div class="row"><span>Puntori</span><span><b>${worker?.name || "—"}</b></span></div>
<div class="row"><span>Statusi</span><span><b>${statusLabel}</b></span></div>
<div class="row"><span>Çmimi</span><span><b>${job.price ? job.price + "€" : "—"}</b></span></div>
<div class="row"><span>Data pranimit</span><span>${new Date(job.createdAt).toLocaleDateString("sq-AL")}</span></div>
<div class="row"><span>Kodi</span><span>${job.code || "—"}</span></div>
<hr/>
<div class="label">Pershkrimi</div>
<div class="desc">${job.description}</div>
${notes.length > 0 ? `<hr/><div class="label" style="margin-bottom:8px">Shënimet shtesë</div>${notes.map(n => `<div class="note">${n.text}<div class="note-meta">${new Date(n.at).toLocaleString("sq-AL")}</div></div>`).join("")}` : ""}
</body></html>`;
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    w.document.write(getReportHTML());
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  const handleSavePDF = () => {
    const html = getReportHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "raport-" + job.phoneModel.replace(/\s/g, "-") + "-" + job.id.slice(0, 6) + ".html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusLabel = STATUSES.find(s => s.key === job.status)?.label || job.status;

  if (!generated) return (
    <button onClick={() => setGenerated(true)} style={{ width: "100%", padding: "12px", background: T.accent + "15", color: T.accent, border: "1.5px dashed " + T.accent, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 12 }}>
      + Gjenero raportin e detajuar
    </button>
  );

  return (
    <div style={{ background: T.surfaceAlt, borderRadius: 16, padding: 20, marginTop: 12, border: "1.5px solid " + T.border }}>
      <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: T.text }}>Raport i detajuar</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[["Klienti", client?.name || "—"], ["Pajisja", job.phoneModel], ["IMEI", job.imei || "—"], ["Puntori", worker?.name || "—"], ["Statusi", statusLabel], ["Çmimi", job.price ? job.price + "€" : "—"], ["Data", new Date(job.createdAt).toLocaleDateString("sq-AL")], ["Kodi", job.code || "—"]].map(([k, v]) => (
          <div key={k} style={{ background: T.surface, borderRadius: 10, padding: "10px 14px", border: "1px solid " + T.border }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.textFaint, marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ background: T.surface, borderRadius: 10, padding: "12px 16px", marginBottom: 16, border: "1px solid " + T.border }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.textFaint, marginBottom: 8 }}>Pershkrimi</div>
        <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7 }}>{job.description}</div>
      </div>
      {notes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.textFaint, marginBottom: 8 }}>Shënimet shtesë</div>
          {notes.map((n, i) => (
            <div key={i} style={{ background: T.surface, borderLeft: "3px solid " + T.accent, borderRadius: "0 10px 10px 0", padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: T.text }}>{n.text}</div>
              <div style={{ fontSize: 11, color: T.textFaint, marginTop: 4 }}>{new Date(n.at).toLocaleString("sq-AL")}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.textFaint, marginBottom: 8 }}>Shto shënim shtesë</div>
        <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} rows={3} placeholder="Vërejtje teknike, rezultate diagnostike, rekomandime..." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid " + T.border, fontSize: 13, background: T.inputBg, color: T.text, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <Btn variant="primary" size="sm" onClick={addNote} disabled={!noteInput.trim()} t={T}>Ruaj shënimin</Btn>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn variant="ghost" size="sm" onClick={handlePrint} t={T}>Printo raportin</Btn>
        <Btn variant="success" size="sm" onClick={handleSavePDF} t={T}>Ruaj si PDF</Btn>
      </div>
    </div>
  );
}

// ============================================================
// Create Job
// ============================================================
function CreateJob({ data, setData, onNavigate, T }) {
  const [clientSearch, setClientSearch] = useState(""); const [selectedClient, setSelectedClient] = useState(null); const [newClientPhone, setNewClientPhone] = useState("");
  const [workerId, setWorkerId] = useState(data.workers[0]?.id || ""); const [phoneModel, setPhoneModel] = useState(""); const [imei, setImei] = useState(""); const [code, setCode] = useState(""); const [description, setDescription] = useState(""); const [price, setPrice] = useState(""); const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPrintCoupon, setShowPrintCoupon] = useState(false);
  const [createdJobData, setCreatedJobData] = useState(null);
  const matchingClients = data.clients.filter(c => clientSearch && (c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch)));

  const handleSubmit = () => {
    if (!phoneModel.trim() || !description.trim()) return;
    let clientId = selectedClient?.id;
    if (!clientId && clientSearch.trim()) { const nc = { id: uid(), name: clientSearch.trim(), phone: newClientPhone.trim(), createdAt: new Date().toISOString() }; setData(d => ({ ...d, clients: [...d.clients, nc] })); clientId = nc.id; }
    const job = { id: uid(), clientId, workerId, phoneModel: phoneModel.trim(), imei: imei.trim(), code: code.trim(), description: description.trim(), price: price.trim(), status: "new", createdAt: new Date().toISOString() };
    setData(d => ({ ...d, jobs: [...d.jobs, job], history: [...d.history, { id: uid(), jobId: job.id, type: "status_change", from: null, to: "new", by: data.workers.find(w => w.id === workerId)?.name || "System", at: new Date().toISOString(), public: false }] }));
    // Save to Supabase for QR scanning
    const cl = selectedClient || { name: clientSearch.trim(), phone: newClientPhone.trim() };
    const wk = data.workers.find(w => w.id === workerId);
    saveJobToSupabase(job, cl, wk, data.business);
    setCreatedJobData({ job, client: cl, worker: wk, business: data.business });
    setShowPrintCoupon(true);
  };

  const handleCloseCoupon = () => {
    setShowPrintCoupon(false);
    onNavigate("dashboard");
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: T.text }}>Regjistro punen</h2>
      <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: `1.5px solid ${T.border}` }}>
        <div style={{ background: `${T.accent}10`, borderRadius: 14, padding: "20px 24px", marginBottom: 24, borderLeft: `4px solid ${T.accent}` }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: T.accent }}>Klienti</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <Input label="Klienti" value={clientSearch} onChange={v => { setClientSearch(v); setSelectedClient(null); setShowSuggestions(true); }} placeholder="Kerko klientin" required t={T} />
              {showSuggestions && matchingClients.length > 0 && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: T.surface, borderRadius: 10, border: `1.5px solid ${T.border}`, boxShadow: "0 8px 24px rgba(0,0,0,.12)", maxHeight: 150, overflowY: "auto" }}>{matchingClients.map(c => <div key={c.id} onClick={() => { setSelectedClient(c); setClientSearch(c.name); setNewClientPhone(c.phone); setShowSuggestions(false); }} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, borderBottom: `1px solid ${T.border}`, color: T.text }} onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><strong>{c.name}</strong> — {c.phone}</div>)}</div>}
            </div>
            <Input label="Numri tel." value={newClientPhone} onChange={setNewClientPhone} placeholder="Numri kontaktues" t={T} />
          </div>
          {!selectedClient && clientSearch && <Btn variant="outline" size="sm" onClick={() => { const nc = { id: uid(), name: clientSearch.trim(), phone: newClientPhone.trim(), createdAt: new Date().toISOString() }; setData(d => ({ ...d, clients: [...d.clients, nc] })); setSelectedClient(nc); }} t={T}>Zgjedh/Shto klientin</Btn>}
        </div>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: T.accent }}>Puna re</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Klienti zgjedhur" value={selectedClient?.name || clientSearch} onChange={() => {}} placeholder="Asnje" t={T} />
          <Select label="Puntori" value={workerId} onChange={setWorkerId} required options={data.workers.map(w => ({ value: w.id, label: w.name }))} placeholder="Zgjedh puntorin" t={T} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          <Input label="Modeli telefonit" value={phoneModel} onChange={setPhoneModel} placeholder="iPhone 12 blu" required t={T} />
          <Input label="IMEI" value={imei} onChange={setImei} placeholder="3576647773..." t={T} />
          <Input label="Kodi" value={code} onChange={setCode} placeholder="123456" t={T} />
          <Input label="Çmimi (€)" value={price} onChange={setPrice} placeholder="0.00" type="number" t={T} />
        </div>
        <Textarea label="Pershkrimi" value={description} onChange={setDescription} placeholder="Shenuaj detaje rreth punes." required rows={4} t={T} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}><Btn variant="primary" size="lg" onClick={handleSubmit} disabled={!phoneModel.trim() || !description.trim()} t={T}>Shto Punen</Btn></div>
      </div>
      {showPrintCoupon && createdJobData && <PrintCouponConfirm job={createdJobData.job} client={createdJobData.client} worker={createdJobData.worker} business={createdJobData.business} onClose={handleCloseCoupon} />}
    </div>
  );
}

// ============================================================
// Job Detail
// ============================================================
function JobDetail({ data, setData, jobId, onNavigate, T }) {
  const [showMsg, setShowMsg] = useState(false); const [showCoupon, setShowCoupon] = useState(false); const [showClientView, setShowClientView] = useState(false);
  const [msgTitle, setMsgTitle] = useState(""); const [msgBody, setMsgBody] = useState(""); const [msgPublic, setMsgPublic] = useState(false);
  const [editField, setEditField] = useState(null); const [editValue, setEditValue] = useState("");

  const job = data.jobs.find(j => j.id === jobId);
  if (!job) return <div style={{ padding: 40, textAlign: "center", color: T.textFaint }}>Puna nuk u gjet.</div>;
  const client = data.clients.find(c => c.id === job.clientId);
  const worker = data.workers.find(w => w.id === job.workerId);
  const jobHistory = data.history.filter(h => h.jobId === jobId).sort((a, b) => new Date(b.at) - new Date(a.at));
  const jobMessages = data.messages.filter(m => m.jobId === jobId).sort((a, b) => new Date(b.at) - new Date(a.at));

  const [showMsgSend, setShowMsgSend] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const changeStatus = (ns) => {
    if (ns === job.status) return;
    const updatedJob = { ...job, status: ns };
    updateJobStatusSupabase(jobId, ns, updatedJob, client, worker, data.business);
    setData(d => ({ ...d, jobs: d.jobs.map(j => j.id === jobId ? { ...j, status: ns } : j), history: [...d.history, { id: uid(), jobId, type: "status_change", from: job.status, to: ns, by: worker?.name || "System", at: new Date().toISOString(), public: true }] }));
    setPendingStatus(ns);
    setShowMsgSend(true);
  };
  const saveEdit = (field) => { setData(d => ({ ...d, jobs: d.jobs.map(j => j.id === jobId ? { ...j, [field]: editValue } : j) })); setEditField(null); };
  const addMessage = () => { if (!msgTitle.trim()) return; setData(d => ({ ...d, messages: [...d.messages, { id: uid(), jobId, title: msgTitle.trim(), body: msgBody.trim(), public: msgPublic, at: new Date().toISOString() }] })); setMsgTitle(""); setMsgBody(""); setMsgPublic(false); setShowMsg(false); };

  if (showClientView) return <ClientStatusView job={job} client={client} worker={worker} business={data.business} onBack={() => setShowClientView(false)} />;

  const EF = ({ label, field, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 600 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {editField === field ? (
          <><input value={editValue} onChange={e => setEditValue(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: `1.5px solid ${T.accent}`, fontSize: 13, outline: "none", width: 180, background: T.inputBg, color: T.text }} autoFocus onKeyDown={e => e.key === "Enter" && saveEdit(field)} />
          <button onClick={() => saveEdit(field)} style={{ background: T.success, color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>{Ic.check(11)}</button>
          <button onClick={() => setEditField(null)} style={{ background: T.danger, color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>{Ic.x(11)}</button></>
        ) : (
          <><span style={{ fontSize: 14, fontWeight: 600, color: value ? T.text : T.danger, display: "flex", alignItems: "center" }}>{value || Ic.xred(12)}</span>
          <button onClick={() => { setEditField(field); setEditValue(value || ""); }} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.edit(11)}</button></>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>Perditso punen</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" size="sm" onClick={() => setShowClientView(true)} t={T}>{Ic.eye(13)} Pamja e klientit</Btn>
          <Btn variant="dark" size="sm" onClick={() => setShowCoupon(true)} t={T}>{Ic.print(14)} Printo kuponin</Btn>
          <Btn variant="primary" size="sm" onClick={() => window.open(`https://wa.me/${client?.phone?.replace(/\s/g, "")}`, "_blank")} t={T}>WhatsApp</Btn>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: `1.5px solid ${T.border}` }}>
          <div style={{ fontSize: 12, color: T.textFaint, fontWeight: 600, textTransform: "uppercase" }}>NR.PUNEVE TE KLIENTIT: {data.jobs.filter(j => j.clientId === job.clientId).length}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: T.text }}>{client?.name || "—"}</h2>
            <button onClick={() => { setEditField("clientName"); setEditValue(client?.name || ""); }} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.edit(11)}</button>
          </div>
          <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>{client?.phone} <span style={{ cursor: "pointer", display: "inline-flex", color: T.textMuted }}>{Ic.phone(14)}</span> <span style={{ cursor: "pointer", display: "inline-flex", color: T.textMuted }}>{Ic.copy(14)}</span></div>
          <EF label="Status" field="_status" value={STATUSES.find(s => s.key === job.status)?.label} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 600 }}>Duke punu</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{worker?.name || "—"}</span>
              <select value={job.workerId} onChange={e => setData(d => ({ ...d, jobs: d.jobs.map(j => j.id === jobId ? { ...j, workerId: e.target.value } : j) }))} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, background: T.inputBg, color: T.text }}>{data.workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
            </div>
          </div>
          {/* Price field inline */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>{Ic.money(13)} Çmimi (€)</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {editField === "price" ? (
                <><input value={editValue} onChange={e => setEditValue(e.target.value)} type="number" style={{ padding: "6px 10px", borderRadius: 6, border: `1.5px solid ${T.accent}`, fontSize: 13, outline: "none", width: 100, background: T.inputBg, color: T.text }} autoFocus onKeyDown={e => e.key === "Enter" && saveEdit("price")} />
                <button onClick={() => saveEdit("price")} style={{ background: T.success, color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>{Ic.check(11)}</button>
                <button onClick={() => setEditField(null)} style={{ background: T.danger, color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>{Ic.x(11)}</button></>
              ) : (
                <><span style={{ fontSize: 15, fontWeight: 700, color: job.price ? T.success : T.textFaint }}>{job.price ? `${job.price}€` : "—"}</span>
                <button onClick={() => { setEditField("price"); setEditValue(job.price || ""); }} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.edit(11)}</button></>
              )}
            </div>
          </div>
          <EF label="Pranuar" field="_date" value={fmtDate(job.createdAt)} />
          <EF label="Telefoni" field="phoneModel" value={job.phoneModel} />
          <EF label="IMEI" field="imei" value={job.imei} />
          <EF label="Kodi" field="code" value={job.code} />
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8, color: T.text }}>Pershkrimi <button onClick={() => { setEditField("description"); setEditValue(job.description); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.accent, display: "inline-flex" }}>{Ic.edit(13)}</button></h3>
            {editField === "description" ? <div><textarea value={editValue} onChange={e => setEditValue(e.target.value)} rows={4} style={{ width: "100%", padding: 12, borderRadius: 10, border: `1.5px solid ${T.accent}`, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: T.inputBg, color: T.text }} /><div style={{ display: "flex", gap: 8, marginTop: 8 }}><Btn variant="primary" size="sm" onClick={() => saveEdit("description")} t={T}>Ruaj</Btn><Btn variant="ghost" size="sm" onClick={() => setEditField(null)} t={T}>Anulo</Btn></div></div> :
            <div style={{ background: T.surfaceAlt, borderRadius: 12, padding: 16, fontSize: 14, color: T.textMuted, lineHeight: 1.6, border: `1px solid ${T.border}`, minHeight: 60 }}>{job.description}</div>}
          </div>
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.text }}>Shënime shtesë</h3>
            <textarea value={job.notes || ""} onChange={e => setData(d => ({ ...d, jobs: d.jobs.map(j => j.id === jobId ? { ...j, notes: e.target.value } : j) }))} rows={3} placeholder="Shëno diçka shtesë..." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid " + T.border, fontSize: 13, background: T.inputBg, color: T.text, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Btn variant="primary" size="sm" onClick={() => showToast("U ruajt!")} t={T}>Ruaj</Btn>
              <Btn variant="success" size="sm" onClick={() => { setData(d => ({ ...d, jobs: d.jobs.map(j => j.id === jobId ? { ...j, showNotesOnCoupon: true } : j) })); showToast("Do te shfaqen ne kupon!"); }} t={T}>Ruaj dhe shfaq ne kupon</Btn>
            </div>
          </div>
          <DetailedReport job={job} client={client} worker={worker} business={data.business} T={T} accountId={data.business?.id} />
        </div>
        <div>
          <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}`, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: T.text }}>Menyja shpejte <span style={{ background: T.accent, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, display: "inline-flex", alignItems: "center" }}>{Ic.bolt(11)}</span></h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{STATUSES.map(s => <button key={s.key} onClick={() => changeStatus(s.key)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s", background: job.status === s.key ? s.color : T.surfaceAlt, color: job.status === s.key ? "#fff" : s.color, border: `2px solid ${s.color}`, opacity: job.status === s.key ? 0.8 : 1 }}>{s.label}</button>)}</div>
          </div>
          <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text }}>Historiku dhe mesazhet</h3>
              <Btn variant="primary" size="sm" onClick={() => setShowMsg(true)} t={T}>{Ic.plus(12)} Shto mesazh</Btn>
            </div>
            {jobMessages.map(m => <div key={m.id} style={{ background: `${T.accent}12`, borderRadius: 12, padding: 16, marginBottom: 12, borderLeft: `3px solid ${T.accent}` }}><div style={{ display: "flex", justifyContent: "space-between" }}><strong style={{ fontSize: 14, color: T.text }}>{m.title}</strong><span style={{ fontSize: 11, color: m.public ? T.success : T.textFaint, fontWeight: 600 }}>{m.public ? "Publik" : "Privat"}</span></div>{m.body && <p style={{ margin: "8px 0 0", fontSize: 13, color: T.textMuted }}>{m.body}</p>}<div style={{ fontSize: 11, color: T.textFaint, marginTop: 6 }}>{timeAgo(m.at)}</div></div>)}
            {jobHistory.map(h => <div key={h.id} style={{ background: T.surfaceAlt, borderRadius: 12, padding: 16, marginBottom: 12, borderLeft: `3px solid ${T.border}` }}><div style={{ display: "flex", justifyContent: "space-between" }}><strong style={{ fontSize: 14, color: T.text }}>Statusi u nderrua</strong><span style={{ fontSize: 11, color: h.public ? T.success : T.textFaint, fontWeight: 600 }}>{h.public ? "Publik" : "Privat"}</span></div><div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>{h.from && <Badge status={h.from} t={T} />}{h.from && <span style={{ color: T.textFaint, display: "flex" }}>{Ic.arrow(12)}</span>}<Badge status={h.to} t={T} /></div><div style={{ fontSize: 11, color: T.textFaint, marginTop: 6 }}>Detajet: {h.by} - {fmtDate(h.at)} <span style={{ marginLeft: 12 }}>{timeAgo(h.at)}</span></div></div>)}
            {jobHistory.length === 0 && jobMessages.length === 0 && <div style={{ textAlign: "center", padding: 20, color: T.textFaint, fontSize: 14 }}>Nuk ka mesazhe</div>}
          </div>
        </div>
      </div>
      <Modal open={showMsg} onClose={() => setShowMsg(false)} title="Shto mesazh" t={T}>
        <Input label="Titulli" value={msgTitle} onChange={setMsgTitle} placeholder="info" t={T} /><Textarea label="Mesazhi" value={msgBody} onChange={setMsgBody} placeholder="Shkruani mesazhin..." t={T} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.textMuted, marginBottom: 16, cursor: "pointer" }}><input type="checkbox" checked={msgPublic} onChange={e => setMsgPublic(e.target.checked)} /> Publik</label>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><Btn variant="ghost" onClick={() => setShowMsg(false)} t={T}>Mbyll</Btn><Btn variant="primary" onClick={addMessage} t={T}>Ruaj</Btn></div>
      </Modal>
      {showCoupon && <PrintCoupon job={job} client={client} worker={worker} business={data.business} onClose={() => setShowCoupon(false)} />}
      {showMsgSend && pendingStatus && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,20,30,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowMsgSend(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 32, width: "90%", maxWidth: 400, boxShadow: "0 24px 80px rgba(0,0,0,.2)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📱</div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>Dërgo njoftim klientit?</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Statusi u ndryshua në: <strong style={{ color: STATUSES.find(s=>s.key===pendingStatus)?.color }}>{STATUSES.find(s=>s.key===pendingStatus)?.label}</strong></p>
              {client?.phone && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#94a3b8" }}>Tel: {client.phone}</p>}
            </div>
            {client?.phone ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => {
                  const statusLabel = STATUSES.find(s=>s.key===pendingStatus)?.label || pendingStatus;
                  const msg = encodeURIComponent(`Pershendetje ${client?.name || ""}! Statusi i pajisjes suaj (${job.phoneModel}) eshte perditesuar ne: *${statusLabel}*. - ${data.business?.name || "Servisi"}`);
                  const phone = client.phone.replace(/[^0-9]/g, "");
                  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
                  setShowMsgSend(false);
                }} style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 12, padding: "14px", cursor: "pointer", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  💬 Dërgo në WhatsApp
                </button>
                <button onClick={() => {
                  const statusLabel = STATUSES.find(s=>s.key===pendingStatus)?.label || pendingStatus;
                  const msg = encodeURIComponent(`Pershendetje ${client?.name || ""}! Statusi i pajisjes suaj (${job.phoneModel}) eshte perditesuar ne: ${statusLabel}. - ${data.business?.name || "Servisi"}`);
                  const phone = client.phone.replace(/[^0-9]/g, "");
                  window.open(`viber://chat?number=${phone}&text=${msg}`, "_blank");
                  setShowMsgSend(false);
                }} style={{ background: "#7360F2", color: "#fff", border: "none", borderRadius: 12, padding: "14px", cursor: "pointer", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  💜 Dërgo në Viber
                </button>
                <button onClick={() => setShowMsgSend(false)} style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 12, padding: "12px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                  Mos dërgo
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 16 }}>Klienti nuk ka numër telefoni të regjistruar.</p>
                <button onClick={() => setShowMsgSend(false)} style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 12, padding: "12px 24px", cursor: "pointer", fontWeight: 600 }}>Mbyll</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Business Settings
// ============================================================
function BusinessSettings({ data, setData, T }) {
  const b = data.business;
  const [form, setForm] = useState({ ...b });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const save = () => setData(d => ({ ...d, business: { ...d.business, ...form } }));
  const statusCounts = STATUSES.map(s => ({ ...s, count: data.jobs.filter(j => j.status === s.key).length }));
  const thisMonth = data.jobs.filter(j => { const d = new Date(j.createdAt); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length;
  const last6 = data.jobs.filter(j => { const d = new Date(j.createdAt); const n = new Date(); return ((n.getFullYear() - d.getFullYear()) * 12 + n.getMonth() - d.getMonth()) <= 6; }).length;
  const totalRevenue = data.jobs.filter(j => j.status === "perfunduar" && j.price).reduce((s, j) => s + parseFloat(j.price || 0), 0);

  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: T.text }}>Biznesi</h2>
      <div style={{ background: T.surface, borderRadius: 20, padding: 24, marginBottom: 20, border: `1.5px solid ${T.border}` }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 14, color: T.textMuted, textAlign: "center" }}>Numri puneve sipas statusit</h3>
        <div style={{ background: T.surfaceAlt, borderRadius: 12, padding: 20, marginBottom: 20, border: `1px solid ${T.border}` }}>
          <div style={{ textAlign: "center", fontWeight: 700, marginBottom: 12, color: T.text }}>Te gjitha</div>
          {STATUSES.map(s => <div key={s.key} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}><span style={{ color: T.textMuted }}>{s.label}</span><span style={{ fontWeight: 700, color: T.text }}>{statusCounts.find(sc => sc.key === s.key)?.count || 0}</span></div>)}
          <div style={{ borderTop: `2px solid ${T.border}`, marginTop: 8, paddingTop: 8, fontSize: 18, fontWeight: 800, color: T.text }}>Total: {data.jobs.length}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          {[["Kete muaj", thisMonth], ["6 Muajt e fundit", last6], ["Te gjitha", data.jobs.length], ["Te ardhura", `${totalRevenue.toFixed(2)}€`]].map(([l, c]) => <div key={l} style={{ background: T.surfaceAlt, borderRadius: 12, padding: 16, textAlign: "center", border: `1px solid ${T.border}` }}><div style={{ fontSize: 12, color: T.textMuted }}>{l}</div><div style={{ fontSize: 22, fontWeight: 800, color: T.accent }}>{c}{typeof c === "number" && <span style={{ fontSize: 12, fontWeight: 400 }}> / pune</span>}</div></div>)}
        </div>
      </div>
      <div style={{ background: T.surface, borderRadius: 20, padding: 28, marginBottom: 20, border: `1.5px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}><h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>{b.name}</h2><span style={{ background: "#D1FAE5", color: "#10B981", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Aktiv</span>
                {b.expiryDate && <span style={{ background: "#DBEAFE", color: "#2563EB", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginLeft: 8 }}>{Math.max(0, Math.ceil((new Date(b.expiryDate) - new Date()) / 86400000))} ditë mbeten</span>}</div>
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px 16px", fontSize: 14 }}>
          <span style={{ color: T.textMuted, fontWeight: 600 }}>Email:</span><span style={{ color: T.text }}>{b.email || "—"}</span>
          <span style={{ color: T.textMuted, fontWeight: 600 }}>Adresa:</span><span style={{ color: T.text }}>{b.address || "—"}</span>
          <span style={{ color: T.textMuted, fontWeight: 600 }}>Numri Kontaktues:</span><span style={{ color: T.text }}>{b.phone || "—"}</span>
          <span style={{ color: T.textMuted, fontWeight: 600 }}>Regjistruar:</span><span style={{ color: T.text }}>{fmtDate(b.registeredAt)}</span>
          <span style={{ color: T.textMuted, fontWeight: 600 }}>Skadimi:</span><span style={{ color: T.accent, fontWeight: 600 }}>{b.expiryDate ? fmtDate(b.expiryDate) : (b.expiresIn || "Pa abonim")}</span>
        </div>
        <h3 style={{ margin: "24px 0 12px", fontSize: 15, fontWeight: 700, color: T.text }}>Pagesat e programit</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "10px 16px", fontSize: 12, fontWeight: 700, color: T.textMuted, borderBottom: `2px solid ${T.border}` }}><span>Shuma</span><span>Data pageses</span><span>Valide per</span></div>
        {(!b.payments || b.payments.length === 0) ? <div style={{ textAlign: "center", padding: "16px 0", color: T.textFaint, fontSize: 13 }}>Trial 30 ditë — Ska pagesa të regjistruara</div> : b.payments.map((p, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 16px", fontSize: 13, borderBottom: `1px solid ${T.border}`, color: T.text }}><span>{p.amount}</span><span>{fmtDate(p.date)}</span><span style={{ color: T.accent, fontWeight: 600 }}>{p.validFor}</span></div>)}
      </div>
      <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: `1.5px solid ${T.border}` }}>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: T.text }}>Logo e Biznesit</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 100, height: 100, borderRadius: 16, border: "2px dashed " + T.border, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: T.surfaceAlt }}>
              {form.logo ? <img src={form.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ color: T.textFaint, fontSize: 12, textAlign: "center" }}>Nuk ka logo</span>}
            </div>
            <div>
              <label style={{ display: "inline-block", padding: "10px 20px", background: T.accentGrad, color: "#fff", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Ngarko Logo
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => update("logo", ev.target.result); r.readAsDataURL(f); }} style={{ display: "none" }} />
              </label>
              {form.logo && <button onClick={() => update("logo", null)} style={{ marginLeft: 10, background: "none", border: "1.5px solid " + T.border, borderRadius: 10, padding: "10px 16px", cursor: "pointer", color: T.textMuted, fontSize: 13 }}>Largo logon</button>}
              <p style={{ margin: "8px 0 0", fontSize: 12, color: T.textFaint }}>PNG, JPG deri 2MB. Logo shfaqet ne kupon.</p>
            </div>
          </div>
        </div>


        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: T.text }}>Perditso te dhenat e biznesit <span style={{ background: T.accent, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, display: "inline-flex", alignItems: "center" }}>{Ic.edit(11)}</span></h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><Input label="Biznesi" value={form.name} onChange={v => update("name", v)} t={T} /><Input label="Numri Tel." value={form.phone || ""} onChange={v => update("phone", v)} t={T} /></div>
        <Input label="Email" value={form.email || ""} onChange={v => update("email", v)} t={T} />
        <Input label="Adresa" value={form.address || ""} onChange={v => update("address", v)} placeholder="Rruga Jonuzi objekti nr 128" t={T} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}><Input label="Facebook" value={form.facebook || ""} onChange={v => update("facebook", v)} placeholder="https://facebook.com/..." t={T} /><Input label="Instagram" value={form.instagram || ""} onChange={v => update("instagram", v)} placeholder="https://instagram.com/..." t={T} /><Input label="Website" value={form.website || ""} onChange={v => update("website", v)} placeholder="https://..." t={T} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><Select label="Shteti" value={form.country || ""} onChange={v => update("country", v)} options={COUNTRIES.map(c => c.name)} t={T} /><Select label="Qyteti" value={form.city || ""} onChange={v => update("city", v)} options={(COUNTRIES.find(c => c.name === form.country)?.cities || [])} t={T} /></div>
        <Btn variant="success" size="lg" onClick={save} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T}>Perditso</Btn>
      </div>
      {b.hasArka && (
        <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: `1.5px solid ${T.border}`, marginTop: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
            🔒 Cilësimet e Arkës
          </h3>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>Kodi PIN i Arkës (6 shifra)</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={form.arkaPin || ""}
              onChange={e => update("arkaPin", e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="______"
              style={{ width: 220, padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 18, letterSpacing: 6, textAlign: "center", outline: "none", background: T.inputBg, color: T.text, fontFamily: "monospace" }}
            />
            <button onClick={() => {
              if (!form.arkaPin || !/^\d{6}$/.test(form.arkaPin)) { alert("PIN-i duhet të ketë 6 shifra"); return; }
              setData(d => ({ ...d, business: { ...d.business, arkaPin: form.arkaPin } }));
            }} style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "11px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              Ndrysho PIN-in
            </button>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: T.textFaint }}>PIN-i kërkohet për të hapur ose mbyllur Arkën. Mbaje të sigurt.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================

// ============================================================
// SETTINGS PAGE
// ============================================================
function SettingsPage({ tab, data, setData, onNavigate, T }) {
  const [activeTab, setActiveTab] = useState(tab || "profili");
  const tabs = [
    { key: "profili", label: "Profili" },
    { key: "perdoruesit", label: "Perdoruesit" },
    { key: "param_print", label: "Parametrat e printimit" },
    { key: "param_status", label: "Parametrat e statusave" },
  ];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => onNavigate("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>← Kthehu</button>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>Manage Account</h2>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: activeTab === t.key ? T.accentGrad : T.surfaceAlt, color: activeTab === t.key ? "#fff" : T.textMuted, transition: "all .2s" }}>{t.label}</button>
        ))}
      </div>
      {activeTab === "profili" && <SettingsProfili data={data} setData={setData} T={T} />}
      {activeTab === "perdoruesit" && <SettingsPerdoruesit data={data} setData={setData} T={T} />}
      {activeTab === "param_print" && <SettingsPrint data={data} setData={setData} T={T} />}
      {activeTab === "param_status" && <SettingsStatuses data={data} setData={setData} T={T} />}
    </div>
  );
}

function SettingsProfili({ data, setData, T }) {
  const b = data.business || {};
  const [form, setForm] = useState({ name: b.name||"", email: b.email||"", phone: b.phone||"", address: b.address||"", country: b.country||"", city: b.city||"", facebook: b.facebook||"", instagram: b.instagram||"", website: b.website||"" });
  const [logo, setLogo] = useState(b.logo || null);
  const [saved, setSaved] = useState(false);
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };
  const save = () => {
    setData(d => ({ ...d, business: { ...d.business, ...form, logo } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const cities = COUNTRIES.find(c => c.name === form.country)?.cities || [];
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Logo e Biznesit</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 100, height: 100, borderRadius: 16, border: "2px dashed " + T.border, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: T.surfaceAlt }}>
            {logo ? <img src={logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ color: T.textFaint, fontSize: 12, textAlign: "center" }}>Nuk ka logo</span>}
          </div>
          <div>
            <label style={{ display: "inline-block", padding: "10px 20px", background: T.accentGrad, color: "#fff", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              Ngarko Logo nga PC
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
            </label>
            {logo && <button onClick={() => setLogo(null)} style={{ marginLeft: 10, background: "none", border: "1.5px solid " + T.border, borderRadius: 10, padding: "10px 16px", cursor: "pointer", color: T.textMuted, fontSize: 13 }}>Largo logon</button>}
            <p style={{ margin: "8px 0 0", fontSize: 12, color: T.textFaint }}>PNG, JPG deri 2MB. Logo shfaqet ne kupon.</p>
          </div>
        </div>
      </div>
      <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Informacioni i Biznesit</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Emri Biznesit" value={form.name} onChange={v => setForm(f=>({...f,name:v}))} t={T} />
          <Input label="Numri Tel." value={form.phone} onChange={v => setForm(f=>({...f,phone:v}))} t={T} />
        </div>
        <Input label="Email" value={form.email} onChange={v => setForm(f=>({...f,email:v}))} t={T} />
        <Input label="Adresa" value={form.address} onChange={v => setForm(f=>({...f,address:v}))} t={T} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Input label="Facebook" value={form.facebook} onChange={v => setForm(f=>({...f,facebook:v}))} t={T} />
          <Input label="Instagram" value={form.instagram} onChange={v => setForm(f=>({...f,instagram:v}))} t={T} />
          <Input label="Website" value={form.website} onChange={v => setForm(f=>({...f,website:v}))} t={T} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Select label="Shteti" value={form.country} onChange={v => setForm(f=>({...f,country:v,city:""}))} options={COUNTRIES.map(c=>c.name)} t={T} />
          <Select label="Qyteti" value={form.city} onChange={v => setForm(f=>({...f,city:v}))} options={cities} t={T} />
        </div>
        <Btn variant={saved ? "success" : "primary"} size="lg" onClick={save} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T}>{saved ? "U ruajt!" : "Ruaj ndryshimet"}</Btn>
      </div>
    </div>
  );
}

function SettingsPerdoruesit({ data, setData, T }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const addWorker = () => {
    if (!name.trim()) return;
    setData(d => ({ ...d, workers: [...d.workers, { id: Date.now().toString(), name: name.trim(), phone: phone.trim(), createdAt: new Date().toISOString() }] }));
    setName(""); setPhone("");
  };
  const removeWorker = (id) => setData(d => ({ ...d, workers: d.workers.filter(w => w.id !== id) }));
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Shto Perdorues te Ri</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Emri" value={name} onChange={setName} placeholder="Emri i punëtorit" t={T} />
          <Input label="Numri Tel." value={phone} onChange={setPhone} placeholder="044 123 456" t={T} />
        </div>
        <Btn variant="primary" onClick={addWorker} disabled={!name.trim()} t={T}>+ Shto Perdoruesin</Btn>
      </div>
      <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Perdoruesit Aktual ({data.workers.length})</h3>
        {data.workers.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.textFaint }}>Nuk ka perdorues</div>}
        {data.workers.map(w => (
          <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid " + T.border }}>
            <div>
              <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>{w.name}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{w.phone || "Pa numer"}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: T.textFaint }}>{data.jobs.filter(j => j.workerId === w.id).length} pune</span>
              <button onClick={() => removeWorker(w.id)} style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Largo</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPrint({ data, setData, T }) {
  const b = data.business || {};
  const [form, setForm] = useState({
    printHeader: b.printHeader || "",
    printFooter: b.printFooter || "",
    printShowLogo: b.printShowLogo !== false,
    printShowQR: b.printShowQR !== false,
    printShowPrice: b.printShowPrice !== false,
    printShowIMEI: b.printShowIMEI !== false,
    printPaperSize: b.printPaperSize || "80mm",
    couponNotes: b.couponNotes || "",
  });
  const [saved, setSaved] = useState(false);
  const save = () => {
    setData(d => ({ ...d, business: { ...d.business, ...form } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const Toggle = ({ label, field }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid " + T.border }}>
      <span style={{ fontSize: 14, color: T.text }}>{label}</span>
      <button onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))} style={{ width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer", background: form[field] ? T.accent : T.border, position: "relative", transition: "background .2s" }}>
        <span style={{ position: "absolute", top: 3, left: form[field] ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", display: "block" }} />
      </button>
    </div>
  );
  return (
    <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Parametrat e Kuponit</h3>
      <Toggle label="Shfaq logon ne kupon" field="printShowLogo" />
      <Toggle label="Shfaq QR kodin" field="printShowQR" />
      <Toggle label="Shfaq cmimin" field="printShowPrice" />
      <Toggle label="Shfaq IMEI-n" field="printShowIMEI" />
      <div style={{ marginTop: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, display: "block", marginBottom: 8 }}>Madhesia e letres</label>
        <select value={form.printPaperSize} onChange={e => setForm(f=>({...f,printPaperSize:e.target.value}))} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid " + T.border, fontSize: 14, background: T.inputBg, color: T.text, width: "100%", outline: "none" }}>
          <option value="80mm">80mm (Printer termik)</option>
          <option value="A4">A4</option>
          <option value="A5">A5</option>
        </select>
      </div>
      <div style={{ marginTop: 16 }}>
        <Input label="Teksti i kokes se kuponit" value={form.printHeader} onChange={v => setForm(f=>({...f,printHeader:v}))} placeholder="p.sh. Faleminderit per besimin!" t={T} />
        <Input label="Teksti i fundit te kuponit" value={form.printFooter} onChange={v => setForm(f=>({...f,printFooter:v}))} placeholder="p.sh. Garanci 30 dite" t={T} />
        <Textarea label="Shënime shtesë për kuponin" value={form.couponNotes} onChange={v => setForm(f=>({...f,couponNotes:v}))} placeholder="Shënimet do të shfaqen në fund të kuponit (pas QR kodit)" rows={3} t={T} />
      </div>
      <Btn variant={saved ? "success" : "primary"} size="lg" onClick={save} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T}>{saved ? "U ruajt!" : "Ruaj ndryshimet"}</Btn>
    </div>
  );
}

function SettingsStatuses({ data, setData, T }) {
  const [statuses, setStatuses] = useState(() => STATUSES.map(s => ({...s})));
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: T.text }}>Parametrat e Statusave</h3>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: T.textMuted }}>Shiko dhe menaxho statuset aktuale te puneve.</p>
      {statuses.map((s, i) => (
        <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid " + T.border }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <input value={s.label} onChange={e => { const ns = [...statuses]; ns[i] = {...ns[i], label: e.target.value}; setStatuses(ns); }} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid " + T.border, fontSize: 14, background: T.inputBg, color: T.text, outline: "none" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="color" value={s.color} onChange={e => { const ns = [...statuses]; ns[i] = {...ns[i], color: e.target.value}; setStatuses(ns); }} style={{ width: 36, height: 36, border: "none", cursor: "pointer", borderRadius: 8 }} />
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>
          </div>
        </div>
      ))}
      <Btn variant={saved ? "success" : "primary"} size="lg" onClick={save} style={{ width: "100%", justifyContent: "center", marginTop: 20 }} t={T}>{saved ? "U ruajt!" : "Ruaj ndryshimet"}</Btn>
    </div>
  );
}


// ADMIN PANEL
// ============================================================
function AdminPanel({ accounts, setAccounts, onLogout }) {
  const [darkMode, setDarkMode] = useState(false);
  const T = darkMode ? THEME.dark : THEME.light;
  const [page, setPage] = useState("overview");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ msg: "", show: false });
  const [menuOpen, setMenuOpen] = useState(false);

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Sub modal state
  const [subModal, setSubModal] = useState(false);
  const [subTarget, setSubTarget] = useState(null);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (msg) => { setToast({ msg, show: true }); setTimeout(() => setToast({ msg: "", show: false }), 2800); };

  const filtered = accounts.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || (a.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: accounts.length,
    active: accounts.filter(a => getAccountStatus(a) === "active").length,
    trial: accounts.filter(a => getAccountStatus(a) === "trial").length,
    expired: accounts.filter(a => ["expired", "expiring"].includes(getAccountStatus(a))).length,
    suspended: accounts.filter(a => getAccountStatus(a) === "suspended").length,
  };

  const handleSuspend = (id) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "suspended" ? "active" : "suspended" } : a));
    showToast(accounts.find(a => a.id === id)?.status === "suspended" ? "Firma u aktivizua!" : "Firma u pezullua!");
  };

  const handleDelete = (id) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
    if (selectedAccount?.id === id) { setSelectedAccount(null); setPage("overview"); }
    showToast("Firma u fshi!");
  };

  const handleEdit = (account) => {
    setEditForm({ name: account.name, email: account.email, phone: account.phone || "", address: account.address || "", city: account.city || "", country: account.country || "" });
    setEditModal(true);
    setSelectedAccount(account);
  };

  const saveEdit = () => {
    setAccounts(prev => prev.map(a => a.id === selectedAccount.id ? { ...a, ...editForm } : a));
    setEditModal(false);
    showToast("Te dhenat u perditesuan!");
  };

  const handleAddSub = (plan) => {
    const updated = addSubscriptionDays(subTarget, plan.days);
    setAccounts(prev => prev.map(a => a.id === subTarget.id ? updated : a));
    if (selectedAccount?.id === subTarget.id) setSelectedAccount(updated);
    setSubModal(false);
    showToast(`Abonimi ${plan.label} u shtua me sukses!`);
  };

  const openSubModal = (account) => { setSubTarget(account); setSubModal(true); };

  const StatusPill = ({ status }) => {
    const cfg = {
      active:    { bg: "#D1FAE5", color: "#059669", label: "Aktiv" },
      trial:     { bg: "#DBEAFE", color: "#2563EB", label: "Trial" },
      expiring:  { bg: "#FEF3C7", color: "#D97706", label: "Skadon shpejt" },
      expired:   { bg: "#FEE2E2", color: "#EF4444", label: "Skaduar" },
      suspended: { bg: "#F1F5F9", color: "#64748B", label: "Pezulluar" },
    };
    const c = cfg[status] || cfg.trial;
    return <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color }}>{c.label}</span>;
  };

  function daysLeft(account) {
    if (!account.expiryDate) return null;
    const d = Math.ceil((new Date(account.expiryDate) - new Date()) / 86400000);
    return d > 0 ? d : 0;
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideDown{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${darkMode?"#1E3A5F":"#d1d5db"};border-radius:3px}
    input::placeholder{color:${T.textFaint};}
    select option{background:${T.surface};color:${T.text};}
  `;

  const AccountDetail = ({ acc }) => {
    const status = getAccountStatus(acc);
    const dl = daysLeft(acc);
    const [arkaEnabled, setArkaEnabled] = useState(!!acc.hasArka);
    const [arkaPin, setArkaPin] = useState(acc.arkaPin || "");
    const [arkaDirty, setArkaDirty] = useState(false);
    const [postaEnabled, setPostaEnabled] = useState(!!acc.hasPosta);
    const [postaDirty, setPostaDirty] = useState(false);
    const [postaSqlNeeded, setPostaSqlNeeded] = useState(false);

    const savePostaConfig = async () => {
      try {
        const { error } = await supabase.from('accounts').update({ has_posta: postaEnabled }).eq('id', acc.id);
        if (error) {
          showToast("⚠️ Ekzekuto SQL-in e migrimit në Supabase (shih poshtë)!");
          setPostaSqlNeeded(true);
          return;
        }
      } catch(e) {
        showToast("Gabim gjatë ruajtjes: " + e.message);
        return;
      }
      setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, hasPosta: postaEnabled } : a));
      setSelectedAccount(s => s && s.id === acc.id ? { ...s, hasPosta: postaEnabled } : s);
      setPostaDirty(false);
      setPostaSqlNeeded(false);
      showToast(postaEnabled ? "✅ Posta u aktivizua!" : "Posta u çaktivizua");
    };

    const saveArkaConfig = () => {
      if (arkaEnabled && (!arkaPin || arkaPin.length < 6 || !/^\d{6}$/.test(arkaPin))) {
        showToast("PIN-i duhet të ketë 6 shifra!");
        return;
      }
      setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, hasArka: arkaEnabled, arkaPin: arkaEnabled ? arkaPin : "" } : a));
      setSelectedAccount(s => s && s.id === acc.id ? { ...s, hasArka: arkaEnabled, arkaPin: arkaEnabled ? arkaPin : "" } : s);
      setArkaDirty(false);
      showToast(arkaEnabled ? "Arka u aktivizua për këtë biznes!" : "Arka u çaktivizua");
    };
    return (
      <div style={{ animation: "slideUp .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => { setPage("firms"); setSelectedAccount(null); }} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: T.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
              €Â Â Kthehu
            </button>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.text }}>{acc.name}</h2>
            <StatusPill status={status} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openSubModal(acc)} style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              {Ic.money(13)} Shto abonim
            </button>
            <button onClick={() => handleEdit(acc)} style={{ background: T.surfaceAlt, color: T.textMuted, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              {Ic.edit(13)} Edito
            </button>
            <button onClick={() => handleSuspend(acc.id)} style={{ background: status === "suspended" ? "#D1FAE5" : "#FEF3C7", color: status === "suspended" ? "#059669" : "#D97706", border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              {status === "suspended" ? "▶ Aktivizo" : "⏸ Pezullo"}
            </button>
            <button onClick={() => setDeleteConfirm(acc.id)} style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              {Ic.trash(13)} Fshi
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Info card */}
          <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}` }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: T.text }}>Informacioni i firmes</h3>
            {[["Email", acc.email], ["Telefon", acc.phone || "—"], ["Adresa", acc.address || "—"], ["Qyteti", acc.city || "—"], ["Shteti", acc.country || "—"], ["Regjistruar", fmtDate(acc.registeredAt)]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}`, fontSize: 14 }}>
                <span style={{ color: T.textMuted, fontWeight: 600 }}>{l}</span>
                <span style={{ color: T.text, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Subscription card */}
          <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text }}>Abonimet</h3>
              <button onClick={() => openSubModal(acc)} style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Shto</button>
            </div>
            <div style={{ background: status === "active" ? "#D1FAE511" : status === "expired" ? "#FEE2E211" : "#FEF3C711", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: `1px solid ${status === "active" ? "#10B98130" : "#EF444430"}` }}>
              <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>STATUSI ABONIMIT</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: status === "active" ? "#059669" : status === "expired" ? "#EF4444" : "#D97706", marginTop: 4 }}>
                {dl !== null ? `${dl} ditë mbeten` : "Pa abonim"}
              </div>
              {acc.expiryDate && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Skadon: {fmtDate(acc.expiryDate)}</div>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, marginBottom: 10 }}>Historiku i pagesave</div>
            {(acc.payments || []).length === 0 ? (
              <div style={{ color: T.textFaint, fontSize: 13, textAlign: "center", padding: "12px 0" }}>Ska pagesa</div>
            ) : [...(acc.payments || [])].reverse().slice(0, 5).map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "8px 0", fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontWeight: 700, color: T.accent }}>{p.amount}</span>
                <span style={{ color: T.textMuted }}>{fmtDate(p.date).slice(0, 10)}</span>
                <span style={{ color: T.success, fontWeight: 600 }}>{p.validFor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ARKA / POS MODULE */}
        <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}`, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
            🧾 Moduli i Arkës (POS)
          </h3>
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "12px 14px", borderRadius: 12, background: arkaEnabled ? `${T.accent}12` : T.surfaceAlt, border: `1.5px solid ${arkaEnabled ? T.accent : T.border}`, transition: "all .2s" }}>
            <input
              type="checkbox"
              checked={arkaEnabled}
              onChange={e => { setArkaEnabled(e.target.checked); setArkaDirty(true); }}
              style={{ width: 18, height: 18, accentColor: T.accent, cursor: "pointer" }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Shto arkën te biznesi</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Aktivizo modulin e shitjeve (POS) për këtë firmë</div>
            </div>
          </label>
          {arkaEnabled && (
            <div style={{ marginTop: 16, animation: "slideUp .2s ease" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>Kodi PIN 6-shifror i Arkës (fillestar)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={arkaPin}
                onChange={e => { setArkaPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setArkaDirty(true); }}
                placeholder="p.sh. 123456"
                style={{ width: 220, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 16, letterSpacing: 4, outline: "none", background: T.inputBg, color: T.text, fontFamily: "monospace" }}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.border}
              />
              <div style={{ fontSize: 11, color: T.textFaint, marginTop: 6 }}>Biznesi mund ta ndryshojë më vonë nga Cilësimet.</div>
            </div>
          )}
          {arkaDirty && (
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={saveArkaConfig} style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                {Ic.check ? Ic.check(13) : "✔"} Ruaj
              </button>
              <button onClick={() => { setArkaEnabled(!!acc.hasArka); setArkaPin(acc.arkaPin || ""); setArkaDirty(false); }} style={{ background: T.surfaceAlt, color: T.textMuted, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Anulo
              </button>
            </div>
          )}
        </div>

        {/* POSTA MODULE */}
        <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}`, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
            📦 Moduli i Postës (Dërgesa)
          </h3>
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "12px 14px", borderRadius: 12, background: postaEnabled ? "#EFF6FF" : T.surfaceAlt, border: `1.5px solid ${postaEnabled ? "#3B82F6" : T.border}`, transition: "all .2s" }}>
            <input type="checkbox" checked={postaEnabled} onChange={e => { setPostaEnabled(e.target.checked); setPostaDirty(true); }} style={{ width: 18, height: 18, accentColor: "#3B82F6", cursor: "pointer" }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Shto postën te biznesi</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Aktivizo modulin e dërgesave (Posta) për këtë firmë</div>
            </div>
          </label>
          {postaDirty && (
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={savePostaConfig} style={{ background: "#3B82F6", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>✔ Ruaj</button>
              <button onClick={() => { setPostaEnabled(!!acc.hasPosta); setPostaDirty(false); setPostaSqlNeeded(false); }} style={{ background: T.surfaceAlt, color: T.textMuted, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Anulo</button>
            </div>
          )}
          {postaSqlNeeded && (
            <div style={{ marginTop: 16, background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#92400E" }}>⚠️ Kolona mungon në DB. Ekzekuto SQL-in në Supabase SQL Editor:</div>
              <pre style={{ fontSize: 11, background: "#1E293B", color: "#94A3B8", padding: 12, borderRadius: 8, overflowX: "auto", margin: 0, whiteSpace: "pre-wrap" }}>{`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS has_posta BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS posta_orders (
  id TEXT PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  order_no TEXT, client_name TEXT, client_surname TEXT, client_phone TEXT,
  city TEXT, country TEXT, address TEXT, description TEXT,
  price NUMERIC(10,2) DEFAULT 0, weight TEXT, notes TEXT,
  status TEXT DEFAULT 'procesuara',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  code TEXT NOT NULL, discount_percent NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
              <button onClick={savePostaConfig} style={{ marginTop: 10, background: "#3B82F6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>🔄 Provo përsëri pas ekzekutimit</button>
            </div>
          )}
        </div>

        {/* Social & web */}
        {(acc.facebook || acc.instagram || acc.website) && (
          <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}` }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: T.text }}>Rrjetet sociale</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {acc.facebook && <a href={acc.facebook} target="_blank" rel="noreferrer" style={{ color: "#2563EB", fontSize: 13 }}>Facebook</a>}
              {acc.instagram && <a href={acc.instagram} target="_blank" rel="noreferrer" style={{ color: "#E11D48", fontSize: 13 }}>Instagram</a>}
              {acc.website && <a href={acc.website} target="_blank" rel="noreferrer" style={{ color: T.accent, fontSize: 13 }}>Website</a>}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: T.bg, minHeight: "100vh", color: T.text, transition: "background .3s" }}>
        {/* Admin Nav */}
        <nav style={{ background: T.nav, borderBottom: `1.5px solid ${T.navBorder}`, padding: "0 32px", position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>
              Data<span style={{ background: T.accentGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Phone</span>
              <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "#fff", padding: "3px 10px", borderRadius: 20, verticalAlign: "middle", letterSpacing: 1 }}>ADMIN</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[{ key: "overview", label: "Pasqyra" }, { key: "firms", label: "Firmat" }].map(item => (
                <button key={item.key} onClick={() => { setPage(item.key); setSelectedAccount(null); }}
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", transition: "all .2s", background: page === item.key ? T.accent : "transparent", color: page === item.key ? "#fff" : T.textMuted }}
                  onMouseEnter={e => { if (page !== item.key) e.currentTarget.style.background = T.surfaceAlt; }} onMouseLeave={e => { if (page !== item.key) e.currentTarget.style.background = "transparent"; }}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: T.surfaceAlt, border: `1.5px solid ${T.border}`, borderRadius: 10, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>
              {darkMode ? Ic.sun(16) : Ic.moon(16)}
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1.5px solid ${T.border}`, cursor: "pointer", background: T.surface, color: T.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
                Administrator {Ic.down(10)}
              </button>
              {menuOpen && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: T.surface, borderRadius: 12, border: `1.5px solid ${T.border}`, boxShadow: "0 8px 24px rgba(0,0,0,.15)", width: 180, zIndex: 200, overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px", fontSize: 12, color: T.textFaint, borderBottom: `1px solid ${T.border}` }}>{ADMIN_CREDENTIALS.email}</div>
                  <div style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", color: T.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
                    onClick={() => { onLogout(); setMenuOpen(false); }}>{Ic.logout(13)} Log Out</div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* OVERVIEW PAGE */}
          {page === "overview" && (
            <div style={{ animation: "slideUp .2s ease" }}>
              <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: T.text }}>Pasqyra e sistemit</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 14, marginBottom: 28 }}>
                {[
                  { label: "Gjithsej Firma", val: stats.total, color: T.accent, bg: `${T.accent}15` },
                  { label: "Aktive", val: stats.active, color: "#059669", bg: "#D1FAE5" },
                  { label: "Trial", val: stats.trial, color: "#2563EB", bg: "#DBEAFE" },
                  { label: "Skaduara", val: stats.expired, color: "#EF4444", bg: "#FEE2E2" },
                  { label: "Pezulluara", val: stats.suspended, color: "#64748B", bg: "#F1F5F9" },
                ].map(item => (
                  <div key={item.label} style={{ background: T.surface, borderRadius: 16, padding: "20px 24px", border: `1.5px solid ${T.border}`, cursor: "pointer" }} onClick={() => setPage("firms")}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: item.color, marginTop: 6 }}>{item.val}</div>
                  </div>
                ))}
              </div>

              {/* Recent registrations */}
              <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}`, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text }}>Regjistrimet e fundit</h3>
                  <button onClick={() => setPage("firms")} style={{ background: "none", border: "none", color: T.accent, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Shih te gjitha –</button>
                </div>
                {accounts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 0", color: T.textFaint, fontSize: 14 }}>Nuk ka firma te regjistruara ende.</div>
                ) : [...accounts].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)).slice(0, 5).map(acc => {
                  const status = getAccountStatus(acc);
                  const dl = daysLeft(acc);
                  return (
                    <div key={acc.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", padding: "14px 0", borderBottom: `1px solid ${T.border}`, alignItems: "center", fontSize: 13, cursor: "pointer" }}
                      onClick={() => { setSelectedAccount(acc); setPage("firmDetail"); }}>
                      <span style={{ fontWeight: 700, color: T.text }}>{acc.name}</span>
                      <span style={{ color: T.textMuted }}>{acc.email}</span>
                      <span style={{ color: T.textMuted }}>{acc.city || "—"}</span>
                      <span><StatusPill status={status} /></span>
                      <span style={{ color: dl !== null ? (dl < 7 ? T.danger : T.success) : T.textFaint, fontWeight: 600, fontSize: 12 }}>
                        {dl !== null ? `${dl}d` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Expiring soon */}
              {accounts.filter(a => getAccountStatus(a) === "expiring").length > 0 && (
                <div style={{ background: "#FEF3C7", borderRadius: 16, padding: 20, border: "1.5px solid #FCD34D" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ color: "#D97706" }}>{Ic.warn(16)}</span>
                    <strong style={{ color: "#92400E", fontSize: 14 }}>Firma me abonim që skadon shpejt (€Â°Â¤7 ditë)</strong>
                  </div>
                  {accounts.filter(a => getAccountStatus(a) === "expiring").map(acc => (
                    <div key={acc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #FCD34D", fontSize: 13 }}>
                      <span style={{ fontWeight: 700, color: "#92400E" }}>{acc.name}</span>
                      <span style={{ color: "#92400E" }}>{daysLeft(acc)} ditë mbeten</span>
                      <button onClick={() => openSubModal(acc)} style={{ background: "#D97706", color: "#fff", border: "none", borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Rinovoi</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FIRMS LIST PAGE */}
          {page === "firms" && !selectedAccount && (
            <div style={{ animation: "slideUp .2s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>Te gjitha firmat ({accounts.length})</h2>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textFaint, display: "flex" }}>{Ic.search(14)}</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kerko firmen..." style={{ padding: "10px 14px 10px 36px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, width: 260, background: T.inputBg, color: T.text, outline: "none" }} />
                </div>
              </div>

              <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 0.8fr 1fr 1fr 1.4fr", padding: "10px 16px", fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${T.border}` }}>
                  <span>Firma</span><span>Email</span><span>Qyteti</span><span>Statusi</span><span>Abonimi</span><span>Veprimet</span>
                </div>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: T.textFaint, fontSize: 14 }}>Nuk ka firma!</div>
                ) : filtered.map(acc => {
                  const status = getAccountStatus(acc);
                  const dl = daysLeft(acc);
                  return (
                    <div key={acc.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 0.8fr 1fr 1fr 1.4fr", padding: "14px 16px", fontSize: 13, alignItems: "center", borderBottom: `1px solid ${T.border}`, transition: "background .15s", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => { setSelectedAccount(acc); setPage("firmDetail"); }}>
                      <span style={{ fontWeight: 700, color: T.text }}>{acc.name}</span>
                      <span style={{ color: T.textMuted, fontSize: 12 }}>{acc.email}</span>
                      <span style={{ color: T.textMuted }}>{acc.city || "—"}</span>
                      <span onClick={e => e.stopPropagation()}><StatusPill status={status} /></span>
                      <span style={{ color: dl !== null ? (dl <= 7 ? T.danger : T.success) : T.textFaint, fontWeight: 600 }}>
                        {dl !== null ? `${dl} ditë` : "Pa abonim"}
                      </span>
                      <span style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => openSubModal(acc)} title="Shto abonim" style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 7, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.money(12)}</button>
                        <button onClick={() => handleEdit(acc)} title="Edito" style={{ background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 7, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.edit(12)}</button>
                        <button onClick={() => handleSuspend(acc.id)} title={status === "suspended" ? "Aktivizo" : "Pezullo"} style={{ background: status === "suspended" ? "#D1FAE5" : "#FEF3C7", color: status === "suspended" ? "#059669" : "#D97706", border: "none", borderRadius: 7, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13 }}>{status === "suspended" ? "▶" : "⏸"}</button>
                        <button onClick={() => setDeleteConfirm(acc.id)} title="Fshi" style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 7, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.trash(12)}</button>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FIRM DETAIL */}
          {page === "firmDetail" && selectedAccount && <AccountDetail acc={selectedAccount} />}

        </div>
      </div>

      {/* EDIT MODAL */}
      {editModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: T.overlay, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s" }} onClick={() => setEditModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 20, padding: "32px 36px", width: "90%", maxWidth: 520, boxShadow: "0 24px 80px rgba(0,0,0,.25)", animation: "slideUp .25s ease", border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text }}>Edito firmen: {selectedAccount?.name}</h3>
              <button onClick={() => setEditModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textFaint }}>{Ic.x(18)}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[["Emri i firmes", "name"], ["Email", "email"], ["Telefon", "phone"], ["Adresa", "address"], ["Qyteti", "city"], ["Shteti", "country"]].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 4 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 5 }}>{label}</label>
                  <input value={editForm[key] || ""} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, outline: "none", background: T.inputBg, color: T.text, boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditModal(false)} style={{ background: "none", border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 14, color: T.textMuted, fontWeight: 600 }}>Anulo</button>
              <button onClick={saveEdit} style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Ruaj ndryshimet</button>
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION MODAL */}
      {subModal && subTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: T.overlay, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s" }} onClick={() => setSubModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 20, padding: "32px 36px", width: "90%", maxWidth: 500, boxShadow: "0 24px 80px rgba(0,0,0,.25)", animation: "slideUp .25s ease", border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text }}>Shto abonim</h3>
              <button onClick={() => setSubModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textFaint }}>{Ic.x(18)}</button>
            </div>
            <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 24 }}>Firma: <strong style={{ color: T.text }}>{subTarget.name}</strong></p>
            {subTarget.expiryDate && (
              <div style={{ background: T.surfaceAlt, borderRadius: 10, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: T.textMuted, border: `1px solid ${T.border}` }}>
                Abonimi aktual skadon: <strong style={{ color: T.text }}>{fmtDate(subTarget.expiryDate)}</strong>
                {daysLeft(subTarget) !== null && <span style={{ marginLeft: 8, color: daysLeft(subTarget) < 7 ? T.danger : T.success, fontWeight: 700 }}>({daysLeft(subTarget)} ditë mbeten)</span>}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {SUBSCRIPTION_PLANS.map(plan => (
                <button key={plan.key} onClick={() => handleAddSub(plan)}
                  style={{ background: T.surfaceAlt, border: `2px solid ${T.border}`, borderRadius: 16, padding: "20px 16px", cursor: "pointer", textAlign: "center", transition: "all .2s", fontFamily: "inherit" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = `${T.accent}12`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surfaceAlt; }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: T.accent }}>{plan.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginTop: 6 }}>{plan.price}</div>
                  <div style={{ fontSize: 11, color: T.textFaint, marginTop: 4 }}>{plan.days} ditë</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: T.overlay, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDeleteConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 20, padding: "36px 40px", width: "90%", maxWidth: 400, boxShadow: "0 24px 80px rgba(0,0,0,.3)", textAlign: "center", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅Â ️Â</div>
            <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: T.text }}>Konfirmo fshirjen</h3>
            <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 28 }}>
              A jeni i sigurt? Firma <strong style={{ color: T.text }}>{accounts.find(a => a.id === deleteConfirm)?.name}</strong> do të fshihet përgjithmonë!
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: T.surfaceAlt, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "11px 28px", cursor: "pointer", fontSize: 14, color: T.textMuted, fontWeight: 600 }}>Anulo</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, padding: "11px 28px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Po, fshije!</button>
            </div>
          </div>
        </div>
      )}
      <Toast message={toast.msg} visible={toast.show} />
      {menuOpen && <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuOpen(false)} />}
    </>
  );
}

// ============================================================
// MAIN APP
// ============================================================



async function saveJobToSupabase(job, client, worker, business) {
  try {
    const { error: saveErr } = await supabase.from("public_jobs").upsert({
      id: job.id,
      client_name: client?.name || "",
      client_phone: client?.phone || "",
      phone_model: job.phoneModel,
      imei: job.imei || "",
      code: job.code || "",
      description: job.description,
      price: job.price || "",
      status: job.status,
      worker_name: worker?.name || "",
      business_name: business?.name || "",
      business_phone: business?.phone || "",
      updated_at: new Date().toISOString()
    });
    if (saveErr) { console.error("public_jobs save error:", saveErr); }
  } catch(e) { console.error("Supabase save error:", e); }
}

async function updateJobStatusSupabase(jobId, status, jobData, clientData, workerData, bizData) {
  try {
    const updateObj = { status, updated_at: new Date().toISOString() };
    // Nëse kemi të dhëna, perditso edhe ato
    if (jobData) {
      Object.assign(updateObj, {
        phone_model: jobData.phoneModel || "",
        imei: jobData.imei || "",
        code: jobData.code || "",
        description: jobData.description || "",
        price: jobData.price || "",
      });
    }
    if (clientData) { Object.assign(updateObj, { client_name: clientData.name || "", client_phone: clientData.phone || "" }); }
    if (workerData) { updateObj.worker_name = workerData.name || ""; }
    if (bizData) { Object.assign(updateObj, { business_name: bizData.name || "", business_phone: bizData.phone || "" }); }
    await supabase.from("public_jobs").update(updateObj).eq("id", jobId);
  } catch(e) { console.log("Supabase update error:", e); }
}

function JobStatusPage({ jobId, data, onBack, T }) {
  const params = new URLSearchParams(window.location.search);
  const isQR = params.get("v") === "1";
  
  if (isQR) {
    const job = { id: params.get("jid")||jobId, phoneModel: params.get("pm")||"", imei: params.get("im")||"", description: params.get("ds")||"", price: params.get("pr")||"", status: params.get("st")||"new", createdAt: params.get("dt")||"" };
    const client = { name: params.get("cn")||"", phone: params.get("cp")||"" };
    const worker = { name: params.get("wn")||"" };
    const business = { name: params.get("bn")||"" };
    return <ClientStatusView job={job} client={client} worker={worker} business={business} onBack={onBack} />;
  }
  
  const job = data.jobs.find(j => j.id === jobId);
  if (!job) return <div>Puna nuk u gjet.</div>;
  const client = data.clients.find(c => c.id === job.clientId)||null;
  const worker = data.workers.find(w => w.id === job.workerId)||null;
  return <ClientStatusView job={job} client={client} worker={worker} business={data.business} onBack={onBack} />;
}



// Map Supabase row -> app account shape
function mapAccountFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    city: row.city || "",
    phone: row.phone || "",
    country: row.country || "",
    address: row.address || "",
    facebook: row.facebook || "",
    instagram: row.instagram || "",
    website: row.website || "",
    status: row.status || "active",
    registeredAt: row.registered_at,
    expiryDate: row.expiry_date,
    trialStart: row.trial_start,
    subscriptionPlan: row.subscription_plan,
    hasArka: !!row.has_arka,
    hasPosta: !!row.has_posta,
    arkaPin: row.arka_pin || "",
    logo: row.logo || null,
    nui: row.nui || "",
    nf: row.nf || "",
    vatNumber: row.vat_number || "",
    bank: row.bank || "",
    bankAccount: row.bank_account || "",
    postalCode: row.postal_code || "",
  };
}

// ============================================================
// Supabase mapping helpers (DB row <-> app shape)
// ============================================================
function mapAccountToDB(a) {
  return {
    id: a.id,
    email: a.email,
    password: a.password,
    name: a.name,
    phone: a.phone || null,
    city: a.city || null,
    country: a.country || null,
    address: a.address || null,
    facebook: a.facebook || null,
    instagram: a.instagram || null,
    website: a.website || null,
    status: a.status || 'active',
    registered_at: a.registeredAt || new Date().toISOString(),
    expiry_date: a.expiryDate || null,
    trial_start: a.trialStart || null,
    subscription_plan: a.subscriptionPlan || null,
    has_arka: a.hasArka || false,
    has_posta: a.hasPosta || false,
    arka_pin: a.arkaPin || null,
    logo: a.logo || null,
    nui: a.nui || null,
    nf: a.nf || null,
    vat_number: a.vatNumber || null,
    bank: a.bank || null,
    bank_account: a.bankAccount || null,
    postal_code: a.postalCode || null,
  };
}

// ============================================================
// Arka — Products & Sales helpers
// ============================================================
function mapProductFromDB(row) {
  return {
    id: row.id,
    name: row.name,
    barcode: row.barcode || "",
    category: row.category || "",
    price: Number(row.price) || 0,
    cost: Number(row.cost) || 0,
    stock: Number(row.stock) || 0,
    unit: row.unit || "cope",
    image: row.image || null,
    createdAt: row.created_at,
  };
}
function mapProductToDB(p, accountId) {
  return {
    id: p.id,
    account_id: accountId,
    name: p.name,
    barcode: p.barcode || null,
    category: p.category || null,
    price: Number(p.price) || 0,
    cost: Number(p.cost) || 0,
    stock: Number(p.stock) || 0,
    unit: p.unit || "cope",
    image: p.image || null,
    updated_at: new Date().toISOString(),
  };
}
function mapDebtFromDB(row) {
  return {
    id: row.id,
    clientName: row.client_name || "",
    clientPhone: row.client_phone || "",
    originalAmount: Number(row.original_amount) || 0,
    paidAmount: Number(row.paid_amount) || 0,
    remainingAmount: Number(row.remaining_amount) || 0,
    saleId: row.sale_id || null,
    items: Array.isArray(row.items) ? row.items : [],
    notes: row.notes || "",
    isSettled: !!row.is_settled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
function mapDebtToDB(d, accountId) {
  return {
    id: d.id,
    account_id: accountId,
    client_name: d.clientName,
    client_phone: d.clientPhone || null,
    original_amount: Number(d.originalAmount) || 0,
    paid_amount: Number(d.paidAmount) || 0,
    remaining_amount: Number(d.remainingAmount) || 0,
    sale_id: d.saleId || null,
    items: d.items || [],
    notes: d.notes || null,
    is_settled: !!d.isSettled,
    created_at: d.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
function mapSaleFromDB(row) {
  return {
    id: row.id,
    receiptNo: row.receipt_no || "",
    total: Number(row.total) || 0,
    paid: Number(row.paid) || 0,
    change: Number(row.change_amount) || 0,
    paymentMethod: row.payment_method || "cash",
    clientName: row.client_name || "",
    items: Array.isArray(row.items) ? row.items : [],
    createdAt: row.created_at,
  };
}
function mapSaleToDB(s, accountId) {
  return {
    id: s.id,
    account_id: accountId,
    receipt_no: s.receiptNo || null,
    total: Number(s.total) || 0,
    paid: Number(s.paid) || 0,
    change_amount: Number(s.change) || 0,
    payment_method: s.paymentMethod || "cash",
    client_name: s.clientName || null,
    items: s.items || [],
    created_at: s.createdAt || new Date().toISOString(),
  };
}
function mapWarrantyFromDB(row) {
  return {
    id: row.id,
    certNo: row.cert_no || "",
    clientName: row.client_name || "",
    clientPhone: row.client_phone || "",
    clientAddress: row.client_address || "",
    productName: row.product_name || "",
    brand: row.brand || "",
    model: row.model || "",
    serialNo: row.serial_no || "",
    imei: row.imei || "",
    condition: row.condition || "new",
    periodMonths: Number(row.period_months) || 12,
    startDate: row.start_date,
    endDate: row.end_date,
    accessories: row.accessories || "",
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}
function mapWarrantyToDB(w, accountId) {
  return {
    id: w.id,
    account_id: accountId,
    cert_no: w.certNo || null,
    client_name: w.clientName || null,
    client_phone: w.clientPhone || null,
    client_address: w.clientAddress || null,
    product_name: w.productName || null,
    brand: w.brand || null,
    model: w.model || null,
    serial_no: w.serialNo || null,
    imei: w.imei || null,
    condition: w.condition || 'new',
    period_months: Number(w.periodMonths) || 12,
    start_date: w.startDate || null,
    end_date: w.endDate || null,
    accessories: w.accessories || null,
    notes: w.notes || null,
    created_at: w.createdAt || new Date().toISOString(),
  };
}
function mapCouponFromDB(row) {
  return { id: row.id, code: row.code, discountPercent: Number(row.discount_percent) || 0, isActive: !!row.is_active, createdAt: row.created_at };
}
function mapCouponToDB(c, accountId) {
  return { id: c.id, account_id: accountId, code: c.code, discount_percent: c.discountPercent, is_active: c.isActive !== false, created_at: c.createdAt || new Date().toISOString() };
}
function mapPostaOrderFromDB(row) {
  return {
    id: row.id, orderNo: row.order_no || "", clientName: row.client_name || "", clientSurname: row.client_surname || "",
    clientPhone: row.client_phone || "", city: row.city || "", country: row.country || "", address: row.address || "",
    description: row.description || "", price: Number(row.price) || 0, weight: row.weight || "", notes: row.notes || "",
    status: row.status || "procesuara", createdAt: row.created_at, updatedAt: row.updated_at,
  };
}
function mapPostaOrderToDB(o, accountId) {
  return {
    id: o.id, account_id: accountId, order_no: o.orderNo || null, client_name: o.clientName || null,
    client_surname: o.clientSurname || null, client_phone: o.clientPhone || null, city: o.city || null,
    country: o.country || null, address: o.address || null, description: o.description || null,
    price: o.price || 0, weight: o.weight || null, notes: o.notes || null, status: o.status || "procesuara",
    created_at: o.createdAt || new Date().toISOString(), updated_at: new Date().toISOString(),
  };
}
async function loadArkaData(accountId) {
  try {
    const [prodRes, saleRes, warrRes, debtRes, couponRes, postaRes] = await Promise.all([
      supabase.from('products').select('*').eq('account_id', accountId).order('created_at', { ascending: false }),
      supabase.from('sales').select('*').eq('account_id', accountId).order('created_at', { ascending: false }),
      supabase.from('warranties').select('*').eq('account_id', accountId).order('created_at', { ascending: false }),
      supabase.from('debts').select('*').eq('account_id', accountId).order('created_at', { ascending: false }),
      supabase.from('coupons').select('*').eq('account_id', accountId).order('created_at', { ascending: false }),
      supabase.from('posta_orders').select('*').eq('account_id', accountId).order('created_at', { ascending: false }),
    ]);
    return {
      products: (prodRes.data || []).map(mapProductFromDB),
      sales: (saleRes.data || []).map(mapSaleFromDB),
      warranties: (warrRes.data || []).map(mapWarrantyFromDB),
      debts: (debtRes.data || []).map(mapDebtFromDB),
      coupons: (couponRes.data || []).map(mapCouponFromDB),
      postaOrders: (postaRes.data || []).map(mapPostaOrderFromDB),
    };
  } catch (e) {
    console.error('loadArkaData failed:', e);
    return { products: [], sales: [], warranties: [], debts: [], coupons: [], postaOrders: [] };
  }
}

async function loadAllAccounts() {
  try {
    const { data, error } = await supabase.from('accounts').select('*').order('registered_at', { ascending: false });
    if (error) {
      console.error('loadAllAccounts error:', error);
      return [];
    }
    return (data || []).map(mapAccountFromDB);
  } catch (e) {
    console.error('loadAllAccounts failed:', e);
    return [];
  }
}

function mapClientFromDB(r) {
  return { id: r.id, name: r.name, phone: r.phone || "", createdAt: r.created_at };
}
function mapClientToDB(c, accountId) {
  return { id: c.id, account_id: accountId, name: c.name, phone: c.phone || null, created_at: c.createdAt || new Date().toISOString() };
}
function mapWorkerFromDB(r) {
  return { id: r.id, name: r.name, phone: r.phone || "", createdAt: r.created_at };
}
function mapWorkerToDB(w, accountId) {
  return { id: w.id, account_id: accountId, name: w.name, phone: w.phone || null, created_at: w.createdAt || new Date().toISOString() };
}
function mapJobFromDB(r) {
  return {
    id: r.id,
    clientId: r.client_id,
    workerId: r.worker_id,
    phoneModel: r.phone_model || "",
    imei: r.imei || "",
    description: r.description || "",
    price: r.price != null ? String(r.price) : "",
    status: r.status || "new",
    code: r.code || "",
    createdAt: r.created_at,
  };
}
function mapJobToDB(j, accountId) {
  return {
    id: j.id,
    account_id: accountId,
    client_id: j.clientId || null,
    worker_id: j.workerId || null,
    phone_model: j.phoneModel || null,
    imei: j.imei || null,
    description: j.description || null,
    price: j.price ? parseFloat(j.price) || null : null,
    status: j.status || "new",
    code: j.code || null,
    created_at: j.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function loadBusinessData(accountId) {
  try {
    const [clientsRes, workersRes, jobsRes] = await Promise.all([
      supabase.from('clients').select('*').eq('account_id', accountId),
      supabase.from('workers').select('*').eq('account_id', accountId),
      supabase.from('jobs').select('*').eq('account_id', accountId),
    ]);
    return {
      clients: (clientsRes.data || []).map(mapClientFromDB),
      workers: (workersRes.data || []).map(mapWorkerFromDB),
      jobs: (jobsRes.data || []).map(mapJobFromDB),
    };
  } catch (e) {
    console.error('loadBusinessData failed:', e);
    return { clients: [], workers: [], jobs: [] };
  }
}

function diffById(prev, next) {
  const prevMap = new Map(prev.map(x => [x.id, x]));
  const nextMap = new Map(next.map(x => [x.id, x]));
  const added = next.filter(x => !prevMap.has(x.id));
  const removed = prev.filter(x => !nextMap.has(x.id));
  const changed = next.filter(x => prevMap.has(x.id) && JSON.stringify(prevMap.get(x.id)) !== JSON.stringify(x));
  return { added, removed, changed };
}

async function syncEntity(table, mapToDB, accountId, diff) {
  const call = (x) => accountId === null ? mapToDB(x) : mapToDB(x, accountId);
  try {
    if (diff.added.length) {
      const rows = diff.added.map(call);
      const { error } = await supabase.from(table).insert(rows);
      if (error) console.error(table + ' insert error:', error);
    }
    if (diff.changed.length) {
      for (const x of diff.changed) {
        const row = call(x);
        const { error } = await supabase.from(table).update(row).eq('id', x.id);
        if (error) console.error(table + ' update error:', error);
      }
    }
    if (diff.removed.length) {
      const ids = diff.removed.map(x => x.id);
      const { error } = await supabase.from(table).delete().in('id', ids);
      if (error) console.error(table + ' delete error:', error);
    }
  } catch (e) {
    console.error('syncEntity ' + table + ' failed:', e);
  }
}

// ============================================================
// ARKA (POS) MODULE
// ============================================================
function ArkaPinGate({ T, expectedPin, title, onSuccess, onCancel }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    if (pin === expectedPin) { onSuccess(); }
    else { setErr(true); setTimeout(() => setErr(false), 1500); setPin(""); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s" }}>
      <div style={{ background: T.surface, borderRadius: 20, padding: "32px 36px", width: "90%", maxWidth: 380, boxShadow: "0 24px 80px rgba(0,0,0,.35)", border: `1px solid ${T.border}`, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
        <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: T.text }}>{title || "Shkruaj kodin PIN"}</h3>
        <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>Kërkohet kodi 6-shifror për të hapur Arkën.</p>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="______"
          maxLength={6}
          style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `2px solid ${err ? T.danger : T.border}`, fontSize: 22, letterSpacing: 8, textAlign: "center", outline: "none", background: T.inputBg, color: T.text, fontFamily: "monospace", boxSizing: "border-box" }}
        />
        {err && <div style={{ color: T.danger, fontSize: 12, fontWeight: 700, marginTop: 8 }}>PIN i gabuar!</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onCancel} style={{ flex: 1, background: T.surfaceAlt, color: T.textMuted, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "11px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Anulo</button>
          <button onClick={submit} style={{ flex: 1, background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Hyr</button>
        </div>
      </div>
    </div>
  );
}

function ReportView({ T, business, period, sales, jobs, debts, onBack }) {
  const PERIODS = {
    daily: { label: "Raporti Ditor", sub: "Sot" },
    weekly: { label: "Raporti Javor", sub: "7 ditët e fundit" },
    monthly: { label: "Raporti Mujor", sub: "Muaji aktual" },
    yearly: { label: "Raporti Vjetor", sub: "Viti aktual" },
  };
  const cfg = PERIODS[period] || PERIODS.daily;
  const now = new Date();
  const inRange = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (period === "daily") return d.toDateString() === now.toDateString();
    if (period === "weekly") {
      const ago = new Date(now.getTime() - 7 * 86400000);
      return d >= ago && d <= now;
    }
    if (period === "monthly") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === "yearly") return d.getFullYear() === now.getFullYear();
    return false;
  };

  const periodSales = (sales || []).filter(s => inRange(s.createdAt));
  const periodJobs = (jobs || []).filter(j => inRange(j.createdAt) || inRange(j.updatedAt));
  const periodDebts = (debts || []).filter(x => inRange(x.createdAt));

  const salesTotal = periodSales.reduce((s, x) => s + x.total, 0);
  const salesCash = periodSales.filter(s => s.paymentMethod === "cash" && !s.isCredit).reduce((s, x) => s + x.paid, 0);
  const salesBank = periodSales.filter(s => s.paymentMethod === "bank" && !s.isCredit).reduce((s, x) => s + x.paid, 0);
  const salesCredit = periodSales.filter(s => s.isCredit).reduce((s, x) => s + (x.total - x.paid), 0);

  const jobsCompleted = periodJobs.filter(j => j.status === "perfunduar");
  const jobsRevenue = jobsCompleted.reduce((s, j) => s + (parseFloat(j.price) || 0), 0);
  const jobsActive = periodJobs.filter(j => !["perfunduar", "nuk_merret"].includes(j.status));

  const debtsOpened = periodDebts.reduce((s, d) => s + d.originalAmount, 0);
  const debtsPaid = periodDebts.reduce((s, d) => s + d.paidAmount, 0);
  const debtsOpen = periodDebts.reduce((s, d) => s + d.remainingAmount, 0);

  const totalRevenue = salesTotal + jobsRevenue;

  const printReport = () => {
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;
    const biz = business || {};
    const pad2 = n => String(n).padStart(2, '0');
    const reportNo = "RPT-" + period.slice(0,3).toUpperCase() + "-" + now.getFullYear() + pad2(now.getMonth() + 1) + pad2(now.getDate()) + "-" + pad2(now.getHours()) + pad2(now.getMinutes());
    const salesRows = periodSales.slice(0, 100).map((s, i) => `<tr>
      <td>${i + 1}</td>
      <td><b>${s.receiptNo || '—'}</b></td>
      <td>${new Date(s.createdAt).toLocaleString('sq-AL')}</td>
      <td>${s.clientName || '—'}</td>
      <td class="r">${s.items?.length || 0}</td>
      <td>${s.paymentMethod === 'bank' ? 'Bank' : 'Cash'}${s.isCredit ? ' <span class="badge">borxh</span>' : ''}</td>
      <td class="r"><b>€${s.total.toFixed(2)}</b></td>
    </tr>`).join("");
    const jobsRows = periodJobs.slice(0, 100).map((j, i) => `<tr>
      <td>${i + 1}</td>
      <td><b>#${j.id?.slice(0, 8) || '—'}</b></td>
      <td>${new Date(j.createdAt).toLocaleDateString('sq-AL')}</td>
      <td>${j.phoneModel || '—'}</td>
      <td>${(j.description || '').slice(0, 50)}${(j.description || '').length > 50 ? '…' : ''}</td>
      <td>${j.status || '—'}</td>
      <td class="r"><b>€${(parseFloat(j.price) || 0).toFixed(2)}</b></td>
    </tr>`).join("");
    const debtsRows = periodDebts.slice(0, 50).map((d, i) => `<tr>
      <td>${i + 1}</td>
      <td><b>${d.clientName}</b>${d.clientPhone ? `<br><span style="font-size:10px;color:#64748b">${d.clientPhone}</span>` : ''}</td>
      <td>${new Date(d.createdAt).toLocaleDateString('sq-AL')}</td>
      <td class="r">€${d.originalAmount.toFixed(2)}</td>
      <td class="r">€${d.paidAmount.toFixed(2)}</td>
      <td class="r"><b style="color:${d.isSettled ? '#059669' : '#B91C1C'}">€${d.remainingAmount.toFixed(2)}</b></td>
    </tr>`).join("");
    w.document.write(`<html><head><title>${reportNo}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; }
        .container { max-width: 840px; margin: 0 auto; padding: 8px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0EA5E9; padding-bottom: 14px; margin-bottom: 20px; }
        .biz-name { font-size: 22px; font-weight: 800; color: #0EA5E9; margin: 0; }
        .biz-sub { font-size: 11px; color: #64748b; margin-top: 2px; line-height: 1.4; }
        .title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: 1px; text-align: right; }
        .sub { font-size: 12px; color: #475569; text-align: right; margin-top: 2px; }
        .meta { font-size: 10.5px; color: #64748b; text-align: right; margin-top: 3px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
        .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
        .stat .label { font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; }
        .stat .value { font-size: 18px; font-weight: 800; margin-top: 3px; color: #0f172a; }
        .stat.primary { background: linear-gradient(135deg, #0EA5E9, #0284c7); color: #fff; border-color: #0EA5E9; }
        .stat.primary .label, .stat.primary .value { color: #fff; }
        .stat.success .value { color: #059669; }
        .stat.danger .value { color: #B91C1C; }
        .stat.warn .value { color: #D97706; }
        .section-title { font-size: 13px; font-weight: 800; color: #0f172a; margin: 16px 0 8px; padding-bottom: 6px; border-bottom: 2px solid #0EA5E9; text-transform: uppercase; letter-spacing: 1px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th { background: #0f172a; color: #fff; padding: 8px 10px; font-size: 10px; text-align: left; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
        th.r, td.r { text-align: right; }
        td { padding: 7px 10px; font-size: 11px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .badge { background: #FEF3C7; color: #92400E; padding: 1px 6px; border-radius: 8px; font-size: 9px; font-weight: 700; }
        .empty { text-align: center; color: #94a3b8; padding: 16px; font-style: italic; font-size: 11px; }
        .footer { border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; font-size: 10px; color: #64748b; margin-top: 20px; }
        .summary-box { background: #0f172a; color: #fff; padding: 14px 18px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .summary-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
        .summary-box .value { font-size: 26px; font-weight: 800; }
      </style></head><body>
      <div class="container">
        <div class="header">
          <div style="display:flex;align-items:center;gap:12px">
            ${biz.logo ? `<img src="${biz.logo}" style="width:48px;height:48px;object-fit:contain">` : ''}
            <div>
              <div class="biz-name">${biz.name || "Biznesi"}</div>
              <div class="biz-sub">${biz.address || ""} ${biz.city || ""}<br>Tel: ${biz.phone || ""} ${biz.email ? "· " + biz.email : ""}</div>
            </div>
          </div>
          <div>
            <div class="title">${cfg.label.toUpperCase()}</div>
            <div class="sub">${cfg.sub}</div>
            <div class="meta">Nr. Raporti: <b>${reportNo}</b></div>
            <div class="meta">Gjeneruar: ${now.toLocaleString('sq-AL')}</div>
          </div>
        </div>

        <div class="summary-box">
          <div>
            <div class="label">Të Ardhura Gjithsej</div>
            <div style="font-size:10px;opacity:.7;margin-top:3px">Arka + Servis për ${cfg.sub.toLowerCase()}</div>
          </div>
          <div class="value">€${totalRevenue.toFixed(2)}</div>
        </div>

        <div class="section-title">🛒 Shitjet e Arkës</div>
        <div class="stats">
          <div class="stat primary"><div class="label">Gjithsej Shitje</div><div class="value">€${salesTotal.toFixed(2)}</div></div>
          <div class="stat"><div class="label">Nr. transaksioneve</div><div class="value">${periodSales.length}</div></div>
          <div class="stat success"><div class="label">Cash</div><div class="value">€${salesCash.toFixed(2)}</div></div>
          <div class="stat"><div class="label">Bank</div><div class="value">€${salesBank.toFixed(2)}</div></div>
        </div>
        <table>
          <thead><tr>
            <th style="width:34px">Nr</th><th>Nr. Faturës</th><th>Data</th><th>Klienti</th>
            <th class="r" style="width:50px">Artikuj</th><th>Metoda</th><th class="r">Totali</th>
          </tr></thead>
          <tbody>${salesRows || '<tr><td colspan="7" class="empty">Nuk ka shitje në këtë periudhë</td></tr>'}</tbody>
        </table>

        <div class="section-title">🔧 Punët në Servis</div>
        <div class="stats">
          <div class="stat primary"><div class="label">Të Ardhura nga Servisi</div><div class="value">€${jobsRevenue.toFixed(2)}</div></div>
          <div class="stat success"><div class="label">Të përfunduara</div><div class="value">${jobsCompleted.length}</div></div>
          <div class="stat warn"><div class="label">Në proces</div><div class="value">${jobsActive.length}</div></div>
          <div class="stat"><div class="label">Gjithsej punë</div><div class="value">${periodJobs.length}</div></div>
        </div>
        <table>
          <thead><tr>
            <th style="width:34px">Nr</th><th>ID</th><th>Data</th><th>Modeli</th>
            <th>Përshkrimi</th><th>Statusi</th><th class="r">Çmimi</th>
          </tr></thead>
          <tbody>${jobsRows || '<tr><td colspan="7" class="empty">Nuk ka punë në servis në këtë periudhë</td></tr>'}</tbody>
        </table>

        <div class="section-title">💳 Borxhet</div>
        <div class="stats">
          <div class="stat warn"><div class="label">Borxhe të krijuara</div><div class="value">€${debtsOpened.toFixed(2)}</div></div>
          <div class="stat success"><div class="label">Të paguara</div><div class="value">€${debtsPaid.toFixed(2)}</div></div>
          <div class="stat danger"><div class="label">Të pashlyera</div><div class="value">€${debtsOpen.toFixed(2)}</div></div>
          <div class="stat"><div class="label">Numri</div><div class="value">${periodDebts.length}</div></div>
        </div>
        <table>
          <thead><tr>
            <th style="width:34px">Nr</th><th>Klienti</th><th>Data</th>
            <th class="r">Totali</th><th class="r">Paguar</th><th class="r">Mbetur</th>
          </tr></thead>
          <tbody>${debtsRows || '<tr><td colspan="6" class="empty">Nuk ka borxhe në këtë periudhë</td></tr>'}</tbody>
        </table>

        <div class="footer">
          Ky raport është gjeneruar automatikisht nga sistemi ProPhone — ${now.toLocaleString('sq-AL')}<br>
          <span style="font-style:italic">Raporti përfshin të dhënat aktive në momentin e gjenerimit.</span>
        </div>
      </div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),250);}</script>
      </body></html>`);
    w.document.close();
  };

  const Stat = ({ label, value, color, sub }) => (
    <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || T.text, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ animation: "slideUp .2s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, color: T.textMuted, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>{PIc.back(12)} Kthehu</button>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>{cfg.label}</h2>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{cfg.sub} · Gjeneruar: {now.toLocaleString('sq-AL')}</div>
          </div>
        </div>
        <button onClick={printReport} style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          {PIc.printer(14)} Printo Raportin A4
        </button>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)", color: "#fff", padding: "20px 24px", borderRadius: 14, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.75 }}>Të Ardhura Gjithsej</div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>Arka + Servis</div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -0.5 }}>€{totalRevenue.toFixed(2)}</div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>{PIc.receipt(14)} Shitjet e Arkës</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
        <Stat label="Gjithsej shitje" value={`€${salesTotal.toFixed(2)}`} color={T.accent} />
        <Stat label="Nr. transaksioneve" value={periodSales.length} />
        <Stat label="Cash" value={`€${salesCash.toFixed(2)}`} color="#10B981" />
        <Stat label="Bank" value={`€${salesBank.toFixed(2)}`} />
        <Stat label="Me borxh" value={`€${salesCredit.toFixed(2)}`} color="#F59E0B" />
      </div>

      <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>{PIc.settings(13)} Punët në Servis</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
        <Stat label="Të ardhura nga servisi" value={`€${jobsRevenue.toFixed(2)}`} color={T.accent} />
        <Stat label="Të përfunduara" value={jobsCompleted.length} color="#10B981" />
        <Stat label="Në proces" value={jobsActive.length} color="#F59E0B" />
        <Stat label="Gjithsej punë" value={periodJobs.length} />
      </div>

      <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>{PIc.cash(13)} Borxhet</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 22 }}>
        <Stat label="Borxhe të krijuara" value={`€${debtsOpened.toFixed(2)}`} color="#F59E0B" />
        <Stat label="Të paguara" value={`€${debtsPaid.toFixed(2)}`} color="#10B981" />
        <Stat label="Të pashlyera" value={`€${debtsOpen.toFixed(2)}`} color="#B91C1C" />
        <Stat label="Numri" value={periodDebts.length} />
      </div>

      {periodSales.length > 0 && (
        <div style={{ background: T.surface, borderRadius: 12, border: `1.5px solid ${T.border}`, overflow: "hidden", marginBottom: 18 }}>
          <div style={{ padding: "10px 16px", background: T.surfaceAlt, fontSize: 12, fontWeight: 800, color: T.text, borderBottom: `1px solid ${T.border}` }}>Shitjet e detajuara ({periodSales.length})</div>
          <div style={{ maxHeight: 300, overflow: "auto" }}>
            {periodSales.slice(0, 50).map((s, i) => (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "36px 1.5fr 1fr 120px 1fr 100px", padding: "9px 16px", fontSize: 12, color: T.text, borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
                <div style={{ color: T.textMuted }}>{i + 1}</div>
                <div style={{ fontWeight: 700 }}>{s.receiptNo || '—'}</div>
                <div style={{ color: T.textMuted, fontSize: 11 }}>{new Date(s.createdAt).toLocaleString('sq-AL')}</div>
                <div>{s.clientName || '—'}</div>
                <div style={{ color: T.textMuted, fontSize: 11 }}>{s.paymentMethod === 'bank' ? 'Bank' : 'Cash'} {s.isCredit && <span style={{ background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: 8, fontSize: 9, fontWeight: 700, marginLeft: 4 }}>borxh</span>}</div>
                <div style={{ textAlign: "right", fontWeight: 800, color: T.accent }}>€{s.total.toFixed(2)}</div>
              </div>
            ))}
            {periodSales.length > 50 && <div style={{ padding: 10, textAlign: "center", fontSize: 11, color: T.textFaint }}>+ {periodSales.length - 50} të tjera (shfaqen në printim)</div>}
          </div>
        </div>
      )}

      {periodJobs.length > 0 && (
        <div style={{ background: T.surface, borderRadius: 12, border: `1.5px solid ${T.border}`, overflow: "hidden", marginBottom: 18 }}>
          <div style={{ padding: "10px 16px", background: T.surfaceAlt, fontSize: 12, fontWeight: 800, color: T.text, borderBottom: `1px solid ${T.border}` }}>Punët në servis ({periodJobs.length})</div>
          <div style={{ maxHeight: 300, overflow: "auto" }}>
            {periodJobs.slice(0, 50).map((j, i) => (
              <div key={j.id} style={{ display: "grid", gridTemplateColumns: "36px 1fr 100px 1.5fr 100px 80px", padding: "9px 16px", fontSize: 12, color: T.text, borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
                <div style={{ color: T.textMuted }}>{i + 1}</div>
                <div style={{ fontWeight: 700 }}>{j.phoneModel || '—'}</div>
                <div style={{ color: T.textMuted, fontSize: 11 }}>{new Date(j.createdAt).toLocaleDateString('sq-AL')}</div>
                <div style={{ color: T.textMuted, fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{j.description || '—'}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{j.status || '—'}</div>
                <div style={{ textAlign: "right", fontWeight: 700, color: T.accent }}>€{(parseFloat(j.price) || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DebtsView({ T, business, debts, onUpdate, onDelete, onBack }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("open");
  const [editing, setEditing] = useState(null);
  const [addPayForId, setAddPayForId] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [addMoreFor, setAddMoreFor] = useState(null);
  const [addMoreAmount, setAddMoreAmount] = useState("");
  const [addMoreDesc, setAddMoreDesc] = useState("");

  const list = debts.filter(d => {
    if (filter === "open" && d.isSettled) return false;
    if (filter === "settled" && !d.isSettled) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return d.clientName.toLowerCase().includes(s) || (d.clientPhone || "").includes(search);
  });
  const openTotal = debts.filter(d => !d.isSettled).reduce((s, d) => s + d.remainingAmount, 0);
  const paidTotal = debts.reduce((s, d) => s + d.paidAmount, 0);
  const openCount = debts.filter(d => !d.isSettled).length;

  const applyPayment = () => {
    const amt = Number(payAmount) || 0;
    if (amt <= 0) return;
    const d = debts.find(x => x.id === addPayForId);
    if (!d) return;
    const newPaid = d.paidAmount + amt;
    const newRemaining = Math.max(0, d.originalAmount - newPaid);
    onUpdate({ ...d, paidAmount: newPaid, remainingAmount: newRemaining, isSettled: newRemaining <= 0 });
    setAddPayForId(null); setPayAmount("");
  };
  const addMoreDebt = () => {
    const amt = Number(addMoreAmount) || 0;
    if (amt <= 0) return;
    const d = debts.find(x => x.id === addMoreFor);
    if (!d) return;
    onUpdate({
      ...d,
      originalAmount: d.originalAmount + amt,
      remainingAmount: d.remainingAmount + amt,
      isSettled: false,
      notes: (d.notes ? d.notes + "\n" : "") + `[${new Date().toLocaleDateString('sq-AL')}] Shtuar €${amt.toFixed(2)}${addMoreDesc ? " — " + addMoreDesc : ""}`,
    });
    setAddMoreFor(null); setAddMoreAmount(""); setAddMoreDesc("");
  };
  const saveEdit = () => {
    if (!editing) return;
    const rem = Math.max(0, (Number(editing.originalAmount) || 0) - (Number(editing.paidAmount) || 0));
    onUpdate({ ...editing, originalAmount: Number(editing.originalAmount) || 0, paidAmount: Number(editing.paidAmount) || 0, remainingAmount: rem, isSettled: rem <= 0 });
    setEditing(null);
  };

  const printReport = () => {
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;
    const biz = business || {};
    const nowDt = new Date();
    const pad2 = n => String(n).padStart(2, '0');
    const reportNo = "BRX-" + nowDt.getFullYear() + pad2(nowDt.getMonth() + 1) + pad2(nowDt.getDate()) + "-" + pad2(nowDt.getHours()) + pad2(nowDt.getMinutes());
    const rows = list.map((d, i) => `<tr>
      <td>${i + 1}</td>
      <td><b>${d.clientName}</b>${d.clientPhone ? `<br><span style="font-size:10px;color:#64748b">${d.clientPhone}</span>` : ""}</td>
      <td>${new Date(d.createdAt).toLocaleDateString('sq-AL')}</td>
      <td class="r">€${d.originalAmount.toFixed(2)}</td>
      <td class="r">€${d.paidAmount.toFixed(2)}</td>
      <td class="r"><b style="color:${d.isSettled ? '#059669' : '#B91C1C'}">€${d.remainingAmount.toFixed(2)}</b></td>
      <td><span class="pill ${d.isSettled ? 'settled' : 'open'}">${d.isSettled ? 'Mbyllur' : 'I hapur'}</span></td>
    </tr>`).join("");
    w.document.write(`<html><head><title>${reportNo}</title>
      <style>
        @page { size: A4; margin: 18mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; }
        .container { max-width: 800px; margin: 0 auto; padding: 10px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0EA5E9; padding-bottom: 16px; margin-bottom: 22px; }
        .biz-name { font-size: 22px; font-weight: 800; color: #0EA5E9; margin: 0; }
        .biz-sub { font-size: 11px; color: #64748b; margin-top: 2px; line-height: 1.4; }
        .title { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 1px; text-align: right; }
        .meta { font-size: 11px; color: #64748b; text-align: right; margin-top: 4px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
        .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
        .stat .label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .stat .value { font-size: 22px; font-weight: 800; margin-top: 4px; }
        .stat.danger .value { color: #B91C1C; }
        .stat.success .value { color: #059669; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #0f172a; color: #fff; padding: 10px 12px; font-size: 11px; text-align: left; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        th.r, td.r { text-align: right; }
        td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .pill { font-size: 10px; padding: 3px 8px; border-radius: 10px; font-weight: 700; }
        .pill.open { background: #FEE2E2; color: #B91C1C; }
        .pill.settled { background: #D1FAE5; color: #059669; }
        .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 10.5px; color: #64748b; margin-top: 24px; }
      </style></head><body>
      <div class="container">
        <div class="header">
          <div style="display:flex;align-items:center;gap:12px">
            ${biz.logo ? `<img src="${biz.logo}" style="width:50px;height:50px;object-fit:contain">` : ''}
            <div>
              <div class="biz-name">${biz.name || "Biznesi"}</div>
              <div class="biz-sub">${biz.address || ""} ${biz.city || ""}<br>Tel: ${biz.phone || ""}</div>
            </div>
          </div>
          <div>
            <div class="title">RAPORTI I BORXHEVE</div>
            <div class="meta">Nr. Raporti: <b>${reportNo}</b></div>
            <div class="meta">Data: ${nowDt.toLocaleString('sq-AL')}</div>
          </div>
        </div>
        <div class="stats">
          <div class="stat"><div class="label">Numri i borxheve</div><div class="value">${list.length}</div></div>
          <div class="stat danger"><div class="label">Borxh i hapur</div><div class="value">€${openTotal.toFixed(2)}</div></div>
          <div class="stat success"><div class="label">Gjithsej i paguar</div><div class="value">€${paidTotal.toFixed(2)}</div></div>
        </div>
        <table>
          <thead><tr>
            <th style="width:40px">Nr</th><th>Klienti</th><th>Data</th>
            <th class="r">Totali</th><th class="r">Paguar</th><th class="r">Mbetur</th><th>Statusi</th>
          </tr></thead>
          <tbody>${rows || '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:30px">Nuk ka borxhe për raportim</td></tr>'}</tbody>
        </table>
        <div class="footer">Ky raport është gjeneruar automatikisht nga sistemi ProPhone — ${nowDt.toLocaleString('sq-AL')}</div>
      </div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),200);}</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div style={{ animation: "slideUp .2s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, color: T.textMuted, fontWeight: 600 }}>← Kthehu</button>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>Borxhet</h2>
        </div>
        <button onClick={printReport} style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          {PIc.printer(14)} Printo Raport A4
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 18 }}>
        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Borxhe t&euml; hapura</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#B91C1C", marginTop: 6 }}>€{openTotal.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>{openCount} klientë</div>
        </div>
        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Gjithsej i paguar</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#059669", marginTop: 6 }}>€{paidTotal.toFixed(2)}</div>
        </div>
        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Numri gjithsej</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.text, marginTop: 6 }}>{debts.length}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko klientin ose telefonin..."
          style={{ flex: 1, minWidth: 200, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.inputBg, color: T.text, outline: "none", fontFamily: "inherit" }} />
        {[["open", "Të hapura"], ["settled", "Të mbyllura"], ["all", "Të gjitha"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ background: filter === k ? T.accent : T.surface, color: filter === k ? "#fff" : T.textMuted, border: `1.5px solid ${filter === k ? T.accent : T.border}`, borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ background: T.surface, borderRadius: 14, border: `1.5px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 130px 110px 110px 110px 120px 180px", padding: "12px 18px", background: T.surfaceAlt, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.border}` }}>
          <div>Klienti</div><div>Data</div><div>Totali</div><div>Paguar</div><div>Mbetur</div><div>Statusi</div><div style={{ textAlign: "right" }}>Veprime</div>
        </div>
        {list.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: T.textFaint, fontSize: 13 }}>Nuk ka borxhe për të shfaqur.</div>
        ) : list.map(d => (
          <div key={d.id} style={{ display: "grid", gridTemplateColumns: "2fr 130px 110px 110px 110px 120px 180px", padding: "12px 18px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{d.clientName}</div>
              {d.clientPhone && <div style={{ fontSize: 11, color: T.textFaint }}>{d.clientPhone}</div>}
            </div>
            <div style={{ color: T.textMuted, fontSize: 12 }}>{new Date(d.createdAt).toLocaleDateString('sq-AL')}</div>
            <div>€{d.originalAmount.toFixed(2)}</div>
            <div style={{ color: "#059669" }}>€{d.paidAmount.toFixed(2)}</div>
            <div style={{ fontWeight: 800, color: d.isSettled ? "#059669" : "#B91C1C" }}>€{d.remainingAmount.toFixed(2)}</div>
            <div>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: d.isSettled ? "#D1FAE5" : "#FEE2E2", color: d.isSettled ? "#059669" : "#B91C1C" }}>
                {d.isSettled ? "✓ Mbyllur" : "I hapur"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
              {!d.isSettled && (
                <button onClick={() => { setAddPayForId(d.id); setPayAmount(String(d.remainingAmount.toFixed(2))); }} title="Regjistro pagesë" style={{ background: "#D1FAE5", color: "#059669", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>+ Pagesë</button>
              )}
              <button onClick={() => { setAddMoreFor(d.id); setAddMoreAmount(""); setAddMoreDesc(""); }} title="Shto borxh" style={{ background: "#FEF3C7", color: "#92400E", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>+ Borxh</button>
              <button onClick={() => setEditing({ ...d })} title="Edito" style={{ background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11 }}>Edito</button>
              <button onClick={() => { if (window.confirm(`Fshi borxhin e ${d.clientName}?`)) onDelete(d.id); }} title="Fshi" style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 11 }}>Fshi</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEditing(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, width: "100%", maxWidth: 480, border: `1px solid ${T.border}`, padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: T.text }}>Edito borxhin — {editing.clientName}</h3>
            <div style={{ marginBottom: 12 }}><FormField T={T} label="Emri i klientit" value={editing.clientName} onChange={e => setEditing(x => ({ ...x, clientName: e.target.value }))} /></div>
            <div style={{ marginBottom: 12 }}><FormField T={T} label="Telefoni" value={editing.clientPhone} onChange={e => setEditing(x => ({ ...x, clientPhone: e.target.value }))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <FormField T={T} label="Totali original (€)" type="number" value={editing.originalAmount} onChange={e => setEditing(x => ({ ...x, originalAmount: e.target.value }))} />
              <FormField T={T} label="I paguar (€)" type="number" value={editing.paidAmount} onChange={e => setEditing(x => ({ ...x, paidAmount: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>Shënime</label>
              <textarea value={editing.notes || ""} onChange={e => setEditing(x => ({ ...x, notes: e.target.value }))} rows={3}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.inputBg, color: T.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setEditing(null)} style={{ background: T.surfaceAlt, color: T.textMuted, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Anulo</button>
              <button onClick={saveEdit} style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>Ruaj ndryshimet</button>
            </div>
          </div>
        </div>
      )}

      {addPayForId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setAddPayForId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, width: "100%", maxWidth: 380, border: `1px solid ${T.border}`, padding: 24 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 800, color: T.text }}>Regjistro pagesë</h3>
            <FormField T={T} label="Shuma e pagesës (€)" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setAddPayForId(null)} style={{ background: T.surfaceAlt, color: T.textMuted, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Anulo</button>
              <button onClick={applyPayment} style={{ background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>Regjistro</button>
            </div>
          </div>
        </div>
      )}

      {addMoreFor && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setAddMoreFor(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, width: "100%", maxWidth: 380, border: `1px solid ${T.border}`, padding: 24 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 800, color: T.text }}>Shto borxh shtesë</h3>
            <div style={{ marginBottom: 12 }}><FormField T={T} label="Shuma e re (€)" type="number" value={addMoreAmount} onChange={e => setAddMoreAmount(e.target.value)} /></div>
            <div style={{ marginBottom: 4 }}><FormField T={T} label="Përshkrim (opsional)" value={addMoreDesc} onChange={e => setAddMoreDesc(e.target.value)} placeholder="p.sh. Blerje shtesë..." /></div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setAddMoreFor(null)} style={{ background: T.surfaceAlt, color: T.textMuted, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Anulo</button>
              <button onClick={addMoreDebt} style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>Shto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArkaLanding({ T, onOpenPOS, onOpenProducts, onOpenDebts, onOpenReport, onResetDay, onResetMonth, onResetYear, arkaOpen, productsCount, todaySalesTotal, openDebtsTotal, openDebtsCount }) {
  return (
    <div style={{ animation: "slideUp .2s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: T.text }}>Arka</h1>
        <p style={{ color: T.textMuted, fontSize: 14, marginTop: 4 }}>Menaxhimi i shitjeve dhe pazarit ditor</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Produktet</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.accent, marginTop: 6 }}>{productsCount}</div>
        </div>
        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Shitjet e sotme</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#10B981", marginTop: 6 }}>€{todaySalesTotal.toFixed(2)}</div>
        </div>
        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Borxhe t&euml; hapura</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#B91C1C", marginTop: 6 }}>€{(openDebtsTotal || 0).toFixed(2)}</div>
          <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>{openDebtsCount || 0} klientë</div>
        </div>
        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Statusi</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: arkaOpen ? "#10B981" : "#F59E0B", marginTop: 10 }}>{arkaOpen ? "● E Hapur" : "● E Mbyllur"}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 24 }}>
        <button onClick={onOpenProducts}
          style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: 18, padding: "28px 24px", cursor: "pointer", textAlign: "left", transition: "all .2s", fontFamily: "inherit" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${T.accent}22`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: `${T.accent}15`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>{PIc.document(22)}</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>Regjistro produkte</div>
          <div style={{ fontSize: 12.5, color: T.textMuted, marginTop: 5 }}>Shto, edito, fshi; importo/eksporto CSV</div>
        </button>
        <button onClick={onOpenPOS}
          style={{ background: T.accentGrad, border: "none", borderRadius: 18, padding: "28px 24px", cursor: "pointer", textAlign: "left", color: "#fff", transition: "all .2s", fontFamily: "inherit" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${T.accent}55`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(255,255,255,.2)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>{PIc.receipt(22)}</div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Hap arkën</div>
          <div style={{ fontSize: 12.5, opacity: .9, marginTop: 5 }}>Bëj shitje, printo fatura, pazari ditor</div>
        </button>
        <button onClick={onOpenDebts}
          style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: 18, padding: "28px 24px", cursor: "pointer", textAlign: "left", transition: "all .2s", fontFamily: "inherit" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#F59E0B"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(245,158,11,.22)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>{PIc.cash(22)}</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>Borxhet</div>
          <div style={{ fontSize: 12.5, color: T.textMuted, marginTop: 5 }}>Menaxho borxhet e klientëve, raport A4</div>
        </button>
      </div>

      <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${T.accent}15`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIc.document(14)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Raportet</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>Shiko dhe printo raporte të detajuara për shitje, punë në servis dhe borxhe.</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
          {[["daily", "Raporti Ditor", "Sot"], ["weekly", "Raporti Javor", "7 ditët e fundit"], ["monthly", "Raporti Mujor", "Muaji aktual"], ["yearly", "Raporti Vjetor", "Viti aktual"]].map(([k, l, sub]) => (
            <button key={k} onClick={() => onOpenReport(k)}
              style={{ background: T.surfaceAlt, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = `${T.accent}08`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surfaceAlt; }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>{PIc.document(13)} {l}</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>{sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: 16, padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#B91C1C", display: "flex", alignItems: "center", gap: 8 }}>{PIc.trashLine(14)} Zona e Resetimit</div>
            <div style={{ fontSize: 11, color: "#7F1D1D", marginTop: 2 }}>Këto veprime fshijnë të dhënat përgjithmonë — kërkohet kodi PIN i Arkës.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={onResetDay} style={{ background: "#F59E0B", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>Reseto Ditën</button>
          <button onClick={onResetMonth} style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>Reseto Muajin</button>
          <button onClick={onResetYear} style={{ background: "#B91C1C", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>Reseto Vitin</button>
        </div>
      </div>
    </div>
  );
}

function RegisterProducts({ T, products, onChange, onBack }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const emptyForm = { name: "", barcode: "", category: "", price: "", cost: "", stock: "", unit: "cope", image: null };
  const [form, setForm] = useState(emptyForm);
  const [delId, setDelId] = useState(null);
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, barcode: p.barcode || "", category: p.category || "", price: String(p.price || ""), cost: String(p.cost || ""), stock: String(p.stock || ""), unit: p.unit || "cope", image: p.image || null }); setModalOpen(true); };
  const save = () => {
    if (!form.name.trim()) return;
    const payload = {
      id: editing?.id || ("prod_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7)),
      name: form.name.trim(),
      barcode: form.barcode.trim(),
      category: form.category.trim(),
      price: Number(form.price) || 0,
      cost: Number(form.cost) || 0,
      stock: Number(form.stock) || 0,
      unit: form.unit || "cope",
      image: form.image || null,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    if (editing) onChange(products.map(p => p.id === editing.id ? payload : p));
    else onChange([payload, ...products]);
    setModalOpen(false);
  };
  const doDelete = (id) => { onChange(products.filter(p => p.id !== id)); setDelId(null); };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Fotoja duhet të jetë më e vogël se 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const exportCsv = () => {
    const rows = [
      ["name", "barcode", "category", "price", "cost", "stock", "unit"],
      ...products.map(p => [p.name, p.barcode || "", p.category || "", p.price, p.cost || 0, p.stock || 0, p.unit || "cope"]),
    ];
    const csv = rows.map(r => r.map(v => {
      const s = String(v == null ? "" : v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `produkte_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result).replace(/^\uFEFF/, "");
        const lines = text.split(/\r?\n/).filter(l => l.trim().length);
        if (lines.length < 2) { alert("Skedari është bosh ose nuk ka rreshta të dhënash."); return; }
        const parseLine = (line) => {
          const out = []; let cur = ""; let inQ = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQ) {
              if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; }
              else if (ch === '"') { inQ = false; }
              else { cur += ch; }
            } else {
              if (ch === '"') { inQ = true; }
              else if (ch === "," || ch === ";") { out.push(cur); cur = ""; }
              else { cur += ch; }
            }
          }
          out.push(cur);
          return out;
        };
        const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());
        const idx = k => headers.indexOf(k);
        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          const c = parseLine(lines[i]);
          const name = (c[idx("name")] || c[idx("emri")] || "").trim();
          if (!name) continue;
          imported.push({
            id: "prod_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7) + "_" + i,
            name,
            barcode: (c[idx("barcode")] || c[idx("barkodi")] || "").trim(),
            category: (c[idx("category")] || c[idx("kategoria")] || "").trim(),
            price: Number(c[idx("price")] || c[idx("cmimi")] || 0) || 0,
            cost: Number(c[idx("cost")] || 0) || 0,
            stock: Number(c[idx("stock")] || c[idx("stoku")] || 0) || 0,
            unit: (c[idx("unit")] || c[idx("njesia")] || "cope").trim(),
            image: null,
            createdAt: new Date().toISOString(),
          });
        }
        if (imported.length === 0) { alert("Nuk u importua asnjë produkt (kontrollo emrat e kolonave: name, barcode, price...)."); return; }
        if (window.confirm(`Do të importohen ${imported.length} produkte. Vazhdoni?`)) {
          onChange([...imported, ...products]);
        }
      } catch (err) {
        alert("Gabim në lexim: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode || "").includes(search) || (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ animation: "slideUp .2s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, color: T.textMuted, fontWeight: 600 }}>← Kthehu</button>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>Regjistro Produkte</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input ref={importInputRef} type="file" accept=".csv,text/csv" onChange={importCsv} style={{ display: "none" }} />
          <button onClick={() => importInputRef.current?.click()} style={{ background: T.surface, color: T.text, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            {PIc.download ? PIc.download(13) : "⬆"} Importo CSV
          </button>
          <button onClick={exportCsv} disabled={products.length === 0} style={{ background: T.surface, color: T.text, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "9px 16px", cursor: products.length ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 13, opacity: products.length ? 1 : .5, display: "flex", alignItems: "center", gap: 6 }}>
            {PIc.save(13)} Eksporto CSV
          </button>
          <button onClick={openNew} style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            {PIc.plus(13)} Shto Produkt
          </button>
        </div>
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko sipas emrit, barkodit ose kategorisë..."
        style={{ width: "100%", padding: "11px 16px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 14, outline: "none", background: T.inputBg, color: T.text, marginBottom: 16, boxSizing: "border-box" }} />

      <div style={{ background: T.surface, borderRadius: 16, border: `1.5px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "56px 2fr 1fr 1fr 1fr 1fr 120px", padding: "14px 20px", background: T.surfaceAlt, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", borderBottom: `1px solid ${T.border}` }}>
          <div>Foto</div><div>Emri</div><div>Barkodi</div><div>Kategoria</div><div>Çmimi</div><div>Stoku</div><div style={{ textAlign: "right" }}>Veprime</div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: T.textFaint, fontSize: 14 }}>Nuk ka produkte — klikoni "+ Shto Produkt" për të filluar.</div>
        ) : filtered.map(p => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "56px 2fr 1fr 1fr 1fr 1fr 120px", padding: "10px 20px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
            <div>
              {p.image ? (
                <img src={p.image} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}` }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 8, background: T.surfaceAlt, border: `1px dashed ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textFaint }}>—</div>
              )}
            </div>
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div style={{ color: T.textMuted }}>{p.barcode || "—"}</div>
            <div style={{ color: T.textMuted }}>{p.category || "—"}</div>
            <div style={{ fontWeight: 700, color: T.accent }}>€{Number(p.price).toFixed(2)}</div>
            <div style={{ color: p.stock <= 0 ? T.danger : T.text, fontWeight: 600 }}>{p.stock} {p.unit}</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button onClick={() => openEdit(p)} style={{ background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Edito</button>
              <button onClick={() => setDelId(p.id)} style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Fshi</button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s" }} onClick={() => setModalOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 20, padding: "28px 32px", width: "92%", maxWidth: 560, border: `1px solid ${T.border}`, boxShadow: "0 24px 80px rgba(0,0,0,.3)" }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 800, color: T.text }}>{editing ? "Edito produktin" : "Shto produkt të ri"}</h3>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 8 }}>Foto e produktit (opsional)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, border: `1.5px dashed ${T.border}`, background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {form.image ? (
                    <img src={form.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: T.textFaint, fontSize: 11, textAlign: "center" }}>Pa foto</span>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickImage} style={{ display: "none" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={() => fileInputRef.current?.click()} style={{ background: T.surface, color: T.accent, border: `1.5px solid ${T.accent}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    {form.image ? "Ndrysho fotonë" : "Ngarko foto"}
                  </button>
                  {form.image && (
                    <button onClick={() => setForm(f => ({ ...f, image: null }))} style={{ background: "transparent", color: T.danger, border: "none", cursor: "pointer", fontSize: 11, padding: "2px 0", textAlign: "left" }}>× Largo fotonë</button>
                  )}
                  <div style={{ fontSize: 10, color: T.textFaint }}>PNG, JPG deri 2MB</div>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                ["Emri*", "name", "text", "Emri i produktit"],
                ["Barkodi", "barcode", "text", "p.sh. 123456789"],
                ["Kategoria", "category", "text", "p.sh. Pjesë këmbimi"],
                ["Njësia", "unit", "select", ""],
                ["Çmimi i shitjes (€)*", "price", "number", "0.00"],
                ["Çmimi i blerjes (€)", "cost", "number", "0.00"],
                ["Stoku fillestar", "stock", "number", "0"],
              ].map(([label, key, type, ph]) => (
                <div key={key} style={{ gridColumn: key === "name" ? "1 / -1" : "auto" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 5 }}>{label}</label>
                  {type === "select" ? (
                    <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, background: T.inputBg, color: T.text, outline: "none", boxSizing: "border-box" }}>
                      <option value="cope">Copë</option>
                      <option value="kg">Kg</option>
                      <option value="litr">Litër</option>
                      <option value="paket">Paketë</option>
                    </select>
                  ) : (
                    <input type={type} value={form[key]} placeholder={ph}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, background: T.inputBg, color: T.text, outline: "none", boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <button onClick={() => setModalOpen(false)} style={{ background: T.surfaceAlt, color: T.textMuted, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Anulo</button>
              <button onClick={save} style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{editing ? "Ruaj" : "Shto Produktin"}</button>
            </div>
          </div>
        </div>
      )}

      {delId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDelId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 20, padding: "28px 32px", width: "90%", maxWidth: 380, textAlign: "center", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: T.text }}>Konfirmo fshirjen</h3>
            <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 22 }}>Produkti do të fshihet përgjithmonë.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setDelId(null)} style={{ background: T.surfaceAlt, color: T.textMuted, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Anulo</button>
              <button onClick={() => doDelete(delId)} style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Fshi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Professional POS icon set (stroke-based SVGs)
const PIc = {
  back: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>,
  search: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  plus: (s = 12) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  minus: (s = 12) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  close: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  document: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>,
  note: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  shield: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  shieldList: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="13" x2="16" y2="13"/></svg>,
  trashLine: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
  user: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  settings: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  printer: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  receipt: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="14" y2="15"/></svg>,
  cash: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="18" y1="10" x2="18" y2="14"/></svg>,
  card: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  lock: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  xCircle: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  save: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  check: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  del: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 5H8l-6 7 6 7h13a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>,
  clock: (s = 13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

function NumericKeypad({ T, total, onComplete, onCancel }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [isCredit, setIsCredit] = useState(false);
  const [printReceipt, setPrintReceipt] = useState(true);

  const press = (k) => {
    setAmount(a => {
      if (k === "C") return "";
      if (k === "⌫") return a.slice(0, -1);
      if (k === ".") return a.includes(".") ? a : (a || "0") + ".";
      const next = a + k;
      if (next.split(".")[1]?.length > 2) return a;
      return next.replace(/^0+(\d)/, "$1");
    });
  };

  const paid = Number(amount) || 0;
  const remaining = Math.max(0, total - paid);
  const change = Math.max(0, paid - total);
  // Në shitje normale kërkohet shuma >= total. Në shitje me borxh lejohet edhe 0.
  const insufficient = !isCredit && paid > 0 && paid < total;
  const canSubmit = isCredit ? (clientName.trim().length > 0) : !insufficient;

  useEffect(() => {
    const h = (e) => {
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); press(e.key); }
      else if (e.key === ".") { e.preventDefault(); press("."); }
      else if (e.key === "Backspace") { e.preventDefault(); press("⌫"); }
      else if (e.key === "Escape") { e.preventDefault(); onCancel(); }
      else if (e.key === "Enter") { e.preventDefault(); if (canSubmit) onComplete({ paid: isCredit ? paid : (paid || total), method, clientName, clientPhone, printReceipt, isCredit, remaining: isCredit ? remaining : 0 }); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [paid, method, clientName, clientPhone, printReceipt, isCredit, canSubmit, remaining]);

  const KeyBtn = ({ label, onClick, wide }) => (
    <button onClick={onClick}
      style={{ gridColumn: wide ? "span 2" : undefined, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "16px 0", fontSize: 22, fontWeight: 700, color: T.text, cursor: "pointer", transition: "all .1s", fontFamily: "inherit" }}
      onMouseDown={e => e.currentTarget.style.background = T.surfaceAlt}
      onMouseUp={e => e.currentTarget.style.background = T.surface}
      onMouseLeave={e => e.currentTarget.style.background = T.surface}>
      {label}
    </button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15, 23, 42, .6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s" }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 18, width: "92%", maxWidth: 440, border: `1px solid ${T.border}`, boxShadow: "0 30px 90px rgba(0,0,0,.35)", overflow: "hidden", animation: "slideUp .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Shuma për pagesë</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: T.text, marginTop: 2 }}>€{total.toFixed(2)}</div>
          </div>
          <button onClick={onCancel} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {PIc.close(14)}
          </button>
        </div>

        <div style={{ padding: 16 }}>
          {/* Amount display */}
          <div style={{ background: T.surfaceAlt, borderRadius: 12, padding: "14px 18px", marginBottom: 12, border: `1.5px solid ${insufficient ? T.danger : T.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Shuma e paguar</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: T.text, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", letterSpacing: 1, marginTop: 2, minHeight: 42 }}>
              €{amount || "0.00"}
              <span style={{ animation: "fadeIn 1s infinite alternate", color: T.accent }}></span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12 }}>
              <span style={{ color: T.textMuted }}>Kusuri:</span>
              <span style={{ fontWeight: 800, color: change > 0 ? "#10B981" : T.textMuted }}>€{change.toFixed(2)}</span>
            </div>
            {insufficient && <div style={{ color: T.danger, fontSize: 11, fontWeight: 700, marginTop: 4 }}>⚠ Shuma më e vogël se totali</div>}
          </div>

          {/* Method toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
            <button onClick={() => setMethod("cash")} style={{ background: method === "cash" ? T.accent : "transparent", color: method === "cash" ? "#fff" : T.textMuted, border: method === "cash" ? "none" : `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}>
              {PIc.cash(14)} Cash
            </button>
            <button onClick={() => setMethod("bank")} style={{ background: method === "bank" ? T.accent : "transparent", color: method === "bank" ? "#fff" : T.textMuted, border: method === "bank" ? "none" : `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}>
              {PIc.card(14)} Bank
            </button>
          </div>

          {/* Keypad */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
            {["7","8","9","4","5","6","1","2","3"].map(k => <KeyBtn key={k} label={k} onClick={() => press(k)} />)}
            <KeyBtn label="." onClick={() => press(".")} />
            <KeyBtn label="0" onClick={() => press("0")} />
            <KeyBtn label="⌫" onClick={() => press("⌫")} />
          </div>

          {/* Quick amounts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
            {[5, 10, 20, 50].map(v => (
              <button key={v} onClick={() => setAmount(String(v))} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, color: T.textMuted, cursor: "pointer", fontFamily: "inherit" }}>€{v}</button>
            ))}
          </div>
          <button onClick={() => setAmount(total.toFixed(2))} style={{ width: "100%", background: T.surfaceAlt, border: `1px dashed ${T.border}`, borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700, color: T.accent, cursor: "pointer", marginBottom: 14, fontFamily: "inherit" }}>
            Pagesë e saktë (€{total.toFixed(2)})
          </button>

          {/* Credit toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: isCredit ? "#FEF3C7" : T.surfaceAlt, border: `1.5px solid ${isCredit ? "#F59E0B" : T.border}`, borderRadius: 10, cursor: "pointer", marginBottom: 10, transition: "all .15s" }}>
            <input type="checkbox" checked={isCredit} onChange={e => setIsCredit(e.target.checked)} style={{ accentColor: "#F59E0B", width: 16, height: 16 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: isCredit ? "#92400E" : T.text }}>Shitje me borxh</div>
              <div style={{ fontSize: 11, color: isCredit ? "#92400E" : T.textMuted, opacity: .85 }}>Shuma e mbetur ruhet si borxh për klientin</div>
            </div>
          </label>

          {/* Credit info panel */}
          {isCredit && (
            <div style={{ background: "#FFFBEB", border: "1.5px solid #FCD34D", borderRadius: 10, padding: "10px 12px", marginBottom: 10, fontSize: 12, color: "#78350F" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>Shuma e pagesës:</span><b>€{total.toFixed(2)}</b></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>Ka paguar klienti:</span><b>€{paid.toFixed(2)}</b></div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: "1px dashed #FCD34D", fontSize: 13 }}><span>Mbet borxh:</span><b style={{ color: "#B91C1C", fontSize: 15 }}>€{remaining.toFixed(2)}</b></div>
            </div>
          )}

          {/* Client info */}
          <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder={isCredit ? "Emri i klientit (i detyrueshëm) *" : "Emri i klientit (opsional)"}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${isCredit && !clientName.trim() ? T.danger : T.border}`, fontSize: 13, background: T.inputBg, color: T.text, outline: "none", boxSizing: "border-box", marginBottom: 8, fontFamily: "inherit" }} />
          {isCredit && (
            <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="Telefoni (opsional, për kontakt)"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.inputBg, color: T.text, outline: "none", boxSizing: "border-box", marginBottom: 10, fontFamily: "inherit" }} />
          )}

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.textMuted, cursor: "pointer", marginBottom: 14 }}>
            <input type="checkbox" checked={printReceipt} onChange={e => setPrintReceipt(e.target.checked)} style={{ accentColor: T.accent }} />
            Printo kuponin pas pagesës
          </label>

          {/* Submit */}
          <button onClick={() => canSubmit && onComplete({ paid: isCredit ? paid : (paid || total), method, clientName, clientPhone, printReceipt, isCredit, remaining: isCredit ? remaining : 0 })}
            disabled={!canSubmit}
            style={{ width: "100%", background: !canSubmit ? T.surfaceAlt : (isCredit ? "linear-gradient(135deg,#F59E0B,#D97706)" : T.accentGrad), color: !canSubmit ? T.textFaint : "#fff", border: "none", borderRadius: 12, padding: "14px", cursor: !canSubmit ? "not-allowed" : "pointer", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
            {PIc.check(16)} {isCredit ? "Regjistro Borxhin" : "Përfundo Shitjen"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Stable form field component (hoisted out to prevent input re-mounting on each keystroke)
function FormField({ T, label, value, onChange, type = "text", placeholder, span }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</label>
      <input type={type} value={value || ""} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.inputBg, color: T.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
    </div>
  );
}

// Shared A4 HTML generator for warranty (used by both dialog and list reprint)
function buildWarrantyA4Html(form, business) {
  const biz = business || {};
  return `<html><head><title>${form.certNo}</title>
    <style>
      @page { size: A4; margin: 20mm; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; }
      .container { max-width: 800px; margin: 0 auto; padding: 20px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0EA5E9; padding-bottom: 20px; margin-bottom: 24px; }
      .logo-wrap { display: flex; align-items: center; gap: 12px; }
      .logo-wrap img { width: 50px; height: 50px; object-fit: contain; }
      .biz-name { font-size: 22px; font-weight: 800; color: #0EA5E9; margin: 0; }
      .biz-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
      .title-box { text-align: right; }
      .title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: 2px; }
      .cert-no { font-size: 11px; color: #64748b; margin-top: 4px; }
      .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 14px; }
      .section-title { font-size: 11px; font-weight: 700; color: #0EA5E9; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
      .field { font-size: 13px; }
      .field .label { color: #64748b; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
      .field .value { color: #0f172a; font-weight: 600; }
      .period-banner { background: linear-gradient(135deg, #0EA5E9, #0284c7); color: #fff; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 14px; }
      .period-banner .months { font-size: 42px; font-weight: 800; line-height: 1; }
      .period-banner .label { font-size: 11px; letter-spacing: 2px; opacity: 0.9; margin-top: 4px; }
      .terms { font-size: 10.5px; color: #475569; line-height: 1.55; padding: 12px 14px; background: #fefce8; border-left: 3px solid #eab308; border-radius: 6px; margin-bottom: 18px; }
      .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
      .sig { text-align: center; border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 11px; color: #64748b; font-weight: 600; }
      .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8; }
    </style></head><body>
    <div class="container">
      <div class="header">
        <div class="logo-wrap">
          ${biz.logo ? `<img src="${biz.logo}" alt="logo">` : ''}
          <div>
            <div class="biz-name">${biz.name || "Biznesi"}</div>
            <div class="biz-sub">${biz.address || ""} ${biz.city || ""} · Tel: ${biz.phone || ""}</div>
            ${biz.email ? `<div class="biz-sub">${biz.email}</div>` : ""}
          </div>
        </div>
        <div class="title-box">
          <div class="title">GARANCION</div>
          <div class="cert-no">Nr. Certifikate: <b>${form.certNo}</b></div>
          <div class="cert-no">Data: ${new Date(form.createdAt || Date.now()).toLocaleDateString('sq-AL')}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Të dhënat e klientit</div>
        <div class="grid">
          <div class="field"><div class="label">Emri dhe mbiemri</div><div class="value">${form.clientName || "—"}</div></div>
          <div class="field"><div class="label">Telefoni</div><div class="value">${form.clientPhone || "—"}</div></div>
          <div class="field" style="grid-column: 1 / -1;"><div class="label">Adresa</div><div class="value">${form.clientAddress || "—"}</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Të dhënat e produktit</div>
        <div class="grid">
          <div class="field" style="grid-column: 1 / -1;"><div class="label">Emri i produktit</div><div class="value">${form.productName || "—"}</div></div>
          <div class="field"><div class="label">Marka</div><div class="value">${form.brand || "—"}</div></div>
          <div class="field"><div class="label">Modeli</div><div class="value">${form.model || "—"}</div></div>
          <div class="field"><div class="label">Nr. Serik (S/N)</div><div class="value">${form.serialNo || "—"}</div></div>
          <div class="field"><div class="label">IMEI</div><div class="value">${form.imei || "—"}</div></div>
          <div class="field"><div class="label">Gjendja</div><div class="value">${form.condition === 'new' ? 'I ri (New)' : 'I përdorur (Used)'}</div></div>
          <div class="field"><div class="label">Aksesorët</div><div class="value">${form.accessories || "—"}</div></div>
        </div>
      </div>

      <div class="period-banner">
        <div class="months">${form.periodMonths} MUAJ</div>
        <div class="label">PERIUDHA E GARANCIONIT</div>
        <div style="margin-top:10px; font-size:12px; opacity:.95">
          ${new Date(form.startDate).toLocaleDateString('sq-AL')} &nbsp;→&nbsp; ${new Date(form.endDate).toLocaleDateString('sq-AL')}
        </div>
      </div>

      ${form.notes ? `<div class="section"><div class="section-title">Shënime</div><div style="font-size:12px;color:#334155">${form.notes}</div></div>` : ''}

      <div class="terms">
        <b>Kushtet e garancionit:</b> Garancioni mbulon defektet në material dhe punim nën përdorim normal.
        Nuk mbulohen: dëmtime fizike, dëmtime nga lagështia, përdorim i gabuar, riparime nga persona të paautorizuar,
        apo ndryshime softverike. Klienti duhet të prezantojë këtë certifikatë dhe provën e blerjes për çdo kërkesë garancioni.
      </div>

      <div class="signatures">
        <div class="sig">SHITËSI<br><span style="font-size:10px;font-weight:normal">(Vula & Nënshkrimi)</span></div>
        <div class="sig">KLIENTI<br><span style="font-size:10px;font-weight:normal">(Nënshkrimi)</span></div>
      </div>

      <div class="footer">Ky dokument është gjeneruar elektronikisht nga sistemi ProPhone.</div>
    </div>
    <script>window.onload=()=>{setTimeout(()=>window.print(),200);}</script>
    </body></html>`;
}
function printWarrantyA4(form, business) {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;
  w.document.write(buildWarrantyA4Html(form, business));
  w.document.close();
}

function WarrantyDialog({ T, business, warranty, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState(warranty || {
    certNo: "GAR-" + new Date().toISOString().slice(0, 10).replace(/-/g, ""),
    clientName: "", clientPhone: "", clientAddress: "",
    productName: "", brand: "", model: "", serialNo: "", imei: "",
    condition: "new", periodMonths: 12,
    startDate: today, endDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    accessories: "", notes: "",
  });
  const upd = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (k === "startDate" || k === "periodMonths") {
      const sd = new Date(k === "startDate" ? v : next.startDate);
      const m = Number(k === "periodMonths" ? v : next.periodMonths) || 12;
      const ed = new Date(sd.getFullYear(), sd.getMonth() + m, sd.getDate());
      next.endDate = ed.toISOString().slice(0, 10);
    }
    return next;
  });

  const print = () => printWarrantyA4(form, business);

  const saveAndPrint = (alsoPrint) => {
    if (!form.clientName.trim() || !form.productName.trim()) {
      alert("Emri i klientit dhe emri i produktit janë të detyrueshme.");
      return;
    }
    const record = {
      ...form,
      id: warranty?.id || ("warr_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6)),
      createdAt: warranty?.createdAt || new Date().toISOString(),
    };
    onSave(record);
    if (alsoPrint) print();
    onClose();
  };

  const F = (label, k, extra = {}) => (
    <FormField T={T} label={label} value={form[k]} onChange={e => upd(k, e.target.value)} {...extra} />
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, width: "100%", maxWidth: 760, maxHeight: "92vh", overflow: "auto", border: `1px solid ${T.border}`, boxShadow: "0 30px 90px rgba(0,0,0,.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.surface, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.accent}15`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIc.shield(18)}</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.text }}>Certifikatë Garancioni</h3>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Dokument zyrtar — Format A4</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIc.close(14)}</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {F("Nr. Certifikate", "certNo")}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>Gjendja</label>
              <select value={form.condition} onChange={e => upd("condition", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.inputBg, color: T.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}>
                <option value="new">I ri (New)</option>
                <option value="used">I përdorur (Used)</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 8 }}>Klienti</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {F("Emri dhe mbiemri *", "clientName", { placeholder: "p.sh. Arben Krasniqi" })}
            {F("Telefoni", "clientPhone", { placeholder: "+383 ..." })}
            {F("Adresa / Qyteti", "clientAddress", { span: 2, placeholder: "rr. ..." })}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Produkti</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {F("Emri i produktit *", "productName", { span: 2, placeholder: "p.sh. iPhone 14 Pro" })}
            {F("Marka", "brand", { placeholder: "Apple, Samsung..." })}
            {F("Modeli", "model", { placeholder: "A2890..." })}
            {F("Nr. Serik (S/N)", "serialNo")}
            {F("IMEI", "imei")}
            {F("Aksesorët", "accessories", { span: 2, placeholder: "Karikues, kufje, kuti..." })}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Periudha e Garancionit</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>Periudha (muaj)</label>
              <select value={form.periodMonths} onChange={e => upd("periodMonths", Number(e.target.value))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.inputBg, color: T.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}>
                {[3, 6, 12, 24, 36].map(m => <option key={m} value={m}>{m} muaj</option>)}
              </select>
            </div>
            {F("Nga data", "startDate", { type: "date" })}
            {F("Deri më", "endDate", { type: "date" })}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>Shënime shtesë</label>
            <textarea value={form.notes} onChange={e => upd("notes", e.target.value)} rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.inputBg, color: T.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "14px 24px", borderTop: `1px solid ${T.border}`, background: T.surfaceAlt, position: "sticky", bottom: 0 }}>
          <button onClick={onClose} style={{ background: "transparent", border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13, color: T.textMuted, fontFamily: "inherit" }}>Anulo</button>
          <button onClick={print} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: T.text, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            {PIc.printer(14)} Printo
          </button>
          <button onClick={() => saveAndPrint(false)} style={{ background: T.surface, border: `1.5px solid ${T.accent}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: T.accent, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            {PIc.save(14)} Ruaj
          </button>
          <button onClick={() => saveAndPrint(true)} style={{ background: T.accentGrad, border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            {PIc.printer(14)} Ruaj & Printo
          </button>
        </div>
      </div>
    </div>
  );
}

function WarrantyList({ T, business, warranties, onClose, onDelete }) {
  const [search, setSearch] = useState("");
  const filtered = warranties.filter(w =>
    !search || (w.clientName || "").toLowerCase().includes(search.toLowerCase()) ||
    (w.productName || "").toLowerCase().includes(search.toLowerCase()) ||
    (w.certNo || "").toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, width: "100%", maxWidth: 860, maxHeight: "88vh", display: "flex", flexDirection: "column", border: `1px solid ${T.border}`, boxShadow: "0 30px 90px rgba(0,0,0,.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.accent}15`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIc.shieldList(18)}</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.text }}>Garancionet e lëshuara</h3>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{warranties.length} certifikata gjithsej</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIc.close(14)}</button>
        </div>
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textFaint }}>{PIc.search(14)}</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko sipas klientit, produktit ose nr. certifikatës..."
              style={{ width: "100%", padding: "10px 14px 10px 34px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.inputBg, color: T.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px 24px 24px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: T.textFaint, fontSize: 13 }}>
              <div style={{ marginBottom: 10, color: T.textMuted, display: "flex", justifyContent: "center" }}>{PIc.shieldList(40)}</div>
              Nuk ka garancione të ruajtur ende.
            </div>
          ) : filtered.map(w => {
            const isExpired = w.endDate && new Date(w.endDate) < new Date();
            return (
              <div key={w.id} style={{ background: T.surfaceAlt, borderRadius: 10, padding: "14px 16px", marginTop: 8, border: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{w.productName}</span>
                    <span style={{ fontSize: 11, background: isExpired ? "#FEE2E2" : "#D1FAE5", color: isExpired ? "#EF4444" : "#059669", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>
                      {isExpired ? "Skaduar" : `${w.periodMonths} muaj`}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>
                    <b style={{ color: T.text }}>{w.clientName}</b> · {w.certNo} · Skadon: {w.endDate ? new Date(w.endDate).toLocaleDateString('sq-AL') : "—"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => printWarrantyA4(w, business)} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.accent, display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                    {PIc.printer(12)} Printo
                  </button>
                  <button onClick={() => { if (window.confirm("Fshi këtë garancion?")) onDelete(w.id); }} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: T.danger, fontFamily: "inherit" }}>
                    {PIc.trashLine(12)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ClientDialog({ T, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: "", address: "", phone: "", nui: "", nf: "" });
  const setK = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, width: "100%", maxWidth: 460, border: `1px solid ${T.border}`, boxShadow: "0 30px 90px rgba(0,0,0,.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${T.accent}15`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIc.user(16)}</div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.text }}>Të dhënat e blerësit</h3>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIc.close(13)}</button>
        </div>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ marginBottom: 12 }}><FormField T={T} label="Emri i blerësit / Kompanisë" value={form.name} onChange={e => setK("name", e.target.value)} placeholder="Emri i plotë ose emri i kompanisë" /></div>
          <div style={{ marginBottom: 12 }}><FormField T={T} label="Adresa" value={form.address} onChange={e => setK("address", e.target.value)} placeholder="Adresa e blerësit" /></div>
          <div style={{ marginBottom: 12 }}><FormField T={T} label="Telefoni" value={form.phone} onChange={e => setK("phone", e.target.value)} placeholder="+383 XX XXX XXX" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField T={T} label="NUI" value={form.nui} onChange={e => setK("nui", e.target.value)} placeholder="Numri Unik" />
            <FormField T={T} label="NF" value={form.nf} onChange={e => setK("nf", e.target.value)} placeholder="Numri Fiskal" />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 20px", borderTop: `1px solid ${T.border}`, background: T.surfaceAlt }}>
          <button onClick={onClose} style={{ background: "transparent", border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, color: T.textMuted, fontFamily: "inherit" }}>Anulo</button>
          <button onClick={() => { onSave(form); onClose(); }} style={{ background: T.accentGrad, border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            {PIc.check(13)} Vazhdo
          </button>
        </div>
      </div>
    </div>
  );
}

function POSView({ T, business, products, onSale, sales, warranties, onAddWarranty, onRemoveWarranty, onAddDebt, onBack, onCloseArka }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [payOpen, setPayOpen] = useState(false);
  const [warrantyOpen, setWarrantyOpen] = useState(false);
  const [warrantyListOpen, setWarrantyListOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [a4Open, setA4Open] = useState(false);
  const [client, setClient] = useState(null);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  const filtered = search ? products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode || "").includes(search)
  ).slice(0, 8) : [];

  const addToCart = (p) => {
    setCart(c => {
      const existing = c.find(x => x.id === p.id);
      if (existing) return c.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { id: p.id, name: p.name, price: p.price, qty: 1, discount: 0, vat: 0, image: p.image || null }];
    });
    setSearch("");
  };
  const updateQty = (id, qty) => setCart(c => c.map(x => x.id === id ? { ...x, qty: Math.max(1, qty) } : x));
  const removeItem = (id) => setCart(c => c.filter(x => x.id !== id));
  const removeSelected = () => {
    if (selectedIdx >= 0 && selectedIdx < cart.length) {
      removeItem(cart[selectedIdx].id);
      setSelectedIdx(-1);
    }
  };

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const totalDiscount = cart.reduce((s, x) => s + (x.discount || 0) * x.qty, 0);
  const totalVat = cart.reduce((s, x) => s + (x.vat || 0) * x.qty, 0);
  const grandTotal = subtotal - totalDiscount + totalVat;

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (payOpen || warrantyOpen || warrantyListOpen || clientOpen || a4Open || lastReceipt) return;
      if (e.key === 'F2') { e.preventDefault(); if (cart.length) setPayOpen(true); }
      else if (e.key === 'F4') { e.preventDefault(); if (cart.length) setA4Open(true); }
      else if (e.key === 'F7') { e.preventDefault(); setWarrantyOpen(true); }
      else if (e.key === 'F8') { e.preventDefault(); /* Dokumentin - placeholder for document picker */ }
      else if (e.key === 'F12') { e.preventDefault(); document.getElementById('pos-search')?.focus(); }
      else if (e.key === 'Delete') { e.preventDefault(); removeSelected(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [payOpen, warrantyOpen, warrantyListOpen, clientOpen, a4Open, lastReceipt, selectedIdx, cart]);

  const completeSale = ({ paid, method, clientName, clientPhone, printReceipt, isCredit, remaining }) => {
    const saleId = "sale_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const sale = {
      id: saleId,
      receiptNo: "RCP-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + String(sales.length + 1).padStart(4, '0'),
      total: grandTotal,
      paid,
      change: isCredit ? 0 : Math.max(0, paid - grandTotal),
      paymentMethod: method,
      clientName: clientName || client?.name || "",
      isCredit: !!isCredit,
      items: cart.map(x => ({ id: x.id, name: x.name, price: x.price, qty: x.qty, total: x.price * x.qty })),
      createdAt: new Date().toISOString(),
    };
    onSale(sale);
    if (isCredit && remaining > 0 && onAddDebt) {
      const debt = {
        id: "debt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        clientName: clientName || client?.name || "Klient i panjohur",
        clientPhone: clientPhone || client?.phone || "",
        originalAmount: grandTotal,
        paidAmount: paid,
        remainingAmount: remaining,
        saleId,
        items: sale.items,
        notes: "",
        isSettled: false,
        createdAt: new Date().toISOString(),
      };
      onAddDebt(debt);
    }
    setLastReceipt({ ...sale, autoPrint: printReceipt });
    setCart([]);
    setPayOpen(false);
    setClient(null);
    if (printReceipt) setTimeout(() => printThermal(sale), 200);
  };

  const printThermal = (sale) => {
    const w = window.open("", "_blank", "width=420,height=800");
    if (!w) return;
    const biz = business || {};
    const dt = new Date(sale.createdAt);
    const dateStr = dt.toLocaleDateString('sq-AL');
    const timeStr = dt.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });
    const cashier = sale.cashierName || biz.cashierName || "Administrator";
    const pad = (s, n, align = "l") => {
      s = String(s);
      if (s.length >= n) return s.slice(0, n);
      return align === "r" ? s.padStart(n) : s.padEnd(n);
    };
    const itemRows = sale.items.map(i => {
      const line1 = i.name;
      const line2 = `${pad(i.qty, 4, "r")} ${pad("€" + i.price.toFixed(2), 9, "r")} ${pad("€" + i.total.toFixed(2), 9, "r")}`;
      return `<div class="item-row"><div class="item-name">${line1}</div><div class="item-meta">${line2}</div></div>`;
    }).join("");
    const itemRowsShort = sale.items.map(i => `<div class="item-short"><span>${i.name} ×${i.qty}</span><span>€${i.total.toFixed(2)}</span></div>`).join("");
    w.document.write(`<html><head><title>Kupon ${sale.receiptNo}</title>
      <style>
        @page { size: 80mm 210mm; margin: 0; }
        html, body { width: 80mm; height: 210mm; }
        body { font-family: 'Courier New', ui-monospace, monospace; padding: 6mm 5mm; font-size: 11px; box-sizing: border-box; margin: 0; color: #000; line-height: 1.4; }
        .c { text-align: center; }
        .r { text-align: right; }
        .b { font-weight: 800; }
        .biz-name { font-size: 16px; letter-spacing: 0.5px; }
        .sep { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
        .title-box { border: 1.5px solid #000; padding: 3px 10px; display: inline-block; margin: 4px 0; font-weight: 800; letter-spacing: 1px; }
        .kv { display: flex; justify-content: space-between; }
        .tbl-head { display: flex; justify-content: space-between; font-weight: 800; border-bottom: 1px solid #000; padding-bottom: 2px; margin-top: 2px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        .tbl-head span:nth-child(1) { flex: 1; }
        .tbl-head span:nth-child(2) { width: 36px; text-align: right; }
        .tbl-head span:nth-child(3) { width: 60px; text-align: right; }
        .tbl-head span:nth-child(4) { width: 60px; text-align: right; }
        .item-row { margin-top: 3px; }
        .item-name { font-weight: 700; }
        .item-meta { text-align: right; font-size: 11px; color: #000; }
        .totals-row { display: flex; justify-content: space-between; padding: 2px 0; }
        .grand { display: flex; justify-content: space-between; padding: 6px 0; border-top: 2px solid #000; border-bottom: 2px solid #000; margin-top: 4px; font-size: 15px; font-weight: 800; }
        .foot-thanks { font-size: 13px; font-weight: 800; margin-top: 6px; }
        .foot-sub { font-size: 11px; }
        .cut { text-align: center; font-size: 10px; margin: 12px 0 8px; letter-spacing: 2px; color: #000; }
        .cut-box { background: #000; color: #fff; padding: 2px 10px; display: inline-block; font-weight: 700; letter-spacing: 2px; font-size: 9px; }
        .store-copy { border: 1.5px solid #000; padding: 8px 10px; margin-top: 8px; }
        .store-copy-title { text-align: center; font-weight: 800; letter-spacing: 1px; border-bottom: 1px dashed #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 11px; }
        .item-short { display: flex; justify-content: space-between; font-size: 11px; padding: 1px 0; }
        .credit-banner { background: #000; color: #fff; text-align: center; font-weight: 800; padding: 4px; margin: 6px 0; letter-spacing: 1px; font-size: 11px; }
      </style></head><body>
      <div class="c b biz-name">${biz.name || "Biznesi"}</div>
      ${biz.address ? `<div class="c">${biz.address}</div>` : ""}
      ${biz.city ? `<div class="c">${biz.city}</div>` : ""}
      ${biz.phone ? `<div class="c">Tel: ${biz.phone}</div>` : ""}
      ${biz.nui ? `<div class="c">NUI: ${biz.nui}</div>` : ""}
      <hr class="sep">
      <div class="c"><span class="title-box">KUPON SHITJE</span></div>
      <div class="kv"><span>Nr:</span><span class="b">${sale.receiptNo}</span></div>
      <div class="kv"><span>Data:</span><span>${dateStr}</span></div>
      <div class="kv"><span>Ora:</span><span>${timeStr}</span></div>
      <div class="kv"><span>Arkëtar:</span><span>${cashier}</span></div>
      ${sale.clientName ? `<div class="kv"><span>Klient:</span><span>${sale.clientName}</span></div>` : ""}
      <hr class="sep">
      <div class="tbl-head"><span>Artikulli</span><span>Sas</span><span>Çmimi</span><span>Vlera</span></div>
      ${itemRows}
      <hr class="sep">
      ${sale.isCredit ? `<div class="credit-banner">★ SHITJE ME BORXH ★</div>` : ""}
      <div class="totals-row"><span>Nëntotali:</span><span>${sale.total.toFixed(2)} EUR</span></div>
      <div class="grand"><span>TOTALI:</span><span>${sale.total.toFixed(2)} EUR</span></div>
      <div class="totals-row"><span>Mënyra:</span><span class="b">${sale.paymentMethod === "bank" ? "BANK" : "CASH"}</span></div>
      <div class="totals-row"><span>Paguar:</span><span>${sale.paid.toFixed(2)} EUR</span></div>
      ${sale.isCredit ? `<div class="totals-row"><span>Borxh:</span><span class="b">${(sale.total - sale.paid).toFixed(2)} EUR</span></div>` : ""}
      <div class="totals-row"><span>Kusuri:</span><span>${sale.change.toFixed(2)} EUR</span></div>
      <hr class="sep">
      <div class="c foot-thanks">FALEMINDERIT!</div>
      <div class="c foot-sub">Ju mirëpresim përsëri!</div>
      <hr class="sep">
      <div class="c" style="font-size:10px;color:#333">${biz.name || "Biznesi"} · ${dateStr}, ${timeStr}</div>
      <div class="cut">╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌</div>
      <div class="c"><span class="cut-box">✂ SHKYÇ KËTU ✂</span></div>
      <div class="cut">╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌</div>
      <div class="store-copy">
        <div class="store-copy-title">KOPJE ARKËTAR</div>
        <div style="font-size:11px"><b>Nr:</b> ${sale.receiptNo} | ${dateStr} ${timeStr}</div>
        ${itemRowsShort}
        <div class="kv" style="margin-top:4px; border-top:1px dashed #000; padding-top:4px;"><b>TOTAL:</b><b>${sale.total.toFixed(2)} EUR</b></div>
        ${sale.isCredit ? `<div class="kv" style="color:#000"><b>BORXH:</b><b>${(sale.total - sale.paid).toFixed(2)} EUR</b></div>` : ""}
      </div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),180);}</script>
      </body></html>`);
    w.document.close();
  };

  const printA4Invoice = () => {
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;
    const biz = business || {};
    const nowDt = new Date();
    const pad2 = n => String(n).padStart(2, '0');
    const invoiceNo = "INV-" + nowDt.getFullYear() + pad2(nowDt.getMonth() + 1) + pad2(nowDt.getDate()) + "-" + pad2(nowDt.getHours()) + pad2(nowDt.getMinutes()) + pad2(nowDt.getSeconds());
    w.document.write(`<html><head><title>${invoiceNo}</title>
      <style>
        @page { size: A4; margin: 18mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; }
        .container { max-width: 800px; margin: 0 auto; padding: 10px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0EA5E9; padding-bottom: 16px; margin-bottom: 24px; }
        .logo-wrap { display: flex; align-items: center; gap: 12px; }
        .logo-wrap img { width: 50px; height: 50px; object-fit: contain; }
        .biz-name { font-size: 22px; font-weight: 800; color: #0EA5E9; margin: 0; }
        .biz-sub { font-size: 11px; color: #64748b; margin-top: 2px; line-height: 1.4; }
        .title-box { text-align: right; }
        .title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: 1px; }
        .inv-no { font-size: 11px; color: #64748b; margin-top: 4px; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 22px; }
        .party-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
        .party-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 6px; }
        .party-name { font-size: 14px; font-weight: 700; color: #0f172a; }
        .party-info { font-size: 11px; color: #475569; line-height: 1.5; margin-top: 4px; }
        table.items { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        table.items th { background: #0f172a; color: #fff; padding: 10px 12px; font-size: 11px; text-align: left; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        table.items th.r, table.items td.r { text-align: right; }
        table.items td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
        .totals { display: flex; justify-content: flex-end; margin-bottom: 22px; }
        .totals-box { min-width: 240px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 12px; font-size: 12px; }
        .totals-row.grand { background: #0f172a; color: #fff; border-radius: 8px; padding: 12px; font-weight: 800; font-size: 15px; margin-top: 4px; }
        .payment-info { background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 8px; padding: 12px 14px; margin-bottom: 22px; font-size: 12px; display: flex; justify-content: space-between; }
        .payment-info b { color: #0EA5E9; }
        .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 10.5px; color: #64748b; }
        .footer .ty { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
      </style></head><body>
      <div class="container">
        <div class="header">
          <div class="logo-wrap">
            ${biz.logo ? `<img src="${biz.logo}" alt="logo">` : ''}
            <div>
              <div class="biz-name">${biz.name || "Biznesi"}</div>
              <div class="biz-sub">
                ${biz.address || ""} ${biz.city || ""}<br>
                Tel: ${biz.phone || ""} ${biz.email ? "· " + biz.email : ""}
              </div>
            </div>
          </div>
          <div class="title-box">
            <div class="title">FATURË</div>
            <div class="inv-no">Nr. Faturës: <b>${invoiceNo}</b></div>
            <div class="inv-no">Data: ${new Date().toLocaleString('sq-AL')}</div>
          </div>
        </div>

        <div class="parties">
          <div class="party-box">
            <div class="party-title">Shitësi</div>
            <div class="party-name">${biz.name || "—"}</div>
            <div class="party-info">
              ${biz.address || ""}<br>
              ${biz.city || ""}
              ${biz.nui ? "<br>NUI: " + biz.nui : ""}
              ${biz.nf ? "<br>NF: " + biz.nf : ""}
            </div>
          </div>
          <div class="party-box">
            <div class="party-title">Blerësi</div>
            <div class="party-name">${client?.name || "Konsumator final"}</div>
            <div class="party-info">
              ${client?.address || ""}
              ${client?.phone ? "<br>Tel: " + client.phone : ""}
              ${client?.nui ? "<br>NUI: " + client.nui : ""}
              ${client?.nf ? "<br>NF: " + client.nf : ""}
            </div>
          </div>
        </div>

        <table class="items">
          <thead><tr>
            <th style="width:40px">Nr.</th><th>Përshkrimi</th>
            <th class="r" style="width:70px">Sasia</th>
            <th class="r" style="width:90px">Çmimi</th>
            <th class="r" style="width:80px">Zbritja</th>
            <th class="r" style="width:70px">TVSH</th>
            <th class="r" style="width:90px">Totali</th>
          </tr></thead>
          <tbody>
            ${cart.map((x, i) => `<tr>
              <td>${i+1}</td>
              <td>${x.name}</td>
              <td class="r">${x.qty}</td>
              <td class="r">€${x.price.toFixed(2)}</td>
              <td class="r">0%</td>
              <td class="r">0%</td>
              <td class="r"><b>€${(x.price * x.qty).toFixed(2)}</b></td>
            </tr>`).join("")}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-box">
            <div class="totals-row"><span>Nëntotali:</span><b>€${subtotal.toFixed(2)}</b></div>
            <div class="totals-row"><span>Zbritja:</span><b style="color:#ef4444">-€${totalDiscount.toFixed(2)}</b></div>
            <div class="totals-row"><span>TVSH:</span><b>€${totalVat.toFixed(2)}</b></div>
            <div class="totals-row grand"><span>TOTALI:</span><span>€${grandTotal.toFixed(2)}</span></div>
          </div>
        </div>

        <div class="payment-info">
          <span>Metoda e pagesës: <b>Cash</b></span>
          <span>Paguar: <b>€0.00</b></span>
          <span>Kusuri: <b>€0.00</b></span>
        </div>

        <div class="footer">
          <div class="ty">Faleminderit për blerjen tuaj!</div>
          Për çdo pyetje kontaktoni: ${biz.phone || biz.email || ""}<br>
          <span style="font-style:italic;color:#94a3b8">Kjo faturë është gjeneruar automatikisht nga sistemi ProPhone.</span>
        </div>
      </div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),200);}</script>
      </body></html>`);
    w.document.close();
  };

  const printThermalNote = () => {
    if (cart.length === 0) return;
    const w = window.open("", "_blank", "width=420,height=700");
    if (!w) return;
    const biz = business || {};
    w.document.write(`<html><head><title>Notë</title>
      <style>body{font-family:ui-monospace,monospace;padding:12px;font-size:12px;max-width:320px;margin:0 auto;color:#000}.c{text-align:center}.r{text-align:right}.b{font-weight:700}hr{border:0;border-top:1px dashed #000;margin:8px 0}table{width:100%;border-collapse:collapse}td{padding:2px 0}</style></head><body>
      <div class="c b">${biz.name || "Biznesi"}</div>
      <hr><div class="c b">NOTË (JO FATURË)</div>
      <div>Data: ${new Date().toLocaleString('sq-AL')}</div><hr>
      <table><tr class="b"><td>Artikull</td><td class="r">Sasi</td><td class="r">Total</td></tr>
      ${cart.map(i => `<tr><td>${i.name}</td><td class="r">${i.qty}</td><td class="r">€${(i.price * i.qty).toFixed(2)}</td></tr>`).join("")}
      </table><hr><div class="r b">Total: €${grandTotal.toFixed(2)}</div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),150);}</script></body></html>`);
    w.document.close();
  };

  const todaySales = sales.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString());
  const todayTotal = todaySales.reduce((s, x) => s + x.total, 0);

  // Action button with SVG icon
  const ActionBtn = ({ icon, label, shortcut, onClick, variant, disabled }) => {
    const isPrimary = variant === "primary";
    const isDanger = variant === "danger";
    const isAccent = variant === "accent";
    return (
      <button onClick={onClick} disabled={disabled}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 12px", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
          fontSize: 12.5, fontWeight: 600, textAlign: "left", width: "100%",
          background: isPrimary ? T.accentGrad : isAccent ? `${T.accent}10` : T.surface,
          color: isPrimary ? "#fff" : isDanger ? T.danger : isAccent ? T.accent : T.text,
          border: isPrimary ? "none" : isDanger ? `1.5px solid ${T.danger}55` : isAccent ? `1.5px solid ${T.accent}50` : `1px solid ${T.border}`,
          opacity: disabled ? 0.45 : 1,
          fontFamily: "inherit",
          transition: "all .15s",
          minHeight: 40,
        }}
        onMouseEnter={e => { if (!disabled && !isPrimary) { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = isDanger ? `${T.danger}08` : isAccent ? `${T.accent}18` : T.surfaceAlt; } }}
        onMouseLeave={e => { if (!disabled && !isPrimary) { e.currentTarget.style.borderColor = isDanger ? `${T.danger}55` : isAccent ? `${T.accent}50` : T.border; e.currentTarget.style.background = isAccent ? `${T.accent}10` : T.surface; } }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: isPrimary ? "#fff" : isDanger ? T.danger : isAccent ? T.accent : T.textMuted, display: "flex" }}>{icon}</span>
          <span>{label}</span>
        </span>
        {shortcut && <span style={{ fontSize: 10, fontWeight: 700, background: isPrimary ? "rgba(255,255,255,.22)" : T.surfaceAlt, padding: "2px 7px", borderRadius: 5, color: isPrimary ? "#fff" : T.textFaint, letterSpacing: 0.5, fontFamily: "ui-monospace, monospace" }}>{shortcut}</span>}
      </button>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 90px)", marginTop: -24, marginLeft: -24, marginRight: -24, background: T.bg }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", background: T.surface, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: T.textMuted, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            {PIc.back(13)} Kthehu
          </button>
          {business?.logo && <img src={business.logo} alt="" style={{ width: 30, height: 30, objectFit: "contain", borderRadius: 6 }} />}
          <div style={{ fontWeight: 800, fontSize: 17, color: T.accent }}>{business?.name || "Biznesi"}</div>
          <span style={{ color: T.border }}>│</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Arka</span>
          <span style={{ background: "#D1FAE5", color: "#059669", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, marginLeft: 2 }}>E HAPUR</span>
          {client && (
            <>
              <span style={{ color: T.border }}>│</span>
              <span style={{ fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 6 }}>{PIc.user(12)} <b style={{ color: T.text }}>{client.name}</b></span>
              <button onClick={() => setClient(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textFaint, padding: 0 }}>{PIc.close(12)}</button>
            </>
          )}
        </div>
        <div style={{ fontSize: 11.5, color: T.textMuted, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{PIc.cash(13)} Sot: <b style={{ color: "#10B981" }}>€{todayTotal.toFixed(2)}</b> ({todaySales.length})</span>
          <span style={{ color: T.border }}>│</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{PIc.clock(12)} {now.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })} · {now.toLocaleDateString('sq-AL', { day: '2-digit', month: '2-digit' })}</span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 230px", flex: 1, overflow: "hidden" }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", padding: "14px 16px", overflow: "hidden" }}>
          <div style={{ position: "relative", marginBottom: 12, flexShrink: 0 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textFaint }}>{PIc.search(15)}</span>
            <input id="pos-search" autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Kërko produkt ose skano barkod..."
              onKeyDown={e => { if (e.key === 'Enter' && filtered.length > 0) addToCart(filtered[0]); }}
              style={{ width: "100%", padding: "11px 16px 11px 40px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, background: T.inputBg, color: T.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            {search && filtered.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 10, boxShadow: "0 12px 32px rgba(0,0,0,.12)", zIndex: 10, maxHeight: 320, overflow: "auto" }}>
                {filtered.map((p, i) => (
                  <div key={p.id} onClick={() => addToCart(p)}
                    style={{ padding: "10px 16px", cursor: "pointer", fontSize: 13, color: T.text, borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      {p.barcode && <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>{p.barcode}</div>}
                    </div>
                    <span style={{ color: T.accent, fontWeight: 700 }}>€{Number(p.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "50px 2.5fr 110px 90px 80px 80px 100px 100px", padding: "10px 14px", background: T.surfaceAlt, fontSize: 10.5, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, position: "sticky", top: 0, borderBottom: `1px solid ${T.border}`, zIndex: 1 }}>
              <div>Nr</div><div>Emërtimi</div><div>Sasia</div><div>Çmimi</div><div>Zbritja %</div><div>TVSH %</div><div style={{ textAlign: "right" }}>Çmimi me TVSH</div><div style={{ textAlign: "right" }}>Totali</div>
            </div>
            {cart.length === 0 ? (
              <div style={{ padding: "80px 20px", textAlign: "center", color: T.textFaint, fontSize: 13 }}>
                <div style={{ marginBottom: 12, opacity: .25, display: "flex", justifyContent: "center" }}>{PIc.receipt(52)}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: T.textMuted }}>Shporta është e zbrazët</div>
                <div style={{ marginTop: 4 }}>Kërkoni nga emri ose skanoni barkodin e produktit</div>
              </div>
            ) : cart.map((x, idx) => (
              <div key={x.id} onClick={() => setSelectedIdx(idx)}
                style={{ display: "grid", gridTemplateColumns: "50px 2.5fr 110px 90px 80px 80px 100px 100px", padding: "10px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.border}`, alignItems: "center", cursor: "pointer", background: selectedIdx === idx ? `${T.accent}12` : "transparent", transition: "background .1s" }}>
                <div style={{ color: T.textMuted, fontWeight: 600 }}>{idx + 1}</div>
                <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
                  {x.image && <img src={x.image} alt="" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6, border: `1px solid ${T.border}`, flexShrink: 0 }} />}
                  <span>{x.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => updateQty(x.id, x.qty - 1)} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 5, width: 24, height: 24, cursor: "pointer", color: T.text, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIc.minus(12)}</button>
                  <input type="number" value={x.qty} onChange={e => updateQty(x.id, parseInt(e.target.value) || 1)}
                    style={{ width: 40, textAlign: "center", padding: "3px 4px", border: `1px solid ${T.border}`, borderRadius: 5, background: T.inputBg, color: T.text, fontSize: 12, fontWeight: 700, outline: "none", fontFamily: "inherit" }} />
                  <button onClick={() => updateQty(x.id, x.qty + 1)} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 5, width: 24, height: 24, cursor: "pointer", color: T.text, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIc.plus(12)}</button>
                </div>
                <div>€{x.price.toFixed(2)}</div>
                <div style={{ color: T.textMuted }}>0%</div>
                <div style={{ color: T.textMuted }}>0%</div>
                <div style={{ textAlign: "right" }}>€{x.price.toFixed(2)}</div>
                <div style={{ textAlign: "right", fontWeight: 700, color: T.accent }}>€{(x.price * x.qty).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 4px 4px", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 28, fontSize: 12.5, color: T.textMuted }}>
              <span>Subtotal: <b style={{ color: T.text }}>€{subtotal.toFixed(2)}</b></span>
              <span>Zbritja: <b style={{ color: T.danger }}>-€{totalDiscount.toFixed(2)}</b></span>
              <span>TVSH: <b style={{ color: T.text }}>€{totalVat.toFixed(2)}</b></span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 11, color: T.textFaint, textTransform: "uppercase", letterSpacing: 1 }}>Total</span>
              <span style={{ fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: -0.5 }}>€{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ background: T.surface, borderLeft: `1px solid ${T.border}`, padding: 10, display: "flex", flexDirection: "column", gap: 6, overflow: "auto" }}>
          <ActionBtn icon={PIc.document(14)} label="Dokumentin" shortcut="F8" onClick={() => { /* not yet */ }} />
          <ActionBtn icon={PIc.search(14)} label="Kërko artikullin" shortcut="F12" onClick={() => document.getElementById('pos-search')?.focus()} />
          <ActionBtn icon={PIc.note(14)} label="Shtyp Noten" onClick={printThermalNote} disabled={cart.length === 0} />
          <ActionBtn icon={PIc.shield(14)} label="Garancioni" shortcut="F7" variant="accent" onClick={() => setWarrantyOpen(true)} />
          <ActionBtn icon={PIc.shieldList(14)} label="Garancione" variant="accent" onClick={() => setWarrantyListOpen(true)} />
          <ActionBtn icon={PIc.trashLine(14)} label="Fshij artikullin" shortcut="Del" onClick={removeSelected} disabled={selectedIdx < 0} />
          <ActionBtn icon={PIc.user(14)} label="Konsumatori" onClick={() => setClientOpen(true)} />
          <ActionBtn icon={PIc.settings(14)} label="Parametrat" onClick={() => { /* settings placeholder */ }} />
          <ActionBtn icon={PIc.printer(14)} label="Printo A4" shortcut="F4" onClick={() => setA4Open(true)} disabled={cart.length === 0} />
          <ActionBtn icon={PIc.receipt(14)} label="Shtyp" shortcut="F2" variant="primary" onClick={() => setPayOpen(true)} disabled={cart.length === 0} />
          <ActionBtn icon={PIc.lock(14)} label="Mbyll Arkën" onClick={onCloseArka} />
          <ActionBtn icon={PIc.xCircle(14)} label="Pastro" variant="danger" onClick={() => { setCart([]); setClient(null); }} disabled={cart.length === 0 && !client} />
        </div>
      </div>

      {payOpen && <NumericKeypad T={T} total={grandTotal} onComplete={completeSale} onCancel={() => setPayOpen(false)} />}
      {warrantyOpen && <WarrantyDialog T={T} business={business} onSave={onAddWarranty} onClose={() => setWarrantyOpen(false)} />}
      {warrantyListOpen && <WarrantyList T={T} business={business} warranties={warranties}
        onClose={() => setWarrantyListOpen(false)}
        onDelete={(id) => onRemoveWarranty && onRemoveWarranty(id)} />}
      {clientOpen && <ClientDialog T={T} initial={client} onSave={setClient} onClose={() => setClientOpen(false)} />}

      {a4Open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setA4Open(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, width: "100%", maxWidth: 480, border: `1px solid ${T.border}`, boxShadow: "0 30px 90px rgba(0,0,0,.35)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${T.accent}15`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIc.printer(16)}</div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.text }}>Printo Faturë A4</h3>
              </div>
              <button onClick={() => setA4Open(false)} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIc.close(13)}</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ background: T.surfaceAlt, borderRadius: 10, padding: 14, fontSize: 12, color: T.textMuted, marginBottom: 14, lineHeight: 1.6 }}>
                Faturë A4 do të gjenerohet me të dhënat aktuale të shportës{client ? ` dhe të blerësit <b style="color:${T.text}">${client.name}</b>` : ", pa të dhëna blerësi"}. Në dialogun e printimit mund të zgjidhni printerin dhe madhësinë e letrës (A4).
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 14 }}>
                <span style={{ color: T.textMuted }}>Artikuj:</span>
                <b style={{ color: T.text }}>{cart.length}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 20 }}>
                <span style={{ color: T.textMuted }}>Totali:</span>
                <b style={{ color: T.accent, fontSize: 16 }}>€{grandTotal.toFixed(2)}</b>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setA4Open(false)} style={{ background: "transparent", border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13, color: T.textMuted, fontFamily: "inherit" }}>Anulo</button>
                <button onClick={() => { setA4Open(false); if (!client) setClientOpen(true); else printA4Invoice(); }} style={{ background: T.surface, border: `1.5px solid ${T.accent}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: T.accent, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                  {PIc.user(13)} {client ? "Ndrysho blerësin" : "Shto blerësin"}
                </button>
                <button onClick={() => { setA4Open(false); printA4Invoice(); }} style={{ background: T.accentGrad, border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                  {PIc.printer(13)} Printo A4
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lastReceipt && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setLastReceipt(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, padding: 28, width: "92%", maxWidth: 400, textAlign: "center", border: `1px solid ${T.border}`, boxShadow: "0 30px 90px rgba(0,0,0,.35)" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>{PIc.check(28)}</div>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: T.text }}>Shitja u regjistrua!</h3>
            <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 4 }}>Nr. faturës: <b style={{ color: T.text }}>{lastReceipt.receiptNo}</b></div>
            <div style={{ fontSize: 28, fontWeight: 800, color: T.accent, marginBottom: 20 }}>€{lastReceipt.total.toFixed(2)}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setLastReceipt(null)} style={{ flex: 1, background: T.surfaceAlt, color: T.textMuted, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "11px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>Mbyll</button>
              <button onClick={() => { printThermal(lastReceipt); }} style={{ flex: 2, background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "11px", cursor: "pointer", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}>
                {PIc.printer(14)} Printo Kuponin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// POSTA MODULE
// ============================================================
const POSTA_STATUSES = [
  { key: "procesuara", label: "Procesuara", color: "#3B82F6" },
  { key: "derguar", label: "Dërguar", color: "#F59E0B" },
  { key: "dorezuar", label: "Dorëzuar", color: "#10B981" },
  { key: "kthyer", label: "Kthyer", color: "#EF4444" },
];

function printPostaOrder(order, business) {
  const statusLabel = POSTA_STATUSES.find(s => s.key === order.status)?.label || order.status;
  const qrUrl = `${window.location.origin}${window.location.pathname}?posta=${order.id}`;
  const win = window.open("", "_blank", "width=900,height=500");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Posta #${order.orderNo}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
  <style>
    @page { size: 21cm 10cm landscape; margin: 0; }
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; width: 21cm; height: 10cm; display: flex; align-items: stretch; }
    .left { flex: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }
    .right { width: 130px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; border-left: 2px dashed #ccc; gap: 6px; }
    h1 { font-size: 15px; font-weight: 900; margin: 0 0 6px; }
    .row { display: flex; gap: 6px; font-size: 11px; }
    .lbl { color: #666; min-width: 80px; }
    .val { font-weight: 700; }
    .price { font-size: 20px; font-weight: 900; color: #1E40AF; margin-top: auto; }
    .status { font-size: 10px; background: #DBEAFE; color: #1E40AF; border-radius: 4px; padding: 2px 6px; display: inline-block; margin-bottom: 4px; }
    .qr-label { font-size: 9px; color: #666; text-align: center; }
    .biz { font-size: 10px; color: #888; margin-bottom: 6px; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style>
</head><body>
  <div class="left">
    <div class="biz">${business?.name || ""} ${business?.phone ? "| Tel: " + business.phone : ""}</div>
    <h1>Porosi #${order.orderNo || order.id.slice(-6).toUpperCase()}</h1>
    <div class="row"><span class="lbl">Emri:</span><span class="val">${order.clientName} ${order.clientSurname}</span></div>
    <div class="row"><span class="lbl">Telefon:</span><span class="val">${order.clientPhone || "—"}</span></div>
    <div class="row"><span class="lbl">Qyteti:</span><span class="val">${order.city}${order.country ? ", " + order.country : ""}</span></div>
    <div class="row"><span class="lbl">Adresa:</span><span class="val">${order.address || "—"}</span></div>
    ${order.description ? `<div class="row"><span class="lbl">Përshkrimi:</span><span class="val">${order.description}</span></div>` : ""}
    ${order.weight ? `<div class="row"><span class="lbl">Pesha:</span><span class="val">${order.weight}</span></div>` : ""}
    <div class="price">€${Number(order.price).toFixed(2)}</div>
  </div>
  <div class="right">
    <div class="status">${statusLabel}</div>
    <div id="qr"></div>
    <div class="qr-label">Skanoni për status</div>
  </div>
  <script>
    new QRCode(document.getElementById("qr"), { text: "${qrUrl}", width: 90, height: 90, correctLevel: QRCode.CorrectLevel.M });
    setTimeout(() => { window.print(); }, 600);
  <\/script>
</body></html>`);
  win.document.close();
}

function PostaOrderForm({ T, initial, onSave, onClose }) {
  const [form, setForm] = React.useState(initial || {
    clientName: "", clientSurname: "", clientPhone: "", city: "", country: "", address: "",
    description: "", price: "", weight: "", notes: "", status: "procesuara",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const FI = ({ label, field, type = "text", placeholder, required }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>{label}{required && " *"}</label>
      <input
        type={type}
        value={form[field] || ""}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder || ""}
        style={{ padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.inputBg || T.surface, color: T.text, outline: "none", fontFamily: "inherit" }}
      />
    </div>
  );
  const canSave = form.clientName.trim() && form.city.trim();
  return (
    <div style={{ background: T.surface, borderRadius: 20, padding: 24, border: `1.5px solid ${T.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.text }}>{initial ? "Edito Porosi" : "Porosi e Re"}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 20 }}>✕</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <FI label="Emri" field="clientName" required placeholder="p.sh. Arben" />
        <FI label="Mbiemri" field="clientSurname" placeholder="p.sh. Krasniqi" />
        <FI label="Telefon" field="clientPhone" placeholder="+383..." />
        <FI label="Qyteti" field="city" required placeholder="p.sh. Prishtinë" />
        <FI label="Shteti" field="country" placeholder="p.sh. Kosovë" />
        <FI label="Adresa" field="address" placeholder="Rruga, Nr..." />
        <FI label="Përshkrim" field="description" placeholder="Produkt..." />
        <FI label="Çmimi (€)" field="price" type="number" placeholder="0.00" />
        <FI label="Pesha" field="weight" placeholder="kg..." />
        <FI label="Shënime" field="notes" placeholder="Shënim opsional..." />
      </div>
      {initial && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>Statusi</label>
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            {POSTA_STATUSES.map(s => (
              <button key={s.key} onClick={() => set("status", s.key)}
                style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${form.status === s.key ? s.color : T.border}`, background: form.status === s.key ? s.color : T.surface, color: form.status === s.key ? "#fff" : T.textMuted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Anulo</button>
        <button onClick={() => canSave && onSave(form)} disabled={!canSave}
          style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: canSave ? "#3B82F6" : T.border, color: "#fff", fontWeight: 700, fontSize: 13, cursor: canSave ? "pointer" : "not-allowed" }}>
          {initial ? "Ruaj ndryshimet" : "Krijo porosi"}
        </button>
      </div>
    </div>
  );
}

function PostaPage({ T, business, orders, onAdd, onUpdate, onDelete }) {
  const [view, setView] = React.useState("list"); // list | new | detail
  const [selected, setSelected] = React.useState(null);
  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const genOrderNo = () => {
    const d = new Date();
    return `PS${d.getFullYear().toString().slice(-2)}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.floor(Math.random()*9000+1000)}`;
  };

  const filtered = (orders || []).filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (o.clientName + " " + o.clientSurname).toLowerCase().includes(s) ||
        (o.clientPhone || "").includes(s) || (o.orderNo || "").toLowerCase().includes(s) ||
        (o.city || "").toLowerCase().includes(s);
    }
    return true;
  });

  if (view === "new") {
    return (
      <div>
        <button onClick={() => setView("list")} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: T.textMuted, marginBottom: 16 }}>← Kthehu</button>
        <PostaOrderForm T={T} onClose={() => setView("list")} onSave={(f) => {
          const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
          const newOrder = { id, orderNo: genOrderNo(), ...f, price: Number(f.price) || 0, status: "procesuara", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          onAdd(newOrder);
          setView("list");
        }} />
      </div>
    );
  }

  if (view === "detail" && selected) {
    const order = (orders || []).find(o => o.id === selected.id) || selected;
    return (
      <div>
        <button onClick={() => { setView("list"); setSelected(null); }} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: T.textMuted, marginBottom: 16 }}>← Kthehu</button>
        <PostaOrderForm T={T} initial={order} onClose={() => { setView("list"); setSelected(null); }} onSave={(f) => {
          const updated = { ...order, ...f, price: Number(f.price) || 0, updatedAt: new Date().toISOString() };
          onUpdate(updated);
          setSelected(updated);
          setView("list");
        }} />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={() => printPostaOrder(order, business)}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#3B82F6", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            🖨️ Printo Kuponin
          </button>
          <button onClick={() => {
            const url = `${window.location.origin}${window.location.pathname}?posta=${order.id}`;
            navigator.clipboard?.writeText(url);
            window.open(url, "_blank");
          }} style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.surface, color: T.text, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            🔗 Faqja e statusit
          </button>
          <button onClick={() => { if (window.confirm("Fshi këtë porosi?")) { onDelete(order.id); setView("list"); setSelected(null); } }}
            style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#FEE2E2", color: "#EF4444", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            🗑️
          </button>
        </div>
      </div>
    );
  }

  // List view
  const statusCounts = {};
  POSTA_STATUSES.forEach(s => { statusCounts[s.key] = (orders || []).filter(o => o.status === s.key).length; });
  return (
    <div style={{ animation: "slideUp .2s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>📦 Posta</h2>
        <button onClick={() => setView("new")}
          style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "#3B82F6", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          + Porosi e re
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[{ label: "Gjithsej", count: (orders || []).length, color: "#6366F1" }, ...POSTA_STATUSES.map(s => ({ label: s.label, count: statusCounts[s.key] || 0, color: s.color }))].map(st => (
          <div key={st.label} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "12px 20px", textAlign: "center", minWidth: 90 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: st.color }}>{st.count}</div>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko emër, telefon, nr. porosie..."
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.surface, color: T.text, outline: "none" }} />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, background: T.surface, color: T.text }}>
          <option value="all">Të gjitha</option>
          {POSTA_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Nuk ka porosi</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(o => {
            const st = POSTA_STATUSES.find(s => s.key === o.status) || POSTA_STATUSES[0];
            return (
              <div key={o.id} onClick={() => { setSelected(o); setView("detail"); }}
                style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, transition: "box-shadow .15s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{o.clientName} {o.clientSurname}</span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>#{o.orderNo || o.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{o.city}{o.country ? ", " + o.country : ""} {o.clientPhone ? "• " + o.clientPhone : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#1E40AF" }}>€{Number(o.price).toFixed(2)}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: st.color + "20", color: st.color }}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Public status page for posta orders (QR scan)
function PostaStatusPublicPage({ orderId, onBack }) {
  const [order, setOrder] = React.useState(null);
  const [biz, setBiz] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    (async () => {
      try {
        const { data: o } = await supabase.from('posta_orders').select('*').eq('id', orderId).single();
        if (o) {
          setOrder(mapPostaOrderFromDB(o));
          const { data: a } = await supabase.from('accounts').select('name,phone,city').eq('id', o.account_id).single();
          if (a) setBiz(a);
        }
      } catch(e) {}
      setLoading(false);
    })();
  }, [orderId]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "#64748b" }}>Duke ngarkuar...</div>;
  if (!order) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "#EF4444" }}>Porosia nuk u gjet.</div>;

  const st = POSTA_STATUSES.find(s => s.key === order.status) || POSTA_STATUSES[0];
  const progress = POSTA_STATUSES.findIndex(s => s.key === order.status);
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "DM Sans, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>
        {biz && <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>{biz.name}</div>}
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px", color: "#0F172A" }}>Porosia #{order.orderNo || order.id.slice(-6).toUpperCase()}</h1>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>{new Date(order.createdAt).toLocaleDateString("sq-AL")}</div>
        {/* Status bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
          {POSTA_STATUSES.map((s, i) => (
            <React.Fragment key={s.key}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: i <= progress ? s.color : "#E2E8F0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px", fontWeight: 700, fontSize: 12, transition: "background .3s" }}>
                  {i < progress ? "✓" : i + 1}
                </div>
                <div style={{ fontSize: 10, color: i <= progress ? s.color : "#94A3B8", fontWeight: 600 }}>{s.label}</div>
              </div>
              {i < POSTA_STATUSES.length - 1 && <div style={{ flex: 1, height: 2, background: i < progress ? st.color : "#E2E8F0", marginBottom: 18 }} />}
            </React.Fragment>
          ))}
        </div>
        <div style={{ background: st.color + "15", border: `1.5px solid ${st.color}30`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: st.color }}>{st.label}</div>
        </div>
        {[["Emri", order.clientName + " " + order.clientSurname], ["Telefon", order.clientPhone], ["Qyteti", order.city + (order.country ? ", " + order.country : "")], ["Adresa", order.address], ["Çmimi", "€" + Number(order.price).toFixed(2)], ["Pesha", order.weight]].filter(([,v]) => v && v.trim()).map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F1F5F9", fontSize: 14 }}>
            <span style={{ color: "#64748b", fontWeight: 600 }}>{l}</span>
            <span style={{ color: "#0F172A", fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DataPhone() {
  // accounts is shared — both admin and businesses share this list
  const [accounts, setAccounts] = useState([]);
  const [data, setData] = useState(DEFAULT_DATA);
  const [page, setPage] = useState("auth");
  const [pageParam, setPageParam] = useState(null);
  const [toast, setToast] = useState({ msg: "", show: false });
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const syncingRef = useRef(false);
  const prevDataRef = useRef({ clients: [], workers: [], jobs: [], products: [], sales: [], warranties: [], debts: [] });
  // Arka state: 'landing' (show 2 big buttons) | 'products' | 'pos' (open arka)
  const [arkaView, setArkaView] = useState("landing");
  const [arkaPinOpen, setArkaPinOpen] = useState(null); // null | 'open' | 'close' | 'resetDay' | ...
  const [reportPeriod, setReportPeriod] = useState("daily");
  const accountsSyncingRef = useRef(false);
  const prevAccountsRef = useRef([]);

  // Handle QR code scan + restore session from localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('job') || params.get('jid');
    if (jobId) {
      setPage('jobStatus');
      setPageParam(jobId);
      return;
    }
    const postaId = params.get('posta');
    if (postaId) {
      setPage('postaStatus');
      setPageParam(postaId);
      return;
    }
    const savedAdmin = localStorage.getItem('prophone_is_admin');
    if (savedAdmin === '1') {
      setIsAdmin(true);
      return;
    }
    const savedId = localStorage.getItem('prophone_account_id') || sessionStorage.getItem('prophone_account_id');
    if (savedId) {
      (async () => {
        try {
          const { data: acc, error } = await supabase.from('accounts').select('*').eq('id', savedId).single();
          if (!error && acc) {
            const mapped = mapAccountFromDB(acc);
            setData(d => ({ ...d, business: mapped }));
            await hydrateFromSupabase(mapped.id);
            setPage('dashboard');
          } else {
            localStorage.removeItem('prophone_account_id');
          }
        } catch (e) { console.error('Session restore failed:', e); }
      })();
    }
  }, []);


  const T = darkMode ? THEME.dark : THEME.light;
  const currentWorker = data.workers[0];
  const staleCount = data.jobs.filter(j => !["perfunduar","nuk_merret"].includes(j.status) && daysOld(j.createdAt) >= 3).length;

  const showToast = (msg) => { setToast({ msg, show: true }); setTimeout(() => setToast({ msg: "", show: false }), 2500); };
  const navigate = (pg, param = null) => { setPage(pg); setPageParam(param); window.scrollTo(0, 0); };
  const wrappedSetData = useCallback((updater) => { setData(prev => typeof updater === "function" ? updater(prev) : updater); showToast("Ndryshimet u ruajten me sukses"); }, []);

  // Auto-sync data changes to Supabase
  useEffect(() => {
    if (syncingRef.current) return;
    if (!data.business?.id) return;
    const accountId = data.business.id;
    const prev = prevDataRef.current;
    const clientsDiff = diffById(prev.clients, data.clients);
    const workersDiff = diffById(prev.workers, data.workers);
    const jobsDiff = diffById(prev.jobs, data.jobs);
    const hasChanges =
      clientsDiff.added.length || clientsDiff.removed.length || clientsDiff.changed.length ||
      workersDiff.added.length || workersDiff.removed.length || workersDiff.changed.length ||
      jobsDiff.added.length || jobsDiff.removed.length || jobsDiff.changed.length;
    if (!hasChanges) return;
    (async () => {
      await syncEntity('clients', mapClientToDB, accountId, clientsDiff);
      await syncEntity('workers', mapWorkerToDB, accountId, workersDiff);
      await syncEntity('jobs', mapJobToDB, accountId, jobsDiff);
      prevDataRef.current = {
        clients: data.clients,
        workers: data.workers,
        jobs: data.jobs,
      };
    })();
  }, [data.clients, data.workers, data.jobs, data.business]);

  const hydrateFromSupabase = async (accountId) => {
    syncingRef.current = true;
    const loaded = await loadBusinessData(accountId);
    const arka = await loadArkaData(accountId);
    setData(d => ({
      ...d,
      clients: loaded.clients,
      workers: loaded.workers,
      jobs: loaded.jobs,
      products: arka.products,
      sales: arka.sales,
      warranties: arka.warranties,
      debts: arka.debts,
      coupons: arka.coupons || [],
      postaOrders: arka.postaOrders || [],
    }));
    prevDataRef.current = {
      clients: loaded.clients,
      workers: loaded.workers,
      jobs: loaded.jobs,
      products: arka.products,
      sales: arka.sales,
      warranties: arka.warranties,
      debts: arka.debts,
      coupons: arka.coupons || [],
      postaOrders: arka.postaOrders || [],
    };
    setTimeout(() => { syncingRef.current = false; }, 100);
  };

  // Auto-sync changes to business (logged-in account) to Supabase
  const prevBusinessRef = useRef(null);
  useEffect(() => {
    if (syncingRef.current) return;
    if (!data.business?.id) return;
    const prev = prevBusinessRef.current;
    if (prev && JSON.stringify(prev) === JSON.stringify(data.business)) return;
    if (prev && prev.id === data.business.id) {
      (async () => {
        try {
          const row = mapAccountToDB(data.business);
          const { error } = await supabase.from('accounts').update(row).eq('id', data.business.id);
          if (error) {
            console.error('Business sync error:', error);
            // Fallback: provo përditësim pa fushat që mund të mos ekzistojnë
            const minimal = {
              name: row.name, email: row.email, phone: row.phone,
              city: row.city, country: row.country, address: row.address,
              facebook: row.facebook, instagram: row.instagram, website: row.website,
            };
            const { error: err2 } = await supabase.from('accounts').update(minimal).eq('id', data.business.id);
            if (err2) console.error('Business sync minimal error:', err2);
            else console.warn('Business u ruajt pa fushat e reja — ekzekuto SQL migrimin!');
          }
        } catch (e) {
          console.error('Business sync exception:', e);
        }
      })();
    }
    prevBusinessRef.current = data.business;
  }, [data.business]);

  // Auto-sync Arka (products + sales) to Supabase
  useEffect(() => {
    if (syncingRef.current) return;
    if (!data.business?.id) return;
    const accountId = data.business.id;
    const prev = prevDataRef.current;
    const productsDiff = diffById(prev.products || [], data.products || []);
    const salesDiff = diffById(prev.sales || [], data.sales || []);
    const warrDiff = diffById(prev.warranties || [], data.warranties || []);
    const debtsDiff = diffById(prev.debts || [], data.debts || []);
    const couponsDiff = diffById(prev.coupons || [], data.coupons || []);
    const postaDiff = diffById(prev.postaOrders || [], data.postaOrders || []);
    const hasChanges =
      productsDiff.added.length || productsDiff.removed.length || productsDiff.changed.length ||
      salesDiff.added.length || salesDiff.removed.length || salesDiff.changed.length ||
      warrDiff.added.length || warrDiff.removed.length || warrDiff.changed.length ||
      debtsDiff.added.length || debtsDiff.removed.length || debtsDiff.changed.length ||
      couponsDiff.added.length || couponsDiff.removed.length || couponsDiff.changed.length ||
      postaDiff.added.length || postaDiff.removed.length || postaDiff.changed.length;
    if (!hasChanges) return;
    (async () => {
      await syncEntity('products', mapProductToDB, accountId, productsDiff);
      await syncEntity('sales', mapSaleToDB, accountId, salesDiff);
      await syncEntity('warranties', mapWarrantyToDB, accountId, warrDiff);
      await syncEntity('debts', mapDebtToDB, accountId, debtsDiff);
      await syncEntity('coupons', mapCouponToDB, accountId, couponsDiff);
      await syncEntity('posta_orders', mapPostaOrderToDB, accountId, postaDiff);
      prevDataRef.current = { ...prevDataRef.current, products: data.products, sales: data.sales, warranties: data.warranties, debts: data.debts, coupons: data.coupons, postaOrders: data.postaOrders };
    })();
  }, [data.products, data.sales, data.warranties, data.debts, data.coupons, data.postaOrders, data.business]);

  // Load all accounts when admin logs in
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      accountsSyncingRef.current = true;
      const all = await loadAllAccounts();
      setAccounts(all);
      prevAccountsRef.current = all;
      setTimeout(() => { accountsSyncingRef.current = false; }, 100);
    })();
  }, [isAdmin]);

  // Auto-sync accounts changes to Supabase (admin edits)
  useEffect(() => {
    if (accountsSyncingRef.current) return;
    if (!isAdmin) return;
    const prev = prevAccountsRef.current;
    const diff = diffById(prev, accounts);
    const hasChanges = diff.added.length || diff.removed.length || diff.changed.length;
    if (!hasChanges) return;
    (async () => {
      await syncEntity('accounts', (a) => mapAccountToDB(a), null, diff);
      prevAccountsRef.current = accounts;
    })();
  }, [accounts, isAdmin]);

  // Auto-refresh business account from Supabase every 30s + on window focus
  // This picks up admin changes (hasPosta, hasArka, status, expiry) without re-login
  useEffect(() => {
    if (!data.business?.id) return;
    const refresh = async () => {
      try {
        const { data: acc, error } = await supabase.from('accounts').select('*').eq('id', data.business.id).single();
        if (!error && acc) {
          const fresh = mapAccountFromDB(acc);
          const fields = ['hasArka','hasPosta','status','expiryDate','arkaPin'];
          const changed = fields.some(f => fresh[f] !== data.business[f]);
          if (changed) {
            syncingRef.current = true;
            setData(d => ({ ...d, business: { ...d.business, ...fresh } }));
            setTimeout(() => { syncingRef.current = false; }, 100);
          }
        }
      } catch(e) {}
    };
    const interval = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, [data.business?.id]);

  const handleRegister = async (biz) => {
    try {
      // Check if email already exists
      const { data: existing } = await supabase.from('accounts').select('id').eq('email', biz.email.trim()).maybeSingle();
      if (existing) {
        showToast("Ky email është i regjistruar tashmë");
        return;
      }
      const now = new Date();
      const expiry = new Date(now.getTime() + 30 * 86400000);
      const insertRow = {
        name: biz.name,
        email: biz.email.trim(),
        password: biz.password,
        phone: biz.phone || null,
        city: biz.city || null,
        country: biz.country || null,
        status: "active",
        registered_at: now.toISOString(),
        trial_start: now.toISOString(),
        expiry_date: expiry.toISOString(),
      };
      const { data: inserted, error } = await supabase.from('accounts').insert(insertRow).select().single();
      if (error) {
        console.error('Register error:', error);
        showToast("Gabim gjatë regjistrimit: " + error.message);
        return;
      }
      const mapped = mapAccountFromDB(inserted);
      setAccounts(a => [...a, mapped]);
      syncingRef.current = true;
      setData(d => ({ ...d, business: mapped, clients: [], workers: [], jobs: [] }));
      prevDataRef.current = { clients: [], workers: [], jobs: [] };
      setTimeout(() => { syncingRef.current = false; }, 100);
      setRegSuccess(true);
      showToast("Regjistrimi u krye me sukses!");
    } catch (e) {
      console.error(e);
      showToast("Gabim: " + e.message);
    }
  };


  const handleLogin = async (account, rememberMe = true) => {
    // Check if admin
    if (account.email === ADMIN_CREDENTIALS.email && account.password === ADMIN_CREDENTIALS.password) {
      setIsAdmin(true);
      localStorage.setItem('prophone_is_admin', '1');
      showToast("Mirë se vini, Administrator!");
      return;
    }
    try {
      // Fetch account from Supabase by email + password
      const { data: rows, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('email', account.email.trim())
        .eq('password', account.password)
        .maybeSingle();
      if (error || !rows) {
        showToast("Email ose fjalëkalim i gabuar");
        return;
      }
      const fresh = mapAccountFromDB(rows);
      if (getAccountStatus(fresh) === "suspended") {
        showToast("Llogaria juaj është pezulluar. Kontaktoni administratorin.");
        return;
      }
      if (rememberMe) {
        localStorage.setItem('prophone_account_id', fresh.id);
      } else {
        sessionStorage.setItem('prophone_account_id', fresh.id);
        localStorage.removeItem('prophone_account_id');
      }
      setData(d => ({ ...d, business: fresh }));
      await hydrateFromSupabase(fresh.id);
      setPage('dashboard');
      showToast("U kyqët me sukses!");
    } catch (e) {
      console.error("Login error:", e);
      showToast("Gabim gjatë kyçjes: " + e.message);
    }
  };

  // When admin updates accounts, also update currently logged-in business data
  const handleSetAccounts = useCallback((updater) => {
    setAccounts(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // Keep current business in sync if it was updated
      if (data.business) {
        const updated = next.find(a => a.id === data.business.id);
        if (updated) setData(d => ({ ...d, business: updated }));
      }
      return next;
    });
  }, [data.business]);

  // If admin logs out
  const handleAdminLogout = () => { setIsAdmin(false); localStorage.removeItem('prophone_is_admin'); showToast("U shkyqet me sukses!"); };

  if (!data.business && page !== "auth") setPage("auth");

  // If admin is logged in – show admin panel
  if (isAdmin) {
    return <AdminPanel accounts={accounts} setAccounts={handleSetAccounts} onLogout={handleAdminLogout} />;
  }



  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideDown{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:6px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${darkMode ? "#1E3A5F" : "#d1d5db"};border-radius:3px}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
    input::placeholder,textarea::placeholder{color:${T.textFaint};}
    select option{background:${T.surface};color:${T.text};}

    /* Desktop: hide bottom nav */
    .mobile-bottom-nav { display: none; }

    /* ===== MOBILE RESPONSIVE ===== */
    @media (max-width: 640px) {
      /* Hide desktop nav tabs */
      .desktop-nav-tabs { display: none !important; }
      /* Hide desktop right controls except menu */
      .desktop-stale-btn { display: none !important; }
      /* Show bottom nav */
      .mobile-bottom-nav { display: flex !important; }
      /* Reduce nav padding */
      nav { padding: 10px 16px !important; }
      /* Main content padding */
      .main-content { padding: 16px 12px 90px !important; }
      /* StatCards grid */
      .stat-cards-grid { 
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
      }
      .stat-cards-grid > div {
        min-width: unset !important;
        padding: 12px 8px !important;
      }
      .stat-cards-grid > div > div:last-child {
        font-size: 22px !important;
      }
      /* Jobs table -> cards */
      .jobs-table-header { display: none !important; }
      .jobs-table-row {
        display: flex !important;
        flex-direction: column !important;
        padding: 14px 16px !important;
        gap: 8px !important;
        border-radius: 12px !important;
        margin-bottom: 8px !important;
        border: 1.5px solid ${T.border} !important;
        background: ${T.surface} !important;
      }
      .jobs-table-row > span:first-child {
        font-size: 15px !important;
        font-weight: 700 !important;
      }
      /* Clients table -> cards */
      .clients-table-header { display: none !important; }
      .clients-table-row {
        display: flex !important;
        flex-wrap: wrap !important;
        padding: 14px 16px !important;
        gap: 6px 16px !important;
        border-radius: 12px !important;
        margin-bottom: 8px !important;
        border: 1.5px solid ${T.border} !important;
        background: ${T.surface} !important;
      }
      .clients-table-row > span:first-child {
        width: 100% !important;
        font-size: 15px !important;
      }
      /* Workers table -> cards */
      .workers-table-header { display: none !important; }
      .workers-table-row {
        display: flex !important;
        flex-wrap: wrap !important;
        padding: 14px 16px !important;
        gap: 6px 16px !important;
        border-radius: 12px !important;
        margin-bottom: 8px !important;
        border: 1.5px solid ${T.border} !important;
        background: ${T.surface} !important;
      }
      /* Settings grid -> 1 col */
      .settings-grid-2col {
        grid-template-columns: 1fr !important;
      }
      /* Modal width */
      .modal-content {
        width: calc(100vw - 32px) !important;
        max-width: 100% !important;
        max-height: 90vh !important;
      }
      /* Page titles */
      h2 { font-size: 20px !important; }
      /* Dashboard header buttons */
      .dashboard-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 12px !important;
      }
      .dashboard-header > div:last-child {
        width: 100% !important;
        display: flex !important;
        gap: 8px !important;
      }
      .dashboard-header > div:last-child > button {
        flex: 1 !important;
        justify-content: center !important;
      }
      /* Status breakdown cards */
      .status-breakdown {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      /* CreateJob form */
      .create-job-grid {
        grid-template-columns: 1fr !important;
      }
      /* Job detail grid */
      .job-detail-grid {
        grid-template-columns: 1fr !important;
      }
      /* Report grid */
      .report-grid {
        grid-template-columns: 1fr !important;
      }
      /* Top4 clients flex */
      .top4-clients {
        flex-direction: column !important;
      }
      .top4-clients > div {
        width: 100% !important;
      }
    }
  `;


  
  // DIRECT QR CODE HANDLER - shows client view immediately
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("v") === "1") {
    const qrJob = { id: urlParams.get("jid")||"", phoneModel: urlParams.get("pm")||"", imei: urlParams.get("im")||"", description: urlParams.get("ds")||"", price: urlParams.get("pr")||"", status: urlParams.get("st")||"new", createdAt: urlParams.get("dt")||"" };
    const qrClient = { name: urlParams.get("cn")||"", phone: urlParams.get("cp")||"" };
    const qrWorker = { name: urlParams.get("wn")||"" };
    const qrBiz = { name: urlParams.get("bn")||"", phone: urlParams.get("bp")||"" };
    return <ClientStatusView job={qrJob} client={qrClient} worker={qrWorker} business={qrBiz} onBack={() => window.location.href = window.location.origin} />;
  }

  if (isAdmin) return (
    <><style>{styles}</style>
    <AdminPanel accounts={accounts} setAccounts={setAccounts} onLogout={() => { setIsAdmin(false); localStorage.removeItem('prophone_is_admin'); setPage("auth"); }} />
    </>
  );
  if (page === "jobStatus" && pageParam) return (
    <JobStatusPage jobId={pageParam} data={data} onBack={() => setPage("auth")} T={T} />
  );
  if (page === "postaStatus" && pageParam) return (
    <PostaStatusPublicPage orderId={pageParam} onBack={() => setPage("auth")} />
  );
  if (page === "auth") return (
    <><style>{styles}</style>
    <AuthPage onRegister={handleRegister} onLogin={handleLogin} accounts={accounts} regSuccess={regSuccess} onGoLogin={() => { setRegSuccess(false); }} />
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "DM Sans, sans-serif" }}>
        <nav style={{ background: T.nav, borderBottom: `1px solid ${T.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: T.accent, letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 8 }}><img src="./icon.png" alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />DataPOS</div>
            <div className="desktop-nav-tabs" style={{ display: "flex", gap: 4 }}>
              {(() => { let n = [NAV_BASE[0], NAV_BASE[1], NAV_BASE[2]]; if (data.business?.hasArka) n.push(NAV_ARKA); if (data.business?.hasPosta) n.push(NAV_POSTA); n.push(NAV_BASE[3]); return n; })().map(item => (
                <button key={item.key} onClick={() => navigate(item.key)} style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", transition: "all .2s", background: page === item.key ? T.accent : "transparent", color: page === item.key ? "#fff" : T.textMuted, position: "relative" }}
                  onMouseEnter={e => { if (page !== item.key) e.target.style.background = T.surfaceAlt; }} onMouseLeave={e => { if (page !== item.key) e.target.style.background = "transparent"; }}>
                  {item.label}
                  {item.key === "dashboard" && staleCount > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: "#EF4444", border: "2px solid " + T.nav }}></span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Stale notification bell */}
            {staleCount > 0 && (
              <button onClick={() => navigate("dashboard")} style={{ background: "#FEE2E2", border: "none", borderRadius: 10, padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#EF4444", fontSize: 12, fontWeight: 700 }}>
                {Ic.bell(14)} {staleCount} punë me vonesë
              </button>
            )}
            {/* Dark mode toggle */}
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: T.surfaceAlt, border: `1.5px solid ${T.border}`, borderRadius: 10, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, transition: "all .2s" }}>
              {darkMode ? Ic.sun(16) : Ic.moon(16)}
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1.5px solid ${T.border}`, cursor: "pointer", background: T.surface, color: T.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
                {data.business?.name || "—"} {Ic.down(10)}
              </button>
              {menuOpen && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: T.surface, borderRadius: 12, border: `1.5px solid ${T.border}`, boxShadow: "0 8px 24px rgba(0,0,0,.15)", width: 200, zIndex: 200, overflow: "hidden" }}>
                  <div style={{ padding: "8px 0 8px 16px", fontSize: 11, color: T.textFaint, fontWeight: 600, textTransform: "uppercase" }}>Manage Account</div>
                  {["Profili", "Perdoruesit", "Parametrat e printimit", "Parametrat e statusav"].map(item => (
                    <div key={item} style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", color: T.textMuted }} onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{item}</div>
                  ))}
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 16px", fontSize: 13, cursor: "pointer", color: T.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }} onClick={() => { localStorage.removeItem('prophone_account_id'); sessionStorage.removeItem('prophone_account_id'); setData(DEFAULT_DATA); navigate("auth"); setMenuOpen(false); }}>
                    {Ic.logout(13)} Log Out
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="main-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 60px" }}>
          {/* Subscription expiry warnings */}
          {data.business && getAccountStatus(data.business) === "expired" && (
            <div style={{ background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 12, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <span style={{ color: "#EF4444" }}>{Ic.warn(16)}</span>
              <strong style={{ color: "#EF4444" }}>Abonimet tuaj ka skaduar!</strong>
              <span style={{ color: "#7F1D1D" }}>Kontaktoni administratorin për ta rinovuar.</span>
            </div>
          )}
          {data.business && getAccountStatus(data.business) === "expiring" && data.business.expiryDate && (
            <div style={{ background: "#FEF3C7", border: "1.5px solid #FCD34D", borderRadius: 12, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <span style={{ color: "#D97706" }}>{Ic.warn(16)}</span>
              <strong style={{ color: "#D97706" }}>Abonimet skadon pas {data.business ? Math.ceil((new Date(data.business.expiryDate) - new Date()) / 86400000) : 0} ditësh!</strong>
              <span style={{ color: "#78350F" }}>Kontaktoni administratorin për rinovim.</span>
            </div>
          )}
            {page === "dashboard" && <Dashboard data={data} setData={wrappedSetData} onNavigate={navigate} currentWorker={currentWorker} T={T} />}
          {page === "workers" && <Workers data={data} setData={wrappedSetData} T={T} />}
          {page === "clients" && <Clients data={data} setData={wrappedSetData} onNavigate={navigate} T={T} />}
          {page === "createJob" && <CreateJob data={data} setData={wrappedSetData} onNavigate={navigate} T={T} />}
          {page === "jobDetail" && <JobDetail data={data} setData={wrappedSetData} jobId={pageParam} onNavigate={navigate} T={T} />}
          {page === "business" && <BusinessSettings data={data} setData={wrappedSetData} T={T} />}
          {page === "settings" && <SettingsPage tab={pageParam} data={data} setData={wrappedSetData} onNavigate={navigate} T={T} />}
          {page === "arka" && data.business?.hasArka && (
            <>
              {arkaView === "landing" && (
                <ArkaLanding T={T}
                  productsCount={data.products.length}
                  todaySalesTotal={data.sales.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString()).reduce((s, x) => s + x.total, 0)}
                  openDebtsTotal={(data.debts || []).filter(d => !d.isSettled).reduce((s, d) => s + d.remainingAmount, 0)}
                  openDebtsCount={(data.debts || []).filter(d => !d.isSettled).length}
                  arkaOpen={false}
                  onOpenProducts={() => setArkaView("products")}
                  onOpenPOS={() => setArkaPinOpen("open")}
                  onOpenDebts={() => setArkaView("debts")}
                  onOpenReport={(p) => { setReportPeriod(p); setArkaView("report"); }}
                  onResetDay={() => setArkaPinOpen("resetDay")}
                  onResetMonth={() => setArkaPinOpen("resetMonth")}
                  onResetYear={() => setArkaPinOpen("resetYear")}
                />
              )}
              {arkaView === "products" && (
                <RegisterProducts T={T} products={data.products}
                  onChange={(next) => setData(d => ({ ...d, products: next }))}
                  onBack={() => setArkaView("landing")}
                />
              )}
              {arkaView === "report" && (
                <ReportView T={T} business={data.business} period={reportPeriod}
                  sales={data.sales || []} jobs={data.jobs || []} debts={data.debts || []}
                  onBack={() => setArkaView("landing")}
                />
              )}
              {arkaView === "debts" && (
                <DebtsView T={T} business={data.business} debts={data.debts || []}
                  onUpdate={(updated) => setData(d => ({ ...d, debts: (d.debts || []).map(x => x.id === updated.id ? updated : x) }))}
                  onDelete={(id) => setData(d => ({ ...d, debts: (d.debts || []).filter(x => x.id !== id) }))}
                  onBack={() => setArkaView("landing")}
                />
              )}
              {arkaView === "pos" && (
                <POSView T={T} business={data.business} products={data.products} sales={data.sales}
                  warranties={data.warranties || []}
                  onSale={(sale) => setData(d => ({ ...d, sales: [sale, ...d.sales], products: d.products.map(p => {
                    const hit = sale.items.find(i => i.id === p.id);
                    return hit ? { ...p, stock: p.stock - hit.qty } : p;
                  }) }))}
                  onAddWarranty={(w) => setData(d => ({ ...d, warranties: [w, ...(d.warranties || [])] }))}
                  onRemoveWarranty={(id) => setData(d => ({ ...d, warranties: (d.warranties || []).filter(x => x.id !== id) }))}
                  onAddDebt={(debt) => setData(d => ({ ...d, debts: [debt, ...(d.debts || [])] }))}
                  onBack={() => setArkaView("landing")}
                  onCloseArka={() => setArkaPinOpen("close")}
                />
              )}
            </>
          )}
          {page === "posta" && data.business?.hasPosta && (
            <PostaPage T={T} business={data.business}
              orders={data.postaOrders || []}
              onAdd={(o) => setData(d => ({ ...d, postaOrders: [o, ...(d.postaOrders || [])] }))}
              onUpdate={(o) => setData(d => ({ ...d, postaOrders: (d.postaOrders || []).map(x => x.id === o.id ? o : x) }))}
              onDelete={(id) => setData(d => ({ ...d, postaOrders: (d.postaOrders || []).filter(x => x.id !== id) }))}
            />
          )}
        </div>
      </div>
      <Toast message={toast.msg} visible={toast.show} />
      {menuOpen && <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuOpen(false)} />}
      {arkaPinOpen && data.business?.arkaPin && (
        <ArkaPinGate T={T}
          expectedPin={data.business.arkaPin}
          title={arkaPinOpen === "open" ? "Hap Arkën" : arkaPinOpen === "close" ? "Mbyll Arkën" : arkaPinOpen === "resetDay" ? "Reseto Ditën" : arkaPinOpen === "resetMonth" ? "Reseto Muajin" : arkaPinOpen === "resetYear" ? "Reseto Vitin" : "Veprim i mbrojtur"}
          onSuccess={() => {
            if (arkaPinOpen === "open") { setArkaView("pos"); }
            else if (arkaPinOpen === "close") { setArkaView("landing"); showToast("Arka u mbyll"); }
            else if (arkaPinOpen === "resetDay" || arkaPinOpen === "resetMonth" || arkaPinOpen === "resetYear") {
              const now = new Date();
              const keepIf = (createdAt) => {
                const d = new Date(createdAt);
                if (arkaPinOpen === "resetDay") return d.toDateString() !== now.toDateString();
                if (arkaPinOpen === "resetMonth") return !(d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());
                if (arkaPinOpen === "resetYear") return d.getFullYear() !== now.getFullYear();
                return true;
              };
              setData(d => ({
                ...d,
                sales: (d.sales || []).filter(s => keepIf(s.createdAt)),
                debts: (d.debts || []).filter(x => keepIf(x.createdAt)),
              }));
              showToast(arkaPinOpen === "resetDay" ? "Dita u resetua" : arkaPinOpen === "resetMonth" ? "Muaji u resetua" : "Viti u resetua");
            }
            setArkaPinOpen(null);
          }}
          onCancel={() => setArkaPinOpen(null)}
        />
      )}
      {arkaPinOpen && !data.business?.arkaPin && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setArkaPinOpen(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 20, padding: 28, width: "92%", maxWidth: 400, textAlign: "center", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 36 }}>⚠️</div>
            <h3 style={{ margin: "10px 0 6px", fontSize: 17, fontWeight: 800, color: T.text }}>PIN i pacaktuar</h3>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>Kontaktoni administratorin ose shkoni te Biznesi → Cilësimet e Arkës për të caktuar një PIN 6-shifror.</p>
            <button onClick={() => setArkaPinOpen(null)} style={{ background: T.accentGrad, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>OK</button>
          </div>
        </div>
      )}
    </>
  );
}





