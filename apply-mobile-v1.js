const fs = require('fs');
const path = 'src/prophone_v3.jsx';
let s = fs.readFileSync(path, 'utf8');
let changes = 0;

// ============================================================
// 1) Zgjero styles block-un me mobile CSS
// ============================================================
const oldStyles = `  const styles = \`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideDown{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:6px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:\${darkMode ? "#1E3A5F" : "#d1d5db"};border-radius:3px}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
    input::placeholder,textarea::placeholder{color:\${T.textFaint};}
    select option{background:\${T.surface};color:\${T.text};}
  \`;`;

const newStyles = `  const styles = \`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideDown{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:6px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:\${darkMode ? "#1E3A5F" : "#d1d5db"};border-radius:3px}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
    input::placeholder,textarea::placeholder{color:\${T.textFaint};}
    select option{background:\${T.surface};color:\${T.text};}

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
        border: 1.5px solid \${T.border} !important;
        background: \${T.surface} !important;
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
        border: 1.5px solid \${T.border} !important;
        background: \${T.surface} !important;
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
        border: 1.5px solid \${T.border} !important;
        background: \${T.surface} !important;
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
  \`;`;

if (s.includes(oldStyles)) {
  s = s.replace(oldStyles, newStyles);
  changes++;
  console.log('✅ 1) Mobile CSS u shtua te styles');
} else {
  console.error('❌ 1) Nuk u gjet styles block-u');
}

// ============================================================
// 2) Shto CSS classes te navigimi
// ============================================================
// Nav tabs div
const oldNavTabs = '<div style={{ display: "flex", gap: 4 }}>';
const newNavTabs = '<div className="desktop-nav-tabs" style={{ display: "flex", gap: 4 }}>';
// Kjo ekziston në dy vende potencialisht, por na intereson vetëm ajo te DataPhone nav
// Kontrollojmë me kontekstin e plotë
const oldNavTabsFull = `            <div style={{ display: "flex", gap: 4 }}>
              {NAV.map(item => (`;
const newNavTabsFull = `            <div className="desktop-nav-tabs" style={{ display: "flex", gap: 4 }}>
              {NAV.map(item => (`;

if (s.includes(oldNavTabsFull)) {
  s = s.replace(oldNavTabsFull, newNavTabsFull);
  changes++;
  console.log('✅ 2) Nav tabs className u shtua');
} else {
  console.error('❌ 2) Nuk u gjet nav tabs');
}

// ============================================================
// 3) Shto className te main content div
// ============================================================
const oldMainContent = '<div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 60px" }}>';
const newMainContent = '<div className="main-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 60px" }}>';

if (s.includes(oldMainContent)) {
  s = s.replace(oldMainContent, newMainContent);
  changes++;
  console.log('✅ 3) Main content className u shtua');
} else {
  console.error('❌ 3) Nuk u gjet main content');
}

// ============================================================
// 4) Shto Bottom Navigation bar (para Toast-it)
// ============================================================
const oldToast = '      <Toast message={toast.msg} visible={toast.show} />';
const newToast = `      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: T.nav, borderTop: "1px solid " + T.border, padding: "6px 8px 10px", zIndex: 100, justifyContent: "space-around", alignItems: "center" }}>
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

if (s.includes(oldToast)) {
  s = s.replace(oldToast, newToast);
  changes++;
  console.log('✅ 4) Mobile bottom nav u shtua');
} else {
  console.error('❌ 4) Nuk u gjet Toast');
}

// ============================================================
// 5) Shto home icon te Ic (nëse mungon)
// ============================================================
if (!s.includes('home:')) {
  const icPlus = 'plus: (s = 16) => <svg';
  const icHome = `home: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  menu: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  plus: (s = 16) => <svg`;

  if (s.includes(icPlus)) {
    s = s.replace(icPlus, icHome);
    changes++;
    console.log('✅ 5) home, users, menu icons u shtuan');
  }
}

// ============================================================
// 6) Shto CSS classes te tabelat (jobs, clients, workers)
// ============================================================

// Jobs table header
const oldJobsHeader = `<div style={{ display: "grid", gridTemplateColumns:`;
// Kjo mund të ekzistojë në disa vende. Na duhet specifikishtë ajo te Dashboard jobs list.
// Le ta bëjmë me context
const oldJobsHeaderCtx = `        {/* Jobs table */}`;
// Alternativisht, le të shtojmë className direkt te Dashboard
// Për thjeshtësi, shtojmë className te grid-divs kryesorë duke përdorur regex-like replace

// Dashboard jobs grid header (has KLIENTI etc)
const dashJobsHeader = 'gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 80px"';
if (s.includes(dashJobsHeader)) {
  // Kjo ndodh dy herë: header dhe rows
  // Header:
  s = s.replace(
    '<div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 80px", padding: "10px 16px"',
    '<div className="jobs-table-header" style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 80px", padding: "10px 16px"'
  );
  // Row (each job):
  const oldJobRow = 'style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 80px", padding: "14px 16px"';
  const newJobRow = 'className="jobs-table-row" style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 80px", padding: "14px 16px"';
  s = s.replace(oldJobRow, newJobRow);
  changes++;
  console.log('✅ 6) Jobs table classes u shtuan');
}

// Clients table
const clientsHeader = 'gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 0.8fr", padding: "10px 16px"';
if (s.includes(clientsHeader)) {
  s = s.replace(
    'style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 0.8fr", padding: "10px 16px"',
    'className="clients-table-header" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 0.8fr", padding: "10px 16px"'
  );
  s = s.replace(
    'style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 0.8fr", padding: "14px 16px"',
    'className="clients-table-row" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 0.8fr", padding: "14px 16px"'
  );
  changes++;
  console.log('✅ 7) Clients table classes u shtuan');
}

// Workers table
const workersHeader = 'gridTemplateColumns: "60px 1fr 1fr 100px", padding: "10px 16px"';
if (s.includes(workersHeader)) {
  s = s.replace(
    'style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px", padding: "10px 16px"',
    'className="workers-table-header" style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px", padding: "10px 16px"'
  );
  s = s.replace(
    'style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px", padding: "14px 16px"',
    'className="workers-table-row" style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px", padding: "14px 16px"'
  );
  changes++;
  console.log('✅ 8) Workers table classes u shtuan');
}

// ============================================================
// 7) Dashboard header className
// ============================================================
const oldDashHeader = '<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>\n          <h2';
const newDashHeader = '<div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>\n          <h2';

if (s.includes(oldDashHeader)) {
  s = s.replace(oldDashHeader, newDashHeader);
  changes++;
  console.log('✅ 9) Dashboard header className u shtua');
} else {
  // Try with different whitespace
  const alt = 'display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24';
  if (s.includes(alt) && s.indexOf(alt) < s.indexOf('Ballina') + 200) {
    console.log('⚠️  9) Dashboard header - skipped (different format)');
  }
}

// ============================================================
// 8) StatCards container className
// ============================================================
const oldStatGrid = '<div style={{ display: "flex", gap: 12, marginBottom: 24';
const newStatGrid = '<div className="stat-cards-grid" style={{ display: "flex", gap: 12, marginBottom: 24';

if (s.includes(oldStatGrid)) {
  s = s.replace(oldStatGrid, newStatGrid);
  changes++;
  console.log('✅ 10) StatCards grid className u shtua');
}

fs.writeFileSync(path, s, 'utf8');
console.log('\n✅ U krye ' + changes + ' ndryshime.');
