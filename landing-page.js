const fs = require("fs");
const path = "src/prophone_v3.jsx";
let src = fs.readFileSync(path, "utf8");
fs.writeFileSync(path + ".bak15", src);
const report = [];
function applyUnique(name, a, b) {
  const i = src.indexOf(a);
  if (i === -1) { report.push(name + ": NUK U GJET"); return; }
  if (src.indexOf(a, i + a.length) !== -1) { report.push(name + ": SHUME NDESHJE - u anulua"); return; }
  src = src.replace(a, () => b);
  report.push(name + ": OK");
}

applyUnique("initial-page-landing",
  'const [page, setPage] = useState("auth");',
  'const [page, setPage] = useState("landing");'
);

applyUnique("page-routing",
  'if (!data.business && page !== "auth") setPage("auth");',
  'if (!data.business && page !== "auth" && page !== "landing") setPage("landing");\n  if (data.business && page === "landing") setPage("dashboard");'
);

applyUnique("landing-render-before-auth",
  'if (page === "auth") return (',
  'if (page === "landing") return <Landing T={T} onLogin={() => setPage("auth")} onRegister={() => setPage("auth")} />;\n  if (page === "auth") return ('
);

applyUnique("auth-mode-from-window",
  'const [mode, setMode] = useState("login");',
  'const [mode, setMode] = useState(() => { try { const m = window.__authMode; delete window.__authMode; return m === "register" ? "register" : "login"; } catch(e){ return "login"; } });'
);

