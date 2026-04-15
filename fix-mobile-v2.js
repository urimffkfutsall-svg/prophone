const fs = require('fs');
const path = 'src/prophone_v3.jsx';
let s = fs.readFileSync(path, 'utf8');
let changes = 0;

// ============================================================
// 1) Fix bottom nav: hiq display:none nga inline, shto CSS default
// ============================================================
const oldBottomNav = 'className="mobile-bottom-nav" style={{ display: "none", position: "fixed"';
const newBottomNav = 'className="mobile-bottom-nav" style={{ position: "fixed"';

if (s.includes(oldBottomNav)) {
  s = s.replace(oldBottomNav, newBottomNav);
  changes++;
  console.log('✅ 1) Bottom nav: display:none u hoq nga inline');
}

// Shtojmë CSS që e fsheh by default dhe e shfaq në mobile
const oldMobileCss = '.mobile-bottom-nav { display: flex !important; }';
const newMobileCss = '.mobile-bottom-nav { display: flex !important; }\n      /* Hide bottom nav on desktop */';

// Gjithashtu shtojmë CSS desktop hide
const hideDesktop = '    /* ===== MOBILE RESPONSIVE ===== */';
const hideDesktopNew = '    /* Desktop: hide bottom nav */\n    .mobile-bottom-nav { display: none; }\n\n    /* ===== MOBILE RESPONSIVE ===== */';

if (s.includes(hideDesktop)) {
  s = s.replace(hideDesktop, hideDesktopNew);
  changes++;
  console.log('✅ 2) Desktop CSS: bottom nav hidden by default');
}

// ============================================================
// 2) Gjej StatCards container dhe shto className
// ============================================================
// Le ta gjejmë duke parë rreth rreshtit 640-650
const oldStatFlex = 'style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}';
if (s.includes(oldStatFlex)) {
  s = s.replace(oldStatFlex, 'className="stat-cards-grid" style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}');
  changes++;
  console.log('✅ 3) StatCards className u shtua (v1)');
} else {
  // Try alternative patterns
  const alt1 = 'display: "flex", gap: 12, marginBottom: 24';
  const matches = [];
  let idx = 0;
  while ((idx = s.indexOf(alt1, idx)) !== -1) {
    matches.push(idx);
    idx += alt1.length;
  }
  console.log('   StatCards pattern matches: ' + matches.length + ' at positions: ' + matches.join(', '));
  
  if (matches.length > 0) {
    // Gjej rreshtin e plotë rreth matchit
    const lineStart = s.lastIndexOf('\n', matches[0]) + 1;
    const lineEnd = s.indexOf('\n', matches[0]);
    console.log('   Line content: ' + s.substring(lineStart, lineEnd).trim().substring(0, 100));
  }
}

// ============================================================
// 3) Jobs table - gjej pattern-in e saktë
// ============================================================
// Kontrollo nëse jobs grid ekziston
const jobsGridPattern = '2fr 1.5fr 1fr 1fr 1fr 1fr 80px';
if (s.includes(jobsGridPattern)) {
  // Header
  if (!s.includes('jobs-table-header')) {
    const oldJH = 'style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 80px", padding: "10px 16px"';
    if (s.includes(oldJH)) {
      s = s.replace(oldJH, 'className="jobs-table-header" style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 80px", padding: "10px 16px"');
      changes++;
      console.log('✅ 4) Jobs table header className u shtua');
    }
  }
  // Row
  if (!s.includes('jobs-table-row')) {
    const oldJR = 'style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 80px", padding: "14px 16px"';
    if (s.includes(oldJR)) {
      s = s.replace(oldJR, 'className="jobs-table-row" style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 80px", padding: "14px 16px"');
      changes++;
      console.log('✅ 5) Jobs table row className u shtua');
    }
  }
} else {
  console.log('⚠️  Jobs grid pattern nuk u gjet - kontrolloj alternatives');
  // Kërko çfarëdo grid pattern me 7 kolona
  const altPattern = 'gridTemplateColumns:';
  let count = 0;
  let pos = 0;
  while ((pos = s.indexOf(altPattern, pos)) !== -1) {
    const lineS = s.lastIndexOf('\n', pos) + 1;
    const lineE = s.indexOf('\n', pos);
    const line = s.substring(lineS, lineE).trim();
    if (line.includes('80px') || line.includes('KLIENTI') || line.includes('jobs')) {
      console.log('   Found at pos ' + pos + ': ' + line.substring(0, 120));
    }
    count++;
    pos += altPattern.length;
  }
}

// ============================================================
// 4) Dashboard header
// ============================================================
if (!s.includes('dashboard-header')) {
  // Gjej container-in e Ballina header
  const ballina = 'style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>Ballina</h2>';
  if (s.includes(ballina)) {
    // Gjej div-in parent (3 rreshta para)
    const bIdx = s.indexOf(ballina);
    const before = s.substring(Math.max(0, bIdx - 300), bIdx);
    const divMatch = before.lastIndexOf('style={{ display: "flex", justifyContent: "space-between"');
    if (divMatch >= 0) {
      const absPos = Math.max(0, bIdx - 300) + divMatch;
      const oldDH = 'style={{ display: "flex", justifyContent: "space-between"';
      // Replace vetëm instancën e parë pas pozicionit
      const chunk = s.substring(absPos, absPos + oldDH.length);
      if (chunk === oldDH) {
        s = s.substring(0, absPos) + 'className="dashboard-header" ' + s.substring(absPos);
        changes++;
        console.log('✅ 6) Dashboard header className u shtua');
      }
    }
  }
}

fs.writeFileSync(path, s, 'utf8');
console.log('\n✅ U krye ' + changes + ' ndryshime.');
