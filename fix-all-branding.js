const fs = require('fs');
let changes = 0;

// 1) Fix electron/main.js - remove DevTools + update title
let el = fs.readFileSync('electron/main.js', 'utf8');

// Remove DevTools line
if (el.includes("mainWindow.webContents.openDevTools();")) {
  el = el.replace("  // Always open DevTools for debugging (remove later)\n  mainWindow.webContents.openDevTools();\n", "");
  changes++;
  console.log('✅ 1) DevTools removed from Electron');
}

// Update title
if (el.includes("title: 'ProPhone'")) {
  el = el.replace("title: 'ProPhone'", "title: 'DataPOS'");
  changes++;
  console.log('✅ 2) Electron title → DataPOS');
}

fs.writeFileSync('electron/main.js', el);

// 2) Copy new icon.png to logo192.png and logo512.png
fs.copyFileSync('public/icon.png', 'public/logo192.png');
fs.copyFileSync('public/icon.png', 'public/logo512.png');
changes++;
console.log('✅ 3) icon.png → logo192.png, logo512.png');

// 3) Convert icon.png to proper icon.ico using the new image
// Since favicon.ico was already replaced, copy it as icon.ico too
fs.copyFileSync('public/favicon.ico', 'public/icon.ico');
changes++;
console.log('✅ 4) favicon.ico → icon.ico (285KB)');

// 4) Update src/prophone_v3.jsx
let s = fs.readFileSync('src/prophone_v3.jsx', 'utf8');

// 4a) AuthPage logo - add image before text
const oldAuth = 'fontSize: 36, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Phone</span></div>';
const newAuth = 'fontSize: 32, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>POS</span></div>';

let authCount = 0;
while (s.includes(oldAuth)) {
  s = s.replace(oldAuth, newAuth);
  authCount++;
}
if (authCount > 0) {
  changes += authCount;
  console.log('✅ 5) DataPhone → DataPOS in auth (' + authCount + ' instances)');
}

// 4b) Add logo image before DataPOS text in AuthPage
const oldAuthBlock = `<div style={{ textAlign: "center", marginBottom: 36 }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>POS</span></div>`;
const newAuthBlock = `<div style={{ textAlign: "center", marginBottom: 36 }}>
                <img src="./logo192.png" alt="DataPOS" style={{ width: 72, height: 72, objectFit: "contain", marginBottom: 8, borderRadius: 16 }} />
                <div style={{ fontSize: 32, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>POS</span></div>`;

if (s.includes(oldAuthBlock)) {
  s = s.replace(oldAuthBlock, newAuthBlock);
  changes++;
  console.log('✅ 6) Logo image added to AuthPage');
}

// 4c) Nav bar - add logo and rename
const oldNav = `<div style={{ fontWeight: 800, fontSize: 20, color: T.accent, letterSpacing: -0.5 }}>ProPhone</div>`;
const newNav = `<div style={{ fontWeight: 800, fontSize: 20, color: T.accent, letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 8 }}><img src="./logo192.png" alt="" style={{ width: 26, height: 26, objectFit: "contain", borderRadius: 6 }} />DataPOS</div>`;

if (s.includes(oldNav)) {
  s = s.replace(oldNav, newNav);
  changes++;
  console.log('✅ 7) Nav bar logo + DataPOS');
}

// 4d) ClientStatusView header
const oldCSV = 'fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Phone</span></div>';
const newCSV = 'fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>POS</span></div>';

while (s.includes(oldCSV)) {
  s = s.replace(oldCSV, newCSV);
  changes++;
}
console.log('✅ 8) ClientStatusView DataPOS');

// 4e) Replace remaining "DataPhone" with "DataPOS" (coupon default etc)
let dpCount = 0;
while (s.includes('"DataPhone"')) {
  s = s.replace('"DataPhone"', '"DataPOS"');
  dpCount++;
}
if (dpCount > 0) {
  changes += dpCount;
  console.log('✅ 9) "DataPhone" → "DataPOS" (' + dpCount + ' instances)');
}

// 4f) CSV export filename
if (s.includes('DataPhone_Punet_')) {
  s = s.replace('DataPhone_Punet_', 'DataPOS_Punet_');
  changes++;
  console.log('✅ 10) CSV filename updated');
}

// 4g) AdminPanel header
const oldAdmin = `>Data<span style={{ background: T.accentGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Phone</span>`;
const newAdmin = `>Data<span style={{ background: T.accentGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>POS</span>`;

while (s.includes(oldAdmin)) {
  s = s.replace(oldAdmin, newAdmin);
  changes++;
}
console.log('✅ 11) AdminPanel DataPOS');

fs.writeFileSync('src/prophone_v3.jsx', s);

// 5) Update public/index.html title
let html = fs.readFileSync('public/index.html', 'utf8');
if (html.includes('<title>')) {
  html = html.replace(/<title>.*?<\/title>/, '<title>DataPOS</title>');
  fs.writeFileSync('public/index.html', html);
  changes++;
  console.log('✅ 12) index.html title → DataPOS');
}

// 6) Update manifest.json
let manifest = fs.readFileSync('public/manifest.json', 'utf8');
manifest = manifest.replace('"short_name": "ProPhone"', '"short_name": "DataPOS"');
manifest = manifest.replace('"name": "Prophone"', '"name": "DataPOS"');
fs.writeFileSync('public/manifest.json', manifest);
changes++;
console.log('✅ 13) manifest.json → DataPOS');

console.log('\n✅ Total: ' + changes + ' ndryshime.');