const L = [];
L.push('function Landing({ T, onLogin, onRegister }) {');
L.push('  const goLogin = () => { try { window.__authMode = "login"; } catch(e){ } onLogin(); };');
L.push('  const goRegister = () => { try { window.__authMode = "register"; } catch(e){ } onRegister(); };');
L.push('  const S = {');
L.push('    page: { minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" },');
L.push('    nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid " + T.border, background: T.surface, position: "sticky", top: 0, zIndex: 10 },');
L.push('    logo: { fontSize: 22, fontWeight: 900, color: T.accent, letterSpacing: -0.5 },');
L.push('    navBtns: { display: "flex", gap: 10, alignItems: "center" },');
L.push('    btnGhost: { padding: "10px 18px", borderRadius: 10, border: "1.5px solid " + T.border, background: "transparent", color: T.text, fontWeight: 700, fontSize: 14, cursor: "pointer" },');
L.push('    btnPrimary: { padding: "10px 18px", borderRadius: 10, border: "none", background: T.accent, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" },');
L.push('    hero: { padding: "64px 20px 48px", textAlign: "center", maxWidth: 1100, margin: "0 auto" },');
L.push('    h1: { margin: "0 0 16px", fontSize: 44, fontWeight: 900, lineHeight: 1.15, letterSpacing: -1, color: T.text },');
L.push('    h1accent: { color: T.accent },');
L.push('    heroSub: { margin: "0 auto 24px", fontSize: 17, color: T.textMuted, maxWidth: 720, lineHeight: 1.5 },');
L.push('    badges: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 },');
L.push('    badge: { padding: "6px 14px", borderRadius: 20, background: T.surface, border: "1px solid " + T.border, fontSize: 13, color: T.textMuted, fontWeight: 600 },');
L.push('    heroBtns: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 },');
L.push('    btnHeroPrimary: { padding: "14px 28px", borderRadius: 12, border: "none", background: T.accent, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 20px rgba(14,165,233,0.25)" },');
L.push('    btnHeroGhost: { padding: "14px 28px", borderRadius: 12, border: "1.5px solid " + T.border, background: T.surface, color: T.text, fontWeight: 700, fontSize: 16, cursor: "pointer" },');
L.push('    miniNote: { fontSize: 13, color: T.textFaint },');
L.push('    section: { padding: "56px 20px", maxWidth: 1100, margin: "0 auto" },');
L.push('    sectionAlt: { padding: "56px 20px", background: T.surfaceAlt },');
L.push('    sectionInner: { maxWidth: 1100, margin: "0 auto" },');
L.push('    sectionTitle: { fontSize: 30, fontWeight: 900, margin: "0 0 8px", color: T.text, textAlign: "center", letterSpacing: -0.5 },');
L.push('    sectionSub: { fontSize: 15, color: T.textMuted, textAlign: "center", margin: "0 auto 36px", maxWidth: 640 },');
L.push('    modulesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 },');
L.push('    moduleCard: { background: T.surface, border: "1px solid " + T.border, borderRadius: 16, padding: 22, textAlign: "center" },');
L.push('    moduleIcon: { fontSize: 34, marginBottom: 10 },');
L.push('    moduleName: { fontSize: 15, fontWeight: 700, color: T.text },');
L.push('    moduleDesc: { fontSize: 12, color: T.textMuted, marginTop: 4 },');
L.push('    featureRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center", marginBottom: 40 },');
L.push('    featureTitle: { fontSize: 24, fontWeight: 800, margin: "0 0 12px", color: T.text, letterSpacing: -0.3 },');
L.push('    featureText: { fontSize: 15, color: T.textMuted, lineHeight: 1.6, margin: 0 },');
L.push('    featureVisual: { background: T.surface, border: "1px solid " + T.border, borderRadius: 20, padding: 32, textAlign: "center", fontSize: 56 },');
L.push('    ctaBox: { background: T.accent, borderRadius: 20, padding: "48px 24px", textAlign: "center", color: "#fff" },');
L.push('    ctaTitle: { fontSize: 28, fontWeight: 900, margin: "0 0 8px", color: "#fff" },');
L.push('    ctaSub: { fontSize: 16, opacity: 0.92, margin: "0 0 24px", color: "#fff" },');
L.push('    ctaBtn: { padding: "14px 32px", borderRadius: 12, border: "none", background: "#fff", color: T.accent, fontWeight: 800, fontSize: 16, cursor: "pointer" },');
L.push('    footer: { padding: "32px 20px", borderTop: "1px solid " + T.border, background: T.surface, textAlign: "center", color: T.textMuted, fontSize: 13 },');
L.push('    footerLogo: { fontSize: 18, fontWeight: 900, color: T.accent, marginBottom: 8 },');
L.push('    footerCopy: { marginTop: 8 }');
L.push('  };');
L.push('  const modules = [');
L.push('    { icon: "\\uD83D\\uDD27", name: "Servisi", desc: "Riparime telefonash" },');
L.push('    { icon: "\\uD83E\\uDDFE", name: "Arka POS", desc: "Shitje + faturat" },');
L.push('    { icon: "\\uD83D\\uDCE6", name: "Posta", desc: "Porosi & dorezime" },');
L.push('    { icon: "\\uD83D\\uDC65", name: "Klientet", desc: "Baza e klienteve" },');
L.push('    { icon: "\\uD83D\\uDC77", name: "Punetoret", desc: "Stafi & detyrat" },');
L.push('    { icon: "\\uD83D\\uDEE1\\uFE0F", name: "Garancite", desc: "Garanci A4" },');
L.push('    { icon: "\\uD83D\\uDCB3", name: "Borxhet", desc: "Borxhet e klienteve" },');
L.push('    { icon: "\\uD83D\\uDCCA", name: "Raportet", desc: "Te ardhurat detaje" }');
L.push('  ];');
L.push('  return (');
L.push('    <div style={S.page}>');
L.push('      <div style={S.nav}>');
L.push('        <div style={S.logo}>DataPos</div>');
L.push('        <div style={S.navBtns}>');
L.push('          <button onClick={goLogin} style={S.btnGhost}>Kyqu</button>');
L.push('          <button onClick={goRegister} style={S.btnPrimary}>Regjistrohu</button>');
L.push('        </div>');
L.push('      </div>');
L.push('      <div style={S.hero}>');
L.push('        <h1 style={S.h1}>Zgjidhja juaj e plote per <span style={S.h1accent}>menaxhimin e biznesit</span></h1>');
L.push('        <p style={S.heroSub}>ProPhone ju ndihmon te menaxhoni servisin e telefonave, arken, postat, klientet, punetoret dhe raportet - gjithcka ne nje vend.</p>');
L.push('        <div style={S.badges}>');
L.push('          <div style={S.badge}>Servise Telefonash</div>');
L.push('          <div style={S.badge}>Dyqane</div>');
L.push('          <div style={S.badge}>Posta</div>');
L.push('          <div style={S.badge}>Klinika</div>');
L.push('        </div>');
L.push('        <div style={S.heroBtns}>');
L.push('          <button onClick={goRegister} style={S.btnHeroPrimary}>Regjistrohu Falas</button>');
L.push('          <button onClick={goLogin} style={S.btnHeroGhost}>Kyqu ne llogarine time</button>');
L.push('        </div>');
L.push('        <div style={S.miniNote}>Prove 30 ditore falas . Pa karte krediti . Anulo ne cdo kohe</div>');
L.push('      </div>');
L.push('      <div style={S.sectionAlt}>');
L.push('        <div style={S.sectionInner}>');
L.push('          <h2 style={S.sectionTitle}>Menaxhim per cdo aspekt te biznesit</h2>');
L.push('          <p style={S.sectionSub}>Te gjitha modulet qe ju nevojiten per nje biznes te organizuar dhe profesional.</p>');
L.push('          <div style={S.modulesGrid}>');
L.push('            {modules.map(m => <div key={m.name} style={S.moduleCard}><div style={S.moduleIcon}>{m.icon}</div><div style={S.moduleName}>{m.name}</div><div style={S.moduleDesc}>{m.desc}</div></div>)}');
L.push('          </div>');
L.push('        </div>');
L.push('      </div>');
L.push('      <div style={S.section}>');
L.push('        <div style={S.featureRow}>');
L.push('          <div>');
L.push('            <h3 style={S.featureTitle}>Servisi i telefonave</h3>');
L.push('            <p style={S.featureText}>Regjistro pune te reja, ndiq statuset, gjenero kuponat dhe raportet. Klienti merr nje link publik per te pare statusin e pajisjes ne kohe reale.</p>');
L.push('          </div>');
L.push('          <div style={S.featureVisual}>{"\\uD83D\\uDCF1\\uD83D\\uDD27"}</div>');
L.push('        </div>');
L.push('        <div style={S.featureRow}>');
L.push('          <div style={S.featureVisual}>{"\\uD83E\\uDDFE\\uD83D\\uDCB3"}</div>');
L.push('          <div>');
L.push('            <h3 style={S.featureTitle}>Arka POS dhe Borxhet</h3>');
L.push('            <p style={S.featureText}>Shitje te shpejta, menaxhim produktesh, faturat A4, garancite dhe borxhet e klienteve - te gjitha te sinkronizuara online.</p>');
L.push('          </div>');
L.push('        </div>');
L.push('        <div style={S.featureRow}>');
L.push('          <div>');
L.push('            <h3 style={S.featureTitle}>Raporte & Statistika</h3>');
L.push('            <p style={S.featureText}>Ndiq te ardhurat ditore, mujore dhe vjetore. Reseto numeruesin dhe ruaj raporte te detajuara per analize.</p>');
L.push('          </div>');
L.push('          <div style={S.featureVisual}>{"\\uD83D\\uDCCA"}</div>');
L.push('        </div>');
L.push('      </div>');
L.push('      <div style={S.sectionAlt}>');
L.push('        <div style={S.sectionInner}>');
L.push('          <h2 style={S.sectionTitle}>Qasje ne Mobile & Web</h2>');
L.push('          <p style={S.sectionSub}>ProPhone funksionon ne desktop dhe ne telefon - me dizajn te pershtatur per cdo ekran.</p>');
L.push('        </div>');
L.push('      </div>');
L.push('      <div style={S.section}>');
L.push('        <div style={S.ctaBox}>');
L.push('          <h2 style={S.ctaTitle}>Filloni sot me ProPhone</h2>');
L.push('          <p style={S.ctaSub}>Provo 30 dite falas, pa angazhim, pa karte krediti.</p>');
L.push('          <button onClick={goRegister} style={S.ctaBtn}>Regjistrohu Falas</button>');
L.push('        </div>');
L.push('      </div>');
L.push('      <div style={S.footer}>');
L.push('        <div style={S.footerLogo}>DataPos . ProPhone</div>');
L.push('        <div>Tel: 045 278 279</div>');
L.push('        <div style={S.footerCopy}>{"Copyright \\u00A9 2026 DataPos"}</div>');
L.push('      </div>');
L.push('    </div>');
L.push('  );');
L.push('}');
L.push('');

const comp = L.join("\n");

applyUnique("insert-landing-component",
  'function RevenueResetSection({ data, T }) {',
  comp + '\nfunction RevenueResetSection({ data, T }) {'
);

fs.writeFileSync(path, src);
console.log(report.join("\n"));
