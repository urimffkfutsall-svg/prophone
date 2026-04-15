const fs = require('fs');
const path = 'src/prophone_v3.jsx';
let s = fs.readFileSync(path, 'utf8');
let changes = 0;

// 1) Gjej dhe hiq bottom nav nga AdminPanel (rreshti ~1905)
// Gjejmë bllokun e plotë: nga mobile-bottom-nav deri te </div> mbyllëse
const bottomNavBlock = `      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.nav, borderTop: "1px solid " + T.border, padding: "6px 8px 10px", zIndex: 100, justifyContent: "space-around", alignItems: "center" }}>
        {NAV.map(item => (
          <button key={item.key} onClick={() => navigate(item.key)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 8px", borderRadius: 8, color: page === item.key ? T.accent : T.textMuted, fontWeight: page === item.key ? 700 : 500, fontSize: 10, transition: "all .2s" }}>
            <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {item.key === "dashboard" ? Ic.home(20) : item.key === "workers" ? Ic.users(20) : item.key === "clients" ? Ic.search(20) : Ic.edit(20)}
            </div>
            {item.label}
            {item.key === "dashboard" && staleCount > 0 && <span style={{ position: "absolute", top: 2, right: 2, width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />}
          </button>
        ))}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 8px", borderRadius: 8, color: T.textMuted, fontSize: 10 }}>
          <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.menu ? Ic.menu(20) : "☰"}</div>
          Menu
        </button>
      </div>
      <Toast message={toast.msg} visible={toast.show} />`;

// Zëvendësojmë me vetëm Toast (pa bottom nav)
const justToast = `      <Toast message={toast.msg} visible={toast.show} />`;

if (s.includes(bottomNavBlock)) {
  s = s.replace(bottomNavBlock, justToast);
  changes++;
  console.log('✅ 1) Bottom nav u hoq nga AdminPanel');
} else {
  console.error('❌ 1) Nuk u gjet bottom nav brenda AdminPanel');
  // Provojmë me search
  const idx = s.indexOf('mobile-bottom-nav');
  if (idx >= 0) {
    const adminIdx = s.indexOf('function AdminPanel');
    const dataPhoneIdx = s.indexOf('export default function DataPhone');
    console.log('   mobile-bottom-nav at:', idx, 'AdminPanel at:', adminIdx, 'DataPhone at:', dataPhoneIdx);
    if (idx > adminIdx && idx < dataPhoneIdx) {
      console.log('   Konfirmuar: bottom nav është brenda AdminPanel');
    }
  }
}

// 2) Shto bottom nav te DataPhone, para Toast-it (rreshti ~2620)
// Gjejmë Toast-in e DataPhone - ai që ka {menuOpen && <div} pas vetes
const dataPhoneToast = '      <Toast message={toast.msg} visible={toast.show} />\n      {menuOpen && <div';

const dataPhoneToastWithNav = `      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.nav, borderTop: "1px solid " + T.border, padding: "6px 8px 10px", zIndex: 100, justifyContent: "space-around", alignItems: "center" }}>
        {NAV.map(item => (
          <button key={item.key} onClick={() => navigate(item.key)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 8px", borderRadius: 8, color: page === item.key ? T.accent : T.textMuted, fontWeight: page === item.key ? 700 : 500, fontSize: 10, transition: "all .2s" }}>
            <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {item.key === "dashboard" ? Ic.home(20) : item.key === "workers" ? Ic.users(20) : item.key === "clients" ? Ic.search(20) : Ic.edit(20)}
            </div>
            {item.label}
            {item.key === "dashboard" && staleCount > 0 && <span style={{ position: "absolute", top: 2, right: 2, width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />}
          </button>
        ))}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 8px", borderRadius: 8, color: T.textMuted, fontSize: 10 }}>
          <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.menu ? Ic.menu(20) : "☰"}</div>
          Menu
        </button>
      </div>
      <Toast message={toast.msg} visible={toast.show} />
      {menuOpen && <div`;

if (s.includes(dataPhoneToast)) {
  s = s.replace(dataPhoneToast, dataPhoneToastWithNav);
  changes++;
  console.log('✅ 2) Bottom nav u shtua te DataPhone');
} else {
  console.error('❌ 2) Nuk u gjet Toast i DataPhone');
}

fs.writeFileSync(path, s, 'utf8');
console.log('\n✅ U krye ' + changes + '/2 ndryshime.');

// Verifikim
const navCount = (s.match(/mobile-bottom-nav/g) || []).length;
console.log('mobile-bottom-nav instances:', navCount, '(duhet 3: 1 JSX + 2 CSS)');
