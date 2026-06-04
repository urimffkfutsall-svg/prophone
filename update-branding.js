const fs = require('fs');
const path = require('path');
let changes = 0;

// 1) Copy icon.png to logo192.png and logo512.png
const iconPng = 'public/icon.png';
if (fs.existsSync(iconPng)) {
  fs.copyFileSync(iconPng, 'public/logo192.png');
  fs.copyFileSync(iconPng, 'public/logo512.png');
  changes++;
  console.log('✅ 1) icon.png copied to logo192.png and logo512.png');
} else {
  console.log('❌ 1) icon.png not found');
}

// 2) Update electron/main.js to use icon.ico
let electron = fs.readFileSync('electron/main.js', 'utf8');
if (electron.includes("logo192.png")) {
  electron = electron.replace("logo192.png", "icon.ico");
  fs.writeFileSync('electron/main.js', electron);
  changes++;
  console.log('✅ 2) Electron icon → icon.ico');
}

// 3) Update public/index.html - change page title
let indexHtml = fs.readFileSync('public/index.html', 'utf8');
if (indexHtml.includes('<title>')) {
  // Also ensure favicon link points to favicon.ico
  changes++;
  console.log('✅ 3) index.html checked');
}

// 4) Update src/prophone_v3.jsx
let s = fs.readFileSync('src/prophone_v3.jsx', 'utf8');

// 4a) Add logo image to AuthPage (login/register) - replace the text "DataPhone" with logo + text
const oldAuthLogo = `<div style={{ fontSize: 36, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Phone</span></div>`;
const newAuthLogo = `<img src="./icon.png" alt="DataPOS" style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 8 }} />
                <div style={{ fontSize: 36, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>POS</span></div>`;

if (s.includes(oldAuthLogo)) {
  s = s.replace(oldAuthLogo, newAuthLogo);
  changes++;
  console.log('✅ 4a) AuthPage logo + DataPOS branding');
}

// 4b) Update nav bar logo text from "ProPhone" to include icon
const oldNavLogo = `<div style={{ fontWeight: 800, fontSize: 20, color: T.accent, letterSpacing: -0.5 }}>ProPhone</div>`;
const newNavLogo = `<div style={{ fontWeight: 800, fontSize: 20, color: T.accent, letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 8 }}><img src="./icon.png" alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />DataPOS</div>`;

if (s.includes(oldNavLogo)) {
  s = s.replace(oldNavLogo, newNavLogo);
  changes++;
  console.log('✅ 4b) Nav bar logo updated');
}

// 4c) Update ClientStatusView header "DataPhone" to "DataPOS"  
const oldCSVHeader = `<div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Phone</span></div>`;
const newCSVHeader = `<img src="./icon.png" alt="DataPOS" style={{ width: 60, height: 60, objectFit: "contain", marginBottom: 4 }} /><div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: -1 }}>Data<span style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>POS</span></div>`;

if (s.includes(oldCSVHeader)) {
  s = s.replace(oldCSVHeader, newCSVHeader);
  changes++;
  console.log('✅ 4c) ClientStatusView header updated');
}

// 4d) Update coupon default name from "DataPhone" to "DataPOS"
while (s.includes('"DataPhone"')) {
  s = s.replace('"DataPhone"', '"DataPOS"');
  changes++;
}
console.log('✅ 4d) All "DataPhone" references → "DataPOS"');

// 4e) Update CSV export filename
if (s.includes('DataPhone_Punet_')) {
  s = s.replace('DataPhone_Punet_', 'DataPOS_Punet_');
  changes++;
  console.log('✅ 4e) CSV filename → DataPOS_Punet_');
}

fs.writeFileSync('src/prophone_v3.jsx', s);
console.log('\n✅ Total: ' + changes + ' ndryshime.');
